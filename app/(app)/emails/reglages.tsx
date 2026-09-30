import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { AppScreen, Card, EmptyState, PageHeader } from '../../../components/ui';
import { MailboxSettings } from '../../../components/emails/MailboxSettings';
import { FollowupSettings } from '../../../components/emails/FollowupSettings';
import { EmailTemplatesEditor } from '../../../components/emails/EmailTemplatesEditor';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, spacing } from '../../../lib/theme';

// App › E-mails › Réglages: everything about the e-mails in one place. The
// mailbox (what happens to replies), the automatic devis follow-ups and the
// message templates. Replaces Paramètres › Automatisations / › E-mails and
// the old Commercial page (they redirect here).

type Tab = 'boite' | 'relances' | 'modeles';
const TABS: { key: Tab; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'boite', icon: 'inbox' },
  { key: 'relances', icon: 'zap' },
  { key: 'modeles', icon: 'edit-3' },
];

export default function EmailSettingsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { organization, canViewFinances } = useAuth();
  const initial: Tab = TABS.some((x) => x.key === params.tab) ? (params.tab as Tab) : 'boite';
  const [tab, setTab] = useState<Tab>(initial);
  // Tabs stay mounted once opened, so switching never loses an edit.
  const [opened, setOpened] = useState<Set<Tab>>(new Set([initial]));
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);
  const templatesGuard = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    if (!organization) return;
    supabase.rpc('org_has_sales_tracking', { org_id: organization.id }).then(({ data }) => setHasPlan(data === true));
  }, [organization]);

  function open(next: Tab) {
    setTab(next);
    setOpened((s) => new Set(s).add(next));
  }

  const header = (
    <PageHeader title={t('emailHub.settingsTitle')} backTo="/(app)/emails" onBeforeBack={() => templatesGuard.current?.() ?? Promise.resolve(true)} />
  );

  if (!organization || !canViewFinances) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.page}>
          {header}
          <Card>
            <EmptyState title={t('emailHub.title')} subtitle={t('emailHub.noAccess')} />
          </Card>
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.page}>
        {header}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map(({ key, icon }) => {
            const on = key === tab;
            return (
              <Pressable key={key} onPress={() => open(key)} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Feather name={icon} size={15} color={on ? colors.surface : colors.textMuted} />
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{t(`emailHub.settingsTab.${key}`)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Text style={styles.lead}>{t(`emailHub.settingsTabLead.${tab}`)}</Text>
      </View>
      <View style={styles.body}>
        {opened.has('boite') && hasPlan !== null ? (
          <View style={[styles.pane, tab !== 'boite' && styles.hidden]}>
            <MailboxSettings orgId={organization.id} hasPlan={hasPlan} />
          </View>
        ) : null}
        {opened.has('relances') ? (
          <View style={[styles.pane, tab !== 'relances' && styles.hidden]}>
            <FollowupSettings onOpenTemplates={() => open('modeles')} />
          </View>
        ) : null}
        {opened.has('modeles') ? (
          <View style={[styles.pane, tab !== 'modeles' && styles.hidden]}>
            <EmailTemplatesEditor onGuard={(fn) => (templatesGuard.current = fn)} />
          </View>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, width: '100%', maxWidth: 852, alignSelf: 'center', gap: spacing.sm },
  tabs: { gap: spacing.xs },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tabOn: { backgroundColor: colors.text, borderColor: colors.text },
  tabText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  tabTextOn: { color: colors.surface },
  lead: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted },
  body: { flex: 1 },
  pane: { flex: 1 },
  hidden: { display: 'none' },
});
