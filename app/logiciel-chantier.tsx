import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { CtaButton } from '../components/landing/CtaButton';
import { Cartouche } from '../components/landing/Cartouche';
import { useHeroFit } from '../components/landing/useHeroFit';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter } from '../components/MarketingChrome';
import { PricingSection } from '../components/PricingSection';
import { SwissCross } from '../components/SwissCross';
import { DocumentShowcase } from '../components/landing/DocumentShowcase';
import { HeroCross } from '../components/landing/HeroCross';
import { ScrollReveal } from '../components/landing/ScrollReveal';
import { colors, breakpoints, spacing } from '../lib/theme';
import { displayType, landingFonts, monoType } from '../lib/landingTheme';
import { authHref } from '../lib/appHost';
import { supabase } from '../lib/supabase';
import { useMarketingDict } from '../lib/i18n';
import { BrandLockup } from '../components/brand/Logo';
import { site } from '../lib/siteTheme';

import { Eyebrow, Headline, Hover, TextLink, Wrap } from '../components/site/Primitives';
import { DocVisual, Section, SectionHead, SitePage, useSiteLayout } from '../components/site/Sections';
import { FaqItem } from '../components/site/FamilyPage';
import { ProblemBand } from '../components/solutions/ProblemBand';
import { EXPORTS } from '../components/site/exports';
import { SITE_PAGES } from '../lib/site/pages';
import { sans, serif } from '../lib/siteTheme';
import { LaptopShot } from '../components/site/Laptop';
import { APP_SCREENS } from '../components/site/appScreens';
const DM = "'DM Sans', 'DM Sans Fallback', Arial, sans-serif";

type IconName = keyof typeof Feather.glyphMap;

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const PROBLEM_CARDS: { icon: IconName; problem: string; consequence: string }[] = [
  {
    icon: 'clock',
    problem: 'Un devis fait le soir, à la main, sur Excel.',
    consequence: 'Le temps que vous l’envoyiez, le client a déjà signé avec celui qui a répondu le premier.',
  },
  {
    icon: 'file-minus',
    problem: 'Un imprévu réglé à l’oral, sur le chantier.',
    consequence: 'Sans signature ni trace écrite, il est fait gratuitement. Répété sur l’année, ça représente vite plusieurs journées de travail non payées.',
  },
  {
    icon: 'trending-down',
    problem: 'Un chantier qui a fini par coûter plus qu’il n’a rapporté.',
    consequence: 'Vous ne le découvrez qu’en comptant les heures à la fin, des semaines plus tard. Quand il est trop tard pour corriger quoi que ce soit.',
  },
  {
    icon: 'alert-triangle',
    problem: 'Un client qui conteste un délai ou une prestation.',
    consequence: 'Sans photos datées ni rapport écrit, c’est votre parole contre la sienne, et c’est rarement vous qui gagnez ce genre de discussion.',
  },
];

const RELIEF_ITEMS = [
  'Devis chiffré et envoyé en quelques minutes, depuis le chantier',
  'Travaux supplémentaires signés sur tablette, facturés automatiquement',
  'Rentabilité visible chantier par chantier, en temps réel',
  'Rapport avec photos horodatées, généré pendant que vous êtes encore sur place',
];

const FEATURES: { icon: IconName; title: string; text: string; href: string }[] = [
  { icon: 'file-text', title: 'Devis & factures', text: 'Dictés à la voix, chiffrés avec votre catalogue de prix, PDF prêt à envoyer.', href: '/solutions/devis' },
  { icon: 'camera', title: 'Rapports de chantier', text: 'Notes vocales et photos géolocalisées assemblées en rapport rédigé par l’IA.', href: '/solutions/rapports-chantier' },
  { icon: 'mic', title: 'Dictée vocale', text: 'Décrivez le travail normalement : Cantia transcrit et structure.', href: '/solutions/dictee-vocale' },
  { icon: 'calendar', title: 'Planning d’équipe', text: 'Qui est où, sur quel chantier, visible par toute l’équipe.', href: '/solutions/planning' },
  { icon: 'trending-up', title: 'Rentabilité par chantier', text: 'Coûts réels vs devis, marge visible chantier par chantier.', href: '/solutions/rentabilite' },
  { icon: 'users', title: 'RH & salaires', text: 'Heures, absences et fiches de salaire suisses générées automatiquement.', href: '/solutions/rh-salaires' },
  { icon: 'credit-card', title: 'Trésorerie', text: 'Projection à 90 jours sur factures, salaires et charges à venir.', href: '/solutions/tresorerie' },
  { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Signature client sur tablette, facturés séparément du devis initial.', href: '/solutions/travaux-supplementaires' },
  { icon: 'clipboard', title: 'Soumissions (bêta)', text: 'La soumission PDF de l’architecte, remplie avec vos prix et renvoyée telle quelle. Une à l’essai dès le plan Essentiel.', href: '/solutions/soumissions' },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Et si Cantia ne me convient pas ?',
    answer:
      "Vous résiliez en ligne depuis Compte → Abonnement avant la fin des 14 jours : aucun montant n'est débité. Après l'essai, l'abonnement reste sans engagement et se résilie à tout moment.",
  },
  {
    question: 'Mes employés ne sont pas à l’aise avec l’informatique. Est-ce que ça marche quand même ?',
    answer:
      "Oui. Sur le chantier, ils saisissent leurs heures et ajoutent photos et notes vocales depuis leur téléphone, comme dans une messagerie. Vous choisissez ce que chacun voit : un employé n'a pas accès à la facturation.",
  },
  {
    question: 'Combien coûte un logiciel de gestion de chantier avec Cantia ?',
    answer:
      "CHF 39.– par mois avec Essentiel, CHF 79.– avec Équipe et CHF 129.– avec Entreprise, ou 20 % de moins en facturation annuelle. Chaque formule commence par 14 jours d'essai (carte bancaire requise, aucun débit avant la fin de l'essai).",
  },
  {
    question: 'Cantia fonctionne-t-il directement dans le navigateur ?',
    answer:
      'Oui. Cantia est une application 100% web, accessible depuis un ordinateur, une tablette ou un téléphone avec n’importe quel navigateur, aucun programme à télécharger, y compris directement depuis le chantier.',
  },
  {
    question: 'Puis-je récupérer mes devis, factures et clients existants ?',
    answer:
      "Oui, l'outil d'import intégré reprend vos fichiers Excel ou CSV (clients, catalogue de prix, historique) pour démarrer sans tout ressaisir à la main.",
  },
  {
    question: 'Mes données sont-elles hébergées en Suisse ?',
    answer: 'Oui, toutes les données sont hébergées en Suisse (Zurich), chiffrées, jamais revendues.',
  },
  {
    question: 'Y a-t-il un engagement ou une durée minimale ?',
    answer:
      "Aucun. Tous les plans sont résiliables à tout moment depuis Compte → Abonnement, sans justification ni frais de sortie.",
  },
  {
    question: 'Combien de temps faut-il pour prendre en main Cantia ?',
    answer:
      "Quelques minutes : un assistant d'intégration guide la création de votre entreprise, et l'essentiel (devis, factures, chantiers) se prend en main sans formation nécessaire.",
  },
];

const CARTOUCHE = [
  { label: 'Inclus', value: 'Devis, factures, rapports, planning, RH, trésorerie' },
  { label: 'QR-facture', value: 'Conforme à la norme SIX' },
  { label: 'Hébergement', value: 'Zurich, Suisse' },
  { label: 'Engagement', value: 'Aucun, résiliable à tout moment' },
];

const FACTS = ['Dès CHF 39.– par mois', '14 jours d’essai, sans engagement', 'Interface FR · DE · IT'];

// Short, factual proof shown right under the hero.
const PROOF = [
  { value: 'Quelques min.', label: 'pour un devis complet, dicté sur le chantier' },
  { value: 'CHF 39.–', label: 'par mois, devis et factures illimités' },
  { value: '100 % suisse', label: 'QR-facture, TVA, AVS, données à Zurich' },
  { value: 'FR · DE · IT', label: 'interface et documents dans votre langue' },
];

const STEPS = [
  { title: 'Créez votre compte', text: 'Deux minutes : votre entreprise, votre logo, votre couleur. Carte demandée à l’inscription, aucun débit pendant 14 jours.' },
  { title: 'Reprenez vos clients et vos prix', text: 'Importez vos fichiers Excel ou CSV (clients, catalogue), ou partez de zéro : Cantia retient chaque prestation que vous saisissez.' },
  { title: 'Envoyez votre premier devis', text: 'Dictez les travaux sur place, relisez, envoyez. Le client signe en ligne, la facture QR suit en un clic.' },
];

const NO_RISK = [
  { title: 'Aucun débit pendant 14 jours', text: 'Vous testez avec vos vrais chantiers avant de payer quoi que ce soit.' },
  { title: 'Résiliation en ligne', text: 'Depuis Compte → Abonnement, sans justification ni frais de sortie.' },
  { title: 'Sans engagement', text: 'Mois par mois, ou à l’année avec 20 % de réduction.' },
  { title: 'Une vraie personne', text: 'Par téléphone ou e-mail, en français, en allemand ou en italien.' },
];

const PHONE_DISPLAY = '078 450 14 57';
const PHONE_TEL = 'tel:+41784501457';

// Every CTA on this page reports its position to Google Ads/Analytics
// (gtag is loaded site-wide by app/+html.tsx), so the campaign can show
// which block actually converts.
function trackCta(location: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('event', 'cta_click', { event_category: 'logiciel_chantier', event_label: location });
}

function Cta({ label = 'Essayer 14 jours', location, small, light }: { label?: string; location: string; small?: boolean; light?: boolean }) {
  return (
    <Link href={authHref('signup')} asChild onPress={() => trackCta(location)}>
      <CtaButton title={label} tone={light ? 'light' : 'primary'} style={small ? { paddingVertical: 9, paddingHorizontal: 14 } : undefined} />
    </Link>
  );
}

// Cantia Équipe, the plan this page recommends (same figures as the `plans`
// table: CHF 79.– per month, up to 10 people). Only features that exist
// today are counted.
const ROI_PRICE_MONTHLY = 79;
const ROI_MAX_PEOPLE = 10;
const ROI_WEEKS = 46;
// Share of the owner's admin hours Équipe removes, from the task-by-task split
// of an 8 h week in ROI_TASKS below (4.8 h saved out of 8).
const ROI_OFFICE_SHARE = 0.6;
// Hours saved per week by each other person working in Cantia: hours,
// reports and photos entered on the phone, fewer calls to the office.
const ROI_FIELD_HOURS = 1;

// Swiss notation: CHF 9’900 and CHF 7.90.
const chf = (n: number, decimals = 0) => {
  const [int, dec] = n.toFixed(decimals).split('.');
  return `CHF ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}${dec ? `.${dec}` : ''}`;
};
const num = (n: number) => chf(n).replace('CHF ', '');

function roiFigures(field: number, hours: number, rate: number) {
  const office = Math.round(hours * ROI_WEEKS * ROI_OFFICE_SHARE);
  const fieldHours = Math.round(field * ROI_FIELD_HOURS * ROI_WEEKS);
  const total = office + fieldHours;
  const value = total * rate;
  const year = ROI_PRICE_MONTHLY * 12;
  const days = value > 0 ? Math.ceil((year / value) * 365) : null;
  return { office, field: fieldHours, total, value, year, net: value - year, days };
}

// "How much does admin cost you", for Cantia Équipe only: the visitor enters
// the office admin hours (whoever does them), the people working on site and
// the cost of an hour, and
// gets hours recovered, net gain and payback. A toggle below writes out the
// calculation with their own figures.
function RoiCalculator({ compact }: { compact: boolean }) {
  const [field, setField] = useState(3);
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(35);
  const f = roiFigures(field, hours, rate);

  const inputs = [
    { label: 'Heures d’administratif par semaine', hint: 'au bureau, toutes personnes confondues : devis, factures, salaires', value: `${hours} h`, dec: () => setHours((v) => Math.max(1, v - 1)), inc: () => setHours((v) => Math.min(40, v + 1)) },
    { label: 'Personnes sur les chantiers', hint: 'ouvriers et chefs d’équipe qui saisiront leurs heures et rapports', value: `${field}`, dec: () => setField((v) => Math.max(0, v - 1)), inc: () => setField((v) => Math.min(ROI_MAX_PEOPLE - 1, v + 1)) },
    { label: 'Combien vous coûte une heure', hint: 'votre tarif horaire ou ce que vous payez', value: `CHF ${rate}`, dec: () => setRate((v) => Math.max(25, v - 5)), inc: () => setRate((v) => Math.min(150, v + 5)) },
  ];

  return (
    <View>
      <View style={[styles.roi, compact && styles.roiCompact]}>
        <View style={[styles.roiInputs, !compact && { flex: 1 }]}>
          {inputs.map((i) => (
            <View key={i.label} style={styles.roiRow}>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={styles.roiLabel}>{i.label}</Text>
                <Text style={styles.roiHint}>{i.hint}</Text>
              </View>
              <View style={styles.stepper}>
                <Pressable onPress={i.dec} style={styles.stepBtn} accessibilityLabel={`Diminuer : ${i.label}`}>
                  <Text style={styles.stepBtnText}>−</Text>
                </Pressable>
                <Text style={styles.stepValue}>{i.value}</Text>
                <Pressable onPress={i.inc} style={styles.stepBtn} accessibilityLabel={`Augmenter : ${i.label}`}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <View style={styles.roiTimeRow}>
            <Text style={styles.roiResultLabelLight}>Votre administratif aujourd’hui</Text>
            <Text style={styles.roiMid}>{chf(hours * ROI_WEEKS * rate)}</Text>
            <Text style={styles.roiHint}>par an, pour {num(hours * ROI_WEEKS)} heures passées au bureau plutôt que sur le chantier.</Text>
          </View>
        </View>

        <View style={[styles.roiResult, !compact && { flex: 1 }]}>
          <Text style={styles.roiResultLabel}>Avec Cantia Équipe · {chf(ROI_PRICE_MONTHLY)}.– par mois</Text>
          <View style={styles.roiBigRow}>
            <View>
              <Text style={styles.roiBigValue}>{num(f.total)} h</Text>
              <Text style={styles.roiFigLabel}>récupérées par an</Text>
            </View>
            <View>
              <Text style={styles.roiBigValue}>{f.net > 0 ? chf(f.net) : '—'}</Text>
              <Text style={styles.roiFigLabel}>gagnés par an, abonnement déduit</Text>
            </View>
          </View>
          <View style={styles.roiPaybackBox}>
            <Text style={styles.roiPaybackText}>
              {f.days && f.days <= 365 ? `Rentabilisé en ${f.days} jours` : 'Pas rentable avec ces chiffres'}
            </Text>
            <Text style={styles.roiPlanScope}>Planning, salaires, rentabilité par chantier et synchronisation Bexio inclus, jusqu’à 10 personnes.</Text>
          </View>
          <View style={{ marginTop: spacing.lg }}>
            <Cta location="roi" label="Récupérer ce temps, essai 14 jours" />
          </View>
          <Link href="/tarifs" style={styles.roiCompareLink}>Comparer les trois formules →</Link>
        </View>
      </View>
      <RoiExplainer field={field} hours={hours} rate={rate} />
    </View>
  );
}

// Task-by-task split of an 8 h admin week behind the 60 % office share:
// [task, hours per week, share Cantia Équipe removes].
const ROI_TASKS: [string, number, number][] = [
  ['Rédaction des devis (dictée, catalogue de prix)', 2.5, 0.6],
  ['Factures et relances de factures', 1.25, 0.7],
  ['Rapports de chantier', 1, 0.7],
  ['Heures et salaires', 1, 0.8],
  ['Planning', 0.75, 0.6],
  ['Double saisie en comptabilité (Bexio)', 0.25, 0.9],
  ['Rentabilité et trésorerie', 0.25, 0.9],
  ['Suivi et relances des devis (non compté)', 1, 0],
];
const dec = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

// "How is it calculated": the same computation as the calculator, written out
// with the visitor's own figures so every number can be checked by hand.
function RoiExplainer({ field, hours, rate }: { field: number; hours: number; rate: number }) {
  const [open, setOpen] = useState(false);
  const f = roiFigures(field, hours, rate);
  const saved = ROI_TASKS.reduce((s, [, h, share]) => s + h * share, 0);
  return (
    <View style={styles.explain}>
      <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.explainToggle}>
        <Text style={styles.explainToggleText}>Comment c’est calculé ?</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={ink} />
      </Pressable>
      {open ? (
        <View style={styles.explainBody}>
          <Text style={styles.explainP}>
            On additionne deux choses qui ne concernent pas les mêmes personnes : le temps gagné au bureau sur les heures d’administratif (quelle que soit la personne qui les fait), et le temps gagné par chaque personne sur les chantiers sur ses propres heures et rapports, sur {ROI_WEEKS} semaines travaillées par an. Seules les fonctions déjà disponibles dans Cantia Équipe sont comptées.
          </Text>
          <View style={styles.explainPlan}>
            <Text style={styles.explainLine}>Bureau : {hours} h × {ROI_WEEKS} semaines × {Math.round(ROI_OFFICE_SHARE * 100)} % = {num(f.office)} h</Text>
            <Text style={styles.explainLine}>Terrain : {field} {field > 1 ? 'personnes' : 'personne'} × {ROI_FIELD_HOURS} h × {ROI_WEEKS} semaines = {num(f.field)} h</Text>
            <Text style={styles.explainLine}>Valeur : {num(f.total)} h × CHF {rate} = {chf(f.value)}</Text>
            <Text style={styles.explainLine}>Gain : {chf(f.value)} − abonnement {chf(f.year)} = {chf(f.net)}</Text>
            <Text style={styles.explainLine}>Rentabilisé : {num(f.year)} ÷ {num(f.value)} × 365 jours = {f.days ?? '—'} jours</Text>
          </View>
          <Text style={[styles.explainPlanName, { marginTop: spacing.md }]}>D’où viennent les {Math.round(ROI_OFFICE_SHARE * 100)} % ?</Text>
          <Text style={styles.explainP}>
            Une semaine d’administratif de 8 h découpée par tâche, et la part que Cantia Équipe fait gagner sur chacune. Total : {dec(saved)} h gagnées sur 8, soit {Math.round((saved / 8) * 100)} %.
          </Text>
          <View style={styles.explainTable}>
            {ROI_TASKS.map(([task, h, share]) => (
              <View key={task} style={styles.explainRow}>
                <Text style={styles.explainTask}>{task}</Text>
                <Text style={styles.explainCell}>{dec(h)} h/sem. · {Math.round(share * 100)} % gagnés</Text>
                <Text style={styles.explainPlans}>{dec(h * share)} h gagnées</Text>
              </View>
            ))}
          </View>
          <Text style={styles.explainP}>
            Sur les chantiers, {ROI_FIELD_HOURS} h par semaine et par personne, sur son propre temps et non sur l’administratif du bureau : heures, rapports et photos saisis sur le téléphone plutôt que sur papier, et moins d’appels au bureau pour savoir où aller. Ce sont des estimations : entrez vos propres chiffres pour ajuster le résultat.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function LogicielChantierPage() {
  const { phone, tablet: tabletOnly, width, h2Size  } = useSiteLayout();
  // Stacked layouts collapse on phones too, not only on tablets.
  const tablet = phone || tabletOnly;
  const isTablet = width < 1000;
  const X = EXPORTS.fr;
  const L = SITE_PAGES.fr.labels;
  const docsRef = useRef<View>(null);
  const [docsY, setDocsY] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Real, live number of companies on Cantia (landing_stats, public read).
  const [orgCount, setOrgCount] = useState<number | null>(null);
  useEffect(() => {
    supabase
      .from('landing_stats')
      .select('organizations_count')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.organizations_count) setOrgCount(data.organizations_count);
      });
  }, []);
  const h1 = phone ? 44 : tablet ? 54 : 66;

  return (
    <SitePage
      title="Logiciel de gestion de chantier pour entreprises du bâtiment | Cantia"
      description="Devis, factures QR, rapports, planning et salaires dans un seul outil suisse. 14 jours d’essai, sans engagement."
      scrollRef={scrollRef}
      cta={false}
    >
      {/* Hero */}
      <View style={{ paddingTop: phone ? 36 : 64, paddingBottom: phone ? 40 : 64 }}>
        <Wrap>
          <View style={[styles.heroRow, isTablet && { flexDirection: 'column', alignItems: 'stretch', gap: 34 }]}>
            <View style={!isTablet ? { flex: 1.1, minWidth: 0 } : undefined}>
              <Eyebrow>Logiciel de gestion de chantier · Suisse</Eyebrow>
              <Headline level={1} plain="Reprenez le contrôle" accent="de vos chantiers." size={h1} style={{ marginTop: 20, marginBottom: 24 }} />
              <Text style={[sans, styles.lede, phone && { fontSize: 13, lineHeight: 24 }]}>
                Devis, factures QR, rapports, planning et salaires dans un seul outil suisse. Vos devis partent depuis le chantier, vos suppléments sont signés, vos factures sont payées.
              </Text>
              <View style={styles.ctaRow}>
                <Cta location="hero" />
                <Hover onPress={() => { trackCta('hero_examples'); scrollRef.current?.scrollTo({ y: Math.max(0, docsY - 10), animated: true }); }} accessibilityRole="link" base={styles.more} hover={{ opacity: 0.7 }}>
                  <Text style={[sans, styles.moreText]}>Voir des documents réels</Text>
                  <Feather name="arrow-down" size={13} color={site.ink} />
                </Hover>
              </View>
              <Text style={[sans, styles.risk]}>Aucun débit pendant 14 jours · Sans engagement · Résiliable en ligne</Text>
              {orgCount ? (
                <Text style={[sans, styles.count]}>
                  <Text style={{ color: site.ink, fontWeight: '600' }}>{orgCount}</Text> entreprises du bâtiment utilisent déjà Cantia
                </Text>
              ) : null}
            </View>
            <View style={!isTablet ? { flex: 0.9, minWidth: 0 } : undefined}>
              <LaptopShot source={APP_SCREENS.fr.chantier} alt={L.appScreen} />
            </View>
          </View>
          <View style={[styles.proof, isTablet && { flexWrap: 'wrap', rowGap: 22 }]}>
            {PROOF.filter((p) => !p.value.startsWith('CHF')).map((p) => (
              <View key={p.value} style={[styles.proofCell, isTablet && { width: phone ? '100%' : '47%' }]}>
                <Text style={[sans, styles.proofValue]}>{p.value}</Text>
                <Text style={[sans, styles.proofLabel]}>{p.label}</Text>
              </View>
            ))}
          </View>
        </Wrap>
      </View>

      {/* The hidden bill */}
      <ProblemBand eyebrow="La facture cachée" headline="Vous perdez de l’argent sur vos chantiers, souvent sans le voir." problems={PROBLEM_CARDS} reliefLabel="Avec Cantia, ces angles morts disparaissent" reliefItems={RELIEF_ITEMS} />

      {/* Real exports */}
      <View onLayout={(e) => setDocsY(e.nativeEvent.layout.y)}>
        <Section white>
          <SectionHead eyebrow="La preuve" plain="Voici ce que vos clients" accent="recevront." text="Générés par Cantia avec des données d’exemple : même mise en page, mêmes calculs que vos propres documents." />
          <View style={[styles.docs, phone && { flexDirection: 'column' }]}>
            <View style={{ flex: 1 }}>
              <DocVisual source={X.devis.source} ratio={X.devis.ratio} alt={L.docAlt.signer} caption="Devis signé en ligne" />
            </View>
            <View style={{ flex: 1 }}>
              <DocVisual source={X.facture.source} ratio={X.facture.ratio} alt={L.docAlt.facturer} caption="Facture avec bulletin QR" />
            </View>
            {!tablet ? (
              <View style={{ flex: 1 }}>
                <DocVisual source={X.rapport.source} ratio={X.rapport.ratio} alt={L.docAlt.collaborer} caption="Rapport de chantier" />
              </View>
            ) : null}
          </View>
          <View style={[styles.ctaRow, { marginTop: 34 }]}>
            <Cta location="documents" label="Créer mon premier devis" />
            <Text style={[sans, styles.note]}>À vos couleurs, avec votre logo, dès aujourd’hui</Text>
          </View>
        </Section>
      </View>

      {/* ROI */}
      <Section>
        <SectionHead eyebrow="Faites le calcul" plain="Combien vous coûte" accent="l’administratif ?" text="Trois chiffres suffisent : le temps passé chaque semaine sur l’administratif au bureau, le nombre de personnes sur vos chantiers, et ce que vous coûte une heure." />
        <RoiCalculator compact={isTablet} />
      </Section>

      {/* Steps */}
      <Section white>
        <SectionHead eyebrow="Démarrer" plain="Opérationnel aujourd’hui," accent="en trois étapes." />
        <View style={[styles.steps, phone && { flexDirection: 'column', gap: 10 }]}>
          {STEPS.map((step, i) => (
            <View key={step.title} style={[styles.step, !phone && { flex: 1 }]}>
              <Text style={[serif, styles.stepNum]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[sans, styles.stepTitle]}>{step.title}</Text>
              <Text style={[sans, styles.body]}>{step.text}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.ctaRow, { marginTop: 30 }]}>
          <Cta location="steps" label="Créer mon compte" />
          <Text style={[sans, styles.note]}>Deux minutes, aucun débit pendant 14 jours</Text>
        </View>
      </Section>

      {/* Everything included */}
      <Section>
        <SectionHead eyebrow="Tout inclus" plain="Un seul outil" accent="à la place de cinq." />
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href as any} asChild>
              <Hover accessibilityRole="link" base={[styles.card, { width: phone ? '100%' : width <= 900 ? '47.5%' : '31.5%' }]} hover={{ borderColor: site.copper }}>
                <Feather name={f.icon} size={18} color={site.copper} />
                <Text style={[sans, styles.cardTitle]}>{f.title}</Text>
                <Text style={[sans, styles.body]}>{f.text}</Text>
              </Hover>
            </Link>
          ))}
        </View>
        <View style={{ marginTop: 30 }}>
          <TextLink label="Comparer les formules" href="/tarifs" />
        </View>
      </Section>

      {/* No risk */}
      <Section white>
        <View style={[styles.noRisk, isTablet && { flexDirection: 'column', gap: 26 }]}>
          <View style={!isTablet ? { width: '32%' } : undefined}>
            <Eyebrow>Ce que vous risquez</Eyebrow>
            <Text style={[serif, styles.nothing]}>Rien.</Text>
          </View>
          <View style={{ flex: 1 }}>
            {NO_RISK.map((r, i) => (
              <View key={r.title} style={[styles.riskRow, i === NO_RISK.length - 1 && { borderBottomWidth: 1 }]}>
                <Feather name="check" size={16} color={site.copper} style={{ marginTop: 3 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[sans, styles.riskTitle]}>{r.title}</Text>
                  <Text style={[sans, styles.body]}>{r.text}</Text>
                </View>
              </View>
            ))}
            <View style={[styles.ctaRow, { marginTop: 28 }]}>
              <Cta location="no_risk" />
            </View>
          </View>
        </View>
      </Section>

      {/* FAQ: answers stay in the page. */}
      <Section>
        <View style={styles.faq}>
          <Eyebrow>Avant de vous lancer</Eyebrow>
          <Headline plain="Les questions qu’on nous pose." size={h2Size} style={{ marginTop: 15, marginBottom: 30 }} />
          {FAQ.map((f, i) => (
            <FaqItem key={f.question} q={f.question} a={f.answer} last={i === FAQ.length - 1} />
          ))}
        </View>
      </Section>

      {/* Closing */}
      <View style={[styles.closing, { paddingVertical: phone ? 44 : 64 }]}>
        <Wrap style={!isTablet ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 } : { gap: 22 }}>
          <View style={!isTablet ? { flex: 1, maxWidth: 720 } : undefined}>
            <Headline plain="Votre prochain devis" accent="peut partir ce soir." size={phone ? 32 : 40} color="#f4f3e9" accentColor="#d9aa85" />
            <Text style={[sans, styles.closingFacts]}>{FACTS.filter((f) => !f.startsWith('Dès')).join('   ·   ')}</Text>
          </View>
          <View style={{ gap: 14 }}>
            <Cta location="closing" light />
            <Link href={PHONE_TEL as any} onPress={() => trackCta('closing_phone')}>
              <Text style={[sans, styles.phone]}>Une question avant ? {PHONE_DISPLAY}</Text>
            </Link>
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 64 },
  lede: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 560 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginTop: 28 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  moreText: { fontSize: 12, color: site.ink, fontWeight: '600' },
  risk: { fontSize: 10, color: '#8b9380', marginTop: 18 },
  count: { fontSize: 11, color: site.muted, marginTop: 8 },
  proof: { flexDirection: 'row', justifyContent: 'space-between', gap: 30, marginTop: 56, paddingTop: 26, borderTopWidth: 1, borderTopColor: site.line },
  proofCell: { flex: 1, minWidth: 160 },
  proofValue: { fontSize: 22, letterSpacing: -0.6, color: site.ink },
  proofLabel: { fontSize: 11, color: site.muted, marginTop: 6, lineHeight: 18 },
  docs: { flexDirection: 'row', gap: 22 },
  note: { fontSize: 11, color: site.muted },
  steps: { flexDirection: 'row', gap: 35 },
  step: { borderTopWidth: 1, borderTopColor: site.line, paddingVertical: 22 },
  stepNum: { fontSize: 32, color: site.copper, lineHeight: 38 },
  stepTitle: { fontSize: 17, fontWeight: '500', letterSpacing: -0.4, color: site.ink, marginTop: 12, marginBottom: 8 },
  body: { fontSize: 12, color: site.muted, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  card: { padding: 24, borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.white },
  cardTitle: { fontSize: 17, color: site.ink, letterSpacing: -0.3, marginTop: 16, marginBottom: 8 },
  noRisk: { flexDirection: 'row', gap: 60 },
  nothing: { fontSize: 96, lineHeight: 104, color: site.copper, marginTop: 10 },
  riskRow: { flexDirection: 'row', gap: 14, paddingVertical: 18, borderTopWidth: 1, borderColor: site.line },
  riskTitle: { fontSize: 15, color: site.ink, fontWeight: '500' },
  faq: { maxWidth: 820, width: '100%', marginHorizontal: 'auto' },
  closing: { backgroundColor: '#293128' },
  closingFacts: { fontSize: 11, color: '#b2b9a7', marginTop: 16 },
  phone: { fontSize: 12, color: '#d9aa85' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d7dacf', borderRadius: 5, backgroundColor: site.white },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, color: site.ink, lineHeight: 22 },
  stepValue: { fontFamily: DM, minWidth: 84, textAlign: 'center', fontSize: 14, color: site.ink, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#d7dacf', paddingVertical: 10 },
  roi: { flexDirection: 'row', gap: 48, borderTopWidth: 1.5, borderTopColor: ink, paddingTop: spacing.xl },
  roiCompact: { flexDirection: 'column', gap: spacing.xxl },
  roiInputs: { gap: 0 },
  roiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: rule, flexWrap: 'wrap' },
  roiLabel: { fontFamily: DM, fontSize: 16, fontWeight: '600', color: ink },
  roiHint: { fontFamily: DM, fontSize: 13, lineHeight: 18, color: site.muted, marginTop: 2 },
  roiResult: { backgroundColor: ink, borderRadius: 3, padding: spacing.xl },
  roiResultLabel: { fontFamily: DM, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: '#E8AD89' },
  explain: { marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: rule, borderBottomWidth: 1, borderBottomColor: rule },
  explainToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  explainToggleText: { fontFamily: DM, fontSize: 17, fontWeight: '700', color: ink },
  explainBody: { paddingBottom: spacing.xl, gap: spacing.md },
  explainP: { fontFamily: DM, fontSize: 15, lineHeight: 23, color: bodyInk, maxWidth: 760 },
  explainPlan: { borderLeftWidth: 3, borderLeftColor: site.copper, paddingLeft: spacing.md, gap: 3 },
  explainPlanName: { fontFamily: DM, fontSize: 16, fontWeight: '700', color: ink },
  explainLine: { fontFamily: DM, fontSize: 12.5, lineHeight: 20, color: bodyInk },
  explainTable: { borderTopWidth: 1, borderTopColor: rule },
  explainRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: 2, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: rule },
  explainTask: { flexGrow: 1, flexBasis: 260, fontFamily: DM, fontSize: 14.5, color: ink },
  explainCell: { fontFamily: DM, fontSize: 12, color: site.copper, flexBasis: 190 },
  explainPlans: { fontFamily: DM, fontSize: 13, color: site.muted, flexBasis: 240, flexGrow: 1 },
  roiBigRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, marginTop: spacing.md },
  roiBigValue: { fontFamily: DM, fontSize: 52, lineHeight: 56, fontWeight: '500', color: '#f4f3e9', fontVariant: ['tabular-nums'] },
  roiPaybackBox: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(251,246,238,0.2)', gap: 6 },
  roiPaybackText: { fontFamily: DM, fontSize: 30, lineHeight: 34, fontWeight: '500', color: '#E8AD89' },
  roiCompareLink: { marginTop: spacing.md, fontFamily: DM, fontSize: 14, fontWeight: '600', color: '#E8AD89', textDecorationLine: 'underline' },
  roiTimeRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule },
  roiResultLabelLight: { fontFamily: DM, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: site.copper },
  roiMid: { fontFamily: DM, fontSize: 52, lineHeight: 56, fontWeight: '500', color: ink },
  roiPlanScope: { fontFamily: DM, fontSize: 13.5, lineHeight: 19, color: '#D5C8B8' },
  roiFigLabel: { fontFamily: DM, fontSize: 9.5, letterSpacing: 0.3, textTransform: 'uppercase', color: '#BFB2A2' },
});
