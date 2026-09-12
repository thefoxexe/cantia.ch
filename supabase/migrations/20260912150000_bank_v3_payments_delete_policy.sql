-- Self-review fix: createPaymentBatch inserts the batch row, then its
-- items, as two separate calls — if the items insert fails (network
-- blip, RLS edge case), the batch row is left behind with a non-zero
-- control_sum and no items, and there was previously no way to remove
-- it (no DELETE policy existed on payment_batches at all). Scoped to
-- 'prepare' status only: once a batch is marked 'paye' it's a real
-- record of what was sent and must stay immutable like every other
-- audit trail in this schema. payment_batch_items cascades on delete,
-- so removing the batch removes any partial items with it.
create policy "authorized members delete unpaid payment batches" on public.payment_batches
  for delete using (public.can_generate_org_payments(organization_id) and status = 'prepare');

notify pgrst, 'reload schema';
