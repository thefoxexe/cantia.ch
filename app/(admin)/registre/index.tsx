import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { adminDisplay as displayType } from '../../../lib/adminTheme';
import { listRegistryCompanies, refreshRegistry, registryPending, updateRegistryCompany, type RegistryCompany } from '../../../lib/api/admin';
import { addToEmailList, isInEmailList } from '../../../lib/admin/emailList';

// Super Admin › Nouvelles entreprises: companies entered in the commercial
// register these last days (FOSC, fetched by the database every morning and
// on « Chercher les nouvelles »). The register holds no e-mail: « Chercher
// le site » opens a search, the address found is kept here and can be added
// to the list of E-mails.

const CANTONS = ['VS', 'VD', 'FR', 'GE', 'NE', 'JU', 'BE', 'TI'];
const DEFAULT_CANTONS = ['VS', 'VD', 'FR', 'GE', 'NE', 'JU'];
const PERIODS = [3, 7, 14, 30];

const BUILDING = ['bois', 'peinture', 'electricite', 'sanitaire', 'maconnerie', 'carrelage', 'toiture', 'renovation', 'construction'];
const TRADE_LABEL: Record<string, string> = {
  bois: 'Bois',
  peinture: 'Peinture & plâtrerie',
  electricite: 'Électricité',
  sanitaire: 'Sanitaire & chauffage',
  maconnerie: 'Maçonnerie',
  carrelage: 'Carrelage & sols',
  toiture: 'Toiture',
  renovation: 'Rénovation',
  construction: 'Construction',
  nettoyage: 'Nettoyage',
  paysagisme: 'Paysagisme',
  fiduciaire: 'Fiduciaire',
  ingenieur: 'Ingénieurs & architectes',
};
// The building trades appear under « Bâtiment » once it is picked.
const TRADE_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'Tous les métiers' },
  { id: 'building', label: 'Bâtiment' },
  { id: 'nettoyage', label: 'Nettoyage' },
  { id: 'paysagisme', label: 'Paysagisme' },
  { id: 'fiduciaire', label: 'Fiduciaires' },
  { id: 'ingenieur', label: 'Ingénieurs & architectes' },
  { id: 'other', label: 'Autres' },
];
const STATUS_FILTERS: { id: RegistryCompany['status'] | 'all'; label: string }[] = [
  { id: 'new', label: 'À traiter' },
  { id: 'contacted', label: 'Contactées' },
  { id: 'ignored', label: 'Ignorées' },
  { id: 'all', label: 'Toutes' },
];
const LEGAL_FORM: Record<string, string> = {
  '0101': 'Raison individuelle',
  '0103': 'Société en nom collectif',
  '0104': 'Société en commandite',
  '0106': 'SA',
  '0107': 'Sàrl',
  '0108': 'Coopérative',
  '0109': 'Association',
  '0110': 'Fondation',
  '0151': 'Succursale',
};
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

function openUrl(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
  else Linking.openURL(url);
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' });
}

// The first person registered, and the first name when the register gives
// it apart:
//   « Lugon, Nils, de Finhaut, à Finhaut, associé… » → Nils Lugon (Nils)
//   « Houenou Isabelle Madeleine, de Waldenburg, … » → as written, no first
//   name (the registers do not mark where the family name ends).
// A company registered as a partner (« "UBA …" AG ») is skipped.
function firstPerson(persons: string | null): { display: string; first: string | null } | null {
  const first = persons?.split(/;\s*|,?\s+et\s+(?=[A-ZÀ-Ý])/)[0]?.trim();
  if (!first || first.startsWith('"') || first.startsWith('«')) return null;
  const parts = first.split(/,\s*/);
  const origin = /^(de|du|des|d’|d'|von|vom|da|di|citoyen|citoyenne|ressortissant|ressortissante|cittadin|Staatsangehörige)\b/i;
  if (parts.length >= 3 && parts[1] && !origin.test(parts[1])) return { display: `${parts[1]} ${parts[0]}`, first: parts[1].split(/\s+/)[0] };
  return parts[0] ? { display: parts[0], first: null } : null;
}

function personCount(persons: string | null): number {
  return persons ? persons.split(/;\s*/).filter(Boolean).length : 0;
}

export default function AdminRegistry() {
  const [rows, setRows] = useState<RegistryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantons, setCantons] = useState<string[]>([]);
  const [days, setDays] = useState(7);
  const [trade, setTrade] = useState('all');
  const [status, setStatus] = useState<RegistryCompany['status'] | 'all'>('new');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(40);
  const [searching, setSearching] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const { rows: r, error: err } = await listRegistryCompanies(31);
    setRows(r);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    registryPending().then((n) => (n > 0 ? watch() : null));
    return () => {
      if (poll.current) clearInterval(poll.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  // While the database is still fetching, the list refreshes every 5 s.
  function watch() {
    if (poll.current) clearInterval(poll.current);
    setSearching(1);
    poll.current = setInterval(async () => {
      const n = await registryPending();
      await load();
      if (n === 0) {
        if (poll.current) clearInterval(poll.current);
        poll.current = null;
        setSearching(null);
      } else setSearching(n);
    }, 5000);
  }

  async function search() {
    setError(null);
    const { error: err } = await refreshRegistry(cantons.length ? cantons : DEFAULT_CANTONS, days);
    if (err) {
      setError(err);
      return;
    }
    watch();
  }

  function patchRow(id: string, patch: Partial<RegistryCompany>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function setRowStatus(r: RegistryCompany, next: RegistryCompany['status']) {
    patchRow(r.id, { status: next });
    const { error: err } = await updateRegistryCompany(r.id, { status: next });
    if (err) setError(err);
  }

  const lastFetch = useMemo(() => rows.reduce<string | null>((max, r) => (!max || r.fetched_at > max ? r.fetched_at : max), null), [rows]);

  const filtered = useMemo(() => {
    const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (r.publication_date < since) return false;
      if (cantons.length && !cantons.includes(r.canton)) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (trade === 'building' && !r.trades.some((t) => BUILDING.includes(t))) return false;
      if (trade === 'other' && r.trades.length) return false;
      if (trade !== 'all' && trade !== 'building' && trade !== 'other' && !r.trades.includes(trade)) return false;
      if (q && !`${r.name} ${r.town ?? ''} ${r.seat ?? ''} ${r.purpose ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, days, cantons, status, trade, query]);

  const counts = useMemo(() => {
    const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
    const base = rows.filter((r) => r.publication_date >= since && (!cantons.length || cantons.includes(r.canton)));
    return { total: base.length, building: base.filter((r) => r.trades.some((t) => BUILDING.includes(t))).length, todo: base.filter((r) => r.status === 'new').length };
  }, [rows, days, cantons]);

  return (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
      <Container style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexGrow: 1, flexBasis: 240, minWidth: 0 }}>
            <Text style={styles.title}>Nouvelles entreprises</Text>
            <Text style={styles.hint}>
              Les entreprises inscrites au registre du commerce ces derniers jours (Feuille officielle suisse du commerce). Mises à jour chaque matin
              pour la Suisse romande. Le registre ne donne pas d’e-mail : cherchez le site de l’entreprise, gardez l’adresse ici et ajoutez-la à votre
              liste d’envoi.
            </Text>
          </View>
          <Pressable onPress={search} disabled={searching !== null} style={[styles.primary, searching !== null && { opacity: 0.6 }]}>
            <Feather name="refresh-cw" size={15} color="#fff" />
            <Text style={styles.primaryText}>{searching !== null ? 'Recherche en cours…' : 'Chercher les nouvelles'}</Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>
          {counts.total} entreprise{counts.total > 1 ? 's' : ''} sur {days} jours · {counts.building} dans le bâtiment · {counts.todo} à traiter
          {lastFetch ? ` · mis à jour ${new Date(lastFetch).toLocaleString('fr-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}
        </Text>

        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Cantons</Text>
          <View style={styles.chips}>
            <Chip label="Tous" active={!cantons.length} onPress={() => setCantons([])} />
            {CANTONS.map((c) => (
              <Chip key={c} label={c} active={cantons.includes(c)} onPress={() => setCantons((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))} />
            ))}
          </View>
          <Text style={styles.filterLabel}>Inscrites depuis</Text>
          <View style={styles.chips}>
            {PERIODS.map((d) => (
              <Chip key={d} label={`${d} jours`} active={days === d} onPress={() => setDays(d)} />
            ))}
          </View>
          <Text style={styles.filterLabel}>Métier</Text>
          <View style={styles.chips}>
            {TRADE_FILTERS.map((t) => (
              <Chip key={t.id} label={t.label} active={trade === t.id || (t.id === 'building' && BUILDING.includes(trade))} onPress={() => setTrade(t.id)} />
            ))}
          </View>
          {trade === 'building' || BUILDING.includes(trade) ? (
            <View style={[styles.chips, styles.subChips]}>
              {BUILDING.map((k) => (
                <Chip key={k} label={TRADE_LABEL[k]} active={trade === k} onPress={() => setTrade(trade === k ? 'building' : k)} />
              ))}
            </View>
          ) : null}
          <Text style={styles.filterLabel}>Suivi</Text>
          <View style={styles.chips}>
            {STATUS_FILTERS.map((s) => (
              <Chip key={s.id} label={s.label} active={status === s.id} onPress={() => setStatus(s.id)} strong />
            ))}
          </View>
          <View style={styles.searchBox}>
            <Feather name="search" size={15} color={colors.textMuted} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Nom, localité, activité…" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
          </View>
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={rows.length ? 'Aucune entreprise avec ces filtres' : 'Pas encore d’entreprise'}
            subtitle={rows.length ? undefined : 'Appuyez sur « Chercher les nouvelles » : la première recherche prend une à deux minutes.'}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {filtered.slice(0, shown).map((r) => (
              <CompanyCard key={r.id} r={r} onStatus={(s) => setRowStatus(r, s)} onPatched={(p) => patchRow(r.id, p)} onError={setError} onListChanged={() => setTick((t) => t + 1)} />
            ))}
            {filtered.length > shown ? (
              <Pressable onPress={() => setShown((n) => n + 40)} style={styles.more}>
                <Text style={styles.moreText}>Afficher plus ({filtered.length - shown})</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </Container>
    </ScrollView>
  );
}

function Chip({ label, active, onPress, strong }: { label: string; active: boolean; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && (strong ? styles.chipStrong : styles.chipActive)]}>
      <Text style={[styles.chipText, active && (strong ? { color: '#fff', fontWeight: '700' } : styles.chipTextActive)]}>{label}</Text>
    </Pressable>
  );
}

function CompanyCard({
  r,
  onStatus,
  onPatched,
  onError,
  onListChanged,
}: {
  r: RegistryCompany;
  onStatus: (s: RegistryCompany['status']) => void;
  onPatched: (p: Partial<RegistryCompany>) => void;
  onError: (e: string) => void;
  onListChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(r.email ?? '');
  const [saving, setSaving] = useState(false);
  const who = firstPerson(r.persons);
  const person = who?.display ?? null;
  const others = personCount(r.persons) - 1;
  const where = [r.street, [r.zip, r.town].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const emailOk = EMAIL_RE.test(email.trim());
  const inList = isInEmailList(r.email);
  const searchName = `"${r.name}" ${r.town ?? r.seat ?? ''}`;

  async function saveEmail() {
    const v = email.trim().toLowerCase();
    if (v === (r.email ?? '')) return;
    if (v && !EMAIL_RE.test(v)) return;
    setSaving(true);
    const { error } = await updateRegistryCompany(r.id, { email: v });
    setSaving(false);
    if (error) onError(error);
    else onPatched({ email: v || null });
  }

  async function addToList() {
    const v = email.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) return;
    if (v !== (r.email ?? '')) await saveEmail();
    // The greeting uses the first name only when the register gives it.
    const ok = addToEmailList({ email: v, name: who?.first ? who.display : undefined, company: r.name, locale: r.language === 'de' || r.language === 'it' ? r.language : 'fr' });
    if (!ok) onError('La liste d’envoi est pleine (200 adresses externes).');
    onListChanged();
  }

  return (
    <View style={[styles.card, r.status === 'ignored' && { opacity: 0.6 }]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name}>{r.name}</Text>
          <Text style={styles.sub}>
            {[LEGAL_FORM[r.legal_form ?? ''] ?? null, where || r.seat, r.canton].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(r.publication_date)}</Text>
      </View>

      {r.trades.length || r.status !== 'new' ? (
        <View style={styles.tags}>
          {r.trades.map((t) => (
            <Text key={t} style={styles.tag}>
              {TRADE_LABEL[t] ?? t}
            </Text>
          ))}
          {r.status === 'contacted' ? <Text style={[styles.tag, styles.tagDone]}>Contactée</Text> : null}
          {r.status === 'ignored' ? <Text style={[styles.tag, styles.tagMuted]}>Ignorée</Text> : null}
        </View>
      ) : null}

      {r.purpose ? (
        <Pressable onPress={() => setOpen((v) => !v)}>
          <Text style={styles.purpose} numberOfLines={open ? undefined : 3}>
            {r.purpose}
          </Text>
        </Pressable>
      ) : null}
      {person ? (
        <Text style={styles.person}>
          Personne inscrite : {person}
          {others > 0 ? ` (+${others})` : ''}
        </Text>
      ) : null}
      {open && r.persons ? <Text style={styles.persons}>{r.persons}</Text> : null}
      {r.purpose || r.persons ? (
        <Pressable onPress={() => setOpen((v) => !v)} hitSlop={6}>
          <Text style={styles.link}>{open ? 'Réduire' : 'Tout afficher'}</Text>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        <Action icon="globe" label="Chercher le site" onPress={() => openUrl(`https://www.google.com/search?q=${encodeURIComponent(searchName)}`)} />
        <Action icon="phone" label="local.ch" onPress={() => openUrl(`https://www.local.ch/fr/q?what=${encodeURIComponent(r.name)}&where=${encodeURIComponent(r.town ?? '')}`)} />
        {r.uid ? <Action icon="file-text" label="Zefix" onPress={() => openUrl(`https://www.zefix.admin.ch/fr/search/entity/list?name=${encodeURIComponent(r.uid ?? r.name)}`)} /> : null}
      </View>

      <View style={styles.emailRow}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          onBlur={saveEmail}
          onSubmitEditing={saveEmail}
          placeholder="E-mail trouvé (info@…)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.emailInput, email.trim() && !emailOk && { borderColor: colors.danger }]}
        />
        <Pressable onPress={addToList} disabled={!emailOk || saving} style={[styles.addBtn, (!emailOk || saving) && { opacity: 0.45 }, inList && styles.addBtnDone]}>
          <Feather name={inList ? 'check' : 'mail'} size={14} color={inList ? colors.success : '#fff'} />
          <Text style={[styles.addBtnText, inList && { color: colors.success }]}>{inList ? 'Dans la liste d’envoi' : 'Ajouter à la liste d’envoi'}</Text>
        </Pressable>
      </View>

      <View style={styles.statusRow}>
        {r.status !== 'contacted' ? (
          <Pressable onPress={() => onStatus('contacted')} style={styles.statusBtn} hitSlop={4}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.statusText, { color: colors.success }]}>Marquer contactée</Text>
          </Pressable>
        ) : null}
        {r.status !== 'ignored' ? (
          <Pressable onPress={() => onStatus('ignored')} style={styles.statusBtn} hitSlop={4}>
            <Feather name="eye-off" size={14} color={colors.textMuted} />
            <Text style={styles.statusText}>Ignorer</Text>
          </Pressable>
        ) : null}
        {r.status !== 'new' ? (
          <Pressable onPress={() => onStatus('new')} style={styles.statusBtn} hitSlop={4}>
            <Feather name="rotate-ccw" size={14} color={colors.textMuted} />
            <Text style={styles.statusText}>Remettre à traiter</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Feather name={icon} size={13} color={colors.primary} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  title: { ...displayType, fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18, marginTop: 4, maxWidth: 680 },
  meta: { fontSize: fontSize.xs, color: colors.text, fontWeight: '600' },
  primary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  primaryText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '700' },
  filters: { gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  filterLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subChips: { paddingLeft: spacing.md, borderLeftWidth: 2, borderLeftColor: colors.primarySoft },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  chipStrong: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12.5, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, marginTop: 6, backgroundColor: colors.bg },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 9, fontSize: fontSize.sm, color: colors.text, outlineStyle: 'none' } as any,
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: 8 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
  date: { fontSize: 11.5, fontWeight: '600', color: colors.textMuted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { fontSize: 11, fontWeight: '700', color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  tagDone: { color: colors.success, backgroundColor: colors.successSoft },
  tagMuted: { color: colors.textMuted, backgroundColor: colors.bg },
  purpose: { fontSize: fontSize.sm, color: colors.text, lineHeight: 19 },
  person: { fontSize: fontSize.xs, color: colors.text, fontWeight: '600' },
  persons: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  link: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  emailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emailInput: { flexGrow: 1, flexBasis: 200, minWidth: 0, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 8, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.bg },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 9, flexGrow: 1, flexBasis: 160 },
  addBtnDone: { backgroundColor: colors.successSoft },
  addBtnText: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  statusText: { fontSize: 12.5, fontWeight: '600', color: colors.textMuted },
  more: { alignSelf: 'center', paddingHorizontal: spacing.xl, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  moreText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
});
