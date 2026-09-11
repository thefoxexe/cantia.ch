import { invokeFunction } from './functions';
import type { EmployeeRef } from './payroll';

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
export async function generatePayslipPdf(ref: EmployeeRef, periodStart: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-payslip-pdf', {
    user_id: ref.userId,
    ghost_employee_id: ref.ghostEmployeeId,
    period_start: periodStart,
  });
  return { url: data?.url ?? null, error };
}

// Sums the same monthly décompte math across a full calendar year — see
// generate-salary-certificate-pdf's own comment for why this is a
// récapitulatif, not an official certificat de salaire (Swissdec ce-27).
export async function generateSalaryCertificatePdf(ref: EmployeeRef, year: number): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-salary-certificate-pdf', {
    user_id: ref.userId,
    ghost_employee_id: ref.ghostEmployeeId,
    year,
  });
  return { url: data?.url ?? null, error };
}

// The real, official federal Lohnausweis (Form. 11, ESTV) — filled onto its
// actual AcroForm fields, not a recreation. See generate-lohnausweis-pdf's
// own comments for why every non-zero deduction type must have a
// certificate_box mapping before this succeeds.
export async function generateLohnausweisPdf(ref: EmployeeRef, year: number): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ url: string }>('generate-lohnausweis-pdf', {
    user_id: ref.userId,
    ghost_employee_id: ref.ghostEmployeeId,
    year,
  });
  return { url: data?.url ?? null, error };
}
