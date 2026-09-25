import { useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PricingSection } from '../components/PricingSection';
import { SwissCross } from '../components/SwissCross';
import { ModuleMockup } from '../components/solutions/ModuleMockup';
import { HeroCross } from '../components/landing/HeroCross';
import { ScrollReveal } from '../components/landing/ScrollReveal';
import { colors, breakpoints, fontSize, radius, spacing } from '../lib/theme';
import { landingFonts } from '../lib/landingTheme';
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
      "Les tarifs sont détaillés plus haut sur cette page — vous les choisissez selon la taille de votre équipe. Chaque plan inclut 14 jours d'essai gratuit (carte bancaire requise, aucun débit avant la fin de l'essai) pour tester avant de vous engager.",
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

const BASELINE_ITEMS = ['Devis & factures', 'Rapports de chantier', 'Planning d’équipe', 'Rentabilité', 'RH & salaires', 'Trésorerie'];

export default function LogicielChantierPage() {
  const scrollRef = useRef<ScrollView>(null);
  const pricingRef = useRef<View>(null);
  const featuresRef = useRef<View>(null);
  const heroMountainRef = useRef<View>(null);

  const { width, height } = useWindowDimensions();
  const isMobile = width < breakpoints.tablet;
  const isTablet = width < breakpoints.desktop;
  const heroMinHeight = !isMobile ? clamp(380, height * 0.58, 620) : undefined;
  const heroTitleSize = clamp(32, width * 0.048, 66);
  const heroCrossedSize = clamp(20, width * 0.03, 38);

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
        description="Devis, factures, rapports de chantier, planning et rentabilité dans un seul logiciel suisse. Essai gratuit 14 jours, sans engagement, hébergé en Suisse."
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
            <ScrollReveal style={styles.heroKicker}>
              <View style={styles.originSymbol}>
                <SwissCross size={14} />
              </View>
              <Text style={styles.heroKickerText}>Logiciel de gestion de chantier · Suisse</Text>
            </ScrollReveal>

            <View style={[styles.heroMain, isTablet && styles.heroMainCompact]}>
              <ScrollReveal style={[styles.heroTitleCol, !isTablet && styles.heroTitleColWide]} delay={120}>
                <Text style={[styles.h1, { fontSize: heroTitleSize, lineHeight: heroTitleSize * 1.1 }]}>
                  Reprenez le contrôle
                  {'\n'}
                  de vos <Text style={styles.h1Highlight}>chantiers.</Text>
                </Text>
                <View style={styles.crossedWrap}>
                  <Text style={[styles.crossedText, { fontSize: heroCrossedSize }]}>Pas ce que vous oubliez de facturer.</Text>
                  <HeroCross />
                </View>
              </ScrollReveal>
              <ScrollReveal style={[styles.heroAside, !isTablet && styles.heroAsideWide]} delay={420}>
                <Text style={styles.heroAsideEyebrow}>FAIT. FACTURÉ. PAYÉ.</Text>
                <Text style={styles.heroAsideP1}>Ce que vous ne facturez pas, vous ne le récupérez jamais.</Text>
                <Text style={styles.heroAsideP2}>
                  Excel, WhatsApp, papier : chaque outil que vous n’avez pas vous coûte de l’argent quelque part sur
                  un chantier, sans que vous le voyiez venir. Cantia centralise tout, du devis au paiement.
                </Text>
                <View style={styles.ctaRow}>
                  <Link href={authHref('signup')} asChild>
                    <Button title="Essai gratuit 14 jours" onPress={() => {}} icon="arrow-up-right" />
                  </Link>
                  <Button title="Voir les tarifs" onPress={() => scrollToRef(pricingRef)} variant="secondary" />
                </View>
                <Pressable onPress={() => scrollToRef(featuresRef)}>
                  <Text style={styles.heroDiscover}>Découvrir les fonctionnalités ↓</Text>
                </Pressable>
                <View style={styles.trustRow}>
                  <Text style={styles.trustItem}>Hébergé en Suisse</Text>
                  <Text style={styles.trustDot}>·</Text>
                  <Text style={styles.trustItem}>QR-facture conforme</Text>
                  <Text style={styles.trustDot}>·</Text>
                  <Text style={styles.trustItem}>Sans engagement</Text>
                </View>
              </ScrollReveal>
            </View>

            <ScrollReveal style={[styles.heroBaseline, isMobile && styles.heroBaselineCompact]} delay={680}>
              <Text style={styles.baselineLabel}>TOUT INCLUS, UN SEUL ABONNEMENT</Text>
              {!isTablet ? (
                <View style={styles.baselineItems}>
                  {BASELINE_ITEMS.map((item) => (
                    <Text key={item} style={styles.baselineItem}>{item}</Text>
                  ))}
                </View>
              ) : null}
              <View style={styles.baselineOrigin}>
                <SwissCross size={12} />
                <Text style={styles.baselineNumber}>Zurich, Suisse</Text>
              </View>
            </ScrollReveal>
          </View>
        </View>

        {/* Product preview */}
        <ScrollReveal style={styles.wrap}>
          <View style={styles.showcase}>
            <View style={styles.showcaseCopy}>
              <Text style={styles.eyebrow}>En quelques minutes</Text>
              <Text style={styles.h2}>Du devis chiffré à la facture QR, sans ressaisie.</Text>
              <Text style={styles.bodyText}>
                Décrivez le travail à voix haute, Cantia chiffre avec votre catalogue de prix et génère un PDF prêt à
                envoyer — la facture reprend automatiquement les mêmes lignes, avec QR-facture suisse conforme.
              </Text>
            </View>
            <View style={styles.showcaseVisual}>
              <ModuleMockup kind="devis" />
            </View>
          </View>
        </ScrollReveal>

        {/* Pain / solution — full-bleed dark band, concrete scenarios not a feature list */}
        <View style={styles.darkBand}>
          <ScrollReveal style={styles.wrap}>
            <Text style={styles.darkEyebrow}>La facture cachée</Text>
            <Text style={styles.darkH2}>Vous perdez de l’argent sur vos chantiers. Vous ne le voyez juste pas encore.</Text>
            <View style={styles.problemGrid}>
              {PROBLEM_CARDS.map((p, i) => (
                <ScrollReveal key={p.problem} style={styles.problemCard} delay={80 + i * 90}>
                  <View style={styles.problemIcon}>
                    <Feather name={p.icon} size={17} color="#F3A98C" />
                  </View>
                  <Text style={styles.problemText}>{p.problem}</Text>
                  <Text style={styles.problemConsequence}>{p.consequence}</Text>
                </ScrollReveal>
              ))}
            </View>
            <ScrollReveal style={styles.reliefCard} delay={440}>
              <Text style={styles.reliefLabel}>Avec Cantia, ces angles morts disparaissent</Text>
              <View style={styles.reliefGrid}>
                {RELIEF_ITEMS.map((r) => (
                  <View key={r} style={styles.reliefRow}>
                    <View style={styles.reliefIcon}>
                      <Feather name="check" size={13} color={colors.success} />
                    </View>
                    <Text style={styles.reliefText}>{r}</Text>
                  </View>
                ))}
              </View>
            </ScrollReveal>
          </ScrollReveal>
        </View>

        {/* Feature grid */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <View ref={featuresRef}>
            <Text style={styles.eyebrow}>Fonctionnalités</Text>
            <Text style={styles.h2}>Tout ce dont votre entreprise a besoin, dans un seul outil.</Text>
          </View>
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href as any} asChild>
                <Pressable style={({ hovered }: any) => [styles.featureCard, hovered && styles.featureCardHovered]}>
                  {({ hovered }: any) => (
                    <>
                      <View style={[styles.featureIcon, hovered && styles.featureIconHovered]}>
                        <Feather name={f.icon} size={18} color={hovered ? '#fff' : colors.primary} />
                      </View>
                      <Text style={styles.featureTitle}>{f.title}</Text>
                      <Text style={styles.featureText}>{f.text}</Text>
                    </>
                  )}
                </Pressable>
              </Link>
            ))}
          </View>
        </ScrollReveal>

        {/* Trust band */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <View style={styles.trustBand}>
            <View style={styles.trustBandItem}>
              <Feather name="map-pin" size={18} color={colors.primary} />
              <Text style={styles.trustBandText}>Données hébergées{'\n'}en Suisse (Zurich)</Text>
            </View>
            <View style={styles.trustBandItem}>
              <Feather name="shield" size={18} color={colors.primary} />
              <Text style={styles.trustBandText}>QR-facture{'\n'}norme SIX conforme</Text>
            </View>
            <View style={styles.trustBandItem}>
              <Feather name="globe" size={18} color={colors.primary} />
              <Text style={styles.trustBandText}>Interface{'\n'}FR · DE · IT</Text>
            </View>
            <View style={styles.trustBandItem}>
              <Feather name="x-circle" size={18} color={colors.primary} />
              <Text style={styles.trustBandText}>Résiliable{'\n'}à tout moment</Text>
            </View>
          </View>
        </ScrollReveal>

        {/* Pricing */}
        <View ref={pricingRef}>
          <PricingSection />
        </View>

        {/* FAQ */}
        <ScrollReveal style={[styles.wrap, styles.section]}>
          <Text style={styles.eyebrow}>Questions fréquentes</Text>
          <View style={styles.faqList}>
            {FAQ.map((f, i) => (
              <View key={f.question} style={[styles.faqRow, i === FAQ.length - 1 && styles.faqRowLast]}>
                <Text style={styles.faqQuestion}>{f.question}</Text>
                <Text style={styles.faqAnswer}>{f.answer}</Text>
              </View>
            ))}
          </View>
        </ScrollReveal>

        {/* Closing CTA */}
        <View style={[styles.wrap, styles.closingOuter]}>
          <View style={styles.closing}>
            <Text style={styles.closingTitle}>Chaque chantier géré à l’ancienne, c’est de l’argent que vous risquez.</Text>
            <Text style={styles.closingText}>
              14 jours d'essai gratuit sur tous les plans, sans engagement — devis et factures illimités dès le
              premier jour.
            </Text>
            <Link href={authHref('signup')} asChild>
              <Button title="Essai gratuit 14 jours" variant="secondary" onPress={() => {}} style={styles.closingCta} />
            </Link>
          </View>
        </View>

        <MarketingFooter onPricingPress={() => scrollToRef(pricingRef)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: spacing.xl },
  section: { paddingTop: spacing.xxxl },

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
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 42%, black 65%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 42%, black 65%)',
  } as unknown as ViewStyle,
  heroMountainMaskPeek: {
    maskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.55) 100%)',
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.55) 100%)',
  } as unknown as ViewStyle,
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundImage: `linear-gradient(to bottom, transparent 0%, ${colors.bg} 100%)`,
  } as unknown as ViewStyle,
  heroCopy: { paddingTop: spacing.xl },
  heroKicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  originSymbol: { alignItems: 'center', justifyContent: 'center' },
  heroKickerText: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: '#674932' },
  heroMain: { flexDirection: 'row', gap: 56, paddingVertical: spacing.xxl, alignItems: 'flex-start' },
  heroMainCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: spacing.xl },
  heroTitleCol: { minWidth: 0 },
  heroTitleColWide: { flex: 1.15 },
  h1: { fontFamily: landingFonts.body, fontWeight: '700', letterSpacing: -2, color: colors.text },
  h1Highlight: { color: colors.primary },
  crossedWrap: { position: 'relative', alignSelf: 'flex-start', marginTop: spacing.lg },
  crossedText: { fontFamily: landingFonts.body, fontWeight: '500', letterSpacing: -0.6, color: '#786653' },
  heroAside: { gap: spacing.sm, maxWidth: 420 },
  heroAsideWide: { flex: 1 },
  heroAsideEyebrow: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.primary },
  heroAsideP1: { fontFamily: landingFonts.body, fontSize: 21, fontWeight: '700', color: colors.text, lineHeight: 28, marginTop: spacing.xs, letterSpacing: -0.3 },
  heroAsideP2: { fontFamily: landingFonts.body, fontSize: 15, color: colors.textMuted, lineHeight: 24, marginBottom: spacing.xs },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  heroDiscover: {
    alignSelf: 'flex-start',
    fontFamily: landingFonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#D7C6B1',
  },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  trustItem: { fontFamily: landingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  trustDot: { fontFamily: landingFonts.body, fontSize: fontSize.xs, color: colors.border },
  heroBaseline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  heroBaselineCompact: { justifyContent: 'space-between' },
  baselineLabel: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textMuted },
  baselineItems: { flexDirection: 'row', gap: spacing.xl, flexWrap: 'wrap' },
  baselineItem: { fontFamily: landingFonts.body, fontSize: 12, color: colors.text },
  baselineOrigin: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  baselineNumber: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textMuted },

  eyebrow: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.primary, textTransform: 'uppercase' },
  h2: {
    fontFamily: landingFonts.body,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 38,
    color: colors.text,
    marginTop: 10,
    marginBottom: spacing.md,
    maxWidth: 620,
  },
  bodyText: { fontFamily: landingFonts.body, fontSize: 15, lineHeight: 24, color: colors.textMuted, maxWidth: 480 },

  showcase: { flexDirection: 'row', flexWrap: 'wrap-reverse', alignItems: 'center', gap: spacing.xxl, paddingVertical: spacing.xxxl },
  showcaseCopy: { flex: 1, minWidth: 300 },
  showcaseVisual: { flex: 1, minWidth: 300, alignItems: 'center' },

  darkBand: { backgroundColor: colors.primaryDark, paddingVertical: spacing.xxxl * 1.2 },
  darkEyebrow: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: '#E8B79A', textTransform: 'uppercase' },
  darkH2: {
    fontFamily: landingFonts.body,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 40,
    color: '#fff',
    marginTop: 10,
    marginBottom: spacing.xl,
    maxWidth: 640,
  },
  problemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  problemCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    gap: spacing.xs,
  } as unknown as ViewStyle,
  problemIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  problemText: { fontFamily: landingFonts.body, fontSize: 16, fontWeight: '700', color: '#fff', lineHeight: 22 },
  problemConsequence: { fontFamily: landingFonts.body, fontSize: 14, color: 'rgba(255,255,255,0.68)', lineHeight: 20 },
  reliefCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  } as unknown as ViewStyle,
  reliefLabel: {
    fontFamily: landingFonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  reliefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  reliefRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, minWidth: 280, flex: 1 },
  reliefIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  reliefText: { fontFamily: landingFonts.body, fontSize: 15, color: colors.text, lineHeight: 21, flex: 1, fontWeight: '500' },

  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  featureCard: {
    flex: 1,
    minWidth: 230,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    transitionProperty: 'transform, border-color, box-shadow',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
  } as unknown as ViewStyle,
  featureCardHovered: {
    borderColor: colors.primary,
    transform: [{ translateY: -3 }],
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
  } as unknown as ViewStyle,
  featureIconHovered: { backgroundColor: colors.primary },
  featureTitle: { fontFamily: landingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  featureText: { fontFamily: landingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },

  trustBand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
  },
  trustBandItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 200 },
  trustBandText: { fontFamily: landingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16, fontWeight: '600' },

  faqList: { maxWidth: 760 },
  faqRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 6 },
  faqRowLast: { borderBottomWidth: 0 },
  faqQuestion: { fontFamily: landingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  faqAnswer: { fontFamily: landingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 21, maxWidth: 640 },

  closingOuter: { paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl },
  closing: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  closingTitle: {
    fontFamily: landingFonts.body,
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.4,
    textAlign: 'center',
    maxWidth: 580,
  },
  closingText: {
    fontFamily: landingFonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 440,
  },
  closingCta: { marginTop: spacing.xl, borderWidth: 0 },
});
