import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Container } from '../ui';
import { colors, radius, spacing } from '../../lib/theme';
import { displayType, marketingFonts } from '../../lib/marketingTheme';

type IconName = keyof typeof Feather.glyphMap;

export interface ProblemBandItem {
  icon: IconName;
  problem: string;
  consequence: string;
}

// Full-bleed dark loss-aversion band, dropped into a SolutionPage via its
// `afterFeatures` slot. Same visual language as the /logiciel-chantier
// redesign (concrete problem/consequence pairs + a floating relief card)
// but in marketingFonts to match the rest of the solution page around it,
// not landingFonts (that pairing is deliberately scoped to the homepage).
export function ProblemBand({
  eyebrow,
  headline,
  problems,
  reliefLabel,
  reliefItems,
}: {
  eyebrow: string;
  headline: string;
  problems: ProblemBandItem[];
  reliefLabel: string;
  reliefItems: string[];
}) {
  return (
    <View style={styles.band}>
      <Container style={styles.inner}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.headline}>{headline}</Text>
        <View style={styles.grid}>
          {problems.map((p) => (
            <View key={p.problem} style={styles.card}>
              <View style={styles.icon}>
                <Feather name={p.icon} size={17} color="#F3A98C" />
              </View>
              <Text style={styles.problem}>{p.problem}</Text>
              <Text style={styles.consequence}>{p.consequence}</Text>
            </View>
          ))}
        </View>
        <View style={styles.relief}>
          <Text style={styles.reliefLabel}>{reliefLabel}</Text>
          <View style={styles.reliefGrid}>
            {reliefItems.map((r) => (
              <View key={r} style={styles.reliefRow}>
                <View style={styles.reliefIcon}>
                  <Feather name="check" size={13} color={colors.success} />
                </View>
                <Text style={styles.reliefText}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { backgroundColor: colors.primaryDark, paddingVertical: spacing.xxxl },
  inner: { maxWidth: 1040, width: '100%', alignSelf: 'center', paddingHorizontal: spacing.xl },
  eyebrow: {
    fontFamily: marketingFonts.mono,
    fontSize: 11,
    letterSpacing: 0.4,
    color: '#E8B79A',
    textTransform: 'uppercase',
  },
  headline: {
    ...displayType,
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 44,
    color: '#fff',
    marginTop: 10,
    marginBottom: spacing.xl,
    maxWidth: 620,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xl, rowGap: spacing.sm },
  card: {
    flex: 1,
    minWidth: 240,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.28)',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  } as unknown as ViewStyle,
  icon: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  problem: { fontFamily: marketingFonts.body, fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 24 },
  consequence: { fontFamily: marketingFonts.body, fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 23 },
  relief: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 3,
    padding: spacing.xl,
  } as unknown as ViewStyle,
  reliefLabel: {
    fontFamily: marketingFonts.mono,
    fontSize: 11,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  reliefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  reliefRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, minWidth: 260, flex: 1 },
  reliefIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  reliefText: { fontFamily: marketingFonts.body, fontSize: 14, color: colors.text, lineHeight: 20, flex: 1, fontWeight: '500' },
});
