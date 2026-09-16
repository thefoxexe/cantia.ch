import { supabase } from '../supabase';

// Manual/self-service migration path for orgs switching from another
// software (BauBit Pro, A3 Finance & Salaire…) — those export as Excel/CSV,
// not through any API Cantia could hook into directly (BauBit's "Spiderbus"
// is an internal bus between ARC Logiciels' own two products, not a public
// export mechanism). Devis/factures import as one lump-sum line each
// ("Import historique") rather than reconstructed line items — a
// spreadsheet's columns can't reliably be turned into real devis/facture
// detail, but the document itself (number, client, amount, date, status)
// carries over so the history is at least searchable and reportable on.
export type ImportKind = 'clients' | 'chantiers' | 'devis' | 'factures' | 'expenses';

export interface ClientImportRow {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ChantierImportRow {
  name: string;
  clientName: string;
  address: string;
}

export interface DevisImportRow {
  clientName: string;
  amount: string;
  number: string;
  date: string;
  status: string;
}

export interface FactureImportRow {
  clientName: string;
  amount: string;
  number: string;
  date: string;
  status: string;
}

export interface ExpenseImportRow {
  label: string;
  amount: string;
  category: string;
  date: string;
}

// Swiss exports commonly use an apostrophe as the thousands separator
// (1'234.50) and/or a comma as the decimal separator (1234,50) — both
// stripped/normalized here rather than assuming one fixed format.
export function parseAmount(raw: string): number {
  let s = raw.trim().replace(/[^\d.,-]/g, '');
  if (!s) return 0;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (lastComma > -1) {
    s = s.replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// Accepts DD.MM.YYYY, DD/MM/YYYY or YYYY-MM-DD (the three formats a Swiss
// export or a plain Excel date column realistically comes in as). Returns
// null (→ "use today") rather than guessing on anything else.
export function parseImportDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) return s;
  const eu = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(s);
  if (eu) {
    const [, d, m, y] = eu;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

function normalizeStatus<T extends string>(raw: string, dictionary: Record<T, string[]>, fallback: T): T {
  const s = raw.trim().toLowerCase();
  if (!s) return fallback;
  for (const key of Object.keys(dictionary) as T[]) {
    if (dictionary[key].some((kw) => s.includes(kw))) return key;
  }
  return fallback;
}

const DEVIS_STATUS_KEYWORDS: Record<'draft' | 'sent' | 'accepted' | 'refused', string[]> = {
  draft: ['brouillon', 'draft', 'entwurf', 'bozza'],
  sent: ['envoy', 'sent', 'gesendet', 'inviat'],
  accepted: ['accept', 'sign', 'gültig', 'firmat'],
  refused: ['refus', 'rejet', 'abgelehnt', 'rifiutat'],
};

const FACTURE_STATUS_KEYWORDS: Record<'draft' | 'sent' | 'paid' | 'cancelled', string[]> = {
  draft: ['brouillon', 'draft', 'entwurf', 'bozza'],
  sent: ['envoy', 'sent', 'gesendet', 'inviat', 'impay', 'ouvert', 'open'],
  paid: ['pay', 'régl', 'regl', 'bezahlt', 'pagat'],
  cancelled: ['annul', 'cancel', 'storn'],
};

// Rounds to the nearest 5 centimes, same convention used everywhere else
// payable totals are computed (see swissRound in the PDF renderers).
function swissRound(amount: number): number {
  return Math.round(amount / 0.05) * 0.05;
}

function requireNonEmpty(errors: string[], value: string, label: string): boolean {
  if (!value.trim()) {
    errors.push(`Ligne ignorée (${label} manquant) : ${value}`);
    return false;
  }
  return true;
}

export async function importClients(
  organizationId: string,
  userId: string | undefined,
  rows: ClientImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const payload = rows
    .filter((r) => requireNonEmpty(errors, r.name, 'nom'))
    .map((r) => ({
      organization_id: organizationId,
      name: r.name.trim(),
      email: r.email.trim() || null,
      phone: r.phone.trim() || null,
      address: r.address.trim() || null,
      created_by: userId,
    }));

  if (payload.length === 0) return { imported: 0, errors };

  const { error, count } = await supabase.from('clients').insert(payload, { count: 'exact' });
  if (error) {
    errors.push(error.message);
    return { imported: 0, errors };
  }
  return { imported: count ?? payload.length, errors };
}

export async function importChantiers(
  organizationId: string,
  userId: string | undefined,
  rows: ChantierImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const payload = rows
    .filter((r) => requireNonEmpty(errors, r.name, 'nom du chantier'))
    .map((r) => ({
      organization_id: organizationId,
      name: r.name.trim(),
      client_name: r.clientName.trim() || null,
      address: r.address.trim() || null,
      status: 'completed',
      created_by: userId,
    }));

  if (payload.length === 0) return { imported: 0, errors };

  const { error, count } = await supabase.from('projects').insert(payload, { count: 'exact' });
  if (error) {
    errors.push(error.message);
    return { imported: 0, errors };
  }
  return { imported: count ?? payload.length, errors };
}

// One lump-sum "Import historique" line per devis, at the mapped amount
// (treated as HT, same convention as every other devis_items.unit_price).
// An empty/unmapped number column lets set_devis_number() auto-generate
// one, same as the normal creation screen — only map it if you actually
// want to preserve your old numbering, and make sure it doesn't collide
// with an existing Cantia number (the column is unique).
export async function importDevis(
  organizationId: string,
  userId: string | undefined,
  vatRate: number,
  rows: DevisImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const prepared = rows
    .filter((r) => requireNonEmpty(errors, r.clientName, 'client'))
    .map((r) => ({
      clientName: r.clientName.trim(),
      amount: parseAmount(r.amount),
      number: r.number.trim() || null,
      date: parseImportDate(r.date),
      status: normalizeStatus(r.status, DEVIS_STATUS_KEYWORDS, 'accepted'),
    }));

  if (prepared.length === 0) return { imported: 0, errors };

  const payload = prepared.map((r) => ({
    organization_id: organizationId,
    number: r.number,
    client_name: r.clientName,
    status: r.status,
    vat_rate: vatRate,
    created_by: userId,
    ...(r.date ? { created_at: `${r.date}T12:00:00Z` } : {}),
  }));

  const { data, error } = await supabase.from('devis').insert(payload).select('id');
  if (error) {
    errors.push(error.message);
    return { imported: 0, errors };
  }

  const itemsPayload = (data ?? []).map((row, i) => ({
    devis_id: row.id,
    description: 'Import historique',
    quantity: 1,
    unit: 'forfait',
    unit_price: prepared[i].amount,
    sort_order: 0,
  }));
  const { error: itemsError } = await supabase.from('devis_items').insert(itemsPayload);
  if (itemsError) errors.push(itemsError.message);

  return { imported: data?.length ?? 0, errors };
}

// Same lump-sum-line approach as importDevis. A facture imported as "paid"
// also gets a matching facture_payments row (dated the same historical
// date) — Cantia auto-posts real accounting entries off both the facture's
// status and its payments, so a "paid" import without a payment row would
// otherwise show as revenue recognized but never cashed in the ledger.
export async function importFactures(
  organizationId: string,
  userId: string | undefined,
  vatRate: number,
  rows: FactureImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const prepared = rows
    .filter((r) => requireNonEmpty(errors, r.clientName, 'client'))
    .map((r) => ({
      clientName: r.clientName.trim(),
      amount: parseAmount(r.amount),
      number: r.number.trim() || null,
      date: parseImportDate(r.date),
      status: normalizeStatus(r.status, FACTURE_STATUS_KEYWORDS, 'paid'),
    }));

  if (prepared.length === 0) return { imported: 0, errors };

  const payload = prepared.map((r) => ({
    organization_id: organizationId,
    number: r.number,
    client_name: r.clientName,
    status: r.status,
    vat_rate: vatRate,
    created_by: userId,
    ...(r.date ? { created_at: `${r.date}T12:00:00Z` } : {}),
    ...(r.status === 'paid' ? { paid_at: r.date ? `${r.date}T12:00:00Z` : new Date().toISOString() } : {}),
  }));

  const { data, error } = await supabase.from('factures').insert(payload).select('id');
  if (error) {
    errors.push(error.message);
    return { imported: 0, errors };
  }

  const itemsPayload = (data ?? []).map((row, i) => ({
    facture_id: row.id,
    description: 'Import historique',
    quantity: 1,
    unit: 'forfait',
    unit_price: prepared[i].amount,
    sort_order: 0,
  }));
  const { error: itemsError } = await supabase.from('facture_items').insert(itemsPayload);
  if (itemsError) errors.push(itemsError.message);

  const paymentsPayload = (data ?? [])
    .map((row, i) => ({ row, prep: prepared[i] }))
    .filter(({ prep }) => prep.status === 'paid')
    .map(({ row, prep }) => ({
      facture_id: row.id,
      amount: swissRound(prep.amount * (1 + vatRate / 100)),
      paid_at: prep.date ? `${prep.date}T12:00:00Z` : new Date().toISOString(),
      created_by: userId,
    }));
  if (paymentsPayload.length > 0) {
    const { error: payError } = await supabase.from('facture_payments').insert(paymentsPayload);
    if (payError) errors.push(payError.message);
  }

  return { imported: data?.length ?? 0, errors };
}

export async function importExpenses(
  organizationId: string,
  userId: string | undefined,
  rows: ExpenseImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const payload = rows
    .filter((r) => requireNonEmpty(errors, r.label, 'libellé'))
    .map((r) => {
      const date = parseImportDate(r.date);
      return {
        organization_id: organizationId,
        label: r.label.trim(),
        category: r.category.trim() || null,
        amount_chf: parseAmount(r.amount),
        ...(date ? { expense_date: date } : {}),
        created_by: userId,
      };
    });

  if (payload.length === 0) return { imported: 0, errors };

  const { error, count } = await supabase.from('expenses').insert(payload, { count: 'exact' });
  if (error) {
    errors.push(error.message);
    return { imported: 0, errors };
  }
  return { imported: count ?? payload.length, errors };
}
