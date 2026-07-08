-- ═══════════════════════════════════════════════════════════════
-- VIGOR SPACE — MIGRATION 007: ADMIN ANALYTICS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Update point_transactions select policy to allow admins to view all records
drop policy if exists "Users read own transactions" on public.point_transactions;
create policy "Users read own transactions"
  on public.point_transactions for select using (
    auth.uid() = user_id or 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
