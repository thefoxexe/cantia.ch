import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Container } from '../ui';
import { colors, radius, spacing } from '../../lib/theme';
import { marketingFonts } from '../../lib/marketingTheme';

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
    fontFamily: marketingFonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#E8B79A',
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: marketingFonts.display,
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 36,
    color: '#fff',
    marginTop: 10,
    marginBottom: spacing.xl,
    maxWidth: 620,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  card: {
    flex: 1,
    minWidth: 240,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    gap: spacing.xs,
  } as unknown as ViewStyle,
  icon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  problem: { fontFamily: marketingFonts.body, fontSize: 15, fontWeight: '700', color: '#fff', lineHeight: 21 },
  consequence: { fontFamily: marketingFonts.body, fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 19 },
  relief: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  } as unknown as ViewStyle,
  reliefLabel: {
    fontFamily: marketingFonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
