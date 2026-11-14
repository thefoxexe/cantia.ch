import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Nouvelles entreprises › e-mail de bienvenue avec 3 mois offerts
// (see supabase/migrations/20261113100000_registry_outreach.sql).
//
//   prepare  (pg_cron, 07:30 Swiss time, dispatch secret): for each new
//            company of French-speaking Switzerland with an address, writes
//            the e-mail with its own 90-day code. Address confirmed on the
//            company's own site (or typed by the admin): sent right away, 20
//            a day at most, the rest the next mornings. Address not certain
//            (probable, doubtful): kept as a draft for the admin, 20 waiting
//            at most. Then e-mails the admin what left and what waits.
//   send     (Super Admin, ids): sends the drafts the admin validated, at
//            most 20 a day (Swiss day). The others stay drafts for the
//            next day.
//   test     (Super Admin, id): sends one draft to the admin only, to see
//            it as the company will.
//   rewrite  (Super Admin, id, lang): the draft written again in French,
//            German or Italian, same code.
//   request  (anyone, form of cantia.ch/nouvelle-entreprise): a company asks
//            for the 3 months; kept in trial_requests, the admin is told.
//   request_send / request_ignore (Super Admin, id): sends that company its
//            personal code by e-mail, or sets the request aside.
//
// The text never congratulates nor speaks of a new company: if the site
// found belongs to another company with the same name, the e-mail still
// reads as an ordinary introduction. The admin's address
// is the WEEKLY_REPORT_EMAIL secret, the sender OUTREACH_FROM (default
// "Cantia <info@cantia.ch>"): neither is written elsewhere in the code.

const DISPATCH_SECRET = Deno.env.get('DISPATCH_SECRET');
const MODEL = 'claude-opus-5-5';
const ROMANDIE = ['VS', 'VD', 'FR', 'GE', 'NE', 'JU'];
const MAX_WAITING = 20;
const MAX_PER_DAY = 20;
// Drafts written before this text (they congratulated on the launch) are
// written again on the next run, with the same code.
const TEXT_SINCE = '2026-11-14T03:30:00Z';
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
  outreach_prepared_at: string | null;
  email_check: string | null;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
}

const SELECT = 'id, name, legal_form, canton, language, town, purpose, trades, email, email_check, outreach_subject, outreach_body, outreach_code, outreach_status, outreach_prepared_at, unsubscribe_token, unsubscribed_at';

function langOf(c: Pick<Company, 'language'>): Lang {
  return c.language === 'de' || c.language === 'it' ? c.language : 'fr';
}

// The language the company itself writes in, read from the purpose it
// registered (« Zweck der Gesellschaft ist… » is German even when the
// publication was in French). Null when the text says too little.
function detectLang(purpose: string | null): Lang | null {
  const t = ` ${(purpose ?? '').toLowerCase()} `;
  const count = (re: RegExp) => (t.match(re) ?? []).length;
  const de = count(/\s(der|die|das|und|mit|von|für|sowie|zweck|gesellschaft|betrieb|einer|eines)\s/g);
  const it = count(/\s(il|della|delle|dello|di|e|per|società|scopo|gestione|esercizio|nonché)\s/g);
  const fr = count(/\s(le|les|des|et|du|une|pour|société|exploitation|ainsi|notamment)\s/g);
  const best = Math.max(de, it, fr);
  if (best < 2) return null;
  return best === de ? 'de' : best === it ? 'it' : 'fr';
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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
  const language = lang === 'de' ? 'Swiss Standard German (ss, never ß; "Sie")' : lang === 'it' ? 'Italian as written in Switzerland ("voi" for the company)' : 'French as written in Switzerland ("vous")';
  return `You write a short e-mail introducing Cantia to a small Swiss business. It must read like a short, friendly note from a person who looked at what this business does, not like an advertisement.

${FACTS}

Rules:
- Write in ${language}.
- 80 to 140 words in the body. Plain text, short paragraphs, no bullet list, no bold, no emoji.
- Start with a simple greeting ("Bonjour," / "Guten Tag" / "Buongiorno,"). Never congratulate, never speak of a launch, a creation, a new or young company, a start: we are not sure of its age. Never say how you found them: no register, no FOSC/SHAB/FUSC, no website, no "we saw".
- Then one or two sentences on what usually takes time in THEIR line of work (deduce it from the purpose), and how Cantia helps with that, using only the facts above. If Cantia is not really made for their trade, say so honestly in a few words and talk only about the administrative side (quotes, invoices, payroll, VAT).
- Then the offer: 3 months offered instead of the usual 14 days, the code written exactly as given, valid until the date given, nothing charged during the 3 months. Put the literal placeholder [LIEN] alone on its own line right after the offer: it becomes the sign-up link.
- End with one sentence saying that a simple reply "non merci" (in the e-mail's language) is enough and they will not be written to again.
- No signature, no name, no "Bastien": the e-mail ends after that sentence and is signed "Cantia" automatically.
- Never invent a number, a customer, a review, a price, a feature or a fact about the business.
- Subject: 3 to 8 words, natural, about their line of work (it may contain the company name), no "offer", "promo", "free", "gratuit", no congratulations.

Answer with JSON only: {"subject": "...", "body": "..."}`;
}

function fallbackDraft(c: Company, code: string, until: string): { subject: string; body: string } {
  const lang = langOf(c);
  if (lang === 'de') {
    return {
      subject: `Offerten und Rechnungen für ${c.name}`,
      body: `Guten Tag\n\nCantia ist eine Schweizer Software für KMU: Offerten und QR-Rechnungen, Stunden und Löhne, die MWST-Abrechnung und der Überblick über offene Rechnungen, auf dem Telefon und am Computer.\n\nWir schenken Ihnen 3 Monate statt der üblichen 14 Tage, mit Ihrem persönlichen Code ${code} (gültig bis ${until}). In diesen 3 Monaten wird nichts belastet.\n\n[LIEN]\n\nFalls das nichts für Sie ist, genügt ein kurzes «Nein danke», und wir melden uns nicht mehr.`,
    };
  }
  if (lang === 'it') {
    return {
      subject: `Preventivi e fatture per ${c.name}`,
      body: `Buongiorno,\n\nCantia è un software svizzero per le PMI: preventivi e fatture con QR, ore e salari, il rendiconto IVA e la visione sulle fatture aperte, dal telefono e dal computer.\n\nVi offriamo 3 mesi invece dei soliti 14 giorni, con il vostro codice personale ${code} (valido fino al ${until}). In questi 3 mesi non viene addebitato nulla.\n\n[LIEN]\n\nSe non fa per voi, basta rispondere «no grazie» e non vi scriveremo più.`,
    };
  }
  return {
    subject: `Devis et factures pour ${c.name}`,
    body: `Bonjour,\n\nCantia est un logiciel suisse pour les petites entreprises : devis et factures avec QR-facture, heures et salaires, décompte TVA et suivi des factures ouvertes, depuis le téléphone comme depuis l’ordinateur.\n\nNous vous offrons 3 mois au lieu des 14 jours habituels, avec votre code personnel ${code} (valable jusqu’au ${until}). Rien n’est débité pendant ces 3 mois.\n\n[LIEN]\n\nSi ce n’est pas pour vous, un simple « non merci » suffit et nous ne vous écrirons plus.`,
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
    if (/registre|fosc|fusc|shab|handelsregister|registro di commercio|bastien|f[ée]licit|gratul|complimenti|congrat|lancement|gr[üu]ndung|fondazione|neu gegr|nouvelle entreprise|jeune entreprise/i.test(subject + body)) return fallbackDraft(c, code, until);
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

async function newCode(admin: SupabaseClient, c: Company): Promise<string | null> {
  for (let i = 0; i < 3; i++) {
    const code = makeCode(c.name);
    const { error } = await admin.from('trial_offer_codes').insert({ code, registry_id: c.id, trial_days: TRIAL_DAYS });
    if (!error) return code;
  }
  return null;
}

// Writes (or writes again) the e-mail of one company and keeps it as a
// draft, in the language asked by the admin, else the one of its purpose.
async function draftFor(admin: SupabaseClient, c: Company, forceLang?: Lang): Promise<Company | null> {
  const code = c.outreach_code ?? (await newCode(admin, c));
  if (!code) return null;
  const language = forceLang ?? detectLang(c.purpose) ?? langOf(c);
  const draft = await writeDraft({ ...c, language }, code);
  const now = new Date().toISOString();
  const { error } = await admin
    .from('registry_companies')
    .update({ language, outreach_status: 'draft', outreach_subject: draft.subject, outreach_body: draft.body, outreach_code: code, outreach_prepared_at: now, outreach_error: null, updated_at: now })
    .eq('id', c.id);
  if (error) return null;
  return { ...c, language, outreach_status: 'draft', outreach_subject: draft.subject, outreach_body: draft.body, outreach_code: code, outreach_prepared_at: now };
}

const SURE = ['confirmed', 'manual'];

async function prepare(admin: SupabaseClient): Promise<{ sent: number; drafted: number; waiting: number }> {
  // 1. Drafts written with the former text: written again, same code.
  const { data: stale } = await admin.from('registry_companies').select(SELECT).eq('outreach_status', 'draft').lt('outreach_prepared_at', TEXT_SINCE);
  for (const c of (stale ?? []) as Company[]) await draftFor(admin, c);

  // 2. Companies not written to yet.
  const { data: fresh } = await admin
    .from('registry_companies')
    .select(SELECT)
    .not('email', 'is', null)
    .in('email_check', ['confirmed', 'manual', 'probable', 'doubtful'])
    .is('outreach_status', null)
    .eq('status', 'new')
    .is('unsubscribed_at', null)
    .in('canton', ROMANDIE)
    .order('email_checked_at', { ascending: true, nullsFirst: false })
    .limit(200);
  const list = (fresh ?? []) as Company[];
  const blocked = await blockedEmails(admin, list.map((c) => c.email!).filter(Boolean));

  // 3. Sure addresses: sent now, within the day's limit (drafts of sure
  //    addresses left from before are sent too).
  const { data: sureDrafts } = await admin.from('registry_companies').select(SELECT).eq('outreach_status', 'draft').in('email_check', SURE);
  const { count: sentToday } = await admin.from('registry_companies').select('id', { count: 'exact', head: true }).gte('outreach_sent_at', zurichDayStart());
  let room = Math.max(0, MAX_PER_DAY - (sentToday ?? 0));
  const sentNames: string[] = [];
  const sureQueue: Company[] = [...((sureDrafts ?? []) as Company[])];
  for (const c of list) {
    if (!c.email || blocked.has(c.email) || !SURE.includes(c.email_check ?? '')) continue;
    blocked.add(c.email);
    sureQueue.push(c);
  }
  for (const c of sureQueue) {
    if (room <= 0) break;
    const ready = c.outreach_status === 'draft' && c.outreach_body ? c : await draftFor(admin, c);
    if (!ready) continue;
    if (await sendOne(admin, ready)) {
      room--;
      sentNames.push(`${ready.name}${ready.town ? `, ${ready.town}` : ''}`);
    }
  }

  // 4. Addresses not certain: drafts for the admin, 20 waiting at most.
  const { count: waitingBefore } = await admin.from('registry_companies').select('id', { count: 'exact', head: true }).eq('outreach_status', 'draft');
  let slots = Math.max(0, MAX_WAITING - (waitingBefore ?? 0));
  let drafted = 0;
  for (const c of list) {
    if (slots <= 0) break;
    if (!c.email || blocked.has(c.email) || SURE.includes(c.email_check ?? '')) continue;
    blocked.add(c.email);
    if (await draftFor(admin, c)) {
      slots--;
      drafted++;
    }
  }

  // 5. The morning e-mail to the admin.
  const { data: waiting } = await admin
    .from('registry_companies')
    .select('name, town, outreach_subject, email_evidence')
    .eq('outreach_status', 'draft')
    .order('outreach_prepared_at', { ascending: true });
  const n = waiting?.length ?? 0;
  const to = Deno.env.get('WEEKLY_REPORT_EMAIL');
  if ((n > 0 || sentNames.length > 0) && to) {
    const sentHtml = sentNames.length
      ? `<p style="margin:0 0 8px;"><strong>${sentNames.length} envoyé${sentNames.length > 1 ? 's' : ''} ce matin</strong> (e-mail confirmé sur le site de l’entreprise) :</p><ul style="padding-left:18px;margin:0 0 20px;">${sentNames.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`
      : '';
    const waitHtml = n
      ? `<p style="margin:0 0 8px;"><strong>${n} à valider</strong> (e-mail pas certain) :</p><ul style="padding-left:18px;margin:0 0 20px;">${(waiting ?? [])
          .map((w) => `<li style="margin:0 0 8px;"><strong>${escapeHtml(w.name)}</strong>${w.town ? `, ${escapeHtml(w.town)}` : ''}<br><span style="color:#6b6f65;">${escapeHtml(w.email_evidence ?? w.outreach_subject ?? '')}</span></li>`)
          .join('')}</ul>
<p style="margin:0 0 20px;"><a href="${APP_URL}/registre?onglet=envois" style="display:inline-block;padding:11px 22px;border-radius:999px;background:#23251f;color:#ffffff;font-weight:600;text-decoration:none;">Relire et envoyer</a></p>`
      : '';
    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#23251f;max-width:560px;">
${sentHtml}${waitHtml}<p style="margin:0;font-size:13px;color:#6b6f65;">Au plus ${MAX_PER_DAY} envois par jour : le reste part les matins suivants.</p>
</div>`;
    const subject = [sentNames.length ? `${sentNames.length} e-mail${sentNames.length > 1 ? 's' : ''} de bienvenue envoyé${sentNames.length > 1 ? 's' : ''}` : '', n ? `${n} à valider` : ''].filter(Boolean).join(' · ');
    await sendMail(to, subject, { html, text: `${sentNames.length} envoyé(s), ${n} à valider : ${APP_URL}/registre?onglet=envois` });
  }
  return { sent: sentNames.length, drafted, waiting: n };
}

// ─── Requests from cantia.ch/nouvelle-entreprise ────────────────────────────

const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function receiveRequest(admin: SupabaseClient, body: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  const name = clean(body.name, 120);
  const company = clean(body.company, 160);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 40) || null;
  const message = clean(body.message, 1500) || null;
  const locale = body.locale === 'de' || body.locale === 'it' ? body.locale : 'fr';
  if (!name || !company || !EMAIL_RE.test(email)) return { ok: false, error: 'champs manquants' };
  // The same address twice in a day: one request is enough. Many requests
  // in an hour: someone is playing with the form.
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count: sameEmail } = await admin.from('trial_requests').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', dayAgo);
  if ((sameEmail ?? 0) > 0) return { ok: true };
  const { count: lastHour } = await admin.from('trial_requests').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 3600000).toISOString());
  if ((lastHour ?? 0) >= 30) return { ok: false, error: 'trop de demandes' };
  const { error } = await admin.from('trial_requests').insert({ name, company, email, phone, message, locale });
  if (error) return { ok: false, error: error.message };
  const to = Deno.env.get('WEEKLY_REPORT_EMAIL');
  if (to) {
    const rows = [
      `<strong>${escapeHtml(company)}</strong>`,
      escapeHtml(name),
      escapeHtml(email),
      phone ? escapeHtml(phone) : '',
      message ? `<em>${escapeHtml(message)}</em>` : '',
    ].filter(Boolean).join('<br>');
    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#23251f;max-width:560px;">
<p style="margin:0 0 12px;">Nouvelle demande de 3 mois offerts (cantia.ch/nouvelle-entreprise) :</p>
<p style="margin:0 0 20px;">${rows}</p>
<p style="margin:0;"><a href="${APP_URL}/registre?onglet=envois" style="display:inline-block;padding:11px 22px;border-radius:999px;background:#23251f;color:#ffffff;font-weight:600;text-decoration:none;">Envoyer le code</a></p>
</div>`;
    await sendMail(to, `Demande de 3 mois : ${company}`, { html, text: `${company} · ${name} · ${email} : ${APP_URL}/registre?onglet=envois` });
  }
  return { ok: true };
}

const REQUEST_MAIL: Record<Lang, { subject: string; hello: (n: string) => string; body: (company: string, code: string, until: string) => string; link: string; question: string }> = {
  fr: {
    subject: 'Vos 3 mois offerts sur Cantia',
    hello: (n) => `Bonjour ${n},`,
    body: (company, code, until) => `Merci pour votre demande pour ${company}. Voici votre code personnel : ${code}. Il vous donne 3 mois d’essai au lieu de 14 jours, et il est valable jusqu’au ${until}. Rien n’est débité pendant ces 3 mois.`,
    link: 'Créer mon compte avec les 3 mois offerts',
    question: 'Une question ? Répondez simplement à cet e-mail.',
  },
  de: {
    subject: 'Ihre 3 Monate Cantia geschenkt',
    hello: (n) => `Guten Tag ${n}`,
    body: (company, code, until) => `Danke für Ihre Anfrage für ${company}. Hier ist Ihr persönlicher Code: ${code}. Er gibt Ihnen 3 Monate Testphase statt 14 Tage und ist gültig bis ${until}. In diesen 3 Monaten wird nichts belastet.`,
    link: 'Konto mit 3 Monaten gratis erstellen',
    question: 'Eine Frage? Antworten Sie einfach auf diese E-Mail.',
  },
  it: {
    subject: 'I vostri 3 mesi offerti su Cantia',
    hello: (n) => `Buongiorno ${n},`,
    body: (company, code, until) => `Grazie per la richiesta per ${company}. Ecco il vostro codice personale: ${code}. Vi dà 3 mesi di prova invece di 14 giorni ed è valido fino al ${until}. In questi 3 mesi non viene addebitato nulla.`,
    link: 'Creare il conto con i 3 mesi offerti',
    question: 'Una domanda? Rispondete semplicemente a questa e-mail.',
  },
};

async function sendRequestCode(admin: SupabaseClient, id: string): Promise<{ ok: boolean; code?: string; error?: string }> {
  const { data: r } = await admin.from('trial_requests').select('*').eq('id', id).maybeSingle();
  if (!r) return { ok: false, error: 'demande introuvable' };
  if (r.status === 'sent' && r.code) return { ok: true, code: r.code };
  const now = new Date();
  let code: string | null = null;
  for (let i = 0; i < 3 && !code; i++) {
    const candidate = makeCode(r.company);
    const { error } = await admin.from('trial_offer_codes').insert({ code: candidate, trial_days: TRIAL_DAYS, expires_at: new Date(now.getTime() + VALID_DAYS * 86400000).toISOString() });
    if (!error) code = candidate;
  }
  if (!code) return { ok: false, error: 'code impossible à créer' };
  const lang: Lang = r.locale === 'de' || r.locale === 'it' ? r.locale : 'fr';
  const t = REQUEST_MAIL[lang];
  const until = validUntil(lang, now);
  const link = offerLink(code);
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#23251f;max-width:560px;">
<p style="margin:0 0 16px;">${escapeHtml(t.hello(r.name))}</p>
<p style="margin:0 0 16px;">${escapeHtml(t.body(r.company, code, until))}</p>
<p style="margin:0 0 16px;"><a href="${escapeHtml(link)}" style="color:#9c5733;font-weight:600;">${escapeHtml(t.link)}</a></p>
<p style="margin:0 0 16px;">${escapeHtml(t.question)}</p>
<p style="margin:24px 0 0;">Cantia · cantia.ch</p>
</div>`;
  const text = `${t.hello(r.name)}\n\n${t.body(r.company, code, until)}\n\n${link}\n\n${t.question}\n\nCantia · cantia.ch`;
  const sent = await sendMail(r.email, t.subject, { html, text });
  if (!sent.ok) return { ok: false, error: sent.error };
  await admin.from('trial_requests').update({ status: 'sent', code, sent_at: now.toISOString() }).eq('id', id);
  return { ok: true, code };
}

// Sends one draft; true when it left.
async function sendOne(admin: SupabaseClient, c: Company): Promise<boolean> {
  const now = new Date();
  if (!c.email || c.unsubscribed_at || !c.outreach_code || !c.outreach_subject || !c.outreach_body) {
    await admin.from('registry_companies').update({ outreach_status: 'failed', outreach_error: 'brouillon incomplet', updated_at: now.toISOString() }).eq('id', c.id);
    return false;
  }
  const r = await sendMail(c.email, c.outreach_subject, renderEmail(c));
  if (!r.ok) {
    await admin.from('registry_companies').update({ outreach_status: 'failed', outreach_error: r.error ?? 'échec', updated_at: now.toISOString() }).eq('id', c.id);
    return false;
  }
  await admin.from('trial_offer_codes').update({ expires_at: new Date(now.getTime() + VALID_DAYS * 86400000).toISOString() }).eq('code', c.outreach_code);
  await admin.from('registry_companies').update({
    outreach_status: 'sent',
    outreach_sent_at: now.toISOString(),
    outreach_error: null,
    status: 'contacted',
    contacted_at: now.toISOString(),
    updated_at: now.toISOString(),
  }).eq('id', c.id);
  return true;
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
    if (await sendOne(admin, c)) { room--; sent++; } else failed++;
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

    // The form of cantia.ch/nouvelle-entreprise: anyone.
    if (body.action === 'request') return json(await receiveRequest(admin, body));

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
    // « Traduire » : the draft written again in another language, same code.
    if (body.action === 'rewrite' && typeof body.id === 'string' && (body.lang === 'fr' || body.lang === 'de' || body.lang === 'it')) {
      const { data } = await admin.from('registry_companies').select(SELECT).eq('id', body.id).in('outreach_status', ['draft', 'failed']).maybeSingle();
      if (!data) return json({ error: 'brouillon introuvable' }, 404);
      const done = await draftFor(admin, data as Company, body.lang);
      return json(done ? { ok: true, subject: done.outreach_subject, body: done.outreach_body, language: done.language } : { error: 'réécriture impossible' });
    }
    if (body.action === 'prepare_now') return json(await prepare(admin));
    if (body.action === 'request_send' && typeof body.id === 'string') return json(await sendRequestCode(admin, body.id));
    if (body.action === 'request_ignore' && typeof body.id === 'string') {
      await admin.from('trial_requests').update({ status: 'ignored' }).eq('id', body.id).eq('status', 'new');
      return json({ ok: true });
    }
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
