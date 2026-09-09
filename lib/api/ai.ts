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

export interface DictatedPayrollEntry {
  projectId: string | null;
  workTypeId: string | null;
  startTime: string | null;
  endTime: string | null;
  hours: number | null;
  note: string;
}

export async function generatePayrollEntry(
  transcript: string,
  organizationId: string,
  projects: { id: string; name: string }[],
  workTypes: { id: string; label: string }[],
): Promise<{ entry: DictatedPayrollEntry | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ entry: DictatedPayrollEntry }>('generate-payroll-entry', {
    transcript,
    organization_id: organizationId,
    projects,
    work_types: workTypes,
    today: new Date().toISOString().slice(0, 10),
  });
  return { entry: data?.entry ?? null, error };
}

export interface ScannedReceipt {
  label: string;
  amount: number;
}

export async function scanReceipt(
  organizationId: string,
  imageBase64: string,
  mediaType: string,
): Promise<{ receipt: ScannedReceipt | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ receipt: ScannedReceipt }>('scan-receipt', {
    organization_id: organizationId,
    image_base64: imageBase64,
    media_type: mediaType,
  });
  return { receipt: data?.receipt ?? null, error };
}

export type VoiceCommandAction = 'payroll_entry' | 'expense' | 'create_devis' | 'create_facture' | 'question' | 'unknown';

export interface VoiceCommand {
  action: VoiceCommandAction;
  projectId: string | null;
  workTypeId: string | null;
  startTime: string | null;
  endTime: string | null;
  hours: number | null;
  label: string | null;
  amount: number | null;
  clientName: string | null;
  note: string;
  summary: string;
}

// The global voice assistant's router: a single free-form dictation (not
// tied to any one screen) gets classified into one of the org's allowed
// actions and extracted into structured fields, alongside a human-readable
// "summary" the caller shows for confirmation before writing anything.
// "create_devis"/"create_facture" only extract the client name here — the
// line items are generated separately by generateDevisLines from the same
// transcript, reusing the exact same AI + catalog-matching path as the
// per-screen dictation on devis/new.tsx and factures/new.tsx. "question" is
// classification only too: the actual answer comes from
// answerAssistantQuestion, which is handed real business data the client
// already fetched (this router never sees it).
export async function routeVoiceCommand(
  transcript: string,
  organizationId: string,
  projects: { id: string; name: string }[],
  workTypes: { id: string; label: string }[],
  allowedActions: Exclude<VoiceCommandAction, 'unknown'>[],
  locale: 'fr' | 'de' | 'it',
): Promise<{ command: VoiceCommand | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ command: VoiceCommand }>('route-voice-command', {
    transcript,
    organization_id: organizationId,
    projects,
    work_types: workTypes,
    allowed_actions: allowedActions,
    locale,
    today: new Date().toISOString().slice(0, 10),
  });
  return { command: data?.command ?? null, error };
}

export interface AssistantTask {
  title: string;
  category: string;
}

export interface AssistantOverdueFacture {
  clientName: string;
  amountChf: number;
  daysOverdue: number;
}

export interface AssistantContext {
  orgName: string;
  orgTrade: string | null;
  orgAddress: string | null;
  orgPhone: string | null;
  orgEmail: string | null;
  planName: string | null;
  openTasks: AssistantTask[];
  openTasksCount: number;
  overdueFactures: AssistantOverdueFacture[];
  overdueCount: number;
  overdueTotalChf: number;
  upcomingRecurringExpensesCount: number | null;
}

// The voice assistant's second stage for a "question" command — the client
// assembles `context` itself (RLS-checked reads from its own organization)
// so the edge function never touches the database; it only answers from
// what's handed to it, which keeps the same trust boundary as every other
// AI action here (organization_id is for quota logging, not data access).
export async function answerAssistantQuestion(
  transcript: string,
  organizationId: string,
  context: AssistantContext,
  locale: 'fr' | 'de' | 'it',
): Promise<{ answer: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ answer: string }>('answer-assistant-question', {
    transcript,
    organization_id: organizationId,
    context,
    locale,
  });
  return { answer: data?.answer ?? null, error };
}

// Translates a devis/facture/travaux-supplémentaires send-email message on
// demand — for when the message text doesn't match the document's own
// resolved locale (e.g. an org-saved default message in French, sent
// alongside a devis whose own locale override is German). Counts against
// the org's AI usage quota, same as the other AI actions here.
export async function translateEmailMessage(
  organizationId: string,
  text: string,
  targetLocale: 'fr' | 'de' | 'it',
): Promise<{ text: string | null; error: string | null }> {
  const { data, error } = await invokeFunction<{ text: string }>('translate-email-message', {
    organization_id: organizationId,
    text,
    target_locale: targetLocale,
  });
  return { text: data?.text ?? null, error };
}
