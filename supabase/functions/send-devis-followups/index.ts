import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { applyEmailVariables, base64FromBytes, buildDocumentEmailHtml, sendResendEmail } from '../_shared/resend.ts';
import { fetchStorageBytes } from '../_shared/pdf-helpers.ts';
import { pdfT, resolveDocLocale, type PdfLocale } from '../_shared/pdf-i18n.ts';

// Relances de devis automatiques (plan Entreprise).
//
// Two ways in:
// - pg_cron every 15 minutes (X-Dispatch-Secret): sends every follow-up that
//   is due, for orgs whose devis_followup_settings are enabled, inside their
//   send window (Swiss time);
// - a signed-in finance member ({ devis_id }): "Relancer maintenant" on one
//   devis, right away, whatever the schedule.
//
// A follow-up is due when days[step] days have passed since the devis
// email ('sent' event). Never sent when the devis is no longer 'sent',
// expired, paused, bounced or answered.

const BUCKET = 'opus-storage';
const DAY_MS = 24 * 60 * 60 * 1000;
// Safety net against double sends (retried cron call, manual + automatic).
const MIN_GAP_MS = 20 * 60 * 60 * 1000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Standard texts, used when the org hasn't written its own for a step (and
// always for devis in a language other than the org's). {{validite}} is the
// devis' valid-until date.
const DEFAULT_MESSAGES: Record<PdfLocale, string[]> = {
  fr: [
    'Bonjour {{client}},\n\nJe me permets de revenir vers vous au sujet de notre devis {{numero}}. Avez-vous pu en prendre connaissance ? Je reste à votre disposition pour toute question.',
    'Bonjour {{client}},\n\nJe reviens vers vous concernant notre devis {{numero}}. Si vous souhaitez adapter certains points ou discuter d’une variante, je serais heureux d’en parler avec vous.',
    'Bonjour {{client}},\n\nNotre devis {{numero}} reste valable jusqu’au {{validite}}. N’hésitez pas à me faire signe si vous souhaitez aller de l’avant.',
  ],
  de: [
    'Guten Tag {{client}}\n\nIch erlaube mir, auf unsere Offerte {{numero}} zurückzukommen. Konnten Sie sie bereits ansehen? Für Fragen stehe ich Ihnen gerne zur Verfügung.',
    'Guten Tag {{client}}\n\nIch melde mich nochmals wegen unserer Offerte {{numero}}. Falls Sie einzelne Punkte anpassen oder eine Variante besprechen möchten, spreche ich gerne mit Ihnen darüber.',
    'Guten Tag {{client}}\n\nUnsere Offerte {{numero}} ist bis zum {{validite}} gültig. Melden Sie sich gerne, wenn Sie den Auftrag erteilen möchten.',
  ],
  it: [
    'Buongiorno {{client}},\n\nMi permetto di tornare sul nostro preventivo {{numero}}. Ha avuto modo di consultarlo? Resto a disposizione per qualsiasi domanda.',
    'Buongiorno {{client}},\n\nTorno a contattarla riguardo al nostro preventivo {{numero}}. Se desidera modificare alcuni punti o discutere una variante, ne parlerei volentieri con lei.',
    'Buongiorno {{client}},\n\nIl nostro preventivo {{numero}} resta valido fino al {{validite}}. Non esiti a contattarmi se desidera procedere.',
  ],
};

const SUBJECT: Record<PdfLocale, string> = {
  fr: 'Relance — Devis {{numero}} — {{entreprise}}',
  de: 'Erinnerung — Offerte {{numero}} — {{entreprise}}',
  it: 'Promemoria — Preventivo {{numero}} — {{entreprise}}',
};

interface Settings {
  organization_id: string;
  enabled: boolean;
  days: number[];
  min_amount: number;
  send_from_hour: number;
  send_to_hour: number;
  weekdays_only: boolean;
  attach_pdf: boolean;
  messages: string[];
}

const DEFAULT_SETTINGS: Omit<Settings, 'organization_id'> = {
  enabled: false,
  days: [3, 7, 14],
  min_amount: 0,
  send_from_hour: 8,
  send_to_hour: 18,
  weekdays_only: true,
  attach_pdf: true,
  messages: [],
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return json({ error: "L'envoi d'e-mail n'est pas configuré côté serveur." }, 500);

  const dispatchSecret = Deno.env.get('DISPATCH_SECRET');
  const fromCron = !!dispatchSecret && req.headers.get('x-dispatch-secret') === dispatchSecret;

  try {
    if (fromCron) {
      const result = await runSchedule(admin, apiKey, supabaseUrl, serviceKey);
      return json(result);
    }

    // Manual send by a signed-in member.
    const { devis_id } = await req.json().catch(() => ({}));
    if (!devis_id) return json({ error: 'devis_id requis' }, 400);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: devis } = await userClient.from('devis').select('*').eq('id', devis_id).maybeSingle();
    if (!devis) return json({ error: 'Devis introuvable ou accès refusé' }, 404);
    const { data: canView } = await userClient.rpc('can_view_org_finances', { org_id: devis.organization_id });
    if (!canView) return json({ error: 'Accès refusé' }, 403);
    if (!(await orgHasTracking(admin, devis.organization_id))) {
      return json({ error: 'Les relances de devis sont incluses dans le plan Entreprise.' }, 403);
    }
    if (devis.status !== 'sent') return json({ error: "Ce devis n'est plus en attente de réponse." }, 400);
    if (!devis.client_email) return json({ error: "Ce devis n'a pas d'adresse e-mail client." }, 400);

    const settings = await loadSettings(admin, devis.organization_id);
    const { data: events } = await admin
      .from('devis_events')
      .select('kind, occurred_at')
      .eq('devis_id', devis_id)
      .in('kind', ['followup_sent'])
      .order('occurred_at', { ascending: true });
    const last = events?.length ? new Date(events[events.length - 1].occurred_at).getTime() : 0;
    if (last && Date.now() - last < 10 * 60 * 1000) return json({ error: 'Une relance vient déjà de partir pour ce devis.' }, 409);
    const step = (events?.length ?? 0) + 1;

    const sent = await sendFollowup(admin, apiKey, supabaseUrl, serviceKey, devis, settings, step, true);
    if (!sent.ok) return json({ error: sent.error }, 502);
    return json({ sent: true, step });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

async function orgHasTracking(admin: SupabaseClient, orgId: string): Promise<boolean> {
  const { data } = await admin.rpc('org_has_sales_tracking', { org_id: orgId });
  return data === true;
}

async function loadSettings(admin: SupabaseClient, orgId: string): Promise<Settings> {
  const { data } = await admin.from('devis_followup_settings').select('*').eq('organization_id', orgId).maybeSingle();
  return { organization_id: orgId, ...DEFAULT_SETTINGS, ...(data ?? {}) } as Settings;
}

// Weekday (1 = Monday … 7 = Sunday) and hour in Switzerland.
function swissNow(date = new Date()): { weekday: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', hour12: false }).formatToParts(date);
  const wd = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24;
  const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(wd) + 1;
  return { weekday, hour };
}

async function runSchedule(admin: SupabaseClient, apiKey: string, supabaseUrl: string, serviceKey: string) {
  const { data: rows } = await admin.from('devis_followup_settings').select('*').eq('enabled', true);
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const { weekday, hour } = swissNow();
  let sentCount = 0;
  const failures: string[] = [];

  for (const row of (rows ?? []) as Settings[]) {
    const settings = { ...DEFAULT_SETTINGS, ...row } as Settings;
    if (settings.weekdays_only && weekday > 5) continue;
    if (hour < settings.send_from_hour || hour >= settings.send_to_hour) continue;
    if (!(await orgHasTracking(admin, settings.organization_id))) continue;

    const { data: devisRows } = await admin
      .from('devis')
      .select('*')
      .eq('organization_id', settings.organization_id)
      .eq('status', 'sent')
      .eq('followups_paused', false)
      .not('client_email', 'is', null);
    const candidates = (devisRows ?? []).filter((d) => !d.valid_until || d.valid_until >= today);
    if (!candidates.length) continue;
    const ids = candidates.map((d) => d.id);

    const [{ data: events }, { data: items }] = await Promise.all([
      admin
        .from('devis_events')
        .select('devis_id, kind, occurred_at')
        .in('devis_id', ids)
        .in('kind', ['sent', 'followup_sent', 'reply_received', 'bounced'])
        .order('occurred_at', { ascending: true }),
      settings.min_amount > 0 ? admin.from('devis_items').select('devis_id, quantity, unit_price').in('devis_id', ids) : Promise.resolve({ data: [] }),
    ]);

    const subtotal: Record<string, number> = {};
    for (const it of (items ?? []) as { devis_id: string; quantity: number; unit_price: number }[]) {
      subtotal[it.devis_id] = (subtotal[it.devis_id] ?? 0) + Number(it.quantity) * Number(it.unit_price);
    }

    for (const devis of candidates) {
      const own = (events ?? []).filter((e) => e.devis_id === devis.id);
      const sent = own.find((e) => e.kind === 'sent');
      // Sent before tracking existed or outside Cantia: no reference date.
      if (!sent) continue;
      if (own.some((e) => e.kind === 'reply_received' || e.kind === 'bounced')) continue;
      const followups = own.filter((e) => e.kind === 'followup_sent');
      const step = followups.length + 1;
      if (step > settings.days.length) continue;
      if (settings.min_amount > 0 && (subtotal[devis.id] ?? 0) * (1 + Number(devis.vat_rate) / 100) < settings.min_amount) continue;
      const due = new Date(sent.occurred_at).getTime() + settings.days[step - 1] * DAY_MS;
      if (now < due) continue;
      const last = followups.length ? new Date(followups[followups.length - 1].occurred_at).getTime() : 0;
      if (last && now - last < MIN_GAP_MS) continue;

      const result = await sendFollowup(admin, apiKey, supabaseUrl, serviceKey, devis, settings, step, false);
      if (result.ok) sentCount += 1;
      else failures.push(`${devis.id}: ${result.error}`);
    }
  }
  if (failures.length) console.error('Follow-up failures', failures);
  return { sent: sentCount, failed: failures.length };
}

// deno-lint-ignore no-explicit-any
async function sendFollowup(admin: SupabaseClient, apiKey: string, supabaseUrl: string, serviceKey: string, devis: any, settings: Settings, step: number, manual: boolean): Promise<{ ok: boolean; error?: string }> {
  const { data: org } = await admin
    .from('organizations')
    .select('name, email, email_signature, locale')
    .eq('id', devis.organization_id)
    .single();
  const locale = resolveDocLocale(devis, org);
  const orgLocale: PdfLocale = org?.locale === 'de' || org?.locale === 'it' ? org.locale : 'fr';
  const orgName = org?.name ?? 'Notre entreprise';

  const defaults = DEFAULT_MESSAGES[locale];
  const custom = locale === orgLocale ? (settings.messages?.[step - 1] ?? '').trim() : '';
  const template = custom || defaults[Math.min(step, defaults.length) - 1];

  const validite = devis.valid_until
    ? new Date(`${devis.valid_until}T00:00:00`).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  const vars = { client: devis.client_name ?? '', entreprise: orgName, numero: devis.number ?? '', chantier: '', validite };
  const rawSignature = String(org?.email_signature ?? '').trim() || `${pdfT(locale, 'emailSignatureFallback')}\n${orgName}`;

  const html = buildDocumentEmailHtml({
    clientName: devis.client_name,
    bodyMessage: applyEmailVariables(template, vars),
    includeGreeting: false,
    linkUrl: `https://cantia.ch/devis-client/${devis.public_token}`,
    linkLabel: pdfT(locale, 'viewAndSignDevis'),
    linkHint: pdfT(locale, 'withoutAccount'),
    signature: applyEmailVariables(rawSignature, vars),
    locale,
  });

  let attachments: { filename: string; content: string }[] | undefined;
  if (settings.attach_pdf) {
    const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-devis-pdf`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ devis_id: devis.id }),
    });
    const genData = await genRes.json().catch(() => null);
    if (genRes.ok && genData?.path) {
      // deno-lint-ignore no-explicit-any
      const pdf = await fetchStorageBytes(admin as any, BUCKET, genData.path);
      if (pdf) attachments = [{ filename: `Devis-${devis.number ?? devis.id}.pdf`, content: base64FromBytes(pdf.bytes) }];
    }
  }

  const { ok, error, id } = await sendResendEmail({
    apiKey,
    from: `${orgName} <noreply@cantia.ch>`,
    to: [devis.client_email],
    replyTo: org?.email,
    subject: applyEmailVariables(SUBJECT[locale], vars),
    html,
    attachments,
    tags: [{ name: 'devis_id', value: devis.id }],
  });
  if (!ok) return { ok: false, error };

  await admin.from('devis_events').insert({
    organization_id: devis.organization_id,
    devis_id: devis.id,
    kind: 'followup_sent',
    resend_email_id: id ?? null,
    meta: { step, manual, to: devis.client_email },
  });
  return { ok: true };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
