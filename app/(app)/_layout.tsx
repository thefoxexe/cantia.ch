import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth-context';
import { isModuleEnabled } from '../../lib/modules';
import { colors, fontSize, radius, spacing, breakpoints } from '../../lib/theme';
import { AccountMenu } from '../../components/AccountMenu';
import { NavDrawer, type NavSection } from '../../components/NavDrawer';

function buildSections(devisEnabled: boolean, planningEnabled: boolean): NavSection[] {
  return [
    { links: [{ href: '/(app)', label: 'Accueil', icon: 'home' }] },
    { title: 'CHANTIERS', links: [{ href: '/(app)/chantiers', label: 'Chantiers', icon: 'layers' }] },
    ...(devisEnabled
      ? [
          {
            title: 'FACTURATION',
            links: [
              { href: '/(app)/clients', label: 'Clients', icon: 'users' as const },
              { href: '/(app)/devis', label: 'Devis', icon: 'file-text' as const },
              { href: '/(app)/devis/factures', label: 'Factures', icon: 'dollar-sign' as const },
              { href: '/(app)/devis/inventaire', label: 'Inventaire', icon: 'box' as const },
            ],
          },
        ]
      : []),
    ...(planningEnabled
      ? [{ title: 'ÉQUIPE', links: [{ href: '/(app)/planning', label: 'Planning', icon: 'calendar' as const }] }]
      : []),
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
  const { organization } = useAuth();
  const devisEnabled = isModuleEnabled(organization?.enabled_modules, 'devis');
  const planningEnabled = isModuleEnabled(organization?.enabled_modules, 'planning');
  const sections = buildSections(devisEnabled, planningEnabled);

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

function DesktopShell({ sections }: { sections: NavSection[] }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const activeHref = activeHrefFor(pathname, sections);

  return (
    <View style={styles.desktopRoot}>
      <View style={[styles.sidebar, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom }]}>
        <View style={styles.sidebarBrand}>
          <Image source={require('../../assets/logo-mark.png')} style={styles.sidebarLogo} resizeMode="contain" />
          <Text style={styles.sidebarBrandText}>Cantia</Text>
        </View>
        <View style={styles.sidebarNav}>
          {sections.map((section, i) => (
            <View key={section.title ?? `s${i}`} style={styles.sidebarSection}>
              {section.title ? <Text style={styles.sidebarSectionTitle}>{section.title}</Text> : null}
              {section.links.map((link) => {
                const active = link.href === activeHref;
                return (
                  <Pressable
                    key={link.href}
                    style={StyleSheet.flatten([styles.sidebarItem, active && styles.sidebarItemActive])}
                    // Plain Pressable + router.push instead of <Link asChild> — the
                    // asChild/Slot combo can't take an array style on its child
                    // without crashing (see git history), so this sidesteps it.
                    onPress={() => router.push(link.href as any)}
                  >
                    <Feather name={link.icon} size={18} color={active ? colors.primary : colors.textMuted} />
                    <Text style={StyleSheet.flatten([styles.sidebarItemText, active && styles.sidebarItemTextActive])}>
                      {link.label}
                    </Text>
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
