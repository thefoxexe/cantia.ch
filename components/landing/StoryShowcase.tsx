import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, breakpoints, radius, spacing } from '../../lib/theme';
import { landingFonts } from '../../lib/landingTheme';
import type { useMarketingDict } from '../../lib/i18n';

type Dict = ReturnType<typeof useMarketingDict>;

// The six-case "Ça vous parle ?" carousel — a controlled sequence (10s
// autoplay, pauses on hover/focus/manual nav/hidden tab/reduced motion,
// direct #cas-* links, prev/next, counter) mirroring the reference
// package's vanilla-JS behavior (source/app.js's story-showcase IIFE), the
// one interaction in this rebuild explicitly called out as needing to
// match — reimplemented with React state/effects since RN Web has no
// IntersectionObserver-driven <details> equivalent to lean on.
export function StoryShowcase({ dict, hrefFor }: { dict: Dict['stories']; hrefFor: (slug: string) => string }) {
  const [current, setCurrent] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const { width } = useWindowDimensions();
  const isCompact = width < breakpoints.desktop;
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = dict.cases.length;

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    progress.stopAnimation();
  }, [progress]);

  const advance = useCallback((next: number, manual: boolean) => {
    setCurrent(((next % total) + total) % total);
    if (manual) setUserPaused(true);
  }, [total]);

  // Autoplay scheduling — reactive to every input that should pause it.
  useEffect(() => {
    clearTimer();
    const reduceMotion = Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const active = !userPaused && !hovering && !reduceMotion;
    if (!active) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 10000, useNativeDriver: false }).start();
    timerRef.current = setTimeout(() => advance(current + 1, false), 10000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, userPaused, hovering]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onVisibility = () => setUserPaused((p) => (document.hidden ? true : p));
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const active = dict.cases[current];

  return (
    <View
      style={styles.wrap}
      // @ts-expect-error RN Web accepts DOM mouse events on View
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setUserPaused(true)}
    >
      <View style={styles.tabs}>
        {dict.cases.map((c, i) => (
          <Pressable key={c.id} onPress={() => advance(i, true)} style={[styles.tab, i === current && styles.tabActive]}>
            <Text style={[styles.tabText, i === current && styles.tabTextActive]}>{c.tab}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.stage, isCompact && styles.stageCompact]}>
        <View style={[styles.problem, !isCompact && { flex: 0.85 }]}>
          <Text style={styles.context}>{active.context}</Text>
          <Text style={styles.question}>{active.question}</Text>
        </View>
        <View style={[styles.response, !isCompact && { flex: 1.2 }]}>
          <View style={styles.responseSignature}>
            <View style={styles.signatureDot} />
            <Text style={styles.signatureText}>{dict.respondLabel}</Text>
          </View>
          <Text style={styles.responseTitle}>{active.responseTitle}</Text>
          <Text style={styles.responseText}>{active.responseText}</Text>
          <View style={styles.stepsRow}>
            {active.steps.map((s, i) => (
              <View key={s} style={styles.stepChip}>
                <Text style={styles.stepChipNum}>{i + 1}</Text>
                <Text style={styles.stepChipText}>{s}</Text>
              </View>
            ))}
          </View>
          <Link href={hrefFor(active.linkSlug) as any}>
            <Text style={styles.storyLink}>{active.linkLabel} ↗</Text>
          </Link>
        </View>
        <View style={[styles.concrete, !isCompact && { flex: 0.85 }]}>
          <Text style={styles.concreteLabel}>{active.concreteLabel}</Text>
          <Text style={styles.concreteText}>{active.concreteText}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.controls}>
          <Pressable onPress={() => advance(current - 1, true)} hitSlop={8} style={styles.controlBtn} accessibilityLabel={dict.prevLabel}>
            <Feather name="chevron-left" size={16} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => setUserPaused((p) => !p)} hitSlop={8} style={styles.controlBtn} accessibilityLabel={userPaused ? dict.playLabel : dict.pauseLabel}>
            <Feather name={userPaused ? 'play' : 'pause'} size={14} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => advance(current + 1, true)} hitSlop={8} style={styles.controlBtn} accessibilityLabel={dict.nextLabel}>
            <Feather name="chevron-right" size={16} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.counter}>{String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.xl, marginTop: spacing.xl },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  tab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.bg },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: landingFonts.body, fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: '#fff' },
  stage: { flexDirection: 'row', gap: spacing.xl },
  stageCompact: { flexDirection: 'column' },
  problem: { gap: spacing.sm },
  context: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.primary, textTransform: 'uppercase' },
  question: { fontFamily: landingFonts.body, fontSize: 24, fontWeight: '600', color: colors.text, letterSpacing: -0.5, lineHeight: 30 },
  response: { gap: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.lg },
  responseSignature: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  signatureDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  signatureText: { fontFamily: landingFonts.body, fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  responseTitle: { fontFamily: landingFonts.body, fontSize: 19, fontWeight: '600', color: colors.text, letterSpacing: -0.4, lineHeight: 24 },
  responseText: { fontFamily: landingFonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 10 },
  stepChipNum: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', color: colors.primary },
  stepChipText: { fontFamily: landingFonts.body, fontSize: 11, color: colors.text },
  storyLink: { fontFamily: landingFonts.body, fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: spacing.xs },
  concrete: { gap: spacing.xs, borderLeftWidth: 2, borderLeftColor: colors.primary, paddingLeft: spacing.lg, justifyContent: 'center' },
  concreteLabel: { fontFamily: landingFonts.body, fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  concreteText: { fontFamily: landingFonts.body, fontSize: 15, color: colors.text, fontStyle: 'italic', lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  controls: { flexDirection: 'row', gap: 4 },
  controlBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  counter: { fontFamily: landingFonts.body, fontSize: 11, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  progressTrack: { flex: 1, height: 2, backgroundColor: colors.border, borderRadius: 1, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
});
