import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { addCashSnapshot, buildForecast, listCashSnapshots, listRecurringExpenses, upcomingRecurringCount } from '../../../lib/api/treasury';
import { listBankAccounts, type BankAccount } from '../../../lib/api/bank';
import { buildHistory, buildProjection, cashStart, isoAddDays, type BankBalanceInput, type SnapshotInput } from '../../../lib/treasury/curve';
import { CashCurve, chfFull } from '../../../components/treasury/CashCurve';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, AppScreen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { breakpoints, colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { CashSnapshot, Plan, RecurringExpense, TreasuryForecast, TreasuryForecastItem, TreasuryItemKind } from '../../../lib/types';
import { displayType, monoType } from '../../../lib/marketingTheme';

// Trésorerie: the balance curve (past months rebuilt from the imported bank
// statements, else from the balances typed in) continued by the 90-day
// projection — expected (every open invoice paid on its due date) and
// cautious (nothing comes in, everything goes out) — with the lowest point,
// the day it would go below zero, and the movements behind it.

type IconName = keyof typeof Feather.glyphMap;
type HistoryRange = 90 | 180 | 365;

const KIND_ICONS: Record<TreasuryItemKind, IconName> = {
  facture: 'file-text',
  salaire: 'users',
  'sous-traitant': 'briefcase',
  recurrente: 'repeat',
};

const COPY = {
  fr: {
    curve: 'Évolution du solde',
    history: 'Solde',
    expected: 'Projection',
    cautious: 'Sans encaissements',
    balance: 'Solde',
    today: 'Aujourd’hui',
    months: { 90: '3 mois', 180: '6 mois', 365: '12 mois' },
    in30: 'Dans 30 jours',
    in90: 'Dans 90 jours',
    lowest: 'Point le plus bas',
    on: 'le {{date}}',
    cautiousNote: 'sans encaissements : CHF {{v}}',
    alertNegative: 'Au rythme prévu, le solde passerait sous zéro le {{date}}.',
    alertCautious: 'Si les factures ouvertes ne sont pas payées, le solde passerait sous zéro le {{date}}.',
    allGood: 'Le solde reste positif sur les 90 prochains jours, même sans encaissements.',
    sourceBank: 'Relevés bancaires importés ({{n}} compte(s))',
    sourceSnapshot: 'Soldes saisis à la main',
    sourceNone: 'Saisissez votre solde pour démarrer la courbe',
    noHistory: 'Pas encore d’historique : importez un relevé bancaire (Comptabilité › Banque) ou mettez à jour le solde régulièrement.',
    inflows: 'Entrées attendues',
    outflows: 'Sorties prévues',
    total: 'Total 90 jours',
    noInflows: 'Aucune facture à encaisser.',
    noOutflows: 'Aucune sortie prévue.',
    importBank: 'Importer un relevé',
  },
  de: {
    curve: 'Saldoverlauf',
    history: 'Saldo',
    expected: 'Prognose',
    cautious: 'Ohne Zahlungseingänge',
    balance: 'Saldo',
    today: 'Heute',
    months: { 90: '3 Monate', 180: '6 Monate', 365: '12 Monate' },
    in30: 'In 30 Tagen',
    in90: 'In 90 Tagen',
    lowest: 'Tiefster Stand',
    on: 'am {{date}}',
    cautiousNote: 'ohne Eingänge: CHF {{v}}',
    alertNegative: 'Bei planmässigem Verlauf würde der Saldo am {{date}} negativ.',
    alertCautious: 'Werden die offenen Rechnungen nicht bezahlt, würde der Saldo am {{date}} negativ.',
    allGood: 'Der Saldo bleibt in den nächsten 90 Tagen positiv, auch ohne Zahlungseingänge.',
    sourceBank: 'Importierte Kontoauszüge ({{n}} Konto/Konten)',
    sourceSnapshot: 'Manuell erfasste Saldi',
    sourceNone: 'Erfassen Sie Ihren Saldo, um die Kurve zu starten',
    noHistory: 'Noch kein Verlauf: importieren Sie einen Kontoauszug (Buchhaltung › Bank) oder aktualisieren Sie den Saldo regelmässig.',
    inflows: 'Erwartete Eingänge',
    outflows: 'Geplante Ausgänge',
    total: 'Total 90 Tage',
    noInflows: 'Keine offenen Rechnungen.',
    noOutflows: 'Keine geplanten Ausgänge.',
    importBank: 'Auszug importieren',
  },
  it: {
    curve: 'Andamento del saldo',
    history: 'Saldo',
    expected: 'Previsione',
    cautious: 'Senza incassi',
    balance: 'Saldo',
    today: 'Oggi',
    months: { 90: '3 mesi', 180: '6 mesi', 365: '12 mesi' },
    in30: 'Tra 30 giorni',
    in90: 'Tra 90 giorni',
    lowest: 'Punto più basso',
    on: 'il {{date}}',
    cautiousNote: 'senza incassi: CHF {{v}}',
    alertNegative: 'Al ritmo previsto, il saldo diventerebbe negativo il {{date}}.',
    alertCautious: 'Se le fatture aperte non vengono pagate, il saldo diventerebbe negativo il {{date}}.',
    allGood: 'Il saldo resta positivo nei prossimi 90 giorni, anche senza incassi.',
    sourceBank: 'Estratti bancari importati ({{n}} conto/i)',
    sourceSnapshot: 'Saldi inseriti a mano',
    sourceNone: 'Inserite il saldo per avviare la curva',
    noHistory: 'Ancora nessuno storico: importate un estratto conto (Contabilità › Banca) o aggiornate regolarmente il saldo.',
    inflows: 'Entrate attese',
    outflows: 'Uscite previste',
    total: 'Totale 90 giorni',
    noInflows: 'Nessuna fattura da incassare.',
    noOutflows: 'Nessuna uscita prevista.',
    importBank: 'Importare un estratto',
  },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(v[k] ?? ''));

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(`${getAppLocale()}-CH`, opts);
}

function kindLabel(t: ReturnType<typeof useTranslation>['t'], kind: TreasuryItemKind): string {
  switch (kind) {
    case 'facture':
      return t('treasury.kindFacture');
    case 'salaire':
      return t('treasury.kindSalaire');
    case 'sous-traitant':
      return t('treasury.kindSousTraitant');
    case 'recurrente':
      return t('treasury.kindRecurrente');
  }
}

export default function TreasuryScreen() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const c = COPY[locale] ?? COPY.fr;
  const { organization, user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<TreasuryForecast | null>(null);
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [snapshots, setSnapshots] = useState<CashSnapshot[]>([]);
  const [banks, setBanks] = useState<BankBalanceInput[]>([]);
  const [bankCount, setBankCount] = useState(0);
  const [range, setRange] = useState<HistoryRange>(180);

  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

  const today = isoToday();

  // enabled_modules alone isn't a reliable gate here — an org that had
  // 'treasury' toggled on while on a plan that included it keeps that entry
  // if it later downgrades: the plan itself is checked too.
  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const since = isoAddDays(isoToday(), -366);
    const [fc, exp, { data: planRow }, snaps, accounts, { data: tx }] = await Promise.all([
      buildForecast(organization),
      listRecurringExpenses(organization.id),
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
      listCashSnapshots(organization.id, since).catch(() => [] as CashSnapshot[]),
      listBankAccounts(organization.id).catch(() => [] as BankAccount[]),
      supabase.from('bank_transactions').select('bank_account_id, booking_date, amount').eq('organization_id', organization.id).gte('booking_date', since),
    ]);
    setForecast(fc);
    setExpenses(exp);
    setPlan(planRow ?? null);
    setSnapshots(snaps);
    const active = accounts.filter((a) => a.isActive);
    setBankCount(active.filter((a) => a.lastImportedBalance != null).length);
    setBanks(
      active.map((a) => ({
        lastImportedBalance: a.lastImportedBalance,
        lastImportedAt: a.lastImportedAt,
        transactions: (tx ?? []).filter((r: any) => r.bank_account_id === a.id).map((r: any) => ({ bookingDate: r.booking_date, amount: Number(r.amount) })),
      })),
    );
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function saveBalance() {
    if (!organization) return;
    const value = Number(balanceInput.replace(/[’'\s]/g, '').replace(',', '.'));
    if (Number.isNaN(value)) return;
    setSavingBalance(true);
    await addCashSnapshot(organization.id, value, user?.id);
    setSavingBalance(false);
    setEditingBalance(false);
    load();
  }

  const snapInputs: SnapshotInput[] = useMemo(() => snapshots.map((s) => ({ balance: Number(s.balance_chf), recordedAt: s.recorded_at })), [snapshots]);
  const start = useMemo(() => cashStart(banks, snapInputs), [banks, snapInputs]);
  const history = useMemo(() => buildHistory(banks, snapInputs, isoAddDays(today, -range), today), [banks, snapInputs, range, today]);
  const projection = useMemo(() => buildProjection(start.balance, forecast?.items ?? [], today, 90), [start.balance, forecast, today]);
  // The history ends where the projection starts: join them on today.
  const historyJoined = useMemo(() => {
    if (!history.length) return history;
    const lastH = history[history.length - 1];
    return lastH.date < today ? [...history, { date: today, balance: start.balance }] : history;
  }, [history, today, start.balance]);
  const cautiousFirstNegative = projection.cautious.find((p) => p.balance < 0)?.date ?? null;
  const at = (days: number) => projection.expected[Math.min(days, projection.expected.length - 1)];

  const upcoming = useMemo(() => upcomingRecurringCount(expenses), [expenses]);
  const inflows = useMemo(() => (forecast?.items ?? []).filter((it) => it.amount >= 0), [forecast]);
  const outflows = useMemo(() => (forecast?.items ?? []).filter((it) => it.amount < 0), [forecast]);

  if (!organization || loading) return <LoadingScreen />;

  if (plan && !plan.has_treasury) {
    return (
      <AppScreen style={{ padding: spacing.xl }}>
        <PageHeader title={t('treasury.title')} backTo="/(app)" />
        <Card style={styles.upsell}>
          <Feather name="archive" size={22} color={colors.accent} />
          <Text style={styles.upsellTitle}>{t('treasury.upsellTitle')}</Text>
          <Text style={styles.upsellText}>{t('treasury.upsellText')}</Text>
          <Text style={styles.upsellText}>{t('treasury.upsellPlanHint')}</Text>
          <Button title={t('treasury.seePlans')} variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
        </Card>
      </AppScreen>
    );
  }

  const sourceLabel = start.source === 'bank' ? fill(c.sourceBank, { n: bankCount }) : start.source === 'snapshot' ? c.sourceSnapshot : c.sourceNone;
  const alert = projection.firstNegative
    ? { tone: 'danger' as const, text: fill(c.alertNegative, { date: formatDate(projection.firstNegative, { day: 'numeric', month: 'long' }) }) }
    : cautiousFirstNegative
      ? { tone: 'warning' as const, text: fill(c.alertCautious, { date: formatDate(cautiousFirstNegative, { day: 'numeric', month: 'long' }) }) }
      : start.source !== 'none'
        ? { tone: 'success' as const, text: c.allGood }
        : null;

  const balanceCard = (
    <Card style={[styles.kpi, styles.kpiMain]}>
      <View style={styles.balanceTop}>
        <Text style={styles.kpiLabelLight}>{t('treasury.currentBalance').toUpperCase()}</Text>
        {!editingBalance ? (
          <Pressable
            onPress={() => {
              setBalanceInput(start.balance ? String(start.balance) : '');
              setEditingBalance(true);
            }}
            hitSlop={8}
            accessibilityLabel={t('treasury.currentBalance')}
          >
            <Feather name="edit-2" size={15} color="#E8C9A8" />
          </Pressable>
        ) : null}
      </View>
      {editingBalance ? (
        <View style={styles.balanceEditRow}>
          <TextInput value={balanceInput} onChangeText={setBalanceInput} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} style={styles.balanceInput} autoFocus />
          <Button title={t('treasury.save')} onPress={saveBalance} loading={savingBalance} style={{ flex: 0 }} />
          <Button title={t('treasury.cancel')} variant="secondary" onPress={() => setEditingBalance(false)} style={{ flex: 0 }} />
        </View>
      ) : (
        <Text style={[styles.kpiValueLight, start.balance < 0 && { color: '#F2A193' }]}>CHF {chfFull(start.balance)}</Text>
      )}
      <Text style={styles.kpiMetaLight}>
        {start.asOf ? `${t('treasury.updatedOn', { date: formatDate(start.asOf) })} · ${sourceLabel}` : sourceLabel}
      </Text>
    </Card>
  );

  const kpi = (label: string, value: number, meta?: string) => (
    <Card style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label.toUpperCase()}</Text>
      <Text style={[styles.kpiValue, !wide && { fontSize: 19 }, value < 0 && { color: colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
        CHF {chfFull(value)}
      </Text>
      {meta ? <Text style={styles.kpiMeta}>{meta}</Text> : null}
    </Card>
  );

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={[styles.page, wide && { maxWidth: 1180 }]}>
        <PageHeader title={t('treasury.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('treasury.subtitle')}</Text>

        <View style={[styles.kpiRow, !wide && { flexWrap: 'wrap' }]}>
          <View style={wide ? { flex: 1.3 } : { width: '100%' }}>{balanceCard}</View>
          <View style={wide ? { flex: 1 } : styles.kpiHalf}>{kpi(c.in30, at(30)?.balance ?? start.balance, fill(c.cautiousNote, { v: chfFull(projection.cautious[30]?.balance ?? start.balance) }))}</View>
          <View style={wide ? { flex: 1 } : styles.kpiHalf}>{kpi(c.in90, at(90)?.balance ?? start.balance, fill(c.cautiousNote, { v: chfFull(projection.cautious[90]?.balance ?? start.balance) }))}</View>
          <View style={wide ? { flex: 1 } : { width: '100%' }}>{kpi(c.lowest, projection.lowest.balance, fill(c.on, { date: formatDate(projection.lowest.date, { day: 'numeric', month: 'long' }) }))}</View>
        </View>

        {alert ? (
          <View style={[styles.alert, alert.tone === 'danger' ? styles.alertDanger : alert.tone === 'warning' ? styles.alertWarning : styles.alertOk]}>
            <Feather
              name={alert.tone === 'success' ? 'check-circle' : 'alert-triangle'}
              size={16}
              color={alert.tone === 'danger' ? colors.danger : alert.tone === 'warning' ? colors.warning : colors.success}
            />
            <Text style={styles.alertText}>{alert.text}</Text>
          </View>
        ) : null}

        <Card style={{ gap: spacing.sm }}>
          <View style={styles.curveHead}>
            <Text style={styles.sectionTitle}>{c.curve}</Text>
            <View style={styles.segment}>
              {([90, 180, 365] as HistoryRange[]).map((r) => (
                <Pressable key={r} onPress={() => setRange(r)} style={[styles.segmentItem, range === r && styles.segmentOn]}>
                  <Text style={[styles.segmentText, range === r && styles.segmentTextOn]}>{c.months[r]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <CashCurve history={historyJoined} expected={projection.expected} cautious={projection.cautious} today={today} locale={locale} copy={c} />
          {history.length === 0 ? (
            <View style={styles.noHistory}>
              <Feather name="info" size={14} color={colors.textMuted} />
              <Text style={styles.noHistoryText}>{c.noHistory}</Text>
            </View>
          ) : null}
        </Card>

        {upcoming > 0 ? (
          <Pressable onPress={() => router.push('/(app)/depenses' as any)} style={styles.banner}>
            <Feather name="bell" size={16} color={colors.warning} />
            <Text style={styles.bannerText}>{t('treasury.upcomingBanner', { count: upcoming })}</Text>
            <Feather name="chevron-right" size={16} color={colors.warning} />
          </Pressable>
        ) : null}

        {inflows.length === 0 && outflows.length === 0 ? (
          <Card>
            <EmptyState title={t('treasury.emptyForecastTitle')} subtitle={t('treasury.emptyForecastSubtitle')} />
          </Card>
        ) : (
          <View style={[styles.flowCols, wide && { flexDirection: 'row' }]}>
            <FlowList title={c.inflows} items={inflows} total={projection.inflow} totalLabel={c.total} empty={c.noInflows} positive t={t} today={today} />
            <FlowList title={c.outflows} items={outflows} total={projection.outflow} totalLabel={c.total} empty={c.noOutflows} t={t} today={today} />
          </View>
        )}

        <Text style={styles.disclaimer}>{t('treasury.salaryDisclaimer')}</Text>
      </ScrollView>
    </AppScreen>
  );
}

function FlowList({
  title,
  items,
  total,
  totalLabel,
  empty,
  positive,
  t,
  today,
}: {
  title: string;
  items: TreasuryForecastItem[];
  total: number;
  totalLabel: string;
  empty: string;
  positive?: boolean;
  t: ReturnType<typeof useTranslation>['t'];
  today: string;
}) {
  const dated = items.filter((i) => i.date);
  const undated = items.filter((i) => !i.date);
  return (
    <Card style={styles.flowCard}>
      <View style={styles.flowHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={[styles.flowTotal, { color: positive ? colors.success : colors.danger }]}>
          {positive ? '+' : '−'}CHF {chfFull(Math.abs(total))}
        </Text>
      </View>
      <Text style={styles.flowTotalLabel}>{totalLabel}</Text>
      {items.length === 0 ? <Text style={styles.emptyText}>{empty}</Text> : null}
      {[...dated, ...undated].slice(0, 14).map((item, idx) => (
        <View key={`${item.kind}-${item.sourceId}-${idx}`} style={styles.itemRow}>
          <View style={[styles.itemIcon, { backgroundColor: positive ? colors.successSoft : colors.dangerSoft }]}>
            <Feather name={KIND_ICONS[item.kind]} size={14} color={positive ? colors.success : colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel} numberOfLines={1}>
              {item.label}
            </Text>
            <View style={styles.itemMetaRow}>
              <Text style={styles.itemMeta}>{item.date ? formatDate(item.date) : `${kindLabel(t, item.kind)} · ${t('treasury.noKnownDueDate')}`}</Text>
              {item.overdue || (item.date && item.date < today) ? <Text style={styles.overdueTag}>{t('treasury.overdue')}</Text> : null}
            </View>
          </View>
          <Text style={[styles.itemAmount, { color: positive ? colors.success : colors.danger }]}>
            {positive ? '+' : '−'}
            {chfFull(Math.abs(item.amount))}
          </Text>
        </View>
      ))}
      {items.length > 14 ? <Text style={styles.emptyText}>+ {items.length - 14}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg, width: '100%', maxWidth: 760, alignSelf: 'center' },
  upsell: { alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.lg },
  upsellTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  upsellText: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: -spacing.sm },
  kpiRow: { flexDirection: 'row', gap: spacing.md },
  kpiHalf: { flexGrow: 1, flexBasis: '45%' },
  kpi: { gap: 4, height: '100%' },
  kpiMain: { backgroundColor: colors.text, borderColor: colors.text },
  kpiLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.8, color: colors.textMuted },
  kpiLabelLight: { ...monoType, fontSize: 10.5, letterSpacing: 0.8, color: '#E8C9A8' },
  kpiValue: { ...displayType, fontSize: 26, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  kpiValueLight: { ...displayType, fontSize: 34, fontWeight: '800', color: '#FBF6EE', fontVariant: ['tabular-nums'] },
  kpiMeta: { fontSize: fontSize.xs, color: colors.textMuted },
  kpiMetaLight: { fontSize: fontSize.xs, color: '#D9CBB8' },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceEditRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  balanceInput: { flexGrow: 1, minWidth: 120, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: fontSize.lg, color: colors.text, backgroundColor: colors.surface },
  alert: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  alertDanger: { backgroundColor: colors.dangerSoft },
  alertWarning: { backgroundColor: colors.warningSoft },
  alertOk: { backgroundColor: colors.successSoft },
  alertText: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  curveHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 2 },
  segmentItem: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.sm },
  segmentOn: { backgroundColor: colors.surface },
  segmentText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  segmentTextOn: { color: colors.text },
  noHistory: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  noHistoryText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.warningSoft, borderRadius: radius.md, padding: spacing.md },
  bannerText: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  flowCols: { gap: spacing.lg, alignItems: 'flex-start' },
  flowCard: { flex: 1, alignSelf: 'stretch', gap: 2 },
  flowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flowTotal: { fontSize: fontSize.md, fontWeight: '800', fontVariant: ['tabular-nums'] },
  flowTotalLabel: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xs },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted, paddingVertical: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  itemIcon: { width: 28, height: 28, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
  itemMeta: { fontSize: fontSize.xs, color: colors.textMuted },
  overdueTag: { fontSize: 10, fontWeight: '700', color: colors.danger, backgroundColor: colors.dangerSoft, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  itemAmount: { fontSize: fontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  disclaimer: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
});
