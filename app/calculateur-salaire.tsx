import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PageHero, pageWrap } from '../components/landing/PageHero';
import { CtaButton } from '../components/landing/CtaButton';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { Heading } from '../components/Heading';
import { authHref } from '../lib/appHost';
import { computeSwissPayroll, type PayLine, type SwissOverrides, type SwissSituation } from '../lib/payroll/swissEngine.ts';
import { CANTONS, DEFAULT_LAA, isSubjectToWht, socialRatesFor, whtCode, type Canton, type Permit, type WhtSteps } from '../lib/payroll/swissReferences.ts';
import { supabase } from '../lib/supabase';
import { breakpoints, colors, spacing } from '../lib/theme';
import { displayType, marketingFonts, monoType } from '../lib/marketingTheme';

// Free public salary calculator (cantia.ch/calculateur-salaire): gross →
// net and employer cost for one employee, with the same engine as the
// payslips in the app (lib/payroll/swissEngine.ts): AVS/AI/APG, AC, LPP by
// age on the coordinated salary (legal minimum or the fund's own plan,
// from 18), LAA, family allowances, withholding tax from the official
// ESTV scale (public.swiss_wht_tariffs, readable anonymously). Nothing is
// stored; everything runs in the visitor's browser.

const YEAR = 2026;
const RATES = socialRatesFor(YEAR);

type Residence = SwissSituation['residenceCountry'];

const PERMITS: { value: Permit; label: string }[] = [
  { value: 'swiss', label: 'Suisse' },
  { value: 'C', label: 'Permis C' },
  { value: 'B', label: 'Permis B' },
  { value: 'L', label: 'Permis L' },
  { value: 'G', label: 'Frontalier (G)' },
  { value: 'other', label: 'Autre' },
];

const RESIDENCES: { value: Residence; label: string }[] = [
  { value: 'CH', label: 'En Suisse' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Allemagne' },
  { value: 'IT', label: 'Italie' },
  { value: 'AT', label: 'Autriche' },
];

function chf(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

function num(s: string): number | null {
  const n = Number(s.replace(/[’'\s]/g, '').replace(',', '.'));
  return s.trim() && Number.isFinite(n) ? n : null;
}

function pct(n: number): string {
  return `${Number(n.toFixed(3)).toString().replace('.', ',')} %`;
}

export default function SalaryCalculatorPage() {
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;

  const [grossInput, setGrossInput] = useState('5’500');
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [birthYear, setBirthYear] = useState('1994');
  const [canton, setCanton] = useState<Canton>('VD');
  const [permit, setPermit] = useState<Permit>('swiss');
  const [residence, setResidence] = useState<Residence>('CH');
  const [married, setMarried] = useState(false);
  const [spouseWorks, setSpouseWorks] = useState(false);
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

  const situation: SwissSituation = {
    birthDate: validYear ? `${by}-07-01` : null,
    permit,
    maritalStatus: married ? 'married' : 'single',
    spouseIsSwissOrC: false,
    spouseWorks: married && spouseWorks,
    livesWithChildren: kids + kidsTraining > 0,
    childrenUnder16: kids,
    childrenInTraining: kidsTraining,
    church,
    residenceCountry: permit === 'G' && residence === 'CH' ? 'FR' : residence,
    residenceCanton: canton,
    workCanton: canton,
    lppInsured: true,
    receivesFamilyAllowances: kids + kidsTraining > 0,
  };
  const whtSit = { ...situation, children: kids + kidsTraining };
  const subject = isSubjectToWht(whtSit, canton).subject;
  const code = subject ? whtCode(whtSit) : null;

  useEffect(() => {
    let alive = true;
    if (!subject || !code) {
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
  }, [subject, code, canton]);

  const overrides: SwissOverrides = {
    aanpPercent: num(aanp) ?? DEFAULT_LAA.aanpPercent,
    aapPercent: num(aap) ?? DEFAULT_LAA.aapPercent,
    lppTotalPercent: plan === 'fund' ? num(fundRate) : null,
    lppYoungPercent: plan === 'fund' ? num(fundYoungRate) : null,
    lppEmployerSharePercent: plan === 'fund' ? num(erShare) : 50,
  };
  const payroll = useMemo(
    () => computeSwissPayroll(situation, monthly, YEAR, { overrides, whtSteps: steps }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(situation), monthly, JSON.stringify(overrides), steps],
  );

  const lppSituation = lppStory(age, monthly * 12, plan, payroll.lpp);

  const form = (
    <View style={styles.form}>
      <Group title="Salaire">
        <View style={styles.inline}>
          <Input value={grossInput} onChange={setGrossInput} suffix="CHF brut" wide />
          <Segmented value={period} onChange={setPeriod} options={[{ value: 'month', label: 'par mois' }, { value: 'year', label: 'par an' }]} />
        </View>
        <Hint>{period === 'year' ? `Soit CHF ${chf(monthly)} par mois (12 salaires).` : `Soit CHF ${chf(monthly * 12)} par an (12 salaires).`}</Hint>
      </Group>

      <Group title="Employé·e">
        <Label>Année de naissance</Label>
        <View style={styles.inline}>
          <Input value={birthYear} onChange={setBirthYear} placeholder="1994" />
          <Text style={styles.ageText}>{age !== null ? `${age} ans en ${YEAR}` : 'Année invalide'}</Text>
        </View>
        <Label>Nationalité / permis</Label>
        <Chips value={permit} onChange={setPermit} options={PERMITS} />
        <Label>Domicile</Label>
        <Chips value={situation.residenceCountry} onChange={setResidence} options={RESIDENCES} />
        <Label>État civil</Label>
        <Chips value={married ? 'm' : 's'} onChange={(v) => setMarried(v === 'm')} options={[{ value: 's', label: 'Célibataire' }, { value: 'm', label: 'Marié·e / partenariat' }]} />
        {married ? <Chips value={spouseWorks ? 'y' : 'n'} onChange={(v) => setSpouseWorks(v === 'y')} options={[{ value: 'n', label: 'Conjoint·e sans revenu' }, { value: 'y', label: 'Conjoint·e qui travaille' }]} /> : null}
        <View style={styles.counters}>
          <Counter label="Enfants de moins de 16 ans" value={kids} onChange={setKids} />
          <Counter label="Enfants en formation (16-25 ans)" value={kidsTraining} onChange={setKidsTraining} />
        </View>
        {subject ? <Chips value={church ? 'y' : 'n'} onChange={(v) => setChurch(v === 'y')} options={[{ value: 'n', label: 'Sans impôt ecclésiastique' }, { value: 'y', label: 'Membre d’une Église' }]} /> : null}
      </Group>

      <Group title="Entreprise">
        <Label>Canton de travail</Label>
        <View style={styles.cantons}>
          {CANTONS.map((c) => (
            <Pressable key={c} onPress={() => setCanton(c)} style={[styles.canton, canton === c && styles.chipOn]}>
              <Text style={[styles.cantonText, canton === c && styles.chipTextOn]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <Label>Caisse de pension (LPP)</Label>
        <Chips value={plan} onChange={setPlan} options={[{ value: 'legal', label: 'Minimum légal' }, { value: 'fund', label: 'Plan de ma caisse' }]} />
        {plan === 'fund' ? (
          <View style={styles.fundBox}>
            <View style={styles.fundRow}>
              <View style={styles.fundCell}>
                <Label>Taux total dès 25 ans</Label>
                <Input value={fundRate} onChange={setFundRate} placeholder={age !== null && age >= 25 ? String(payroll.lpp.creditPercent || 7) : '7'} suffix="%" />
              </View>
              <View style={styles.fundCell}>
                <Label>Taux de 18 à 24 ans</Label>
                <Input value={fundYoungRate} onChange={setFundYoungRate} placeholder="p. ex. 4" suffix="%" />
              </View>
              <View style={styles.fundCell}>
                <Label>Part employeur</Label>
                <Input value={erShare} onChange={setErShare} placeholder="50" suffix="%" />
              </View>
            </View>
            <Hint>Reprenez les taux du règlement ou de la fiche de votre caisse. Vide = minimum légal selon l’âge. La part employeur est d’au moins 50 % (art. 66 LPP).</Hint>
          </View>
        ) : null}
        <Label>Assurance accidents (LAA)</Label>
        <View style={styles.fundRow}>
          <View style={styles.fundCell}>
            <Input value={aanp} onChange={setAanp} suffix="% AANP employé" />
          </View>
          <View style={styles.fundCell}>
            <Input value={aap} onChange={setAap} suffix="% AAP employeur" />
          </View>
        </View>
        <Hint>Taux indicatifs : ceux de votre police LAA peuvent varier selon le métier.</Hint>
      </Group>
    </View>
  );

  const result = (
    <View style={styles.result}>
      <View style={styles.netCard}>
        <Text style={styles.netLabel}>SALAIRE NET / MOIS</Text>
        <Text style={[styles.netValue, !wide && width < breakpoints.tablet && { fontSize: 38, lineHeight: 42 }]}>CHF {chf(payroll.net)}</Text>
        <Text style={styles.netSub}>
          Brut CHF {chf(payroll.gross)} − retenues CHF {chf(payroll.totalDeductions)}
          {payroll.familyAllowance > 0 ? ` + allocations CHF ${chf(payroll.familyAllowance)}` : ''}
        </Text>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Coût total employeur</Text>
          <Text style={styles.costValue}>CHF {chf(payroll.totalCost)} / mois</Text>
        </View>
      </View>

      <Table title="Retenues sur le salaire" lines={payroll.employee} sign="−" total={payroll.totalDeductions} totalLabel="Total des retenues" />
      {payroll.familyAllowance > 0 ? (
        <View style={styles.allowRow}>
          <Text style={styles.lineLabel}>Allocations familiales ({canton})</Text>
          <Text style={[styles.lineAmount, { color: colors.success }]}>+{chf(payroll.familyAllowance)}</Text>
        </View>
      ) : null}
      <Table title="Charges patronales" lines={payroll.employer} sign="+" total={payroll.totalEmployer} totalLabel="Total employeur" />

      <Explain tone={payroll.lpp.applies ? 'ok' : 'info'} title={`LPP : ${lppSituation.title}`}>
        {lppSituation.text}
      </Explain>
      <Explain tone={subject ? 'warn' : 'ok'} title={subject ? `Impôt à la source : oui (barème ${code})` : 'Impôt à la source : non'}>
        {whtStory(subject, payroll.wht.reason, canton, code, payroll.wht.ratePercent, stepsLoading, payroll.wht.missingScale)}
      </Explain>
    </View>
  );

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title="Calculateur de salaire suisse 2026 : brut, net, LPP et charges | Cantia"
        description="Calculez gratuitement le salaire net et le coût employeur en Suisse : AVS, AC, LPP selon l’âge, LAA, allocations familiales et impôt à la source par canton. Montants 2026."
      />
      <MarketingNav />
      <ScrollView>
        <PageHero
          kicker={`Outil gratuit · Montants ${YEAR}`}
          title="Calculateur de salaire suisse"
          lede="Du brut au net et au coût employeur, en direct : AVS, chômage, LPP selon l’âge et votre caisse, accidents, allocations familiales et impôt à la source avec les barèmes officiels des 26 cantons. Gratuit, sans inscription, rien n’est enregistré."
        />
        <View style={[pageWrap, styles.body]}>
          <View style={[styles.columns, wide && styles.columnsWide]}>
            <View style={wide ? { flex: 1 } : null}>{form}</View>
            <View style={wide ? { flex: 1 } : null}>{result}</View>
          </View>

          <Cta />

          <Situations />

          <View style={styles.sources}>
            <Text style={styles.sourcesText}>
              Sources : OFAS (AVS/AI/APG {pct(RATES.avsAiApgPercent)}, AC {pct(RATES.acPercent)} jusqu’à CHF {chf(RATES.acCeilingChf).replace('.00', '')} par an), LPP art. 7, 8, 16 et 66 (montants {YEAR}), OFAS allocations familiales {YEAR}, AFC barèmes de l’impôt à la source {YEAR}. Résultat indicatif : le règlement de votre caisse de pension, votre police LAA et la décision de l’administration fiscale font foi.
            </Text>
          </View>
        </View>
        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// The words around the numbers

function lppStory(age: number | null, annual: number, plan: 'legal' | 'fund', lpp: { applies: boolean; creditPercent: number; employerSharePercent: number; coordinatedMonthly: number }): { title: string; text: string } {
  if (annual < RATES.lppEntryThresholdChf) {
    return {
      title: 'pas assujetti',
      text: `Le salaire annuel (CHF ${chf(annual)}) est sous le seuil d’entrée de CHF 22’680 : l’affiliation n’est pas obligatoire. Une caisse peut quand même l’assurer si son règlement le prévoit.`,
    };
  }
  if (age !== null && age < 18) return { title: 'pas de LPP avant 18 ans', text: 'Avant le 1er janvier qui suit le 17e anniversaire, il n’y a jamais de LPP obligatoire.' };
  if (age !== null && age < 25 && !lpp.applies) {
    return {
      title: 'rien à épargner avant 25 ans (minimum légal)',
      text: 'De 18 à 24 ans, la loi impose seulement la couverture décès et invalidité, sans épargne. Beaucoup de caisses prélèvent pourtant une cotisation dès 18 ans : choisissez « Plan de ma caisse » et indiquez son taux de 18 à 24 ans pour la voir ici.',
    };
  }
  const er = lpp.employerSharePercent;
  const base = `Salaire coordonné : CHF ${chf(lpp.coordinatedMonthly)} par mois (salaire annuel plafonné à CHF 90’720, moins CHF 26’460, minimum CHF 3’780).`;
  const split = `Répartition : ${pct(er)} employeur, ${pct(100 - er)} employé·e.`;
  if (age !== null && age < 25) return { title: `${pct(lpp.creditPercent)} dès 18 ans (plan de la caisse)`, text: `${base} Taux de la caisse pour les 18-24 ans : ${pct(lpp.creditPercent)}. ${split}` };
  const legal = plan === 'legal' || lpp.creditPercent === 0;
  return {
    title: `${pct(lpp.creditPercent)} à ${age ?? '?'} ans${legal ? ' (minimum légal)' : ' (plan de la caisse)'}`,
    text: `${base} ${legal ? 'Bonification de vieillesse légale : 7 % de 25 à 34 ans, 10 % de 35 à 44, 15 % de 45 à 54, 18 % dès 55.' : 'Taux du règlement de la caisse.'} ${split}`,
  };
}

function whtStory(subject: boolean, reason: string, canton: Canton, code: string | null, rate: number, loading: boolean, missing: boolean): string {
  if (!subject) return `${reason} : l’impôt est payé sur la déclaration d’impôt ordinaire, rien n’est retenu sur le salaire.`;
  const why = `${reason} : l’employeur retient l’impôt chaque mois et le verse au canton. Barème ${code} (${code?.[0] === 'A' ? 'personne seule' : code?.[0] === 'B' ? 'marié·e, un seul revenu' : code?.[0] === 'C' ? 'marié·e, deux revenus' : 'famille monoparentale'}, ${code?.[1]} enfant(s), ${code?.[2] === 'Y' ? 'avec' : 'sans'} impôt ecclésiastique), canton ${canton}.`;
  if (loading) return `${why} Chargement du barème…`;
  if (missing) return `${why} Le barème officiel de ce cas n’est pas disponible ici : le taux n’est pas compté dans le net.`;
  return `${why} Taux du barème officiel ${YEAR} pour ce salaire : ${pct(rate)}.`;
}

// ---------------------------------------------------------------------------
// Every LPP situation at a glance

function Situations() {
  const rows: [string, string, string][] = [
    ['Moins de 18 ans', 'Aucune LPP', 'Aucune'],
    ['18 à 24 ans', 'Décès et invalidité seulement, pas d’épargne', 'Selon la caisse (souvent 1 à 5 %)'],
    ['25 à 34 ans', '7 % du salaire coordonné', 'Souvent 7 à 10 %'],
    ['35 à 44 ans', '10 %', 'Souvent 10 à 13 %'],
    ['45 à 54 ans', '15 %', 'Souvent 15 à 18 %'],
    ['55 ans à la retraite', '18 %', 'Souvent 18 à 21 %'],
    ['Salaire sous CHF 22’680 / an', 'Pas d’affiliation obligatoire', 'Possible si le règlement le prévoit'],
  ];
  return (
    <View style={styles.section}>
      <Heading level={2} style={styles.h2}>Toutes les situations LPP en un coup d’œil</Heading>
      <Text style={styles.p}>
        L’âge compte par année civile : année en cours moins année de naissance. Le taux change donc le 1er janvier, pour tout le monde né la même année. L’employeur paie toujours au moins la moitié.
      </Text>
      <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }}>
        <View style={styles.sitTable}>
          <View style={[styles.sitRow, styles.sitHead]}>
            <Text style={[styles.sitCell, styles.sitHeadText, { flex: 1 }]}>Situation</Text>
            <Text style={[styles.sitCell, styles.sitHeadText, { flex: 1.4 }]}>Minimum légal</Text>
            <Text style={[styles.sitCell, styles.sitHeadText, { flex: 1.2 }]}>Plans de caisse courants</Text>
          </View>
          {rows.map((r) => (
            <View key={r[0]} style={styles.sitRow}>
              <Text style={[styles.sitCell, { flex: 1, fontWeight: '600' }]}>{r[0]}</Text>
              <Text style={[styles.sitCell, { flex: 1.4 }]}>{r[1]}</Text>
              <Text style={[styles.sitCell, { flex: 1.2 }]}>{r[2]}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Link href={'/blog/calcul-lpp-employe-taux-salaire-coordonne-2026' as any}>
        <Text style={styles.link}>Le calcul de la LPP expliqué pas à pas, avec exemples →</Text>
      </Link>
    </View>
  );
}

function Cta() {
  const points = [
    'La fiche de salaire PDF est générée chaque mois, prête à envoyer',
    'Le taux LPP change tout seul au 1er janvier selon l’âge',
    'Impôt à la source : bon barème, bon canton, mis à jour chaque année',
    'Allocations familiales, LAA, IJM et plan de votre caisse pris en compte',
    'Il vous manque une information ? Cantia vous le dit avant la première fiche',
  ];
  return (
    <View style={styles.cta}>
      <Text style={styles.ctaKicker}>DANS CANTIA, TOUT EST AUTOMATIQUE</Text>
      <Heading level={2} style={styles.ctaTitle}>Ce calcul, Cantia le fait chaque mois à votre place</Heading>
      <View style={styles.ctaList}>
        {points.map((p) => (
          <View key={p} style={styles.ctaItem}>
            <Text style={styles.ctaCheck}>✓</Text>
            <Text style={styles.ctaText}>{p}</Text>
          </View>
        ))}
      </View>
      <View style={styles.ctaButtons}>
        <Link href={authHref('signup') as any} asChild>
          <CtaButton title="Essayer 14 jours" tone="light" />
        </Link>
        <Text style={styles.ctaNote}>Sans engagement · Données hébergées en Suisse</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Small form pieces

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

function Segmented<T extends string>(props: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return <Chips {...props} />;
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.counter}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterCtl}>
        <Pressable onPress={() => onChange(Math.max(0, value - 1))} style={styles.counterBtn} accessibilityLabel={`Moins : ${label}`}>
          <Text style={styles.counterBtnText}>−</Text>
        </Pressable>
        <Text style={styles.counterValue}>{value}</Text>
        <Pressable onPress={() => onChange(Math.min(9, value + 1))} style={styles.counterBtn} accessibilityLabel={`Plus : ${label}`}>
          <Text style={styles.counterBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Table({ title, lines, sign, total, totalLabel }: { title: string; lines: PayLine[]; sign: '−' | '+'; total: number; totalLabel: string }) {
  return (
    <View style={styles.table}>
      <Text style={styles.tableTitle}>{title}</Text>
      {lines.map((l) => (
        <View key={l.key + l.label} style={styles.line}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lineLabel}>{l.label}</Text>
            <Text style={styles.lineMeta}>
              {l.ratePercent != null ? pct(l.ratePercent) : ''} de CHF {chf(l.base)}
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
