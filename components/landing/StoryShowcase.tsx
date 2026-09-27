import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, breakpoints, spacing } from '../../lib/theme';
import { displayType, landingFonts, monoType } from '../../lib/landingTheme';
import { bodyInk, ink, rule } from './brand';
import type { useMarketingDict } from '../../lib/i18n';

type Dict = ReturnType<typeof useMarketingDict>;

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
      <Text style={styles.hint}>{dict.hint}</Text>
      <View style={styles.tabs}>
        {dict.cases.map((c, i) => (
          <Pressable
            key={c.id}
            onPress={() => advance(i, true)}
            style={({ hovered }: any) => [styles.tab, hovered && styles.tabHover, i === current && styles.tabActive]}
          >
            <Text style={[styles.tabNum, i === current && styles.tabTextActive]}>{String(i + 1).padStart(2, '0')}</Text>
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
                {i < active.steps.length - 1 ? <Text style={styles.stepArrow}>→</Text> : null}
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
          <Pressable onPress={() => advance(current - 1, true)} style={({ hovered }: any) => [styles.navBtn, hovered && styles.tabHover]} accessibilityLabel={dict.prevLabel}>
            <Feather name="arrow-left" size={16} color={colors.text} />
            {!isCompact ? <Text style={styles.navBtnText}>{dict.prevLabel}</Text> : null}
          </Pressable>
          <Pressable onPress={() => advance(current + 1, true)} style={({ hovered }: any) => [styles.navBtn, styles.navBtnPrimary, hovered && { opacity: 0.88 }]} accessibilityLabel={dict.nextLabel}>
            <Text style={[styles.navBtnText, { color: '#FBF6EE' }]}>{dict.nextLabel}</Text>
            <Feather name="arrow-right" size={16} color="#FBF6EE" />
          </Pressable>
          <Pressable onPress={() => setUserPaused((p) => !p)} hitSlop={8} style={styles.controlBtn} accessibilityLabel={userPaused ? dict.playLabel : dict.pauseLabel}>
            <Feather name={userPaused ? 'play' : 'pause'} size={14} color={colors.text} />
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
  wrap: {},
  hint: { ...monoType, fontSize: 11, color: colors.textMuted, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  tab: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: rule, borderRadius: 3, backgroundColor: colors.bg, cursor: 'pointer' } as any,
  tabHover: { borderColor: ink },
  tabActive: { backgroundColor: ink, borderColor: ink },
  tabNum: { ...monoType, fontSize: 10, color: colors.primary },
  tabText: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: ink },
  tabTextActive: { color: '#FBF6EE' },
  stage: { flexDirection: 'row', gap: spacing.xxl, minHeight: 250 },
  stageCompact: { flexDirection: 'column', gap: spacing.xl, minHeight: 0 },
  problem: { gap: spacing.md },
  context: { ...monoType, fontSize: 11, letterSpacing: 0.4, color: colors.primary, textTransform: 'uppercase' },
  question: { ...displayType, fontSize: 42, fontWeight: '800', color: ink, lineHeight: 42 },
  response: { gap: spacing.md, borderLeftWidth: 1, borderLeftColor: rule, paddingLeft: spacing.xl },
  responseSignature: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  signatureDot: { width: 6, height: 6, backgroundColor: colors.primary },
  signatureText: { ...monoType, fontSize: 10, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  responseTitle: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '700', color: ink, letterSpacing: -0.3, lineHeight: 28 },
  responseText: { fontFamily: landingFonts.body, fontSize: 16, color: bodyInk, lineHeight: 25 },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepChipNum: { ...monoType, fontSize: 10, color: colors.primary, borderWidth: 1, borderColor: colors.primary, borderRadius: 999, width: 18, height: 18, lineHeight: 16, textAlign: 'center' },
  stepChipText: { fontFamily: landingFonts.body, fontSize: 14, fontWeight: '600', color: ink },
  stepArrow: { color: colors.textMuted, fontSize: 13, marginLeft: 2 },
  storyLink: { fontFamily: landingFonts.body, fontSize: 14, fontWeight: '600', color: colors.primary, marginTop: spacing.xs },
  concrete: { gap: spacing.sm, justifyContent: 'center' },
  concreteLabel: { ...monoType, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  concreteText: { fontFamily: landingFonts.body, fontSize: 19, color: ink, fontStyle: 'italic', lineHeight: 28 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: rule, borderRadius: 3 },
  navBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  navBtnText: { fontFamily: landingFonts.body, fontSize: 14, fontWeight: '600', color: ink },
  controlBtn: { width: 40, height: 40, borderRadius: 3, borderWidth: 1, borderColor: rule, alignItems: 'center', justifyContent: 'center' },
  counter: { ...monoType, fontSize: 11, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  progressTrack: { flex: 1, height: 1.5, backgroundColor: rule, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
});
