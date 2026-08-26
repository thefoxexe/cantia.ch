import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SolutionPage } from '../components/SolutionPage';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';

// Directory page for third-party integrations — today just Bexio, but the
// shape (one detailed card per integration, room for a "bientôt" row) is
// built to grow without a redesign once a second one ships. Distinct from
// the "Compatible avec Bexio" teaser card on the homepage: this is the
// place that actually explains what each integration does, in detail.
function IntegrationsVisual() {
  return (
    <View style={styles.visualFrame}>
      <View style={styles.visualTopBar}>
        <View style={styles.visualDots}>
          <View style={[styles.visualDot, { backgroundColor: '#E38B7A' }]} />
          <View style={[styles.visualDot, { backgroundColor: '#E8C57A' }]} />
          <View style={[styles.visualDot, { backgroundColor: '#8FB88A' }]} />
        </View>
        <View style={styles.visualAddressBar}>
          <Feather name="lock" size={9} color={colors.textMuted} />
          <Text style={styles.visualAddressText}>cantia.ch/compte/integrations</Text>
        </View>
      </View>
      <View style={styles.visualScreen}>
        <View style={styles.visualBexioRow}>
          <View style={styles.visualLogoBadge}>
            <Image source={require('../assets/integrations/bexio-logo.png')} style={styles.visualLogoImage} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.visualBexioTitle}>Bexio</Text>
            <View style={styles.visualStatusRow}>
              <View style={styles.visualStatusDot} />
              <Text style={styles.visualStatusText}>Connecté</Text>
            </View>
          </View>
        </View>
        <View style={styles.visualSyncList}>
          {['Clients', 'Articles → Catalogue', 'Factures', 'Statuts de paiement'].map((label) => (
            <View key={label} style={styles.visualSyncRow}>
              <Feather name="check-circle" size={13} color={colors.success} />
              <Text style={styles.visualSyncText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function IntegrationsPage() {
  return (
    <SolutionPage
      kicker="Intégrations"
      title="Connectez Cantia aux outils que vous utilisez déjà"
      subtitle="Cantia se connecte directement à votre comptabilité pour éviter la double saisie. Une première intégration native est disponible dès aujourd'hui — d'autres suivront, dans le même esprit : une connexion officielle, jamais un simple export à recopier."
      visual={<IntegrationsVisual />}
      features={[
        {
          icon: 'users',
          title: 'Clients importés automatiquement',
          text: "Vos contacts Bexio arrivent dans Cantia dès la connexion, puis restent à jour à chaque synchronisation — un seul endroit où les créer.",
        },
        {
          icon: 'package',
          title: 'Articles vers votre Catalogue',
          text: "Vos articles et prestations Bexio alimentent le Catalogue Cantia, prêts à être réutilisés dans un devis ou une facture.",
        },
        {
          icon: 'send',
          title: 'Factures envoyées en un clic',
          text: "Depuis une facture Cantia, un clic l'envoie vers Bexio en brouillon — jamais finalisée à votre place, jamais dupliquée si vous renvoyez.",
        },
        {
          icon: 'refresh-cw',
          title: 'Statuts de paiement synchronisés',
          text: "Dès qu'une facture est payée dans Bexio, Cantia le sait dans l'heure qui suit — synchronisation automatique toutes les heures, ou à la demande.",
        },
        {
          icon: 'shield',
          title: 'Connexion officielle, révocable',
          text: "L'authentification passe par le mécanisme officiel de Bexio (OAuth) — Cantia ne voit jamais votre mot de passe, et l'accès se coupe en un clic depuis Bexio ou Cantia.",
        },
        {
          icon: 'plus-circle',
          title: "D'autres intégrations à venir",
          text: "Bexio est la première d'une série pensée sur le même principe : une vraie connexion, pas un fichier à réimporter à la main.",
        },
      ]}
      steps={[
        {
          title: 'Ouvrez Compte → Intégrations',
          text: 'Un administrateur de votre organisation retrouve la carte Bexio, disponible dès le plan Équipe.',
        },
        {
          title: 'Connectez-vous à Bexio',
          text: 'Vous vous identifiez normalement sur Bexio et autorisez l’accès — Cantia ne stocke jamais votre mot de passe.',
        },
        {
          title: 'Laissez la synchronisation faire le reste',
          text: 'Clients et articles arrivent immédiatement ; ensuite, envoyez vos factures en un clic et laissez les statuts de paiement se mettre à jour tout seuls.',
        },
      ]}
      faq={[
        {
          question: 'Quelles intégrations Cantia propose-t-il aujourd’hui ?',
          answer: 'Bexio, disponible nativement dès le plan Équipe. D’autres intégrations suivront le même principe de connexion officielle.',
        },
        {
          question: 'L’intégration Bexio est-elle payante en plus de l’abonnement ?',
          answer: 'Non — elle est incluse automatiquement à partir du plan Équipe, sans module ni coût supplémentaire.',
        },
        {
          question: 'Cantia peut-il envoyer une facture définitive à mon client via Bexio ?',
          answer: 'Non. Chaque facture arrive dans Bexio en brouillon uniquement — la finalisation reste toujours une action manuelle côté Bexio.',
        },
        {
          question: 'Puis-je demander une intégration qui n’existe pas encore ?',
          answer: 'Oui, contactez-nous à info@cantia.ch : les intégrations sur mesure font partie de ce que Cantia peut développer pour votre organisation.',
        },
      ]}
      related={[
        { href: '/blog/integration-bexio-cantia-synchronisation-automatique', label: 'Comment fonctionne la connexion Bexio' },
        { href: '/blog/bexio-vs-cantia-logiciel-batiment', label: 'Bexio vs Cantia' },
        { href: '/solutions/facturation', label: 'Facturation & QR-facture' },
      ]}
      closingTitle="Connectez Bexio en deux minutes"
      closingText="Depuis Compte → Intégrations, un administrateur autorise l'accès et la synchronisation démarre — inclus dès le plan Équipe."
    />
  );
}

const styles = StyleSheet.create({
  visualFrame: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  visualTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  visualDots: {
    flexDirection: 'row',
    gap: 5,
  },
  visualDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  visualAddressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  visualAddressText: {
    fontFamily: marketingFonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  visualScreen: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  visualBexioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  visualLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#0A3A47',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  visualLogoImage: {
    width: 44,
    height: 44,
  },
  visualBexioTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  visualStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  visualStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  visualStatusText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  visualSyncList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  visualSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visualSyncText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
});
