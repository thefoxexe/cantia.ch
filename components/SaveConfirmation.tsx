import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius } from '../lib/theme';

// Single global trigger — one overlay mounted once at the root (app/_layout.tsx)
// so any settings screen can call showSavedCheckmark() after a successful
// save without wiring its own toast/modal state.
let trigger: (() => void) | null = null;

export function showSavedCheckmark() {
  trigger?.();
}

export function SaveConfirmationOverlay() {
  const [visible, setVisible] = useState(false);
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    trigger = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
      scale.setValue(0.5);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 140 }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setVisible(false));
      }, 1100);
    };
    return () => {
      trigger = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [scale, opacity]);

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
      <Animated.View style={[styles.badge, { opacity, transform: [{ scale }] }]}>
        <Feather name="check" size={30} color="#fff" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
