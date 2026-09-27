import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { breakpoints, colors, spacing } from '../../lib/theme';
import { displayType, marketingFonts, monoType } from '../../lib/marketingTheme';
import { bodyInk, ink } from './brand';

// The grid every homepage section starts from: a full-width ink rule, the
// section label in mono on the left quarter, the heading and its intro on
// the remaining three quarters. Replaces the old centered eyebrow/title/
// paragraph stack.
export function SectionHead({ label, title, intro }: { label?: string; title: string; intro?: string }) {
  const { width } = useWindowDimensions();
  const compact = width < breakpoints.desktop;
  const size = Math.round(Math.min(64, Math.max(36, width * 0.045)));
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <View style={compact ? undefined : styles.labelCol}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
      <View style={compact ? undefined : styles.mainCol}>
        <Text role="heading" aria-level={2} style={[styles.title, { fontSize: size, lineHeight: Math.round(size * 0.98) }]}>{title}</Text>
        {intro ? <Text style={styles.intro}>{intro}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderTopWidth: 1.5, borderTopColor: ink, paddingTop: spacing.lg, marginBottom: spacing.xxl },
  rowCompact: { flexDirection: 'column', gap: spacing.md },
  labelCol: { width: '25%', paddingRight: spacing.xl, paddingTop: 10 },
  mainCol: { flex: 1 },
  label: { ...monoType, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  title: { ...displayType, fontWeight: '800', color: ink, letterSpacing: -0.3, maxWidth: 900 },
  intro: { fontFamily: marketingFonts.body, fontSize: 18, lineHeight: 28, color: bodyInk, marginTop: spacing.lg, maxWidth: 640 },
});
