import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation, AVAILABLE_LOCALES, type AppLocale } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

// A separate spacer (rather than folding insets.top into the `padding`
// merged from the `style` prop) sidesteps padding/paddingTop shorthand
// precedence, which resolves inconsistently between native (Yoga) and web
// (CSS) when both are present in a merged style array. On phones with a
// notch/status bar, content was rendering flush under it (reported on a
// Samsung S26); on web, insets.top is 0 so this is a no-op there.
export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, style]}>
      <View style={{ height: insets.top + spacing.sm }} />
      {children}
    </View>
  );
}

export function Container({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Reusable back-button + title row, matching what most nested screens need.
// Tab switches on web can replace history in a way that leaves nothing to
// pop back to, so router.back() isn't reliable — pass backTo to always land
// on a known parent screen instead of guessing from history.
export function PageHeader({
  title,
  backTo,
  right,
  style,
  onBeforeBack,
}: {
  title: string;
  backTo?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // Called before actually navigating back — return (or resolve) false to
  // cancel the navigation. Used by settings screens to confirm unsaved
  // changes instead of silently discarding them; see useUnsavedChanges's
  // confirmBeforeBack.
  onBeforeBack?: () => boolean | Promise<boolean>;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  async function handleBack() {
    if (onBeforeBack) {
      const canLeave = await onBeforeBack();
      if (!canLeave) return;
    }
    backTo ? router.replace(backTo as any) : router.back();
  }
  return (
    <View style={[styles.pageHeader, style]}>
      <Pressable
        onPress={handleBack}
        hitSlop={8}
        style={styles.pageHeaderBack}
        accessibilityLabel={t('ui.back')}
      >
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>
      <Text style={styles.pageHeaderTitle} numberOfLines={1}>
        {title}
      </Text>
      {right ? <View style={styles.pageHeaderRight}>{right}</View> : null}
    </View>
  );
}

// Small top-left arrow on login/signup back to the marketing site — those
// screens can be reached directly (a bookmark, a shared link) with no
// in-app history to go "back" to, so this is a real navigation (possibly
// cross-origin, app.cantia.ch -> cantia.ch) via <Link>, not router.back().
// Native has no marketing site to return to, so it renders nothing there.
export function BackToSiteButton({ href, style }: { href: string; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return null;
  return (
    <Link href={href as any} asChild>
      <Pressable
        hitSlop={8}
        style={[styles.pageHeaderBack, styles.backToSiteButton, { top: insets.top + spacing.md }, style]}
        accessibilityLabel={t('ui.back')}
      >
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>
    </Link>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  const textColor = variant === 'secondary' ? colors.text : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && (variant === 'secondary' ? styles.buttonPressedSecondary : styles.buttonPressed),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : '#fff'} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={17} color={textColor} style={{ marginRight: spacing.sm }} /> : null}
          <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  style,
  onFocus,
  onBlur,
  ...props
}: { label: string } & TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, focused && styles.inputFocused, props.editable === false && styles.inputDisabled, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const SWITCH_WIDTH = 44;
const SWITCH_HEIGHT = 26;
const SWITCH_KNOB = 20;
const SWITCH_PAD = 3;

// A small animated pill toggle — RN's built-in Switch renders as the raw
// platform control (grey on web, wildly inconsistent across iOS/Android),
// which reads as an afterthought next to the rest of the design system.
export function Switch({ value, onChange, disabled }: { value: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] });
  const knobTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [0, SWITCH_WIDTH - SWITCH_KNOB - SWITCH_PAD * 2] });

  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={6}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={[switchStyles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[switchStyles.knob, { transform: [{ translateX: knobTranslate }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const switchStyles = StyleSheet.create({
  track: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    padding: SWITCH_PAD,
    justifyContent: 'center',
  },
  knob: {
    width: SWITCH_KNOB,
    height: SWITCH_KNOB,
    borderRadius: SWITCH_KNOB / 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});

const LANG_TOGGLE_SEGMENT_WIDTH = 38;
const LANG_TOGGLE_HEIGHT = 36;
const LANG_TOGGLE_PAD = 3;

const LANG_TOGGLE_LABELS: Record<AppLocale, string> = { fr: 'FR', de: 'DE', it: 'IT' };
const LANG_TOGGLE_FULL_NAMES: Record<AppLocale, string> = { fr: 'Français', de: 'Deutsch', it: 'Italiano' };

// A small sliding language toggle — same animated-thumb pattern as Switch
// above, but with one labeled segment per available locale instead of a
// boolean knob. `value` is which segment currently reads as "selected"
// (e.g. the language the shown text is currently in); tapping another
// segment calls onChange with that locale and the thumb slides under it.
// Tapping the already-active segment is a no-op. Used both as a real
// toggle (site language switcher) and as a one-shot action trigger
// (translate this text into the tapped language) — either way the slide
// affordance is the same "pick a side" gesture. Defaults to every locale
// the app ships (AVAILABLE_LOCALES) so adding a language never requires
// touching call sites — only pass `locales` to show a narrower subset.
export function LangToggle({
  value,
  onChange,
  locales = AVAILABLE_LOCALES,
  disabled,
  loading,
}: {
  value: AppLocale;
  onChange: (next: AppLocale) => void;
  locales?: AppLocale[];
  disabled?: boolean;
  loading?: boolean;
}) {
  const activeIndex = Math.max(0, locales.indexOf(value));
  const anim = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, locales.indexOf(value)),
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, anim, locales]);

  const thumbTranslate = anim.interpolate({
    inputRange: locales.map((_, i) => i),
    outputRange: locales.map((_, i) => i * LANG_TOGGLE_SEGMENT_WIDTH),
  });
  const isBusy = !!disabled || !!loading;
  const trackWidth = LANG_TOGGLE_PAD * 2 + LANG_TOGGLE_SEGMENT_WIDTH * locales.length;

  return (
    <View style={[langToggleStyles.track, { width: trackWidth }, isBusy && langToggleStyles.trackBusy]}>
      <Animated.View
        pointerEvents="none"
        style={[langToggleStyles.thumb, { width: LANG_TOGGLE_SEGMENT_WIDTH - LANG_TOGGLE_PAD, transform: [{ translateX: thumbTranslate }] }]}
      />
      {locales.map((loc) => (
        <Pressable
          key={loc}
          style={[langToggleStyles.half, { width: LANG_TOGGLE_SEGMENT_WIDTH }]}
          onPress={() => !isBusy && value !== loc && onChange(loc)}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={LANG_TOGGLE_FULL_NAMES[loc]}
        >
          <Text style={[langToggleStyles.text, value === loc && langToggleStyles.textActive]}>{LANG_TOGGLE_LABELS[loc]}</Text>
        </Pressable>
      ))}
      {loading ? (
        <View style={langToggleStyles.spinnerOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

const langToggleStyles = StyleSheet.create({
  track: {
    height: LANG_TOGGLE_HEIGHT,
    borderRadius: LANG_TOGGLE_HEIGHT / 2,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    padding: LANG_TOGGLE_PAD,
  },
  trackBusy: {
    opacity: 0.7,
  },
  thumb: {
    position: 'absolute',
    top: LANG_TOGGLE_PAD,
    left: LANG_TOGGLE_PAD,
    height: LANG_TOGGLE_HEIGHT - LANG_TOGGLE_PAD * 2,
    borderRadius: (LANG_TOGGLE_HEIGHT - LANG_TOGGLE_PAD * 2) / 2,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  half: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  textActive: {
    color: colors.primary,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: LANG_TOGGLE_HEIGHT / 2,
  },
});

export function LoadingScreen({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{label ?? t('ui.loading')}</Text>
    </View>
  );
}

// Colors only — the label itself comes from common.status.<key> in
// lib/translations, kept in one place so it doesn't drift between here and
// any screen that used to hardcode its own copy of this same map.
const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  draft: { bg: colors.warningSoft, fg: colors.warning },
  ready: { bg: colors.accentSoft, fg: colors.accent },
  sent: { bg: colors.primarySoft, fg: colors.primary },
  partial: { bg: colors.accentSoft, fg: colors.accent },
  accepted: { bg: colors.successSoft, fg: colors.success },
  refused: { bg: colors.dangerSoft, fg: colors.danger },
  generated: { bg: colors.successSoft, fg: colors.success },
  active: { bg: colors.primarySoft, fg: colors.primary },
  completed: { bg: colors.successSoft, fg: colors.success },
  archived: { bg: colors.border, fg: colors.textMuted },
  paid: { bg: colors.successSoft, fg: colors.success },
  cancelled: { bg: colors.border, fg: colors.textMuted },
  planifie: { bg: colors.accentSoft, fg: colors.accent },
  en_cours: { bg: colors.primarySoft, fg: colors.primary },
  termine: { bg: colors.successSoft, fg: colors.success },
  annule: { bg: colors.border, fg: colors.textMuted },
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const s = STATUS_STYLES[status] ?? { bg: colors.border, fg: colors.textMuted };
  const label = STATUS_STYLES[status] ? t(`common.status.${status}`) : status;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pageHeaderBack: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backToSiteButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
  },
  pageHeaderTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  pageHeaderRight: {
    flexShrink: 0,
  },
  button: {
    flexDirection: 'row',
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  container: {
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  buttonPressedSecondary: {
    backgroundColor: colors.surfaceAlt,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  field: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
