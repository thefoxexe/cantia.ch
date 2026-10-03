import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { Container } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { CATEGORIES, categoryLabel, filterEntries, ledgerCsv, summarize, type LedgerEntry, type LedgerKind } from '../../../lib/admin/ledgerCalc';
import { deleteLedgerEntry, importStripe, listLedger, receiptUrl, saveLedgerEntry, uploadReceipt, type LedgerInput } from '../../../lib/admin/ledgerApi';
import { downloadLedgerReport, type LedgerHolder } from '../../../lib/admin/ledgerPdf';
import { downloadText } from '../../../lib/api/closing';
import { confirm } from '../../../lib/confirm';
import { breakpoints, colors, fontSize, radius, spacing } from '../../../lib/theme';
import { displayType, monoType } from '../../../lib/marketingTheme';

// Admin › Comptabilité: the platform owner's own books as a self-employed
// person — every income and expense with its receipt, filters, the result
// by category and by month, and the yearly report (PDF) to give the AVS or
// the tax office. Stripe payments and fees import in one click.

const HOLDER_KEY = 'cantia.admin.ledger.holder';
const PAYMENT_METHODS: { key: string; label: string }[] = [
  { key: 'banque', label: 'Virement' },
  { key: 'carte', label: 'Carte' },
  { key: 'twint', label: 'TWINT' },
  { key: 'especes', label: 'Espèces' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'autre', label: 'Autre' },
];
const VAT_RATES = [0, 8.1, 2.6, 3.8];
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function chf(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}
const swiss = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
function parseSwiss(s: string): string | null {
  const t = s.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}
const todayIso = () => new Date().toISOString().slice(0, 10);

function readHolder(): LedgerHolder {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(HOLDER_KEY) : null;
    if (raw) return { name: '', address: '', activity: '', avsNumber: '', vatNumber: '', ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { name: '', address: '', activity: '', avsNumber: '', vatNumber: '' };
}

type Draft = LedgerInput & { amountText: string; dateText: string };

function emptyDraft(kind: LedgerKind): Draft {
  const d = todayIso();
  return {
    entry_date: d,
    dateText: swiss(d),
    kind,
    category: CATEGORIES[kind][0].key,
    label: '',
    counterparty: '',
    amount_chf: 0,
    amountText: '',
    vat_rate: 0,
    payment_method: kind === 'recette' ? 'banque' : 'carte',
    reference: '',
    receipt_path: null,
    notes: '',
  };
}

export default function AdminLedgerScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState<number | 'custom'>(thisYear);
  const [fromText, setFromText] = useState(`01.01.${thisYear}`);
  const [toText, setToText] = useState(`31.12.${thisYear}`);
  const from = year === 'custom' ? parseSwiss(fromText) ?? `${thisYear}-01-01` : `${year}-01-01`;
  const to = year === 'custom' ? parseSwiss(toText) ?? `${thisYear}-12-31` : `${year}-12-31`;

  const [rows, setRows] = useState<LedgerEntry[]>([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [kind, setKind] = useState<LedgerKind | 'all'>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [holder, setHolder] = useState<LedgerHolder>(readHolder);
  const [showHolder, setShowHolder] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await listLedger(from, to);
    setRows(r.rows);
    setAvailable(r.available);
    setError(r.error);
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
  const summary = useMemo(() => summarize(filtered, typeof year === 'number' ? year : undefined), [filtered, year]);
  const catOptions = kind === 'all' ? [...CATEGORIES.recette.map((c) => ({ ...c, kind: 'recette' as const })), ...CATEGORIES.depense.map((c) => ({ ...c, kind: 'depense' as const }))] : CATEGORIES[kind].map((c) => ({ ...c, kind }));

  async function save() {
    if (!draft) return;
    const date = parseSwiss(draft.dateText);
    const amount = Number(draft.amountText.replace(/[’'\s]/g, '').replace(',', '.'));
    if (!date) return setNotice('Date invalide (JJ.MM.AAAA).');
    if (!draft.label.trim()) return setNotice('Le libellé est obligatoire.');
    if (!Number.isFinite(amount) || amount <= 0) return setNotice('Montant invalide.');
    setSaving(true);
    const { error: err } = await saveLedgerEntry({ ...draft, entry_date: date, amount_chf: amount });
    setSaving(false);
    if (err) return setNotice(err);
    setDraft(null);
    setNotice(null);
    load();
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
    const { path, error: err } = await uploadReceipt(a.uri, a.name, a.mimeType ?? null, parseSwiss(draft.dateText) ?? todayIso());
    setSaving(false);
    if (err || !path) return setNotice(err ?? 'Envoi impossible');
    setDraft({ ...draft, receipt_path: path });
  }

  async function openReceipt(path: string) {
    const url = await receiptUrl(path);
    if (url) Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
  }

  async function runImport() {
    setImporting(true);
    const { added, error: err } = await importStripe();
    setImporting(false);
    setNotice(err ? `Import Stripe : ${err}` : added ? `${added} écriture(s) importée(s) depuis Stripe.` : 'Rien de nouveau dans Stripe.');
    load();
  }

  function pdf() {
    downloadLedgerReport({ entries: filtered, from, to, year: typeof year === 'number' ? year : null, holder, filtered: isFiltered });
  }

  function csv() {
    downloadText(ledgerCsv(filtered), `journal-${from}-${to}.csv`);
  }

  const edit = (e: LedgerEntry) =>
    setDraft({ ...e, counterparty: e.counterparty ?? '', reference: e.reference ?? '', notes: e.notes ?? '', amountText: String(e.amount_chf), dateText: swiss(e.entry_date) });

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 260 }}>
            <Text style={styles.title}>Comptabilité</Text>
            <Text style={styles.hint}>
              Vos recettes et dépenses d’indépendant, avec les justificatifs. Le rapport PDF (compte de résultat, détail par catégorie et par mois, journal complet, attestation) est celui que vous remettez à la caisse AVS ou aux impôts pour justifier votre bénéfice.
            </Text>
          </View>
          <View style={styles.actions}>
            <Action icon="plus" label="Recette" onPress={() => setDraft(emptyDraft('recette'))} tone="ok" />
            <Action icon="minus" label="Dépense" onPress={() => setDraft(emptyDraft('depense'))} tone="bad" />
            <Action icon="download-cloud" label={importing ? 'Import…' : 'Importer Stripe'} onPress={runImport} disabled={importing || !available} />
            {Platform.OS === 'web' ? <Action icon="file-text" label="Rapport PDF" onPress={pdf} primary disabled={!filtered.length} /> : null}
            {Platform.OS === 'web' ? <Action icon="grid" label="CSV" onPress={csv} disabled={!filtered.length} /> : null}
          </View>
        </View>

        {!available ? (
          <View style={[styles.banner, { backgroundColor: colors.warningSoft }]}>
            <Feather name="database" size={16} color={colors.warning} />
            <Text style={styles.bannerText}>La table de la comptabilité n’existe pas encore. Collez docs/sql/a-coller-dans-supabase.sql dans Supabase › SQL Editor, puis rechargez la page.</Text>
          </View>
        ) : null}
        {error ? <AdminErrorBanner message={error} /> : null}
        {notice ? (
          <Pressable onPress={() => setNotice(null)} style={[styles.banner, { backgroundColor: colors.surfaceAlt }]}>
            <Feather name="info" size={16} color={colors.text} />
            <Text style={styles.bannerText}>{notice}</Text>
            <Feather name="x" size={14} color={colors.textMuted} />
          </Pressable>
        ) : null}

        {/* Period */}
        <View style={styles.periodRow}>
          {[thisYear, thisYear - 1, thisYear - 2].map((y) => (
            <Chip key={y} label={String(y)} active={year === y} onPress={() => setYear(y)} />
          ))}
          <Chip label="Période…" active={year === 'custom'} onPress={() => setYear('custom')} />
          {year === 'custom' ? (
            <>
              <TextInput value={fromText} onChangeText={setFromText} style={[styles.input, styles.dateInput]} placeholder="01.01.2026" placeholderTextColor={colors.textMuted} />
              <Text style={styles.muted}>→</Text>
              <TextInput value={toText} onChangeText={setToText} style={[styles.input, styles.dateInput]} placeholder="31.12.2026" placeholderTextColor={colors.textMuted} />
            </>
          ) : null}
        </View>

        {/* KPIs */}
        <View style={styles.kpis}>
          <Kpi label="Recettes" value={`CHF ${chf(summary.income)}`} color={colors.success} />
          <Kpi label="Dépenses" value={`CHF ${chf(summary.expenses)}`} color={colors.danger} />
          <Kpi label={summary.profit >= 0 ? 'Bénéfice' : 'Perte'} value={`CHF ${chf(summary.profit)}`} dark />
          <Kpi label="Marge" value={`${summary.marginPercent.toFixed(1).replace('.', ',')} %`} />
          <Kpi label="Sans justificatif" value={String(summary.missingReceipts)} color={summary.missingReceipts ? colors.warning : colors.success} onPress={() => setMissingOnly((v) => !v)} />
        </View>

        <View style={[styles.cols, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
          <View style={[styles.card, wide && { flex: 1.3 }]}>
            <Text style={styles.cardTitle}>Recettes et dépenses par mois</Text>
            <MonthChart months={summary.byMonth} />
          </View>
          <View style={[styles.card, wide && { flex: 1 }]}>
            <Text style={styles.cardTitle}>Par catégorie</Text>
            {summary.byCategory.length === 0 ? <Text style={styles.muted}>Aucune écriture.</Text> : null}
            {summary.byCategory.map((c) => (
              <Pressable key={`${c.kind}:${c.category}`} onPress={() => setCats((cur) => (cur.includes(c.category) ? cur.filter((x) => x !== c.category) : [...cur, c.category]))} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: c.kind === 'recette' ? colors.success : colors.danger }]} />
                <Text style={styles.catLabel} numberOfLines={1}>
                  {c.label}
                </Text>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBar, { width: `${Math.min(100, c.share)}%`, backgroundColor: c.kind === 'recette' ? colors.success : colors.danger }]} />
                </View>
                <Text style={styles.catValue}>{chf(c.total)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.card}>
          <View style={styles.filterRow}>
            <Chip label="Tout" active={kind === 'all'} onPress={() => (setKind('all'), setCats([]))} />
            <Chip label="Recettes" active={kind === 'recette'} onPress={() => (setKind('recette'), setCats([]))} />
            <Chip label="Dépenses" active={kind === 'depense'} onPress={() => (setKind('depense'), setCats([]))} />
            <Chip label="Sans justificatif" active={missingOnly} onPress={() => setMissingOnly((v) => !v)} />
            <View style={styles.searchWrap}>
              <Feather name="search" size={14} color={colors.textMuted} />
              <TextInput value={search} onChangeText={setSearch} placeholder="Rechercher (libellé, contrepartie, réf.)" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {catOptions.map((c) => (
              <Chip key={`${c.kind}-${c.key}`} small label={c.label} active={cats.includes(c.key)} onPress={() => setCats((cur) => (cur.includes(c.key) ? cur.filter((x) => x !== c.key) : [...cur, c.key]))} />
            ))}
          </ScrollView>
          {isFiltered ? (
            <Pressable onPress={() => (setKind('all'), setCats([]), setSearch(''), setMissingOnly(false))}>
              <Text style={styles.link}>Effacer les filtres · {filtered.length} / {rows.length} écritures</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Journal */}
        <View style={styles.card}>
          <View style={styles.journalHead}>
            <Text style={styles.cardTitle}>Journal</Text>
            <Text style={styles.muted}>{filtered.length} écriture(s)</Text>
          </View>
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
          {!loading && filtered.length === 0 ? <Text style={styles.muted}>Aucune écriture sur la période. Ajoutez une recette ou une dépense, ou importez vos paiements Stripe.</Text> : null}
          {filtered.map((e) => (
            <Pressable key={e.id} onPress={() => edit(e)} style={({ hovered }: any) => [styles.row, hovered && { backgroundColor: colors.bg }]}>
              <Text style={styles.rowDate}>{swiss(e.entry_date)}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowLabel} numberOfLines={1}>
                  {e.label}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {[categoryLabel(e.kind, e.category), e.counterparty, e.reference, e.source === 'stripe' ? 'Stripe' : null].filter(Boolean).join(' · ')}
                </Text>
              </View>
              {e.receipt_path ? (
                <Pressable onPress={() => openReceipt(e.receipt_path!)} hitSlop={6}>
                  <Feather name="paperclip" size={15} color={colors.success} />
                </Pressable>
              ) : e.kind === 'depense' && e.source !== 'stripe' ? (
                <Feather name="alert-circle" size={15} color={colors.warning} />
              ) : (
                <View style={{ width: 15 }} />
              )}
              <Text style={[styles.rowAmount, { color: e.kind === 'recette' ? colors.success : colors.danger }]}>
                {e.kind === 'recette' ? '+' : '−'}
                {chf(e.amount_chf)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Report identity */}
        <View style={styles.card}>
          <Pressable onPress={() => setShowHolder((v) => !v)} style={styles.journalHead}>
            <Text style={styles.cardTitle}>Informations du rapport</Text>
            <Feather name={showHolder ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
          </Pressable>
          {showHolder ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={styles.muted}>Imprimées en tête du rapport PDF. Gardées dans ce navigateur uniquement.</Text>
              {(
                [
                  ['name', 'Titulaire (nom et prénom)'],
                  ['address', 'Adresse'],
                  ['activity', 'Activité'],
                  ['avsNumber', 'N° AVS'],
                  ['vatNumber', 'N° IDE / TVA (si assujetti)'],
                ] as [keyof LedgerHolder, string][]
              ).map(([k, label]) => (
                <View key={k} style={{ gap: 4 }}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput value={holder[k]} onChangeText={(v) => setHolder((h) => ({ ...h, [k]: v }))} style={styles.input} />
                </View>
              ))}
            </View>
          ) : null}
          <Text style={[styles.muted, { marginTop: spacing.sm }]}>
            Indépendant avec moins de CHF 500’000 de chiffre d’affaires : une comptabilité des recettes et des dépenses et de l’état du patrimoine suffit (art. 957 al. 2 CO). Gardez les justificatifs dix ans (art. 958f CO).
          </Text>
        </View>
      </Container>

      <EntryModal
        draft={draft}
        setDraft={setDraft}
        saving={saving}
        notice={notice}
        onSave={save}
        onDelete={draft?.id ? () => remove(rows.find((r) => r.id === draft.id)!) : undefined}
        onPickReceipt={pickReceipt}
        onOpenReceipt={openReceipt}
      />
    </ScrollView>
  );
}

function EntryModal({
  draft,
  setDraft,
  saving,
  notice,
  onSave,
  onDelete,
  onPickReceipt,
  onOpenReceipt,
}: {
  draft: Draft | null;
  setDraft: (d: Draft | null) => void;
  saving: boolean;
  notice: string | null;
  onSave: () => void;
  onDelete?: () => void;
  onPickReceipt: () => void;
  onOpenReceipt: (path: string) => void;
}) {
  if (!draft) return null;
  const set = (p: Partial<Draft>) => setDraft({ ...draft, ...p });
  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setDraft(null)}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <ScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.xl }}>
            <View style={styles.journalHead}>
              <Text style={styles.cardTitle}>{draft.id ? 'Modifier l’écriture' : draft.kind === 'recette' ? 'Nouvelle recette' : 'Nouvelle dépense'}</Text>
              <Pressable onPress={() => setDraft(null)} hitSlop={8}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.filterRow}>
              <Chip label="Recette" active={draft.kind === 'recette'} onPress={() => set({ kind: 'recette', category: CATEGORIES.recette[0].key })} />
              <Chip label="Dépense" active={draft.kind === 'depense'} onPress={() => set({ kind: 'depense', category: CATEGORIES.depense[0].key })} />
            </View>
            <View style={styles.formRow}>
              <Field label="Date" half>
                <TextInput value={draft.dateText} onChangeText={(v) => set({ dateText: v })} placeholder="JJ.MM.AAAA" placeholderTextColor={colors.textMuted} style={styles.input} />
              </Field>
              <Field label="Montant payé / reçu (CHF, TVA comprise)" half>
                <TextInput value={draft.amountText} onChangeText={(v) => set({ amountText: v })} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} style={[styles.input, { fontWeight: '700' }]} />
              </Field>
            </View>
            <Field label="Libellé">
              <TextInput value={draft.label} onChangeText={(v) => set({ label: v })} placeholder={draft.kind === 'recette' ? 'Ex. Abonnement Cantia, mission de conseil' : 'Ex. Supabase Pro, Google Ads, abonnement CFF'} placeholderTextColor={colors.textMuted} style={styles.input} />
            </Field>
            <Field label="Catégorie">
              <View style={styles.filterRow}>
                {CATEGORIES[draft.kind].map((c) => (
                  <Chip key={c.key} small label={c.label} active={draft.category === c.key} onPress={() => set({ category: c.key })} />
                ))}
              </View>
            </Field>
            <View style={styles.formRow}>
              <Field label={draft.kind === 'recette' ? 'Client' : 'Fournisseur'} half>
                <TextInput value={draft.counterparty ?? ''} onChangeText={(v) => set({ counterparty: v })} style={styles.input} />
              </Field>
              <Field label="Référence (n° de facture…)" half>
                <TextInput value={draft.reference ?? ''} onChangeText={(v) => set({ reference: v })} style={styles.input} />
              </Field>
            </View>
            <Field label="TVA comprise dans le montant">
              <View style={styles.filterRow}>
                {VAT_RATES.map((r) => (
                  <Chip key={r} small label={r ? `${String(r).replace('.', ',')} %` : 'Sans TVA'} active={draft.vat_rate === r} onPress={() => set({ vat_rate: r })} />
                ))}
              </View>
            </Field>
            <Field label="Moyen de paiement">
              <View style={styles.filterRow}>
                {PAYMENT_METHODS.map((m) => (
                  <Chip key={m.key} small label={m.label} active={draft.payment_method === m.key} onPress={() => set({ payment_method: m.key })} />
                ))}
              </View>
            </Field>
            <Field label="Justificatif (photo ou PDF)">
              <View style={styles.filterRow}>
                {draft.receipt_path ? (
                  <>
                    <Pressable onPress={() => onOpenReceipt(draft.receipt_path!)} style={styles.receiptChip}>
                      <Feather name="paperclip" size={14} color={colors.success} />
                      <Text style={[styles.link, { color: colors.success }]}>Voir le justificatif</Text>
                    </Pressable>
                    <Pressable onPress={() => set({ receipt_path: null })}>
                      <Text style={styles.muted}>Retirer</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable onPress={onPickReceipt} style={styles.receiptChip}>
                    <Feather name="upload" size={14} color={colors.primary} />
                    <Text style={styles.link}>Ajouter un justificatif</Text>
                  </Pressable>
                )}
              </View>
            </Field>
            <Field label="Notes">
              <TextInput value={draft.notes ?? ''} onChangeText={(v) => set({ notes: v })} multiline style={[styles.input, { minHeight: 60 }]} />
            </Field>
            {notice ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{notice}</Text> : null}
            <View style={styles.modalActions}>
              {onDelete ? (
                <Pressable onPress={onDelete} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={14} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontWeight: '600' }}>Supprimer</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Pressable onPress={onSave} disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
                <Text style={styles.saveText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function MonthChart({ months }: { months: { month: string; income: number; expenses: number; profit: number }[] }) {
  const [w, setW] = useState(0);
  const H = 190;
  const pad = { l: 46, r: 8, t: 10, b: 24 };
  const max = Math.max(1, ...months.map((m) => Math.max(m.income, m.expenses)));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const plotW = Math.max(10, w - pad.l - pad.r);
  const plotH = H - pad.t - pad.b;
  const slot = plotW / Math.max(1, months.length);
  const y = (v: number) => pad.t + plotH - (v / top) * plotH;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
      {w > 0 ? (
        <Svg width={w} height={H}>
          {[0, 0.5, 1].map((f) => (
            <Line key={f} x1={pad.l} x2={w - pad.r} y1={y(top * f)} y2={y(top * f)} stroke={colors.border} strokeWidth={1} />
          ))}
          {[0, 0.5, 1].map((f) => (
            <SvgText key={`t${f}`} x={pad.l - 6} y={y(top * f) + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
              {top * f >= 1000 ? `${Math.round((top * f) / 1000)}k` : Math.round(top * f)}
            </SvgText>
          ))}
          {months.map((m, i) => {
            const bw = Math.max(3, slot * 0.32);
            const x = pad.l + i * slot + slot * 0.16;
            return (
              <G key={m.month}>
                <Rect x={x} y={y(m.income)} width={bw} height={Math.max(0, pad.t + plotH - y(m.income))} fill={colors.success} rx={2} />
                <Rect x={x + bw + 2} y={y(m.expenses)} width={bw} height={Math.max(0, pad.t + plotH - y(m.expenses))} fill={colors.danger} rx={2} />
                <SvgText x={pad.l + i * slot + slot / 2} y={H - 6} fontSize={10} fill={colors.textMuted} textAnchor="middle">
                  {MONTHS[Number(m.month.slice(5, 7)) - 1] ?? m.month}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

function Kpi({ label, value, color, dark, onPress }: { label: string; value: string; color?: string; dark?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.kpi, dark && styles.kpiDark]}>
      <Text style={[styles.kpiLabel, dark && { color: '#E8C9A8' }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.kpiValue, color ? { color } : null, dark && { color: '#FBF6EE' }]}>
        {value}
      </Text>
    </Pressable>
  );
}

function Chip({ label, active, onPress, small }: { label: string; active: boolean; onPress: () => void; small?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, small && styles.chipSmall, active && styles.chipOn]}>
      <Text style={[styles.chipText, small && { fontSize: 12 }, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

function Action({ icon, label, onPress, primary, tone, disabled }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; primary?: boolean; tone?: 'ok' | 'bad'; disabled?: boolean }) {
  const c = primary ? '#fff' : tone === 'ok' ? colors.success : tone === 'bad' ? colors.danger : colors.text;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.action, primary && styles.actionPrimary, disabled && { opacity: 0.5 }]}>
      <Feather name={icon} size={14} color={c} />
      <Text style={[styles.actionText, { color: c }]}>{label}</Text>
    </Pressable>
  );
}

function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <View style={half ? { gap: 4, flexGrow: 1, flexBasis: 220, minWidth: 200 } : { gap: 4 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xl, gap: spacing.lg },
  header: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { ...displayType, fontSize: fontSize.xxxl, fontWeight: '800', color: colors.text },
  hint: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20, maxWidth: 680, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  actionPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionText: { fontSize: fontSize.sm, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  bannerText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  periodRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexGrow: 1, flexBasis: 190, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  kpiDark: { backgroundColor: colors.text, borderColor: colors.text },
  kpiLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.8, color: colors.textMuted },
  kpiValue: { ...displayType, fontSize: 21, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  cols: { gap: spacing.lg },
  card: { padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: spacing.sm },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  muted: { fontSize: fontSize.sm, color: colors.textMuted },
  link: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 5 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { width: 190, fontSize: fontSize.sm, color: colors.text },
  catBarTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  catBar: { height: 6, borderRadius: 3 },
  catValue: { width: 96, textAlign: 'right', fontSize: fontSize.sm, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipSmall: { paddingHorizontal: spacing.sm, paddingVertical: 5 },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  chipTextOn: { color: colors.primaryDark },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexGrow: 1, minWidth: 220, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, backgroundColor: colors.bg },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: fontSize.sm, color: colors.text, outlineStyle: 'none' } as any,
  journalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 9, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: colors.border },
  rowDate: { ...monoType, width: 84, fontSize: 11.5, color: colors.textMuted },
  rowLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  rowMeta: { fontSize: fontSize.xs, color: colors.textMuted },
  rowAmount: { width: 110, textAlign: 'right', fontSize: fontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 9, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.bg },
  dateInput: { width: 120 },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,14,10,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modal: { width: '100%', maxWidth: 640, maxHeight: '92%', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  receiptChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  saveBtn: { paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.primary },
  saveText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});
