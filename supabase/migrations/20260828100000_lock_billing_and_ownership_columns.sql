-- Security audit fix: the "admins can update their organization" and
-- "admins can update/remove members" RLS policies only ever checked WHO
-- (is_org_admin), never WHICH COLUMNS or WHICH ROW STATE — so any org admin
-- could, via a direct PostgREST call the UI never exposes, grant their own
-- organization a paid plan for free (writing plan_id/subscription_status
-- directly) or promote themselves to "owner" / demote-and-remove the real
-- owner. Both are closed here without touching any legitimate write path:
-- the app never updates the protected organizations columns from the
-- client (Stripe/webhook-owned data), and never touches an owner's
-- organization_members row (confirmed against app/(app)/compte/equipe.tsx
-- and delete-account, which both already treat 'owner' as untouchable
-- client-side — this makes that assumption true at the data layer too).

-- ==========================================================================
-- organizations: billing/plan columns become service-role-only. Everything
-- an org admin legitimately edits from compte/entreprise.tsx, apparence.tsx,
-- modules.tsx, devis.tsx, rh.tsx etc. stays writable.
-- ==========================================================================
revoke update on public.organizations from authenticated;
grant update (
  name, trade, logo_url, signature_url, address, ide_number,
  phone, email, website, default_vat_rate, devis_validity_days, devis_terms,
  devis_template, payroll_payday, payroll_km_rate_chf, enabled_modules,
  plan_selected
) on public.organizations to authenticated;

-- plan_selected stays writable client-side (it's an onboarding-gate flag,
-- not a billing entitlement — flipping it early only lets someone skip
-- straight to the free plan they could already choose via "rester sur la
-- version gratuite"; plan_id/subscription_status are what actually grant
-- paid features, and those are excluded above).

-- ==========================================================================
-- organization_members: block promoting anyone to 'owner' from the client,
-- and block modifying or deleting an existing owner's row. Ownership
-- transfer needs a real flow (out of scope of this fix) — until then this
-- makes the current single-owner model actually enforced, not just
-- UI-enforced.
-- ==========================================================================
-- Same gap on insert: an admin could otherwise add a brand-new member row
-- with role='owner' directly (a second "owner" added outside any transfer
-- flow), bypassing the invite/accept path entirely.
drop policy if exists "admins can add members" on public.organization_members;
create policy "admins can add non-owner members" on public.organization_members
  for insert with check (public.is_org_admin(organization_id) and role <> 'owner');

drop policy if exists "admins can update members" on public.organization_members;
create policy "admins can update non-owner members" on public.organization_members
  for update
  using (public.is_org_admin(organization_id) and role <> 'owner')
  with check (role <> 'owner');

drop policy if exists "admins can remove members" on public.organization_members;
create policy "admins can remove non-owner members" on public.organization_members
  for delete
  using (public.is_org_admin(organization_id) and role <> 'owner');

-- ==========================================================================
-- organization_invites: same escalation path through a side door — an
-- admin could otherwise create (or edit) an invite with role='owner', and
-- accept_invite() (security definer, bypasses RLS on organization_members)
-- would then happily insert a second owner for whoever redeems it, working
-- around the organization_members protection above entirely.
-- ==========================================================================
drop policy if exists "admins can create invites" on public.organization_invites;
create policy "admins can create non-owner invites" on public.organization_invites
  for insert with check (public.is_org_admin(organization_id) and created_by = auth.uid() and role <> 'owner');

drop policy if exists "admins can revoke invites" on public.organization_invites;
create policy "admins can update non-owner invites" on public.organization_invites
  for update
  using (public.is_org_admin(organization_id))
  with check (role <> 'owner');

notify pgrst, 'reload schema';
