import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Container, Screen } from '../components/ui';
import { Heading } from '../components/Heading';
import { MarketingHead } from '../components/MarketingHead';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { PricingSection } from '../components/PricingSection';
import { SwissCross } from '../components/SwissCross';
import { ModuleMockup } from '../components/solutions/ModuleMockup';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { authHref } from '../lib/appHost';

type IconName = keyof typeof Feather.glyphMap;

const PAIN_POINTS = [
  'Devis et factures dispersés entre Excel, Word et papier',
  'Suivi de chantier flou, rien de centralisé pour l’équipe',
  'Rapports de chantier rédigés le soir, de mémoire',
  'Factures sans QR-code, paiements difficiles à rapprocher',
];

const SOLUTIONS = [
  'Devis et factures générés en quelques minutes, dictés à la voix',
  'Chaque chantier centralisé : notes, photos, documents, rentabilité',
  'Rapport de chantier rédigé automatiquement pendant que vous êtes encore sur place',
  'QR-facture suisse conforme sur chaque facture, statut de paiement à jour',
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
    question: 'Ai-je besoin d’installer un logiciel sur mon ordinateur ?',
    answer:
      'Non. Cantia fonctionne entièrement dans le navigateur, sur ordinateur, tablette ou téléphone — sans rien installer, y compris directement depuis le chantier.',
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

export default function LogicielChantierPage() {
  const heroAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const pricingRef = useRef<View>(null);

  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [heroAnim]);

  function scrollToPricing() {
    pricingRef.current?.measure((_x, y) => {
      scrollRef.current?.scrollTo({ y: y - 12, animated: true });
    });
  }

  return (
    <Screen>
      <MarketingHead
        title="Logiciel de gestion de chantier pour entreprises du bâtiment | Cantia"
        description="Devis, factures, rapports de chantier, planning et rentabilité dans un seul logiciel suisse. Essai gratuit 14 jours, sans engagement, hébergé en Suisse."
      />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav onPricingPress={scrollToPricing} />

        {/* Hero */}
        <Container style={styles.heroOuter}>
          <View style={styles.heroRow}>
            <Animated.View
              style={[
                styles.heroText,
                { opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
              ]}
            >
              <View style={styles.kickerPill}>
                <SwissCross size={13} />
                <Text style={styles.kickerText}>Logiciel de gestion de chantier · Suisse</Text>
              </View>
              <Heading level={1} style={styles.title}>
                Le logiciel de gestion de chantier fait pour les entreprises du bâtiment en Suisse
              </Heading>
              <Text style={styles.subtitle}>
                Devis, factures, rapports de chantier, planning et rentabilité — un seul outil, pensé pour les
                artisans et PME romandes qui n’ont pas de temps à perdre en administratif.
              </Text>
              <View style={styles.ctaRow}>
                <Link href={authHref('signup')} asChild>
                  <Button title="Essai gratuit 14 jours" onPress={() => {}} icon="arrow-up-right" />
                </Link>
                <Button title="Voir les tarifs" onPress={scrollToPricing} variant="secondary" />
              </View>
              <View style={styles.trustRow}>
                <Text style={styles.trustItem}>Hébergé en Suisse</Text>
                <Text style={styles.trustDot}>·</Text>
                <Text style={styles.trustItem}>QR-facture conforme</Text>
                <Text style={styles.trustDot}>·</Text>
                <Text style={styles.trustItem}>Sans engagement</Text>
              </View>
            </Animated.View>
            <Animated.View
              style={[
                styles.heroVisual,
                { opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] },
              ]}
            >
              <ModuleMockup kind="devis" />
            </Animated.View>
          </View>
        </Container>

        {/* Pain / solution */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Fini les devis sur un coin de table</Text>
          <View style={styles.compareGrid}>
            <View style={styles.compareCol}>
              <Text style={styles.compareColTitle}>Sans outil dédié</Text>
              {PAIN_POINTS.map((p) => (
                <View key={p} style={styles.compareRow}>
                  <Feather name="x" size={15} color={colors.danger} style={styles.compareIcon} />
                  <Text style={styles.compareText}>{p}</Text>
                </View>
              ))}
            </View>
            <View style={styles.compareCol}>
              <Text style={[styles.compareColTitle, { color: colors.primaryDark }]}>Avec Cantia</Text>
              {SOLUTIONS.map((s) => (
                <View key={s} style={styles.compareRow}>
                  <Feather name="check" size={15} color={colors.success} style={styles.compareIcon} />
                  <Text style={styles.compareText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        </Container>

        {/* Feature grid */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Tout ce dont votre entreprise a besoin, dans un seul outil</Text>
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
        </Container>

        {/* Trust band */}
        <Container style={styles.section}>
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
        </Container>

        {/* Pricing */}
        <View ref={pricingRef}>
          <PricingSection />
        </View>

        {/* FAQ */}
        <Container style={styles.section}>
          <Text style={styles.eyebrow}>Questions fréquentes</Text>
          <View style={styles.faqList}>
            {FAQ.map((f, i) => (
              <View key={f.question} style={[styles.faqRow, i === FAQ.length - 1 && styles.faqRowLast]}>
                <Text style={styles.faqQuestion}>{f.question}</Text>
                <Text style={styles.faqAnswer}>{f.answer}</Text>
              </View>
            ))}
          </View>
        </Container>

        {/* Closing CTA */}
        <Container style={styles.closingOuter}>
          <View style={styles.closing}>
            <Text style={styles.closingTitle}>Prêt à arrêter de perdre du temps en administratif ?</Text>
            <Text style={styles.closingText}>
              14 jours d'essai gratuit sur tous les plans, sans engagement — devis et factures illimités dès le
              premier jour.
            </Text>
            <Link href={authHref('signup')} asChild>
              <Button title="Essai gratuit 14 jours" variant="secondary" onPress={() => {}} style={styles.closingCta} />
            </Link>
          </View>
        </Container>

        <MarketingFooter onPricingPress={scrollToPricing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  heroOuter: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xxl },
  heroText: { flex: 1, minWidth: 320 },
  heroVisual: { flex: 1, minWidth: 300, alignItems: 'center' },
  kickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  kickerText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: marketingFonts.display,
    fontSize: 46,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 52,
    maxWidth: 640,
  } as unknown as ViewStyle,
  subtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 24,
    maxWidth: 540,
  },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xl },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  trustItem: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  trustDot: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.border },
  section: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  eyebrow: {
    fontFamily: marketingFonts.body,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    maxWidth: 620,
  },
  compareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  compareCol: { flex: 1, minWidth: 280, gap: spacing.sm },
  compareColTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  compareRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  compareIcon: { marginTop: 3 },
  compareText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: 21, flex: 1 },
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
  featureTitle: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  featureText: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
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
  trustBandText: { fontFamily: marketingFonts.body, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16, fontWeight: '600' },
  faqList: { maxWidth: 760 },
  faqRow: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 6 },
  faqRowLast: { borderBottomWidth: 0 },
  faqQuestion: { fontFamily: marketingFonts.body, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  faqAnswer: { fontFamily: marketingFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 21, maxWidth: 640 },
  closingOuter: { maxWidth: 1040, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  closing: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  closingTitle: {
    fontFamily: marketingFonts.display,
    fontSize: 30,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.4,
    textAlign: 'center',
    maxWidth: 520,
  },
  closingText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 440,
  },
  closingCta: { marginTop: spacing.xl, borderWidth: 0 },
});
