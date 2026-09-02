import { invokeFunction } from './functions';

export async function polishReportNotes(reportId: string): Promise<{ notes: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ notes: string }>('polish-report-notes', { report_id: reportId });
  return { notes: data?.notes ?? null, error };
}

export interface DictatedDevisLine {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number | null;
  matched: boolean;
}

export async function generateDevisLines(
  transcript: string,
  catalog: { description: string; unit: string; unitPrice: number }[],
  organizationId: string,
): Promise<{ lines: DictatedDevisLine[] | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ lines: DictatedDevisLine[] }>('generate-devis-lines', {
    transcript,
    catalog,
    organization_id: organizationId,
  });
  return { lines: data?.lines ?? null, error };
}

// Translates a devis/facture/travaux-supplémentaires send-email message on
// demand — for when the message text doesn't match the document's own
// resolved locale (e.g. an org-saved default message in French, sent
// alongside a devis whose own locale override is German). Counts against
// the org's AI usage quota, same as the other AI actions here.
export async function translateEmailMessage(
  organizationId: string,
  text: string,
  targetLocale: 'fr' | 'de',
): Promise<{ text: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ text: string }>('translate-email-message', {
    organization_id: organizationId,
    text,
    target_locale: targetLocale,
  });
  return { text: data?.text ?? null, error };
}
