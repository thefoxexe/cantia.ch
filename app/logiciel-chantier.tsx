import { useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { CtaButton } from '../components/landing/CtaButton';
import { SectionHead } from '../components/landing/SectionHead';
import { Cartouche } from '../components/landing/Cartouche';
import { bodyInk, ink, rule } from '../components/landing/brand';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PricingSection } from '../components/PricingSection';
import { SwissCross } from '../components/SwissCross';
import { ModuleMockup } from '../components/solutions/ModuleMockup';
import { HeroCross } from '../components/landing/HeroCross';
import { ScrollReveal } from '../components/landing/ScrollReveal';
import { colors, breakpoints, spacing } from '../lib/theme';
import { displayType, landingFonts, monoType } from '../lib/landingTheme';
import { authHref } from '../lib/appHost';

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

export default function LogicielChantierPage() {
  const scrollRef = useRef<ScrollView>(null);
  const pricingRef = useRef<View>(null);
  const heroMountainRef = useRef<View>(null);

  const { width, height } = useWindowDimensions();
  const isMobile = width < breakpoints.tablet;
  const isTablet = width < breakpoints.desktop;
  const heroMinHeight = !isMobile ? clamp(560, height * 0.82, 880) : undefined;
  const heroTitleSize = isMobile ? clamp(44, width * 0.12, 60) : clamp(60, width * 0.066, 104);

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

  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title="Logiciel de gestion de chantier pour entreprises du bâtiment | Cantia"
        description="Devis, factures, rapports de chantier, planning et rentabilité dans un seul logiciel suisse. 14 jours d’essai, sans engagement, hébergé en Suisse."
      />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <MarketingNav onPricingPress={() => scrollToRef(pricingRef)} />

        {/* Hero */}
        <View style={[styles.hero, heroMinHeight ? { minHeight: heroMinHeight } : null]}>
          <View
            ref={heroMountainRef}
            pointerEvents="none"
            style={[styles.heroMountainBase, isMobile ? styles.heroMountainMaskPeek : styles.heroMountainMaskFull]}
          />
          <View pointerEvents="none" style={styles.heroBottomFade} />
          <View style={[styles.wrap, styles.heroCopy, { zIndex: 1 }]}>
            <View style={!isTablet ? { maxWidth: '58%' } : undefined}>
              <ScrollReveal style={styles.heroKicker}>
                <SwissCross size={14} />
                <Text style={styles.heroKickerText}>Logiciel de gestion de chantier · Suisse</Text>
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <Text style={[styles.h1, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 0.92 }]}>
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
                <Text style={styles.heroLede}>
                  Excel, WhatsApp, papier : chaque outil qui manque vous coûte de l’argent quelque part sur un chantier.
                  Cantia rassemble devis, factures QR, rapports, planning et salaires, du premier devis au paiement.
                </Text>
                <View style={styles.ctaRow}>
                  <Link href={authHref('signup')} asChild>
                    <CtaButton title="Essayer 14 jours" />
                  </Link>
                  <Pressable onPress={() => scrollToRef(pricingRef)}>
                    <Text style={styles.underlineLink}>Voir les tarifs</Text>
                  </Pressable>
                </View>
                <Text style={styles.heroFacts}>{FACTS.join(isMobile ? '\n' : '   ·   ')}</Text>
              </ScrollReveal>
            </View>
            <ScrollReveal delay={640} style={[styles.heroCartouche, isTablet && { alignSelf: 'stretch', maxWidth: undefined }]}>
              <Cartouche cells={CARTOUCHE} compact={isMobile} />
            </ScrollReveal>
          </View>
        </View>

        {/* Product preview */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label="En quelques minutes" title="Du devis chiffré à la facture QR, sans ressaisie." />
          <View style={[styles.split, isTablet && styles.splitCompact]}>
            <View style={styles.splitCol}>
              <Text style={styles.bodyLarge}>
                Décrivez le travail à voix haute, Cantia chiffre avec votre catalogue de prix et génère un PDF prêt à
                envoyer. La facture reprend ensuite les mêmes lignes, avec la QR-facture suisse.
              </Text>
            </View>
            <View style={[styles.splitCol, { alignItems: 'center' }]}>
              <ModuleMockup kind="devis" />
            </View>
          </View>
        </ScrollReveal>

        {/* Pain / solution — full-bleed dark band, concrete scenarios */}
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
            </View>
          </ScrollReveal>
        </View>

        {/* Features, as a parts list */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label="Fonctionnalités" title="Tout ce dont votre entreprise a besoin, dans un seul outil." />
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href as any} asChild>
                <Pressable style={StyleSheet.flatten([styles.featureCard, isMobile && { flexBasis: '100%' }])}>
                  <Feather name={f.icon} size={20} color={colors.primary} />
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                  <Text style={styles.featureLink}>{f.href} →</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </ScrollReveal>

        {/* Pricing */}
        <View ref={pricingRef} style={{ paddingTop: 64 }}>
          <PricingSection />
        </View>

        {/* FAQ */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <SectionHead label="Avant de vous lancer" title="Questions fréquentes" />
          <View style={styles.faqList}>
            {FAQ.map((f) => (
              <View key={f.question} style={styles.faqRow}>
                <Text style={styles.faqQuestion}>{f.question}</Text>
                <Text style={styles.faqAnswer}>{f.answer}</Text>
              </View>
            ))}
          </View>
        </ScrollReveal>

        {/* Closing CTA */}
        <View style={styles.closing}>
          <ScrollReveal style={styles.wrap}>
            <Text style={styles.closingEyebrow}>Prêt à essayer ?</Text>
            <Text style={styles.closingTitle}>Chaque chantier géré à l’ancienne, c’est de l’argent que vous risquez.</Text>
            <Text style={styles.closingText}>
              14 jours d’essai sur toutes les formules, sans engagement. Devis et factures illimités dès le premier jour.
            </Text>
            <View style={styles.ctaRow}>
              <Link href={authHref('signup')} asChild>
                <CtaButton title="Essayer 14 jours" />
              </Link>
            </View>
          </ScrollReveal>
        </View>

        <MarketingFooter onPricingPress={() => scrollToRef(pricingRef)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  reliefRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, flexBasis: 440, flexGrow: 1 },
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
