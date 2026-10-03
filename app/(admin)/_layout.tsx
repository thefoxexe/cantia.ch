import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { releaseHydrationViewport } from '../../lib/hydrationViewport';
import { useAuth } from '../../lib/auth-context';
import { LoadingScreen } from '../../components/ui';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AdminDataProvider, useAdminData } from '../../lib/adminDataContext';
import { colors, fontSize, radius, spacing, breakpoints } from '../../lib/theme';
import { BrandLogo, BrandMark } from '../../components/brand/Logo';

// Grouped by what you come to do. "Comptes" (individual users) is not a
// top-level destination: a member is reached from its company's page. The
// partner program and the fiduciary space are administered here too (their
// own sites have no admin anymore).
type NavItem = { href: string; label: string; icon: keyof typeof Feather.glyphMap };
const NAV_GROUPS: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [{ href: '/(admin)', label: 'Dashboard', icon: 'home' }] },
  {
    title: 'Clients',
    items: [
      { href: '/(admin)/organizations', label: 'Entreprises', icon: 'briefcase' },
      { href: '/(admin)/subscriptions', label: 'Abonnements', icon: 'credit-card' },
      { href: '/(admin)/rentabilite', label: 'Rentabilité', icon: 'trending-up' },
    ],
  },
  {
    title: 'Ma gestion',
    items: [{ href: '/(admin)/compta', label: 'Comptabilité', icon: 'book' }],
  },
  {
    title: 'Produit',
    items: [
      { href: '/(admin)/usage', label: 'Utilisation', icon: 'bar-chart-2' },
      { href: '/(admin)/modules', label: 'Modules', icon: 'grid' },
    ],
  },
  {
    title: 'Écosystème',
    items: [
      { href: '/(admin)/partners', label: 'Partners', icon: 'award' },
      { href: '/(admin)/fiduciaires', label: 'Fiduciaires', icon: 'shield' },
    ],
  },
  {
    title: 'Acquisition',
    items: [
      { href: '/(admin)/trafic', label: 'Trafic', icon: 'compass' },
      { href: '/(admin)/blog-leads', label: 'Blog & leads', icon: 'download' },
      { href: '/(admin)/newsletter', label: 'E-mails', icon: 'mail' },
      { href: '/(admin)/tutoriels', label: 'Tutoriels', icon: 'video' },
    ],
  },
  { title: 'Système', items: [{ href: '/(admin)/logs', label: 'Logs', icon: 'list' }] },
];
const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

function activeHrefFor(pathname: string): string | null {
  let best: string | null = null;
  for (const item of NAV_ITEMS) {
    const compare = item.href.replace('/(admin)', '') || '/';
    const matches = compare === '/' ? pathname === '/' : pathname === compare || pathname.startsWith(`${compare}/`);
    if (matches && (!best || item.href.length > best.length)) best = item.href;
  }
  return best;
}

// Access to this whole route group is gated on isPlatformAdmin — resolved
// server-side via is_platform_admin() (see lib/auth-context.tsx), never
// derived from organization/role data. This guard is a navigation
// convenience only: every admin_* RPC re-checks is_platform_admin() itself,
// so a request that somehow reaches this screen without it still fails at
// the DB regardless of what this component renders.
export default function AdminLayout() {
  useEffect(releaseHydrationViewport, []);
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

  // The dashboard's own numbers (MRR, ARR, growth…) are prefetched here,
  // once per login/app-resume, behind one full-platform loading screen —
  // see AdminNavShell below — instead of the dashboard popping its own
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
  const isDesktop = width >= breakpoints.tablet;
  const activeHref = activeHrefFor(pathname);
  const { loading: dataLoading } = useAdminData();
  const [menuOpen, setMenuOpen] = useState(false);

  if (dataLoading) {
    return <LoadingScreen label="Calcul en cours… récupération des données" />;
  }

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={[styles.sidebar, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom }]}>
          <View style={styles.brandRow}>
            <BrandLogo height={28} />
          </View>
          <View style={styles.badge}>
            <Feather name="shield" size={10} color="#fff" />
            <Text style={styles.badgeText}>SUPER ADMIN</Text>
          </View>
          <ScrollView style={styles.nav} contentContainerStyle={{ gap: 2, paddingBottom: spacing.md }} showsVerticalScrollIndicator={false}>
            {NAV_GROUPS.map((group) => (
              <View key={group.title ?? 'home'} style={{ gap: 2 }}>
                {group.title ? <Text style={styles.groupTitle}>{group.title}</Text> : null}
                {group.items.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <Pressable
                      key={item.href}
                      style={({ hovered }: any) => [styles.navItem, hovered && !active && styles.navItemHover, active && styles.navItemActive]}
                      onPress={() => router.replace(item.href as any)}
                    >
                      {active ? <View style={styles.navItemBar} /> : null}
                      <Feather name={item.icon} size={16} color={active ? colors.primary : colors.textMuted} />
                      <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.exitLink} onPress={signOut}>
            <Feather name="log-out" size={15} color={colors.textMuted} />
            <Text style={styles.exitLinkText}>Déconnexion</Text>
          </Pressable>
        </View>
        <View style={styles.content}>
          <ErrorBoundary key={pathname}>
            <Slot />
          </ErrorBoundary>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      <View style={[styles.mobileTopBar, { paddingTop: insets.top + spacing.sm }]}>
        <BrandMark size={30} />
        <View style={[styles.badge, styles.badgeInline]}>
          <Feather name="shield" size={10} color="#fff" />
          <Text style={styles.badgeText}>SUPER ADMIN</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.mobileExitButton} onPress={signOut} hitSlop={8}>
          <Feather name="log-out" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      {/* Current page + a menu button: the grouped list opens under the
          bar (no horizontal ScrollView here, it broke the page's vertical
          scroll on real phones). */}
      <Pressable style={styles.mobileCurrent} onPress={() => setMenuOpen((v) => !v)}>
        <Feather name={NAV_ITEMS.find((i) => i.href === activeHref)?.icon ?? 'menu'} size={15} color={colors.primary} />
        <Text style={styles.mobileCurrentText}>{NAV_ITEMS.find((i) => i.href === activeHref)?.label ?? 'Menu'}</Text>
        <Feather name={menuOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </Pressable>
      {menuOpen ? (
        <View style={styles.mobileMenu}>
          {NAV_GROUPS.map((group) => (
            <View key={group.title ?? 'home'} style={{ gap: 2 }}>
              {group.title ? <Text style={styles.groupTitle}>{group.title}</Text> : null}
              <View style={styles.mobileMenuRow}>
                {group.items.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <Pressable
                      key={item.href}
                      style={[styles.mobileNavItem, active && styles.mobileNavItemActive]}
                      onPress={() => {
                        setMenuOpen(false);
                        router.replace(item.href as any);
                      }}
                    >
                      <Feather name={item.icon} size={15} color={active ? colors.primary : colors.textMuted} />
                      <Text style={[styles.mobileNavItemText, active && styles.mobileNavItemTextActive]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.mobileContent}>
        <ErrorBoundary key={pathname}>
          <Slot />
        </ErrorBoundary>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg,
  },
  sidebar: {
    width: 240,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 6, height: 0 },
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  brandLogo: {
    width: 26,
    height: 26,
  },
  mobileBrandLogo: {
    width: 22,
    height: 22,
  },
  brandText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  badgeInline: {
    marginBottom: 0,
    marginHorizontal: 0,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#fff',
  },
  nav: {
    flex: 1,
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  navItemActive: {
    backgroundColor: colors.primarySoft,
  },
  navItemHover: {
    backgroundColor: colors.bg,
  },
  groupTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    marginBottom: 2,
  },
  mobileCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileCurrentText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  mobileMenu: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  mobileMenuRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  navItemBar: {
    position: 'absolute',
    left: -spacing.md,
    top: '50%',
    marginTop: -10,
    width: 3,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  navItemText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  navItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  exitLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  exitLinkText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  // minHeight: 0 matters here on web: a flex child otherwise refuses to
  // shrink below its content's natural height, so the Slot's own ScrollView
  // never gets a bounded height to scroll within — the whole document
  // scrolls instead and drags the sidebar/tab bar along with it. This is
  // the root cause behind the "scroll sometimes breaks" reports.
  content: {
    flex: 1,
    minHeight: 0,
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  mobileExitButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  mobileContent: {
    flex: 1,
    minHeight: 0,
  },
  mobileNavBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  mobileNavItemActive: {
    backgroundColor: colors.primarySoft,
  },
  mobileNavItemText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  mobileNavItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
