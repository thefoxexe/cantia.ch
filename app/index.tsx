import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Screen } from '../components/ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

const PAIN_POINTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'edit-3',
    title: 'Notes papier qui se perdent',
    text: 'Les infos prises sur le chantier n’arrivent jamais intactes jusqu’au bureau.',
  },
  {
    icon: 'clock',
    title: 'Rapports faits le soir, en retard',
    text: 'Le temps de reconstituer un rapport propre à partir de photos éparpillées.',
  },
  {
    icon: 'folder',
    title: 'Documents introuvables',
    text: 'Plans, soumissions, photos... répartis entre le classeur, le mail et le téléphone.',
  },
];

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'file-text',
    title: 'Rapports de chantier automatiques',
    text: 'Notes et photos géoréférencées sur le terrain, transformées en rapport PDF avec votre logo et votre signature.',
  },
  {
    icon: 'folder',
    title: 'Documents en arborescence',
    text: 'Chaque chantier a son propre classeur numérique : dossiers, sous-dossiers, plans, soumissions.',
  },
  {
    icon: 'image',
    title: 'Galerie photos intelligente',
    text: 'Toutes les photos d’un chantier au même endroit, filtrables par date et localisables sur la carte.',
  },
  {
    icon: 'zap',
    title: 'Devis en quelques minutes',
    text: 'Notes de rendez-vous transformées en devis PDF chiffré, avec suivi de statut (envoyé, accepté, refusé).',
  },
  {
    icon: 'lock',
    title: 'Cloud chiffré',
    text: 'Vos documents sensibles stockés de manière sécurisée, accessibles depuis le chantier ou le bureau.',
  },
  {
    icon: 'users',
    title: 'Pensé pour l’équipe',
    text: 'De l’artisan indépendant à l’entreprise avec plusieurs collaborateurs et rôles.',
  },
];

const TRADES = [
  'Génie civil',
  'Maçonnerie',
  'Serrurerie',
  'Électricité',
  'Plomberie',
  'Menuiserie',
  'Peinture',
  'Carrelage',
];

export default function LandingScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.nav}>
          <Text style={styles.navBrand}>OPUS</Text>
          <Link href="/(auth)/login">
            <Text style={styles.navLink}>Se connecter</Text>
          </Link>
        </View>

        {/* ---- Hero ---- */}
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <View style={styles.kicker}>
              <Text style={styles.kickerText}>Pour les entreprises du bâtiment en Suisse</Text>
            </View>
            <Text style={styles.headline}>Moins de temps sur l’administratif, plus de temps sur le chantier</Text>
            <Text style={styles.subheadline}>
              Opus centralise vos rapports de chantier, vos devis et vos documents — saisis une seule fois, sur le
              terrain, et automatiquement mis en forme.
            </Text>
            <View style={styles.ctaRow}>
              <Link href="/(auth)/signup" asChild>
                <Button title="Créer mon compte gratuitement" onPress={() => {}} style={styles.ctaButton} />
              </Link>
              <Link href="/(auth)/login" asChild>
                <Button title="Se connecter" onPress={() => {}} variant="secondary" style={styles.ctaButton} />
              </Link>
            </View>
          </View>

          <AppPreview />
        </View>

        {/* ---- Pain points ---- */}
        <Section title="Le bâtiment perd du temps sur l’administratif" center>
          <View style={styles.painGrid}>
            {PAIN_POINTS.map((p) => (
              <View key={p.title} style={styles.painCard}>
                <Feather name={p.icon} size={20} color={colors.accent} />
                <Text style={styles.painTitle}>{p.title}</Text>
                <Text style={styles.painText}>{p.text}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ---- Features ---- */}
        <Section title="Tout ce qu’il faut, du chantier au bureau">
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ---- Trades ---- */}
        <Section title="Pensé pour votre métier" center>
          <View style={styles.tradeRow}>
            {TRADES.map((t) => (
              <View key={t} style={styles.tradeChip}>
                <Text style={styles.tradeChipText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.tradeNote}>
            Chaque compte se personnalise selon votre corps de métier — modèles de rapports, TVA et mise en page
            de devis compris.
          </Text>
        </Section>

        {/* ---- Swiss positioning ---- */}
        <Section>
          <View style={styles.swissBand}>
            <Feather name="flag" size={22} color={colors.primary} />
            <Text style={styles.swissTitle}>Conçu pour le marché suisse</Text>
            <Text style={styles.swissText}>
              Montants en francs suisses, TVA suisse intégrée par défaut, et une plateforme pensée dès le départ
              pour les PME et artisans indépendants du pays.
            </Text>
          </View>
        </Section>

        {/* ---- Mobile apps ---- */}
        <Section title="Bientôt sur mobile" center>
          <Text style={styles.mobileText}>
            L’application web fonctionne dès aujourd’hui sur ordinateur, tablette et téléphone. Les applications
            natives arrivent prochainement.
          </Text>
          <View style={styles.storeRow}>
            <View style={styles.storeBadge}>
              <Feather name="smartphone" size={16} color={colors.text} />
              <View>
                <Text style={styles.storeBadgeSmall}>Bientôt disponible</Text>
                <Text style={styles.storeBadgeBig}>App Store</Text>
              </View>
            </View>
            <View style={styles.storeBadge}>
              <Feather name="smartphone" size={16} color={colors.text} />
              <View>
                <Text style={styles.storeBadgeSmall}>Bientôt disponible</Text>
                <Text style={styles.storeBadgeBig}>Google Play</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* ---- Final CTA ---- */}
        <View style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Essayez Opus sur votre prochain chantier</Text>
          <Link href="/(auth)/signup" asChild>
            <Button title="Créer mon compte gratuitement" onPress={() => {}} style={{ minWidth: 260 }} />
          </Link>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>OPUS</Text>
          <Text style={styles.footerText}>Plateforme de gestion de chantier pour le bâtiment suisse.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Section({
  title,
  center,
  children,
}: {
  title?: string;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      {title ? <Text style={[styles.sectionTitle, center && styles.centerText]}>{title}</Text> : null}
      {children}
    </View>
  );
}

function AppPreview() {
  return (
    <View style={styles.preview}>
      <View style={styles.previewChrome}>
        <View style={styles.previewDot} />
        <View style={styles.previewDot} />
        <View style={styles.previewDot} />
      </View>
      <View style={styles.previewBody}>
        <Text style={styles.previewGreeting}>Bonjour</Text>
        <Text style={styles.previewOrg}>Dupont Serrurerie Sàrl</Text>
        <View style={styles.previewStatsRow}>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>12</Text>
            <Text style={styles.previewStatLabel}>Chantiers</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>34</Text>
            <Text style={styles.previewStatLabel}>Rapports</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>7</Text>
            <Text style={styles.previewStatLabel}>Devis</Text>
          </View>
        </View>
        <View style={styles.previewListRow}>
          <Feather name="hard-drive" size={14} color={colors.primary} />
          <Text style={styles.previewListText}>Villa ABC — Dalle sur rail</Text>
        </View>
        <View style={styles.previewListRow}>
          <Feather name="file-text" size={14} color={colors.primary} />
          <Text style={styles.previewListText}>Devis DEV-2026-0032</Text>
        </View>
        <View style={styles.previewListRow}>
          <Feather name="image" size={14} color={colors.primary} />
          <Text style={styles.previewListText}>18 photos géolocalisées</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  navBrand: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  navLink: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  hero: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heroCopy: {
    flex: 1,
    minWidth: 320,
  },
  kicker: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  kickerText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  headline: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 46,
    marginBottom: spacing.md,
  },
  subheadline: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    lineHeight: 26,
    maxWidth: 480,
    marginBottom: spacing.xl,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  ctaButton: {
    minWidth: 220,
  },
  preview: {
    flex: 1,
    minWidth: 300,
    maxWidth: 380,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  previewChrome: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  previewBody: {
    padding: spacing.xl,
  },
  previewGreeting: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  previewOrg: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  previewStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  previewStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  previewStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  previewStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  previewListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewListText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xl,
    maxWidth: 640,
  },
  centerText: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  painGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  painCard: {
    width: 280,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  painTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  painText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  featureCard: {
    width: 320,
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  tradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tradeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tradeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  tradeNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    alignSelf: 'center',
    lineHeight: 20,
  },
  swissBand: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  swissTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  swissText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    lineHeight: 22,
  },
  mobileText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 520,
    alignSelf: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  storeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  storeBadgeSmall: {
    fontSize: 10,
    color: colors.textMuted,
  },
  storeBadgeBig: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  finalCta: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  finalCtaTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 520,
  },
  footer: {
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBrand: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
