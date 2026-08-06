-- One-time data fix for the bug fixed in 20260807300000: any final invoice
-- that already existed when a later deposit was created never got its
-- deduction line, so its total/"reste dû" is currently wrong. Idempotent
-- (delete-then-recompute), safe to re-run.
do $$
declare
  v_devis_id uuid;
  v_final_facture_id uuid;
  v_deposits_subtotal numeric;
begin
  for v_devis_id in
    select distinct devis_id from public.factures
    where devis_id is not null and is_deposit and status <> 'cancelled'
  loop
    for v_final_facture_id in
      select id from public.factures
      where devis_id = v_devis_id and not is_deposit and status <> 'cancelled'
    loop
      delete from public.facture_items
      where facture_id = v_final_facture_id and description = 'Acompte(s) déjà facturé(s) à déduire';

      select coalesce(sum(fi.quantity * fi.unit_price), 0) into v_deposits_subtotal
      from public.facture_items fi
      join public.factures f on f.id = fi.facture_id
      where f.devis_id = v_devis_id and f.is_deposit and f.status <> 'cancelled';

      if v_deposits_subtotal > 0 then
        insert into public.facture_items (facture_id, description, quantity, unit, unit_price, sort_order)
        values (v_final_facture_id, 'Acompte(s) déjà facturé(s) à déduire', 1, 'forfait', -v_deposits_subtotal, 9999);
      end if;
    end loop;
  end loop;
end $$;
