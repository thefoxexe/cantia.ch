import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SolutionPage } from '../components/SolutionPage';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';

// Directory page for third-party integrations — today just Bexio, but the
// shape (one detailed card per integration, room for a "bientôt" row) is
// built to grow without a redesign once a second one ships. Distinct from
// the "Compatible avec Bexio" teaser ribbon on the homepage: this is the
// place that actually explains what each integration does, in detail.
//
// The hero visual is a real interconnection diagram — Cantia's mark on one
// end, Bexio's logo on the other, with one connector row per data type
// that actually syncs — rather than a fake browser-chrome mockup of a
// screen that doesn't really look like this. It's meant to read at a
// glance as "these two systems talk to each other, both ways", which a
// static screenshot-style mockup never communicated as clearly.
function IntegrationsVisual() {
  const rows: { icon: keyof typeof Feather.glyphMap; label: string }[] = [
    { icon: 'users', label: 'Clients' },
    { icon: 'file-text', label: 'Devis' },
    { icon: 'file', label: 'Factures' },
    { icon: 'credit-card', label: 'Statuts de paiement' },
  ];
  return (
    <View style={styles.visualFrame}>
      <View style={styles.visualEndpoints}>
        <View style={styles.visualEndpoint}>
          <View style={styles.visualLogoBadgeCantia}>
            <Image source={require('../assets/logo-mark.png')} style={styles.visualLogoImageCantia} resizeMode="contain" />
          </View>
          <Text style={styles.visualEndpointLabel}>Cantia</Text>
        </View>
        <View style={styles.visualEndpoint}>
          <View style={styles.visualLogoBadge}>
            <Image source={require('../assets/integrations/bexio-logo.png')} style={styles.visualLogoImage} resizeMode="contain" />
          </View>
          <Text style={styles.visualEndpointLabel}>Bexio</Text>
        </View>
      </View>

      <View style={styles.visualLinks}>
        {rows.map((row) => (
          <View key={row.label} style={styles.visualLinkRow}>
            <View style={styles.visualLinkLabelWrap}>
              <Feather name={row.icon} size={12} color={colors.textMuted} />
              <Text style={styles.visualLinkLabel}>{row.label}</Text>
            </View>
            <View style={styles.visualLinkLine}>
              <View style={styles.visualDash} />
              <View style={styles.visualSyncDot}>
                <Feather name="repeat" size={9} color="#fff" />
              </View>
              <View style={styles.visualDash} />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.visualCaption}>Synchronisé automatiquement, dans les deux sens</Text>
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
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  visualEndpoints: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  visualEndpoint: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  visualLogoBadgeCantia: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  visualLogoImageCantia: {
    width: 34,
    height: 34,
  },
  visualLogoBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: '#0A3A47',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  visualLogoImage: {
    width: 56,
    height: 56,
  },
  visualEndpointLabel: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  visualLinks: {
    gap: spacing.md,
  },
  visualLinkRow: {
    gap: 6,
  },
  visualLinkLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visualLinkLabel: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  visualLinkLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visualDash: {
    flex: 1,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderTopColor: colors.border,
  },
  visualSyncDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  visualCaption: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
