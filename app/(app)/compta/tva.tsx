import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VatLockedCard } from '../../../components/VatLockedCard';
import { hasValidIde } from '../../../lib/vat/vatStatus';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { buildEch0217Xml, getVatReportByCode, getVatSettings, vatWorksheetToCsv, type VatLedgerReport, type VatSettings } from '../../../lib/api/accounting';
import { countDraftEntries, lastTdfnRates, listVatDeclarations, saveVatDeclaration, type VatDeclaration } from '../../../lib/api/vatDeclarations';
import { buildAfcForm, FIGURE_LABELS, periodsFor, type AfcForm, type FormLine, type VatAdjustments, type VatPeriod } from '../../../lib/vat/afcForm.ts';
import { figureLabels, fill, useVatCopy } from '../../../lib/vat/vatCopy';
import { downloadTextFile } from '../../../lib/downloadFile';
import { AppScreen, Button, LoadingScreen, PageHeader } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

const AFC_PORTAL = 'https://eportal.admin.ch';
const MONO = Platform.select({ web: 'ui-monospace, SFMono-Regular, Menlo, monospace', ios: 'Menlo', default: 'monospace' });

const todayIso = () => new Date().toISOString().slice(0, 10);
const chf = (n: number | undefined) =>
  n == null ? '' : n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dmy = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

type PeriodStatus = 'paid' | 'filed' | 'late' | 'draft' | 'open' | 'future';

function statusOf(p: VatPeriod, decl: VatDeclaration | undefined): PeriodStatus {
  if (decl?.status === 'paid') return 'paid';
  if (decl?.status === 'filed') return 'filed';
  const today = todayIso();
  if (today > p.due) return 'late';
  if (today > p.end) return 'draft';
  if (today >= p.start) return 'open';
  return 'future';
}

const STATUS_TONE: Record<PeriodStatus, { bg: string; fg: string; icon: keyof typeof Feather.glyphMap }> = {
  paid: { bg: colors.successSoft, fg: colors.success, icon: 'check-circle' },
  filed: { bg: colors.primarySoft, fg: colors.primary, icon: 'send' },
  late: { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-triangle' },
  draft: { bg: colors.warningSoft, fg: colors.warning, icon: 'clock' },
  open: { bg: colors.surfaceAlt, fg: colors.textMuted, icon: 'loader' },
  future: { bg: colors.surfaceAlt, fg: colors.textMuted, icon: 'calendar' },
};

export default function VatReturnScreen() {
  const c = useVatCopy();
  const labels = figureLabels(FIGURE_LABELS);
  const { organization, user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [settings, setSettings] = useState<VatSettings | null>(null);
  const [decls, setDecls] = useState<VatDeclaration[] | null>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [ledger, setLedger] = useState<VatLedgerReport | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [adj, setAdj] = useState<VatAdjustments>({});
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const periodicity = settings?.vatPeriodicity ?? 'trimestrielle';
  const method = settings?.vatMethod ?? 'effective';
  const periods = useMemo(() => periodsFor(year, periodicity), [year, periodicity]);
  const declFor = (p: VatPeriod) => decls?.find((d) => d.period_start === p.start && d.period_end === p.end);
  const period = periods.find((p) => p.key === selectedKey) ?? null;
  const decl = period ? declFor(period) : undefined;
  const frozen = !!decl && decl.status !== 'draft' && !!decl.figures;

  const loadYear = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [s, list] = await Promise.all([getVatSettings(organization.id), listVatDeclarations(organization.id, year)]);
    setSettings(s);
    setDecls(list);
    // Open the period that needs attention: the oldest one to file, else the current one.
    const ps = periodsFor(year, s?.vatPeriodicity ?? 'trimestrielle');
    const find = (p: VatPeriod) => list?.find((d) => d.period_start === p.start && d.period_end === p.end);
    const pending = ps.find((p) => ['late', 'draft'].includes(statusOf(p, find(p))));
    const current = ps.find((p) => statusOf(p, find(p)) === 'open');
    setSelectedKey((k) => (k && ps.some((p) => p.key === k) ? k : (pending ?? current ?? ps[ps.length - 1]).key));
    setLoading(false);
  }, [organization, year]);

  useFocusEffect(
    useCallback(() => {
      loadYear();
    }, [loadYear]),
  );

  useEffect(() => {
    if (!organization || !period) return;
    let alive = true;
    setLedger(null);
    setMessage(null);
    (async () => {
      const [report, drafts, rates] = await Promise.all([
        getVatReportByCode(organization.id, period.start, period.endExclusive, settings?.vatRounding ?? 'aucun'),
        countDraftEntries(organization.id, period.start, period.endExclusive),
        method === 'tdfn' ? lastTdfnRates(organization.id) : Promise.resolve({}),
      ]);
      if (!alive) return;
      setLedger(report);
      setDraftCount(drafts);
      const d = declFor(period);
      setAdj({ ...rates, ...(d?.adjustments ?? {}) });
      setReference(d?.afc_reference ?? '');
    })();
    return () => {
      alive = false;
    };
  }, [organization?.id, period?.key, decls, method]);

  const form: AfcForm | null = useMemo(() => {
    if (frozen) return decl!.figures;
    if (!ledger) return null;
    const rows = [...ledger.salesRows, ...ledger.deductibleRows].map((r) => ({ code: r.code, category: r.category, rate: r.rate, base: r.base, amount: r.amount }));
    return buildAfcForm(rows, method, adj, settings?.vatRounding === 'cinq_centimes');
  }, [ledger, adj, method, settings?.vatRounding, frozen, decl]);

  function setAdjValue(key: keyof VatAdjustments, raw: string) {
    const v = raw.replace(/[’'\s]/g, '').replace(',', '.');
    const num = v === '' ? undefined : Number(v);
    if (v !== '' && !isFinite(num!)) return;
    const next = { ...adj, [key]: num };
    setAdj(next);
    // Kept with the period so the next visit (or a colleague) finds it.
    if (decls && organization && period) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveVatDeclaration(organization.id, user?.id, { start: period.start, end: period.end }, { method, adjustments: next });
      }, 800);
    }
  }

  async function updateStatus(status: VatDeclaration['status']) {
    if (!organization || !period || !form) return;
    if (!decls) {
      setMessage(c.notReady);
      return;
    }
    setBusy(true);
    const patch: Parameters<typeof saveVatDeclaration>[3] =
      status === 'draft'
        ? { method, status, figures: null, filed_at: null, paid_at: null }
        : status === 'filed'
          ? { method, status, adjustments: adj, figures: form, amount_due: form.payableRounded, afc_reference: reference.trim() || null, filed_at: todayIso(), paid_at: null }
          : { method, status, paid_at: todayIso() };
    const { error } = await saveVatDeclaration(organization.id, user?.id, { start: period.start, end: period.end }, patch);
    setBusy(false);
    if (error) setMessage(fill(c.saveError, { error }));
    else loadYear();
  }

  function downloadXml() {
    if (!organization || !settings || !ledger || !period) return;
    try {
      const { xml } = buildEch0217Xml({ name: organization.name, ide_number: organization.ide_number }, period.start, period.endExclusive, `TVA-${period.key}`, settings, ledger);
      downloadTextFile(`tva-${period.key}.xml`, xml, 'application/xml');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }

  function downloadCsv() {
    if (!ledger || !period) return;
    downloadTextFile(`tva-${period.key}.csv`, vatWorksheetToCsv(ledger, `${period.label} ${year}`, settings));
  }

  if (!organization) return <LoadingScreen />;

  const status = period ? statusOf(period, decl) : 'future';
  const statusLabel = { paid: c.statusPaid, filed: c.statusFiled, late: c.statusLate, draft: c.statusDraft, open: c.statusOpen, future: c.statusFuture };
  const ideOk = !!organization.ide_number && /CHE/i.test(organization.ide_number) && organization.ide_number.replace(/\D/g, '').length === 9;
  const manualXml = !!(adj.f205 || adj.f225 || adj.f235 || adj.f280 || adj.f383Base || adj.f410 || adj.f415 || adj.f420);
  const reconciled = !form?.warnings.some((w) => w.includes('299'));
  const checks: { ok: boolean; warn?: boolean; text: string }[] = [
    { ok: !!settings?.vatLiable, text: c.checkLiable },
    { ok: ideOk, text: c.checkIde },
    { ok: draftCount === 0, text: draftCount ? fill(c.checkDrafts, { n: draftCount }) : c.checkDraftsOk },
    ...(status === 'open' ? [{ ok: false, warn: true, text: c.checkPeriodOpen }] : []),
    { ok: reconciled, text: c.checkReconciled },
  ];
  const checksOk = checks.every((x) => x.ok);

  const sidebar = period && form ? (
    <View style={{ gap: spacing.md }}>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{c.checksTitle}</Text>
        {checks.map((x, i) => (
          <View key={i} style={styles.checkRow}>
            <Feather name={x.ok ? 'check-circle' : x.warn ? 'info' : 'alert-circle'} size={15} color={x.ok ? colors.success : x.warn ? colors.textMuted : colors.warning} />
            <Text style={styles.checkText}>{x.text}</Text>
          </View>
        ))}
        {form.warnings.filter((w) => !w.includes('299')).map((w, i) => (
          <View key={`w${i}`} style={styles.checkRow}>
            <Feather name="alert-circle" size={15} color={colors.warning} />
            <Text style={styles.checkText}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{c.fileTitle}</Text>
        <Text style={styles.panelText}>{c.fileText}</Text>
        {method === 'effective' ? (
          <Button title={c.downloadXml} icon="file-text" onPress={downloadXml} disabled={!ideOk} />
        ) : (
          <Text style={styles.note}>{c.xmlNeedsEffective}</Text>
        )}
        {method === 'effective' && manualXml ? <Text style={styles.note}>{c.xmlManualNote}</Text> : null}
        <Button title={c.downloadCsv} icon="download" variant="secondary" onPress={downloadCsv} />
        <Pressable onPress={() => Linking.openURL(AFC_PORTAL)} style={styles.linkRow}>
          <Feather name="external-link" size={14} color={colors.primary} />
          <Text style={styles.linkText}>{c.openPortal}</Text>
        </Pressable>

        <View style={styles.sep} />
        {decl?.status === 'filed' || decl?.status === 'paid' ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.panelText}>{fill(c.filedOn, { date: dmy(decl.filed_at ?? todayIso()) })}{decl.afc_reference ? ` · ${decl.afc_reference}` : ''}</Text>
            {decl.status === 'paid' ? (
              <Text style={styles.panelText}>{fill(c.paidOn, { date: dmy(decl.paid_at ?? todayIso()) })}</Text>
            ) : form.payable > 0 ? (
              <>
                <Text style={styles.note}>{c.payInfo}</Text>
                <Button title={c.markPaid} icon="check" onPress={() => updateStatus('paid')} loading={busy} />
              </>
            ) : null}
            <Pressable onPress={() => updateStatus('draft')} style={styles.linkRow}>
              <Feather name="rotate-ccw" size={13} color={colors.textMuted} />
              <Text style={[styles.linkText, { color: colors.textMuted }]}>{c.reopen}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.fieldLabel}>{c.afcReference}</Text>
            <TextInput value={reference} onChangeText={setReference} style={styles.refInput} placeholder="—" placeholderTextColor={colors.textMuted} />
            <Button title={c.markFiled} icon="send" onPress={() => updateStatus('filed')} loading={busy} disabled={status === 'future'} />
          </View>
        )}
        {decls === null ? <Text style={styles.note}>{c.notReady}</Text> : null}
        {message ? <Text style={[styles.note, { color: colors.danger }]}>{message}</Text> : null}
      </View>
    </View>
  ) : null;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <View style={styles.container}>
          <PageHeader title={c.title} backTo="/(app)/compta" />
          <Text style={styles.subtitle}>{c.subtitle}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                {method === 'tdfn' ? c.methodTdfn : c.methodEffective} · {c.periodicity[periodicity]}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(app)/compta' as any)} style={styles.linkRow}>
              <Feather name="settings" size={13} color={colors.primary} />
              <Text style={styles.linkText}>{c.settings}</Text>
            </Pressable>
          </View>

          {loading ? (
            <LoadingScreen />
          ) : !settings?.vatLiable || !hasValidIde(settings.ideNumber) ? (
            <VatLockedCard liable={!!settings?.vatLiable} />
          ) : (
            <>
              {/* Periods of the year */}
              <View style={styles.yearRow}>
                <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={8} style={styles.arrow}>
                  <Feather name="chevron-left" size={18} color={colors.text} />
                </Pressable>
                <Text style={styles.yearText}>{year}</Text>
                <Pressable onPress={() => setYear((y) => y + 1)} hitSlop={8} style={styles.arrow} disabled={year >= new Date().getFullYear()}>
                  <Feather name="chevron-right" size={18} color={year >= new Date().getFullYear() ? colors.border : colors.text} />
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periods}>
                {periods.map((p) => {
                  const st = statusOf(p, declFor(p));
                  const tone = STATUS_TONE[st];
                  const active = p.key === selectedKey;
                  return (
                    <Pressable key={p.key} onPress={() => setSelectedKey(p.key)} style={[styles.periodCard, active && styles.periodCardActive]}>
                      <Text style={styles.periodName}>{p.label}</Text>
                      <Text style={styles.periodDates}>
                        {dmy(p.start).slice(0, 5)} – {dmy(p.end).slice(0, 5)}
                      </Text>
                      <View style={[styles.pill, { backgroundColor: tone.bg }]}>
                        <Feather name={tone.icon} size={11} color={tone.fg} />
                        <Text style={[styles.pillText, { color: tone.fg }]}>{statusLabel[st]}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {period ? (
                <>
                  {/* Summary */}
                  <View style={styles.hero}>
                    <View style={{ flex: 1, minWidth: 220, gap: 6 }}>
                      <Text style={styles.heroPeriod}>
                        {period.label} {year}
                      </Text>
                      <Text style={styles.heroDates}>
                        {dmy(period.start)} – {dmy(period.end)}
                      </Text>
                      <Text style={[styles.heroDue, status === 'late' && { color: colors.danger }]}>
                        {status === 'paid' && decl?.paid_at
                          ? fill(c.paidOn, { date: dmy(decl.paid_at) })
                          : status === 'filed' && decl?.filed_at
                            ? fill(c.filedOn, { date: dmy(decl.filed_at) })
                            : fill(c.dueBy, { date: dmy(period.due) })}
                      </Text>
                    </View>
                    <View style={styles.heroAmountBox}>
                      <Text style={styles.heroAmountLabel}>{!form ? ' ' : form.payable > 0 ? c.amountDue : form.payable < 0 ? c.credit : c.nothingDue}</Text>
                      <Text style={[styles.heroAmount, form && form.payable < 0 && { color: colors.success }]}>CHF {form ? chf(Math.abs(form.payableRounded)) : '…'}</Text>
                    </View>
                  </View>

                  {/* Steps */}
                  <View style={styles.steps}>
                    {[
                      { label: c.stepCheck, done: checksOk },
                      { label: c.stepComplete, done: frozen || checksOk },
                      { label: c.stepFile, done: status === 'filed' || status === 'paid' },
                      { label: c.stepPay, done: status === 'paid' || (status === 'filed' && !!form && form.payable <= 0) },
                    ].map((s, i) => (
                      <View key={s.label} style={styles.step}>
                        <View style={[styles.stepDot, s.done && styles.stepDotDone]}>
                          {s.done ? <Feather name="check" size={12} color="#fff" /> : <Text style={styles.stepNum}>{i + 1}</Text>}
                        </View>
                        <Text style={[styles.stepLabel, s.done && { color: colors.text }]}>{s.label}</Text>
                        {i < 3 ? <View style={[styles.stepLine, s.done && { backgroundColor: colors.success }]} /> : null}
                      </View>
                    ))}
                  </View>

                  <View style={[styles.columns, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
                    {/* The form */}
                    <View style={[styles.formCard, wide && { flex: 1 }]}>
                      <View style={styles.formHead}>
                        <Text style={styles.formTitle}>{c.formTitle}</Text>
                        <Text style={styles.formHint}>{frozen && decl?.filed_at ? fill(c.frozenNote, { date: dmy(decl.filed_at) }) : c.formHint}</Text>
                      </View>
                      {!form ? (
                        <View style={{ padding: spacing.xl }}>
                          <LoadingScreen />
                        </View>
                      ) : (
                        <>
                          <Section title={c.sectionTurnover} cols={[c.colAmount]}>
                            {form.turnover.map((l) => (
                              <Row key={l.figure} line={l} label={labels[l.figure]} c={c} frozen={frozen} adj={adj} onChange={setAdjValue} single />
                            ))}
                          </Section>
                          <Section title={c.sectionTax} cols={[c.colTurnover, c.colRate, c.colTax]}>
                            {form.tax.map((l) => (
                              <Row key={l.figure} line={l} label={labels[l.figure]} c={c} frozen={frozen} adj={adj} onChange={setAdjValue} />
                            ))}
                            {method === 'tdfn' && !frozen ? (
                              <View style={styles.tdfnRow}>
                                <Text style={styles.tdfnLabel}>{c.tdfnRate2Turnover}</Text>
                                <AmountInput value={adj.tdfnRate2Turnover} onChange={(v) => setAdjValue('tdfnRate2Turnover', v)} />
                              </View>
                            ) : null}
                          </Section>
                          <Section title={c.sectionOther} cols={[c.colAmount]}>
                            {form.other.map((l) => (
                              <Row key={l.figure} line={l} label={labels[l.figure]} c={c} frozen={frozen} adj={adj} onChange={setAdjValue} single />
                            ))}
                          </Section>
                        </>
                      )}
                    </View>
                    <View style={wide ? { width: 320 } : undefined}>{sidebar}</View>
                  </View>
                </>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function Section({ title, cols, children }: { title: string; cols: string[]; children: React.ReactNode }) {
  return (
    <View>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionCols}>
          {cols.map((col, i) => (
            <Text key={col} style={[styles.colHead, cols.length === 3 && i === 1 ? { width: 56 } : null]}>
              {col}
            </Text>
          ))}
        </View>
      </View>
      {children}
    </View>
  );
}

function AmountInput({ value, onChange, suffix }: { value: number | undefined; onChange: (v: string) => void; suffix?: string }) {
  const [text, setText] = useState(value == null ? '' : String(value));
  useEffect(() => {
    setText((t) => (Number(t.replace(',', '.')) === value ? t : value == null ? '' : String(value)));
  }, [value]);
  return (
    <View style={styles.inputWrap}>
      <TextInput
        value={text}
        onChangeText={(v) => {
          setText(v);
          onChange(v);
        }}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={colors.textMuted}
        style={styles.amountInput}
      />
      {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
    </View>
  );
}

function Row({
  line,
  label,
  c,
  frozen,
  adj,
  onChange,
  single,
}: {
  line: FormLine;
  label: string | undefined;
  c: ReturnType<typeof useVatCopy>;
  frozen: boolean;
  adj: VatAdjustments;
  onChange: (k: keyof VatAdjustments, v: string) => void;
  single?: boolean;
}) {
  const edit = !frozen && line.editable;
  const isFinal = line.figure === '500' || line.figure === '510';
  // Which column the typed value goes into: the base for acquisition tax,
  // the rate for TDFN, the amount otherwise.
  const editTarget = line.editable === 'f383Base' ? 'turnover' : line.editable === 'tdfnRate1' || line.editable === 'tdfnRate2' ? 'rate' : single ? 'amount' : 'tax';
  const rawValue = (k: keyof VatAdjustments) => {
    const v = adj[k];
    return typeof v === 'number' ? v : undefined;
  };
  const value = (col: 'turnover' | 'rate' | 'tax' | 'amount') => {
    if (edit && editTarget === col) return <AmountInput value={rawValue(line.editable!)} onChange={(v) => onChange(line.editable!, v)} suffix={col === 'rate' ? '%' : undefined} />;
    const v = line[col];
    if (v == null) return <Text style={styles.cell} />;
    if (col === 'rate') return <Text style={[styles.cell, styles.rateCell]}>{v ? `${v} %` : ''}</Text>;
    return <Text style={[styles.cell, line.subtotal && styles.cellBold, isFinal && styles.cellFinal]}>{chf(v)}</Text>;
  };
  return (
    <View style={[styles.row, line.subtotal && styles.rowSubtotal, isFinal && styles.rowFinal]}>
      <View style={[styles.figure, line.subtotal && styles.figureStrong]}>
        <Text style={[styles.figureText, line.subtotal && { color: '#fff' }]}>{line.figure}</Text>
      </View>
      <View style={styles.labelBox}>
        <Text style={[styles.label, line.subtotal && styles.labelBold]}>{label ?? line.figure}</Text>
        {edit ? <Text style={styles.editHint}>{c.editHint}</Text> : null}
      </View>
      {single ? (
        <View style={styles.valueCol}>{value('amount')}</View>
      ) : (
        <View style={styles.valueCols}>
          <View style={styles.valueCol}>{value('turnover')}</View>
          <View style={{ width: 56 }}>{value('rate')}</View>
          <View style={styles.valueCol}>{value('tax')}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1180, alignSelf: 'center', gap: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20, maxWidth: 720 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  metaChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt },
  metaChipText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  linkText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },

  yearRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  arrow: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  yearText: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  periods: { gap: spacing.sm, paddingVertical: 2 },
  periodCard: { minWidth: 150, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  periodCardActive: { borderColor: colors.text, borderWidth: 1.5 },
  periodName: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  periodDates: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, marginTop: 4 },
  pillText: { fontSize: 11, fontWeight: '700' },

  hero: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.text },
  heroPeriod: { fontSize: fontSize.lg, fontWeight: '800', color: '#fff' },
  heroDates: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', fontVariant: ['tabular-nums'] },
  heroDue: { fontSize: fontSize.sm, fontWeight: '700', color: '#fff' },
  heroAmountBox: { alignItems: 'flex-end', gap: 2 },
  heroAmountLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' },
  heroAmount: { fontSize: 30, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },

  steps: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  step: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  stepDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  stepNum: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  stepLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  stepLine: { width: 28, height: 1.5, backgroundColor: colors.border, marginHorizontal: 4 },

  columns: { gap: spacing.md },
  formCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  formHead: { padding: spacing.md, gap: 4, borderBottomWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  formHint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 6, backgroundColor: colors.bg, borderBottomWidth: 1, borderColor: colors.border },
  sectionTitle: { flex: 1, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.text },
  sectionCols: { flexDirection: 'row', gap: spacing.sm },
  colHead: { width: 110, textAlign: 'right', fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 9, borderBottomWidth: 1, borderColor: colors.border },
  rowSubtotal: { backgroundColor: colors.bg },
  rowFinal: { backgroundColor: colors.primarySoft },
  figure: { width: 40, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  figureStrong: { backgroundColor: colors.text, borderColor: colors.text },
  figureText: { fontFamily: MONO, fontSize: 12, fontWeight: '700', color: colors.text },
  labelBox: { flex: 1, minWidth: 120, gap: 1 },
  label: { fontSize: fontSize.sm, color: colors.text, lineHeight: 18 },
  labelBold: { fontWeight: '800' },
  editHint: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.3 },
  valueCols: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  valueCol: { width: 110 },
  cell: { textAlign: 'right', fontSize: fontSize.sm, color: colors.text, fontVariant: ['tabular-nums'] },
  rateCell: { color: colors.textMuted, fontSize: fontSize.xs },
  cellBold: { fontWeight: '800' },
  cellFinal: { fontSize: fontSize.md, color: colors.primary },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: radius.sm, backgroundColor: colors.surface, paddingHorizontal: 6 },
  amountInput: { flex: 1, minWidth: 0, paddingVertical: 5, textAlign: 'right', fontSize: fontSize.sm, color: colors.text, fontVariant: ['tabular-nums'] },
  inputSuffix: { fontSize: fontSize.xs, color: colors.textMuted, marginLeft: 2 },
  tdfnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border },
  tdfnLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted },

  panel: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm },
  panelTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  panelText: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkText: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 19 },
  note: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  refInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: fontSize.sm, color: colors.text },
});
