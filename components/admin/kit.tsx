import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { adminDisplay } from '../../lib/adminTheme';

// The Super Admin's own building blocks: every page of app/(admin) is an
// AdminPage (same header, same width, same rhythm), its blocks AdminSection
// and AdminCard, its figures Kpi, its states Badge. One place to restyle the
// whole panel.

type IconName = keyof typeof Feather.glyphMap;

// The side menu's dark ink, shared with the phone's top bar.
export const ink = {
  bg: '#1F221C',
  raised: '#2A2E26',
  line: 'rgba(255,255,255,0.08)',
  text: '#ECE9E1',
  muted: 'rgba(236,233,225,0.56)',
  faint: 'rgba(236,233,225,0.34)',
  accent: '#D9925F',
};

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export const TONES: Record<Tone, { fg: string; bg: string }> = {
  neutral: { fg: colors.textMuted, bg: colors.surfaceAlt },
  primary: { fg: colors.primary, bg: colors.primarySoft },
  success: { fg: colors.success, bg: colors.successSoft },
  warning: { fg: colors.warning, bg: colors.warningSoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  info: { fg: colors.slate, bg: colors.slateSoft },
};

export function AdminPage({
  eyebrow,
  title,
  subtitle,
  actions,
  back,
  children,
  maxWidth = 1180,
  scroll = true,
}: {
  // The group of the side menu the page belongs to, or the parent page.
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
  children: ReactNode;
  maxWidth?: number;
  // false for a page that scrolls its own content (a long list).
  scroll?: boolean;
}) {
  const router = useRouter();
  const phone = useWindowDimensions().width < 600;
  const body = (
    <View style={[styles.page, { maxWidth }, phone && styles.pagePhone]}>
      <View style={styles.head}>
        <View style={styles.headText}>
          {back ? (
            <Pressable style={styles.back} onPress={() => router.replace(back.href as any)} accessibilityRole="link">
              <Feather name="arrow-left" size={13} color={colors.textMuted} />
              <Text style={styles.backText}>{back.label}</Text>
            </Pressable>
          ) : eyebrow ? (
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          ) : null}
          <Text style={[styles.title, phone && styles.titlePhone]} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      {children}
    </View>
  );
  // style={{ flex: 1 }}: inside the layout's flex:1/minHeight:0 column a
  // bare ScrollView gets no bounded height on web and never scrolls.
  return scroll ? (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
      {body}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, styles.scroll]}>{body}</View>
  );
}

export function AdminSection({
  title,
  subtitle,
  right,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 200, minWidth: 0 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function AdminCard({
  children,
  style,
  onPress,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ hovered, pressed }: any) => [styles.card, padded && styles.cardPadded, (hovered || pressed) && styles.cardHover, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, padded && styles.cardPadded, style]}>{children}</View>;
}

// A row of figures: wraps two per line on a phone, up to five on a computer.
export function KpiRow({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.kpiRow, style]}>{children}</View>;
}

export function Kpi({
  label,
  value,
  sub,
  tone,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  icon?: IconName;
  onPress?: () => void;
}) {
  const t = tone ? TONES[tone] : null;
  const content = (
    <>
      <View style={styles.kpiTop}>
        <Text style={styles.kpiLabel} numberOfLines={1}>
          {label}
        </Text>
        {icon ? <Feather name={icon} size={14} color={t?.fg ?? colors.textMuted} /> : null}
      </View>
      <Text style={[styles.kpiValue, t && tone !== 'neutral' ? { color: t.fg } : null]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {sub ? (
        <Text style={styles.kpiSub} numberOfLines={2}>
          {sub}
        </Text>
      ) : null}
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={({ hovered }: any) => [styles.kpi, hovered && styles.cardHover]}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.kpi}>{content}</View>
  );
}

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon ? <Feather name={icon} size={11} color={t.fg} /> : null}
      <Text style={[styles.badgeText, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function AdminTabs<K extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: K; label: string; count?: number | null }[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ hovered }: any) => [styles.tab, active && styles.tabActive, hovered && !active && styles.tabHover]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            {tab.count != null ? (
              <View style={[styles.tabCount, active && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>{tab.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function AdminEmpty({ icon = 'inbox', title, text }: { icon?: IconName; title: string; text?: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Feather name={icon} size={18} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

// A label and its value, for the facts of a record (plan, dates, ids).
export function Fact({ label, value, mono, children }: { label: string; value?: string | null; mono?: boolean; children?: ReactNode }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      {children ?? (
        <Text style={[styles.factValue, mono && styles.mono]} numberOfLines={1} selectable>
          {value || '—'}
        </Text>
      )}
    </View>
  );
}

// A quiet button for page headers and cards.
export function AdminButton({
  label,
  icon,
  onPress,
  tone = 'default',
  disabled,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  tone?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const fg = tone === 'primary' ? '#fff' : tone === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ hovered }: any) => [
        styles.button,
        tone === 'primary' && styles.buttonPrimary,
        hovered && (tone === 'primary' ? styles.buttonPrimaryHover : styles.buttonHover),
        disabled && { opacity: 0.5 },
      ]}
    >
      {icon ? <Feather name={icon} size={14} color={fg} /> : null}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function formatChf(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(amount);
}

export const adminStyles = StyleSheet.create({
  mono: { fontFamily: 'monospace', fontSize: 12 },
  muted: { fontSize: fontSize.xs, color: colors.textMuted },
  // A list of rows inside one card, separated by hairlines.
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
});

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  page: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  pagePhone: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  titlePhone: { fontSize: 26, lineHeight: 31 },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headText: { flexGrow: 1, flexShrink: 1, flexBasis: 280, minWidth: 0, gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase', color: colors.primary },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 2 },
  backText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  title: { ...adminDisplay, fontSize: 30, lineHeight: 36, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted, maxWidth: 640 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.md },
  sectionHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  sectionTitle: { ...adminDisplay, letterSpacing: -0.2, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  sectionSubtitle: { fontSize: fontSize.xs, lineHeight: 17, color: colors.textMuted, marginTop: 2, maxWidth: 620 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl },
  cardPadded: { padding: spacing.lg },
  cardHover: { borderColor: '#CFC9BD', backgroundColor: '#FFFFFD' },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: 6,
  },
  kpiTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  kpiLabel: { flexShrink: 1, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted },
  kpiValue: { ...adminDisplay, fontSize: 26, lineHeight: 30, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  kpiSub: { fontSize: fontSize.xs, lineHeight: 16, color: colors.textMuted },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  tabsScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabs: { flexDirection: 'row', gap: spacing.lg },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.sm + 2, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.primary },
  tabHover: { borderBottomColor: colors.border },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text, fontWeight: '700' },
  tabCount: { minWidth: 20, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center' },
  tabCountActive: { backgroundColor: colors.primarySoft },
  tabCountText: { fontSize: 11, fontWeight: '700', color: colors.textMuted, fontVariant: ['tabular-nums'] },
  tabCountTextActive: { color: colors.primary },
  empty: { alignItems: 'center', gap: 6, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  emptyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: fontSize.xs, lineHeight: 17, color: colors.textMuted, textAlign: 'center', maxWidth: 380 },
  fact: { flexGrow: 1, flexBasis: 150, minWidth: 0, gap: 3 },
  factLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted },
  factValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonHover: { borderColor: '#CFC9BD', backgroundColor: '#FFFFFD' },
  buttonPrimary: { backgroundColor: colors.text, borderColor: colors.text },
  buttonPrimaryHover: { backgroundColor: '#3A3F35', borderColor: '#3A3F35' },
  buttonText: { fontSize: fontSize.sm, fontWeight: '600' },
});
