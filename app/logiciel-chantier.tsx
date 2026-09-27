import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { CtaButton } from '../components/landing/CtaButton';
import { SectionHead } from '../components/landing/SectionHead';
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
    consequence: 'Sans signature ni trace écrite, il est fait gratuitement — répété sur l’année, ça représente vite plusieurs journées de travail non payées.',
  },
  {
    icon: 'trending-down',
    problem: 'Un chantier qui a fini par coûter plus qu’il n’a rapporté.',
    consequence: 'Vous ne le découvrez qu’en comptant les heures à la fin, des semaines plus tard — quand il est trop tard pour corriger quoi que ce soit.',
  },
  {
    icon: 'alert-triangle',
    problem: 'Un client qui conteste un délai ou une prestation.',
    consequence: 'Sans photos datées ni rapport écrit, c’est votre parole contre la sienne — et c’est rarement vous qui gagnez ce genre de discussion.',
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
  { icon: 'mic', title: 'Dictée vocale', text: 'Décrivez le travail normalement — Cantia transcrit et structure.', href: '/solutions/dictee-vocale' },
  { icon: 'calendar', title: 'Planning d’équipe', text: 'Qui est où, sur quel chantier, visible par toute l’équipe.', href: '/solutions/planning' },
  { icon: 'trending-up', title: 'Rentabilité par chantier', text: 'Coûts réels vs devis, marge visible chantier par chantier.', href: '/solutions/rentabilite' },
  { icon: 'users', title: 'RH & salaires', text: 'Heures, absences et fiches de salaire suisses générées automatiquement.', href: '/solutions/rh-salaires' },
  { icon: 'credit-card', title: 'Trésorerie', text: 'Projection à 90 jours sur factures, salaires et charges à venir.', href: '/solutions/tresorerie' },
  { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Signature client sur tablette, facturés séparément du devis initial.', href: '/solutions/travaux-supplementaires' },
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
      "Les tarifs sont détaillés plus haut sur cette page — vous les choisissez selon la taille de votre équipe. Chaque plan inclut 14 jours d'essai (carte bancaire requise, aucun débit avant la fin de l'essai) pour tester avant de vous engager.",
  },
  {
    question: 'Cantia fonctionne-t-il directement dans le navigateur ?',
    answer:
      'Oui. Cantia est une application 100% web, accessible depuis un ordinateur, une tablette ou un téléphone avec n’importe quel navigateur — aucun programme à télécharger, y compris directement depuis le chantier.',
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

function Cta({ label = 'Essayer 14 jours', location, small }: { label?: string; location: string; small?: boolean }) {
  return (
    <Link href={authHref('signup')} asChild onPress={() => trackCta(location)}>
      <CtaButton title={label} style={small ? { paddingVertical: 9, paddingHorizontal: 14 } : undefined} />
    </Link>
  );
}

// Same figures as the `plans` table (monthly price, member cap). Listed from
// the largest plan down so the recap anchors on the complete offer.
const ROI_PLANS = [
  { id: 'entreprise', name: 'Entreprise', monthly: 129, members: 25 },
  { id: 'equipe', name: 'Équipe', monthly: 79, members: 10, recommended: true },
  { id: 'essentiel', name: 'Essentiel', monthly: 39, members: 3 },
] as const;

// Internal estimate of the admin time Cantia removes (dictated quotes, QR
// invoices built from the quote, hours and reports entered on the phone).
// Deliberately not displayed as a percentage on the page.
const ROI_TIME_SAVED = 0.4;
const ROI_WEEKS = 46;

// Swiss notation: CHF 9’900 and CHF 7.90.
const chf = (n: number, decimals = 0) => {
  const [int, dec] = n.toFixed(decimals).split('.');
  return `CHF ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}${dec ? `.${dec}` : ''}`;
};
const perPerson = (monthly: number, people: number) => chf(monthly / people, 2).replace(/\.00$/, '.–');

// "How much does admin cost you": two inputs (weekly admin hours, cost of an
// hour), then a recap of the time and money recovered and how fast each plan
// pays for itself.
function RoiCalculator({ compact }: { compact: boolean }) {
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(35);
  const hoursSaved = Math.round(hours * ROI_TIME_SAVED * ROI_WEEKS);
  const valueSaved = hoursSaved * rate;
  const payback = (monthly: number) => (valueSaved > 0 ? Math.max(1, Math.ceil(((monthly * 12) / valueSaved) * 365)) : null);

  const inputs = [
    { label: 'Heures d’administratif par semaine', hint: 'devis, factures, heures, relances', value: `${hours} h`, dec: () => setHours((v) => Math.max(1, v - 1)), inc: () => setHours((v) => Math.min(40, v + 1)) },
    { label: 'Combien vous coûte une heure', hint: 'votre tarif horaire ou ce que vous payez', value: `CHF ${rate}`, dec: () => setRate((v) => Math.max(25, v - 5)), inc: () => setRate((v) => Math.min(150, v + 5)) },
  ];

  return (
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
          <Text style={styles.roiResultLabelLight}>Temps récupéré par an</Text>
          <Text style={styles.roiMid}>{hoursSaved} h</Text>
          <Text style={styles.roiHint}>soit environ {Math.round(hoursSaved / 8.4)} journées de travail rendues au chantier ou à la famille.</Text>
        </View>
        <Text style={styles.roiNote}>Estimation sur {ROI_WEEKS} semaines travaillées : devis dictés, factures créées depuis le devis, heures et rapports saisis sur le téléphone.</Text>
      </View>

      <View style={[styles.roiResult, !compact && { flex: 1 }]}>
        <Text style={styles.roiResultLabel}>Ce que ce temps vous rapporte par an</Text>
        <Text style={styles.roiBig}>{chf(valueSaved)}</Text>
        <View style={styles.roiDivider} />
        <Text style={[styles.roiResultLabel, { marginTop: spacing.sm, marginBottom: spacing.sm }]}>Rentabilisé en</Text>
        {ROI_PLANS.map((p) => {
          const days = payback(p.monthly);
          const rec = 'recommended' in p && p.recommended;
          return (
            <View key={p.id} style={[styles.roiPlanLine, rec && styles.roiPlanLineRec]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.roiPlanLineName}>
                  {p.name}
                  {rec ? <Text style={styles.roiPlanLineTag}>{'   '}recommandé</Text> : null}
                </Text>
                <Text style={styles.roiPlanLineMeta}>{chf(p.monthly)}.–/mois · jusqu’à {p.members} pers. · dès {perPerson(p.monthly, p.members)}/pers.</Text>
              </View>
              <Text style={styles.roiPlanLineDays}>{days && days <= 365 ? `${days} j` : '—'}</Text>
            </View>
          );
        })}
        <View style={{ marginTop: spacing.lg }}>
          <Cta location="roi" label="Récupérer ce temps, essai 14 jours" />
        </View>
      </View>
    </View>
  );
}

export default function LogicielChantierPage() {
  const scrollRef = useRef<ScrollView>(null);
  const pricingRef = useRef<View>(null);
  const docsRef = useRef<View>(null);
  const heroMountainRef = useRef<View>(null);
  const dict = useMarketingDict();

  const { width, height } = useWindowDimensions();
  const isMobile = width < breakpoints.tablet;
  const isTablet = width < breakpoints.desktop;
  // Same fit-to-screen hero as the homepage (components/landing/useHeroFit).
  const [navHeight, setNavHeight] = useState(isMobile ? 64 : 72);
  const heroAvailable = Math.max(0, height - navHeight);
  const heroFit = useHeroFit({
    designed: isMobile ? clamp(42, width * 0.12, 60) : clamp(60, width * 0.066, 104),
    min: isMobile ? 32 : 46,
    available: heroAvailable,
    chrome: isMobile ? spacing.xxxl + spacing.xl : spacing.xxxl + spacing.xxl + spacing.xl,
  });
  const heroTitleSize = heroFit.size;
  const heroMinHeight = heroAvailable || undefined;

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

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = heroMountainRef.current as unknown as HTMLElement | null;
    if (node?.style) node.style.backgroundPosition = 'right top';
  }, []);

  function scrollToRef(ref: React.RefObject<View | null>) {
    ref.current?.measure((_x, y) => {
      scrollRef.current?.scrollTo({ y: y - 12, animated: true });
    });
  }

  const solutionHref = (slug: string) => `/solutions/${slug}`;

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title="Logiciel de gestion de chantier pour entreprises du bâtiment | Cantia"
        description="Devis, factures, rapports de chantier, planning et rentabilité dans un seul logiciel suisse. 14 jours d’essai, sans engagement, hébergé en Suisse."
      />

      {/* Landing header: always visible, one goal. No site navigation to
          leak ad traffic away — just the brand, a phone number and the CTA. */}
      <View style={styles.header} onLayout={(e) => setNavHeight(e.nativeEvent.layout.height)}>
        <View style={[styles.wrap, styles.headerInner]}>
          <Link href="/" style={styles.brand}>
            <View style={styles.brandRow}>
              <Image source={require('../assets/logo-mark.png')} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="Cantia" />
              <Text style={styles.brandText}>Cantia</Text>
            </View>
          </Link>
          <View style={styles.headerRight}>
            {!isMobile ? (
              <Link href={PHONE_TEL as any} onPress={() => trackCta('header_phone')}>
                <Text style={styles.headerPhone}>{PHONE_DISPLAY}</Text>
              </Link>
            ) : null}
            {!isMobile ? (
              <Pressable onPress={() => scrollToRef(pricingRef)}>
                <Text style={styles.headerLink}>Tarifs</Text>
              </Pressable>
            ) : null}
            <Cta location="header" small label={isMobile ? '14 jours d’essai' : 'Essayer 14 jours'} />
          </View>
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* 1 · Hero */}
        <View style={[styles.hero, heroMinHeight ? { minHeight: heroMinHeight } : null]}>
          <View
            ref={heroMountainRef}
            pointerEvents="none"
            style={[styles.heroMountainBase, isMobile ? styles.heroMountainMaskPeek : styles.heroMountainMaskFull]}
          />
          <View pointerEvents="none" style={styles.heroBottomFade} />
          <View style={[styles.wrap, styles.heroCopy, { zIndex: 1 }]}>
            <View onLayout={heroFit.onPartLayout('main')} style={!isTablet ? { maxWidth: '58%' } : undefined}>
              <ScrollReveal style={styles.heroKicker}>
                <SwissCross size={14} />
                <Text style={styles.heroKickerText}>Logiciel de gestion de chantier · Suisse</Text>
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <Text onLayout={heroFit.onTitleLayout} role="heading" aria-level={1} style={[styles.h1, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 0.92 }]}>
                  Reprenez le contrôle de vos chantiers.
                </Text>
                <View style={styles.crossedWrap}>
                  <Text style={[styles.crossedText, { fontSize: heroTitleSize * 0.42, lineHeight: heroTitleSize * 0.5 }]}>
                    Pas ce que vous oubliez de facturer.
                  </Text>
                  <HeroCross />
                </View>
              </ScrollReveal>
              <ScrollReveal delay={420} style={styles.heroBody}>
                <Text style={[styles.heroLede, isMobile && { fontSize: 17, lineHeight: 25 }]}>
                  Devis, factures QR, rapports, planning et salaires dans un seul outil suisse. Vos devis partent depuis le
                  chantier, vos suppléments sont signés, vos factures sont payées.
                </Text>
                <View style={styles.ctaRow}>
                  <Cta location="hero" />
                  <Pressable onPress={() => { trackCta('hero_examples'); scrollToRef(docsRef); }}>
                    <Text style={styles.underlineLink}>Voir des documents réels</Text>
                  </Pressable>
                </View>
                <Text style={styles.riskLine}>Aucun débit pendant 14 jours · Sans engagement · Résiliable en ligne</Text>
                {orgCount ? (
                  <Text style={styles.heroCount}>
                    <Text style={styles.heroCountNum}>{orgCount}</Text> entreprises du bâtiment utilisent déjà Cantia
                  </Text>
                ) : null}
              </ScrollReveal>
            </View>
            {!isMobile ? (
              <ScrollReveal delay={640} style={[styles.heroCartouche, isTablet && { alignSelf: 'stretch', maxWidth: undefined }]}>
                <View onLayout={heroFit.onPartLayout('cartouche')}>
                  <Cartouche cells={CARTOUCHE} compact={false} />
                </View>
              </ScrollReveal>
            ) : null}
          </View>
        </View>

        {/* 2 · Proof strip */}
        <View style={styles.wrap}>
          <View style={[styles.proof, isTablet && styles.proofCompact]}>
            {PROOF.map((p, i) => (
              <View key={p.value} style={[styles.proofCell, isTablet ? styles.proofCellCompact : i > 0 && styles.proofDivider]}>
                <Text style={styles.proofValue}>{p.value}</Text>
                <Text style={styles.proofLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3 · The problem, and what it costs */}
        <View style={styles.darkBand}>
          <ScrollReveal style={styles.wrap}>
            <Text style={styles.darkEyebrow}>La facture cachée</Text>
            <Text style={styles.darkH2}>Vous perdez de l’argent sur vos chantiers, souvent sans le voir.</Text>
            <View style={[styles.problemGrid, isTablet && { flexDirection: 'column' }]}>
              {PROBLEM_CARDS.map((p) => (
                <View key={p.problem} style={styles.problemCard}>
                  <Feather name={p.icon} size={18} color="#F3A98C" />
                  <Text style={styles.problemText}>{p.problem}</Text>
                  <Text style={styles.problemConsequence}>{p.consequence}</Text>
                </View>
              ))}
            </View>
            <View style={styles.reliefCard}>
              <Text style={styles.reliefLabel}>Avec Cantia, ces angles morts disparaissent</Text>
              <View style={styles.reliefGrid}>
                {RELIEF_ITEMS.map((r) => (
                  <View key={r} style={styles.reliefRow}>
                    <Feather name="check" size={16} color={colors.primary} style={{ marginTop: 3 }} />
                    <Text style={styles.reliefText}>{r}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.ctaRow, { marginTop: spacing.xl }]}>
                <Cta location="problem" label="Arrêter de perdre de l’argent" />
                <Text style={styles.ctaNote}>14 jours pour essayer, sans engagement</Text>
              </View>
            </View>
          </ScrollReveal>
        </View>

        {/* 4 · Real documents */}
        <View ref={docsRef} style={[styles.wrap, styles.section]}>
          <ScrollReveal>
            <SectionHead label="La preuve" title="Voici ce que vos clients recevront." intro={dict.documents.intro} />
            <DocumentShowcase dict={dict.documents} hrefFor={solutionHref} />
            <View style={[styles.ctaRow, { marginTop: spacing.xxl }]}>
              <Cta location="documents" label="Créer mon premier devis" />
              <Text style={styles.ctaNote}>À vos couleurs, avec votre logo, dès aujourd’hui</Text>
            </View>
          </ScrollReveal>
        </View>

        {/* 5 · ROI calculator */}
        <View style={[styles.wrap, styles.section]}>
          <ScrollReveal>
            <SectionHead label="Faites le calcul" title="Combien vous coûte l’administratif ?" intro="Deux chiffres suffisent : le temps que vous passez chaque semaine sur les devis, les factures et les heures, et ce que vous coûte une heure." />
            <RoiCalculator compact={isTablet} />
          </ScrollReveal>
        </View>

        {/* 6 · How to start */}
        <View style={[styles.wrap, styles.section]}>
          <ScrollReveal>
            <SectionHead label="Démarrer" title="Opérationnel aujourd’hui, en trois étapes." />
            <View style={[styles.columns, isTablet && styles.columnsCompact]}>
              {STEPS.map((step, i) => (
                <View key={step.title} style={[styles.column, isTablet ? styles.columnCompact : i > 0 && styles.columnDivider]}>
                  <Text style={styles.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.columnTitle}>{step.title}</Text>
                  <Text style={styles.bodyText}>{step.text}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.ctaRow, { marginTop: spacing.xl }]}>
              <Cta location="steps" label="Créer mon compte" />
              <Text style={styles.ctaNote}>Deux minutes, aucun débit pendant 14 jours</Text>
            </View>
          </ScrollReveal>
        </View>

        {/* 7 · Everything included */}
        <View style={[styles.wrap, styles.section]}>
          <ScrollReveal>
            <SectionHead label="Tout inclus" title="Un seul outil à la place de cinq." />
            <View style={styles.featureGrid}>
              {FEATURES.map((f) => (
                <Link key={f.title} href={f.href as any} asChild>
                  <Pressable style={StyleSheet.flatten([styles.featureCard, isMobile && { flexBasis: '100%' }])}>
                    <Feather name={f.icon} size={20} color={colors.primary} />
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </ScrollReveal>
        </View>

        {/* 8 · Pricing */}
        <View ref={pricingRef} style={{ paddingTop: 64 }}>
          <PricingSection />
        </View>

        {/* 9 · Risk reversal */}
        <View style={[styles.wrap, styles.section]}>
          <View style={[styles.noRisk, isTablet && styles.noRiskCompact]}>
            <View style={!isTablet ? { width: '32%' } : undefined}>
              <Text style={styles.noRiskEyebrow}>Ce que vous risquez</Text>
              <Text style={styles.noRiskTitle}>Rien.</Text>
            </View>
            <View style={{ flex: 1 }}>
              {NO_RISK.map((r) => (
                <View key={r.title} style={styles.noRiskRow}>
                  <Feather name="check" size={18} color={colors.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.noRiskRowTitle}>{r.title}</Text>
                    <Text style={styles.bodyText}>{r.text}</Text>
                  </View>
                </View>
              ))}
              <View style={[styles.ctaRow, { marginTop: spacing.xl }]}>
                <Cta location="no_risk" />
              </View>
            </View>
          </View>
        </View>

        {/* 10 · Objections */}
        <View style={[styles.wrap, styles.section]}>
          <ScrollReveal>
            <SectionHead label="Avant de vous lancer" title="Les questions qu’on nous pose." />
            <View style={styles.faqList}>
              {FAQ.map((f) => (
                <View key={f.question} style={styles.faqRow}>
                  <Text style={styles.faqQuestion}>{f.question}</Text>
                  <Text style={styles.faqAnswer}>{f.answer}</Text>
                </View>
              ))}
            </View>
          </ScrollReveal>
        </View>

        {/* 11 · Final call */}
        <View style={styles.closing}>
          <ScrollReveal style={styles.wrap}>
            <Text style={styles.closingEyebrow}>Prêt à essayer ?</Text>
            <Text style={[styles.closingTitle, isMobile && { fontSize: 42, lineHeight: 42 }]}>Votre prochain devis peut partir ce soir.</Text>
            <Text style={styles.closingText}>
              Créez votre compte, dictez votre premier devis, envoyez-le. 14 jours pour juger sur vos vrais chantiers.
            </Text>
            <View style={styles.ctaRow}>
              <Cta location="closing" />
              <Link href={PHONE_TEL as any} onPress={() => trackCta('closing_phone')}>
                <Text style={styles.closingPhone}>Une question avant ? {PHONE_DISPLAY}</Text>
              </Link>
            </View>
            <Text style={styles.closingFacts}>{FACTS.join('   ·   ')}</Text>
          </ScrollReveal>
        </View>

        <MarketingFooter onPricingPress={() => scrollToRef(pricingRef)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: rule, zIndex: 5 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  brand: {},
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 26, height: 26 },
  brandText: { ...displayType, fontSize: 24, fontWeight: '800', color: ink },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  headerPhone: { ...monoType, fontSize: 12, color: ink },
  headerLink: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: ink },
  riskLine: { ...monoType, fontSize: 11, letterSpacing: 0.2, lineHeight: 18, color: '#5D4F42', textTransform: 'uppercase' },
  heroCount: { fontFamily: landingFonts.body, fontSize: 15, color: bodyInk },
  heroCountNum: { fontWeight: '800', color: colors.primary },
  ctaNote: { ...monoType, fontSize: 10.5, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.2 },

  proof: { flexDirection: 'row', borderTopWidth: 1.5, borderTopColor: ink, borderBottomWidth: 1, borderBottomColor: rule, marginTop: spacing.lg },
  proofCompact: { flexDirection: 'row', flexWrap: 'wrap' },
  proofCell: { flex: 1, paddingVertical: spacing.lg, paddingRight: spacing.lg, gap: 4 },
  proofCellCompact: { flexBasis: '50%', flexGrow: 0, width: '50%', paddingRight: spacing.md },
  proofDivider: { borderLeftWidth: 1, borderLeftColor: rule, paddingLeft: spacing.lg },
  proofValue: { ...displayType, fontSize: 34, lineHeight: 36, fontWeight: '800', color: ink },
  proofLabel: { fontFamily: landingFonts.body, fontSize: 14, lineHeight: 20, color: bodyInk },

  roi: { flexDirection: 'row', gap: 48, borderTopWidth: 1.5, borderTopColor: ink, paddingTop: spacing.xl },
  roiCompact: { flexDirection: 'column', gap: spacing.xxl },
  roiInputs: { gap: 0 },
  roiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: rule, flexWrap: 'wrap' },
  roiLabel: { fontFamily: landingFonts.body, fontSize: 16, fontWeight: '600', color: ink },
  roiHint: { fontFamily: landingFonts.body, fontSize: 13, lineHeight: 18, color: colors.textMuted, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: ink, borderRadius: 3 },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, color: ink, lineHeight: 22 },
  stepValue: { ...monoType, minWidth: 84, textAlign: 'center', fontSize: 14, color: ink, borderLeftWidth: 1, borderRightWidth: 1, borderColor: ink, paddingVertical: 10 },
  roiNote: { ...monoType, fontSize: 10.5, lineHeight: 17, color: colors.textMuted, marginTop: spacing.md },
  roiResult: { backgroundColor: ink, borderRadius: 3, padding: spacing.xl },
  roiResultLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: '#E8AD89' },
  roiBig: { ...displayType, fontSize: 64, lineHeight: 66, fontWeight: '800', color: '#FBF6EE', marginBottom: spacing.md },
  roiTimeRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule },
  roiResultLabelLight: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  roiMid: { ...displayType, fontSize: 52, lineHeight: 56, fontWeight: '800', color: ink },
  roiPlanLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(251,246,238,0.15)' },
  roiPlanLineRec: { backgroundColor: 'rgba(191,90,50,0.22)', borderTopColor: colors.primary, borderRadius: 3 },
  roiPlanLineName: { fontFamily: landingFonts.body, fontSize: 16, fontWeight: '700', color: '#FBF6EE' },
  roiPlanLineTag: { ...monoType, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: '#E8AD89', fontWeight: '400' },
  roiPlanLineMeta: { fontFamily: landingFonts.body, fontSize: 12.5, lineHeight: 18, color: '#BFB2A2', marginTop: 2 },
  roiPlanLineDays: { ...displayType, fontSize: 30, lineHeight: 32, fontWeight: '800', color: '#FBF6EE', fontVariant: ['tabular-nums'] },
  roiDivider: { height: 1, backgroundColor: 'rgba(251,246,238,0.2)', marginVertical: spacing.sm },

  columns: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: rule },
  columnsCompact: { flexDirection: 'column', borderBottomWidth: 0 },
  column: { flex: 1, gap: spacing.sm, paddingRight: spacing.xl, paddingBottom: spacing.xl },
  columnDivider: { borderLeftWidth: 1, borderLeftColor: rule, paddingLeft: spacing.xl },
  columnCompact: { borderTopWidth: 1, borderTopColor: rule, paddingTop: spacing.lg, paddingRight: 0 },
  columnTitle: { fontFamily: landingFonts.body, fontSize: 20, fontWeight: '700', lineHeight: 26, color: ink },
  stepNum: { ...monoType, fontSize: 12, color: colors.primary },
  bodyText: { fontFamily: landingFonts.body, fontSize: 16, lineHeight: 25, color: bodyInk },

  noRisk: { flexDirection: 'row', gap: 48, borderTopWidth: 1.5, borderTopColor: ink, paddingTop: spacing.xl },
  noRiskCompact: { flexDirection: 'column', gap: spacing.lg },
  noRiskEyebrow: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  noRiskTitle: { ...displayType, fontSize: 96, lineHeight: 96, fontWeight: '800', color: ink, marginTop: spacing.sm },
  noRiskRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: rule },
  noRiskRowTitle: { fontFamily: landingFonts.body, fontSize: 18, fontWeight: '700', color: ink },
  closingPhone: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: '#F1E6D5', borderBottomWidth: 1.5, borderBottomColor: '#F1E6D5', paddingBottom: 2 },
  closingFacts: { ...monoType, fontSize: 10.5, letterSpacing: 0.2, color: '#A8988A', textTransform: 'uppercase', marginTop: spacing.xxl },

  wrap: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: spacing.xl },
  section: { paddingTop: 112 },
  bodyLarge: { fontFamily: landingFonts.body, fontSize: 19, lineHeight: 30, color: bodyInk, maxWidth: 520 },
  underlineLink: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: ink, borderBottomWidth: 1.5, borderBottomColor: ink, paddingBottom: 2 },

  hero: { backgroundColor: colors.bg, paddingBottom: spacing.xl, position: 'relative', overflow: 'hidden' },
  heroMountainBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/hero-mountain.webp)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  } as unknown as ViewStyle,
  heroMountainMaskFull: {
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 48%, black 72%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 48%, black 72%)',
  } as unknown as ViewStyle,
  heroMountainMaskPeek: {
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.45) 100%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.45) 100%)',
  } as unknown as ViewStyle,
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundImage: `linear-gradient(to bottom, transparent 0%, ${colors.bg} 100%)`,
  } as unknown as ViewStyle,
  heroCopy: { paddingTop: spacing.xxxl, flex: 1, justifyContent: 'space-between' },
  heroKicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.xl },
  heroKickerText: { ...monoType, fontSize: 11.5, letterSpacing: 0.3, color: '#674932', textTransform: 'uppercase' },
  h1: { ...displayType, fontWeight: '800', letterSpacing: -0.5, color: ink },
  crossedWrap: { position: 'relative', alignSelf: 'flex-start', marginTop: spacing.lg },
  crossedText: { ...displayType, fontWeight: '600', color: '#786653' },
  heroBody: { marginTop: spacing.xxl, gap: spacing.lg, maxWidth: 680 },
  heroLede: { fontFamily: landingFonts.body, fontSize: 19, lineHeight: 29, color: ink, maxWidth: 540 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xs },
  heroFacts: { ...monoType, fontSize: 11, letterSpacing: 0.2, lineHeight: 18, color: '#5D4F42', textTransform: 'uppercase' },
  heroCartouche: { alignSelf: 'flex-end', width: '100%', maxWidth: 820, marginTop: spacing.xxl },

  split: { flexDirection: 'row', gap: 64, alignItems: 'center' },
  splitCompact: { flexDirection: 'column', gap: spacing.xxl, alignItems: 'stretch' },
  splitCol: { flex: 1 },

  darkBand: { backgroundColor: colors.primaryDark, paddingVertical: 96, marginTop: 112 },
  darkEyebrow: { ...monoType, fontSize: 11, letterSpacing: 0.4, color: '#E8B79A', textTransform: 'uppercase' },
  darkH2: { ...displayType, fontSize: 48, fontWeight: '800', lineHeight: 48, color: '#fff', marginTop: spacing.md, marginBottom: spacing.xxl, maxWidth: 820 },
  problemGrid: { flexDirection: 'row', gap: spacing.xl },
  problemCard: { flex: 1, gap: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.28)', paddingTop: spacing.lg },
  problemText: { fontFamily: landingFonts.body, fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 24 },
  problemConsequence: { fontFamily: landingFonts.body, fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 23 },
  reliefCard: { marginTop: spacing.xxl, backgroundColor: colors.bg, borderRadius: 3, padding: spacing.xl },
  reliefLabel: { ...monoType, fontSize: 11, letterSpacing: 0.4, color: colors.primary, textTransform: 'uppercase', marginBottom: spacing.lg },
  reliefGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xl, rowGap: spacing.md },
  reliefRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, flexBasis: 440, flexGrow: 1, flexShrink: 1, minWidth: 0, maxWidth: '100%' },
  reliefText: { flex: 1, fontFamily: landingFonts.body, fontSize: 16, color: ink, lineHeight: 24 },

  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1.5, borderTopColor: ink },
  featureCard: { flexGrow: 1, flexBasis: '25%', minWidth: 240, gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.xl, paddingRight: spacing.xl, borderBottomWidth: 1, borderBottomColor: rule },
  featureTitle: { fontFamily: landingFonts.body, fontSize: 18, fontWeight: '700', color: ink },
  featureText: { fontFamily: landingFonts.body, fontSize: 15, color: bodyInk, lineHeight: 23 },
  featureLink: { ...monoType, fontSize: 10.5, color: colors.primary, marginTop: spacing.xs },

  faqList: { maxWidth: 820, alignSelf: 'flex-end', width: '100%' },
  faqRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: rule, gap: 6 },
  faqQuestion: { fontFamily: landingFonts.body, fontSize: 18, fontWeight: '700', color: ink },
  faqAnswer: { fontFamily: landingFonts.body, fontSize: 16, color: bodyInk, lineHeight: 25 },

  closing: { backgroundColor: ink, paddingVertical: 112, marginTop: 112 },
  closingEyebrow: { ...monoType, fontSize: 11, letterSpacing: 0.4, color: '#E8AD89', textTransform: 'uppercase' },
  closingTitle: { ...displayType, fontSize: 60, lineHeight: 58, fontWeight: '800', color: '#FBF6EE', marginVertical: spacing.lg, maxWidth: 900 },
  closingText: { fontFamily: landingFonts.body, fontSize: 18, lineHeight: 28, color: '#D5C8B8', maxWidth: 560, marginBottom: spacing.xl },
});
