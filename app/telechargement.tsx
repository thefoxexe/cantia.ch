import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Button, Container, Screen } from '../components/ui';
import { MarketingFooter, MarketingNav } from '../components/MarketingChrome';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { authHref } from '../lib/appHost';

const TRUST_ITEMS: { icon: 'lock' | 'flag' | 'shield'; title: string; text: string }[] = [
  {
    icon: 'lock',
    title: 'Données chiffrées',
    text: 'Toutes vos données transitent et sont stockées chiffrées, aussi bien en transit que sur nos serveurs.',
  },
  {
    icon: 'flag',
    title: 'Hébergées en Suisse',
    text: 'Vos chantiers, photos, devis et factures restent sur des serveurs situés en Suisse, soumis au droit suisse.',
  },
  {
    icon: 'shield',
    title: 'Accès sécurisé',
    text: 'Chaque membre de votre équipe a son propre accès ; vous décidez qui voit et modifie quoi.',
  },
];

export default function TelechargementScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>Version 1.0</Text>
          </View>
          <Text style={styles.title}>Cantia sur mobile</Text>
          <Text style={styles.lead}>
            Aujourd'hui, Cantia fonctionne comme une application web — installable et utilisable depuis n'importe
            quel navigateur, sur ordinateur comme sur téléphone. Les applications natives iOS et Android arrivent
            bientôt : on préfère sortir une version 1.0 solide plutôt que de se précipiter sur les stores.
          </Text>

          <View style={styles.storeGrid}>
            <StoreCard kind="apple" name="App Store" />
            <StoreCard kind="google" name="Google Play" />
          </View>

          <View style={styles.webCard}>
            <View style={styles.webCardIcon}>
              <Feather name="globe" size={20} color={colors.primary} />
            </View>
            <View style={styles.webCardBody}>
              <Text style={styles.webCardTitle}>Utiliser Cantia dès maintenant</Text>
              <Text style={styles.webCardText}>
                L'app web fonctionne sur mobile exactement comme les futures apps natives — photos, dictée vocale,
                devis, QR-factures, tout y est déjà. Ouvrez cantia.ch depuis votre téléphone et ajoutez-la à votre
                écran d'accueil pour un accès en un geste.
              </Text>
              <Link href={authHref('signup')} asChild>
                <Button title="Essayer gratuitement" onPress={() => {}} style={styles.webCardCta} />
              </Link>
            </View>
          </View>

          <Text style={styles.note}>
            Envie d'être prévenu·e à la sortie des applications ? Écrivez-nous à contact@cantia.ch.
          </Text>

          <View style={styles.trustSection}>
            <Text style={styles.trustTitle}>Vos données, en sécurité</Text>
            <Text style={styles.trustLead}>
              Que vous utilisiez le web aujourd'hui ou les apps natives demain, la sécurité de vos données ne change
              pas.
            </Text>
            <View style={styles.trustGrid}>
              {TRUST_ITEMS.map((item) => (
                <View key={item.title} style={styles.trustCard}>
                  <View style={styles.trustIcon}>
                    <Feather name={item.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.trustCardTitle}>{item.title}</Text>
                  <Text style={styles.trustCardText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

function StoreCard({ kind, name }: { kind: 'apple' | 'google'; name: string }) {
  return (
    <View style={styles.storeCard}>
      <View style={styles.storeCardIcon}>
        <Ionicons name={kind === 'apple' ? 'logo-apple' : 'logo-google-playstore'} size={28} color="#fff" />
      </View>
      <Text style={styles.storeCardName}>{name}</Text>
      <View style={styles.storeCardSoon}>
        <Text style={styles.storeCardSoonText}>Bientôt disponible</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  versionBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  lead: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 560,
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  storeCard: {
    flex: 1,
    minWidth: 200,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storeCardIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeCardName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  storeCardSoon: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  storeCardSoonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  webCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  webCardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  webCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  webCardText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  webCardCta: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  note: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  trustSection: {
    marginTop: spacing.xxxl,
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trustTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  trustLead: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 480,
    alignSelf: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  trustCard: {
    flex: 1,
    minWidth: 180,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  trustIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  trustCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  trustCardText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
