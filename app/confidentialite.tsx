import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../components/ui';
import { colors, fontSize, spacing } from '../lib/theme';

export default function ConfidentialiteScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Container style={styles.container}>
          <Link href="/" asChild>
            <Pressable style={styles.back} hitSlop={8}>
              <Feather name="arrow-left" size={16} color={colors.text} />
              <Text style={styles.backText}>Retour</Text>
            </Pressable>
          </Link>

          <Text style={styles.title}>Politique de confidentialité</Text>
          <Text style={styles.updated}>Dernière mise à jour : juillet 2026</Text>

          <LegalSection title="Données collectées">
            <Text style={styles.p}>
              Nous collectons les informations nécessaires au fonctionnement du service : votre e-mail et mot de
              passe (via l'authentification), les informations de votre entreprise (nom, adresse, logo), ainsi que
              les données que vous saisissez dans l'application (chantiers, rapports, photos géolocalisées, devis,
              documents).
            </Text>
          </LegalSection>

          <LegalSection title="Finalité du traitement">
            <Text style={styles.p}>
              Ces données sont utilisées exclusivement pour fournir le service Cantia : générer vos rapports et
              devis, organiser vos chantiers et gérer votre abonnement. Elles ne sont jamais vendues à des tiers.
            </Text>
          </LegalSection>

          <LegalSection title="Sous-traitants">
            <Text style={styles.p}>
              Nous utilisons Supabase (base de données, authentification, stockage), Netlify (diffusion de
              l'interface web) et Stripe (paiement des abonnements) comme sous-traitants techniques. Chacun applique
              ses propres mesures de sécurité et de conformité.
            </Text>
          </LegalSection>

          <LegalSection title="Localisation des données">
            <Text style={styles.p}>
              Vos données — base de données, fichiers, photos et documents — sont hébergées et traitées en Suisse,
              dans le centre de données Supabase basé à Zurich. Elles ne quittent pas le territoire suisse dans le
              cadre du fonctionnement normal du service.
            </Text>
          </LegalSection>

          <LegalSection title="Vos droits">
            <Text style={styles.p}>
              Conformément à la loi suisse sur la protection des données (LPD) et, le cas échéant, au RGPD, vous
              disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ce
              droit à tout moment en nous écrivant à privacy@cantia.ch, ou en supprimant directement vos données
              depuis l'application.
            </Text>
          </LegalSection>

          <LegalSection title="Conservation des données">
            <Text style={styles.p}>
              Vos données sont conservées tant que votre compte est actif. En cas de suppression de votre compte,
              elles sont supprimées de nos serveurs dans un délai raisonnable, sous réserve des obligations légales
              de conservation.
            </Text>
          </LegalSection>

          <LegalSection title="Cookies">
            <Text style={styles.p}>
              L'application utilise uniquement des cookies et un stockage local techniques, nécessaires à votre
              connexion et à vos préférences (langue). Aucun cookie publicitaire ou de suivi tiers n'est utilisé.
            </Text>
          </LegalSection>

          <LegalSection title="Contact">
            <Text style={styles.p}>Pour toute question relative à vos données, écrivez-nous à privacy@cantia.ch.</Text>
          </LegalSection>
        </Container>
      </ScrollView>
    </Screen>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingVertical: spacing.xxl,
  },
  container: {
    maxWidth: 720,
    paddingHorizontal: spacing.xl,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  updated: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  p: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 21,
  },
});
