import { invokeFunction } from './functions';
import { supabase } from '../supabase';
import type { Facture, FacturePayment, FactureStatus } from '../types';

export async function sendFactureReminder(factureId: string): Promise<{ sent: boolean; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: boolean }>('send-facture-reminder', { facture_id: factureId });
  return { sent: !!data?.sent, error };
}

export async function sendFactureEmail(factureId: string, customMessage?: string): Promise<{ sent: boolean; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: boolean }>('send-facture-email', {
    facture_id: factureId,
    custom_message: customMessage?.trim() || undefined,
  });
  return { sent: !!data?.sent, error };
}

// depositPercent omitted (or null) creates the normal final invoice, which
// auto-deducts any deposits already billed on the same devis. Passing a
// percent instead creates a deposit invoice for that share of the devis.
export async function convertDevisToFacture(
  devisId: string,
  depositPercent?: number,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('convert_devis_to_facture', {
    p_devis_id: devisId,
    p_deposit_percent: depositPercent ?? null,
  });
  return { id: data ?? null, error: error?.message ?? null };
}

// Recomputes the "Acompte(s) déjà facturé(s) à déduire" line on every
// non-cancelled final invoice for this devis, from scratch — called after
// a deposit is cancelled or deleted, so a removed deposit's amount doesn't
// stay stuck deducted from the final invoice's total.
export async function recomputeFactureDepositDeduction(devisId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('recompute_facture_deposit_deduction', { p_devis_id: devisId });
  return { error: error?.message ?? null };
}

export async function listFacturesForDevis(devisId: string): Promise<Pick<Facture, 'id' | 'number' | 'status' | 'is_deposit'>[]> {
  const { data } = await supabase
    .from('factures')
    .select('id, number, status, is_deposit')
    .eq('devis_id', devisId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

// devis_id is deliberately not copied: a duplicate is a fresh, unrelated
// document — keeping the link would make it look like another deposit/final
// invoice for the same quote, which the deduction logic in
// convert_devis_to_facture would then pick up unintentionally.
export async function duplicateFacture(factureId: string): Promise<{ id: string | null; error: string | null }> {
  const { data: original, error: loadError } = await supabase.from('factures').select('*').eq('id', factureId).single();
  if (loadError || !original) return { id: null, error: loadError?.message ?? 'Facture introuvable.' };

  const { data: items } = await supabase
    .from('facture_items')
    .select('*')
    .eq('facture_id', factureId)
    .order('sort_order', { ascending: true });

  const { data: created, error: insertError } = await supabase
    .from('factures')
    .insert({
      organization_id: original.organization_id,
      project_id: original.project_id,
      template_id: original.template_id,
      client_name: original.client_name,
      client_address: original.client_address,
      client_email: original.client_email,
      notes: original.notes,
      vat_rate: original.vat_rate,
    })
    .select('id')
    .single();
  if (insertError || !created) return { id: null, error: insertError?.message ?? 'Échec de la duplication.' };

  if (items?.length) {
    const { error: itemsError } = await supabase.from('facture_items').insert(
      items.map((it) => ({
        facture_id: created.id,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unit_price,
        sort_order: it.sort_order,
      })),
    );
    if (itemsError) return { id: created.id, error: itemsError.message };
  }

  return { id: created.id, error: null };
}

// Standalone facture creation, not converted from a devis — used by the RH
// module's "Facturer ce chantier" flow (see PayrollInvoiceModal). One line
// per work type, quantity always 1 and unit null: the position's price is
// already the final computed amount (rate × hours, or a flat amount typed
// directly), not a per-unit price meant to be multiplied again downstream.
export async function createFactureFromLines(params: {
  organizationId: string;
  projectId: string | null;
  clientName: string;
  clientAddress?: string | null;
  clientEmail?: string | null;
  vatRate: number;
  notes: string | null;
  lines: { description: string; amountChf: number }[];
}): Promise<{ id: string | null; error: string | null }> {
  const { data: created, error: insertError } = await supabase
    .from('factures')
    .insert({
      organization_id: params.organizationId,
      project_id: params.projectId,
      client_name: params.clientName,
      client_address: params.clientAddress || null,
      client_email: params.clientEmail || null,
      notes: params.notes,
      vat_rate: params.vatRate,
    })
    .select('id')
    .single();
  if (insertError || !created) return { id: null, error: insertError?.message ?? 'Échec de la création de la facture.' };

  if (params.lines.length) {
    const { error: itemsError } = await supabase.from('facture_items').insert(
      params.lines.map((line, i) => ({
        facture_id: created.id,
        description: line.description,
        quantity: 1,
        unit: null,
        unit_price: line.amountChf,
        sort_order: i,
      })),
    );
    if (itemsError) return { id: created.id, error: itemsError.message };
  }

  return { id: created.id, error: null };
}

// Flags the raw time entries that fed a facture's line as billed, so the RH
// cockpit's "Facturer ce chantier" summary stops offering them again — see
// payroll_time_entries.invoiced_facture_id.
export async function markTimeEntriesInvoiced(entryIds: string[], factureId: string): Promise<{ error: string | null }> {
  if (entryIds.length === 0) return { error: null };
  const { error } = await supabase.from('payroll_time_entries').update({ invoiced_facture_id: factureId }).in('id', entryIds);
  return { error: error?.message ?? null };
}

export interface ProjectFactureSummary {
  id: string;
  number: string | null;
  status: FactureStatus;
  total: number;
  paid: number;
  remaining: number;
}

// One round trip for every chantier's already-invoiced/already-paid state
// at once — used by the RH cockpit's per-chantier summary so an admin sees
// at a glance whether a chantier has already been billed before hitting
// "Facturer ce chantier" again, without having to open Facturation or dig
// through bank statements to check what's already been paid.
export async function listFacturesForProjects(projectIds: string[]): Promise<Record<string, ProjectFactureSummary[]>> {
  if (projectIds.length === 0) return {};

  const { data: factures } = await supabase
    .from('factures')
    .select('id, project_id, number, status, vat_rate')
    .in('project_id', projectIds)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });
  if (!factures?.length) return {};

  const factureIds = factures.map((f) => f.id);
  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase.from('facture_items').select('facture_id, quantity, unit_price').in('facture_id', factureIds),
    supabase.from('facture_payments').select('facture_id, amount').in('facture_id', factureIds),
  ]);

  const subtotalByFacture = new Map<string, number>();
  for (const it of items ?? []) {
    subtotalByFacture.set(it.facture_id, (subtotalByFacture.get(it.facture_id) ?? 0) + Number(it.quantity) * Number(it.unit_price));
  }
  const paidByFacture = new Map<string, number>();
  for (const p of payments ?? []) {
    paidByFacture.set(p.facture_id, (paidByFacture.get(p.facture_id) ?? 0) + Number(p.amount));
  }

  const byProject: Record<string, ProjectFactureSummary[]> = {};
  for (const f of factures) {
    if (!f.project_id) continue;
    const subtotal = subtotalByFacture.get(f.id) ?? 0;
    const total = subtotal * (1 + Number(f.vat_rate) / 100);
    const paid = paidByFacture.get(f.id) ?? 0;
    const summary: ProjectFactureSummary = {
      id: f.id,
      number: f.number,
      status: f.status,
      total: Math.round(total * 100) / 100,
      paid: Math.round(paid * 100) / 100,
      remaining: Math.round(Math.max(0, total - paid) * 100) / 100,
    };
    (byProject[f.project_id] ??= []).push(summary);
  }
  return byProject;
}

export async function listFacturePayments(factureId: string): Promise<FacturePayment[]> {
  const { data } = await supabase
    .from('facture_payments')
    .select('*')
    .eq('facture_id', factureId)
    .order('paid_at', { ascending: true });
  return data ?? [];
}

// Derives the facture's status purely from the ledger — 'paid' once it
// covers the total (1-centime tolerance for floating-point noise), 'partial'
// once some but not all of it is in, back to 'sent' if every payment is
// later deleted. Only touches factures already in the sent/partial/paid
// lifecycle — never overrides 'draft' or 'cancelled'.
async function syncFactureStatus(factureId: string, total: number): Promise<void> {
  const payments = await listFacturePayments(factureId);
  const paidSum = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const { data: facture } = await supabase.from('factures').select('status').eq('id', factureId).single();
  if (!facture || (facture.status !== 'sent' && facture.status !== 'partial' && facture.status !== 'paid')) return;
  const isFullyPaid = paidSum >= total - 0.01;
  const nextStatus: FactureStatus = isFullyPaid ? 'paid' : paidSum > 0.01 ? 'partial' : 'sent';
  if (nextStatus === facture.status) return;
  const lastPaidAt = payments.length ? payments[payments.length - 1].paid_at : new Date().toISOString();
  await supabase
    .from('factures')
    .update({ status: nextStatus, paid_at: nextStatus === 'paid' ? lastPaidAt : null })
    .eq('id', factureId);
}

// `total` is the facture's own total TTC (subtotal + VAT), passed in by the
// caller rather than recomputed here — the screen already has it from its
// own line-items query.
export async function addFacturePayment(
  factureId: string,
  amount: number,
  paidAt: string,
  total: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('facture_payments').insert({ facture_id: factureId, amount, paid_at: paidAt });
  if (error) return { error: error.message };
  await syncFactureStatus(factureId, total);
  return { error: null };
}

export async function deleteFacturePayment(paymentId: string, factureId: string, total: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from('facture_payments').delete().eq('id', paymentId);
  if (error) return { error: error.message };
  await syncFactureStatus(factureId, total);
  return { error: null };
}
