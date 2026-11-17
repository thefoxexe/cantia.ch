import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { listOrganizations, listUsers } from '../../lib/api/admin';
import type { AdminOrganizationSummary, AdminUserSummary } from '../../lib/types';
import { ink } from './kit';

export interface SearchPage {
  href: string;
  label: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
}

type Result =
  | { kind: 'page'; key: string; title: string; sub: string; icon: keyof typeof Feather.glyphMap; href: string }
  | { kind: 'org'; key: string; title: string; sub: string; icon: keyof typeof Feather.glyphMap; href: string }
  | { kind: 'user'; key: string; title: string; sub: string; icon: keyof typeof Feather.glyphMap; href: string };

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// One field to reach anything: a company, a person, or a page of the panel.
// On a computer it sits at the top of the side menu (« / » or Ctrl/⌘ K
// focuses it); on a phone, at the top of the « Plus » sheet.
export function AdminSearch({ pages, dark, onNavigate }: { pages: SearchPage[]; dark?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [orgs, setOrgs] = useState<AdminOrganizationSummary[]>([]);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const seq = useRef(0);

  // Ctrl/⌘ K or « / » from anywhere on the page (web).
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const term = q.trim();
    setCursor(0);
    if (term.length < 2) {
      setOrgs([]);
      setUsers([]);
      setLoading(false);
      return;
    }
    const mine = ++seq.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      const [o, u] = await Promise.all([listOrganizations(term, 6, 0), listUsers(term, 5, 0)]);
      if (mine !== seq.current) return;
      setOrgs(o.rows);
      setUsers(u.rows);
      setLoading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [q]);

  const results = useMemo<Result[]>(() => {
    const term = normalize(q.trim());
    if (term.length < 1) return [];
    const pageHits: Result[] = pages
      .filter((p) => normalize(`${p.label} ${p.desc}`).includes(term))
      .slice(0, 4)
      .map((p) => ({ kind: 'page', key: `p${p.href}`, title: p.label, sub: p.desc, icon: p.icon, href: p.href }));
    const orgHits: Result[] = orgs.map((o) => ({
      kind: 'org',
      key: `o${o.id}`,
      title: o.name,
      sub: [o.plan_name ?? 'Sans plan', o.owner_email].filter(Boolean).join(' · '),
      icon: 'briefcase',
      href: `/(admin)/organizations/${o.id}`,
    }));
    const userHits: Result[] = users.map((u) => ({
      kind: 'user',
      key: `u${u.user_id}`,
      title: u.full_name || u.email,
      sub: `${u.email} · ${u.organization_name}`,
      icon: 'user',
      href: `/(admin)/organizations/${u.organization_id}`,
    }));
    return [...orgHits, ...userHits, ...pageHits];
  }, [q, pages, orgs, users]);

  function go(r: Result) {
    setQ('');
    inputRef.current?.blur();
    onNavigate?.();
    router.push(r.href as any);
  }

  const open = focused && q.trim().length > 0;
  const fieldStyle = dark ? styles.fieldDark : styles.fieldLight;
  const textColor = dark ? ink.text : colors.text;
  const mutedColor = dark ? ink.muted : colors.textMuted;

  return (
    <View style={styles.wrap}>
      <View style={[styles.field, fieldStyle, focused && (dark ? styles.fieldDarkFocus : styles.fieldLightFocus)]}>
        <Feather name="search" size={14} color={mutedColor} />
        <TextInput
          ref={inputRef}
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher…"
          placeholderTextColor={mutedColor}
          style={[styles.input, { color: textColor }]}
          onFocus={() => setFocused(true)}
          // Leave time for a click on a result before the list closes.
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          autoCapitalize="none"
          autoCorrect={false}
          onKeyPress={(e: any) => {
            const key = e.nativeEvent?.key;
            if (key === 'ArrowDown') setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
            else if (key === 'ArrowUp') setCursor((c) => Math.max(c - 1, 0));
            else if (key === 'Escape') {
              setQ('');
              inputRef.current?.blur();
            }
          }}
          onSubmitEditing={() => {
            const r = results[cursor];
            if (r) go(r);
          }}
          accessibilityLabel="Rechercher une entreprise, une personne ou une page"
        />
        {Platform.OS === 'web' && !focused && !q ? (
          <View style={[styles.kbd, dark && styles.kbdDark]}>
            <Text style={[styles.kbdText, { color: mutedColor }]}>/</Text>
          </View>
        ) : null}
      </View>
      {open ? (
        <View style={[styles.dropdown, dark ? styles.dropdownFloating : null]}>
          {results.length === 0 ? (
            <Text style={styles.none}>{loading ? 'Recherche…' : 'Rien trouvé.'}</Text>
          ) : (
            results.map((r, i) => {
              const first = i === 0 || results[i - 1].kind !== r.kind;
              return (
                <View key={r.key}>
                  {first ? (
                    <Text style={styles.groupLabel}>{r.kind === 'org' ? 'Entreprises' : r.kind === 'user' ? 'Personnes' : 'Pages'}</Text>
                  ) : null}
                  <Pressable
                    onPress={() => go(r)}
                    onHoverIn={() => setCursor(i)}
                    style={[styles.result, i === cursor && styles.resultActive]}
                  >
                    <View style={styles.resultIcon}>
                      <Feather name={r.icon} size={13} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {r.title}
                      </Text>
                      <Text style={styles.resultSub} numberOfLines={1}>
                        {r.sub}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', zIndex: 20 },
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 36, borderWidth: 1 },
  fieldDark: { backgroundColor: ink.raised, borderColor: ink.line },
  fieldDarkFocus: { borderColor: 'rgba(217,146,95,0.6)' },
  fieldLight: { backgroundColor: colors.surface, borderColor: colors.border },
  fieldLightFocus: { borderColor: colors.primary },
  input: { flex: 1, minWidth: 0, fontSize: fontSize.sm, paddingVertical: 0, outlineStyle: 'none' } as any,
  kbd: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 0 },
  kbdDark: { borderColor: ink.line },
  kbdText: { fontSize: 11, fontWeight: '600' },
  dropdown: {
    marginTop: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingVertical: 6,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  // On the side menu the list floats over the menu, wider than it.
  dropdownFloating: { position: 'absolute', top: 38, left: 0, width: 340, maxWidth: 340 },
  none: { fontSize: fontSize.xs, color: colors.textMuted, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  groupLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 4 },
  result: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 7 },
  resultActive: { backgroundColor: colors.bg },
  resultIcon: { width: 26, height: 26, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  resultSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
});
