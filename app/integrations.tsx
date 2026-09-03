import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { SolutionPage } from '../components/SolutionPage';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';
import { getAppLocale, useTranslation } from '../lib/translations';

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

// A single dashed, curved, two-way arrow. viewBoxWidth is a nominal
// coordinate-space width (not pixels) — the Svg stretches to fill its
// actual container via width="100%" + preserveAspectRatio="none", so the
// same curve reads correctly at any real rendered width.
function CurvedArrow({
  height,
  bulge,
  color = colors.border,
  viewBoxWidth = 320,
}: {
  height: number;
  bulge: number;
  color?: string;
  viewBoxWidth?: number;
}) {
  const y = height / 2;
  const x1 = 6;
  const x2 = viewBoxWidth - 6;
  const cx = viewBoxWidth / 2;
  const cy = y + bulge;
  const s = 5;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${viewBoxWidth} ${height}`} preserveAspectRatio="none">
      <Path d={`M${x1},${y} Q${cx},${cy} ${x2},${y}`} stroke={color} strokeWidth={2} fill="none" strokeDasharray="1,6" strokeLinecap="round" />
      <Path d={`M${x1 + s + 3},${y - s} L${x1},${y} L${x1 + s + 3},${y + s} Z`} fill={color} />
      <Path d={`M${x2 - s - 3},${y - s} L${x2},${y} L${x2 - s - 3},${y + s} Z`} fill={color} />
    </Svg>
  );
}

const ARC_ROW_HEIGHT = 44;
const ARC_BADGE_SIZE = 26;

function CantiaLogoBadge({ size }: { size: number }) {
  return (
    <View style={[styles.visualLogoBadgeCantia, { width: size, height: size, borderRadius: size / 2.6 }]}>
      <Image source={require('../assets/logo-mark.png')} style={{ width: size * 0.6, height: size * 0.6 }} resizeMode="contain" accessibilityLabel="Cantia" />
    </View>
  );
}

function BexioLogoBadge({ size }: { size: number }) {
  return (
    <View style={[styles.visualLogoBadge, { width: size, height: size, borderRadius: size / 2.6 }]}>
      <Image source={require('../assets/integrations/bexio-logo.png')} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel="Bexio" />
    </View>
  );
}

function IntegrationsVisual() {
  const { t } = useTranslation();
  const FLOW_ROWS: { icon: FlowIcon; label: string; bulge: number; cute?: boolean }[] = [
    { icon: 'smile', label: t('integrationsPage.flowClientsLabel'), bulge: 8, cute: true },
    { icon: 'file-text', label: t('integrationsPage.flowDevisLabel'), bulge: -8 },
    { icon: 'file', label: t('integrationsPage.flowFacturesLabel'), bulge: 8 },
    { icon: 'credit-card', label: t('integrationsPage.flowPaymentsLabel'), bulge: -8 },
  ];
  return (
    <View style={styles.visualFrame}>
      <View style={styles.visualEndpoints}>
        <View style={styles.visualEndpoint}>
          <CantiaLogoBadge size={68} />
          <Text style={styles.visualEndpointLabel}>{t('integrationsPage.cantiaLabel')}</Text>
        </View>
        <View style={styles.visualEndpoint}>
          <BexioLogoBadge size={68} />
          <Text style={styles.visualEndpointLabel}>{t('integrationsPage.bexioLabel')}</Text>
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
                <Feather name={row.icon} size={13} color={row.cute ? colors.accent : '#fff'} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.visualCaption}>{t('integrationsPage.visualCaption')}</Text>
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

function IntegrationsFlowBand() {
  const { t: tr } = useTranslation();
  const BAND_CHIPS: { icon: FlowIcon; label: string; t: number; cute?: boolean }[] = [
    { icon: 'smile', label: tr('integrationsPage.flowClientsLabel'), t: 0.18, cute: true },
    { icon: 'file-text', label: tr('integrationsPage.flowDevisLabel'), t: 0.4 },
    { icon: 'file', label: tr('integrationsPage.flowFacturesLabel'), t: 0.6 },
    { icon: 'credit-card', label: tr('integrationsPage.bandPaymentsLabel'), t: 0.82 },
  ];
  const s = 6;
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
              stroke={colors.border}
              strokeWidth={2.5}
              fill="none"
              strokeDasharray="1,8"
              strokeLinecap="round"
            />
            <Path d={`M${BAND_X1 + s + 4},${BAND_CENTER_Y - s} L${BAND_X1},${BAND_CENTER_Y} L${BAND_X1 + s + 4},${BAND_CENTER_Y + s} Z`} fill={colors.border} />
            <Path d={`M${BAND_X2 - s - 4},${BAND_CENTER_Y - s} L${BAND_X2},${BAND_CENTER_Y} L${BAND_X2 - s - 4},${BAND_CENTER_Y + s} Z`} fill={colors.border} />
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
        <Text style={styles.visualCaption}>{tr('integrationsPage.visualCaption')}</Text>
      </View>
    </View>
  );
}

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const blogPrefix = locale === 'de' ? '/de/blog' : '/blog';
  const solutionsPrefix = locale === 'de' ? '/de/solutions' : '/solutions';
  return (
    <SolutionPage
      kicker={t('integrationsPage.kicker')}
      title={t('integrationsPage.title')}
      subtitle={t('integrationsPage.subtitle')}
      visual={<IntegrationsVisual />}
      afterFeatures={<IntegrationsFlowBand />}
      features={[
        { icon: 'users', title: t('integrationsPage.feature1Title'), text: t('integrationsPage.feature1Text') },
        { icon: 'package', title: t('integrationsPage.feature2Title'), text: t('integrationsPage.feature2Text') },
        { icon: 'send', title: t('integrationsPage.feature3Title'), text: t('integrationsPage.feature3Text') },
        { icon: 'refresh-cw', title: t('integrationsPage.feature4Title'), text: t('integrationsPage.feature4Text') },
        { icon: 'shield', title: t('integrationsPage.feature5Title'), text: t('integrationsPage.feature5Text') },
        { icon: 'plus-circle', title: t('integrationsPage.feature6Title'), text: t('integrationsPage.feature6Text') },
      ]}
      steps={[
        { title: t('integrationsPage.step1Title'), text: t('integrationsPage.step1Text') },
        { title: t('integrationsPage.step2Title'), text: t('integrationsPage.step2Text') },
        { title: t('integrationsPage.step3Title'), text: t('integrationsPage.step3Text') },
      ]}
      faq={[
        { question: t('integrationsPage.faq1Question'), answer: t('integrationsPage.faq1Answer') },
        { question: t('integrationsPage.faq2Question'), answer: t('integrationsPage.faq2Answer') },
        { question: t('integrationsPage.faq3Question'), answer: t('integrationsPage.faq3Answer') },
        { question: t('integrationsPage.faq4Question'), answer: t('integrationsPage.faq4Answer') },
      ]}
      related={[
        { href: `${blogPrefix}/integration-bexio-cantia-synchronisation-automatique`, label: t('integrationsPage.related1Label') },
        { href: `${blogPrefix}/bexio-vs-cantia-logiciel-batiment`, label: t('integrationsPage.related2Label') },
        { href: `${solutionsPrefix}/facturation`, label: t('integrationsPage.related3Label') },
      ]}
      closingTitle={t('integrationsPage.closingTitle')}
      closingText={t('integrationsPage.closingText')}
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
