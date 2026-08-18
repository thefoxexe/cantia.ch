import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../lib/auth-context';
import { isModuleEnabled } from '../../lib/modules';
import { colors, fontSize, radius, spacing, breakpoints } from '../../lib/theme';
import { AccountMenu } from '../../components/AccountMenu';
import { NavDrawer, type NavSection } from '../../components/NavDrawer';

function buildSections(
  financeVisible: boolean,
  planningEnabled: boolean,
  subcontractorsVisible: boolean,
  payrollEnabled: boolean,
): NavSection[] {
  const teamLinks = [
    ...(planningEnabled ? [{ href: '/(app)/planning', label: 'Planning', icon: 'calendar' as const }] : []),
    ...(payrollEnabled ? [{ href: '/(app)/rh', label: 'RH & Salaires', icon: 'dollar-sign' as const }] : []),
  ];
  return [
    { links: [{ href: '/(app)', label: 'Accueil', icon: 'home' }] },
    {
      title: 'CHANTIERS',
      links: [
        { href: '/(app)/chantiers', label: 'Chantiers', icon: 'layers' as const },
        ...(subcontractorsVisible
          ? [{ href: '/(app)/sous-traitants', label: 'Sous-traitants', icon: 'briefcase' as const }]
          : []),
      ],
    },
    ...(financeVisible
      ? [
          {
            title: 'FACTURATION',
            links: [
              { href: '/(app)/clients', label: 'Clients', icon: 'users' as const },
              { href: '/(app)/devis', label: 'Devis', icon: 'file-text' as const },
              { href: '/(app)/devis/trames', label: 'Trames', icon: 'layout' as const },
              { href: '/(app)/devis/factures', label: 'Factures', icon: 'dollar-sign' as const },
              { href: '/(app)/devis/inventaire', label: 'Inventaire', icon: 'box' as const },
            ],
          },
        ]
      : []),
    ...(teamLinks.length > 0 ? [{ title: 'ÉQUIPE', links: teamLinks }] : []),
    { links: [{ href: '/(app)/compte', label: 'Paramètres', icon: 'settings' }] },
  ];
}

// The most specific matching link wins (e.g. '/devis/factures' over '/devis'),
// so sub-sections highlight correctly instead of always lighting up the parent.
function activeHrefFor(pathname: string, sections: NavSection[]): string | null {
  let best: string | null = null;
  for (const section of sections) {
    for (const link of section.links) {
      const compare = link.href.replace('/(app)', '') || '/';
      const matches = compare === '/' ? pathname === '/' : pathname === compare || pathname.startsWith(`${compare}/`);
      if (matches && (!best || link.href.length > best.length)) best = link.href;
    }
  }
  return best;
}

// Two shells sharing the same underlying file-based routes: a hamburger-driven
// drawer on phones (grouped sections, same structure as the desktop sidebar —
// just presented as an overlay since there's no room for a persistent one) and
// a persistent left sidebar from tablet width up. Switching the wrapper
// component doesn't affect routing itself: expo-router resolves the active
// child route the same way whether it's rendered by <Slot/> in either shell.
export default function AppLayout() {
  const { width } = useWindowDimensions();
  const { organization, canViewFinances, permissions } = useAuth();
  const devisEnabled = isModuleEnabled(organization?.enabled_modules, 'devis');
  const planningEnabled = isModuleEnabled(organization?.enabled_modules, 'planning') && permissions.planning;
  // Unlike Planning, RH & Salaires has no view permission gate: every member
  // needs the module to log their own hours, regardless of canManagePayroll
  // (that only controls what they see once inside it).
  const payrollEnabled = isModuleEnabled(organization?.enabled_modules, 'payroll');
  // A standard member without the "voir devis & factures" permission (see
  // équipe screen) doesn't get the FACTURATION section at all — Trames and
  // Inventaire live under the same /devis route subtree and only make sense
  // alongside Devis/Factures, so they're hidden together rather than left
  // as orphaned entries. Clients stays a separate top-level route and isn't
  // affected.
  const financeVisible = devisEnabled && canViewFinances;
  const sections = buildSections(financeVisible, planningEnabled, permissions.subcontractors, payrollEnabled);

  if (width >= breakpoints.tablet) {
    return <DesktopShell sections={sections} />;
  }
  return <MobileShell sections={sections} />;
}

// A top bar sitting above the content consumes the top safe-area inset
// itself, so screens rendered inside must not also reserve it (the shared
// <Screen> wrapper used by every screen file adds `insets.top` on its own,
// assuming it's flush against the physical top edge). Rather than touch
// every screen file, the content is wrapped in a SafeAreaInsetsContext
// override reporting top:0 — <Screen>'s own spacer then collapses to just
// its small fixed margin, and nothing double-pads.
function MobileShell({ sections }: { sections: NavSection[] }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeHref = activeHrefFor(pathname, sections);

  return (
    <View style={styles.mobileRoot}>
      <View style={[styles.mobileTopBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => setDrawerOpen(true)} hitSlop={8} style={styles.hamburger}>
          <Feather name="menu" size={22} color={colors.text} />
        </Pressable>
        <Image source={require('../../assets/logo-mark.png')} style={styles.mobileLogo} resizeMode="contain" />
        <Text style={styles.mobileBrand}>Cantia</Text>
        <View style={{ flex: 1 }} />
        <AccountMenu />
      </View>
      <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
        <Slot />
      </SafeAreaInsetsContext.Provider>
      <NavDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} sections={sections} activeHref={activeHref} />
    </View>
  );
}

const SIDEBAR_COLLAPSED_KEY = 'cantia:sidebarCollapsed';

function DesktopShell({ sections }: { sections: NavSection[] }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const activeHref = activeHrefFor(pathname, sections);
  // Persisted so the choice sticks across reloads — mainly useful on iPad,
  // where the fixed 232px sidebar eats a noticeable chunk of a narrower
  // screen. Starts expanded (matches prior behavior) until storage resolves.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SIDEBAR_COLLAPSED_KEY).then((v) => {
      if (v === '1') setCollapsed(true);
    });
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      AsyncStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  }

  return (
    <View style={styles.desktopRoot}>
      <View
        style={[
          styles.sidebar,
          collapsed && styles.sidebarCollapsed,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom },
        ]}
      >
        <View style={[styles.sidebarBrand, collapsed && styles.sidebarBrandCollapsed]}>
          <Image source={require('../../assets/logo-mark.png')} style={styles.sidebarLogo} resizeMode="contain" />
          {collapsed ? null : (
            <>
              <Text style={styles.sidebarBrandText}>Cantia</Text>
              <View style={{ flex: 1 }} />
              <Pressable onPress={toggleCollapsed} hitSlop={8} style={styles.sidebarToggle}>
                <Feather name="chevrons-left" size={16} color={colors.textMuted} />
              </Pressable>
            </>
          )}
        </View>
        {collapsed ? (
          <Pressable onPress={toggleCollapsed} hitSlop={8} style={styles.sidebarToggleCollapsed}>
            <Feather name="chevrons-right" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <View style={styles.sidebarNav}>
          {sections.map((section, i) => (
            <View key={section.title ?? `s${i}`} style={styles.sidebarSection}>
              {section.title && !collapsed ? <Text style={styles.sidebarSectionTitle}>{section.title}</Text> : null}
              {section.links.map((link) => {
                const active = link.href === activeHref;
                return (
                  <Pressable
                    key={link.href}
                    style={StyleSheet.flatten([
                      styles.sidebarItem,
                      collapsed && styles.sidebarItemCollapsed,
                      active && styles.sidebarItemActive,
                    ])}
                    // Plain Pressable + router.push instead of <Link asChild> — the
                    // asChild/Slot combo can't take an array style on its child
                    // without crashing (see git history), so this sidesteps it.
                    onPress={() => router.push(link.href as any)}
                  >
                    <Feather name={link.icon} size={18} color={active ? colors.primary : colors.textMuted} />
                    {collapsed ? null : (
                      <Text style={StyleSheet.flatten([styles.sidebarItemText, active && styles.sidebarItemTextActive])}>
                        {link.label}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
      <View style={styles.desktopContent}>
        <View style={[styles.desktopTopBar, { paddingTop: insets.top + spacing.sm }]}>
          <AccountMenu />
        </View>
        <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
          <Slot />
        </SafeAreaInsetsContext.Provider>
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
  hamburger: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
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
    flexDirection: 'column',
  },
  sidebarCollapsed: {
    width: 68,
    paddingHorizontal: spacing.sm,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  sidebarBrandCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  sidebarToggle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  sidebarToggleCollapsed: {
    alignSelf: 'center',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
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
    flex: 1,
    gap: spacing.lg,
  },
  sidebarSection: {
    gap: spacing.xs,
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  sidebarItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
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
  desktopTopBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
