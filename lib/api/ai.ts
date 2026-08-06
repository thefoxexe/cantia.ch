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
