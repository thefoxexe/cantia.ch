import { useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { isModuleEnabled } from '../../../lib/modules';
import { helpHref } from '../../../lib/appHost';
import { PageHeader, AppScreen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { openPartnerSpace, PARTNERS_URL } from '../../../lib/api/partners';

type IconName = keyof typeof Feather.glyphMap;
type MenuKey =
  | 'entreprise'
  | 'partenaires'
  | 'fiduciaire'
  | 'devis'
  | 'emails'
  | 'equipe'
  | 'facturation'
  | 'integrations'
  | 'modules'
  | 'notifications'
  | 'apparence'
  | 'stockage'
  | 'profil'
  | 'aide'
  | 'danger'
  | 'entrepriseDanger'
  | 'rh'
  | 'automatisations'
  | 'import';

interface MenuItem {
  href: string;
  icon: IconName;
  key: MenuKey;
  external?: boolean;
}

interface MenuSection {
  id: string;
  titleKey: string;
  descriptionKey: string;
  danger?: boolean;
  items: MenuItem[];
}

// Settings as one readable page, November 2026: plain sections (no
// accordions to open), each a short heading and a card of rows, the way the
// public site lists things. A search on top filters every row; on a
// computer a column on the left jumps to each section. Same pages as before,
// only grouped by what people look for.
const ITEMS = {
  profil: { href: '/(app)/compte/profil', icon: 'user', key: 'profil' },
  notifications: { href: '/(app)/compte/notifications', icon: 'bell', key: 'notifications' },
  aide: { href: helpHref(), icon: 'help-circle', key: 'aide', external: true },
  partenaires: { href: PARTNERS_URL, icon: 'gift', key: 'partenaires', external: true },
  danger: { href: '/(app)/compte/danger', icon: 'user-x', key: 'danger' },
  entreprise: { href: '/(app)/compte/entreprise', icon: 'home', key: 'entreprise' },
  apparence: { href: '/(app)/compte/apparence', icon: 'droplet', key: 'apparence' },
  devis: { href: '/(app)/compte/devis', icon: 'file-text', key: 'devis' },
  emails: { href: '/(app)/emails/reglages?tab=modeles', icon: 'mail', key: 'emails' },
  facturation: { href: '/(app)/compte/facturation', icon: 'credit-card', key: 'facturation' },
  stockage: { href: '/(app)/compte/stockage', icon: 'hard-drive', key: 'stockage' },
  import: { href: '/(app)/compte/import', icon: 'upload-cloud', key: 'import' },
  entrepriseDanger: { href: '/(app)/compte/entreprise-danger', icon: 'alert-triangle', key: 'entrepriseDanger' },
  modules: { href: '/(app)/compte/modules', icon: 'toggle-right', key: 'modules' },
  integrations: { href: '/(app)/compte/integrations', icon: 'link', key: 'integrations' },
  // Cantia Accounting: owners and admins decide what their fiduciary sees;
  // everyone who handles the money answers its document requests there.
  fiduciaire: { href: '/(app)/compte/fiduciaire', icon: 'shield', key: 'fiduciaire' },
  rh: { href: '/(app)/compte/rh', icon: 'dollar-sign', key: 'rh' },
  // Relances de devis, rapports, synchronisations: finance members only,
  // same gate as the page itself.
  automatisations: { href: '/(app)/emails/reglages?tab=relances', icon: 'zap', key: 'automatisations' },
  equipe: { href: '/(app)/compte/equipe', icon: 'users', key: 'equipe' },
} satisfies Record<MenuKey, MenuItem>;

export default function CompteIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, canManagePayroll, canViewFinances } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 1100;
  const [query, setQuery] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});

  // RH & Salaires only means something once payroll is on the org's plan
  // and this member may touch it; the fiduciary and the automations follow
  // the finance permission, like their pages.
  const sections = useMemo(() => {
    const payroll = canManagePayroll && isModuleEnabled(organization?.enabled_modules, 'payroll');
    const raw: MenuSection[] = [
      { id: 'account', titleKey: 'compteMenu.secAccount', descriptionKey: 'compteMenu.secAccountDesc', items: [ITEMS.profil, ITEMS.notifications] },
      { id: 'company', titleKey: 'compteMenu.secCompany', descriptionKey: 'compteMenu.secCompanyDesc', items: [ITEMS.entreprise, ITEMS.apparence, ITEMS.devis, ITEMS.emails, ITEMS.import] },
      { id: 'team', titleKey: 'compteMenu.secTeam', descriptionKey: 'compteMenu.secTeamDesc', items: [ITEMS.equipe, ...(payroll ? [ITEMS.rh] : [])] },
      { id: 'billing', titleKey: 'compteMenu.secBilling', descriptionKey: 'compteMenu.secBillingDesc', items: [ITEMS.facturation, ITEMS.stockage, ...(canViewFinances ? [ITEMS.fiduciaire] : [])] },
      { id: 'tools', titleKey: 'compteMenu.secTools', descriptionKey: 'compteMenu.secToolsDesc', items: [ITEMS.modules, ITEMS.integrations, ...(canViewFinances ? [ITEMS.automatisations] : [])] },
      { id: 'help', titleKey: 'compteMenu.secHelp', descriptionKey: 'compteMenu.secHelpDesc', items: [ITEMS.aide, ITEMS.partenaires] },
      { id: 'danger', titleKey: 'compteMenu.secDanger', descriptionKey: 'compteMenu.secDangerDesc', danger: true, items: [ITEMS.danger, ITEMS.entrepriseDanger] },
    ];
    return raw.map((sec) => ({
      ...sec,
      title: t(sec.titleKey as any),
      description: t(sec.descriptionKey as any),
      items: sec.items.map((item) => ({ ...item, label: t(`compteMenu.${item.key}.label`), description: t(`compteMenu.${item.key}.description`) })),
    }));
  }, [canManagePayroll, canViewFinances, organization?.enabled_modules, t]);

  const q = query.trim().toLowerCase();
  const matches = (item: { label: string; description: string }) => !q || item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  const shown = sections.map((sec) => ({ ...sec, items: sec.items.filter(matches) })).filter((sec) => sec.items.length > 0);

  function openItem(item: { href: string; external?: boolean }) {
    // Cantia Partners: signed straight in with the same account.
    if (item.href === PARTNERS_URL) openPartnerSpace();
    else if (item.external) Linking.openURL(item.href);
    else router.push(item.href as any);
  }

  function jumpTo(id: string) {
    const y = sectionY.current[id];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  }

  const search = (
    <View style={styles.searchBar}>
      <Feather name="search" size={16} color={colors.textMuted} />
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder={t('compteMenu.searchPlaceholder')}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />
      {query ? (
        <Pressable onPress={() => setQuery('')} hitSlop={8}>
          <Feather name="x" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );

  const list =
    shown.length === 0 ? (
      <Text style={styles.empty}>{t('compteMenu.noResults', { query })}</Text>
    ) : (
      <View style={{ gap: spacing.xxl }}>
        {shown.map((sec) => (
          <View key={sec.id} onLayout={(e) => (sectionY.current[sec.id] = e.nativeEvent.layout.y)}>
            <Text style={[styles.sectionTitle, sec.danger && { color: colors.danger }]}>{sec.title}</Text>
            <Text style={styles.sectionDesc}>{sec.description}</Text>
            <View style={[styles.card, sec.danger && { borderColor: colors.dangerSoft }]}>
              {sec.items.map((item, i) => (
                <Pressable
                  key={item.href}
                  onPress={() => openItem(item)}
                  accessibilityRole={item.external ? 'link' : 'button'}
                  style={({ hovered }: any) => [styles.row, i > 0 && styles.rowBorder, hovered && styles.rowHovered]}
                >
                  <View style={[styles.iconBadge, sec.danger && { backgroundColor: colors.dangerSoft }]}>
                    <Feather name={item.icon} size={16} color={sec.danger ? colors.danger : colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.label, sec.danger && { color: colors.danger }]}>{item.label}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                  <Feather name={item.external ? 'arrow-up-right' : 'chevron-right'} size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    );

  return (
    <AppScreen>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.page, !wide && { padding: spacing.lg }]}>
        <PageHeader title={t('compteMenu.title')} subtitle={organization?.name ?? undefined} backTo="/(app)" />
        {wide ? (
          <View style={styles.split}>
            {/* Contents of the page: one click to each section. */}
            <View style={styles.nav}>
              {search}
              <Text style={styles.navLabel}>{t('compteMenu.jumpTo')}</Text>
              {sections.map((sec) => (
                <Pressable key={sec.id} onPress={() => jumpTo(sec.id)} style={({ hovered }: any) => [styles.navItem, hovered && styles.navItemHover]}>
                  <Text style={[styles.navText, sec.danger && { color: colors.danger }]}>{sec.title}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>{list}</View>
          </View>
        ) : (
          <>
            {search}
            {list}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.xl, paddingBottom: spacing.xxl * 3, maxWidth: 1080, width: '100%', alignSelf: 'center' },
  split: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxl },
  nav: { width: 250, gap: 2, position: 'sticky' as any, top: spacing.lg },
  navLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.xs, paddingHorizontal: spacing.sm },
  navItem: { paddingVertical: 8, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  navItemHover: { backgroundColor: colors.surfaceAlt },
  navText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  empty: { fontSize: fontSize.sm, color: colors.textMuted, paddingVertical: spacing.xl, textAlign: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: colors.primary },
  sectionDesc: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14, paddingHorizontal: spacing.lg },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowHovered: { backgroundColor: colors.surfaceAlt },
  iconBadge: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  description: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2, lineHeight: 19 },
});
