import { supabase } from '../supabase';

// ==========================================================================
// §6.5 "PAIN.001" — ISO 20022 Customer Credit Transfer Initiation files for
// supplier payments and expense reimbursements, generated for the user to
// review and upload into their own e-banking. Cantia never transmits a
// payment itself — matching the cahier's explicit "aucune déclaration ou
// paiement transmis automatiquement sans validation de l'utilisateur".
//
// SCOPE: fournisseur (subcontractor_invoices) and remboursement
// (payroll_expenses) only. Payroll net-pay batches are deliberately not
// included — see the schema migration's comment for why.
//
// NOT INDEPENDENTLY VERIFIED against the official ISO 20022 pain.001.001.03
// XSD (not supplied) — the structure below reflects the internationally
// standard, extremely stable message shape used worldwide for bulk credit
// transfers, plain domestic CHF transfers only (no BIC lookup, no
// SEPA-specific fields, no QR-bill remittance on outgoing payments). Banks
// validate every uploaded PAIN.001 file against their own schema and
// reject anything malformed, so a structural mistake here is caught at
// upload, not silently executed — the same safety net as the ESTV portal
// for the eCH-0217 export.
// ==========================================================================

// ISO 7064 MOD 97-10 IBAN check-digit validation — an exact, verifiable
// public algorithm (not Swiss-specific ambiguity), computed in 7-digit
// chunks to stay within safe integer range on long IBANs.
export function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(String(remainder) + numeric.slice(i, i + 7)) % 97;
  }
  return remainder === 1;
}

export interface PayableItem {
  sourceType: 'subcontractor_invoice' | 'payroll_expense';
  sourceId: string;
  creditorName: string;
  creditorIban: string | null;
  amount: number;
  remittanceInfo: string;
  ibanValid: boolean;
  // Only set for payroll_expense items — the IBAN to fix lives on the
  // employee's payroll profile (keyed by user_id), not on the expense row
  // itself (sourceId), so the UI needs this to call setEmployeeIban.
  employeeUserId?: string;
}

// Unpaid subcontractor invoices not already sitting in another batch.
//
// Goes through a SECURITY DEFINER RPC rather than direct table reads:
// subcontractor_invoices/subcontractors are gated by
// can_view_org_subcontractors, payroll_expenses/payroll_profiles by
// can_manage_org_payroll — neither of which can_generate_org_payments
// implies (it was deliberately kept admin-only, see the schema
// migration's comment). A custom role granted only can_generate_payments
// needs its own narrow read path to the same rows.
export async function listPayableSubcontractorInvoices(organizationId: string): Promise<PayableItem[]> {
  const { data } = await supabase.rpc('payments_list_payable_subcontractor_invoices', { p_organization_id: organizationId });
  return (data ?? []).map((inv: any) => ({
    sourceType: 'subcontractor_invoice' as const,
    sourceId: inv.id,
    creditorName: inv.company_name ?? 'Sous-traitant',
    creditorIban: inv.iban,
    amount: Number(inv.amount),
    remittanceInfo: `Facture du ${inv.invoice_date ?? ''}`.trim(),
    ibanValid: !!inv.iban && isValidIban(inv.iban),
  }));
}

// Unpaid expense reimbursements (real users only — ghost employees have
// no app account to log an expense claim from).
export async function listPayableExpenseReimbursements(organizationId: string): Promise<PayableItem[]> {
  const { data } = await supabase.rpc('payments_list_payable_expense_reimbursements', { p_organization_id: organizationId });
  return (data ?? []).map((e: any) => ({
    sourceType: 'payroll_expense' as const,
    sourceId: e.id,
    creditorName: e.employee_name ?? 'Employé',
    creditorIban: e.iban,
    amount: Number(e.amount_chf),
    remittanceInfo: e.note || `Note de frais du ${e.expense_date ?? ''}`.trim(),
    ibanValid: !!e.iban && isValidIban(e.iban),
    employeeUserId: e.user_id,
  }));
}

export async function setSubcontractorIban(organizationId: string, subcontractorId: string, iban: string | null): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('payments_set_subcontractor_iban', { p_organization_id: organizationId, p_subcontractor_id: subcontractorId, p_iban: iban });
  return { error: error?.message ?? null };
}

export async function setEmployeeIban(organizationId: string, userId: string, iban: string | null): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('payments_set_employee_iban', { p_organization_id: organizationId, p_user_id: userId, p_iban: iban });
  return { error: error?.message ?? null };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function amt(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

export interface Pain001Result {
  xml: string;
  messageId: string;
  controlSum: number;
}

export function buildPain001Xml(debtorName: string, debtorIban: string, executionDate: string, items: (PayableItem & { endToEndId: string })[]): Pain001Result {
  const messageId = `CANTIA-${Date.now()}`;
  const controlSum = Math.round(items.reduce((s, i) => s + i.amount, 0) * 100) / 100;
  const now = new Date().toISOString().slice(0, 19);

  const lines: string[] = [];
  const push = (depth: number, s: string) => lines.push('  '.repeat(depth) + s);

  push(0, '<?xml version="1.0" encoding="UTF-8"?>');
  push(0, '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">');
  push(1, '<CstmrCdtTrfInitn>');
  push(2, '<GrpHdr>');
  push(3, `<MsgId>${xmlEscape(messageId)}</MsgId>`);
  push(3, `<CreDtTm>${now}</CreDtTm>`);
  push(3, `<NbOfTxs>${items.length}</NbOfTxs>`);
  push(3, `<CtrlSum>${amt(controlSum)}</CtrlSum>`);
  push(3, '<InitgPty>');
  push(4, `<Nm>${xmlEscape(debtorName)}</Nm>`);
  push(3, '</InitgPty>');
  push(2, '</GrpHdr>');
  push(2, '<PmtInf>');
  push(3, `<PmtInfId>${xmlEscape(messageId)}-1</PmtInfId>`);
  push(3, '<PmtMtd>TRF</PmtMtd>');
  push(3, '<BtchBookg>true</BtchBookg>');
  push(3, `<NbOfTxs>${items.length}</NbOfTxs>`);
  push(3, `<CtrlSum>${amt(controlSum)}</CtrlSum>`);
  push(3, `<ReqdExctnDt>${executionDate}</ReqdExctnDt>`);
  push(3, '<Dbtr>');
  push(4, `<Nm>${xmlEscape(debtorName)}</Nm>`);
  push(3, '</Dbtr>');
  push(3, '<DbtrAcct>');
  push(4, `<Id><IBAN>${xmlEscape(debtorIban.replace(/\s+/g, ''))}</IBAN></Id>`);
  push(3, '</DbtrAcct>');
  push(3, '<DbtrAgt>');
  push(4, '<FinInstnId><Othr><Id>NOTPROVIDED</Id></Othr></FinInstnId>');
  push(3, '</DbtrAgt>');
  push(3, '<ChrgBr>SLEV</ChrgBr>');
  for (const item of items) {
    push(3, '<CdtTrfTxInf>');
    push(4, '<PmtId>');
    push(5, `<EndToEndId>${xmlEscape(item.endToEndId)}</EndToEndId>`);
    push(4, '</PmtId>');
    push(4, `<Amt><InstdAmt Ccy="CHF">${amt(item.amount)}</InstdAmt></Amt>`);
    push(4, '<Cdtr>');
    push(5, `<Nm>${xmlEscape(item.creditorName)}</Nm>`);
    push(4, '</Cdtr>');
    push(4, '<CdtrAcct>');
    push(5, `<Id><IBAN>${xmlEscape((item.creditorIban ?? '').replace(/\s+/g, ''))}</IBAN></Id>`);
    push(4, '</CdtrAcct>');
    if (item.remittanceInfo) {
      push(4, `<RmtInf><Ustrd>${xmlEscape(item.remittanceInfo.slice(0, 140))}</Ustrd></RmtInf>`);
    }
    push(3, '</CdtTrfTxInf>');
  }
  push(2, '</PmtInf>');
  push(1, '</CstmrCdtTrfInitn>');
  push(0, '</Document>');

  return { xml: lines.join('\n') + '\n', messageId, controlSum };
}

export interface PaymentBatch {
  id: string;
  kind: 'fournisseur' | 'remboursement';
  executionDate: string;
  debtorIban: string;
  controlSum: number;
  status: 'prepare' | 'paye';
  createdAt: string;
  paidAt: string | null;
}

function mapBatch(row: any): PaymentBatch {
  return {
    id: row.id,
    kind: row.kind,
    executionDate: row.execution_date,
    debtorIban: row.debtor_iban,
    controlSum: Number(row.control_sum),
    status: row.status,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

export async function listPaymentBatches(organizationId: string): Promise<PaymentBatch[]> {
  const { data } = await supabase.from('payment_batches').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
  return (data ?? []).map(mapBatch);
}

// Creates the batch + its items, then returns the generated XML — a
// single call so the caller never has a batch row with no items (or vice
// versa) if something fails partway.
export async function createPaymentBatch(
  organizationId: string,
  kind: 'fournisseur' | 'remboursement',
  executionDate: string,
  debtorName: string,
  debtorIban: string,
  items: PayableItem[],
  userId: string | undefined,
): Promise<{ batchId: string | null; xml: string | null; error: string | null }> {
  const invalid = items.find((i) => !i.creditorIban || !isValidIban(i.creditorIban));
  if (invalid) return { batchId: null, xml: null, error: `IBAN manquant ou invalide pour ${invalid.creditorName}` };
  if (!isValidIban(debtorIban)) return { batchId: null, xml: null, error: "IBAN de l'entreprise manquant ou invalide (Compte > Entreprise)" };
  if (!items.length) return { batchId: null, xml: null, error: 'Sélectionnez au moins un paiement' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(executionDate) || Number.isNaN(Date.parse(executionDate))) {
    return { batchId: null, xml: null, error: "Date d'exécution invalide (format attendu : AAAA-MM-JJ)" };
  }
  if (executionDate < today()) {
    return { batchId: null, xml: null, error: "La date d'exécution ne peut pas être dans le passé" };
  }

  const itemsWithRef = items.map((i, idx) => ({ ...i, endToEndId: `${i.sourceType.slice(0, 4).toUpperCase()}-${i.sourceId.slice(0, 8)}-${idx}` }));
  const { xml, messageId, controlSum } = buildPain001Xml(debtorName, debtorIban, executionDate, itemsWithRef);

  const { data: batch, error: batchError } = await supabase
    .from('payment_batches')
    .insert({ organization_id: organizationId, kind, execution_date: executionDate, debtor_iban: debtorIban, message_id: messageId, control_sum: controlSum, created_by: userId })
    .select('id')
    .single();
  if (batchError || !batch) return { batchId: null, xml: null, error: batchError?.message ?? 'Ordre de paiement non créé' };

  const { error: itemsError } = await supabase.from('payment_batch_items').insert(
    itemsWithRef.map((i, idx) => ({
      batch_id: batch.id,
      organization_id: organizationId,
      source_type: i.sourceType,
      source_id: i.sourceId,
      creditor_name: i.creditorName,
      creditor_iban: i.creditorIban,
      amount: i.amount,
      remittance_info: i.remittanceInfo,
      end_to_end_id: i.endToEndId,
      sort_order: idx,
    })),
  );
  if (itemsError) {
    // Don't leave a batch row with a control sum and no items behind —
    // clean it back up so the source invoices/expenses stay available
    // for the next attempt instead of looking permanently claimed.
    await supabase.from('payment_batches').delete().eq('id', batch.id);
    return { batchId: null, xml: null, error: itemsError.message };
  }

  return { batchId: batch.id, xml, error: null };
}

export async function markPaymentBatchPaid(batchId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('mark_payment_batch_paid', { p_batch_id: batchId });
  return { error: error?.message ?? null };
}
