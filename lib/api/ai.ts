import { invokeFunction } from './functions';

export async function polishReportNotes(reportId: string): Promise<{ notes: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ notes: string }>('polish-report-notes', { report_id: reportId });
  return { notes: data?.notes ?? null, error };
}
