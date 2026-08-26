import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SolutionPage } from '../components/SolutionPage';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';

// SEO/marketing page for the "on peut développer un module juste pour vous"
// pitch — previously a homepage section (customModules), moved here so the
// homepage stays focused and this gets its own indexable URL/meta. Same
// underlying idea as documented in the Super Admin plan: a private module
// or workflow can be switched on for one organization only, in the same
// Cantia environment everyone else uses — never a forked copy of the app.
function SurMesureVisual() {
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
          <Text style={styles.visualAddressText}>cantia.ch</Text>
        </View>
      </View>
      <View style={styles.visualScreen}>
        <View style={styles.visualModuleRow}>
          <View style={styles.visualModuleIcon}>
            <Feather name="sliders" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.visualModuleTitle}>Module privé</Text>
            <Text style={styles.visualModuleSubtitle}>Développé pour votre entreprise</Text>
          </View>
          <View style={styles.visualToggleOn}>
            <View style={styles.visualToggleDot} />
          </View>
        </View>
        <View style={styles.visualListDivider} />
        {['Visible uniquement dans votre entreprise', 'Reste dans le même environnement Cantia', 'Aucun impact sur les autres clients'].map((label) => (
          <View key={label} style={styles.visualListRow}>
            <Feather name="check-circle" size={13} color={colors.success} />
            <Text style={styles.visualListText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SurMesurePage() {
  return (
    <SolutionPage
      kicker="Sur mesure"
      title="Cantia s'adapte à votre façon de travailler"
      subtitle="Chaque entreprise a ses propres méthodes. Au-delà des modules disponibles pour tous, Cantia peut développer un workflow, une automatisation ou une intégration spécialement pour votre organisation — sans jamais modifier l'expérience des autres utilisateurs."
      visual={<SurMesureVisual />}
      features={[
        {
          icon: 'sliders',
          title: 'Modules 100% personnalisés',
          text: "Un écran, un calcul ou un workflow propre à votre métier, construit spécifiquement pour votre entreprise et activé uniquement chez vous.",
        },
        {
          icon: 'link',
          title: 'Intégrations avec vos outils existants',
          text: "Une connexion vers un logiciel que vous utilisez déjà, sur le même principe que l'intégration Bexio déjà disponible nativement.",
        },
        {
          icon: 'git-branch',
          title: 'Workflows adaptés à votre fonctionnement',
          text: "Vos étapes, vos validations, vos statuts — reproduits dans Cantia plutôt que l'inverse.",
        },
        {
          icon: 'eye-off',
          title: 'Fonctionnalités privées pour votre entreprise',
          text: "Ce qui est développé pour vous reste invisible pour les autres organisations Cantia — jamais une fonctionnalité générale imposée à tout le monde.",
        },
        {
          icon: 'refresh-cw',
          title: 'Développement directement intégré à Cantia',
          text: "Pas une application séparée à maintenir de votre côté : votre module vit dans le même Cantia, profite des mêmes mises à jour et de la même sécurité.",
        },
        {
          icon: 'message-circle',
          title: 'Un échange avant tout devis',
          text: "On discute d'abord de votre besoin réel pour vous dire honnêtement si un module standard suffit déjà, ou si un développement sur mesure a du sens.",
        },
      ]}
      steps={[
        {
          title: 'Vous nous décrivez votre besoin',
          text: 'Par e-mail ou en appel : le workflow, l’outil externe ou la fonctionnalité qui vous manque aujourd’hui.',
        },
        {
          title: 'On cadre ensemble la solution',
          text: 'Nous vous proposons une approche concrète et un devis clair avant tout développement.',
        },
        {
          title: 'Le module est développé et activé pour vous',
          text: 'Une fois prêt, il est activé uniquement pour votre entreprise, dans votre Cantia habituel — sans changement pour personne d’autre.',
        },
      ]}
      faq={[
        {
          question: 'Un module sur mesure est-il visible par les autres entreprises ?',
          answer: 'Non. Un module développé pour vous est activé uniquement pour votre organisation — les autres clients Cantia ne le voient jamais et leur expérience ne change pas.',
        },
        {
          question: 'Est-ce que je dois changer de logiciel ou installer autre chose ?',
          answer: 'Non — le module vit dans le même Cantia que vous utilisez déjà, avec les mêmes accès, la même sécurité et les mêmes mises à jour.',
        },
        {
          question: 'Combien coûte un développement sur mesure ?',
          answer: 'Cela dépend entièrement du besoin. On en discute d’abord ensemble, et vous recevez un devis clair avant tout engagement.',
        },
        {
          question: 'Cantia peut-il se connecter à un logiciel que vous ne connaissez pas encore ?',
          answer: 'C’est en général possible dès que l’outil expose un moyen d’y accéder (API, export, etc.). Décrivez-nous votre outil, on vous dira si c’est réalisable.',
        },
      ]}
      related={[
        { href: '/integrations', label: 'Intégrations disponibles nativement' },
        { href: '/solutions/facturation', label: 'Facturation & QR-facture' },
      ]}
      closingTitle="Parlons de votre besoin spécifique"
      closingText="Décrivez-nous votre fonctionnement — on vous dira honnêtement ce que Cantia peut faire pour vous, standard ou sur mesure."
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
  visualModuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  visualModuleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualModuleTitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  visualModuleSubtitle: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  visualToggleOn: {
    width: 34,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 2,
    alignItems: 'flex-end',
  },
  visualToggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  visualListDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  visualListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visualListText: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
});
