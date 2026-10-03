import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { getIncomeStatement, getTrialBalance, getVatReportByCode, getVatSettings, listFiscalYears, type FiscalYear, type VatSettings } from '../../../lib/api/accounting';
import { getClosing, saveClosing } from '../../../lib/api/closing';
import { PROFIT_TAX_RATES, type LegalForm } from '../../../lib/accounting/closing';
import { periodsFor } from '../../../lib/vat/afcForm';
import { cantonForNpa } from '../../../lib/payroll/npaCanton';
import { Card, LoadingScreen, PageHeader, AppScreen } from '../../../components/ui';
import { getAppLocale } from '../../../lib/translations';
import { breakpoints, colors, fontSize, radius, spacing } from '../../../lib/theme';
import { displayType, monoType } from '../../../lib/marketingTheme';

// Fiscalité & provisions: where the year is heading (profit so far and
// projected), what to put aside for taxes, VAT and — for a sole
// proprietorship — the owner's AVS, and the deadlines of the Swiss year.
// Estimates only: the closing assistant books the real provision.

const COPY = {
  fr: {
    title: 'Fiscalité & provisions',
    subtitle: 'Ce que l’année rapporte, ce qu’il faut mettre de côté et quand payer. Estimations à affiner avec votre fiduciaire.',
    noYear: 'Créez d’abord un exercice comptable dans Comptabilité.',
    profitYtd: 'Bénéfice à ce jour',
    profitYear: 'Projection sur l’année',
    projHint: 'au rythme des {{n}} premiers mois',
    taxYear: 'Impôts estimés {{year}}',
    perMonth: 'À mettre de côté',
    perMonthHint: 'par mois jusqu’à la fin de l’exercice',
    provisioned: 'Déjà provisionné (2350) : CHF {{v}}',
    form: 'Forme juridique',
    forms: { ri: 'Raison individuelle', sarl: 'Sàrl', sa: 'SA' },
    rate: 'Taux effectif d’impôt (%) · {{canton}}',
    rateHint: 'Taux indicatif du chef-lieu (Confédération + canton + commune). Votre commune et votre fiduciaire font foi.',
    riHint: 'Raison individuelle : l’entreprise ne paie pas d’impôt sur le bénéfice. Le titulaire est imposé sur ce bénéfice avec ses autres revenus, et paie l’AVS/AI/APG d’indépendant (jusqu’à 10 %).',
    avs: 'AVS d’indépendant estimée',
    vat: 'TVA de la période en cours',
    vatDue: 'à payer avant le {{date}}',
    vatNot: 'Non assujetti à la TVA',
    vatOpen: 'Ouvrir le décompte',
    reserve: 'Réserve conseillée',
    reserveHint: 'impôts + TVA en cours',
    deadlines: 'Échéances de l’année',
    closing: 'Préparer le bouclement',
    learn: 'Comment ça marche',
    learnText: [
      'Le bénéfice vient de votre comptabilité : produits moins charges, écritures validées.',
      'Une Sàrl ou une SA provisionne l’impôt sur le bénéfice chaque année ; il est payé l’année suivante, souvent par acomptes.',
      'La TVA encaissée n’est pas à vous : gardez-la de côté jusqu’au décompte, 60 jours après la fin de la période.',
      'Mettre de côté chaque mois évite la mauvaise surprise de la facture d’impôts.',
    ],
    items: [
      { when: 'Janvier', what: 'Certificats de salaire aux employés et décompte annuel des salaires à la caisse AVS', tag: 'Salaires' },
      { when: 'Janvier – février', what: 'Déclaration des salaires LAA et LPP, ajustement des acomptes', tag: 'Salaires' },
      { when: 'Chaque mois', what: 'Décompte de l’impôt à la source (délai selon le canton)', tag: 'Salaires' },
      { when: 'Fin mai · août · novembre · février', what: 'Décompte et paiement de la TVA trimestrielle (60 jours après la fin du trimestre)', tag: 'TVA' },
      { when: 'Selon le canton', what: 'Acomptes d’impôts sur le bénéfice et le capital (facture provisoire)', tag: 'Impôts' },
      { when: '3 à 6 mois après la clôture', what: 'Comptes annuels, déclaration d’impôt de l’entreprise (prolongation possible)', tag: 'Bouclement' },
    ],
  },
  de: {
    title: 'Steuern & Rückstellungen',
    subtitle: 'Was das Jahr einbringt, was Sie zurücklegen sollten und wann Sie zahlen. Schätzungen, mit dem Treuhänder zu verfeinern.',
    noYear: 'Erstellen Sie zuerst ein Geschäftsjahr in der Buchhaltung.',
    profitYtd: 'Gewinn bis heute',
    profitYear: 'Hochrechnung aufs Jahr',
    projHint: 'im Rhythmus der ersten {{n}} Monate',
    taxYear: 'Geschätzte Steuern {{year}}',
    perMonth: 'Zurücklegen',
    perMonthHint: 'pro Monat bis Ende des Geschäftsjahrs',
    provisioned: 'Bereits zurückgestellt (2350): CHF {{v}}',
    form: 'Rechtsform',
    forms: { ri: 'Einzelunternehmen', sarl: 'GmbH', sa: 'AG' },
    rate: 'Effektiver Steuersatz (%) · {{canton}}',
    rateHint: 'Indikativer Satz des Kantonshauptorts (Bund + Kanton + Gemeinde). Massgebend sind Ihre Gemeinde und Ihr Treuhänder.',
    riHint: 'Einzelunternehmen: das Unternehmen zahlt keine Gewinnsteuer. Der Inhaber versteuert den Gewinn mit seinen übrigen Einkünften und zahlt AHV/IV/EO als Selbständigerwerbender (bis 10 %).',
    avs: 'Geschätzte AHV als Selbständigerwerbender',
    vat: 'MWST der laufenden Periode',
    vatDue: 'zahlbar bis {{date}}',
    vatNot: 'Nicht mehrwertsteuerpflichtig',
    vatOpen: 'Abrechnung öffnen',
    reserve: 'Empfohlene Reserve',
    reserveHint: 'Steuern + laufende MWST',
    deadlines: 'Fristen des Jahres',
    closing: 'Abschluss vorbereiten',
    learn: 'So funktioniert es',
    learnText: [
      'Der Gewinn stammt aus Ihrer Buchhaltung: Ertrag minus Aufwand, verbuchte Buchungen.',
      'Eine GmbH oder AG stellt die Gewinnsteuer jedes Jahr zurück; bezahlt wird im Folgejahr, oft in Raten.',
      'Die eingenommene MWST gehört nicht Ihnen: legen Sie sie bis zur Abrechnung zurück, 60 Tage nach Periodenende.',
      'Monatlich zurücklegen verhindert die böse Überraschung der Steuerrechnung.',
    ],
    items: [
      { when: 'Januar', what: 'Lohnausweise an die Mitarbeitenden und Jahreslohnmeldung an die AHV-Ausgleichskasse', tag: 'Löhne' },
      { when: 'Januar – Februar', what: 'Lohndeklaration UVG und BVG, Anpassung der Akontozahlungen', tag: 'Löhne' },
      { when: 'Jeden Monat', what: 'Quellensteuerabrechnung (Frist je nach Kanton)', tag: 'Löhne' },
      { when: 'Ende Mai · August · November · Februar', what: 'Quartalsabrechnung und Zahlung der MWST (60 Tage nach Quartalsende)', tag: 'MWST' },
      { when: 'Je nach Kanton', what: 'Akontozahlungen Gewinn- und Kapitalsteuer (provisorische Rechnung)', tag: 'Steuern' },
      { when: '3 bis 6 Monate nach Abschluss', what: 'Jahresrechnung, Steuererklärung des Unternehmens (Fristerstreckung möglich)', tag: 'Abschluss' },
    ],
  },
  it: {
    title: 'Fiscalità e accantonamenti',
    subtitle: 'Cosa rende l’anno, cosa mettere da parte e quando pagare. Stime da affinare con la vostra fiduciaria.',
    noYear: 'Create prima un esercizio contabile in Contabilità.',
    profitYtd: 'Utile a oggi',
    profitYear: 'Proiezione sull’anno',
    projHint: 'al ritmo dei primi {{n}} mesi',
    taxYear: 'Imposte stimate {{year}}',
    perMonth: 'Da mettere da parte',
    perMonthHint: 'al mese fino alla fine dell’esercizio',
    provisioned: 'Già accantonato (2350): CHF {{v}}',
    form: 'Forma giuridica',
    forms: { ri: 'Ditta individuale', sarl: 'Sagl', sa: 'SA' },
    rate: 'Aliquota d’imposta effettiva (%) · {{canton}}',
    rateHint: 'Aliquota indicativa del capoluogo (Confederazione + cantone + comune). Fanno stato il vostro comune e la fiduciaria.',
    riHint: 'Ditta individuale: l’impresa non paga l’imposta sull’utile. Il titolare è tassato su questo utile insieme agli altri redditi e paga l’AVS/AI/IPG da indipendente (fino al 10 %).',
    avs: 'AVS da indipendente stimata',
    vat: 'IVA del periodo in corso',
    vatDue: 'da pagare entro il {{date}}',
    vatNot: 'Non assoggettato all’IVA',
    vatOpen: 'Aprire il rendiconto',
    reserve: 'Riserva consigliata',
    reserveHint: 'imposte + IVA in corso',
    deadlines: 'Scadenze dell’anno',
    closing: 'Preparare la chiusura',
    learn: 'Come funziona',
    learnText: [
      'L’utile viene dalla contabilità: ricavi meno costi, registrazioni convalidate.',
      'Una Sagl o una SA accantona l’imposta sull’utile ogni anno; si paga l’anno seguente, spesso a rate.',
      'L’IVA incassata non è vostra: tenetela da parte fino al rendiconto, 60 giorni dopo la fine del periodo.',
      'Mettere da parte ogni mese evita la brutta sorpresa della fattura delle imposte.',
    ],
    items: [
      { when: 'Gennaio', what: 'Certificati di salario ai dipendenti e conteggio annuale dei salari alla cassa AVS', tag: 'Salari' },
      { when: 'Gennaio – febbraio', what: 'Dichiarazione dei salari LAINF e LPP, adeguamento degli acconti', tag: 'Salari' },
      { when: 'Ogni mese', what: 'Conteggio dell’imposta alla fonte (termine secondo il cantone)', tag: 'Salari' },
      { when: 'Fine maggio · agosto · novembre · febbraio', what: 'Rendiconto e pagamento dell’IVA trimestrale (60 giorni dopo la fine del trimestre)', tag: 'IVA' },
      { when: 'Secondo il cantone', what: 'Acconti d’imposta sull’utile e sul capitale (fattura provvisoria)', tag: 'Imposte' },
      { when: '3–6 mesi dopo la chiusura', what: 'Conti annuali, dichiarazione d’imposta dell’impresa (proroga possibile)', tag: 'Chiusura' },
    ],
  },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(v[k] ?? ''));

function chf(n: number): string {
  const [int] = Math.abs(n).toFixed(0).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
}

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const monthsBetween = (a: string, b: string) => Math.max(0, (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / (30.4375 * 86400000));

export default function FiscalityScreen() {
  const locale = getAppLocale();
  const c = COPY[locale] ?? COPY.fr;
  const { organization, user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.desktop;
  const canton = cantonForNpa(organization?.postal_code ?? null) ?? 'VD';

  const [loading, setLoading] = useState(true);
  const [fy, setFy] = useState<FiscalYear | null>(null);
  const [profitYtd, setProfitYtd] = useState(0);
  const [provisioned, setProvisioned] = useState(0);
  const [vat, setVat] = useState<VatSettings | null>(null);
  const [vatNow, setVatNow] = useState<{ amount: number; due: string } | null>(null);
  const [legalForm, setLegalForm] = useState<LegalForm>('sarl');
  const [rate, setRate] = useState<number>(PROFIT_TAX_RATES[canton] ?? 14);
  const [rateText, setRateText] = useState('');

  const today = isoToday();

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const years = await listFiscalYears(organization.id);
    const current = years.find((y) => y.start_date <= today && y.end_date >= today) ?? years[0] ?? null;
    setFy(current);
    const settings = await getVatSettings(organization.id);
    setVat(settings);
    if (current) {
      const [income, cumulative, closing] = await Promise.all([
        getIncomeStatement(organization.id, current.start_date, nextDay(today < current.end_date ? today : current.end_date)),
        getTrialBalance(organization.id, '1900-01-01', nextDay(today)),
        getClosing(current.id),
      ]);
      // Taxes already booked in the year are part of the result: add them back.
      const taxBooked = income.charges.filter((l) => l.code === '8900').reduce((s, l) => s + l.amount, 0);
      setProfitYtd(income.resultat + taxBooked);
      setProvisioned(-(cumulative.find((r) => r.code === '2350')?.closingBalance ?? 0));
      if (closing.closing?.legal_form) setLegalForm(closing.closing.legal_form);
      if (closing.closing?.data?.taxRate) setRate(closing.closing.data.taxRate);
    }
    if (settings?.vatLiable && settings.vatPeriodicity) {
      const year = Number(today.slice(0, 4));
      const period = periodsFor(year, settings.vatPeriodicity).find((p) => p.start <= today && p.end >= today);
      if (period) {
        const report = await getVatReportByCode(organization.id, period.start, period.endExclusive, settings.vatRounding);
        setVatNow({ amount: report.netVatDue, due: period.due });
      }
    }
    setLoading(false);
  }, [organization, today]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function persist(patch: { legal_form?: LegalForm; taxRate?: number }) {
    if (!organization || !fy) return;
    const { closing } = await getClosing(fy.id);
    await saveClosing(organization.id, fy.id, user?.id, {
      ...(patch.legal_form ? { legal_form: patch.legal_form } : {}),
      data: { ...(closing?.data ?? {}), ...(patch.taxRate != null ? { taxRate: patch.taxRate } : {}) },
    });
  }

  const elapsed = fy ? Math.max(0.5, monthsBetween(fy.start_date, today < fy.end_date ? today : fy.end_date)) : 12;
  const total = fy ? Math.max(1, monthsBetween(fy.start_date, nextDay(fy.end_date))) : 12;
  const remaining = fy ? Math.max(1, Math.ceil(monthsBetween(today, nextDay(fy.end_date)))) : 1;
  const projected = (profitYtd / elapsed) * total;
  const tax = useMemo(() => (legalForm === 'ri' ? 0 : Math.max(0, projected) * (rate / 100)), [legalForm, projected, rate]);
  const avs = legalForm === 'ri' ? Math.max(0, projected) * 0.1 : 0;
  const perMonth = Math.max(0, tax + avs - provisioned) / remaining;
  const reserve = Math.max(0, (profitYtd > 0 ? (legalForm === 'ri' ? profitYtd * 0.1 : profitYtd * (rate / 100)) : 0) - provisioned) + Math.max(0, vatNow?.amount ?? 0);
  const year = fy ? fy.end_date.slice(0, 4) : today.slice(0, 4);
  const fmtDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(`${locale}-CH`, { day: 'numeric', month: 'long', year: 'numeric' });

  if (!organization || loading) return <LoadingScreen />;

  const kpi = (label: string, value: number, hint?: string, tone?: 'dark' | 'accent') => (
    <Card style={[styles.kpi, tone === 'dark' && styles.kpiDark, wide ? { flex: 1 } : styles.kpiHalf]}>
      <Text style={[styles.kpiLabel, tone === 'dark' && { color: '#E8C9A8' }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.kpiValue, tone === 'dark' && { color: '#FBF6EE' }, value < 0 && { color: colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
        CHF {chf(value)}
      </Text>
      {hint ? <Text style={[styles.kpiHint, tone === 'dark' && { color: '#D9CBB8' }]}>{hint}</Text> : null}
    </Card>
  );

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={[styles.page, wide && { maxWidth: 1180 }]}>
        <PageHeader title={c.title} backTo="/(app)/compta" />
        <Text style={styles.subtitle}>{c.subtitle}</Text>

        {!fy ? (
          <Card>
            <Text style={styles.body}>{c.noYear}</Text>
          </Card>
        ) : (
          <>
            <View style={styles.kpiRow}>
              {kpi(c.profitYtd, profitYtd)}
              {kpi(c.profitYear, projected, fill(c.projHint, { n: Math.max(1, Math.round(elapsed)) }))}
              {kpi(fill(c.taxYear, { year }), legalForm === 'ri' ? avs : tax, legalForm === 'ri' ? c.avs : fill(c.provisioned, { v: chf(provisioned) }))}
              {kpi(c.perMonth, perMonth, c.perMonthHint, 'dark')}
            </View>

            <View style={[styles.cols, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
              <View style={[styles.col, wide && { flex: 1.1 }]}>
                <Card style={{ gap: spacing.sm }}>
                  <Text style={styles.sectionTitle}>{c.form}</Text>
                  <View style={styles.chips}>
                    {(['ri', 'sarl', 'sa'] as LegalForm[]).map((f) => (
                      <Pressable
                        key={f}
                        onPress={() => {
                          setLegalForm(f);
                          persist({ legal_form: f });
                        }}
                        style={[styles.chip, legalForm === f && styles.chipOn]}
                      >
                        <Text style={[styles.chipText, legalForm === f && styles.chipTextOn]}>{c.forms[f]}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {legalForm === 'ri' ? (
                    <Text style={styles.hint}>{c.riHint}</Text>
                  ) : (
                    <>
                      <Text style={styles.label}>{fill(c.rate, { canton })}</Text>
                      <TextInput
                        value={rateText || String(rate)}
                        onChangeText={setRateText}
                        onBlur={() => {
                          const v = Number(rateText.replace(',', '.'));
                          if (rateText && Number.isFinite(v) && v > 0 && v < 40) {
                            setRate(v);
                            persist({ taxRate: v });
                          }
                          setRateText('');
                        }}
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />
                      <Text style={styles.hint}>{c.rateHint}</Text>
                    </>
                  )}
                </Card>

                <Card style={{ gap: spacing.sm }}>
                  <Text style={styles.sectionTitle}>{c.vat}</Text>
                  {vat?.vatLiable && vatNow ? (
                    <>
                      <Text style={styles.big}>CHF {chf(vatNow.amount)}</Text>
                      <Text style={styles.hint}>{fill(c.vatDue, { date: fmtDate(vatNow.due) })}</Text>
                      <Pressable onPress={() => router.push('/(app)/compta/tva' as any)}>
                        <Text style={styles.link}>{c.vatOpen} →</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Text style={styles.hint}>{c.vatNot}</Text>
                  )}
                </Card>

                <Card style={[styles.reserveCard]}>
                  <Feather name="shield" size={18} color={colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reserveLabel}>{c.reserve}</Text>
                    <Text style={styles.hint}>{c.reserveHint}</Text>
                  </View>
                  <Text style={styles.reserveValue}>CHF {chf(reserve)}</Text>
                </Card>
              </View>

              <View style={[styles.col, wide && { flex: 1 }]}>
                <Card style={{ gap: spacing.sm }}>
                  <Text style={styles.sectionTitle}>{c.deadlines}</Text>
                  {c.items.map((it) => (
                    <View key={it.what} style={styles.deadline}>
                      <Text style={styles.deadlineWhen}>{it.when}</Text>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.deadlineWhat}>{it.what}</Text>
                        <Text style={styles.tag}>{it.tag}</Text>
                      </View>
                    </View>
                  ))}
                  <Pressable onPress={() => router.push('/(app)/compta/bouclement' as any)} style={styles.closingBtn}>
                    <Feather name="check-square" size={15} color={colors.primary} />
                    <Text style={styles.link}>{c.closing} →</Text>
                  </Pressable>
                </Card>

                <Card style={{ gap: spacing.sm }}>
                  <View style={styles.learnHead}>
                    <Feather name="book-open" size={16} color={colors.primary} />
                    <Text style={styles.sectionTitle}>{c.learn}</Text>
                  </View>
                  {c.learnText.map((t2, i) => (
                    <View key={t2} style={styles.learnRow}>
                      <Text style={styles.learnNum}>{i + 1}</Text>
                      <Text style={styles.body}>{t2}</Text>
                    </View>
                  ))}
                </Card>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg, width: '100%', maxWidth: 820, alignSelf: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: -spacing.sm, lineHeight: 20, maxWidth: 760 },
  body: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  label: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  link: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  big: { ...displayType, fontSize: 28, fontWeight: '800', color: colors.text },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpiHalf: { flexGrow: 1, flexBasis: '45%' },
  kpi: { gap: 4 },
  kpiDark: { backgroundColor: colors.text, borderColor: colors.text },
  kpiLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.8, color: colors.textMuted },
  kpiValue: { ...displayType, fontSize: 26, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  kpiHint: { fontSize: fontSize.xs, color: colors.textMuted },
  cols: { gap: spacing.lg },
  col: { gap: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  chipTextOn: { color: colors.primaryDark },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 8, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.bg, maxWidth: 140 },
  reserveCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  reserveLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  reserveValue: { ...displayType, fontSize: 22, fontWeight: '800', color: colors.success, fontVariant: ['tabular-nums'] },
  deadline: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  deadlineWhen: { ...monoType, width: 120, fontSize: 11, color: colors.primary, lineHeight: 18 },
  deadlineWhat: { fontSize: fontSize.sm, color: colors.text, lineHeight: 19 },
  tag: { alignSelf: 'flex-start', fontSize: 10.5, fontWeight: '700', color: colors.slate, backgroundColor: colors.slateSoft, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  closingBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  learnHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  learnRow: { flexDirection: 'row', gap: spacing.sm },
  learnNum: { ...monoType, width: 16, fontSize: 12, color: colors.primary, lineHeight: 20 },
});
