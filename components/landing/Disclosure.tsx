import { useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../lib/theme';
import { landingFonts } from '../../lib/landingTheme';

export function Disclosure({
  title,
  subtitle,
  defaultOpen = false,
  children,
  variant = 'plain',
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  variant?: 'plain' | 'card';
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const anim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const rotate = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  function toggle() {
    const next = !open;
    setOpen(next);
    Animated.parallel([
      Animated.timing(anim, { toValue: next ? 1 : 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(rotate, { toValue: next ? 1 : 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }

  function onContentLayout(e: LayoutChangeEvent) {
    const h = e.nativeEvent.layout.height;
    if (contentHeight === null || Math.abs(h - contentHeight) > 0.5) setContentHeight(h);
  }

  const rotateDeg = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View style={variant === 'card' ? styles.cardWrap : styles.plainWrap}>
      <Pressable onPress={toggle} style={styles.summary} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Animated.Text style={[styles.expand, { transform: [{ rotate: rotateDeg }] }]}>+</Animated.Text>
      </Pressable>
      <Animated.View
        style={{
          height: contentHeight === null ? undefined : anim.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] }),
          opacity: anim,
          overflow: 'hidden',
        }}
      >
        <View onLayout={onContentLayout} style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  plainWrap: { borderBottomWidth: 1, borderBottomColor: colors.border },
  cardWrap: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  summary: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.xs },
  title: { fontFamily: landingFonts.body, fontSize: 15, fontWeight: '600', color: colors.text },
  subtitle: { fontFamily: landingFonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  expand: { fontFamily: landingFonts.body, fontSize: 22, fontWeight: '400', color: colors.primary, lineHeight: 24 },
  content: { paddingHorizontal: spacing.xs, paddingBottom: spacing.lg, gap: spacing.md },
});
