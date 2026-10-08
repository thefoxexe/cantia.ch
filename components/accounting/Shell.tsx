import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AccLocaleSwitch, useIsWide } from './AccountingChrome';
import { useAccCopy } from '../../lib/accounting/locale';
import { useWorkCopy } from '../../lib/accounting/workCopy';
import { useProCopy } from '../../lib/accounting/proCopy';
import type { Me } from '../../lib/accounting/api';
import { supabase } from '../../lib/supabase';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { BRAND_DISPLAY_FONT, BRAND_TERRACOTTA, BrandLockup, BrandLogo } from '../brand/Logo';

// The signed-in frame of accounting.cantia.ch: a fixed sidebar on large
// screens, a top bar with a menu on phones, and ONE scrolling area for the
// content (no sticky/blurred header, no nested vertical scroll views: both
// broke scrolling and painted black areas in Safari).

export const SECTIONS = ['overview', 'clients', 'work', 'requests', 'deadlines', 'approvals', 'time', 'documents', 'team', 'partner', 'settings'] as const;
export type SectionKey = (typeof SECTIONS)[number];

const ICONS: Record<SectionKey, keyof typeof Feather.glyphMap> = {
  overview: 'home',
  clients: 'briefcase',
  work: 'check-square',
  requests: 'inbox',
  approvals: 'edit-3',
  time: 'clock',
  deadlines: 'calendar',
  documents: 'file-text',
  team: 'users',
  partner: 'award',
  settings: 'settings',
};

export function AccShell({
  me,
  active,
  onSelect,
  badges,
  children,
}: {
  me: Me | null;
  active: SectionKey | null;
  onSelect?: (key: SectionKey) => void;
  badges?: Partial<Record<SectionKey, number>>;
  children: ReactNode;
}) {
  const { copy } = useAccCopy();
  const w = useWorkCopy();
  const p = useProCopy();
  const label = (k: SectionKey) => (k === 'work' || k === 'time' || k === 'approvals' ? p.shell[k] : w.shell[k]);
  const router = useRouter();
  const wide = useIsWide(1024);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = me?.role === 'OWNER' || me?.role === 'ADMIN';
  const sections = SECTIONS.filter((s) => s !== 'settings' || isAdmin);

  function go(key: SectionKey) {
    setMenuOpen(false);
    if (onSelect) onSelect(key);
    else router.push(`/espace?tab=${key}` as any);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const nav = (
    <View style={styles.navList}>
      {sections.map((s) => {
        const on = s === active;
        const badge = badges?.[s];
        return (
          <Pressable
            key={s}
            onPress={() => go(s)}
            accessibilityRole="link"
            aria-current={on ? 'page' : undefined}
            style={({ hovered }: any) => [styles.navItem, hovered && !on && styles.navItemHover, on && styles.navItemOn]}
          >
            <Feather name={ICONS[s]} size={16} color={on ? colors.primaryDark : colors.textMuted} />
            <Text style={[styles.navText, on && styles.navTextOn]}>{label(s)}</Text>
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  const footer = (
    <View style={styles.sideFooter}>
      <AccLocaleSwitch />
      <Pressable onPress={logout} accessibilityRole="button">
        <Text style={styles.footLink}>{w.shell.logout}</Text>
      </Pressable>
    </View>
  );

  // Sidebar: full logo with the product name set under the wordmark;
  // phone top bar: the mark + ACCOUNTING.
  const brand = wide ? (
    <Pressable onPress={() => go('overview')} style={styles.brandStacked} accessibilityLabel={copy.brand}>
      <BrandLogo height={26} />
      <Text style={styles.brandProduct}>ACCOUNTING</Text>
    </Pressable>
  ) : (
    <Pressable onPress={() => go('overview')} style={styles.brand} accessibilityLabel={copy.brand}>
      <BrandLockup height={30} compact product="Accounting" />
    </Pressable>
  );

  const firm = me ? (
    <View style={styles.firm}>
      <View style={styles.firmAvatar}>
        <Text style={styles.firmAvatarText}>{me.firm.name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.firmName} numberOfLines={1}>
          {me.firm.name}
        </Text>
        <Text style={styles.firmUser} numberOfLines={1}>
          {[me.first_name, me.last_name].filter(Boolean).join(' ')}
        </Text>
      </View>
    </View>
  ) : null;

  if (wide) {
    return (
      <View style={styles.root}>
        <View style={styles.sidebar}>
          {brand}
          {firm}
          {me ? nav : null}
          <View style={{ flex: 1 }} />
          <View style={styles.secure}>
            <Feather name="lock" size={12} color={colors.textMuted} />
            <Text style={styles.secureText}>{w.shell.secure}</Text>
          </View>
          {footer}
        </View>
        <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.rootMobile}>
      <View style={styles.topbar}>
        {brand}
        {me ? (
          <Pressable onPress={() => setMenuOpen((v) => !v)} style={styles.menuBtn} accessibilityRole="button" accessibilityLabel={w.shell.menu}>
            <Feather name={menuOpen ? 'x' : 'menu'} size={20} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      {menuOpen ? (
        <View style={styles.mobileMenu}>
          {firm}
          {nav}
          {footer}
        </View>
      ) : null}
      <ScrollView style={styles.main} contentContainerStyle={styles.mainContentMobile}>
        {children}
      </ScrollView>
    </View>
  );
}

// Page title block used by every section.
export function SectionHeader({ eyebrow, title, text, right }: { eyebrow?: string; title: string; text?: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1, minWidth: 240, gap: 6 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.h1} role="heading" aria-level={1}>
          {title}
        </Text>
        {text ? <Text style={styles.lead}>{text}</Text> : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  rootMobile: { flex: 1, backgroundColor: colors.bg },
  sidebar: { width: 256, backgroundColor: colors.surface, borderRightWidth: 1, borderRightColor: colors.border, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, gap: spacing.lg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: spacing.xs },
  brandStacked: { gap: 6, paddingHorizontal: spacing.xs },
  // Aligned with the wordmark's first letter (the mark is 26 px wide + gap).
  brandProduct: { marginLeft: 32, fontSize: 10, letterSpacing: 2.6, color: BRAND_TERRACOTTA, fontFamily: BRAND_DISPLAY_FONT },
  firm: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  firmAvatar: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  firmAvatarText: { color: colors.surface, fontWeight: '800', fontSize: 14 },
  firmName: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  firmUser: { fontSize: 12, color: colors.textMuted },
  navList: { gap: 2 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 10, borderRadius: radius.md },
  navItemHover: { backgroundColor: colors.bg },
  navItemOn: { backgroundColor: colors.primarySoft },
  navText: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  navTextOn: { color: colors.primaryDark, fontWeight: '800' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: colors.surface, fontSize: 11, fontWeight: '800', ...monoType },
  secure: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.xs },
  secureText: { flex: 1, fontSize: 11, lineHeight: 15, color: colors.textMuted },
  sideFooter: { gap: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'flex-start' },
  footLink: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  main: { flex: 1 },
  mainContent: { paddingVertical: spacing.xxl, paddingHorizontal: spacing.xxl },
  mainContentMobile: { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: 64 },
  inner: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuBtn: { padding: 6, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  mobileMenu: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xl },
  headerRight: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  eyebrow: { ...monoType, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.primary, fontWeight: '700' },
  h1: { ...displayType, fontSize: 30, lineHeight: 34, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  lead: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted, maxWidth: 720 },
});
