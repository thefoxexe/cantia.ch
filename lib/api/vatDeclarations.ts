import { supabase } from '../supabase';
import type { AfcForm, VatAdjustments, VatMethod } from '../vat/afcForm.ts';

export interface VatDeclaration {
  id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  method: VatMethod;
  status: 'draft' | 'filed' | 'paid';
  adjustments: VatAdjustments;
  figures: AfcForm | null;
  amount_due: number | null;
  afc_reference: string | null;
  filed_at: string | null;
  paid_at: string | null;
}

// null = the table isn't there yet (migration 20261001120000): the page
// still computes the return, it just can't keep its status.
export async function listVatDeclarations(organizationId: string, year: number): Promise<VatDeclaration[] | null> {
  const { data, error } = await supabase
    .from('vat_declarations')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('period_start', `${year}-01-01`)
    .lte('period_start', `${year}-12-31`);
  if (error) return null;
  return (data ?? []) as VatDeclaration[];
}

// The most recent TDFN rates typed in, to prefill the next return.
export async function lastTdfnRates(organizationId: string): Promise<Pick<VatAdjustments, 'tdfnRate1' | 'tdfnRate2'>> {
  const { data } = await supabase
    .from('vat_declarations')
    .select('adjustments')
    .eq('organization_id', organizationId)
    .eq('method', 'tdfn')
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle();
  const a = (data?.adjustments ?? {}) as VatAdjustments;
  return { tdfnRate1: a.tdfnRate1, tdfnRate2: a.tdfnRate2 };
}

export async function saveVatDeclaration(
  organizationId: string,
  userId: string | undefined,
  period: { start: string; end: string },
  patch: Partial<Pick<VatDeclaration, 'method' | 'status' | 'adjustments' | 'figures' | 'amount_due' | 'afc_reference' | 'filed_at' | 'paid_at'>> & { method: VatMethod },
): Promise<{ declaration: VatDeclaration | null; error: string | null }> {
  const { data, error } = await supabase
    .from('vat_declarations')
    .upsert(
      { organization_id: organizationId, period_start: period.start, period_end: period.end, created_by: userId, ...patch },
      { onConflict: 'organization_id,period_start,period_end' },
    )
    .select('*')
    .single();
  return { declaration: (data as VatDeclaration) ?? null, error: error?.message ?? null };
}

// Posted entries still in draft inside the period: they are not in the
// return until they are posted.
export async function countDraftEntries(organizationId: string, start: string, endExclusive: string): Promise<number> {
  const { count } = await supabase
    .from('accounting_entries')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .in('status', ['brouillon', 'validee'])
    .gte('entry_date', start)
    .lt('entry_date', endExclusive);
  return count ?? 0;
}
