import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, radius, spacing } from '../../lib/theme';
import type { ReliefCopy } from '../../lib/relief/copy';

// The screens of Cantia Maquette around the 3D world (app/(app)/maquette.tsx):
// the offer when the option isn't active, and the note for members who are
// not admins. The onboarding and the wait while the AI builds the world are
// in components/relief/ReliefOnboardingDom.tsx.

const INK = '#16120E';

function Shell({ children, onClose, copy }: { children: React.ReactNode; onClose: () => void; copy: ReliefCopy }) {
  return (
    <View style={styles.shell}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <View style={styles.brandMark} />
          <Text style={styles.brandText}>{copy.brand}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={copy.close}>
          <Feather name="x" size={18} color={colors.text} />
          <Text style={styles.closeText}>{copy.close}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </View>
  );
}

function Button({ label, onPress, primary = false, disabled = false, icon }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean; icon?: keyof typeof Feather.glyphMap }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.btn, primary && styles.btnPrimary, disabled && { opacity: 0.5 }]} accessibilityRole="button">
      {icon ? <Feather name={icon} size={16} color={primary ? '#FFFFFF' : colors.text} /> : null}
      <Text style={[styles.btnText, primary && { color: '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

// ------------------------------------------------------------ offer

export function ReliefLocked({ copy, canActivate, activating, onActivate, onClose }: { copy: ReliefCopy; canActivate: boolean; activating: boolean; onActivate: () => void; onClose: () => void }) {
  return (
    <Shell copy={copy} onClose={onClose}>
      <MiniIsland />
      <Text style={styles.title}>{copy.lockedTitle}</Text>
      <Text style={styles.lead}>{copy.lockedText}</Text>
      <View style={styles.points}>
        {copy.lockedPoints.map((p) => (
          <View key={p} style={styles.point}>
            <Feather name="check" size={16} color={colors.primary} style={{ marginTop: 2 }} />
            <Text style={styles.pointText}>{p}</Text>
          </View>
        ))}
      </View>
      {canActivate ? (
        <View style={{ alignSelf: 'flex-start' }}>
          <Button label={activating ? copy.activating : copy.activate} onPress={onActivate} primary disabled={activating} />
        </View>
      ) : (
        <Text style={styles.note}>
          {copy.lockedOption} <Text style={styles.noteStrong}>{copy.lockedContact}</Text>
        </Text>
      )}
    </Shell>
  );
}

export function ReliefNotAdmin({ copy, onClose }: { copy: ReliefCopy; onClose: () => void }) {
  return (
    <Shell copy={copy} onClose={onClose}>
      <MiniIsland />
      <Text style={styles.title}>{copy.introTitle}</Text>
      <Text style={styles.lead}>{copy.notAdmin}</Text>
    </Shell>
  );
}

// ------------------------------------------------------------ small drawings

// A little isometric island drawn with views: a slab, layers of soil and
// three blocks; while building, the blocks rise and fall.
function MiniIsland({ building = false }: { building?: boolean }) {
  const anim = useRef([0, 1, 2].map(() => new Animated.Value(1))).current;
  useEffect(() => {
    if (!building) return;
    const loops = anim.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 350),
          Animated.timing(v, { toValue: 0.35, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [building, anim]);
  const heights = [46, 70, 34];
  return (
    <View style={styles.island} aria-hidden>
      <View style={styles.islandBlocks}>
        {heights.map((h, i) => (
          <Animated.View key={i} style={[styles.block, { height: h, transform: [{ scaleY: anim[i] }], backgroundColor: i === 1 ? colors.primary : '#F3EEE6' }]} />
        ))}
      </View>
      <View style={styles.islandTop} />
      <View style={styles.islandSoil} />
      <View style={styles.islandSoilDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#EFE8DC' },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 12, height: 12, backgroundColor: colors.primary, transform: [{ rotate: '45deg' }] },
  brandText: { fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.text },
  closeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  closeText: { fontSize: 13, fontWeight: '700', color: colors.text },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: 64 },
  inner: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 20, paddingTop: 24 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', color: colors.primary },
  title: { ...displayType, fontSize: 40, lineHeight: 44, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  lead: { fontSize: 17, lineHeight: 27, color: '#4A3F35', maxWidth: 640 },
  note: { fontSize: 14, lineHeight: 21, color: colors.textMuted },
  noteStrong: { fontWeight: '700', color: colors.text },
  points: { gap: 10 },
  point: { flexDirection: 'row', gap: 10 },
  pointText: { flex: 1, fontSize: 15, lineHeight: 22, color: colors.text },
  models: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  model: { flexGrow: 1, flexBasis: 200, gap: 8, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  modelTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  modelText: { fontSize: 13.5, lineHeight: 20, color: '#4A3F35' },
  glyph: { height: 44, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  glyphFloor: { width: 16, height: 6, backgroundColor: '#D9D1C3', borderRadius: 1 },
  glyphBay: { width: 32, height: 18, borderWidth: 2, borderColor: '#D9D1C3', borderRadius: 2, margin: 1 },
  glyphHouse: { width: 14, backgroundColor: '#D9D1C3', borderRadius: 2 },
  glyphRoad: { width: 12, height: 3, backgroundColor: '#B9AE9D', marginBottom: 2 },
  questions: { gap: 8 },
  question: { flexDirection: 'row', gap: 10, alignItems: 'baseline' },
  questionNum: { ...monoType, fontSize: 12, color: colors.primary, width: 14 },
  questionText: { flex: 1, fontSize: 15, lineHeight: 22, color: colors.text },
  editor: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, overflow: 'hidden' },
  input: { minHeight: 200, padding: 16, fontSize: 15, lineHeight: 23, color: colors.text, textAlignVertical: 'top', ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}) },
  editorBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#FBF8F2' },
  mic: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  micOn: { backgroundColor: '#AB3327', borderColor: '#AB3327' },
  micText: { fontSize: 13, fontWeight: '700', color: colors.text },
  count: { ...monoType, fontSize: 11, color: colors.textMuted },
  error: { fontSize: 14, color: colors.danger },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 20, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnText: { fontSize: 15, fontWeight: '700', color: colors.text },
  mailNote: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  mailText: { flex: 1, fontSize: 14, lineHeight: 21, color: colors.text },
  island: { alignSelf: 'flex-start', width: 200, marginBottom: 4 },
  islandBlocks: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, paddingHorizontal: 34, height: 74 },
  block: { width: 30, borderRadius: 2, borderWidth: 1, borderColor: 'rgba(35,26,18,0.15)', transformOrigin: 'bottom' },
  islandTop: { height: 14, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#B9C29A' },
  islandSoil: { height: 10, backgroundColor: '#8E6E50' },
  islandSoilDark: { height: 10, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: INK },
});
