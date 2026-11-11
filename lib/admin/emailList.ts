import { Platform } from 'react-native';
import { supabase } from '../supabase';
import type { ExternalRecipient } from '../api/newsletterCampaign';

// The outside addresses of the e-mail being prepared (Super Admin › E-mails),
// kept in the database (admin_email_list) so the list built from a phone
// (Nouvelles entreprises) is there on the computer too. Emptied once the
// e-mail is sent.
//
// Earlier the list lived in this browser only: whatever is still there is
// moved to the database on the first load.
const LEGACY_KEY = 'cantia:admin-email-externals';
export const MAX_EXTERNAL = 200;

type Row = { email: string; name: string | null; company: string | null; locale: 'fr' | 'de' | 'it'; registry_id: string | null };

function toRow(r: ExternalRecipient, registryId?: string | null): Row {
  return {
    email: r.email.trim().toLowerCase(),
    name: r.name?.trim() || null,
    company: r.company?.trim() || null,
    locale: r.locale === 'de' || r.locale === 'it' ? r.locale : 'fr',
    registry_id: registryId ?? null,
  };
}

function legacyList(): ExternalRecipient[] {
  try {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return [];
    const raw = JSON.parse(window.localStorage.getItem(LEGACY_KEY) || '[]');
    return Array.isArray(raw) ? (raw as ExternalRecipient[]).filter((r) => r && typeof r.email === 'string') : [];
  } catch {
    return [];
  }
}

function clearLegacy() {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // nothing kept
  }
}

export async function fetchEmailList(): Promise<{ list: Map<string, ExternalRecipient>; error: string | null }> {
  const legacy = legacyList();
  if (legacy.length) {
    const { error } = await supabase.from('admin_email_list').upsert(legacy.map((r) => toRow(r)), { onConflict: 'email', ignoreDuplicates: true });
    if (!error) clearLegacy();
  }
  const { data, error } = await supabase.from('admin_email_list').select('email, name, company, locale').order('added_at', { ascending: true }).limit(MAX_EXTERNAL);
  if (error) return { list: new Map(legacy.map((r) => [r.email, r])), error: error.message };
  return {
    list: new Map(
      (data ?? []).map((r: any) => [r.email, { email: r.email, name: r.name ?? undefined, company: r.company ?? undefined, locale: r.locale } as ExternalRecipient]),
    ),
    error: null,
  };
}

// Brings the database in line with the list shown (added, changed, removed).
export async function syncEmailList(before: Map<string, ExternalRecipient>, after: Map<string, ExternalRecipient>): Promise<string | null> {
  const upserts = [...after.values()].filter((r) => {
    const b = before.get(r.email);
    return !b || b.name !== r.name || b.company !== r.company || b.locale !== r.locale;
  });
  const removed = [...before.keys()].filter((e) => !after.has(e));
  if (upserts.length) {
    const { error } = await supabase.from('admin_email_list').upsert(upserts.map((r) => toRow(r)), { onConflict: 'email' });
    if (error) return error.message;
  }
  if (removed.length) {
    const { error } = await supabase.from('admin_email_list').delete().in('email', removed);
    if (error) return error.message;
  }
  return null;
}

// From another admin page (Nouvelles entreprises). false when the list is full.
export async function addToEmailList(r: ExternalRecipient, registryId?: string): Promise<{ ok: boolean; error: string | null }> {
  const { count } = await supabase.from('admin_email_list').select('email', { count: 'exact', head: true });
  if ((count ?? 0) >= MAX_EXTERNAL) return { ok: false, error: null };
  const { error } = await supabase.from('admin_email_list').upsert(toRow(r, registryId), { onConflict: 'email' });
  return { ok: !error, error: error?.message ?? null };
}

export async function emailListAddresses(): Promise<Set<string>> {
  const { data } = await supabase.from('admin_email_list').select('email').limit(MAX_EXTERNAL);
  return new Set((data ?? []).map((r: any) => String(r.email).toLowerCase()));
}

// After a send: the register companies written to become « contactée » and
// their addresses leave the list.
export async function markEmailListSent(emails: string[]): Promise<void> {
  if (!emails.length) return;
  await supabase.rpc('admin_email_list_sent', { p_emails: emails });
}
