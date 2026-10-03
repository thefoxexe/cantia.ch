import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { DateField } from '../../../components/DateField';
import { categoryLabel, CATEGORIES, dueOccurrences, filterEntries, proofStatus, summarize, type LedgerEntry, type LedgerKind, type ProofKind, type RecurringRule } from '../../../lib/admin/ledgerCalc';
import {
  attachGeneratedReceipt,
  deleteLedgerEntry,
  importStripe,
  ledgerV2,
  listLedger,
  listRecurring,
  postDueRecurring,
  receiptUrl,
  saveLedgerEntry,
  uploadReceipt,
} from '../../../lib/admin/ledgerApi';
import { buildInternalReceipt, type LedgerHolder } from '../../../lib/admin/ledgerPdf';
import { downloadPdf } from '../../../lib/pdf/simplePdf';
import { confirm } from '../../../lib/confirm';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { Btn, CategoryIcon, chf, Chip, kit, MONTHS_LONG, MonthChart, parseAmount, ProofBadge, Segmented, swiss, todayIso, usePhone } from '../../../components/admin/ledger/kit';
import { EntryModal, emptyEntry, type EntryDraft } from '../../../components/admin/ledger/EntryModal';
import { RecurringTab } from '../../../components/admin/ledger/RecurringTab';
import { ProofGuide } from '../../../components/admin/ledger/ProofGuide';
import { ExportDialog } from '../../../components/admin/ledger/ExportDialog';

// Admin › Ma gestion › Comptabilité: the self-employed bookkeeping of the
// platform owner. Journal of income and expenses with receipts, recurring
// entries, how each expense is justified, and the report (PDF) for the AVS
// or the tax office.

const HOLDER_KEY = 'cantia.admin.ledger.holder';
type Tab = 'journal' | 'recurrents' | 'justificatifs';
type Period = { key: string; from: string; to: string };

function readHolder(): LedgerHolder {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(HOLDER_KEY) : null;
    if (raw) return { name: '', address: '', activity: '', avsNumber: '', vatNumber: '', ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { name: '', address: '', activity: '', avsNumber: '', vatNumber: '' };
}

function periods(today: string): (Period & { label: string })[] {
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const q = Math.floor((m - 1) / 3);
  const last = (yy: number, mm: number) => new Date(Date.UTC(yy, mm, 0)).getUTCDate();
  const p2 = (n: number) => String(n).padStart(2, '0');
  return [
    { key: `y${y}`, label: String(y), from: `${y}-01-01`, to: `${y}-12-31` },
    { key: 'month', label: 'Ce mois', from: `${y}-${p2(m)}-01`, to: `${y}-${p2(m)}-${last(y, m)}` },
    { key: 'quarter', label: `T${q + 1}`, from: `${y}-${p2(q * 3 + 1)}-01`, to: `${y}-${p2(q * 3 + 3)}-${last(y, q * 3 + 3)}` },
    { key: `y${y - 1}`, label: String(y - 1), from: `${y - 1}-01-01`, to: `${y - 1}-12-31` },
    { key: `y${y - 2}`, label: String(y - 2), from: `${y - 2}-01-01`, to: `${y - 2}-12-31` },
  ];
}

export default function AdminLedgerScreen() {
  const { phone, wide } = usePhone();
  const today = todayIso();
  const presets = useMemo(() => periods(today), [today]);
  const [period, setPeriod] = useState<Period>(presets[0]);
  const [custom, setCustom] = useState(false);
  const { from, to } = period;

  const [tab, setTab] = useState<Tab>('journal');
  const [rows, setRows] = useState<LedgerEntry[]>([]);
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [available, setAvailable] = useState(true);
  const [v2, setV2] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [kind, setKind] = useState<LedgerKind | 'all'>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [draft, setDraft] = useState<EntryDraft | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [holder, setHolder] = useState<LedgerHolder>(readHolder);
  const [showHolder, setShowHolder] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, hasV2] = await Promise.all([listLedger(from, to), ledgerV2()]);
    setRows(r.rows);
    setAvailable(r.available);
    setError(r.error);
    setV2(hasV2);
    if (hasV2) setRules((await listRecurring()).rules);
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    try {
      localStorage.setItem(HOLDER_KEY, JSON.stringify(holder));
    } catch {
      // ignore
    }
  }, [holder]);

  const filtered = useMemo(() => filterEntries(rows, { kind, categories: cats, search, missingReceipt: missingOnly }), [rows, kind, cats, search, missingOnly]);
  const isFiltered = kind !== 'all' || cats.length > 0 || !!search.trim() || missingOnly;
  const summary = useMemo(() => summarize(filtered, { from, to }), [filtered, from, to]);
  const periodSummary = useMemo(() => summarize(rows, { from, to }), [rows, from, to]);
  const dueCount = useMemo(() => rules.reduce((n, r) => n + dueOccurrences(r, today).length, 0), [rules, today]);
  const expenseCount = rows.filter((e) => e.kind === 'depense').length;
  const justifiedPct = expenseCount ? Math.round(((expenseCount - periodSummary.missingReceipts) / expenseCount) * 100) : 100;
  const catOptions = kind === 'all' ? [...CATEGORIES.recette.map((c) => ({ ...c, kind: 'recette' as const })), ...CATEGORIES.depense.map((c) => ({ ...c, kind: 'depense' as const }))] : CATEGORIES[kind].map((c) => ({ ...c, kind }));

  // Journal grouped by month (newest first).
  const groups = useMemo(() => {
    const map = new Map<string, LedgerEntry[]>();
    for (const e of filtered) {
      const k = e.entry_date.slice(0, 7);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  }, [filtered]);

  function openNew(k: LedgerKind) {
    setDraftError(null);
    setDraft(emptyEntry(k));
  }

  function edit(e: LedgerEntry) {
    setDraftError(null);
    setDraft({ ...e, counterparty: e.counterparty ?? '', reference: e.reference ?? '', notes: e.notes ?? '', amountText: String(e.amount_chf) });
  }

  async function persist(d: EntryDraft): Promise<LedgerEntry | null> {
    const amount = parseAmount(d.amountText);
    if (!d.label.trim()) return setDraftError('Le libellé est obligatoire.'), null;
    if (!Number.isFinite(amount) || amount <= 0) return setDraftError('Montant invalide.'), null;
    setSaving(true);
    const { entry, error: err } = await saveLedgerEntry({ ...d, amount_chf: amount });
    setSaving(false);
    if (err) return setDraftError(err), null;
    return entry;
  }

  async function save() {
    if (!draft) return;
    if (await persist(draft)) {
      setDraft(null);
      load();
    }
  }

  async function remove(entry: LedgerEntry) {
    if (!(await confirm('Supprimer cette écriture ?', `${entry.label} · CHF ${chf(entry.amount_chf)}`))) return;
    const { error: err } = await deleteLedgerEntry(entry);
    if (err) setError(err);
    setDraft(null);
    load();
  }

  async function pickReceipt() {
    if (!draft) return;
    const picked = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.[0]) return;
    const a = picked.assets[0];
    setSaving(true);
    const { path, error: err } = await uploadReceipt(a.uri, a.name, a.mimeType ?? null, draft.entry_date);
    setSaving(false);
    if (err || !path) return setDraftError(err ?? 'Envoi impossible');
    setDraft({ ...draft, receipt_path: path, proof: null });
  }

  async function internalReceipt(reason: string) {
    if (!draft) return;
    const saved = await persist(draft);
    if (!saved) return;
    const { pdf, file } = buildInternalReceipt(saved, holder, reason.trim());
    setSaving(true);
    const { path, error: err } = await attachGeneratedReceipt(saved, pdf, file);
    setSaving(false);
    if (err || !path) return setDraftError(err ?? 'Quittance impossible');
    downloadPdf(pdf, file);
    setDraft(null);
    setNotice('Quittance interne créée, jointe à l’écriture et téléchargée : imprimez-la, signez-la et gardez-la avec le relevé.');
    load();
  }

  async function openReceipt(path: string) {
    const url = await receiptUrl(path);
    if (url) Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
  }

  async function setProof(e: LedgerEntry, proof: ProofKind) {
    const { error: err } = await saveLedgerEntry({ ...e, proof });
    if (err) setError(err);
    load();
  }

  async function runImport() {
    setImporting(true);
    const { added, error: err } = await importStripe();
    setImporting(false);
    setNotice(err ? `Import Stripe : ${err}` : added ? `${added} écriture(s) importée(s) depuis Stripe.` : 'Rien de nouveau dans Stripe.');
    load();
  }

  async function postDue() {
    setPosting(true);
    const { added, error: err } = await postDueRecurring(rules, today);
    setPosting(false);
    setNotice(err ? `Récurrents : ${err}` : `${added} écriture(s) récurrente(s) ajoutée(s) au journal.`);
    load();
  }

  const resetFilters = () => (setKind('all'), setCats([]), setSearch(''), setMissingOnly(false));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={[styles.page, { paddingHorizontal: phone ? spacing.lg : spacing.xl }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: phone ? '100%' : 280, gap: 4 }}>
            <Text style={kit.eyebrow}>Ma gestion · indépendant</Text>
            <Text style={[kit.display, { fontSize: phone ? 34 : 42 }]}>Comptabilité</Text>
            <Text style={[kit.muted, { maxWidth: 620 }]}>Recettes, dépenses et justificatifs. Le rapport PDF justifie votre bénéfice auprès de la caisse AVS ou des impôts.</Text>
          </View>
          <View style={[kit.row, phone && { width: '100%' }]}>
            <Btn icon="arrow-down-left" label="Recette" variant="ok" onPress={() => openNew('recette')} grow={phone} />
            <Btn icon="arrow-up-right" label="Dépense" variant="bad" onPress={() => openNew('depense')} grow={phone} />
            {!phone ? <Btn icon="download-cloud" label={importing ? 'Import…' : 'Stripe'} onPress={runImport} disabled={importing || !available} /> : null}
            {!phone && Platform.OS === 'web' ? <Btn icon="download" label="Exporter" variant="primary" onPress={() => setExportOpen(true)} disabled={!available} /> : null}
          </View>
          {phone ? (
            <View style={[kit.row, { width: '100%' }]}>
              <Btn icon="download-cloud" label={importing ? 'Import…' : 'Stripe'} onPress={runImport} disabled={importing || !available} grow />
              {Platform.OS === 'web' ? <Btn icon="download" label="Exporter" variant="primary" onPress={() => setExportOpen(true)} disabled={!available} grow /> : null}
            </View>
          ) : null}
        </View>

        {/* Banners */}
        {!available ? (
          <View style={[kit.banner, { backgroundColor: colors.warningSoft }]}>
            <Feather name="database" size={16} color={colors.warning} />
            <Text style={[kit.body, { flex: 1 }]}>La table de la comptabilité n’existe pas encore. Collez docs/sql/a-coller-dans-supabase.sql dans Supabase › SQL Editor, puis rechargez.</Text>
          </View>
        ) : !v2 ? (
          <View style={[kit.banner, { backgroundColor: colors.warningSoft }]}>
            <Feather name="database" size={16} color={colors.warning} />
            <Text style={[kit.body, { flex: 1, minWidth: 200 }]}>Pour les récurrents et le suivi des justificatifs, collez le bloc « Récurrents et justificatifs » de docs/sql/a-coller-dans-supabase.sql dans Supabase, puis rechargez.</Text>
          </View>
        ) : null}
        {error ? <AdminErrorBanner message={error} /> : null}
        {notice ? (
          <Pressable onPress={() => setNotice(null)} style={[kit.banner, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[kit.body, { flex: 1 }]}>{notice}</Text>
            <Feather name="x" size={14} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {dueCount > 0 && tab !== 'recurrents' ? (
          <View style={[kit.banner, { backgroundColor: colors.primarySoft }]}>
            <Feather name="repeat" size={16} color={colors.primaryDark} />
            <Text style={[kit.body, { flex: 1, minWidth: 180, color: colors.primaryDark }]}>{dueCount} écriture(s) récurrente(s) à comptabiliser.</Text>
            <Btn label="Voir" variant="ghost" onPress={() => setTab('recurrents')} />
            <Btn icon="check-circle" label={posting ? '…' : 'Comptabiliser'} variant="primary" onPress={postDue} disabled={posting} />
          </View>
        ) : null}

        {/* Period */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}>
          {presets.map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              active={!custom && period.key === p.key}
              onPress={() => {
                setCustom(false);
                setPeriod(p);
              }}
            />
          ))}
          <Chip icon="calendar" label="Période…" active={custom} onPress={() => setCustom(true)} />
        </ScrollView>
        {custom ? (
          <View style={[kit.row, { alignItems: 'flex-end' }]}>
            <View style={{ flexGrow: 1, flexBasis: 150, minWidth: 0 }}>
              <DateField label="Du" value={from} onChange={(v) => v && setPeriod({ key: 'custom', from: v, to: v > to ? v : to })} />
            </View>
            <View style={{ flexGrow: 1, flexBasis: 150, minWidth: 0 }}>
              <DateField label="Au" value={to} onChange={(v) => v && setPeriod({ key: 'custom', from: v < from ? v : from, to: v })} />
            </View>
          </View>
        ) : null}

        {/* Result + proofs health */}
        <View style={[styles.split, wide && { flexDirection: 'row' }]}>
          <View style={[styles.hero, wide && { flex: 1.6 }]}>
            <View style={{ gap: 2 }}>
              <Text style={[kit.eyebrow, { color: '#E8C9A8' }]}>
                {periodSummary.profit >= 0 ? 'Bénéfice' : 'Perte'} · {swiss(from)} → {swiss(to)}
              </Text>
              <Text style={[kit.display, { color: '#FBF6EE', fontSize: phone ? 34 : 44 }]}>CHF {chf(periodSummary.profit)}</Text>
            </View>
            <View style={styles.heroStats}>
              <HeroStat label="Recettes" value={chf(periodSummary.income)} color="#9FD3B5" />
              <HeroStat label="Dépenses" value={chf(periodSummary.expenses)} color="#F0A99F" />
              <HeroStat label="Marge" value={`${periodSummary.marginPercent.toFixed(1).replace('.', ',')} %`} color="#FBF6EE" />
            </View>
          </View>
          <Pressable onPress={() => setTab('justificatifs')} style={({ hovered }: any) => [kit.card, wide && { flex: 1 }, hovered && { borderColor: colors.primary }]}>
            <View style={[kit.row, { justifyContent: 'space-between' }]}>
              <Text style={kit.eyebrow}>Justificatifs</Text>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </View>
            <Text style={[kit.display, { fontSize: 30, color: periodSummary.missingReceipts ? colors.warning : colors.success }]}>{justifiedPct} %</Text>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
              <View style={{ height: 8, width: `${justifiedPct}%`, backgroundColor: periodSummary.missingReceipts ? colors.warning : colors.success }} />
            </View>
            <Text style={kit.hint}>
              {periodSummary.missingReceipts ? `${periodSummary.missingReceipts} dépense(s) à justifier` : 'Toutes les dépenses ont une preuve'}
              {periodSummary.weakProofs ? ` · ${periodSummary.weakProofs} preuve(s) fragile(s)` : ''}
            </Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { key: 'journal', label: 'Journal' },
            { key: 'recurrents', label: 'Récurrents', badge: dueCount || undefined },
            { key: 'justificatifs', label: 'Justificatifs', badge: periodSummary.missingReceipts || undefined },
          ]}
        />

        {tab === 'recurrents' ? (
          <RecurringTab rules={rules} available={v2} onChanged={load} onPostDue={postDue} posting={posting} />
        ) : tab === 'justificatifs' ? (
          <ProofGuide entries={rows} onOpen={edit} onSetProof={v2 ? setProof : undefined} />
        ) : (
          <>
            <View style={[styles.split, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
              <View style={[kit.card, wide && { flex: 1.4 }]}>
                <View style={[kit.row, { justifyContent: 'space-between' }]}>
                  <Text style={kit.cardTitle}>Par mois</Text>
                  <View style={kit.row}>
                    <Legend color={colors.success} label="Recettes" />
                    <Legend color={colors.danger} label="Dépenses" />
                  </View>
                </View>
                <MonthChart months={summary.byMonth} />
              </View>
              <View style={[kit.card, wide && { flex: 1 }]}>
                <Text style={kit.cardTitle}>Par catégorie</Text>
                {summary.byCategory.length === 0 ? <Text style={kit.muted}>Aucune écriture.</Text> : null}
                {summary.byCategory.slice(0, 8).map((c) => (
                  <Pressable key={`${c.kind}:${c.category}`} onPress={() => setCats((cur) => (cur.includes(c.category) ? cur.filter((x) => x !== c.category) : [...cur, c.category]))} style={styles.catRow}>
                    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
                        <Text style={[kit.body, { flex: 1, color: cats.includes(c.category) ? colors.primary : colors.text }]} numberOfLines={1}>
                          {c.label}
                        </Text>
                        <Text style={[kit.body, { fontWeight: '700', fontVariant: ['tabular-nums'] }]}>{chf(c.total)}</Text>
                      </View>
                      <View style={styles.catTrack}>
                        <View style={{ height: 5, borderRadius: 3, width: `${Math.max(2, Math.min(100, c.share))}%`, backgroundColor: c.kind === 'recette' ? colors.success : colors.danger }} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Filters */}
            <View style={{ gap: spacing.sm }}>
              <View style={kit.row}>
                <View style={{ flexGrow: 1, flexBasis: phone ? '100%' : 300 }}>
                  <Segmented<LedgerKind | 'all'>
                    value={kind}
                    onChange={(k) => (setKind(k), setCats([]))}
                    options={[
                      { key: 'all', label: 'Tout' },
                      { key: 'recette', label: 'Recettes' },
                      { key: 'depense', label: 'Dépenses' },
                    ]}
                  />
                </View>
                <View style={[styles.search, { flexBasis: phone ? '100%' : 260 }]}>
                  <Feather name="search" size={15} color={colors.textMuted} />
                  <TextInput value={search} onChangeText={setSearch} placeholder="Rechercher" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
                  {search ? (
                    <Pressable onPress={() => setSearch('')} hitSlop={8}>
                      <Feather name="x" size={14} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: spacing.lg }}>
                <Chip small icon="alert-circle" label="À justifier" tone="bad" active={missingOnly} onPress={() => setMissingOnly((v) => !v)} />
                {catOptions.map((c) => (
                  <Chip key={`${c.kind}-${c.key}`} small label={c.label} active={cats.includes(c.key)} onPress={() => setCats((cur) => (cur.includes(c.key) ? cur.filter((x) => x !== c.key) : [...cur, c.key]))} />
                ))}
              </ScrollView>
              {isFiltered ? (
                <Pressable onPress={resetFilters} hitSlop={6}>
                  <Text style={kit.link}>
                    Effacer les filtres · {filtered.length} / {rows.length} écritures
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Journal */}
            <View style={[kit.card, { padding: 0, gap: 0, overflow: 'hidden' }]}>
              {loading ? <ActivityIndicator color={colors.primary} style={{ margin: spacing.xl }} /> : null}
              {!loading && filtered.length === 0 ? (
                <View style={{ padding: spacing.xl, alignItems: 'center', gap: spacing.sm }}>
                  <Feather name="inbox" size={26} color={colors.textMuted} />
                  <Text style={[kit.muted, { textAlign: 'center' }]}>Aucune écriture. Ajoutez une recette ou une dépense, créez vos récurrents ou importez Stripe.</Text>
                </View>
              ) : null}
              {groups.map(([month, list]) => {
                const net = list.reduce((s, e) => s + (e.kind === 'recette' ? 1 : -1) * Number(e.amount_chf), 0);
                return (
                  <View key={month}>
                    <View style={styles.monthHead}>
                      <Text style={styles.monthTitle}>
                        {MONTHS_LONG[Number(month.slice(5, 7)) - 1]} {month.slice(0, 4)}
                      </Text>
                      <Text style={[styles.monthNet, { color: net >= 0 ? colors.success : colors.danger }]}>
                        {net >= 0 ? '+' : '−'}
                        {chf(Math.abs(net))}
                      </Text>
                    </View>
                    {list.map((e) => (
                      <Pressable key={e.id} onPress={() => edit(e)} style={({ hovered }: any) => [styles.row, hovered && { backgroundColor: colors.bg }]}>
                        <CategoryIcon kind={e.kind} category={e.category} size={phone ? 36 : 38} />
                        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[kit.body, { fontWeight: '700', flexShrink: 1 }]} numberOfLines={1}>
                              {e.label}
                            </Text>
                            {e.source === 'recurrent' ? <Feather name="repeat" size={11} color={colors.textMuted} /> : null}
                          </View>
                          <Text style={kit.hint} numberOfLines={1}>
                            {[e.entry_date.slice(8, 10) + '.' + e.entry_date.slice(5, 7), categoryLabel(e.kind, e.category), e.counterparty].filter(Boolean).join(' · ')}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Text style={[styles.amount, { color: e.kind === 'recette' ? colors.success : colors.text }]}>
                            {e.kind === 'recette' ? '+' : '−'}
                            {chf(e.amount_chf)}
                          </Text>
                          {e.kind === 'depense' ? (
                            e.receipt_path ? (
                              <Pressable onPress={(ev: any) => (ev?.stopPropagation?.(), openReceipt(e.receipt_path!))} hitSlop={6}>
                                <ProofBadge entry={e} />
                              </Pressable>
                            ) : (
                              <ProofBadge entry={e} />
                            )
                          ) : null}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Report identity */}
        <View style={kit.card}>
          <Pressable onPress={() => setShowHolder((v) => !v)} style={[kit.row, { justifyContent: 'space-between' }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={kit.cardTitle}>En-tête du rapport PDF</Text>
              <Text style={kit.hint}>{holder.name ? `${holder.name}${holder.activity ? ` · ${holder.activity}` : ''}` : 'Nom, adresse, N° AVS… (gardés dans ce navigateur)'}</Text>
            </View>
            <Feather name={showHolder ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
          </Pressable>
          {showHolder ? (
            <View style={kit.row}>
              {(
                [
                  ['name', 'Titulaire (nom et prénom)'],
                  ['activity', 'Activité'],
                  ['address', 'Adresse'],
                  ['avsNumber', 'N° AVS'],
                  ['vatNumber', 'N° IDE / TVA (si assujetti)'],
                ] as [keyof LedgerHolder, string][]
              ).map(([k, label]) => (
                <View key={k} style={{ gap: 6, flexGrow: 1, flexBasis: 240, minWidth: 0 }}>
                  <Text style={kit.fieldLabel}>{label}</Text>
                  <TextInput value={holder[k]} onChangeText={(v) => setHolder((h) => ({ ...h, [k]: v }))} style={kit.input} />
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      {draft ? (
        <EntryModal
          draft={draft}
          setDraft={setDraft}
          saving={saving}
          error={draftError}
          v2={v2}
          onSave={save}
          onDelete={draft.id ? () => remove(rows.find((r) => r.id === draft.id)!) : undefined}
          onPickReceipt={pickReceipt}
          onOpenReceipt={openReceipt}
          onInternalReceipt={Platform.OS === 'web' ? internalReceipt : undefined}
          onMakeRecurring={
            v2
              ? () => {
                  setDraft(null);
                  setTab('recurrents');
                  setNotice('Créez la récurrence avec « + Dépense » ou un modèle ci-dessous.');
                }
              : undefined
          }
        />
      ) : null}
      {exportOpen ? (
        <ExportDialog initialFrom={from} initialTo={to} filter={isFiltered ? { kind, categories: cats, search, missingReceipt: missingOnly } : null} holder={holder} onClose={() => setExportOpen(false)} />
      ) : null}
    </ScrollView>
  );
}

function HeroStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: 0, minWidth: 0, gap: 2 }}>
      <Text style={[kit.eyebrow, { color: '#BFA48A', fontSize: 9.5 }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={{ color, fontSize: fontSize.md, fontWeight: '800', fontVariant: ['tabular-nums'] }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
      <Text style={kit.hint}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingTop: spacing.xl, gap: spacing.lg },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  split: { gap: spacing.lg },
  hero: { backgroundColor: colors.text, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg, justifyContent: 'space-between' },
  heroStats: { flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: spacing.md },
  catRow: { paddingVertical: 4 },
  catTrack: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  search: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, backgroundColor: colors.surface, minHeight: 44 },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 10, fontSize: fontSize.sm, color: colors.text, outlineStyle: 'none' } as any,
  monthHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: 10, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border },
  monthTitle: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  monthNet: { fontSize: fontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  amount: { fontSize: fontSize.md, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
