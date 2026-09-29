import { supabase } from '../supabase';
import type { Devis } from '../types';

// Suivi commercial (plan Entreprise): what happened to each devis after it
// was sent. Events are written server-side (send-devis-email, resend-webhook,
// the client portal) into devis_events; reading them requires the finance
// permission and a plan with has_sales_tracking (enforced by RLS).

export type DevisEventKind =
  | 'sent'
  | 'followup_sent'
  | 'delivered'
  | 'bounced'
  | 'complained'
  | 'opened'
  | 'clicked'
  | 'portal_viewed'
  | 'pdf_downloaded'
  | 'reply_received';

export interface DevisEvent {
  id: string;
  devis_id: string;
  kind: DevisEventKind;
  occurred_at: string;
  meta: Record<string, unknown>;
}

export type PipelineStage = 'sent' | 'viewed' | 'discussion' | 'signed' | 'lost';

export interface DevisTracking {
  devis: Devis;
  amount: number;
  stage: PipelineStage;
  sentAt: string | null;
  views: number;
  lastViewAt: string | null;
  downloads: number;
  followups: number;
  followupDates: string[];
  lastFollowupAt: string | null;
  bounced: boolean;
  replied: boolean;
  expired: boolean;
  lastActivityAt: string | null;
}

export async function hasSalesTracking(planId: string | null | undefined): Promise<boolean> {
  if (!planId) return false;
  const { data } = await supabase.from('plans').select('has_sales_tracking').eq('id', planId).maybeSingle();
  return !!(data as { has_sales_tracking?: boolean } | null)?.has_sales_tracking;
}

export async function getDevisEvents(devisId: string): Promise<DevisEvent[]> {
  const { data } = await supabase
    .from('devis_events')
    .select('id, devis_id, kind, occurred_at, meta')
    .eq('devis_id', devisId)
    .order('occurred_at', { ascending: true });
  return (data ?? []) as DevisEvent[];
}

export async function getSalesTeaser(organizationId: string): Promise<{ sentWaiting: number; viewedWithoutAnswer: number } | null> {
  const { data, error } = await supabase.rpc('sales_tracking_teaser', { org_id: organizationId });
  if (error || !data) return null;
  const d = data as { sent_waiting?: number; viewed_without_answer?: number };
  return { sentWaiting: d.sent_waiting ?? 0, viewedWithoutAnswer: d.viewed_without_answer ?? 0 };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// A bot click (mail scanner) is recorded but never counts as interest.
function isRealClick(e: DevisEvent): boolean {
  return e.kind === 'clicked' && !e.meta?.suspected_bot;
}

export function summarizeDevis(devis: Devis, amount: number, events: DevisEvent[]): DevisTracking {
  const sent = events.find((e) => e.kind === 'sent');
  const views = events.filter((e) => e.kind === 'portal_viewed');
  const followups = events.filter((e) => e.kind === 'followup_sent');
  const replied = events.some((e) => e.kind === 'reply_received');
  const bounced = events.some((e) => e.kind === 'bounced');
  const validUntil = (devis as Devis & { valid_until?: string | null }).valid_until ?? null;
  const expired = devis.status === 'sent' && !!validUntil && validUntil < todayIso();
  const interest = events.filter((e) => e.kind === 'portal_viewed' || e.kind === 'pdf_downloaded' || isRealClick(e) || e.kind === 'reply_received');

  let stage: PipelineStage = 'sent';
  if (devis.status === 'accepted') stage = 'signed';
  else if (devis.status === 'refused' || expired) stage = 'lost';
  else if (replied) stage = 'discussion';
  else if (views.length > 0) stage = 'viewed';

  const last = events.length ? events[events.length - 1].occurred_at : null;
  return {
    devis,
    amount,
    stage,
    sentAt: sent?.occurred_at ?? null,
    views: views.length,
    lastViewAt: views.length ? views[views.length - 1].occurred_at : null,
    downloads: events.filter((e) => e.kind === 'pdf_downloaded').length,
    followups: followups.length,
    followupDates: followups.map((e) => e.occurred_at),
    lastFollowupAt: followups.length ? followups[followups.length - 1].occurred_at : null,
    bounced,
    replied,
    expired,
    lastActivityAt: interest.length ? interest[interest.length - 1].occurred_at : last,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

// "À appeler aujourd'hui": open devis where a phone call is most likely to
// make the difference. Returns the reason key for each, most urgent first.
export type CallReason = 'viewedOften' | 'bigSilent' | 'expiringSoon' | 'bounced';

export function callList(items: DevisTracking[], now = Date.now()): { item: DevisTracking; reason: CallReason }[] {
  const out: { item: DevisTracking; reason: CallReason; rank: number }[] = [];
  for (const item of items) {
    if (item.devis.status !== 'sent' || item.expired || item.replied) continue;
    const validUntil = (item.devis as Devis & { valid_until?: string | null }).valid_until ?? null;
    if (item.bounced) {
      out.push({ item, reason: 'bounced', rank: 0 });
    } else if (item.views >= 2) {
      out.push({ item, reason: 'viewedOften', rank: 1 });
    } else if (validUntil && new Date(validUntil).getTime() - now < 5 * DAY_MS) {
      out.push({ item, reason: 'expiringSoon', rank: 2 });
    } else if (item.amount >= 10000 && item.sentAt && now - new Date(item.sentAt).getTime() > 7 * DAY_MS && !item.views) {
      out.push({ item, reason: 'bigSilent', rank: 3 });
    }
  }
  return out.sort((a, b) => a.rank - b.rank || b.item.amount - a.item.amount).map(({ item, reason }) => ({ item, reason }));
}

export interface PipelineStats {
  pendingAmount: number;
  signatureRate: number | null;
  averageDaysToSign: number | null;
  followupsThisMonth: number;
}

export function pipelineStats(items: DevisTracking[], now = Date.now()): PipelineStats {
  let pendingAmount = 0;
  let decided = 0;
  let signed = 0;
  const signDelays: number[] = [];
  let followupsThisMonth = 0;
  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  for (const item of items) {
    if (item.stage === 'sent' || item.stage === 'viewed' || item.stage === 'discussion') pendingAmount += item.amount;
    const sentAt = item.sentAt ? new Date(item.sentAt).getTime() : new Date(item.devis.created_at).getTime();
    if (now - sentAt <= 90 * DAY_MS && (item.stage === 'signed' || item.stage === 'lost')) {
      decided += 1;
      if (item.stage === 'signed') signed += 1;
    }
    const signedAt = (item.devis as Devis & { client_signed_at?: string | null }).client_signed_at;
    if (item.stage === 'signed' && item.sentAt && signedAt) {
      signDelays.push((new Date(signedAt).getTime() - new Date(item.sentAt).getTime()) / DAY_MS);
    }
    followupsThisMonth += item.followupDates.filter((d) => new Date(d).getTime() >= monthStart.getTime()).length;
  }
  return {
    pendingAmount,
    signatureRate: decided ? signed / decided : null,
    averageDaysToSign: signDelays.length ? signDelays.reduce((a, b) => a + b, 0) / signDelays.length : null,
    followupsThisMonth,
  };
}

// Devis that left the office (sent at least once), with their amount incl.
// VAT and their events, for the Commercial page.
export async function loadPipeline(organizationId: string): Promise<DevisTracking[]> {
  const { data: devisRows } = await supabase
    .from('devis')
    .select('*')
    .eq('organization_id', organizationId)
    .in('status', ['sent', 'accepted', 'refused'])
    // The last 12 months are enough for the board and its 90-day rates.
    .gte('created_at', new Date(Date.now() - 365 * DAY_MS).toISOString())
    .order('created_at', { ascending: false });
  const list = (devisRows ?? []) as Devis[];
  if (!list.length) return [];
  const ids = list.map((d) => d.id);

  const [{ data: items }, { data: events }] = await Promise.all([
    supabase.from('devis_items').select('devis_id, quantity, unit_price').in('devis_id', ids),
    supabase.from('devis_events').select('id, devis_id, kind, occurred_at, meta').in('devis_id', ids).order('occurred_at', { ascending: true }),
  ]);

  const subtotal: Record<string, number> = {};
  for (const it of items ?? []) subtotal[it.devis_id] = (subtotal[it.devis_id] ?? 0) + Number(it.quantity) * Number(it.unit_price);
  const byDevis: Record<string, DevisEvent[]> = {};
  for (const e of (events ?? []) as DevisEvent[]) (byDevis[e.devis_id] ??= []).push(e);

  return list.map((d) => summarizeDevis(d, (subtotal[d.id] ?? 0) * (1 + Number(d.vat_rate) / 100), byDevis[d.id] ?? []));
}
