import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { releaseHydrationViewport } from '../../lib/hydrationViewport';
import { useSiteFontScope } from '../../components/site/Primitives';
import { useAuth } from '../../lib/auth-context';
import { LoadingScreen } from '../../components/ui';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AdminDataProvider, useAdminData } from '../../lib/adminDataContext';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { BrandLogo, BrandMark } from '../../components/brand/Logo';
import { AdminSearch, type SearchPage } from '../../components/admin/AdminSearch';
import { ink } from '../../components/admin/kit';
import { NAV_GROUPS, NAV_ITEMS, TAB_HREFS, TAB_LABEL, activeHrefFor, type NavItem } from '../../components/admin/nav';
import type { AdminAttention } from '../../lib/api/admin';

const SEARCH_PAGES: SearchPage[] = NAV_ITEMS.map((i) => ({ href: i.href, label: i.label, desc: i.desc, icon: i.icon }));

function countOf(item: NavItem, attention: AdminAttention | null): number {
  return attention && item.count ? item.count(attention) : 0;
}

function NavCount({ value, urgent, dark }: { value: number; urgent?: boolean; dark?: boolean }) {
  if (!value) return null;
  return (
    <View style={[styles.count, urgent ? styles.countUrgent : dark ? styles.countDark : styles.countLight]}>
      <Text style={[styles.countText, urgent ? styles.countTextUrgent : dark ? styles.countTextDark : styles.countTextLight]}>{value > 99 ? '99+' : value}</Text>
    </View>
  );
}

// Access to this whole route group is gated on isPlatformAdmin — resolved
// server-side via is_platform_admin() (see lib/auth-context.tsx), never
// derived from organization/role data. This guard is a navigation
// convenience only: every admin_* RPC re-checks is_platform_admin() itself,
// so a request that somehow reaches this screen without it still fails at
// the DB regardless of what this component renders.
export default function AdminLayout() {
  useEffect(releaseHydrationViewport, []);
  // The panel reads in the brand typeface (DM Sans), like the site.
  useSiteFontScope();
  const { session, isPlatformAdmin, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/(auth)/login');
    } else if (!isPlatformAdmin) {
      router.replace('/(app)');
    }
  }, [loading, session, isPlatformAdmin, router]);

  if (loading || !session || !isPlatformAdmin) {
    return <LoadingScreen label="Vérification des accès…" />;
  }

  // The home page's numbers (MRR, growth, what waits for an action…) are
  // prefetched here, once per login/app-resume, behind one loading screen —
  // see AdminNavShell below — instead of the home page popping its own
  // spinner every time you land back on it.
  return (
    <AdminDataProvider>
      <AdminNavShell signOut={signOut} />
    </AdminDataProvider>
  );
}

function AdminNavShell({ signOut }: { signOut: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 900;
  const activeHref = activeHrefFor(pathname);
  const { loading: dataLoading, attention } = useAdminData();
  const [menuOpen, setMenuOpen] = useState(false);

  if (dataLoading) {
    return <LoadingScreen label="Calcul en cours… récupération des données" />;
  }

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={[styles.sidebar, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.sm }]}>
          <View style={styles.brandRow}>
            <BrandLogo height={22} tone="white" />
          </View>
          <Text style={styles.brandSub}>Super admin</Text>
          <View style={styles.searchWrap}>
            <AdminSearch pages={SEARCH_PAGES} dark />
          </View>
          <ScrollView style={styles.nav} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
            {NAV_GROUPS.map((group) => (
              <View key={group.title ?? 'home'} style={styles.navGroup}>
                {group.title ? <Text style={styles.groupTitle}>{group.title}</Text> : null}
                {group.items.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <Pressable
                      key={item.href}
                      style={({ hovered }: any) => [styles.navItem, hovered && !active && styles.navItemHover, active && styles.navItemActive]}
                      onPress={() => router.replace(item.href as any)}
                      accessibilityRole="link"
                      accessibilityState={{ selected: active }}
                    >
                      <Feather name={item.icon} size={15} color={active ? ink.accent : ink.muted} />
                      <Text style={[styles.navItemText, active && styles.navItemTextActive]} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <NavCount value={countOf(item, attention)} urgent={item.urgent} dark />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          <View style={styles.sidebarFoot}>
            <Pressable style={({ hovered }: any) => [styles.footLink, hovered && styles.navItemHover]} onPress={signOut}>
              <Feather name="log-out" size={14} color={ink.muted} />
              <Text style={styles.footLinkText}>Déconnexion</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.content}>
          <ErrorBoundary key={pathname}>
            <Slot />
          </ErrorBoundary>
        </View>
      </View>
    );
  }

  const current = NAV_ITEMS.find((i) => i.href === activeHref);
  const inTabs = !!activeHref && TAB_HREFS.includes(activeHref);
  const go = (href: string) => {
    setMenuOpen(false);
    router.replace(href as any);
  };
  // What waits outside the four tabs, shown on « Plus ».
  const moreCount = NAV_ITEMS.filter((i) => !TAB_HREFS.includes(i.href) && i.urgent).reduce((n, i) => n + countOf(i, attention), 0);

  return (
    <View style={styles.mobileRoot}>
      <View style={[styles.mobileTopBar, { paddingTop: insets.top + spacing.sm }]}>
        <BrandMark size={24} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.mobileKicker}>Super admin</Text>
          <Text style={styles.mobileTitle} numberOfLines={1}>
            {menuOpen ? 'Toutes les sections' : current?.label ?? 'Administration'}
          </Text>
        </View>
        <Pressable style={styles.mobileIconButton} onPress={() => setMenuOpen((v) => !v)} accessibilityLabel={menuOpen ? 'Fermer le menu' : 'Rechercher'}>
          <Feather name={menuOpen ? 'x' : 'search'} size={18} color={ink.text} />
        </Pressable>
      </View>

      <View style={styles.mobileContent}>
        {menuOpen ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
            <AdminSearch pages={SEARCH_PAGES} onNavigate={() => setMenuOpen(false)} />
            {NAV_GROUPS.map((group) => (
              <View key={group.title ?? 'home'} style={styles.sheetGroup}>
                {group.title ? <Text style={styles.sheetGroupTitle}>{group.title}</Text> : null}
                <View style={styles.sheetCard}>
                  {group.items.map((item, idx) => {
                    const active = item.href === activeHref;
                    return (
                      <Pressable
                        key={item.href}
                        onPress={() => go(item.href)}
                        style={({ pressed }) => [styles.sheetRow, idx > 0 && styles.sheetRowBorder, (pressed || active) && styles.sheetRowActive]}
                      >
                        <View style={[styles.sheetIcon, active && styles.sheetIconActive]}>
                          <Feather name={item.icon} size={16} color={active ? '#fff' : colors.primary} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.sheetLabel}>{item.label}</Text>
                          <Text style={styles.sheetDesc}>{item.desc}</Text>
                        </View>
                        <NavCount value={countOf(item, attention)} urgent={item.urgent} />
                        <Feather name="chevron-right" size={16} color={colors.textMuted} />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            <Pressable style={styles.sheetLogout} onPress={signOut}>
              <Feather name="log-out" size={16} color={colors.textMuted} />
              <Text style={styles.sheetLogoutText}>Déconnexion</Text>
            </Pressable>
          </ScrollView>
        ) : (
          <ErrorBoundary key={pathname}>
            <Slot />
          </ErrorBoundary>
        )}
      </View>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        {TAB_HREFS.map((href) => {
          const item = NAV_ITEMS.find((i) => i.href === href)!;
          const active = !menuOpen && activeHref === href;
          const n = item.urgent ? countOf(item, attention) : 0;
          return (
            <Pressable key={href} style={styles.tab} onPress={() => go(href)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <View>
                <Feather name={item.icon} size={20} color={active ? colors.primary : colors.textMuted} />
                {n > 0 ? <View style={styles.tabDot} /> : null}
              </View>
              <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
                {TAB_LABEL[href] ?? item.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable style={styles.tab} onPress={() => setMenuOpen((v) => !v)} accessibilityRole="tab" accessibilityState={{ selected: menuOpen || !inTabs }}>
          <View>
            <Feather name={menuOpen ? 'x' : 'menu'} size={20} color={menuOpen || !inTabs ? colors.primary : colors.textMuted} />
            {moreCount > 0 && !menuOpen ? <View style={styles.tabDot} /> : null}
          </View>
          <Text style={[styles.tabText, (menuOpen || !inTabs) && styles.tabTextActive]} numberOfLines={1}>
            {!menuOpen && !inTabs && current ? current.short ?? current.label : 'Plus'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  sidebar: { width: 248, backgroundColor: ink.bg, paddingHorizontal: spacing.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
  brandSub: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: ink.accent,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchWrap: { paddingHorizontal: 2, marginBottom: spacing.md, zIndex: 30 },
  nav: { flex: 1 },
  navContent: { gap: spacing.md, paddingBottom: spacing.md },
  navGroup: { gap: 1 },
  groupTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: ink.faint,
    paddingHorizontal: spacing.sm,
    marginBottom: 4,
  },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.lg },
  navItemHover: { backgroundColor: 'rgba(255,255,255,0.05)' },
  navItemActive: { backgroundColor: ink.raised },
  navItemText: { flex: 1, minWidth: 0, fontSize: fontSize.sm, fontWeight: '500', color: ink.muted },
  navItemTextActive: { color: ink.text, fontWeight: '700' },
  count: { minWidth: 20, height: 18, paddingHorizontal: 5, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  countUrgent: { backgroundColor: colors.primary },
  countDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  countLight: { backgroundColor: colors.surfaceAlt },
  countText: { fontSize: 10.5, fontWeight: '800', fontVariant: ['tabular-nums'] },
  countTextUrgent: { color: '#fff' },
  countTextDark: { color: ink.text },
  countTextLight: { color: colors.textMuted },
  sidebarFoot: { borderTopWidth: 1, borderTopColor: ink.line, paddingTop: spacing.sm },
  footLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: radius.lg },
  footLinkText: { fontSize: fontSize.sm, color: ink.muted, fontWeight: '500' },
  // minHeight: 0 matters here on web: a flex child otherwise refuses to
  // shrink below its content's natural height, so the Slot's own ScrollView
  // never gets a bounded height to scroll within — the whole document
  // scrolls instead and drags the sidebar/tab bar along with it.
  content: { flex: 1, minHeight: 0 },
  mobileRoot: { flex: 1, backgroundColor: colors.bg },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 2,
    backgroundColor: ink.bg,
  },
  mobileKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: ink.accent },
  mobileTitle: { fontSize: fontSize.md, fontWeight: '700', color: ink.text },
  mobileIconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: ink.raised },
  mobileContent: { flex: 1, minHeight: 0 },
  sheet: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  sheetGroup: { gap: spacing.xs },
  sheetGroupTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted, paddingHorizontal: spacing.xs },
  sheetCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden' },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  sheetRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  sheetRowActive: { backgroundColor: colors.primarySoft },
  sheetIcon: { width: 34, height: 34, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sheetIconActive: { backgroundColor: colors.primary },
  sheetLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  sheetDesc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
  sheetLogout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  sheetLogoutText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4, minWidth: 0 },
  tabDot: { position: 'absolute', top: -2, right: -5, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.surface },
  tabText: { fontSize: 10.5, fontWeight: '600', color: colors.textMuted, maxWidth: '100%' },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
});
