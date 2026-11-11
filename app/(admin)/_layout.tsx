import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
import { colors, fontSize, radius, spacing, breakpoints } from '../../lib/theme';
import { BrandLogo, BrandMark } from '../../components/brand/Logo';

// Grouped by what you come to do, in the order you need it: clients first,
// then the two other spaces (fiduciaries, partners), writing to people,
// the product numbers, and Cantia's own books and log. "Comptes" (individual
// users) is not a destination: a member is reached from its company's page.
// Each entry carries one line saying what is in it, shown in the phone
// menu, so nobody has to open a page to find out.
type NavItem = { href: string; label: string; icon: keyof typeof Feather.glyphMap; desc: string; short?: string };
const NAV_GROUPS: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [{ href: '/(admin)', label: 'Tableau de bord', icon: 'home', desc: 'Revenu mensuel, inscriptions et encaissements du moment.' }] },
  {
    title: 'Clients',
    items: [
      { href: '/(admin)/organizations', label: 'Entreprises', icon: 'briefcase', desc: 'Toutes les entreprises inscrites, leur plan, leurs membres et leur activité.' },
      { href: '/(admin)/subscriptions', label: 'Abonnements', icon: 'credit-card', desc: 'Qui paie, qui est en essai, les retards et les motifs de résiliation.' },
      { href: '/(admin)/rentabilite', label: 'Rentabilité', icon: 'trending-up', desc: 'Encaissé, frais Stripe et dépenses de la plateforme.' },
    ],
  },
  {
    title: 'Écosystème',
    items: [
      { href: '/(admin)/fiduciaires', label: 'Fiduciaires', icon: 'shield', desc: 'Cantia Accounting : les cabinets, leurs mandats et leur activité.' },
      { href: '/(admin)/partners', label: 'Partenaires', icon: 'award', desc: 'Cantia Partners : les apporteurs, leurs clients et leurs commissions.' },
    ],
  },
  {
    title: 'Prospection',
    items: [
      { href: '/(admin)/registre', label: 'Nouvelles entreprises', short: 'Prospection', icon: 'search', desc: 'Les entreprises inscrites ces derniers jours au registre du commerce, par canton et par métier.' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { href: '/(admin)/newsletter', label: 'E-mails', icon: 'mail', desc: 'Écrire à vos clients, fiduciaires, partenaires ou à n’importe quelle adresse.' },
      { href: '/(admin)/tutoriels', label: 'Tutoriels', icon: 'video', desc: 'Le plan de tournage des vidéos, chapitre par chapitre.' },
    ],
  },
  {
    title: 'Produit',
    items: [
      { href: '/(admin)/usage', label: 'Utilisation', icon: 'bar-chart-2', desc: 'Les fonctions vraiment utilisées, entreprise par entreprise.' },
      { href: '/(admin)/modules', label: 'Modules', icon: 'grid', desc: 'Ce que contient chaque plan et les modules sur mesure.' },
      { href: '/(admin)/trafic', label: 'Trafic', icon: 'compass', desc: 'D’où viennent les visites et les inscriptions.' },
      { href: '/(admin)/blog-leads', label: 'Blog & leads', icon: 'download', desc: 'Les e-mails captés et ce que rapporte chaque article.' },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { href: '/(admin)/compta', label: 'Comptabilité', icon: 'book', desc: 'Les recettes, dépenses et justificatifs de Cantia.' },
      { href: '/(admin)/logs', label: 'Journal', icon: 'list', desc: 'Tout ce qui se passe : inscriptions, paiements, envois, actions admin.' },
    ],
  },
];
const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
// Phone: the four pages opened most often sit in a bar at the bottom, the
// rest is one tap away under « Plus ».
const TAB_HREFS = ['/(admin)', '/(admin)/organizations', '/(admin)/subscriptions', '/(admin)/newsletter'];
const TAB_LABEL: Record<string, string> = { '/(admin)': 'Accueil' };

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
  const isDesktop = width >= 860;
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

  const current = NAV_ITEMS.find((i) => i.href === activeHref);
  const inTabs = !!activeHref && TAB_HREFS.includes(activeHref);
  const go = (href: string) => {
    setMenuOpen(false);
    router.replace(href as any);
  };

  return (
    <View style={styles.mobileRoot}>
      <View style={[styles.mobileTopBar, { paddingTop: insets.top + spacing.sm }]}>
        <BrandMark size={26} />
        <Text style={styles.mobileTitle} numberOfLines={1}>
          {menuOpen ? 'Toutes les sections' : 'Administration'}
        </Text>
        <View style={[styles.badge, styles.badgeInline]}>
          <Feather name="shield" size={10} color="#fff" />
          <Text style={styles.badgeText}>ADMIN</Text>
        </View>
      </View>

      <View style={styles.mobileContent}>
        {menuOpen ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheet}>
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
                          <Feather name={item.icon} size={17} color={active ? '#fff' : colors.primary} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.sheetLabel}>{item.label}</Text>
                          <Text style={styles.sheetDesc}>{item.desc}</Text>
                        </View>
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
          return (
            <Pressable key={href} style={styles.tab} onPress={() => go(href)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <Feather name={item.icon} size={20} color={active ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
                {TAB_LABEL[href] ?? item.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable style={styles.tab} onPress={() => setMenuOpen((v) => !v)} accessibilityRole="tab" accessibilityState={{ selected: menuOpen || !inTabs }}>
          <Feather name={menuOpen ? 'x' : 'menu'} size={20} color={menuOpen || !inTabs ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, (menuOpen || !inTabs) && styles.tabTextActive]} numberOfLines={1}>
            {!menuOpen && !inTabs && current ? current.short ?? current.label : 'Plus'}
          </Text>
        </Pressable>
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
  mobileTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  sheet: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  sheetGroup: {
    gap: spacing.xs,
  },
  sheetGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  sheetCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sheetRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sheetRowActive: {
    backgroundColor: colors.primarySoft,
  },
  sheetIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIconActive: {
    backgroundColor: colors.primary,
  },
  sheetLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  sheetDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  sheetLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  sheetLogoutText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    minWidth: 0,
  },
  tabText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textMuted,
    maxWidth: '100%',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
