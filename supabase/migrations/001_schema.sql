-- ═══════════════════════════════════════════════════════════════
-- VIGOR SPACE — SUPABASE DATABASE SCHEMA
-- Run this entire file in: Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════

-- ── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── HELPER: generate short alphanumeric referral codes ──────
create or replace function generate_referral_code()
returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  text := '';
  i     int;
begin
  for i in 1..8 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return code;
end;
$$;

-- ── PROFILES ─────────────────────────────────────────────────
-- Extends auth.users. Created automatically on signup via trigger.
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text,
  avatar_url     text,
  referral_code  text unique not null default generate_referral_code(),
  referred_by    uuid references public.profiles(id),
  total_points   int not null default 0,
  streak_days    int not null default 0,
  last_login_date date,
  created_at     timestamptz not null default now()
);

-- ── TASKS ────────────────────────────────────────────────────
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  steps          jsonb,          -- array of step strings
  points         int not null default 0,
  image_url      text,
  badge_label    text,           -- e.g. "NEW ★", "EXCLUSIVE"
  badge_color    text default '#E8576D',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ── TASK SUBMISSIONS ─────────────────────────────────────────
create table if not exists public.task_submissions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  task_id        uuid not null references public.tasks(id) on delete cascade,
  status         text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  proof_url      text,           -- Supabase Storage path
  proof_link     text,           -- External URL submitted by user
  submitted_at   timestamptz not null default now(),
  reviewed_at    timestamptz,
  unique(user_id, task_id)
);

-- ── REWARDS (Gift Card catalogue) ────────────────────────────
create table if not exists public.rewards (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  logo_char      text,           -- single character / emoji for the logo
  bg_color       text default '#111',
  text_color     text default '#fff',
  logo_color     text default '#F5C842',
  cost_points    int not null,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ── REDEMPTIONS ──────────────────────────────────────────────
create table if not exists public.redemptions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  reward_id      uuid not null references public.rewards(id),
  points_spent   int not null,
  status         text not null default 'pending'
                 check (status in ('pending', 'fulfilled', 'cancelled')),
  created_at     timestamptz not null default now()
);

-- ── REFERRALS ────────────────────────────────────────────────
create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references public.profiles(id) on delete cascade,
  referred_id    uuid not null references public.profiles(id) on delete cascade,
  points_earned  int not null default 0,
  created_at     timestamptz not null default now(),
  unique(referred_id)  -- each user can only be referred once
);

-- ── POINT TRANSACTIONS (full ledger) ─────────────────────────
create table if not exists public.point_transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  delta          int not null,   -- positive = earned, negative = spent
  reason         text not null,  -- e.g. 'task_approved', 'daily_streak', 'redemption'
  reference_id   uuid,           -- optional: task_submission id, redemption id, etc.
  created_at     timestamptz not null default now()
);

-- ── LEADERBOARD VIEW ─────────────────────────────────────────
create or replace view public.leaderboard as
  select
    p.id,
    p.full_name,
    p.avatar_url,
    p.total_points,
    rank() over (order by p.total_points desc) as rank
  from public.profiles p
  order by p.total_points desc;

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- 1. Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ref_code text;
  ref_profile_id uuid;
begin
  -- Resolve referral code if passed as user metadata
  if new.raw_user_meta_data->>'referral_code' is not null then
    select id into ref_profile_id
      from public.profiles
     where referral_code = new.raw_user_meta_data->>'referral_code'
     limit 1;
  end if;

  insert into public.profiles (id, full_name, avatar_url, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    ref_profile_id
  );

  -- Create referral record if applicable
  if ref_profile_id is not null then
    insert into public.referrals (referrer_id, referred_id, points_earned)
    values (ref_profile_id, new.id, 0);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Award points when a task submission is approved
create or replace function public.handle_submission_approved()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  task_points int;
begin
  if new.status = 'approved' and old.status != 'approved' then
    select points into task_points from public.tasks where id = new.task_id;

    -- Insert point transaction
    insert into public.point_transactions (user_id, delta, reason, reference_id)
    values (new.user_id, task_points, 'task_approved', new.id);

    -- Update profile total
    update public.profiles
       set total_points = total_points + task_points
     where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_submission_approved on public.task_submissions;
create trigger on_submission_approved
  after update on public.task_submissions
  for each row execute function public.handle_submission_approved();

-- 3. Deduct points on redemption creation
create or replace function public.handle_redemption_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Insert negative point transaction
  insert into public.point_transactions (user_id, delta, reason, reference_id)
  values (new.user_id, -new.points_spent, 'redemption', new.id);

  -- Update profile total
  update public.profiles
     set total_points = total_points - new.points_spent
   where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists on_redemption_created on public.redemptions;
create trigger on_redemption_created
  after insert on public.redemptions
  for each row execute function public.handle_redemption_created();

-- 4. Daily login streak tracker
create or replace function public.handle_daily_login(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  last_date date;
  streak    int;
  today     date := current_date;
  bonus     int;
begin
  select last_login_date, streak_days
    into last_date, streak
    from public.profiles where id = p_user_id;

  if last_date = today then
    return; -- Already logged in today
  end if;

  if last_date = today - 1 then
    streak := streak + 1;
  else
    streak := 1; -- Streak broken
  end if;

  -- Bonus points: 10/15/20/30/35/40/50 for days 1-7 (cycle resets)
  bonus := case (streak - 1) % 7
    when 0 then 10
    when 1 then 15
    when 2 then 20
    when 3 then 30
    when 4 then 35
    when 5 then 40
    else       50
  end;

  update public.profiles
     set last_login_date = today,
         streak_days     = streak,
         total_points    = total_points + bonus
   where id = p_user_id;

  insert into public.point_transactions (user_id, delta, reason)
  values (p_user_id, bonus, 'daily_streak');
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles           enable row level security;
alter table public.tasks              enable row level security;
alter table public.task_submissions   enable row level security;
alter table public.rewards            enable row level security;
alter table public.redemptions        enable row level security;
alter table public.referrals          enable row level security;
alter table public.point_transactions enable row level security;

-- profiles
create policy "Anyone can read profiles"
  on public.profiles for select using (true);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- tasks (read-only from client; admin writes via service role)
create policy "Anyone can read active tasks"
  on public.tasks for select using (is_active = true);

-- task_submissions
create policy "Users read own submissions"
  on public.task_submissions for select using (auth.uid() = user_id);
create policy "Users insert own submissions"
  on public.task_submissions for insert with check (auth.uid() = user_id);

-- rewards (public catalogue)
create policy "Anyone can read active rewards"
  on public.rewards for select using (is_active = true);

-- redemptions
create policy "Users read own redemptions"
  on public.redemptions for select using (auth.uid() = user_id);
create policy "Users insert own redemptions"
  on public.redemptions for insert with check (auth.uid() = user_id);

-- referrals
create policy "Users read own referral data"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- point_transactions
create policy "Users read own transactions"
  on public.point_transactions for select using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — Gift Cards
-- ═══════════════════════════════════════════════════════════════

insert into public.rewards (name, logo_char, bg_color, text_color, logo_color, cost_points) values
  ('Amazon',          'a',  '#111',    '#fff',    '#F5C842', 500),
  ('Myntra',          'M',  '#fff',    '#FF3E6C', '#FF3E6C', 400),
  ('Netflix',         'N',  '#111',    '#E50914', '#E50914', 600),
  ('Spotify Premium', '♫',  '#1DB954', '#fff',    '#fff',    450),
  ('Swiggy',          'S',  '#FC8019', '#fff',    '#fff',    350),
  ('Google Play',     '▶',  '#fff',    '#333',    '#4285F4', 300)
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKET (run separately if needed)
-- ═══════════════════════════════════════════════════════════════
-- In Supabase Dashboard: Storage > New Bucket > "task-proofs" (private)
-- Then add this policy via SQL:
--
-- create policy "Users upload to own folder"
--   on storage.objects for insert
--   with check (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "Users read own proofs"
--   on storage.objects for select
--   using (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
