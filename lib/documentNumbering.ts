// Numbering of devis and factures, chosen by each company (Compte → Devis &
// factures). The format is free text with tokens; the database applies it
// (public.next_document_number) — this mirror only shows the preview while
// typing, with the same rules as public.document_number_format_valid and
// public.format_document_number.
import { supabase } from './supabase';

export type NumberedDoc = 'devis' | 'facture';

export interface NumberingSetting {
  format: string;
  next_number: number;
  preview: string;
}

export { NUMBER_TOKENS, formatDocumentNumber, isValidNumberFormat } from './documentNumberingFormat';

export async function fetchNumbering(organizationId: string): Promise<{ data: Record<NumberedDoc, NumberingSetting> | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_document_numbering', { p_organization_id: organizationId });
  if (error) return { data: null, error: error.message };
  return { data: data as Record<NumberedDoc, NumberingSetting>, error: null };
}

export async function saveNumbering(organizationId: string, doc: NumberedDoc, format: string, nextNumber: number): Promise<{ preview: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('set_document_numbering', {
    p_organization_id: organizationId,
    p_doc_type: doc,
    p_format: format.trim(),
    p_next_number: nextNumber,
  });
  if (error) return { preview: null, error: error.message };
  return { preview: data as string, error: null };
}
