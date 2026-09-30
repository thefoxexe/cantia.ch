import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { extraWorkProjects, listEmailMessages, matchesFilter, matchesSearch, sentByNames, type EmailMessage } from '../../../lib/api/emails';
import { listSalesEmails, type SalesEmail } from '../../../lib/api/salesEmails';
import { AppScreen, Card, EmptyState, LoadingScreen, PageHeader } from '../../../components/ui';
import { MailRow, isFresh, type MailItem } from '../../../components/emails/MailParts';
import { MailReader } from '../../../components/emails/MailReader';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// App › E-mails, laid out like a mail client: folders on the left, the
// list in the middle, the message on the right (phones: list, then the
// message full screen). "Réception" holds the clients' replies filed by the
// "suivi des e-mails" address; "Envoyés" every devis / facture / reminder
// sent from Cantia with where it stands. The "Boîtes connectées" block is
// where Gmail / Outlook will plug in.

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

function folderItems(folder: Folder, sent: EmailMessage[], received: SalesEmail[]): MailItem[] {
  const s = (list: EmailMessage[]): MailItem[] => list.map((m) => ({ type: 'sent', id: `s:${m.id}`, at: m.sent_at, m }));
  const r = (list: SalesEmail[]): MailItem[] => list.map((e) => ({ type: 'received', id: `r:${e.id}`, at: e.occurred_at, e }));
  let items: MailItem[];
  switch (folder) {
    case 'inbox':
      items = r(received);
      break;
    case 'sent':
      items = s(sent);
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
  const params = useLocalSearchParams<{ id?: string }>();
  const { organization, canViewFinances } = useAuth();
  const { width, height } = useWindowDimensions();
  const threePanes = width >= 1180;
  const twoPanes = width >= 960;

  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<EmailMessage[]>([]);
  const [received, setReceived] = useState<SalesEmail[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [folder, setFolder] = useState<Folder | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(params.id ? `s:${params.id}` : null);

  const load = useCallback(async () => {
    if (!organization || !canViewFinances) {
      setLoading(false);
      return;
    }
    const [rows, filed] = await Promise.all([listEmailMessages(organization.id), listSalesEmails(organization.id, { limit: 300 })]);
    setSent(rows);
    setReceived(filed.filter((e) => e.direction === 'incoming'));
    setLoading(false);
    const [who, where] = await Promise.all([
      sentByNames(organization.id, rows.map((m) => m.sent_by ?? '')),
      extraWorkProjects(rows.filter((m) => m.document_type === 'extra_work').map((m) => m.document_id)),
    ]);
    setNames(who);
    setProjects(where);
  }, [organization, canViewFinances]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (params.id) setSelectedId(`s:${params.id}`);
  }, [params.id]);

  // Opens on the inbox when clients have replied, else on the sent e-mails.
  const activeFolder: Folder = folder ?? (params.id || received.length === 0 ? 'sent' : 'inbox');
  const items = useMemo(() => folderItems(activeFolder, sent, received).filter((i) => itemMatches(i, search)), [activeFolder, sent, received, search]);
  const counts = useMemo(
    () => ({
      inbox: received.filter((e) => isFresh(e.occurred_at)).length,
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

  const all = useMemo(() => [...folderItems('sent', sent, []), ...folderItems('inbox', [], received)], [sent, received]);
  const selected = all.find((i) => i.id === selectedId) ?? null;

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
    />
  ) : null;

  const statsLine = sent.length ? <Text style={styles.stats}>{t('emailHub.statsLine', stats)}</Text> : null;
  const folderLabel = (f: Folder) => (f === 'devis' || f === 'factures' ? t(`emailHub.label.${f}`) : t(`emailHub.folder.${f}`));
  const badge = (f: Folder) => (f === 'inbox' ? counts.inbox : f === 'watch' ? counts.watch : 0);

  const sidebar = (
    <View style={styles.sidebar}>
      {MAIN_FOLDERS.map(({ key, icon }) => {
        const on = key === activeFolder;
        return (
          <Pressable key={key} onPress={() => { setFolder(key); setSelectedId(null); }} style={[styles.folder, on && styles.folderOn]}>
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
          <Pressable key={key} onPress={() => { setFolder(key); setSelectedId(null); }} style={[styles.folder, on && styles.folderOn]}>
            <View style={[styles.labelDot, { backgroundColor: color }]} />
            <Text style={[styles.folderText, on && styles.folderTextOn]}>{folderLabel(key)}</Text>
          </Pressable>
        );
      })}
      <Text style={styles.sideTitle}>{t('emailHub.connected')}</Text>
      {['Gmail', 'Outlook'].map((name) => (
        <View key={name} style={styles.connect}>
          <Feather name="mail" size={15} color={colors.textMuted} />
          <Text style={styles.connectName}>{name}</Text>
          <Text style={styles.soon}>{t('emailHub.soon')}</Text>
        </View>
      ))}
      <Text style={styles.connectText}>{t('emailHub.connectedText')}</Text>
      <View style={{ flex: 1 }} />
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

  const emptyList =
    activeFolder === 'inbox' && received.length === 0 ? (
      <EmptyState title={t('emailHub.inboxEmptyTitle')} subtitle={t('emailHub.inboxEmptyText')} />
    ) : sent.length === 0 && received.length === 0 ? (
      <EmptyState title={t('emailHub.emptyTitle')} subtitle={t('emailHub.emptyText')} />
    ) : (
      <Text style={styles.emptyFilter}>{t('emailHub.emptyFilter')}</Text>
    );
  const rows = items.length ? items.map((i) => <MailRow key={i.id} item={i} selected={twoPanes && i.id === selectedId} onPress={() => setSelectedId(i.id)} />) : emptyList;

  const templatesBtn = (
    <Pressable onPress={() => router.push('/(app)/compte/emails' as any)} style={styles.headerBtn} accessibilityRole="button">
      <Feather name="edit-3" size={14} color={colors.text} />
      <Text style={styles.headerBtnText}>{t('emailHub.templates')}</Text>
    </Pressable>
  );

  // Folder tabs, for screens without the sidebar.
  const chips = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {[...MAIN_FOLDERS.map((f) => f.key), ...LABEL_FOLDERS.map((f) => f.key)].map((key) => {
        const on = key === activeFolder;
        return (
          <Pressable key={key} onPress={() => { setFolder(key); setSelectedId(null); }} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{folderLabel(key)}</Text>
            {badge(key) ? <Text style={[styles.chipCount, on && styles.chipTextOn, key === 'watch' && !on && { color: colors.danger }]}>{badge(key)}</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // Phone: the list, and the message full screen once opened.
  if (!twoPanes) {
    if (reader) return <AppScreen>{reader}</AppScreen>;
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.phone}>
          <PageHeader title={t('emailHub.title')} backTo="/(app)" right={templatesBtn} />
          {chips}
          {statsLine}
          {searchBox}
          <View style={styles.phoneList}>{rows}</View>
        </ScrollView>
      </AppScreen>
    );
  }

  const paneHeight = Math.max(560, height - 150);
  return (
    <AppScreen>
      <View style={styles.page}>
        <PageHeader title={t('emailHub.title')} backTo="/(app)" right={templatesBtn} />
        {threePanes ? null : chips}
        <View style={[styles.client, { height: paneHeight }]}>
          {threePanes ? sidebar : null}
          <View style={[styles.listPane, !threePanes && { borderLeftWidth: 0 }]}>
            <View style={styles.listHead}>
              <Text style={styles.listTitle}>{folderLabel(activeFolder)}</Text>
              {threePanes ? null : statsLine}
              {searchBox}
            </View>
            <ScrollView style={{ flex: 1 }}>{rows}</ScrollView>
          </View>
          <View style={styles.readerPane}>
            {reader ?? (
              <View style={styles.placeholder}>
                <Feather name="mail" size={34} color={colors.border} />
                <Text style={styles.placeholderText}>{t('emailHub.selectPrompt')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.xl, paddingBottom: spacing.lg, width: '100%', maxWidth: 1440, alignSelf: 'center' },
  phone: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.sm },
  phoneList: { marginHorizontal: -spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
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
  connect: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6, paddingHorizontal: 10, opacity: 0.75 },
  connectName: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  soon: { fontSize: 10, fontWeight: '700', color: colors.primaryDark, backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, overflow: 'hidden' },
  connectText: { fontSize: 11.5, lineHeight: 16, color: colors.textMuted, paddingHorizontal: 10, marginTop: 4 },
  stats: { fontSize: 11.5, color: colors.textMuted, paddingHorizontal: 10, paddingVertical: 4, fontVariant: ['tabular-nums'] },
  listPane: { width: 390, borderLeftWidth: 1, borderLeftColor: colors.border, borderRightWidth: 1, borderRightColor: colors.border },
  listHead: { padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  listTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
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
  emptyFilter: { fontSize: fontSize.sm, color: colors.textMuted, padding: spacing.lg, textAlign: 'center' },
});
