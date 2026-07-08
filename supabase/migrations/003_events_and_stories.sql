-- ═══════════════════════════════════════════════════════════════
-- VIGOR SPACE — MIGRATION 003: EVENTS & STORIES TABLES
-- Run in Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════

-- 1. EVENTS TABLE
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  location     text not null,
  event_date   timestamptz not null,
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 2. STORIES TABLE
create table if not exists public.stories (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  category     text not null,
  author       text not null,
  duration     text not null default '5:00',
  likes        int not null default 0,
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 3. ENABLE ROW LEVEL SECURITY
alter table public.events enable row level security;
alter table public.stories enable row level security;

-- 4. RLS POLICIES FOR EVENTS
create policy "Anyone can select active events"
  on public.events for select using (is_active = true);

create policy "Admins can manage events"
  on public.events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. RLS POLICIES FOR STORIES
create policy "Anyone can select active stories"
  on public.stories for select using (is_active = true);

create policy "Admins can manage stories"
  on public.stories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. SEED SOME DEMO EVENTS
insert into public.events (title, description, location, event_date, image_url) values
  ('Youth Creators Summit', 'Connect with industry mentors, collaborate with other creative minds, and learn strategies to accelerate your design journey.', 'Mumbai', '2026-08-10 10:00:00+00', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop'),
  ('Night of Talent', 'Showcase your creative projects, design portfolios, coding templates, and perform in front of peers.', 'Pune', '2026-08-22 18:00:00+00', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop'),
  ('Community Connect', 'Network with like-minded creators, join dynamic group breakout rooms, and unlock direct brand sponsorships.', 'Delhi', '2026-09-05 15:00:00+00', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop')
on conflict do nothing;

-- 7. SEED SOME DEMO STORIES
insert into public.stories (title, category, author, duration, likes, image_url) values
  ('Overcoming Career Confusion', 'Career Guidance', 'Avi Parihar', '5:12', 142, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'),
  ('Tips for Self-Care & Well-Being', 'Mental Health', 'Aradhya Warang', '4:45', 98, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'),
  ('Strategies for Career Clarity', 'Career Guidance', 'Karan Rawool', '6:30', 189, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop'),
  ('Mind Matters: Prioritizing Self', 'Mental Health', 'Palash Shah', '3:50', 76, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop')
on conflict do nothing;
