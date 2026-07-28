import { invokeFunction } from './functions';

export async function generateReportPdf(reportId: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-report-pdf', { report_id: reportId });
  return { url: data?.url ?? null, error };
}

export async function generateDevisPdf(devisId: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-devis-pdf', { devis_id: devisId });
  return { url: data?.url ?? null, error };
}
