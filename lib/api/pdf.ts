import { supabase } from '../supabase';

export async function generateReportPdf(reportId: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('generate-report-pdf', {
    body: { report_id: reportId },
  });
  if (error) return { url: null, error: error.message };
  if (data?.error) return { url: null, error: data.error };
  return { url: data?.url ?? null, error: null };
}

export async function generateDevisPdf(devisId: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('generate-devis-pdf', {
    body: { devis_id: devisId },
  });
  if (error) return { url: null, error: error.message };
  if (data?.error) return { url: null, error: data.error };
  return { url: data?.url ?? null, error: null };
}
