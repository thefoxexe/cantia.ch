import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Nouvelles entreprises › e-mail de bienvenue avec 3 mois offerts
// (see supabase/migrations/20261113100000_registry_outreach.sql).
//
//   prepare  (pg_cron, 07:30 Swiss time, dispatch secret): writes a draft
//            for each new company of French-speaking Switzerland whose
//            address was confirmed on its own site or typed by the admin,
//            with its own 90-day code, so that at most 20 drafts wait; then
//            e-mails the admin the list with a link to the page where they
//            are read and sent.
//   send     (Super Admin, ids): sends the drafts the admin validated, at
//            most 20 a day (Swiss day). The others stay drafts for the
//            next day.
//   test     (Super Admin, id): sends one draft to the admin only, to see
//            it as the company will.
//
// Nothing goes to a company without the admin's click. The admin's address
// is the WEEKLY_REPORT_EMAIL secret, the sender OUTREACH_FROM (default
// "Cantia <info@cantia.ch>"): neither is written elsewhere in the code.

const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');
const MODEL = 'claude-opus-5-5';
const ROMANDIE = ['VS', 'VD', 'FR', 'GE', 'NE', 'JU'];
const MAX_WAITING = 20;
const MAX_PER_DAY = 20;
const TRIAL_DAYS = 90;
const VALID_DAYS = 60;
const APP_URL = 'https://app.cantia.ch';
const SITE_URL = 'https://cantia.ch';

type Lang = 'fr' | 'de' | 'it';

interface Company {
  id: string;
  name: string;
  legal_form: string | null;
  canton: string;
  language: string | null;
  town: string | null;
  purpose: string | null;
  trades: string[];
  email: string | null;
  outreach_subject: string | null;
  outreach_body: string | null;
  outreach_code: string | null;
  outreach_status: string | null;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
}

const SELECT = 'id, name, legal_form, canton, language, town, purpose, trades, email, outreach_subject, outreach_body, outreach_code, outreach_status, unsubscribe_token, unsubscribed_at';

function langOf(c: Pick<Company, 'language'>): Lang {
  return c.language === 'de' || c.language === 'it' ? c.language : 'fr';
}

// Start of today in Zurich, as an ISO instant.
function zurichDayStart(): string {
  const now = new Date();
  const asZurich = Date.parse(now.toLocaleString('en-US', { timeZone: 'Europe/Zurich' }));
  const asUtc = Date.parse(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMs = asZurich - asUtc;
  const z = new Date(now.getTime() + offsetMs);
  return new Date(Date.UTC(z.getUTCFullYear(), z.getUTCMonth(), z.getUTCDate()) - offsetMs).toISOString();
}

function zurichHour(): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
}

// PROMATHERM-7K2Q: the company's name, then four characters that cannot be
// misread (no 0/O, 1/I/L).
function makeCode(name: string): string {
  const core = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/\s+-\s+|,/)[0]
    .replace(/\b(sarl|sàrl|sa|ag|gmbh|sagl|snc|ltd|succursale.*)\b/gi, ' ')
    .toUpperCase().replace(/[^A-Z0-9]+/g, '')
    .slice(0, 10) || 'CANTIA';
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return `${core}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

function offerLink(code: string): string {
  return `${APP_URL}/signup?offer=${encodeURIComponent(code)}`;
}

function validUntil(lang: Lang, from = new Date()): string {
  const d = new Date(from.getTime() + VALID_DAYS * 86400000);
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-CH' : lang === 'it' ? 'it-CH' : 'fr-CH', { day: 'numeric', month: 'long', timeZone: 'Europe/Zurich' }).format(d);
}

const FACTS = `What Cantia is (only these facts may be used, never anything else):
- Swiss software for small businesses, first of all building trades (artisans, construction), service and maintenance businesses, engineering and architecture offices, event agencies.
- Quotes and invoices with the Swiss QR-bill, sent by e-mail; a quote can be signed online and turned into an invoice in one click; open invoices are followed and reminders sent.
- Projects / building sites: photos and reports from the phone, extra work recorded and signed.
- Employees enter their hours on the phone; planning of the team.
- Payroll: payslips; VAT return prepared from the invoices.
- Works on the phone and on the computer; the data of another software can be taken over.
- The offer: 3 months free instead of the usual 14 days, with a personal code, valid 60 days; nothing is charged during the 3 months and it can be stopped in one click.`;

function systemPrompt(lang: Lang): string {
  const language = lang === 'de' ? 'Swiss Standard German (ss, never ß; "Sie")' : lang === 'it' ? 'Italian as written in Switzerland ("Lei" or "voi" for a company, be consistent)' : 'French as written in Switzerland ("vous")';
  return `You write the first e-mail Cantia sends to a company that has just been founded in Switzerland. It must read like a short, warm note written by a person who looked at what this company does, not like an advertisement.

${FACTS}

Rules:
- Write in ${language}.
- 90 to 150 words in the body. Plain text, short paragraphs, no bullet list, no bold, no emoji, no exclamation marks in a row.
- Open by congratulating them on starting the company (use its name as registered, without changing it). Never say how you know about it: no register, no FOSC/SHAB/FUSC, no "official gazette", no "we saw".
- Then one or two sentences on what usually takes time at the start in THEIR line of work (deduce it from the purpose), and how Cantia helps with that, using only the facts above. If Cantia is not really made for their trade, say so honestly in a few words and talk only about the administrative side (quotes, invoices, payroll, VAT).
- Then the offer: 3 months free instead of 14 days, the code written exactly as given, valid until the date given, nothing charged during the 3 months. Put the literal placeholder [LIEN] alone on its own line right after the offer: it becomes the sign-up link.
- End with one sentence saying that a simple reply "non merci" (in the e-mail's language) is enough and they will not be written to again.
- No signature, no greeting name, no "Bastien": the e-mail ends after that sentence and is signed "Cantia" automatically.
- Never invent a number, a customer, a review, a price, a feature or a fact about the company.
- Subject: 3 to 8 words, natural, contains the company name or its trade, no "offer", "promo", "free" or "gratuit" in it.

Answer with JSON only: {"subject": "...", "body": "..."}`;
}

function fallbackDraft(c: Company, code: string, until: string): { subject: string; body: string } {
  const lang = langOf(c);
  if (lang === 'de') {
    return {
      subject: `${c.name}: Gratulation zum Start`,
      body: `Guten Tag\n\nHerzliche Gratulation zur Gründung der ${c.name}.\n\nCantia ist eine Schweizer Software für KMU: Offerten und QR-Rechnungen, Stunden und Löhne, die MWST-Abrechnung und der Überblick über offene Rechnungen, auf dem Telefon und am Computer.\n\nZum Start schenken wir Ihnen 3 Monate statt der üblichen 14 Tage, mit Ihrem persönlichen Code ${code} (gültig bis ${until}). In diesen 3 Monaten wird nichts belastet.\n\n[LIEN]\n\nFalls das nichts für Sie ist, genügt ein kurzes «Nein danke», und wir melden uns nicht mehr.`,
    };
  }
  if (lang === 'it') {
    return {
      subject: `${c.name}: complimenti per l’avvio`,
      body: `Buongiorno,\n\ncomplimenti per la fondazione di ${c.name}.\n\nCantia è un software svizzero per le PMI: preventivi e fatture con QR, ore e salari, il rendiconto IVA e la visione sulle fatture aperte, dal telefono e dal computer.\n\nPer l’avvio vi offriamo 3 mesi invece dei soliti 14 giorni, con il vostro codice personale ${code} (valido fino al ${until}). In questi 3 mesi non viene addebitato nulla.\n\n[LIEN]\n\nSe non fa per voi, basta rispondere «no grazie» e non vi scriveremo più.`,
    };
  }
  return {
    subject: `${c.name} : félicitations pour le lancement`,
    body: `Bonjour,\n\nFélicitations pour le lancement de ${c.name}.\n\nCantia est un logiciel suisse pour les petites entreprises : devis et factures avec QR-facture, heures et salaires, décompte TVA et suivi des factures ouvertes, depuis le téléphone comme depuis l’ordinateur.\n\nPour vos débuts, nous vous offrons 3 mois au lieu des 14 jours habituels, avec votre code personnel ${code} (valable jusqu’au ${until}). Rien n’est débité pendant ces 3 mois.\n\n[LIEN]\n\nSi ce n’est pas pour vous, un simple « non merci » suffit et nous ne vous écrirons plus.`,
  };
}

async function writeDraft(c: Company, code: string): Promise<{ subject: string; body: string }> {
  const lang = langOf(c);
  const until = validUntil(lang);
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return fallbackDraft(c, code, until);
  const user = JSON.stringify({
    company_name: c.name,
    town: c.town,
    canton: c.canton,
    purpose: (c.purpose ?? '').slice(0, 1200),
    trades_guessed: c.trades,
    code,
    valid_until: until,
  });
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, system: systemPrompt(lang), messages: [{ role: 'user', content: user }] }),
    });
    if (!res.ok) {
      console.error('registry-outreach: model error', res.status, (await res.text()).slice(0, 300));
      return fallbackDraft(c, code, until);
    }
    const data = await res.json();
    const raw = String(data?.content?.[0]?.text ?? '').replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(raw) as { subject?: unknown; body?: unknown };
    const subject = typeof parsed.subject === 'string' ? parsed.subject.trim() : '';
    let body = typeof parsed.body === 'string' ? parsed.body.trim() : '';
    // The draft must carry the exact code and the link; otherwise the safe text.
    if (!subject || !body || !body.includes(code)) return fallbackDraft(c, code, until);
    if (!body.includes('[LIEN]')) body = body.replace(new RegExp(`(${code}[^\\n]*\\n?)`), `$1\n[LIEN]\n`);
    if (/registre|fosc|fusc|shab|handelsregister|registro di commercio|bastien/i.test(subject + body)) return fallbackDraft(c, code, until);
    return { subject: subject.slice(0, 140), body: body.slice(0, 3000) };
  } catch (err) {
    console.error('registry-outreach: draft failed', err);
    return fallbackDraft(c, code, until);
  }
}

function escapeHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const FOOTER: Record<Lang, { stop: string; link: string; sign: string }> = {
  fr: { stop: 'Ne plus recevoir de message de Cantia', link: 'Profiter des 3 mois offerts', sign: 'Cantia · cantia.ch' },
  de: { stop: 'Keine Nachrichten mehr von Cantia erhalten', link: '3 Monate gratis starten', sign: 'Cantia · cantia.ch' },
  it: { stop: 'Non ricevere più messaggi da Cantia', link: 'Approfittare dei 3 mesi offerti', sign: 'Cantia · cantia.ch' },
};

function renderEmail(c: Company): { html: string; text: string; unsubscribe: string } {
  const lang = langOf(c);
  const f = FOOTER[lang];
  const link = offerLink(c.outreach_code ?? '');
  const unsubscribe = `${SITE_URL}/desinscription?t=${c.unsubscribe_token}&l=${lang}`;
  const body = (c.outreach_body ?? '').trim();
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const htmlParts = paragraphs.map((p) =>
    p === '[LIEN]'
      ? `<p style="margin:0 0 16px;"><a href="${escapeHtml(link)}" style="color:#9c5733;font-weight:600;">${escapeHtml(f.link)}</a></p>`
      : `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\[LIEN\]/g, `<a href="${escapeHtml(link)}" style="color:#9c5733;font-weight:600;">${escapeHtml(f.link)}</a>`).replace(/\n/g, '<br>')}</p>`,
  );
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#23251f;max-width:560px;">
${htmlParts.join('\n')}
<p style="margin:24px 0 0;">${escapeHtml(f.sign)}</p>
<p style="margin:28px 0 0;font-size:12px;color:#6b6f65;"><a href="${escapeHtml(unsubscribe)}" style="color:#6b6f65;">${escapeHtml(f.stop)}</a></p>
</div>`;
  const text = `${body.replace(/\[LIEN\]/g, link)}\n\n${f.sign}\n\n${f.stop} : ${unsubscribe}`;
  return { html, text, unsubscribe };
}

async function sendMail(to: string, subject: string, mail: { html: string; text: string; unsubscribe?: string }): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY manquant' };
  const from = Deno.env.get('OUTREACH_FROM') || 'Cantia <info@cantia.ch>';
  const replyTo = (from.match(/<([^>]+)>/)?.[1] ?? from).trim();
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      html: mail.html,
      text: mail.text,
      ...(mail.unsubscribe ? { headers: { 'List-Unsubscribe': `<${mail.unsubscribe}>` } } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error('registry-outreach: Resend', res.status, t.slice(0, 300));
    return { ok: false, error: `Resend ${res.status}` };
  }
  const data = await res.json().catch(() => ({}));
  return { ok: true, id: data?.id };
}

// Addresses never to write to: already written to, unsubscribed, or
// already a Cantia organization.
async function blockedEmails(admin: SupabaseClient, emails: string[]): Promise<Set<string>> {
  const blocked = new Set<string>();
  if (emails.length === 0) return blocked;
  const { data: rows } = await admin
    .from('registry_companies')
    .select('email, outreach_status, unsubscribed_at')
    .in('email', emails);
  for (const r of rows ?? []) {
    if (r.unsubscribed_at || r.outreach_status === 'sent' || r.outreach_status === 'draft') blocked.add(r.email);
  }
  const { data: orgs } = await admin.from('organizations').select('email').in('email', emails);
  for (const o of orgs ?? []) if (o.email) blocked.add(String(o.email).toLowerCase());
  return blocked;
}

async function prepare(admin: SupabaseClient): Promise<{ prepared: number; waiting: number }> {
  const { count: waitingBefore } = await admin
    .from('registry_companies')
    .select('id', { count: 'exact', head: true })
    .eq('outreach_status', 'draft');
  const slots = Math.max(0, MAX_WAITING - (waitingBefore ?? 0));
  let prepared = 0;
  if (slots > 0) {
    const { data: candidates } = await admin
      .from('registry_companies')
      .select(SELECT)
      .not('email', 'is', null)
      .in('email_check', ['confirmed', 'manual'])
      .is('outreach_status', null)
      .eq('status', 'new')
      .is('unsubscribed_at', null)
      .in('canton', ROMANDIE)
      .order('email_checked_at', { ascending: true, nullsFirst: false })
      .limit(slots * 3);
    const list = (candidates ?? []) as Company[];
    const blocked = await blockedEmails(admin, list.map((c) => c.email!).filter(Boolean));
    for (const c of list) {
      if (prepared >= slots) break;
      if (!c.email || blocked.has(c.email)) continue;
      blocked.add(c.email);
      let code = makeCode(c.name);
      let inserted = false;
      for (let i = 0; i < 3 && !inserted; i++) {
        const { error } = await admin.from('trial_offer_codes').insert({ code, registry_id: c.id, trial_days: TRIAL_DAYS });
        if (!error) inserted = true;
        else code = makeCode(c.name);
      }
      if (!inserted) continue;
      const draft = await writeDraft(c, code);
      const { error } = await admin
        .from('registry_companies')
        .update({
          outreach_status: 'draft',
          outreach_subject: draft.subject,
          outreach_body: draft.body,
          outreach_code: code,
          outreach_prepared_at: new Date().toISOString(),
          outreach_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', c.id)
        .is('outreach_status', null);
      if (!error) prepared++;
    }
  }

  const { data: waiting } = await admin
    .from('registry_companies')
    .select('name, town, outreach_subject')
    .eq('outreach_status', 'draft')
    .order('outreach_prepared_at', { ascending: true });
  const n = waiting?.length ?? 0;
  const to = Deno.env.get('WEEKLY_REPORT_EMAIL');
  if (n > 0 && to) {
    const rows = (waiting ?? [])
      .map((w) => `<li style="margin:0 0 8px;"><strong>${escapeHtml(w.name)}</strong>${w.town ? `, ${escapeHtml(w.town)}` : ''}<br><span style="color:#6b6f65;">${escapeHtml(w.outreach_subject ?? '')}</span></li>`)
      .join('');
    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#23251f;max-width:560px;">
<p style="margin:0 0 14px;">${n === 1 ? '1 e-mail de bienvenue attend' : `${n} e-mails de bienvenue attendent`} ta validation${prepared > 0 ? ` (${prepared} nouveau${prepared > 1 ? 'x' : ''} ce matin)` : ''}.</p>
<ul style="padding-left:18px;margin:0 0 20px;">${rows}</ul>
<p style="margin:0 0 20px;"><a href="${APP_URL}/registre?onglet=envois" style="display:inline-block;padding:11px 22px;border-radius:999px;background:#23251f;color:#ffffff;font-weight:600;text-decoration:none;">Relire et envoyer</a></p>
<p style="margin:0;font-size:13px;color:#6b6f65;">Rien ne part sans ton clic. Au plus ${MAX_PER_DAY} envois par jour : le reste attend le lendemain.</p>
</div>`;
    await sendMail(to, n === 1 ? '1 e-mail de bienvenue à valider' : `${n} e-mails de bienvenue à valider`, { html, text: `${n} e-mail(s) à valider : ${APP_URL}/registre?onglet=envois` });
  }
  return { prepared, waiting: n };
}

async function sendDrafts(admin: SupabaseClient, ids: string[]): Promise<{ sent: number; failed: number; postponed: number }> {
  const { count: sentToday } = await admin
    .from('registry_companies')
    .select('id', { count: 'exact', head: true })
    .gte('outreach_sent_at', zurichDayStart());
  let room = Math.max(0, MAX_PER_DAY - (sentToday ?? 0));
  const { data } = await admin.from('registry_companies').select(SELECT).in('id', ids.slice(0, 100)).in('outreach_status', ['draft', 'failed']);
  let sent = 0;
  let failed = 0;
  let postponed = 0;
  for (const c of (data ?? []) as Company[]) {
    if (room <= 0) { postponed++; continue; }
    if (!c.email || c.unsubscribed_at || !c.outreach_code || !c.outreach_subject || !c.outreach_body) { failed++; continue; }
    const mail = renderEmail(c);
    const r = await sendMail(c.email, c.outreach_subject, mail);
    const now = new Date();
    if (r.ok) {
      room--;
      sent++;
      await admin.from('trial_offer_codes').update({ expires_at: new Date(now.getTime() + VALID_DAYS * 86400000).toISOString() }).eq('code', c.outreach_code);
      await admin.from('registry_companies').update({
        outreach_status: 'sent',
        outreach_sent_at: now.toISOString(),
        outreach_error: null,
        status: 'contacted',
        contacted_at: now.toISOString(),
        updated_at: now.toISOString(),
      }).eq('id', c.id);
    } else {
      failed++;
      await admin.from('registry_companies').update({ outreach_status: 'failed', outreach_error: r.error ?? 'échec', updated_at: now.toISOString() }).eq('id', c.id);
    }
  }
  return { sent, failed, postponed };
}

async function sendTest(admin: SupabaseClient, id: string): Promise<{ ok: boolean; error?: string }> {
  const to = Deno.env.get('WEEKLY_REPORT_EMAIL');
  if (!to) return { ok: false, error: 'WEEKLY_REPORT_EMAIL manquant' };
  const { data } = await admin.from('registry_companies').select(SELECT).eq('id', id).maybeSingle();
  const c = data as Company | null;
  if (!c?.outreach_body || !c.outreach_subject) return { ok: false, error: 'brouillon introuvable' };
  const mail = renderEmail(c);
  return sendMail(to, `[Test] ${c.outreach_subject}`, { html: mail.html, text: mail.text });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    if (body.action === 'prepare') {
      if (!DISPATCH_SECRET || req.headers.get('x-dispatch-secret') !== DISPATCH_SECRET) return json({ error: 'unauthorized' }, 401);
      if (typeof body.only_at_zurich_hour === 'number' && zurichHour() !== body.only_at_zurich_hour) return json({ skipped: 'not the hour' });
      return json(await prepare(admin));
    }

    // Everything else is the Super Admin's click.
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: isAdmin } = await userClient.rpc('is_platform_admin');
    if (isAdmin !== true) return json({ error: 'forbidden' }, 403);

    if (body.action === 'send') {
      const ids = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : [];
      if (ids.length === 0) return json({ error: 'ids requis' }, 400);
      return json(await sendDrafts(admin, ids));
    }
    if (body.action === 'test' && typeof body.id === 'string') return json(await sendTest(admin, body.id));
    if (body.action === 'prepare_now') return json(await prepare(admin));
    return json({ error: 'action inconnue' }, 400);
  } catch (err) {
    console.error('registry-outreach', err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
