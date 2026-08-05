import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, Slot, Tabs, usePathname } from 'expo-router';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth-context';
import { isModuleEnabled } from '../../lib/modules';
import { colors, fontSize, radius, spacing, breakpoints } from '../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

interface NavItem {
  href: '/(app)' | '/(app)/chantiers' | '/(app)/devis' | '/(app)/planning' | '/(app)/compte';
  label: string;
  icon: IconName;
}

function TabIcon({ name, color }: { name: IconName; color: unknown }) {
  return <Feather name={name} size={21} color={color as string} />;
}

// Two shells sharing the same underlying file-based routes (index,
// chantiers, devis, planning, compte): a bottom tab bar on phones (native
// mobile navigation convention), a persistent left sidebar from tablet width
// up (back-office convention — more useful once there's room for it).
// Switching the wrapper component doesn't affect routing itself: expo-router
// resolves the active child route the same way whether it's rendered by
// <Tabs.Screen> or by <Slot/>, so every existing screen file needs no changes.
export default function AppLayout() {
  const { width } = useWindowDimensions();
  const { organization } = useAuth();
  const devisEnabled = isModuleEnabled(organization?.enabled_modules, 'devis');
  const planningEnabled = isModuleEnabled(organization?.enabled_modules, 'planning');

  const items: NavItem[] = [
    { href: '/(app)', label: 'Accueil', icon: 'home' },
    { href: '/(app)/chantiers', label: 'Chantiers', icon: 'layers' },
    ...(devisEnabled ? [{ href: '/(app)/devis', label: 'Facturation', icon: 'file-text' } as NavItem] : []),
    ...(planningEnabled ? [{ href: '/(app)/planning', label: 'Planning', icon: 'calendar' } as NavItem] : []),
    { href: '/(app)/compte', label: 'Compte', icon: 'settings' },
  ];

  if (width >= breakpoints.tablet) {
    return <DesktopShell items={items} />;
  }
  return <MobileShell devisEnabled={devisEnabled} planningEnabled={planningEnabled} />;
}

// A top bar sitting above the tab bar consumes the top safe-area inset
// itself, so screens rendered inside the tabs must not also reserve it (the
// shared <Screen> wrapper used by every screen file adds `insets.top` on
// its own, assuming it's flush against the physical top edge). Rather than
// touch every screen file, the tab content is wrapped in a
// SafeAreaInsetsContext override reporting top:0 — <Screen>'s own spacer
// then collapses to just its small fixed margin, and nothing double-pads.
function MobileShell({ devisEnabled, planningEnabled }: { devisEnabled: boolean; planningEnabled: boolean }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.mobileRoot}>
      <View style={[styles.mobileTopBar, { paddingTop: insets.top + spacing.sm }]}>
        <Image source={require('../../assets/logo-mark.png')} style={styles.mobileLogo} resizeMode="contain" />
        <Text style={styles.mobileBrand}>Cantia</Text>
      </View>
      <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: { borderTopColor: colors.border },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{ title: 'Accueil', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
          />
          <Tabs.Screen
            name="chantiers"
            options={{ title: 'Chantiers', tabBarIcon: ({ color }) => <TabIcon name="layers" color={color} /> }}
          />
          <Tabs.Screen
            name="devis"
            options={{
              title: 'Facturation',
              tabBarIcon: ({ color }) => <TabIcon name="file-text" color={color} />,
              href: devisEnabled ? undefined : null,
            }}
          />
          <Tabs.Screen
            name="planning"
            options={{
              title: 'Planning',
              tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
              href: planningEnabled ? undefined : null,
            }}
          />
          <Tabs.Screen
            name="compte"
            options={{ title: 'Compte', tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} /> }}
          />
        </Tabs>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

function DesktopShell({ items }: { items: NavItem[] }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  function isActive(href: NavItem['href']) {
    const compare = href.replace('/(app)', '') || '/';
    if (compare === '/') return pathname === '/';
    return pathname === compare || pathname.startsWith(`${compare}/`);
  }

  return (
    <View style={styles.desktopRoot}>
      <View style={[styles.sidebar, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.sidebarBrand}>
          <Image source={require('../../assets/logo-mark.png')} style={styles.sidebarLogo} resizeMode="contain" />
          <Text style={styles.sidebarBrandText}>Cantia</Text>
        </View>
        <View style={styles.sidebarNav}>
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={StyleSheet.flatten([styles.sidebarItem, active && styles.sidebarItemActive])}>
                  <Feather name={item.icon} size={18} color={active ? colors.primary : colors.textMuted} />
                  <Text style={StyleSheet.flatten([styles.sidebarItemText, active && styles.sidebarItemTextActive])}>
                    {item.label}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
      <View style={styles.desktopContent}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileLogo: {
    width: 24,
    height: 24,
  },
  mobileBrand: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
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
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  sidebarLogo: {
    width: 28,
    height: 28,
  },
  sidebarBrandText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  sidebarNav: {
    gap: spacing.xs,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  sidebarItemActive: {
    backgroundColor: colors.primarySoft,
  },
  sidebarItemText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sidebarItemTextActive: {
    color: colors.primary,
  },
  desktopContent: {
    flex: 1,
  },
});
