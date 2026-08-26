import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
// Both diagrams below are real interconnection diagrams — Cantia's mark on
// one end, Bexio's logo on the other, connected by genuinely curved
// bidirectional arrows (a plain straight dashed line read as flat/boxy) —
// rather than a fake browser-chrome mockup of a screen that doesn't really
// look like this. Curves are drawn with react-native-svg (quadratic
// béziers) instead of CSS border tricks so they render identically and
// crisply on web, iOS and Android at any width.
type FlowIcon = keyof typeof Feather.glyphMap;

// A single bold, curved, two-way arrow — solid stroke with open chevron
// (hand-drawn-style) arrowheads on both ends, not a thin dashed line with
// tiny filled triangles. viewBoxWidth is a nominal coordinate-space width
// (not pixels) — the Svg stretches to fill its actual container via
// width="100%" + preserveAspectRatio="none", so the same curve reads
// correctly at any real rendered width.
function CurvedArrow({
  height,
  bulge,
  color = colors.primary,
  strokeWidth = 3,
  viewBoxWidth = 320,
}: {
  height: number;
  bulge: number;
  color?: string;
  strokeWidth?: number;
  viewBoxWidth?: number;
}) {
  const y = height / 2;
  const x1 = 10;
  const x2 = viewBoxWidth - 10;
  const cx = viewBoxWidth / 2;
  const cy = y + bulge;
  const headLen = 11;
  const headSpread = 7;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${viewBoxWidth} ${height}`} preserveAspectRatio="none">
      <Path d={`M${x1},${y} Q${cx},${cy} ${x2},${y}`} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      <Path
        d={`M${x1 + headLen},${y - headSpread} L${x1},${y} L${x1 + headLen},${y + headSpread}`}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={`M${x2 - headLen},${y - headSpread} L${x2},${y} L${x2 - headLen},${y + headSpread}`}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const FLOW_ROWS: { icon: FlowIcon; label: string; bulge: number; cute?: boolean }[] = [
  { icon: 'smile', label: 'Clients', bulge: 15, cute: true },
  { icon: 'file-text', label: 'Devis', bulge: -15 },
  { icon: 'file', label: 'Factures', bulge: 15 },
  { icon: 'credit-card', label: 'Statuts de paiement', bulge: -15 },
];

const ARC_ROW_HEIGHT = 58;
const ARC_BADGE_SIZE = 30;

function CantiaLogoBadge({ size }: { size: number }) {
  return (
    <View style={[styles.visualLogoBadgeCantia, { width: size, height: size, borderRadius: size / 2.6 }]}>
      <Image source={require('../assets/logo-mark.png')} style={{ width: size * 0.6, height: size * 0.6 }} resizeMode="contain" />
    </View>
  );
}

function BexioLogoBadge({ size }: { size: number }) {
  return (
    <View style={[styles.visualLogoBadge, { width: size, height: size, borderRadius: size / 2.6 }]}>
      <Image source={require('../assets/integrations/bexio-logo.png')} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

function IntegrationsVisual() {
  return (
    <View style={styles.visualFrame}>
      <View style={styles.visualEndpoints}>
        <View style={styles.visualEndpoint}>
          <CantiaLogoBadge size={68} />
          <Text style={styles.visualEndpointLabel}>Cantia</Text>
        </View>
        <View style={styles.visualEndpoint}>
          <BexioLogoBadge size={68} />
          <Text style={styles.visualEndpointLabel}>Bexio</Text>
        </View>
      </View>

      <View style={styles.visualLinks}>
        {FLOW_ROWS.map((row) => (
          <View key={row.label} style={styles.visualLinkRow}>
            <Text style={styles.visualLinkLabel}>{row.label}</Text>
            <View style={[styles.visualArcWrap, { height: ARC_ROW_HEIGHT }]}>
              <CurvedArrow height={ARC_ROW_HEIGHT} bulge={row.bulge} />
              <View
                style={[
                  styles.visualArcBadge,
                  row.cute && styles.visualArcBadgeCute,
                  {
                    width: ARC_BADGE_SIZE,
                    height: ARC_BADGE_SIZE,
                    borderRadius: ARC_BADGE_SIZE / 2,
                    top: ARC_ROW_HEIGHT / 2 + row.bulge - ARC_BADGE_SIZE / 2,
                  },
                ]}
              >
                <Feather name={row.icon} size={14} color={row.cute ? colors.accent : '#fff'} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.visualCaption}>Synchronisé automatiquement, dans les deux sens</Text>
    </View>
  );
}

// The wider, elongated version of the same idea, dropped in right after the
// features grid via SolutionPage's afterFeatures slot — one long sweeping
// curve spanning the full section width instead of four cramped rows, with
// the four data-type chips floating right on the curve. Positions are
// computed from the same quadratic-bézier formula the curve itself is
// drawn with (y(t) = y + 2·t·(1−t)·bulge for a bézier whose endpoints
// share one y), so the chips always sit exactly on the line rather than
// being eyeballed into place.
const BAND_VB_WIDTH = 1000;
const BAND_HEIGHT = 176;
const BAND_X1 = 90;
const BAND_X2 = BAND_VB_WIDTH - 90;
const BAND_BULGE = -56;
const BAND_CENTER_Y = BAND_HEIGHT / 2 + 14;

function bandPointAt(t: number) {
  const x = BAND_X1 + t * (BAND_X2 - BAND_X1);
  const y = BAND_CENTER_Y + 2 * t * (1 - t) * BAND_BULGE;
  return { leftPct: (x / BAND_VB_WIDTH) * 100, top: y };
}

const BAND_CHIPS: { icon: FlowIcon; label: string; t: number; cute?: boolean }[] = [
  { icon: 'smile', label: 'Clients', t: 0.18, cute: true },
  { icon: 'file-text', label: 'Devis', t: 0.4 },
  { icon: 'file', label: 'Factures', t: 0.6 },
  { icon: 'credit-card', label: 'Paiements', t: 0.82 },
];

function IntegrationsFlowBand() {
  const headLen = 16;
  const headSpread = 10;
  return (
    <View style={styles.bandOuter}>
      <View style={styles.bandCard}>
        <View style={[styles.bandStage, { height: BAND_HEIGHT }]}>
          <Svg
            width="100%"
            height={BAND_HEIGHT}
            viewBox={`0 0 ${BAND_VB_WIDTH} ${BAND_HEIGHT}`}
            preserveAspectRatio="none"
            style={StyleSheet.absoluteFill}
          >
            <Path
              d={`M${BAND_X1},${BAND_CENTER_Y} Q${BAND_VB_WIDTH / 2},${BAND_CENTER_Y + BAND_BULGE} ${BAND_X2},${BAND_CENTER_Y}`}
              stroke={colors.primary}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M${BAND_X1 + headLen},${BAND_CENTER_Y - headSpread} L${BAND_X1},${BAND_CENTER_Y} L${BAND_X1 + headLen},${BAND_CENTER_Y + headSpread}`}
              stroke={colors.primary}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d={`M${BAND_X2 - headLen},${BAND_CENTER_Y - headSpread} L${BAND_X2},${BAND_CENTER_Y} L${BAND_X2 - headLen},${BAND_CENTER_Y + headSpread}`}
              stroke={colors.primary}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>

          <View style={[styles.bandLogoCol, styles.bandLogoColLeft]}>
            <CantiaLogoBadge size={72} />
            <Text style={styles.visualEndpointLabel}>Cantia</Text>
          </View>
          <View style={[styles.bandLogoCol, styles.bandLogoColRight]}>
            <BexioLogoBadge size={72} />
            <Text style={styles.visualEndpointLabel}>Bexio</Text>
          </View>

          {BAND_CHIPS.map((chip) => {
            const { leftPct, top } = bandPointAt(chip.t);
            return (
              <View key={chip.label} style={[styles.bandChip, { left: `${leftPct}%`, top }]}>
                <View style={[styles.bandChipIcon, chip.cute && styles.visualArcBadgeCute]}>
                  <Feather name={chip.icon} size={13} color={chip.cute ? colors.accent : '#fff'} />
                </View>
                <Text style={styles.bandChipLabel}>{chip.label}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.visualCaption}>Synchronisé automatiquement, dans les deux sens</Text>
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
      afterFeatures={<IntegrationsFlowBand />}
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  visualLogoBadge: {
    backgroundColor: '#0A3A47',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  visualLinkLabel: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  visualArcWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  visualArcBadge: {
    position: 'absolute',
    left: '50%',
    marginLeft: -(ARC_BADGE_SIZE / 2),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  visualArcBadgeCute: {
    backgroundColor: colors.accentSoft,
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
  bandOuter: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  bandCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  bandStage: {
    position: 'relative',
    width: '100%',
  },
  bandLogoCol: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bandLogoColLeft: {
    left: 0,
  },
  bandLogoColRight: {
    right: 0,
  },
  bandChip: {
    position: 'absolute',
    width: 76,
    marginLeft: -38,
    marginTop: -15,
    alignItems: 'center',
    gap: 4,
  },
  bandChipIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  bandChipLabel: {
    fontFamily: marketingFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
