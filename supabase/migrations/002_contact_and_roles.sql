-- ═══════════════════════════════════════════════════════════════
-- VIGOR SPACE — MIGRATION 002
-- Run in Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════

-- Add role column to profiles (admin / user)
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

-- Contact messages table
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: only admins can read messages
alter table public.contact_messages enable row level security;

create policy "Admins can read contact messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Anyone can insert contact messages"
  on public.contact_messages for insert
  with check (true);
