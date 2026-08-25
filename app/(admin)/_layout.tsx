import { Pressable, StyleSheet, Text, View, useWindowDimensions, ScrollView } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { LoadingScreen } from '../../components/ui';
import { colors, fontSize, radius, spacing, breakpoints } from '../../lib/theme';

const NAV_ITEMS: { href: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { href: '/(admin)', label: 'Dashboard', icon: 'home' },
  { href: '/(admin)/organizations', label: 'Entreprises', icon: 'briefcase' },
  { href: '/(admin)/users', label: 'Utilisateurs', icon: 'users' },
  { href: '/(admin)/modules', label: 'Modules', icon: 'grid' },
  { href: '/(admin)/subscriptions', label: 'Abonnements', icon: 'credit-card' },
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
  const { session, isPlatformAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= breakpoints.tablet;
  const activeHref = activeHrefFor(pathname);

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
                  onPress={() => router.push(item.href as any)}
                >
                  <Feather name={item.icon} size={17} color={active ? colors.primary : colors.textMuted} />
                  <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={styles.exitLink} onPress={() => router.replace('/(app)')}>
            <Feather name="arrow-left" size={15} color={colors.textMuted} />
            <Text style={styles.exitLinkText}>Retour à Cantia</Text>
          </Pressable>
        </View>
        <View style={styles.content}>
          <Slot />
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
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileNav} contentContainerStyle={styles.mobileNavContent}>
        {NAV_ITEMS.map((item) => {
          const active = item.href === activeHref;
          return (
            <Pressable key={item.href} style={[styles.mobilePill, active && styles.mobilePillActive]} onPress={() => router.push(item.href as any)}>
              <Feather name={item.icon} size={14} color={active ? '#fff' : colors.textMuted} />
              <Text style={[styles.mobilePillText, active && styles.mobilePillTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.mobileContent}>
        <Slot />
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
  content: {
    flex: 1,
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
  mobileNav: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  mobileNavContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  mobilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  mobilePillActive: {
    backgroundColor: colors.primary,
  },
  mobilePillText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  mobilePillTextActive: {
    color: '#fff',
  },
  mobileContent: {
    flex: 1,
  },
});
