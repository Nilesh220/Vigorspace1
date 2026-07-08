-- ═══════════════════════════════════════════════════════════════
-- VIGOR SPACE — MIGRATION 006: POINT TRANSACTIONS POLICY FIX
-- ═══════════════════════════════════════════════════════════════

-- Add insert policy so client can write points transactions for wins/claims
drop policy if exists "Users can insert their own point transactions" on public.point_transactions;
create policy "Users can insert their own point transactions"
  on public.point_transactions for insert with check (auth.uid() = user_id);
