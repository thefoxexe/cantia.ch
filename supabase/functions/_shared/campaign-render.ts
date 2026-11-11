// Shared by send-newsletter-campaign and dispatch-scheduled-newsletter-send:
// who each recipient is (name, company, plan, language) and the message
// they get — the FR original or their language's version, with the
// placeholders filled in.
//
// Placeholders, in subject and HTML: {{prenom}}, {{nom}}, {{entreprise}},
// {{plan}}. A fallback after a pipe is used when the value is missing:
// "Bonjour {{prenom|à vous}}".

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export type Locale = 'fr' | 'de' | 'it';
export interface Variant {
  subject: string;
  html: string;
}
export type Variants = Partial<Record<'de' | 'it', Variant>>;

export interface Recipient {
  userId: string;
  email: string;
  firstName: string;
  fullName: string;
  company: string;
  planId: string | null;
  locale: Locale;
}

const PLAN_NAMES: Record<string, Record<Locale, string>> = {
  solo: { fr: 'Essentiel', de: 'Basis', it: 'Essenziale' },
  equipe: { fr: 'Équipe', de: 'Team', it: 'Team' },
  pro: { fr: 'Entreprise', de: 'Entreprise', it: 'Entreprise' },
  decouverte: { fr: 'Découverte', de: 'Discovery', it: 'Scoperta' },
  custom: { fr: 'Sur mesure', de: 'Massgeschneidert', it: 'Su misura' },
  illimite: { fr: 'Sur mesure', de: 'Massgeschneidert', it: 'Su misura' },
};

function asLocale(v: unknown): Locale {
  return v === 'de' || v === 'it' ? v : 'fr';
}

// E-mail of each given user: one query (service_user_emails, service role
// only), then one by one with getUserById for anyone it did not return.
// Listing all accounts with listUsers failed as a whole (one bad auth row is
// enough) and silently skipped every recipient.
export async function authEmailsFor(admin: SupabaseClient, userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const ids = Array.from(new Set(userIds));
  for (let i = 0; i < ids.length; i += 500) {
    const { data, error } = await admin.rpc('service_user_emails', { p_ids: ids.slice(i, i + 500) });
    if (error) console.error('service_user_emails failed', error.message);
    for (const row of (data ?? []) as { id: string; email: string }[]) if (row.email) map.set(row.id, row.email);
  }
  const missing = ids.filter((id) => !map.has(id));
  for (let i = 0; i < missing.length; i += 10) {
    await Promise.all(
      missing.slice(i, i + 10).map(async (id) => {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error) console.error('getUserById failed', id, error.message);
        else if (data?.user?.email) map.set(id, data.user.email);
      }),
    );
  }
  return map;
}

// One entry per user with an e-mail. A user in several companies is shown
// with the one they own, else the oldest membership.
export async function loadRecipients(admin: SupabaseClient, userIds: string[]): Promise<Map<string, Recipient>> {
  const emails = await authEmailsFor(admin, userIds);
  const out = new Map<string, Recipient>();
  const rank = new Map<string, number>();
  for (let i = 0; i < userIds.length; i += 200) {
    const ids = userIds.slice(i, i + 200);
    const { data } = await admin
      .from('organization_members')
      .select('user_id, full_name, role, locale, created_at, organizations(name, plan_id, locale)')
      .in('user_id', ids)
      .order('created_at', { ascending: true });
    for (const m of (data ?? []) as any[]) {
      const email = emails.get(m.user_id);
      if (!email) continue;
      const r = m.role === 'owner' ? 0 : 1;
      if (rank.has(m.user_id) && rank.get(m.user_id)! <= r) continue;
      rank.set(m.user_id, r);
      const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
      const fullName = String(m.full_name ?? '').trim();
      out.set(m.user_id, {
        userId: m.user_id,
        email,
        fullName,
        firstName: fullName.split(/\s+/)[0] ?? '',
        company: String(org?.name ?? '').trim(),
        planId: org?.plan_id ?? null,
        locale: asLocale(m.locale || org?.locale),
      });
    }
  }
  // Fiduciaries and partners have no company membership: their name, firm
  // and language come from their own space.
  const rest = userIds.filter((id) => !out.has(id) && emails.has(id));
  for (let i = 0; i < rest.length; i += 200) {
    const ids = rest.slice(i, i + 200);
    const [{ data: fids }, { data: partners }] = await Promise.all([
      admin.from('fiduciary_members').select('user_id, first_name, last_name, fiduciary_firms(name, locale)').in('user_id', ids),
      admin.from('partner_profiles').select('user_id, first_name, last_name, company_name, locale').in('user_id', ids),
    ]);
    for (const f of (fids ?? []) as any[]) {
      const firm = Array.isArray(f.fiduciary_firms) ? f.fiduciary_firms[0] : f.fiduciary_firms;
      const fullName = [f.first_name, f.last_name].filter(Boolean).join(' ').trim();
      out.set(f.user_id, { userId: f.user_id, email: emails.get(f.user_id)!, fullName, firstName: String(f.first_name ?? '').trim(), company: String(firm?.name ?? '').trim(), planId: null, locale: asLocale(firm?.locale) });
    }
    for (const p of (partners ?? []) as any[]) {
      if (out.has(p.user_id)) continue;
      const fullName = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
      out.set(p.user_id, { userId: p.user_id, email: emails.get(p.user_id)!, fullName, firstName: String(p.first_name ?? '').trim(), company: String(p.company_name ?? '').trim(), planId: null, locale: asLocale(p.locale) });
    }
  }
  // Users without a membership still get the FR message, unpersonalised.
  for (const id of userIds) {
    if (out.has(id)) continue;
    const email = emails.get(id);
    if (email) out.set(id, { userId: id, email, fullName: '', firstName: '', company: '', planId: null, locale: 'fr' });
  }
  return out;
}

// Addresses typed in the composer for people without a Cantia account
// (prospects, fiduciaries to invite): cleaned, at most 200, in the language
// given (French otherwise).
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;
export const MAX_EXTERNAL = 200;
export function cleanExternal(raw: unknown): Recipient[] {
  const out: Recipient[] = [];
  const seen = new Set<string>();
  for (const r of Array.isArray(raw) ? raw : []) {
    const email = String((r as any)?.email ?? '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    const fullName = String((r as any)?.name ?? '').trim().slice(0, 120);
    out.push({
      userId: `external:${email}`,
      email,
      fullName,
      firstName: fullName.split(/\s+/)[0] ?? '',
      company: String((r as any)?.company ?? '').trim().slice(0, 160),
      planId: null,
      locale: asLocale((r as any)?.locale),
    });
    if (out.length >= MAX_EXTERNAL) break;
  }
  return out;
}

// The external addresses not already in the list (same e-mail as an
// account), appended to it.
export function appendExternal(list: Recipient[], external: Recipient[]): void {
  const known = new Set(list.map((r) => r.email.toLowerCase()));
  for (const e of external) {
    if (known.has(e.email)) continue;
    known.add(e.email);
    list.push(e);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fill(template: string, r: Recipient, html: boolean): string {
  const values: Record<string, string> = {
    prenom: r.firstName,
    nom: r.fullName,
    entreprise: r.company,
    plan: r.planId ? PLAN_NAMES[r.planId]?.[r.locale] ?? '' : '',
  };
  return template.replace(/\{\{\s*(prenom|nom|entreprise|plan)\s*(?:\|([^}]*))?\}\}/gi, (_m, key: string, fallback?: string) => {
    const v = values[key.toLowerCase()] || (fallback ?? '').trim();
    return html ? escapeHtml(v) : v;
  });
}

export function renderFor(r: Recipient, base: Variant, variants: Variants | null | undefined): Variant {
  const v = r.locale !== 'fr' ? variants?.[r.locale] : undefined;
  const msg = v && v.html?.trim() && v.subject?.trim() ? v : base;
  return { subject: fill(msg.subject, r, false), html: fill(msg.html, r, true) };
}

export function cleanVariants(raw: unknown): Variants | null {
  if (!raw || typeof raw !== 'object') return null;
  const out: Variants = {};
  for (const l of ['de', 'it'] as const) {
    const v = (raw as any)[l];
    if (v && typeof v.subject === 'string' && typeof v.html === 'string' && v.subject.trim() && v.html.trim()) out[l] = { subject: v.subject, html: v.html };
  }
  return Object.keys(out).length ? out : null;
}
