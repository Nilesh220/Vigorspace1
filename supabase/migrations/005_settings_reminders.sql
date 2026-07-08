-- ═══════════════════════════════════════════════════════════════
-- VIGOR SPACE — MIGRATION 005: STREAK REMINDERS SETTING
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles 
add column if not exists streak_reminders_enabled boolean default false;
