-- ═══════════════════════════════════════════════════════════════
-- VIGOR SPACE — MIGRATION 004: EVENT BOOKINGS TABLE
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.event_bookings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  event_id     uuid references public.events(id) on delete cascade not null,
  full_name    text not null,
  email        text not null,
  phone        text not null,
  created_at   timestamptz not null default now(),
  unique(user_id, event_id)
);

-- ENABLE ROW LEVEL SECURITY
alter table public.event_bookings enable row level security;

-- POLICIES
create policy "Users can view their own event bookings"
  on public.event_bookings for select using (auth.uid() = user_id);

create policy "Users can insert their own event bookings"
  on public.event_bookings for insert with check (auth.uid() = user_id);

create policy "Admins can view and manage all bookings"
  on public.event_bookings for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
