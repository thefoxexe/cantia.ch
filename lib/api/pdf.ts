import { invokeFunction } from './functions';

export async function generateReportPdf(reportId: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-report-pdf', { report_id: reportId });
  return { url: data?.url ?? null, error };
}

export async function generateDevisPdf(devisId: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-devis-pdf', { devis_id: devisId });
  return { url: data?.url ?? null, error };
}

export async function generateFacturePdf(factureId: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-facture-pdf', { facture_id: factureId });
  return { url: data?.url ?? null, error };
}

// periodStart is the ISO first-of-month date the payslip covers (e.g.
// '2026-08-01') — the edge function derives both the period label and the
// hours-worked range from it.
export async function generatePayslipPdf(userId: string, periodStart: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-payslip-pdf', {
    user_id: userId,
    period_start: periodStart,
  });
  return { url: data?.url ?? null, error };
}
