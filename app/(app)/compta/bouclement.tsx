import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { getVatSettings, listFiscalYears, type FiscalYear } from '../../../lib/api/accounting';
import {
  aiReviewClosing,
  closingCsv,
  createClosingDrafts,
  downloadText,
  getClosing,
  loadClosingContext,
  lockYear,
  removeClosingDrafts,
  saveClosing,
  type ClosingContext,
  type ClosingData,
} from '../../../lib/api/closing';
import { getFiduciaries } from '../../../lib/api/fiduciary';
import {
  ASSET_CATEGORIES,
  CLOSING_ACCOUNTS,
  PROFIT_TAX_RATES,
  accruals as buildAccruals,
  closingChecks,
  depreciation,
  ducroire,
  resultImpact,
  taxProvision,
  workInProgress,
  type AccrualInput,
  type AccrualKind,
  type AssetInput,
  type ClosingEntryProposal,
  type LegalForm,
} from '../../../lib/accounting/closing';
import { ASSET_LABELS, CLOSING_COPY } from '../../../lib/accounting/closingCopy';
import { cantonForNpa } from '../../../lib/payroll/npaCanton';
import { confirm } from '../../../lib/confirm';
import { Button, Card, LoadingScreen, PageHeader, AppScreen } from '../../../components/ui';
import { getAppLocale } from '../../../lib/translations';
import { breakpoints, colors, fontSize, radius, spacing } from '../../../lib/theme';
import { displayType, monoType } from '../../../lib/marketingTheme';

// Year-end closing assistant: controls, then one step per closing entry
// (ducroire, depreciation, accruals, work in progress, taxes), an AI review,
// then lock the year and send it to the fiduciary. Every entry is created
// as a DRAFT the user posts from Comptabilité › Écritures. Calculations:
// lib/accounting/closing.ts; data and actions: lib/api/closing.ts.

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(v[k] ?? ''));

function chf(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

function num(s: string): number {
  const n = Number(s.replace(/[’'\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const ACCRUAL_KINDS: AccrualKind[] = ['prepaid_expense', 'accrued_expense', 'accrued_income', 'deferred_income'];

export default function ClosingAssistantScreen() {
  const locale = getAppLocale();
  const c = CLOSING_COPY[locale] ?? CLOSING_COPY.fr;
  const assetLabels = ASSET_LABELS[locale] ?? ASSET_LABELS.fr;
  const { organization, user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;

  const [years, setYears] = useState<FiscalYear[] | null>(null);
  const [fy, setFy] = useState<FiscalYear | null>(null);
  const [ctx, setCtx] = useState<ClosingContext | null>(null);
  const [loadingCtx, setLoadingCtx] = useState(false);
  const [available, setAvailable] = useState(true);
  const [legalForm, setLegalForm] = useState<LegalForm | null>(null);
  const [data, setData] = useState<ClosingData>({});
  const [status, setStatus] = useState<'en_cours' | 'verrouille' | 'transmis'>('en_cours');
  const [transmittedAt, setTransmittedAt] = useState<string | null>(null);
  const [fiduciary, setFiduciary] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [showHow, setShowHow] = useState(true);
  const [newAccrual, setNewAccrual] = useState<{ kind: AccrualKind; label: string; amount: string }>({ kind: 'prepaid_expense', label: '', amount: '' });

  const canton = cantonForNpa(organization?.postal_code ?? null) ?? 'VD';

  useFocusEffect(
    useCallback(() => {
      if (!organization) return;
      listFiscalYears(organization.id).then((list) => {
        setYears(list);
        // The latest year that has ended, else the current one.
        const today = new Date().toISOString().slice(0, 10);
        setFy((cur) => cur ?? list.find((y) => y.end_date < today) ?? list[0] ?? null);
      });
      getFiduciaries(organization.id).then(({ data: f }) => setFiduciary(f?.accesses.find((a) => a.status === 'ACTIVE')?.firm.name ?? null));
    }, [organization]),
  );

  const load = useCallback(async () => {
    if (!organization || !fy) return;
    setLoadingCtx(true);
    const [vat, closing] = await Promise.all([getVatSettings(organization.id), getClosing(fy.id)]);
    const context = await loadClosingContext(organization.id, fy, { liable: !!vat?.vatLiable, periodicity: vat?.vatPeriodicity ?? null });
    setCtx(context);
    setAvailable(closing.available);
    setLegalForm(closing.closing?.legal_form ?? null);
    setData(closing.closing?.data ?? {});
    setStatus(fy.status === 'closed' && closing.closing?.status !== 'transmis' ? 'verrouille' : closing.closing?.status ?? 'en_cours');
    setTransmittedAt(closing.closing?.transmitted_at ?? null);
    setMessages({});
    setLoadingCtx(false);
  }, [organization, fy]);

  useEffect(() => {
    load();
  }, [load]);

  async function persist(patch: { data?: ClosingData; legal_form?: LegalForm | null; status?: 'en_cours' | 'verrouille' | 'transmis'; transmitted_at?: string | null }) {
    if (!organization || !fy || !available) return;
    const { error } = await saveClosing(organization.id, fy.id, user?.id, patch);
    if (error) setMessages((m) => ({ ...m, save: { ok: false, text: error } }));
  }

  function patchData(p: Partial<ClosingData>, save = false) {
    setData((d) => {
      const next = { ...d, ...p };
      if (save) persist({ data: next });
      return next;
    });
  }

  // ---- Figures -------------------------------------------------------------
  const bal = (code: string) => ctx?.balances[code] ?? 0;
  const receivables = Math.max(0, bal('1100'));
  const foreign = Math.min(receivables, data.foreignReceivables ?? 0);
  const netAssets = Math.max(0, bal('1600') + bal('1609'));
  const assets: AssetInput[] = useMemo(
    () => data.assets ?? ASSET_CATEGORIES.map((a, i) => ({ key: a.key, rate: a.rate, bookValue: i === 0 ? netAssets : 0 })),
    [data.assets, netAssets],
  );

  const pDucroire = ducroire({ swissReceivables: receivables - foreign, foreignReceivables: foreign, currentProvision: -bal('1109'), swissRate: data.swissRate, foreignRate: data.foreignRate });
  const pDep = depreciation(assets);
  const pAccruals = buildAccruals(data.accruals ?? []);
  const pWip = data.wipValue != null ? workInProgress(data.wipValue, bal('1300')) : { change: 0, entry: null };
  const others = [pDucroire.entry, pDep.entry, ...pAccruals, pWip.entry].filter(Boolean) as ClosingEntryProposal[];
  const taxBooked = (ctx?.trial ?? []).filter((r) => r.code === '8900').reduce((s, r) => s + r.debitMovements - r.creditMovements, 0);
  const profitBeforeTax = (ctx?.result ?? 0) + resultImpact(others) + taxBooked;
  const taxRate = data.taxRate ?? PROFIT_TAX_RATES[canton] ?? 14;
  const pTax = taxProvision({ legalForm: legalForm ?? 'sarl', profitBeforeTax, ratePercent: taxRate, alreadyProvisioned: -bal('2350'), capitalTax: data.capitalTax });
  const all = [...others, ...(legalForm && legalForm !== 'ri' && pTax.entry ? [pTax.entry] : [])];
  const impact = resultImpact(all);

  const checks = ctx
    ? closingChecks({
        draftEntries: ctx.drafts,
        unmatchedBankTransactions: ctx.unmatchedBank,
        trialDebit: ctx.trialDebit,
        trialCredit: ctx.trialCredit,
        bankLedgerBalance: ctx.bankStatementBalance != null ? bal('1020') : null,
        bankStatementBalance: ctx.bankStatementBalance,
        vatPeriodsOpen: ctx.vatPeriodsOpen,
        balanceSheetGap: ctx.balanceSheetGap,
      })
    : [];
  const blocking = checks.some((x) => x.status === 'blocking');
  const generated = data.generated ?? {};
  const locked = status !== 'en_cours' || fy?.status === 'closed';

  // ---- Actions -------------------------------------------------------------
  async function prepare(step: string, proposals: ClosingEntryProposal[], staleKeys: string[] = []) {
    if (!organization || !fy) return;
    setBusy(step);
    let prev = generated;
    if (staleKeys.length) prev = await removeClosingDrafts(staleKeys, prev);
    const { generated: next, error } = await createClosingDrafts(organization.id, fy, proposals, prev);
    const stepsDone = [...new Set([...(data.stepsDone ?? []), step])];
    patchData({ generated: next, stepsDone }, true);
    setMessages((m) => ({ ...m, [step]: error ? { ok: false, text: error } : { ok: true, text: c.prepared } }));
    setBusy(null);
    // The new drafts count in the controls.
    if (!error && ctx) setCtx({ ...ctx, drafts: ctx.drafts + proposals.length });
  }

  function markDone(step: string) {
    patchData({ stepsDone: [...new Set([...(data.stepsDone ?? []), step])] }, true);
  }

  async function runAi() {
    if (!organization || !ctx || !fy) return;
    setBusy('ai');
    const { text, error } = await aiReviewClosing(
      organization.id,
      {
        year: fy.end_date.slice(0, 4),
        legalForm,
        canton,
        resultBefore: ctx.result,
        closingImpact: impact,
        checks: checks.map((x) => ({ check: x.key, status: x.status, value: x.value })),
        trialBalance: ctx.trial.slice(0, 80).map((r) => ({ code: r.code, label: r.label, opening: r.openingBalance, debit: r.debitMovements, credit: r.creditMovements, closing: r.closingBalance })),
        proposals: all.map((p) => ({ label: p.label, lines: p.lines.map((l) => ({ account: l.account, debit: l.debit, credit: l.credit })) })),
      },
      locale,
    );
    setBusy(null);
    if (error || !text) {
      setMessages((m) => ({ ...m, ai: { ok: false, text: error ?? '—' } }));
      return;
    }
    patchData({ aiReview: { at: new Date().toISOString(), text } }, true);
  }

  async function doLock() {
    if (!fy) return;
    const year = fy.end_date.slice(0, 4);
    if (!(await confirm(fill(c.lockConfirm, { year }), c.lockConfirmText))) return;
    setBusy('lock');
    const { error } = await lockYear(fy);
    setBusy(null);
    if (error) {
      setMessages((m) => ({ ...m, lock: { ok: false, text: error } }));
      return;
    }
    setStatus('verrouille');
    setFy({ ...fy, status: 'closed' });
    persist({ status: 'verrouille', data });
  }

  async function doTransmit() {
    const at = new Date().toISOString();
    setStatus('transmis');
    setTransmittedAt(at);
    await persist({ status: 'transmis', transmitted_at: at, data });
  }

  function doDownload() {
    if (!ctx || !fy) return;
    const summary: [string, string][] = [
      [c.resultBefore, chf(ctx.result)],
      [c.impact, chf(impact)],
      [c.resultAfter, chf(ctx.result + impact)],
      [c.s2, legalForm ? c.forms[legalForm] : '—'],
      ...all.map((p) => [p.label, p.lines.map((l) => `${l.account} ${l.debit ? 'D' : 'C'} ${chf(l.debit || l.credit)}`).join(' / ')] as [string, string]),
      ...(data.aiReview ? ([[c.s8, data.aiReview.text.replace(/\n/g, ' ')]] as [string, string][]) : []),
    ];
    downloadText(closingCsv(ctx.trial, summary), `bouclement-${fy.end_date.slice(0, 4)}.csv`);
  }

  // ---- Render --------------------------------------------------------------
  if (!organization || years === null) return <LoadingScreen />;

  const year = fy ? fy.end_date.slice(0, 4) : '';
  const endDateLabel = fy ? new Date(`${fy.end_date}T12:00:00`).toLocaleDateString(`${locale}-CH`, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const done = (step: string) => (data.stepsDone ?? []).includes(step);

  const steps: { key: string; title: string; status: 'ok' | 'warning' | 'blocking' | 'todo' }[] = [
    { key: 's1', title: c.s1, status: blocking ? 'blocking' : checks.some((x) => x.status === 'warning') ? 'warning' : 'ok' },
    { key: 's2', title: c.s2, status: legalForm ? 'ok' : 'todo' },
    { key: 'ducroire', title: c.s3, status: done('ducroire') || !pDucroire.entry ? 'ok' : 'todo' },
    { key: 'amortissements', title: c.s4, status: done('amortissements') || !pDep.entry ? 'ok' : 'todo' },
    { key: 'transitoires', title: c.s5, status: done('transitoires') ? 'ok' : 'todo' },
    { key: 'travaux', title: c.s6, status: done('travaux') ? 'ok' : 'todo' },
    { key: 'impots', title: c.s7, status: done('impots') ? 'ok' : 'todo' },
    { key: 'ai', title: c.s8, status: data.aiReview ? 'ok' : 'todo' },
    { key: 's9', title: c.s9, status: status === 'transmis' ? 'ok' : locked ? 'warning' : 'todo' },
  ];
  const progress = steps.filter((s) => s.status === 'ok').length;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={[styles.page, wide && { maxWidth: 1180 }]}>
        <PageHeader title={fy ? fill(c.title, { year }) : c.s9} backTo="/(app)/compta" />
        <Text style={styles.subtitle}>{c.subtitle}</Text>

        {years.length === 0 ? (
          <Card>
            <Text style={styles.body}>{c.noYear}</Text>
          </Card>
        ) : (
          <>
            <View style={styles.yearRow}>
              <Text style={styles.yearLabel}>{c.year}</Text>
              {years.map((y) => (
                <Pressable key={y.id} onPress={() => setFy(y)} style={[styles.yearChip, fy?.id === y.id && styles.yearChipOn]}>
                  <Text style={[styles.yearChipText, fy?.id === y.id && styles.yearChipTextOn]}>
                    {y.end_date.slice(0, 4)}
                    {y.status === 'closed' ? ' 🔒' : ''}
                  </Text>
                </Pressable>
              ))}
            </View>

            {!available ? (
              <View style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
                <Feather name="info" size={14} color={colors.warning} />
                <Text style={styles.noticeText}>{c.notSaved}</Text>
              </View>
            ) : null}

            <Card style={styles.howCard}>
              <Pressable onPress={() => setShowHow((v) => !v)} style={styles.howHead}>
                <Feather name="book-open" size={16} color={colors.primary} />
                <Text style={styles.howTitle}>{c.howTitle}</Text>
                <Feather name={showHow ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </Pressable>
              {showHow
                ? c.how.map((h, i) => (
                    <View key={h} style={styles.howRow}>
                      <Text style={styles.howNum}>{i + 1}</Text>
                      <Text style={styles.howText}>{h}</Text>
                    </View>
                  ))
                : null}
            </Card>

            {loadingCtx || !ctx ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : (
              <View style={[styles.layout, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
                {/* Left: progress + summary */}
                <View style={[styles.side, wide && { width: 300 }]}>
                  <Card style={{ gap: spacing.sm }}>
                    <Text style={styles.progressLabel}>
                      {progress} / {steps.length}
                    </Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${(progress / steps.length) * 100}%` }]} />
                    </View>
                    {steps.map((s, i) => (
                      <View key={s.key} style={styles.navRow}>
                        <StatusDot status={s.status} n={i + 1} />
                        <Text style={styles.navText} numberOfLines={1}>
                          {s.title}
                        </Text>
                      </View>
                    ))}
                  </Card>
                  <Card style={styles.summary}>
                    <SummaryRow label={c.resultBefore} value={ctx.result} />
                    <SummaryRow label={c.impact} value={impact} signed />
                    <View style={styles.summaryRule} />
                    <SummaryRow label={c.resultAfter} value={ctx.result + impact} strong />
                  </Card>
                </View>

                {/* Right: steps */}
                <View style={styles.steps}>
                  <Step n={1} title={c.s1} why={c.s1why} status={steps[0].status} whyLabel={c.why}>
                    {checks.map((x) => {
                      const copy = c.checks[x.key];
                      return (
                        <View key={x.key} style={styles.checkRow}>
                          <Feather
                            name={x.status === 'ok' ? 'check-circle' : x.status === 'warning' ? 'alert-circle' : 'x-circle'}
                            size={16}
                            color={x.status === 'ok' ? colors.success : x.status === 'warning' ? colors.warning : colors.danger}
                          />
                          <Text style={styles.checkText}>{x.status === 'ok' ? copy.ok : fill(copy.bad, { n: x.value ?? 0, v: chf(Math.abs(x.value ?? 0)) })}</Text>
                        </View>
                      );
                    })}
                    <View style={styles.linkRow}>
                      <LinkButton label={c.openEntries} onPress={() => router.push('/(app)/compta' as any)} />
                      {checks.some((x) => x.key === 'vat' && x.status !== 'ok') ? <LinkButton label={c.openVat} onPress={() => router.push('/(app)/compta/tva' as any)} /> : null}
                    </View>
                  </Step>

                  <Step n={2} title={c.s2} why={c.s2why} status={steps[1].status} whyLabel={c.why}>
                    <View style={styles.chips}>
                      {(['ri', 'sarl', 'sa'] as LegalForm[]).map((f) => (
                        <Pressable
                          key={f}
                          disabled={locked}
                          onPress={() => {
                            setLegalForm(f);
                            persist({ legal_form: f, data });
                          }}
                          style={[styles.chip, legalForm === f && styles.chipOn]}
                        >
                          <Text style={[styles.chipText, legalForm === f && styles.chipTextOn]}>{c.forms[f]}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </Step>

                  <Step n={3} title={c.s3} why={c.s3why} status={steps[2].status} whyLabel={c.why}>
                    <Figure label={c.swissDebtors} value={receivables} />
                    <NumberField label={c.foreignDebtors} value={data.foreignReceivables ?? 0} onChange={(v) => patchData({ foreignReceivables: v })} disabled={locked} />
                    <Figure label={c.currentProvision} value={-bal('1109')} />
                    <Figure label={c.targetProvision} value={pDucroire.target} strong />
                    <ProposalBlock
                      proposals={pDucroire.entry ? [pDucroire.entry] : []}
                      c={c}
                      labels={ctx.trial}
                      busy={busy === 'ducroire'}
                      done={!!generated.ducroire}
                      disabled={locked}
                      message={messages.ducroire}
                      onPrepare={() => prepare('ducroire', [pDucroire.entry!])}
                      onNothing={() => markDone('ducroire')}
                    />
                  </Step>

                  <Step n={4} title={c.s4} why={c.s4why} status={steps[3].status} whyLabel={c.why}>
                    <Text style={styles.muted}>{fill(c.netAssets, { v: chf(netAssets) })}</Text>
                    <View style={styles.assetHead}>
                      <Text style={[styles.assetCell, { flex: 1 }]} />
                      <Text style={[styles.assetHeadText, { width: 130 }]}>{c.bookValue}</Text>
                      <Text style={[styles.assetHeadText, { width: 64 }]}>{c.rate}</Text>
                      <Text style={[styles.assetHeadText, { width: 96, textAlign: 'right' }]}>CHF</Text>
                    </View>
                    {assets.map((a, i) => (
                      <View key={a.key} style={styles.assetRow}>
                        <Text style={[styles.assetCell, { flex: 1 }]} numberOfLines={1}>
                          {assetLabels[a.key] ?? a.key}
                        </Text>
                        <SmallInput
                          width={130}
                          value={a.bookValue}
                          disabled={locked}
                          onChange={(v) => patchData({ assets: assets.map((x, j) => (j === i ? { ...x, bookValue: v } : x)) })}
                        />
                        <SmallInput width={64} value={a.rate} disabled={locked} onChange={(v) => patchData({ assets: assets.map((x, j) => (j === i ? { ...x, rate: v } : x)) })} />
                        <Text style={[styles.assetAmount, { width: 96 }]}>{chf(pDep.lines.find((l) => l.key === a.key)?.amount ?? 0)}</Text>
                      </View>
                    ))}
                    <Figure label={c.depreciationTotal} value={pDep.total} strong />
                    <ProposalBlock
                      proposals={pDep.entry ? [pDep.entry] : []}
                      c={c}
                      labels={ctx.trial}
                      busy={busy === 'amortissements'}
                      done={!!generated.amortissements}
                      disabled={locked}
                      message={messages.amortissements}
                      onPrepare={() => prepare('amortissements', [pDep.entry!])}
                      onNothing={() => markDone('amortissements')}
                    />
                  </Step>

                  <Step n={5} title={c.s5} why={c.s5why} status={steps[4].status} whyLabel={c.why}>
                    {(data.accruals ?? []).map((a, i) => (
                      <View key={`${a.label}-${i}`} style={styles.accrualRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.accrualLabel}>{a.label}</Text>
                          <Text style={styles.muted}>{c.accrualKinds[a.kind]}</Text>
                        </View>
                        <Text style={styles.assetAmount}>{chf(a.amount)}</Text>
                        {!locked ? (
                          <Pressable onPress={() => patchData({ accruals: (data.accruals ?? []).filter((_, j) => j !== i) })} hitSlop={8}>
                            <Feather name="x" size={16} color={colors.textMuted} />
                          </Pressable>
                        ) : null}
                      </View>
                    ))}
                    {!locked ? (
                      <View style={styles.accrualForm}>
                        <View style={styles.chips}>
                          {ACCRUAL_KINDS.map((k) => (
                            <Pressable key={k} onPress={() => setNewAccrual((n) => ({ ...n, kind: k }))} style={[styles.chip, newAccrual.kind === k && styles.chipOn]}>
                              <Text style={[styles.chipText, newAccrual.kind === k && styles.chipTextOn]}>{c.accrualKinds[k]}</Text>
                            </Pressable>
                          ))}
                        </View>
                        <View style={styles.inline}>
                          <TextInput
                            value={newAccrual.label}
                            onChangeText={(v) => setNewAccrual((n) => ({ ...n, label: v }))}
                            placeholder={c.accrualLabel}
                            placeholderTextColor={colors.textMuted}
                            style={[styles.input, { flex: 1, minWidth: 180 }]}
                          />
                          <TextInput
                            value={newAccrual.amount}
                            onChangeText={(v) => setNewAccrual((n) => ({ ...n, amount: v }))}
                            placeholder={c.amount}
                            placeholderTextColor={colors.textMuted}
                            keyboardType="decimal-pad"
                            style={[styles.input, { width: 120 }]}
                          />
                          <Button
                            title={c.addAccrual}
                            variant="secondary"
                            icon="plus"
                           
                            onPress={() => {
                              const item: AccrualInput = { kind: newAccrual.kind, label: newAccrual.label.trim(), amount: num(newAccrual.amount) };
                              if (!item.label || item.amount <= 0) return;
                              patchData({ accruals: [...(data.accruals ?? []), item] });
                              setNewAccrual((n) => ({ ...n, label: '', amount: '' }));
                            }}
                          />
                        </View>
                      </View>
                    ) : null}
                    <ProposalBlock
                      proposals={pAccruals}
                      c={c}
                      labels={ctx.trial}
                      busy={busy === 'transitoires'}
                      done={Object.keys(generated).some((k) => k.startsWith('transitoire-'))}
                      disabled={locked}
                      message={messages.transitoires}
                      onPrepare={() =>
                        prepare(
                          'transitoires',
                          pAccruals,
                          Object.keys(generated).filter((k) => k.startsWith('transitoire-') && !pAccruals.some((p) => p.key === k)),
                        )
                      }
                      onNothing={() => markDone('transitoires')}
                    />
                  </Step>

                  <Step n={6} title={c.s6} why={c.s6why} status={steps[5].status} whyLabel={c.why}>
                    <Text style={styles.muted}>{fill(c.wipCurrent, { v: chf(bal('1300')) })}</Text>
                    <NumberField label={fill(c.wipValue, { date: endDateLabel })} value={data.wipValue ?? bal('1300')} onChange={(v) => patchData({ wipValue: v })} disabled={locked} />
                    <ProposalBlock
                      proposals={pWip.entry ? [pWip.entry] : []}
                      c={c}
                      labels={ctx.trial}
                      busy={busy === 'travaux'}
                      done={!!generated['travaux-en-cours']}
                      disabled={locked}
                      message={messages.travaux}
                      onPrepare={() => prepare('travaux', [pWip.entry!])}
                      onNothing={() => markDone('travaux')}
                    />
                  </Step>

                  <Step n={7} title={c.s7} why={c.s7why} status={steps[6].status} whyLabel={c.why}>
                    <Text style={styles.body}>{fill(c.profitBeforeTax, { v: chf(profitBeforeTax) })}</Text>
                    {legalForm === 'ri' ? (
                      <View style={[styles.notice, { backgroundColor: colors.surfaceAlt }]}>
                        <Feather name="info" size={14} color={colors.textMuted} />
                        <Text style={styles.noticeText}>{fill(c.riTax, { v: chf(pTax.avsSelfEmployed || Math.max(0, profitBeforeTax) * 0.1) })}</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.inline}>
                          <NumberField label={`${c.taxRate} · ${canton}`} value={taxRate} onChange={(v) => patchData({ taxRate: v })} disabled={locked} small />
                          <NumberField label={c.capitalTax} value={data.capitalTax ?? 0} onChange={(v) => patchData({ capitalTax: v })} disabled={locked} small />
                        </View>
                        <Figure label={fill(c.taxDue, { v: chf(pTax.tax) })} value={pTax.change} signed />
                        <ProposalBlock
                          proposals={pTax.entry ? [pTax.entry] : []}
                          c={c}
                          labels={ctx.trial}
                          busy={busy === 'impots'}
                          done={!!generated.impots}
                          disabled={locked || !legalForm}
                          message={messages.impots}
                          onPrepare={() => prepare('impots', [pTax.entry!])}
                          onNothing={() => markDone('impots')}
                        />
                      </>
                    )}
                    {legalForm === 'ri' && !done('impots') ? <LinkButton label="OK" onPress={() => markDone('impots')} /> : null}
                  </Step>

                  <Step n={8} title={c.s8} why={c.s8why} status={steps[7].status} whyLabel={c.why}>
                    {data.aiReview ? (
                      <View style={styles.aiBox}>
                        <Text style={styles.aiAt}>{fill(c.aiAt, { date: new Date(data.aiReview.at).toLocaleDateString(`${locale}-CH`) })}</Text>
                        <Text style={styles.aiText}>{data.aiReview.text}</Text>
                      </View>
                    ) : null}
                    {messages.ai ? <Text style={styles.error}>{messages.ai.text}</Text> : null}
                    <Button title={busy === 'ai' ? c.aiRunning : c.runAi} icon="cpu" variant="secondary" onPress={runAi} loading={busy === 'ai'} style={{ alignSelf: 'flex-start' }} />
                  </Step>

                  <Step n={9} title={c.s9} why={c.s9why} status={steps[8].status} whyLabel={c.why}>
                    {locked ? (
                      <View style={styles.checkRow}>
                        <Feather name="lock" size={16} color={colors.success} />
                        <Text style={styles.checkText}>{c.locked}</Text>
                      </View>
                    ) : (
                      <>
                        {blocking ? <Text style={styles.error}>{c.blocked}</Text> : null}
                        <Button title={c.lock} icon="lock" onPress={doLock} disabled={blocking} loading={busy === 'lock'} style={{ alignSelf: 'flex-start' }} />
                      </>
                    )}
                    {messages.lock ? <Text style={styles.error}>{messages.lock.text}</Text> : null}
                    <View style={styles.linkRow}>
                      {status === 'transmis' && transmittedAt ? (
                        <View style={styles.checkRow}>
                          <Feather name="send" size={16} color={colors.success} />
                          <Text style={styles.checkText}>{fill(c.transmitted, { date: new Date(transmittedAt).toLocaleDateString(`${locale}-CH`) })}</Text>
                        </View>
                      ) : fiduciary ? (
                        <Button title={fill(c.transmit, { name: fiduciary })} icon="send" onPress={doTransmit} disabled={!locked} />
                      ) : (
                        <View style={{ gap: spacing.sm }}>
                          <Text style={styles.muted}>{c.transmitNoFiduciary}</Text>
                          <LinkButton label={c.inviteFiduciary} onPress={() => router.push('/(app)/compte/fiduciaire' as any)} />
                        </View>
                      )}
                      {Platform.OS === 'web' ? <Button title={c.download} icon="download" variant="secondary" onPress={doDownload} /> : null}
                    </View>
                  </Step>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------

function StatusDot({ status, n }: { status: 'ok' | 'warning' | 'blocking' | 'todo'; n: number }) {
  const bg = status === 'ok' ? colors.success : status === 'warning' ? colors.warning : status === 'blocking' ? colors.danger : colors.surfaceAlt;
  return (
    <View style={[styles.dot, { backgroundColor: bg }]}>
      {status === 'ok' ? <Feather name="check" size={12} color="#fff" /> : <Text style={[styles.dotText, status !== 'todo' && { color: '#fff' }]}>{n}</Text>}
    </View>
  );
}

function Step({ n, title, why, status, whyLabel, children }: { n: number; title: string; why: string; status: 'ok' | 'warning' | 'blocking' | 'todo'; whyLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={styles.step}>
      <View style={styles.stepHead}>
        <StatusDot status={status} n={n} />
        <Text style={styles.stepTitle}>{title}</Text>
        <Pressable onPress={() => setOpen((v) => !v)} style={styles.whyBtn} hitSlop={6}>
          <Feather name="help-circle" size={14} color={colors.primary} />
          <Text style={styles.whyText}>{whyLabel}</Text>
        </Pressable>
      </View>
      {open ? <Text style={styles.why}>{why}</Text> : null}
      <View style={{ gap: spacing.sm }}>{children}</View>
    </Card>
  );
}

function ProposalBlock({
  proposals,
  c,
  labels,
  busy,
  done,
  disabled,
  message,
  onPrepare,
  onNothing,
}: {
  proposals: ClosingEntryProposal[];
  c: (typeof CLOSING_COPY)['fr'];
  labels: { code: string; label: string }[];
  busy: boolean;
  done: boolean;
  disabled: boolean;
  message?: { ok: boolean; text: string };
  onPrepare: () => void;
  onNothing: () => void;
}) {
  const labelOf = (code: string) => labels.find((l) => l.code === code)?.label ?? CLOSING_ACCOUNTS[code]?.label ?? '';
  if (!proposals.length) {
    return (
      <View style={styles.nothing}>
        <Text style={styles.muted}>{c.nothingToBook}</Text>
        {!done && !disabled ? <LinkButton label="OK" onPress={onNothing} /> : null}
      </View>
    );
  }
  return (
    <View style={styles.proposal}>
      <View style={styles.propHead}>
        <Text style={[styles.propHeadText, { flex: 1 }]}>{c.account}</Text>
        <Text style={[styles.propHeadText, styles.propNum]}>{c.debit}</Text>
        <Text style={[styles.propHeadText, styles.propNum]}>{c.credit}</Text>
      </View>
      {proposals.map((p) => (
        <View key={p.key}>
          {proposals.length > 1 ? <Text style={styles.propLabel}>{p.label}</Text> : null}
          {p.lines.map((l, i) => (
            <View key={i} style={styles.propRow}>
              <Text style={[styles.propCell, { flex: 1 }]} numberOfLines={1}>
                <Text style={styles.propCode}>{l.account}</Text> {labelOf(l.account)}
              </Text>
              <Text style={[styles.propCell, styles.propNum]}>{l.debit ? chf(l.debit) : ''}</Text>
              <Text style={[styles.propCell, styles.propNum]}>{l.credit ? chf(l.credit) : ''}</Text>
            </View>
          ))}
        </View>
      ))}
      <View style={styles.propActions}>
        {done ? (
          <View style={styles.checkRow}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.muted, { color: colors.success }]}>{c.stepDone}</Text>
          </View>
        ) : null}
        {!disabled ? <Button title={done ? c.prepareAgain : c.prepare} icon="edit-3" variant={done ? 'secondary' : 'primary'} onPress={onPrepare} loading={busy} /> : null}
      </View>
      {message ? <Text style={message.ok ? styles.okText : styles.error}>{message.text}</Text> : null}
    </View>
  );
}

function Figure({ label, value, strong, signed }: { label: string; value: number; strong?: boolean; signed?: boolean }) {
  return (
    <View style={styles.figure}>
      <Text style={[styles.figureLabel, strong && { fontWeight: '700', color: colors.text }]}>{label}</Text>
      <Text style={[styles.figureValue, strong && { fontWeight: '800' }]}>
        {signed && value > 0 ? '+' : ''}
        {chf(value)}
      </Text>
    </View>
  );
}

function SummaryRow({ label, value, strong, signed }: { label: string; value: number; strong?: boolean; signed?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong && { color: '#FBF6EE', fontWeight: '700' }]}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryStrong, value < 0 && !signed && { color: '#F2A193' }]}>
        {signed && value > 0 ? '+' : ''}
        {chf(value)}
      </Text>
    </View>
  );
}

function NumberField({ label, value, onChange, disabled, small }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean; small?: boolean }) {
  const [text, setText] = useState(String(value || ''));
  useEffect(() => setText(value ? String(value) : ''), [value]);
  return (
    <View style={[styles.field, small && { minWidth: 160, flex: 1 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={text}
        editable={!disabled}
        onChangeText={setText}
        onBlur={() => onChange(num(text))}
        onSubmitEditing={() => onChange(num(text))}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { maxWidth: 220 }]}
      />
    </View>
  );
}

function SmallInput({ value, onChange, width, disabled }: { value: number; onChange: (v: number) => void; width: number; disabled?: boolean }) {
  const [text, setText] = useState(String(value || ''));
  useEffect(() => setText(value ? String(value) : ''), [value]);
  return (
    <TextInput
      value={text}
      editable={!disabled}
      onChangeText={setText}
      onBlur={() => onChange(num(text))}
      keyboardType="decimal-pad"
      placeholder="0"
      placeholderTextColor={colors.textMuted}
      style={[styles.input, styles.smallInput, { width }]}
    />
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <Text style={styles.link}>{label} →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg, width: '100%', maxWidth: 820, alignSelf: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: -spacing.sm, lineHeight: 20, maxWidth: 760 },
  body: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  muted: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  error: { fontSize: fontSize.xs, color: colors.danger },
  okText: { fontSize: fontSize.xs, color: colors.success },
  link: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  yearRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  yearLabel: { ...monoType, fontSize: 11, letterSpacing: 0.8, color: colors.textMuted, textTransform: 'uppercase' },
  yearChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  yearChipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  yearChipText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  yearChipTextOn: { color: colors.primaryDark },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  noticeText: { flex: 1, fontSize: fontSize.xs, color: colors.text, lineHeight: 17 },
  howCard: { gap: spacing.sm },
  howHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  howTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  howRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  howNum: { ...monoType, width: 18, fontSize: 12, color: colors.primary, lineHeight: 20 },
  howText: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  layout: { gap: spacing.lg },
  side: { gap: spacing.lg },
  steps: { flex: 1, gap: spacing.lg },
  progressLabel: { ...monoType, fontSize: 12, color: colors.textMuted },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.success },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 3 },
  navText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  summary: { backgroundColor: colors.text, borderColor: colors.text, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  summaryLabel: { flex: 1, fontSize: fontSize.xs, color: '#D9CBB8' },
  summaryValue: { fontSize: fontSize.sm, fontWeight: '700', color: '#FBF6EE', fontVariant: ['tabular-nums'] },
  summaryStrong: { ...displayType, fontSize: 22, fontWeight: '800' },
  summaryRule: { height: 1, backgroundColor: '#4A3D31' },
  step: { gap: spacing.sm },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  whyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  whyText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.primary },
  why: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20, backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.md },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  chipTextOn: { color: colors.primaryDark },
  figure: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  figureLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted },
  figureValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] },
  field: { gap: 4 },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 8, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.bg },
  smallInput: { paddingHorizontal: spacing.sm, paddingVertical: 6, textAlign: 'right' },
  inline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: spacing.sm },
  assetHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  assetHeadText: { ...monoType, fontSize: 10, color: colors.textMuted },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 3 },
  assetCell: { fontSize: fontSize.sm, color: colors.text },
  assetAmount: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, textAlign: 'right', fontVariant: ['tabular-nums'] },
  accrualRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  accrualLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  accrualForm: { gap: spacing.sm, paddingTop: spacing.xs },
  proposal: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: 4, backgroundColor: colors.bg },
  propHead: { flexDirection: 'row', gap: spacing.sm, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  propHeadText: { ...monoType, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
  propNum: { width: 92, textAlign: 'right' },
  propRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 3 },
  propCell: { fontSize: fontSize.sm, color: colors.text, fontVariant: ['tabular-nums'] },
  propCode: { ...monoType, fontSize: 11, color: colors.primary },
  propLabel: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, marginTop: spacing.xs },
  propActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  nothing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  aiBox: { backgroundColor: colors.slateSoft, borderRadius: radius.md, padding: spacing.md, gap: 6 },
  aiAt: { ...monoType, fontSize: 10.5, color: colors.slate },
  aiText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 21 },
});
