import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { LoadingScreen } from '../../components/ui';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AdminDataProvider, useAdminData } from '../../lib/adminDataContext';
import { colors, fontSize, radius, spacing, breakpoints } from '../../lib/theme';

// "Comptes" (individual users) is deliberately not a top-level destination —
// entreprises are what matters day to day, a member is reached from its
// org's detail page instead (see the "Membres" row there). The route itself
// still exists and still works, just not in this nav.
const NAV_ITEMS: { href: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { href: '/(admin)', label: 'Dashboard', icon: 'home' },
  { href: '/(admin)/organizations', label: 'Entreprises', icon: 'briefcase' },
  { href: '/(admin)/modules', label: 'Modules', icon: 'grid' },
  { href: '/(admin)/subscriptions', label: 'Abos', icon: 'credit-card' },
  { href: '/(admin)/newsletter', label: 'E-mails', icon: 'mail' },
  { href: '/(admin)/tutoriels', label: 'Tutoriels', icon: 'video' },
  { href: '/(admin)/logs', label: 'Logs', icon: 'list' },
];

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

  if (dataLoading) {
    return <LoadingScreen label="Calcul en cours… récupération des données" />;
  }

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={[styles.sidebar, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom }]}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>Cantia</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SUPER ADMIN</Text>
            </View>
          </View>
          <View style={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = item.href === activeHref;
              return (
                <Pressable
                  key={item.href}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => router.replace(item.href as any)}
                >
                  <Feather name={item.icon} size={17} color={active ? colors.primary : colors.textMuted} />
                  <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
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
        <Text style={styles.brandText}>Cantia</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SUPER ADMIN</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.mobileExitButton} onPress={signOut} hitSlop={8}>
          <Feather name="log-out" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      {/* A top nav strip, not a bottom tab bar — 7 destinations crammed into
          equal-width bottom tabs left every label either truncated or
          unreadably tiny on a real phone. Chips size to their own label
          instead. This is a flexWrap row, NOT a horizontal ScrollView: a
          ScrollView here — even one that isn't nested inside the page's own
          vertical scroller, just a sibling above it in the same flex
          column — was still enough to break that page's vertical scroll on
          real mobile browsers (confirmed live on Entreprises). Wrapping to
          a second line on narrow phones costs a little height; it never
          costs scroll. */}
      <View style={styles.mobileNavBar}>
        {NAV_ITEMS.map((item) => {
          const active = item.href === activeHref;
          return (
            <Pressable
              key={item.href}
              style={[styles.mobileNavItem, active && styles.mobileNavItemActive]}
              onPress={() => router.replace(item.href as any)}
            >
              <Feather name={item.icon} size={15} color={active ? colors.primary : colors.textMuted} />
              <Text style={[styles.mobileNavItemText, active && styles.mobileNavItemTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
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
    width: 232,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  brandRow: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  brandText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
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
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  navItemActive: {
    backgroundColor: colors.primarySoft,
  },
  navItemText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  navItemTextActive: {
    color: colors.primary,
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
