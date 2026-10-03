import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PageHero, pageWrap } from '../components/landing/PageHero';
import { CtaButton } from '../components/landing/CtaButton';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { Heading } from '../components/Heading';
import { authHref } from '../lib/appHost';
import { computeSwissPayroll, type PayLine, type SwissOverrides, type SwissPayroll, type SwissSituation } from '../lib/payroll/swissEngine.ts';
import { CANTONS, DEFAULT_LAA, socialRatesFor, whtCode, type Canton, type Permit, type WhtSteps } from '../lib/payroll/swissReferences.ts';
import { CALCULATOR_COPY, type CalculatorCopy } from '../lib/payroll/calculatorCopy';
import { fill } from '../lib/payroll/wizardCopy';
import { SimplePdf, downloadPdf, type Rgb } from '../lib/pdf/simplePdf';
import { LeadGate } from '../components/tools/LeadGate';
import { getAppLocale, type AppLocale } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { breakpoints, colors, spacing } from '../lib/theme';
import { displayType, marketingFonts, monoType } from '../lib/marketingTheme';

// Free public salary calculator (cantia.ch/calculateur-salaire, plus the
// /de and /it twins): gross → net and employer cost for one employee, with
// the same engine as the payslips in the app (lib/payroll/swissEngine.ts):
// AVS/AI/APG, AC, LPP by age on the coordinated salary (legal minimum or
// the fund's own plan, from 18), LAA, family allowances, withholding tax
// from the official ESTV scale (public.swiss_wht_tariffs, readable
// anonymously). Nothing is stored; everything runs in the visitor's
// browser, including the one-page PDF summary.

const YEAR = 2026;
const RATES = socialRatesFor(YEAR);

type Residence = SwissSituation['residenceCountry'];
type WhtReason = keyof CalculatorCopy['whtReasons'];

const PERMITS: Permit[] = ['swiss', 'C', 'B', 'L', 'G', 'other'];
const RESIDENCES: Exclude<Residence, 'other'>[] = ['CH', 'FR', 'DE', 'IT', 'AT'];
const FRANCE_AGREEMENT: Canton[] = ['BE', 'BS', 'BL', 'JU', 'NE', 'SO', 'VD', 'VS'];

function chf(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

function num(s: string): number | null {
  const n = Number(s.replace(/[’'\s]/g, '').replace(',', '.'));
  return s.trim() && Number.isFinite(n) ? n : null;
}

function pct(n: number, locale: AppLocale): string {
  const v = Number(n.toFixed(3)).toString();
  return `${locale === 'fr' || locale === 'it' ? v.replace('.', ',') : v} %`;
}

// The step-by-step LPP article exists in French only.
const LPP_ARTICLE = '/blog/calcul-lpp-employe-taux-salaire-coordonne-2026';

// Same rules as isSubjectToWht (lib/payroll/swissReferences.ts), with the
// reason as a key so it can be said in the visitor's language.
function whtSubject(permit: Permit, couple: boolean, spouseSwiss: boolean, residence: Residence, canton: Canton): { subject: boolean; reason: WhtReason } {
  if (permit === 'swiss') return { subject: false, reason: 'swiss' };
  if (permit === 'C') return { subject: false, reason: 'C' };
  if (couple && spouseSwiss && residence === 'CH') return { subject: false, reason: 'spouse' };
  if (residence === 'FR' && FRANCE_AGREEMENT.includes(canton)) return { subject: false, reason: 'france' };
  return { subject: true, reason: residence === 'CH' ? 'permit' : 'border' };
}

export default function SalaryCalculatorPage() {
  const locale = getAppLocale();
  const c = CALCULATOR_COPY[locale] ?? CALCULATOR_COPY.fr;
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;

  const [grossInput, setGrossInput] = useState('5’500');
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [birthYear, setBirthYear] = useState('1994');
  const [canton, setCanton] = useState<Canton>(locale === 'de' ? 'ZH' : locale === 'it' ? 'TI' : 'VD');
  const [permit, setPermit] = useState<Permit>('swiss');
  const [residence, setResidence] = useState<Residence>('CH');
  const [married, setMarried] = useState(false);
  const [spouseWorks, setSpouseWorks] = useState(false);
  const [spouseSwiss, setSpouseSwiss] = useState(false);
  const [kids, setKids] = useState(0);
  const [kidsTraining, setKidsTraining] = useState(0);
  const [church, setChurch] = useState(false);
  const [plan, setPlan] = useState<'legal' | 'fund'>('legal');
  const [fundRate, setFundRate] = useState('');
  const [fundYoungRate, setFundYoungRate] = useState('');
  const [erShare, setErShare] = useState('50');
  const [aanp, setAanp] = useState(String(DEFAULT_LAA.aanpPercent));
  const [aap, setAap] = useState(String(DEFAULT_LAA.aapPercent));
  const [steps, setSteps] = useState<WhtSteps | null>(null);
  const [stepsLoading, setStepsLoading] = useState(false);

  const grossValue = num(grossInput) ?? 0;
  const monthly = period === 'month' ? grossValue : grossValue / 12;
  const by = num(birthYear);
  const validYear = by !== null && by > 1940 && by <= YEAR - 14;
  const age = validYear ? YEAR - by! : null;
  const effResidence: Residence = permit === 'G' && residence === 'CH' ? 'FR' : residence;

  const situation: SwissSituation = {
    birthDate: validYear ? `${by}-07-01` : null,
    permit,
    maritalStatus: married ? 'married' : 'single',
    spouseIsSwissOrC: married && spouseSwiss,
    spouseWorks: married && spouseWorks,
    livesWithChildren: kids + kidsTraining > 0,
    childrenUnder16: kids,
    childrenInTraining: kidsTraining,
    church,
    residenceCountry: effResidence,
    residenceCanton: canton,
    workCanton: canton,
    lppInsured: true,
    receivesFamilyAllowances: kids + kidsTraining > 0,
  };
  const wht = whtSubject(permit, married, spouseSwiss, effResidence, canton);
  const code = wht.subject ? whtCode({ ...situation, children: kids + kidsTraining }) : null;

  useEffect(() => {
    let alive = true;
    if (!wht.subject || !code) {
      setSteps(null);
      return;
    }
    setStepsLoading(true);
    // Never leave « Chargement… » on screen if the request hangs.
    const timer = setTimeout(() => alive && setStepsLoading(false), 8000);
    supabase
      .from('swiss_wht_tariffs')
      .select('steps')
      .eq('year', YEAR)
      .eq('canton', canton)
      .eq('code', code)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        setSteps(!error && data ? (data.steps as WhtSteps) : null);
        setStepsLoading(false);
      })
      .then(undefined, () => {
        if (!alive) return;
        setSteps(null);
        setStepsLoading(false);
      });
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [wht.subject, code, canton]);

  const overrides: SwissOverrides = {
    aanpPercent: num(aanp) ?? DEFAULT_LAA.aanpPercent,
    aapPercent: num(aap) ?? DEFAULT_LAA.aapPercent,
    lppTotalPercent: plan === 'fund' ? num(fundRate) : null,
    lppYoungPercent: plan === 'fund' ? num(fundYoungRate) : null,
    lppEmployerSharePercent: plan === 'fund' ? num(erShare) : 50,
    whtSubject: wht.subject,
  };
  const payroll = useMemo(
    () => computeSwissPayroll(situation, monthly, YEAR, { overrides, whtSteps: steps }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(situation), monthly, JSON.stringify(overrides), steps],
  );

  const label = (l: PayLine, side: 'ee' | 'er') => lineLabel(c, l, side, canton, code);
  const lpp = lppStory(c, locale, age, monthly * 12, plan, payroll.lpp);
  const whtTitle = wht.subject ? fill(c.whtYes, { code: code ?? '' }) : c.whtNo;
  const whtText = whtStory(c, locale, wht, permit, canton, code, payroll.wht.ratePercent, stepsLoading, payroll.wht.missingScale);

  const onPdf = () => {
    const pdf = buildPdf({ c, locale, payroll, age, canton, permitLabel: c.permits[permit as keyof typeof c.permits], lppTitle: c.lppPrefix + lpp.title, lppText: lpp.text, whtTitle, whtText: stepsLoading ? whtText.replace(` ${c.whtLoading}`, '') : whtText, label });
    downloadPdf(pdf, `${c.pdfFile}-${YEAR}`);
  };

  const form = (
    <View style={styles.form}>
      <Group title={c.salary}>
        <View style={styles.inline}>
          <Input value={grossInput} onChange={setGrossInput} suffix={c.grossSuffix} wide />
          <Chips value={period} onChange={setPeriod} options={[{ value: 'month', label: c.perMonth }, { value: 'year', label: c.perYear }]} />
        </View>
        <Hint>{period === 'year' ? fill(c.monthlyIs, { v: chf(monthly) }) : fill(c.yearlyIs, { v: chf(monthly * 12) })}</Hint>
      </Group>

      <Group title={c.employee}>
        <Label>{c.birthYear}</Label>
        <View style={styles.inline}>
          <Input value={birthYear} onChange={setBirthYear} placeholder="1994" />
          <Text style={styles.ageText}>{age !== null ? fill(c.ageIn, { age, year: YEAR }) : c.badYear}</Text>
        </View>
        <Label>{c.permit}</Label>
        <Chips value={permit} onChange={setPermit} options={PERMITS.map((p) => ({ value: p, label: c.permits[p as keyof typeof c.permits] }))} />
        <Label>{c.residence}</Label>
        <Chips value={effResidence} onChange={setResidence} options={RESIDENCES.map((r) => ({ value: r as Residence, label: c.residences[r] }))} />
        <Label>{c.marital}</Label>
        <Chips value={married ? 'm' : 's'} onChange={(v) => setMarried(v === 'm')} options={[{ value: 's', label: c.single }, { value: 'm', label: c.married }]} />
        {married ? (
          <>
            <Chips value={spouseWorks ? 'y' : 'n'} onChange={(v) => setSpouseWorks(v === 'y')} options={[{ value: 'n', label: c.spouseNoIncome }, { value: 'y', label: c.spouseWorks }]} />
            {permit !== 'swiss' && permit !== 'C' ? (
              <Chips value={spouseSwiss ? 'y' : 'n'} onChange={(v) => setSpouseSwiss(v === 'y')} options={[{ value: 'n', label: c.spouseForeign }, { value: 'y', label: c.spouseSwiss }]} />
            ) : null}
          </>
        ) : null}
        <View style={styles.counters}>
          <Counter label={c.kids} value={kids} onChange={setKids} less={c.less} more={c.more} />
          <Counter label={c.kidsTraining} value={kidsTraining} onChange={setKidsTraining} less={c.less} more={c.more} />
        </View>
        {wht.subject ? <Chips value={church ? 'y' : 'n'} onChange={(v) => setChurch(v === 'y')} options={[{ value: 'n', label: c.noChurch }, { value: 'y', label: c.church }]} /> : null}
      </Group>

      <Group title={c.company}>
        <Label>{c.workCanton}</Label>
        <View style={styles.cantons}>
          {CANTONS.map((k) => (
            <Pressable key={k} onPress={() => setCanton(k)} style={[styles.canton, canton === k && styles.chipOn]}>
              <Text style={[styles.cantonText, canton === k && styles.chipTextOn]}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <Label>{c.pension}</Label>
        <Chips value={plan} onChange={setPlan} options={[{ value: 'legal', label: c.legalMin }, { value: 'fund', label: c.fundPlan }]} />
        {plan === 'fund' ? (
          <View style={styles.fundBox}>
            <View style={styles.fundRow}>
              <View style={styles.fundCell}>
                <Label>{c.fundRate}</Label>
                <Input value={fundRate} onChange={setFundRate} placeholder="7" suffix="%" />
              </View>
              <View style={styles.fundCell}>
                <Label>{c.fundYoung}</Label>
                <Input value={fundYoungRate} onChange={setFundYoungRate} placeholder={c.fundYoungPh} suffix="%" />
              </View>
              <View style={styles.fundCell}>
                <Label>{c.erShare}</Label>
                <Input value={erShare} onChange={setErShare} placeholder="50" suffix="%" />
              </View>
            </View>
            <Hint>{c.fundHint}</Hint>
          </View>
        ) : null}
        <Label>{c.laa}</Label>
        <View style={styles.fundRow}>
          <View style={styles.fundCell}>
            <Input value={aanp} onChange={setAanp} suffix={c.aanpSuffix} />
          </View>
          <View style={styles.fundCell}>
            <Input value={aap} onChange={setAap} suffix={c.aapSuffix} />
          </View>
        </View>
        <Hint>{c.laaHint}</Hint>
      </Group>
    </View>
  );

  const result = (
    <View style={styles.result}>
      <View style={styles.netCard}>
        <Text style={styles.netLabel}>{c.netLabel}</Text>
        <Text style={[styles.netValue, width < breakpoints.tablet && { fontSize: 38, lineHeight: 42 }]}>CHF {chf(payroll.net)}</Text>
        <Text style={styles.netSub}>
          {fill(c.netSub, { gross: chf(payroll.gross), ded: chf(payroll.totalDeductions) })}
          {payroll.familyAllowance > 0 ? fill(c.netSubAllow, { v: chf(payroll.familyAllowance) }) : ''}
        </Text>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>{c.totalCost}</Text>
          <Text style={styles.costValue}>
            CHF {chf(payroll.totalCost)} {c.perMonthShort}
          </Text>
        </View>
      </View>

      <Table title={c.deductions} lines={payroll.employee} label={(l) => label(l, 'ee')} of={c.of} locale={locale} sign="−" total={payroll.totalDeductions} totalLabel={c.totalDeductions} />
      {payroll.familyAllowance > 0 ? (
        <View style={styles.allowRow}>
          <Text style={styles.lineLabel}>{fill(c.allowances, { canton })}</Text>
          <Text style={[styles.lineAmount, { color: colors.success }]}>+{chf(payroll.familyAllowance)}</Text>
        </View>
      ) : null}
      <Table title={c.employerCharges} lines={payroll.employer} label={(l) => label(l, 'er')} of={c.of} locale={locale} sign="+" total={payroll.totalEmployer} totalLabel={c.totalEmployer} />

      <Explain tone={payroll.lpp.applies ? 'ok' : 'info'} title={c.lppPrefix + lpp.title}>
        {lpp.text}
      </Explain>
      <Explain tone={wht.subject ? 'warn' : 'ok'} title={whtTitle}>
        {whtText}
      </Explain>

      {Platform.OS === 'web' ? (
        <View style={styles.pdfRow}>
          <LeadGate source="outil:calculateur-salaire" locale={locale} onUnlock={onPdf} label={c.pdfButton} />
          <Text style={styles.hint}>{c.pdfHint}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead title={c.metaTitle} description={c.metaDescription} />
      <MarketingNav />
      <ScrollView>
        <PageHero kicker={fill(c.kicker, { year: YEAR })} title={c.title} lede={c.lede} />
        <View style={[pageWrap, styles.body]}>
          <View style={[styles.columns, wide && styles.columnsWide]}>
            <View style={wide ? { flex: 1 } : null}>{form}</View>
            <View style={wide ? { flex: 1 } : null}>{result}</View>
          </View>

          <Cta c={c} />

          <View style={styles.section}>
            <Heading level={2} style={styles.h2}>
              {c.sitTitle}
            </Heading>
            <Text style={styles.p}>{c.sitText}</Text>
            <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }}>
              <View style={styles.sitTable}>
                <View style={[styles.sitRow, styles.sitHead]}>
                  {c.sitHead.map((h, i) => (
                    <Text key={h} style={[styles.sitCell, styles.sitHeadText, { flex: [1, 1.4, 1.2][i] }]}>
                      {h}
                    </Text>
                  ))}
                </View>
                {c.sitRows.map((r) => (
                  <View key={r[0]} style={styles.sitRow}>
                    <Text style={[styles.sitCell, { flex: 1, fontWeight: '600' }]}>{r[0]}</Text>
                    <Text style={[styles.sitCell, { flex: 1.4 }]}>{r[1]}</Text>
                    <Text style={[styles.sitCell, { flex: 1.2 }]}>{r[2]}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <Link href={LPP_ARTICLE as any}>
              <Text style={styles.link}>{c.sitLink}</Text>
            </Link>
          </View>

          <View style={styles.sources}>
            <Text style={styles.sourcesText}>{fill(c.sources, { avs: pct(RATES.avsAiApgPercent, locale), ac: pct(RATES.acPercent, locale), year: YEAR })}</Text>
          </View>
        </View>
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// The words around the numbers

function lineLabel(c: CalculatorCopy, l: PayLine, side: 'ee' | 'er', canton: Canton, code: string | null): string {
  if (l.key === 'caf') return fill(side === 'ee' ? c.lines.cafEe : c.lines.cafEr, { canton });
  if (l.key === 'wht') return fill(c.lines.wht, { code: code ?? '' });
  return (c.lines as Record<string, string>)[l.key] ?? l.label;
}

function lppStory(
  c: CalculatorCopy,
  locale: AppLocale,
  age: number | null,
  annual: number,
  plan: 'legal' | 'fund',
  lpp: SwissPayroll['lpp'],
): { title: string; text: string } {
  if (annual < RATES.lppEntryThresholdChf) return { title: c.lppBelowTitle, text: fill(c.lppBelow, { v: chf(annual) }) };
  if (age !== null && age < 18) return { title: c.lppMinorTitle, text: c.lppMinor };
  if (age !== null && age < 25 && !lpp.applies) return { title: c.lppYoungNoneTitle, text: c.lppYoungNone };
  const rate = pct(lpp.creditPercent, locale);
  const base = fill(c.lppBase, { v: chf(lpp.coordinatedMonthly) });
  const split = fill(c.lppSplit, { er: pct(lpp.employerSharePercent, locale), ee: pct(100 - lpp.employerSharePercent, locale) });
  if (age !== null && age < 25) return { title: fill(c.lppYoungTitle, { rate }), text: `${base} ${fill(c.lppYoung, { rate })} ${split}` };
  const legal = plan === 'legal' || lpp.creditPercent === 0;
  return {
    title: fill(c.lppTitle, { rate, age: age ?? '?' }) + (legal ? c.lppLegalTag : c.lppFundTag),
    text: `${base} ${legal ? c.lppLegal : c.lppFund} ${split}`,
  };
}

function whtStory(
  c: CalculatorCopy,
  locale: AppLocale,
  wht: { subject: boolean; reason: WhtReason },
  permit: Permit,
  canton: Canton,
  code: string | null,
  rate: number,
  loading: boolean,
  missing: boolean,
): string {
  const reason = fill(c.whtReasons[wht.reason], { p: permit });
  if (!wht.subject) return fill(c.whtNot, { reason });
  const letter = (code?.[0] ?? 'A') as keyof CalculatorCopy['whtWho'];
  const why = fill(c.whtWhy, { reason, code: code ?? '', who: c.whtWho[letter] ?? '', kids: code?.[1] ?? '0', church: code?.[2] === 'Y' ? c.whtChurchYes : c.whtChurchNo, canton });
  if (loading) return `${why} ${c.whtLoading}`;
  if (missing) return `${why} ${c.whtMissing}`;
  return `${why} ${fill(c.whtRate, { year: YEAR, rate: pct(rate, locale) })}`;
}

// ---------------------------------------------------------------------------
// One-page PDF summary

const INK: Rgb = [35, 26, 18];
const MUTED: Rgb = [110, 97, 83];
const BRAND: Rgb = [169, 92, 48];
const DARK: Rgb = [124, 59, 33];
const SOFT: Rgb = [247, 241, 230];

function buildPdf(o: {
  c: CalculatorCopy;
  locale: AppLocale;
  payroll: SwissPayroll;
  age: number | null;
  canton: Canton;
  permitLabel: string;
  lppTitle: string;
  lppText: string;
  whtTitle: string;
  whtText: string;
  label: (l: PayLine, side: 'ee' | 'er') => string;
}): string {
  const { c, locale, payroll: p } = o;
  const doc = new SimplePdf();
  const L = 48;
  const R = doc.width - 48;
  const W = R - L;

  doc.rect(0, 0, doc.width, 6, BRAND);
  doc.text('CANTIA', L, 40, { size: 11, bold: true, color: BRAND });
  doc.text(fill(c.pdfTitle, { year: YEAR }), L, 66, { size: 20, bold: true });
  const date = new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : locale === 'it' ? 'it-CH' : 'fr-CH');
  doc.text(fill(c.pdfMade, { date }), L, 82, { size: 8.5, color: MUTED });

  // Situation strip
  let y = 102;
  doc.rect(L, y, W, 40, SOFT);
  const cells: [string, string][] = [
    [c.pdfGross, `CHF ${chf(p.gross)}`],
    [c.pdfAge, o.age !== null ? String(o.age) : '—'],
    [c.permit, o.permitLabel],
    [c.pdfCanton, o.canton],
  ];
  cells.forEach(([k, v], i) => {
    const x = L + 12 + (i * (W - 24)) / 4;
    doc.text(k.toUpperCase(), x, y + 15, { size: 6.5, bold: true, color: MUTED });
    doc.text(v, x, y + 30, { size: 10.5, bold: true });
  });

  // Net
  y += 56;
  doc.rect(L, y, W, 52, INK);
  doc.text(c.pdfNet.toUpperCase(), L + 14, y + 18, { size: 7.5, bold: true, color: [232, 201, 168] });
  doc.text(`CHF ${chf(p.net)}`, L + 14, y + 40, { size: 20, bold: true, color: [251, 246, 238] });
  doc.text(`${c.pdfMonth}`, R - 14, y + 18, { size: 7.5, bold: true, color: [232, 201, 168], align: 'right' });
  doc.text(`${c.pdfYear}${locale === 'fr' ? ' :' : ':'} CHF ${chf(p.net * 12)}`, R - 14, y + 40, { size: 10, color: [251, 246, 238], align: 'right' });

  const table = (title: string, lines: PayLine[], side: 'ee' | 'er', sign: string, total: number, totalLabel: string) => {
    y += 22;
    doc.text(title, L, y, { size: 11, bold: true });
    y += 6;
    for (const l of lines) {
      y += 17;
      doc.line(L, y - 12, R, y - 12);
      doc.text(o.label(l, side), L, y, { size: 9.5 });
      doc.text(`${l.ratePercent != null ? pct(l.ratePercent, locale) : ''} ${c.of} CHF ${chf(l.base)}`, R - 110, y, { size: 8, color: MUTED, align: 'right' });
      doc.text(`${sign}${chf(l.amount)}`, R, y, { size: 9.5, align: 'right' });
    }
    y += 18;
    doc.line(L, y - 12, R, y - 12, INK, 0.9);
    doc.text(totalLabel, L, y, { size: 9.5, bold: true });
    doc.text(`${sign}${chf(total)}`, R, y, { size: 9.5, bold: true, align: 'right' });
  };

  y += 52;
  table(c.deductions, p.employee, 'ee', '-', p.totalDeductions, c.totalDeductions);
  if (p.familyAllowance > 0) {
    y += 17;
    doc.text(fill(c.allowances, { canton: o.canton }), L, y, { size: 9.5 });
    doc.text(`+${chf(p.familyAllowance)}`, R, y, { size: 9.5, align: 'right', color: [46, 107, 79] });
  }
  table(c.employerCharges, p.employer, 'er', '+', p.totalEmployer, c.totalEmployer);
  y += 18;
  doc.text(c.totalCost, L, y, { size: 10, bold: true, color: DARK });
  doc.text(`CHF ${chf(p.totalCost)} ${c.perMonthShort}`, R, y, { size: 10, bold: true, color: DARK, align: 'right' });

  // Explanations
  y += 26;
  doc.text(o.lppTitle, L, y, { size: 9.5, bold: true });
  y = doc.paragraph(o.lppText, L, y + 13, W, { size: 8.5, color: MUTED, leading: 11.5 });
  y += 8;
  doc.text(o.whtTitle, L, y, { size: 9.5, bold: true });
  y = doc.paragraph(o.whtText, L, y + 13, W, { size: 8.5, color: MUTED, leading: 11.5 });

  // CTA footer
  const ctaY = Math.max(y + 16, doc.height - 92);
  doc.rect(L, ctaY, W, 34, DARK);
  doc.text(c.pdfCta, L + 14, ctaY + 21, { size: 9.5, bold: true, color: [251, 246, 238] });
  doc.link(L, ctaY, W, 34, 'https://cantia.ch');
  doc.paragraph(c.pdfDisclaimer, L, ctaY + 50, W, { size: 7, color: MUTED, leading: 9 });

  return doc.build(fill(c.pdfTitle, { year: YEAR }));
}

// ---------------------------------------------------------------------------

function Cta({ c }: { c: CalculatorCopy }) {
  return (
    <View style={styles.cta}>
      <Text style={styles.ctaKicker}>{c.ctaKicker}</Text>
      <Heading level={2} style={styles.ctaTitle}>
        {c.ctaTitle}
      </Heading>
      <View style={styles.ctaList}>
        {c.ctaPoints.map((p) => (
          <View key={p} style={styles.ctaItem}>
            <Text style={styles.ctaCheck}>✓</Text>
            <Text style={styles.ctaText}>{p}</Text>
          </View>
        ))}
      </View>
      <View style={styles.ctaButtons}>
        <Link href={authHref('signup') as any} asChild>
          <CtaButton title={c.ctaButton} tone="light" />
        </Link>
        <Text style={styles.ctaNote}>{c.ctaNote}</Text>
      </View>
    </View>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Hint({ children }: { children: ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

function Input({ value, onChange, placeholder, suffix, wide }: { value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string; wide?: boolean }) {
  return (
    <View style={[styles.inputWrap, wide && { flex: 1, minWidth: 160 }]}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" inputMode="decimal" style={styles.input} />
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
  );
}

function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.chip, value === o.value && styles.chipOn]}>
          <Text style={[styles.chipText, value === o.value && styles.chipTextOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Counter({ label, value, onChange, less, more }: { label: string; value: number; onChange: (n: number) => void; less: string; more: string }) {
  return (
    <View style={styles.counter}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterCtl}>
        <Pressable onPress={() => onChange(Math.max(0, value - 1))} style={styles.counterBtn} accessibilityLabel={`${less} : ${label}`}>
          <Text style={styles.counterBtnText}>−</Text>
        </Pressable>
        <Text style={styles.counterValue}>{value}</Text>
        <Pressable onPress={() => onChange(Math.min(9, value + 1))} style={styles.counterBtn} accessibilityLabel={`${more} : ${label}`}>
          <Text style={styles.counterBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Table({
  title,
  lines,
  label,
  of,
  locale,
  sign,
  total,
  totalLabel,
}: {
  title: string;
  lines: PayLine[];
  label: (l: PayLine) => string;
  of: string;
  locale: AppLocale;
  sign: '−' | '+';
  total: number;
  totalLabel: string;
}) {
  return (
    <View style={styles.table}>
      <Text style={styles.tableTitle}>{title}</Text>
      {lines.map((l) => (
        <View key={l.key + l.label} style={styles.line}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lineLabel}>{label(l)}</Text>
            <Text style={styles.lineMeta}>
              {l.ratePercent != null ? pct(l.ratePercent, locale) : ''} {of} CHF {chf(l.base)}
            </Text>
          </View>
          <Text style={styles.lineAmount}>
            {sign}
            {chf(l.amount)}
          </Text>
        </View>
      ))}
      <View style={[styles.line, styles.lineTotal]}>
        <Text style={[styles.lineLabel, { flex: 1, fontWeight: '700' }]}>{totalLabel}</Text>
        <Text style={[styles.lineAmount, { fontWeight: '700' }]}>
          {sign}
          {chf(total)}
        </Text>
      </View>
    </View>
  );
}

function Explain({ tone, title, children }: { tone: 'ok' | 'info' | 'warn'; title: string; children: ReactNode }) {
  const bg = tone === 'ok' ? colors.successSoft : tone === 'warn' ? colors.warningSoft : colors.surfaceAlt;
  const fg = tone === 'ok' ? colors.success : tone === 'warn' ? colors.warning : ink;
  return (
    <View style={[styles.explain, { backgroundColor: bg }]}>
      <Text style={[styles.explainTitle, { color: fg }]}>{title}</Text>
      <Text style={styles.explainText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: spacing.xxxl, gap: spacing.xxxl },
  columns: { gap: spacing.xl },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  form: { gap: spacing.lg },
  group: { gap: spacing.sm, padding: spacing.lg, borderWidth: 1, borderColor: rule, backgroundColor: colors.surface, borderRadius: 4 },
  groupTitle: { ...monoType, fontSize: 11, letterSpacing: 1.2, color: colors.primary, marginBottom: spacing.xs },
  label: { fontFamily: marketingFonts.body, fontSize: 13, fontWeight: '600', color: ink, marginTop: spacing.xs },
  hint: { fontFamily: marketingFonts.body, fontSize: 12, color: bodyInk, lineHeight: 17 },
  inline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  ageText: { ...monoType, fontSize: 12, color: bodyInk },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.bg, paddingHorizontal: spacing.md, minHeight: 44 },
  input: { flex: 1, minWidth: 60, fontFamily: marketingFonts.body, fontSize: 16, fontWeight: '600', color: ink, paddingVertical: 10, outlineStyle: 'none' } as any,
  suffix: { fontFamily: marketingFonts.body, fontSize: 13, color: bodyInk, marginLeft: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontFamily: marketingFonts.body, fontSize: 13, fontWeight: '600', color: ink },
  chipTextOn: { color: colors.primaryDark },
  cantons: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  canton: { width: 40, paddingVertical: 7, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.surface },
  cantonText: { ...monoType, fontSize: 11, color: ink },
  counters: { gap: spacing.sm, marginTop: spacing.xs },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  counterLabel: { flex: 1, fontFamily: marketingFonts.body, fontSize: 13, color: ink },
  counterCtl: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  counterBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.surface },
  counterBtnText: { fontSize: 18, fontWeight: '600', color: ink },
  counterValue: { ...monoType, width: 20, textAlign: 'center', fontSize: 14, color: ink },
  fundBox: { gap: spacing.sm },
  fundRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fundCell: { flex: 1, minWidth: 130, gap: 2 },

  result: { gap: spacing.lg },
  netCard: { padding: spacing.xl, backgroundColor: ink, borderRadius: 4, gap: 6 },
  netLabel: { ...monoType, fontSize: 11, letterSpacing: 1.2, color: '#E8C9A8' },
  netValue: { ...displayType, fontSize: 52, lineHeight: 54, fontWeight: '800', color: '#FBF6EE', fontVariant: ['tabular-nums'] },
  netSub: { fontFamily: marketingFonts.body, fontSize: 13, color: '#D9CBB8' },
  costRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: '#4A3D31' },
  costLabel: { fontFamily: marketingFonts.body, fontSize: 14, color: '#D9CBB8' },
  costValue: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: '#FBF6EE', fontVariant: ['tabular-nums'] },
  table: { borderWidth: 1, borderColor: rule, backgroundColor: colors.surface, borderRadius: 4, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  tableTitle: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: ink, paddingVertical: spacing.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  lineTotal: { borderTopColor: ink },
  lineLabel: { fontFamily: marketingFonts.body, fontSize: 14, color: ink },
  lineMeta: { ...monoType, fontSize: 10.5, color: bodyInk, marginTop: 2 },
  lineAmount: { fontFamily: marketingFonts.body, fontSize: 14, fontWeight: '600', color: ink, fontVariant: ['tabular-nums'] },
  allowRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.successSoft, borderRadius: 4 },
  explain: { padding: spacing.lg, borderRadius: 4, gap: 4 },
  explainTitle: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700' },
  explainText: { fontFamily: marketingFonts.body, fontSize: 14, lineHeight: 21, color: ink },
  pdfRow: { gap: spacing.xs },
  pdfButton: { alignSelf: 'flex-start', paddingVertical: 13, paddingHorizontal: 18, borderRadius: 3, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface },
  pdfButtonText: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: colors.primary },

  cta: { padding: spacing.xxl, backgroundColor: colors.primaryDark, borderRadius: 4, gap: spacing.md },
  ctaKicker: { ...monoType, fontSize: 11, letterSpacing: 1.4, color: '#F5DECB' },
  ctaTitle: { ...displayType, fontSize: 40, lineHeight: 40, fontWeight: '800', color: '#FBF6EE' },
  ctaList: { gap: spacing.sm, marginVertical: spacing.sm },
  ctaItem: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  ctaCheck: { fontSize: 15, fontWeight: '800', color: '#F5DECB', lineHeight: 22 },
  ctaText: { flex: 1, fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 22, color: '#FBF6EE' },
  ctaButtons: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg },
  ctaNote: { fontFamily: marketingFonts.body, fontSize: 13, color: '#F5DECB' },

  section: { gap: spacing.md },
  h2: { ...displayType, fontSize: 36, lineHeight: 38, fontWeight: '800', color: ink },
  p: { fontFamily: marketingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk, maxWidth: 720 },
  sitTable: { flex: 1, minWidth: 560, borderWidth: 1, borderColor: rule, backgroundColor: colors.surface },
  sitRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  sitHead: { borderTopWidth: 0, backgroundColor: colors.surfaceAlt },
  sitHeadText: { fontWeight: '700' },
  sitCell: { padding: spacing.md, fontFamily: marketingFonts.body, fontSize: 14, color: ink },
  link: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '600', color: colors.primary, textDecorationLine: 'underline' },
  sources: { borderTopWidth: 1, borderTopColor: rule, paddingTop: spacing.lg },
  sourcesText: { fontFamily: marketingFonts.body, fontSize: 12, lineHeight: 18, color: bodyInk, maxWidth: 900 },
});
