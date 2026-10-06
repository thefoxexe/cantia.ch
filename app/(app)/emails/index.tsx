import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { extraWorkProjects, listEmailMessages, matchesFilter, matchesSearch, sentByNames, type EmailMessage } from '../../../lib/api/emails';
import { getSalesInboxSettings, listSalesEmails, setSalesEmailRead, updateSalesInboxSettings, type SalesEmail } from '../../../lib/api/salesEmails';
import { supabase } from '../../../lib/supabase';
import { AppScreen, Card, EmptyState, LoadingScreen, PageHeader } from '../../../components/ui';
import { MailRow, type MailItem } from '../../../components/emails/MailParts';
import { MailReader } from '../../../components/emails/MailReader';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// App › E-mails, laid out like a mail client: folders on the left, the
// list in the middle, the message on the right (phones: list, then the
// message full screen). "Réception" holds the clients' replies filed by the
// "suivi des e-mails" address; "Envoyés" every devis / facture / reminder
// sent from Cantia with where it stands. New mail shows up on its own: every
// folder switch and every minute re-read the lists, without a spinner.
// Réglages (mailbox, follow-ups, templates) is its own page, ./reglages.

type Folder = 'inbox' | 'sent' | 'watch' | 'reminders' | 'devis' | 'factures';
const MAIN_FOLDERS: { key: Folder; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'inbox', icon: 'inbox' },
  { key: 'sent', icon: 'send' },
  { key: 'watch', icon: 'alert-circle' },
  { key: 'reminders', icon: 'repeat' },
];
const LABEL_FOLDERS: { key: Folder; color: string }[] = [
  { key: 'devis', color: '#A95C30' },
  { key: 'factures', color: '#3E6B5A' },
];

function folderItems(folder: Folder, sent: EmailMessage[], received: SalesEmail[], filedOut: SalesEmail[] = []): MailItem[] {
  const s = (list: EmailMessage[]): MailItem[] => list.map((m) => ({ type: 'sent', id: `s:${m.id}`, at: m.sent_at, m }));
  const r = (list: SalesEmail[]): MailItem[] => list.map((e) => ({ type: 'received', id: `r:${e.id}`, at: e.occurred_at, e }));
  let items: MailItem[];
  switch (folder) {
    case 'inbox':
      items = r(received);
      break;
    case 'sent':
      // Sent from Cantia, and the copies of your own e-mails (Cc / Cci).
      items = [...s(sent), ...r(filedOut)];
      break;
    case 'watch':
      items = s(sent.filter((m) => matchesFilter(m, 'watch')));
      break;
    case 'reminders':
      items = s(sent.filter((m) => matchesFilter(m, 'reminders')));
      break;
    case 'devis':
      items = [...s(sent.filter((m) => matchesFilter(m, 'devis'))), ...r(received.filter((e) => e.devis_id))];
      break;
    case 'factures':
      items = [...s(sent.filter((m) => matchesFilter(m, 'factures'))), ...r(received.filter((e) => e.facture_id))];
      break;
  }
  return items.sort((a, b) => (a.at < b.at ? 1 : -1));
}

function itemMatches(item: MailItem, q: string): boolean {
  if (!q.trim()) return true;
  if (item.type === 'sent') return matchesSearch(item.m, q);
  const e = item.e;
  const needle = q.trim().toLowerCase();
  return [e.from_email, e.counterpart_email, e.subject, e.snippet, e.devis?.number, e.devis?.client_name, e.facture?.number].some((v) => (v ?? '').toLowerCase().includes(needle));
}

export default function EmailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  // id: a sent e-mail (from a devis / facture); r: a received one (from a
  // "Nouvel e-mail" notification).
  const params = useLocalSearchParams<{ id?: string; r?: string }>();
  const { organization, canViewFinances } = useAuth();
  const { width, height } = useWindowDimensions();
  const threePanes = width >= 1180;
  const twoPanes = width >= 960;

  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<EmailMessage[]>([]);
  const [received, setReceived] = useState<SalesEmail[]>([]);
  const [filedOut, setFiledOut] = useState<SalesEmail[]>([]);
  const [hasPlan, setHasPlan] = useState(true);
  // null until known; false: the Cantia mailbox is switched off (replies go
  // straight to the company address, nothing is filed here).
  const [mailboxOn, setMailboxOn] = useState<boolean | null>(null);
  const [enabling, setEnabling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const lastLoad = useRef(0);
  const [names, setNames] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [folder, setFolder] = useState<Folder | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(params.r ? `r:${params.r}` : params.id ? `s:${params.id}` : null);

  const load = useCallback(async () => {
    if (!organization || !canViewFinances) {
      setLoading(false);
      return;
    }
    lastLoad.current = Date.now();
    const [rows, filed, plan] = await Promise.all([
      listEmailMessages(organization.id),
      listSalesEmails(organization.id, { limit: 300 }),
      supabase.rpc('org_has_sales_tracking', { org_id: organization.id }),
    ]);
    setSent(rows);
    setReceived(filed.filter((e) => e.direction === 'incoming'));
    setFiledOut(filed.filter((e) => e.direction === 'outgoing'));
    setHasPlan(plan.data === true);
    setLoading(false);
    if (plan.data === true) getSalesInboxSettings(organization.id).then((s) => setMailboxOn(s?.enabled ?? false));
    const [who, where] = await Promise.all([
      sentByNames(organization.id, rows.map((m) => m.sent_by ?? '')),
      extraWorkProjects(rows.filter((m) => m.document_type === 'extra_work').map((m) => m.document_id)),
    ]);
    setNames(who);
    setProjects(where);
  }, [organization, canViewFinances]);

  // Silent re-read (button, folder switch, every minute while open).
  const refresh = useCallback(
    async (force = true) => {
      if (!force && Date.now() - lastLoad.current < 5000) return;
      setRefreshing(true);
      try {
        await load();
      } finally {
        setRefreshing(false);
      }
    },
    [load],
  );

  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(() => refresh(false), 60_000);
      return () => clearInterval(timer);
    }, [load, refresh]),
  );

  // Esc leaves full screen (web).
  useEffect(() => {
    if (!fullscreen || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  useEffect(() => {
    if (params.r) {
      setFolder('inbox');
      setSelectedId(`r:${params.r}`);
    } else if (params.id) setSelectedId(`s:${params.id}`);
  }, [params.id, params.r]);

  // The mailbox opens on what was received, like any inbox.
  const activeFolder: Folder = folder ?? (params.id ? 'sent' : 'inbox');
  const items = useMemo(() => folderItems(activeFolder, sent, received, filedOut).filter((i) => itemMatches(i, search)), [activeFolder, sent, received, filedOut, search]);
  const counts = useMemo(
    () => ({
      inbox: received.filter((e) => !e.read_at).length,
      watch: sent.filter((m) => matchesFilter(m, 'watch')).length,
    }),
    [sent, received],
  );
  const stats = useMemo(() => {
    const recent = sent.filter((m) => Date.now() - new Date(m.sent_at).getTime() < 30 * 86400000);
    const pct = (n: number) => (recent.length ? `${Math.round((n / recent.length) * 100)} %` : '—');
    return {
      sent: String(recent.length),
      delivered: pct(recent.filter((m) => !m.bounced_at && (m.delivered_at || m.opened_at || m.viewed_at || m.replied_at)).length),
      opened: pct(recent.filter((m) => m.opened_at || m.clicked_at || m.viewed_at || m.replied_at).length),
    };
  }, [sent]);

  const all = useMemo(() => [...folderItems('sent', sent, [], filedOut), ...folderItems('inbox', [], received)], [sent, received, filedOut]);

  // Opening a received e-mail marks it read.
  const setRead = useCallback((id: string, read: boolean) => {
    const at = read ? new Date().toISOString() : null;
    setReceived((list) => list.map((e) => (e.id === id ? { ...e, read_at: at } : e)));
    setSalesEmailRead(id, read);
  }, []);
  const open = useCallback(
    (item: MailItem) => {
      setSelectedId(item.id);
      if (item.type === 'received' && !item.e.read_at) setRead(item.e.id, true);
    },
    [setRead],
  );
  const selected = all.find((i) => i.id === selectedId) ?? null;
  // Opened from a notification: marked read like a click in the list.
  const selectedUnread = selected?.type === 'received' && !selected.e.read_at ? selected.e.id : null;
  useEffect(() => {
    if (selectedUnread) setRead(selectedUnread, true);
  }, [selectedUnread, setRead]);

  if (loading) return <LoadingScreen />;

  if (!canViewFinances) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.page}>
          <PageHeader title={t('emailHub.title')} backTo="/(app)" />
          <Card>
            <EmptyState title={t('emailHub.title')} subtitle={t('emailHub.noAccess')} />
          </Card>
        </ScrollView>
      </AppScreen>
    );
  }

  const orgName = organization?.name ?? 'Cantia';
  const related =
    selected?.type === 'received'
      ? sent.find((m) => (selected.e.devis_id && m.document_id === selected.e.devis_id) || (selected.e.facture_id && m.document_id === selected.e.facture_id)) ?? null
      : null;
  const reader = selected ? (
    <MailReader
      key={selected.id}
      item={selected}
      orgId={organization!.id}
      orgName={orgName}
      senderNames={names}
      projects={projects}
      related={related}
      onBack={twoPanes ? undefined : () => setSelectedId(null)}
      onResent={load}
      onMarkUnread={
        selected.type === 'received'
          ? () => {
              setRead(selected.e.id, false);
              setSelectedId(null);
            }
          : undefined
      }
    />
  ) : null;
  const openSettings = () => {
    setFullscreen(false);
    setDrawer(false);
    router.push('/(app)/emails/reglages' as any);
  };
  const pickFolder = (key: Folder) => {
    setFolder(key);
    setSelectedId(null);
    setDrawer(false);
    refresh(false);
  };

  const statsLine = sent.length ? <Text style={styles.stats}>{t('emailHub.statsLine', stats)}</Text> : null;
  const folderLabel = (f: Folder) => (f === 'devis' || f === 'factures' ? t(`emailHub.label.${f}`) : t(`emailHub.folder.${f}`));
  const badge = (f: Folder) => (f === 'inbox' ? counts.inbox : f === 'watch' ? counts.watch : 0);

  const sidebar = (
    <View style={styles.sidebar}>
      {MAIN_FOLDERS.map(({ key, icon }) => {
        const on = key === activeFolder;
        return (
          <Pressable key={key} onPress={() => pickFolder(key)} style={[styles.folder, on && styles.folderOn]}>
            <Feather name={icon} size={16} color={on ? colors.primaryDark : colors.textMuted} />
            <Text style={[styles.folderText, on && styles.folderTextOn]}>{folderLabel(key)}</Text>
            {badge(key) ? <Text style={[styles.folderCount, key === 'watch' && { color: colors.danger }]}>{badge(key)}</Text> : null}
          </Pressable>
        );
      })}
      <Text style={styles.sideTitle}>{t('emailHub.labels')}</Text>
      {LABEL_FOLDERS.map(({ key, color }) => {
        const on = key === activeFolder;
        return (
          <Pressable key={key} onPress={() => pickFolder(key)} style={[styles.folder, on && styles.folderOn]}>
            <View style={[styles.labelDot, { backgroundColor: color }]} />
            <Text style={[styles.folderText, on && styles.folderTextOn]}>{folderLabel(key)}</Text>
          </Pressable>
        );
      })}
      <View style={{ flex: 1 }} />
      <Pressable onPress={openSettings} style={styles.folder}>
        <Feather name="settings" size={16} color={colors.textMuted} />
        <Text style={styles.folderText}>{t('emailHub.settingsTitle')}</Text>
      </Pressable>
      {statsLine}
    </View>
  );

  const searchBox = (
    <View style={styles.searchBox}>
      <Feather name="search" size={15} color={colors.textMuted} />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={t('emailHub.searchPlaceholder')}
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {search ? (
        <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel={t('emailHub.cancel')}>
          <Feather name="x" size={15} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );

  async function enableMailbox() {
    if (!organization) return;
    setEnabling(true);
    const { error } = await updateSalesInboxSettings(organization.id, { enabled: true });
    setEnabling(false);
    if (!error) setMailboxOn(true);
  }
  // Inbox switched off (or no plan): say it plainly, with the way out.
  const inboxNotice =
    activeFolder === 'inbox' && (!hasPlan || mailboxOn === false) ? (
      <View style={styles.notice}>
        <Feather name="inbox" size={18} color={colors.primaryDark} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.noticeTitle}>{hasPlan ? t('emailHub.inboxOffTitle') : t('emailHub.planTitle')}</Text>
          <Text style={styles.noticeText}>{hasPlan ? t('emailHub.inboxOffText') : t('emailHub.planText')}</Text>
          {hasPlan ? (
            <Pressable onPress={enableMailbox} disabled={enabling} style={styles.noticeBtn} accessibilityRole="button">
              <Text style={styles.noticeBtnText}>{enabling ? '…' : t('emailHub.inboxOffCta')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    ) : null;
  const emptyList =
    activeFolder === 'inbox' && received.length === 0 ? (
      inboxNotice ? null : <EmptyState title={t('emailHub.inboxEmptyTitle')} subtitle={t('emailHub.inboxEmptyText')} />
    ) : sent.length === 0 && received.length === 0 ? (
      <EmptyState title={t('emailHub.emptyTitle')} subtitle={t('emailHub.emptyText')} />
    ) : (
      <Text style={styles.emptyFilter}>{t('emailHub.emptyFilter')}</Text>
    );
  const rows = (
    <>
      {inboxNotice}
      {items.length ? items.map((i) => <MailRow key={i.id} item={i} selected={twoPanes && i.id === selectedId} onPress={() => open(i)} />) : emptyList}
    </>
  );

  const settingsBtn = (
    <Pressable onPress={openSettings} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel={t('emailHub.settingsTitle')}>
      <Feather name="settings" size={14} color={colors.text} />
      <Text style={styles.headerBtnText}>{t('emailHub.settingsShort')}</Text>
    </Pressable>
  );
  const refreshBtn = (
    <Pressable onPress={() => refresh()} disabled={refreshing} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('emailHub.refresh')}>
      {refreshing ? <ActivityIndicator size="small" color={colors.textMuted} /> : <Feather name="refresh-cw" size={15} color={colors.text} />}
    </Pressable>
  );
  const fullscreenBtn = (
    <Pressable
      onPress={() => setFullscreen((f) => !f)}
      style={styles.iconBtn}
      accessibilityRole="button"
      accessibilityLabel={fullscreen ? t('emailHub.exitFullscreen') : t('emailHub.fullscreen')}
    >
      <Feather name={fullscreen ? 'minimize-2' : 'maximize-2'} size={15} color={colors.text} />
    </Pressable>
  );

  // Folder tabs, for screens without the sidebar.
  const chips = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {[...MAIN_FOLDERS.map((f) => f.key), ...LABEL_FOLDERS.map((f) => f.key)].map((key) => {
        const on = key === activeFolder;
        return (
          <Pressable key={key} onPress={() => pickFolder(key)} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{folderLabel(key)}</Text>
            {badge(key) ? <Text style={[styles.chipCount, on && styles.chipTextOn, key === 'watch' && !on && { color: colors.danger }]}>{badge(key)}</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // Phone, like Gmail: a search bar holding the folder menu and the
  // refresh, the list below, the message full screen once opened.
  if (!twoPanes) {
    if (reader) return <AppScreen>{reader}</AppScreen>;
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.phone} stickyHeaderIndices={[0]}>
          <View style={styles.phoneTop}>
            <View style={styles.phoneSearch}>
              <Pressable onPress={() => setDrawer(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('emailHub.folders')}>
                <Feather name="menu" size={20} color={colors.text} />
              </Pressable>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t('emailHub.searchMail')}
                placeholderTextColor={colors.textMuted}
                style={styles.phoneSearchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {search ? (
                <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel={t('emailHub.cancel')}>
                  <Feather name="x" size={18} color={colors.textMuted} />
                </Pressable>
              ) : (
                <Pressable onPress={() => refresh()} disabled={refreshing} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('emailHub.refresh')}>
                  {refreshing ? <ActivityIndicator size="small" color={colors.textMuted} /> : <Feather name="refresh-cw" size={18} color={colors.text} />}
                </Pressable>
              )}
            </View>
          </View>
          <View style={styles.phoneFolderRow}>
            <Text style={styles.phoneFolder}>{folderLabel(activeFolder)}</Text>
            {badge(activeFolder) ? <Text style={styles.phoneFolderCount}>{badge(activeFolder)}</Text> : null}
          </View>
          <View style={styles.phoneList}>{rows}</View>
        </ScrollView>
        <Modal visible={drawer} transparent animationType="fade" onRequestClose={() => setDrawer(false)}>
          <View style={styles.drawerWrap}>
            <View style={styles.drawer}>
              <View style={styles.drawerHead}>
                <Text style={styles.drawerTitle}>{t('emailHub.title')}</Text>
                <Pressable onPress={() => router.push('/(app)' as any)} hitSlop={8} accessibilityLabel={t('nav.home')}>
                  <Feather name="home" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{sidebar}</ScrollView>
            </View>
            <Pressable style={styles.drawerScrim} onPress={() => setDrawer(false)} accessibilityLabel={t('emailHub.cancel')} />
          </View>
        </Modal>
      </AppScreen>
    );
  }

  const listPane = (
    <View style={[styles.listPane, !threePanes && { borderLeftWidth: 0 }]}>
      <View style={styles.listHead}>
        <View style={styles.listTitleRow}>
          <Text style={styles.listTitle}>{folderLabel(activeFolder)}</Text>
          {refreshBtn}
          {fullscreenBtn}
        </View>
        {threePanes ? null : statsLine}
        {searchBox}
      </View>
      <ScrollView style={{ flex: 1 }}>{rows}</ScrollView>
    </View>
  );
  const readerPane = (
    <View style={styles.readerPane}>
      {reader ?? (
        <View style={styles.placeholder}>
          <Feather name="mail" size={34} color={colors.border} />
          <Text style={styles.placeholderText}>{t('emailHub.selectPrompt')}</Text>
        </View>
      )}
    </View>
  );

  // Full screen: the mail client over the whole window, like a real app.
  if (fullscreen) {
    return (
      <Modal visible transparent={false} animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <View style={[styles.client, styles.clientFull, { height }]}>
          {sidebar}
          {listPane}
          {readerPane}
        </View>
      </Modal>
    );
  }

  const paneHeight = Math.max(560, height - 150);
  return (
    <AppScreen>
      <View style={styles.page}>
        <PageHeader title={t('emailHub.title')} backTo="/(app)" right={settingsBtn} />
        {threePanes ? null : chips}
        <View style={[styles.client, { height: paneHeight }]}>
          {threePanes ? sidebar : null}
          {listPane}
          {readerPane}
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.xl, paddingBottom: spacing.lg, width: '100%', maxWidth: 1440, alignSelf: 'center' },
  phone: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl * 2, gap: spacing.sm },
  phoneList: { marginHorizontal: -spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: colors.surface },
  headerBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  client: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  sidebar: { width: 230, backgroundColor: colors.bg, padding: spacing.sm, paddingTop: spacing.md, gap: 2 },
  folder: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 },
  folderOn: { backgroundColor: colors.primarySoft },
  folderText: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  folderTextOn: { fontWeight: '800', color: colors.primaryDark },
  folderCount: { fontSize: 12, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  sideTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted, marginTop: spacing.md, marginBottom: 4, paddingHorizontal: 10 },
  labelDot: { width: 10, height: 10, borderRadius: 3, marginHorizontal: 3 },
  stats: { fontSize: 11.5, color: colors.textMuted, paddingHorizontal: 10, paddingVertical: 4, fontVariant: ['tabular-nums'] },
  listPane: { width: 390, borderLeftWidth: 1, borderLeftColor: colors.border, borderRightWidth: 1, borderRightColor: colors.border },
  listHead: { padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  listTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  listTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  clientFull: { borderRadius: 0, borderWidth: 0 },
  phoneTop: { paddingTop: spacing.sm, paddingBottom: spacing.sm, backgroundColor: colors.bg },
  phoneSearch: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 4, backgroundColor: colors.surfaceAlt },
  phoneSearchInput: { flex: 1, paddingVertical: 10, fontSize: fontSize.md, color: colors.text, outlineStyle: 'none' } as any,
  phoneFolderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 4, paddingTop: spacing.xs },
  phoneFolder: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted },
  phoneFolderCount: { fontSize: 11, fontWeight: '800', color: colors.primaryDark, backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1, overflow: 'hidden' },
  drawerWrap: { flex: 1, flexDirection: 'row' },
  drawer: { width: '82%', maxWidth: 320, backgroundColor: colors.bg, paddingTop: spacing.lg },
  drawerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md + 4, paddingBottom: spacing.sm },
  drawerTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  drawerScrim: { flex: 1, backgroundColor: 'rgba(20,16,12,0.35)' },
  readerPane: { flex: 1, minWidth: 0 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  placeholderText: { fontSize: fontSize.sm, color: colors.textMuted },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 999, paddingHorizontal: spacing.md, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: fontSize.sm, color: colors.text, outlineStyle: 'none' } as any,
  chips: { gap: spacing.xs, paddingBottom: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  chipTextOn: { color: colors.surface },
  chipCount: { fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted },
  notice: { flexDirection: 'row', gap: spacing.sm, margin: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.border },
  noticeTitle: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  noticeText: { fontSize: 12.5, lineHeight: 18, color: colors.textMuted },
  noticeBtn: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.text, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 12 },
  noticeBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: '#FFFFFF' },
  emptyFilter: { fontSize: fontSize.sm, color: colors.textMuted, padding: spacing.lg, textAlign: 'center' },
});
