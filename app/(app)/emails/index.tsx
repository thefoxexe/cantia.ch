import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  STATUS_STEPS,
  conversationFor,
  documentHref,
  emailStatus,
  extraWorkProjects,
  listEmailMessages,
  matchesFilter,
  matchesSearch,
  needsAttention,
  resendEmail,
  sentByNames,
  type EmailFilter,
  type EmailMessage,
  type EmailStatus,
} from '../../../lib/api/emails';
import type { SalesEmail } from '../../../lib/api/salesEmails';
import { formatRelativeTime } from '../../../lib/api/notifications';
import { AppScreen, Button, Card, EmptyState, LoadingScreen, PageHeader } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { displayType, monoType } from '../../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// App › E-mails: every e-mail sent to a client in one inbox-like list, each
// with a single status word (the furthest step reached) and, on the right
// or on tap, its whole timeline. Data: lib/api/emails.ts.

const FILTERS: EmailFilter[] = ['all', 'watch', 'devis', 'factures', 'reminders', 'replies'];

const STATUS_ICON: Record<EmailStatus, React.ComponentProps<typeof Feather>['name']> = {
  sent: 'send',
  delivered: 'inbox',
  opened: 'eye',
  viewed: 'file-text',
  replied: 'corner-up-left',
  bounced: 'alert-triangle',
};

function statusColor(status: EmailStatus): { fg: string; bg: string } {
  switch (status) {
    case 'bounced':
      return { fg: colors.danger, bg: colors.dangerSoft };
    case 'replied':
      return { fg: colors.success, bg: colors.successSoft };
    case 'viewed':
      return { fg: colors.primaryDark, bg: colors.primarySoft };
    case 'opened':
      return { fg: colors.warning, bg: colors.warningSoft };
    case 'delivered':
      return { fg: colors.slate, bg: colors.slateSoft };
    default:
      return { fg: colors.textMuted, bg: colors.surfaceAlt };
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default function EmailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { organization, canViewFinances } = useAuth();
  const { width } = useWindowDimensions();
  const split = width >= 960;

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<EmailFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(params.id ?? null);

  const load = useCallback(async () => {
    if (!organization || !canViewFinances) {
      setLoading(false);
      return;
    }
    const rows = await listEmailMessages(organization.id);
    setMessages(rows);
    const [who, where] = await Promise.all([
      sentByNames(organization.id, rows.map((m) => m.sent_by ?? '')),
      extraWorkProjects(rows.filter((m) => m.document_type === 'extra_work').map((m) => m.document_id)),
    ]);
    setNames(who);
    setProjects(where);
    setLoading(false);
  }, [organization, canViewFinances]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (params.id) setSelectedId(params.id);
  }, [params.id]);

  const visible = useMemo(() => messages.filter((m) => matchesFilter(m, filter) && matchesSearch(m, search)), [messages, filter, search]);
  const counts = useMemo(() => {
    const out = {} as Record<EmailFilter, number>;
    for (const f of FILTERS) out[f] = messages.filter((m) => matchesFilter(m, f)).length;
    return out;
  }, [messages]);
  const stats = useMemo(() => {
    const recent = messages.filter((m) => daysSince(m.sent_at) < 30);
    const delivered = recent.filter((m) => !m.bounced_at && (m.delivered_at || m.opened_at || m.viewed_at || m.replied_at)).length;
    const opened = recent.filter((m) => m.opened_at || m.clicked_at || m.viewed_at || m.replied_at).length;
    const pct = (n: number) => (recent.length ? `${Math.round((n / recent.length) * 100)} %` : '—');
    return { sent: recent.length, delivered: pct(delivered), opened: pct(opened), watch: counts.watch ?? 0 };
  }, [messages, counts]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  if (loading) return <LoadingScreen />;

  if (!canViewFinances) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <PageHeader title={t('emailHub.title')} backTo="/(app)" />
          <Card>
            <EmptyState title={t('emailHub.title')} subtitle={t('emailHub.noAccess')} />
          </Card>
        </ScrollView>
      </AppScreen>
    );
  }

  const detail = selected ? (
    <EmailDetail
      key={selected.id}
      message={selected}
      orgId={organization!.id}
      senderName={selected.sent_by ? names[selected.sent_by] ?? null : null}
      href={documentHref(selected, projects[selected.document_id])}
      onBack={split ? undefined : () => setSelectedId(null)}
      onResent={load}
    />
  ) : null;

  // Phone: the detail replaces the list.
  if (!split && detail) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.container}>{detail}</ScrollView>
      </AppScreen>
    );
  }

  const list = (
    <View style={{ gap: spacing.md }}>
      <View style={styles.searchBox}>
        <Feather name="search" size={16} color={colors.textMuted} />
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
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filter, active && styles.filterActive]} accessibilityRole="button">
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{t(`emailHub.filter.${f}`)}</Text>
              {f !== 'all' && counts[f] ? (
                <Text style={[styles.filterCount, active && styles.filterTextActive, f === 'watch' && !active && { color: colors.danger }]}>{counts[f]}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <Card style={styles.listCard}>
        {messages.length === 0 ? (
          <EmptyState title={t('emailHub.emptyTitle')} subtitle={t('emailHub.emptyText')} />
        ) : visible.length === 0 ? (
          <Text style={styles.emptyFilter}>{t('emailHub.emptyFilter')}</Text>
        ) : (
          visible.map((m, i) => (
            <EmailRow key={m.id} message={m} first={i === 0} selected={split && m.id === selectedId} onPress={() => setSelectedId(m.id)} />
          ))
        )}
      </Card>
    </View>
  );

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title={t('emailHub.title')}
          backTo="/(app)"
          right={
            <Pressable onPress={() => router.push('/(app)/compte/emails' as any)} style={styles.headerBtn} accessibilityRole="button">
              <Feather name="edit-3" size={14} color={colors.text} />
              <Text style={styles.headerBtnText}>{t('emailHub.templates')}</Text>
            </Pressable>
          }
        />
        <Text style={styles.subtitle}>{t('emailHub.subtitle')}</Text>

        {messages.length > 0 ? (
          <View style={styles.kpis}>
            <Kpi label={t('emailHub.kpiSent')} value={String(stats.sent)} />
            <Kpi label={t('emailHub.kpiDelivered')} value={stats.delivered} />
            <Kpi label={t('emailHub.kpiOpened')} value={stats.opened} />
            <Kpi label={t('emailHub.kpiWatch')} value={String(stats.watch)} alert={stats.watch > 0} onPress={() => setFilter('watch')} last />
          </View>
        ) : null}

        {split ? (
          <View style={styles.split}>
            <View style={styles.splitList}>{list}</View>
            <View style={styles.splitDetail}>
              {detail ?? (
                <Card style={styles.placeholder}>
                  <Feather name="mail" size={28} color={colors.border} />
                  <Text style={styles.placeholderText}>{t('emailHub.selectPrompt')}</Text>
                </Card>
              )}
            </View>
          </View>
        ) : (
          list
        )}
      </ScrollView>
    </AppScreen>
  );
}

function Kpi({ label, value, last, alert, onPress }: { label: string; value: string; last?: boolean; alert?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.kpi, last && { borderRightWidth: 0 }]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, alert && { color: colors.danger }]}>{value}</Text>
    </Pressable>
  );
}

function StatusPill({ status }: { status: EmailStatus }) {
  const { t } = useTranslation();
  const c = statusColor(status);
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Feather name={STATUS_ICON[status]} size={11} color={c.fg} />
      <Text style={[styles.pillText, { color: c.fg }]}>{t(`emailHub.status.${status}`)}</Text>
    </View>
  );
}

// Five small bars: how far along the e-mail is, readable at a glance.
function Progress({ status }: { status: EmailStatus }) {
  const reached = status === 'bounced' ? 0 : STATUS_STEPS.indexOf(status) + 1;
  const c = statusColor(status);
  return (
    <View style={styles.progress}>
      {STATUS_STEPS.map((s, i) => (
        <View key={s} style={[styles.progressBar, { backgroundColor: status === 'bounced' ? colors.dangerSoft : i < reached ? c.fg : colors.surfaceAlt }]} />
      ))}
    </View>
  );
}

function EmailRow({ message: m, first, selected, onPress }: { message: EmailMessage; first: boolean; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const status = emailStatus(m);
  const attention = needsAttention(m);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !first && styles.rowBorder, (selected || pressed) && styles.rowSelected]}>
      <View style={[styles.rowMark, attention && { backgroundColor: attention === 'bounced' ? colors.danger : colors.warning }]} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTo} numberOfLines={1}>
            {m.to_name || m.to_email}
          </Text>
          <Text style={styles.rowTime}>{formatRelativeTime(m.sent_at)}</Text>
        </View>
        <Text style={styles.rowSubject} numberOfLines={1}>
          {m.subject || m.document_number}
        </Text>
        <View style={styles.rowBottom}>
          <Text style={styles.kindTag}>
            {t(`emailHub.kind.${m.kind}`)}
            {m.document_number ? ` · ${m.document_number}` : ''}
          </Text>
          <View style={{ flex: 1 }} />
          <Progress status={status} />
          <StatusPill status={status} />
        </View>
      </View>
    </Pressable>
  );
}

function EmailDetail({
  message: m,
  orgId,
  senderName,
  href,
  onBack,
  onResent,
}: {
  message: EmailMessage;
  orgId: string;
  senderName: string | null;
  href: string | null;
  onBack?: () => void;
  onResent: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const status = emailStatus(m);
  const attention = needsAttention(m);
  const [thread, setThread] = useState<SalesEmail[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    conversationFor(orgId, m).then(setThread);
  }, [orgId, m]);

  async function resend() {
    setSending(true);
    const { sent, error } = await resendEmail(m);
    setSending(false);
    setConfirming(false);
    setFeedback(sent ? { ok: true, text: t('emailHub.resent') } : { ok: false, text: error ?? '' });
    if (sent) onResent();
  }

  const steps: { key: Exclude<EmailStatus, 'bounced'>; at: string | null }[] = [
    { key: 'sent', at: m.sent_at },
    { key: 'delivered', at: m.delivered_at },
    { key: 'opened', at: m.opened_at ?? m.clicked_at },
    { key: 'viewed', at: m.viewed_at },
    { key: 'replied', at: m.replied_at },
  ];
  const isFacture = m.document_type === 'facture';

  return (
    <View style={{ gap: spacing.md }}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Feather name="arrow-left" size={16} color={colors.text} />
          <Text style={styles.backText}>{t('emailHub.back')}</Text>
        </Pressable>
      ) : null}

      <Card style={{ gap: spacing.md }}>
        <View style={styles.detailHead}>
          <Text style={styles.kindTag}>
            {t(`emailHub.kind.${m.kind}`)}
            {m.document_number ? ` · ${m.document_number}` : ''}
          </Text>
          <StatusPill status={status} />
        </View>
        <Text style={styles.detailSubject}>{m.subject || m.document_number}</Text>
        <View style={{ gap: 2 }}>
          <Text style={styles.detailMeta} selectable>
            <Text style={styles.detailMetaLabel}>{t('emailHub.to')} </Text>
            {m.to_name ? `${m.to_name} <${m.to_email}>` : m.to_email}
          </Text>
          <Text style={styles.detailMeta}>
            {[senderName ? t('emailHub.sentBy', { name: senderName }) : null, t('emailHub.sentOn', { date: formatDateTime(m.sent_at) })].filter(Boolean).join(' · ')}
          </Text>
        </View>

        {attention ? (
          <View style={[styles.banner, { backgroundColor: attention === 'bounced' ? colors.dangerSoft : colors.warningSoft }]}>
            <Feather name="alert-triangle" size={16} color={attention === 'bounced' ? colors.danger : colors.warning} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.bannerText, { color: attention === 'bounced' ? colors.danger : colors.warning }]}>
                {attention === 'bounced' ? t('emailHub.watchBounced') : t('emailHub.watchNotOpened', { count: daysSince(m.sent_at) })}
              </Text>
              {attention === 'bounced' && m.bounce_reason ? <Text style={styles.bannerSub}>{t('emailHub.bounceReason', { reason: m.bounce_reason })}</Text> : null}
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          {href ? <Button title={t('emailHub.openDocument')} icon="external-link" variant="secondary" onPress={() => router.push(href as any)} /> : null}
          {confirming ? (
            <View style={styles.confirm}>
              <Text style={styles.confirmText}>{t('emailHub.confirmResend', { email: m.to_email })}</Text>
              <Button title={t('emailHub.confirm')} onPress={resend} loading={sending} />
              <Button title={t('emailHub.cancel')} variant="secondary" onPress={() => setConfirming(false)} disabled={sending} />
            </View>
          ) : (
            <Button
              title={isFacture && m.kind === 'facture_reminder' ? t('emailHub.sendReminder') : t('emailHub.resend')}
              icon="repeat"
              variant="secondary"
              onPress={() => {
                setFeedback(null);
                setConfirming(true);
              }}
            />
          )}
        </View>
        {feedback ? <Text style={[styles.feedback, { color: feedback.ok ? colors.success : colors.danger }]}>{feedback.text}</Text> : null}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={styles.sectionLabel}>{t('emailHub.timeline')}</Text>
        {status === 'bounced' ? (
          <>
            <Step label={t('emailHub.status.sent')} hint={t('emailHub.statusHint.sent')} at={m.sent_at} done color={colors.textMuted} />
            <Step label={t('emailHub.status.bounced')} hint={t('emailHub.statusHint.bounced')} at={m.bounced_at ?? m.complained_at} done color={colors.danger} last />
          </>
        ) : (
          steps.map((s, i) => (
            <Step
              key={s.key}
              label={t(`emailHub.status.${s.key}`)}
              hint={t(`emailHub.statusHint.${s.key}`)}
              at={s.at}
              done={!!s.at || STATUS_STEPS.indexOf(status) >= i}
              color={statusColor(s.key).fg}
              last={i === steps.length - 1}
            />
          ))
        )}
        <View style={styles.counters}>
          <Counter label={t('emailHub.opens')} value={m.open_count} />
          <Counter label={t('emailHub.clicks')} value={m.click_count} />
          <Counter label={t('emailHub.views')} value={m.view_count} />
          <Counter label={t('emailHub.replies')} value={m.reply_count} />
        </View>
        <Text style={styles.note}>{t('emailHub.openNote')}</Text>
      </Card>

      {thread.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.sectionLabel}>{t('emailHub.conversation')}</Text>
          {thread.map((e) => (
            <View key={e.id} style={[styles.threadItem, e.direction === 'incoming' && styles.threadIncoming]}>
              <Text style={styles.threadMeta}>
                {e.direction === 'incoming'
                  ? t('emailHub.incoming', { email: e.counterpart_email ?? e.from_email })
                  : t('emailHub.outgoing', { email: e.counterpart_email ?? '' })}
                {' · '}
                {formatDateTime(e.occurred_at)}
              </Text>
              {e.subject ? <Text style={styles.threadSubject}>{e.subject}</Text> : null}
              {e.snippet ? <Text style={styles.threadSnippet}>{e.snippet}</Text> : null}
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

function Step({ label, hint, at, done, color, last }: { label: string; hint: string; at: string | null; done: boolean; color: string; last?: boolean }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepRail}>
        <View style={[styles.stepDot, done ? { backgroundColor: color, borderColor: color } : null]} />
        {last ? null : <View style={[styles.stepLine, done && { backgroundColor: color }]} />}
      </View>
      <View style={{ flex: 1, paddingBottom: last ? 0 : spacing.md }}>
        <View style={styles.stepHead}>
          <Text style={[styles.stepLabel, !done && { color: colors.textMuted }]}>{label}</Text>
          <Text style={styles.stepAt}>{at ? formatDateTime(at) : done ? '✓' : '—'}</Text>
        </View>
        <Text style={styles.stepHint}>{hint}</Text>
      </View>
    </View>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.counter}>
      <Text style={styles.counterValue}>{value}</Text>
      <Text style={styles.counterLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxl * 2, width: '100%', maxWidth: 1280, alignSelf: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.lg },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.text, borderRadius: radius.sm, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: colors.surface },
  headerBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, marginBottom: spacing.lg },
  kpi: { flexGrow: 1, flexBasis: 160, padding: spacing.md, borderRightWidth: 1, borderRightColor: colors.border },
  kpiLabel: { ...monoType, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  kpiValue: { ...displayType, fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4, fontVariant: ['tabular-nums'] },
  split: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  splitList: { flex: 5, minWidth: 0 },
  splitDetail: { flex: 6, minWidth: 0 },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  placeholderText: { fontSize: fontSize.sm, color: colors.textMuted },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: fontSize.sm, color: colors.text, outlineStyle: 'none' } as any,
  filters: { gap: spacing.xs },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filterActive: { backgroundColor: colors.text, borderColor: colors.text },
  filterText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  filterTextActive: { color: colors.surface },
  filterCount: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, fontVariant: ['tabular-nums'] },
  listCard: { padding: 0, overflow: 'hidden' },
  emptyFilter: { fontSize: fontSize.sm, color: colors.textMuted, padding: spacing.lg, textAlign: 'center' },
  row: { flexDirection: 'row', paddingVertical: spacing.sm + 2, paddingRight: spacing.md, gap: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowSelected: { backgroundColor: colors.bg },
  rowMark: { width: 3, alignSelf: 'stretch', borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  rowBody: { flex: 1, minWidth: 0, gap: 3 },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  rowTo: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  rowTime: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  rowSubject: { fontSize: fontSize.sm, color: colors.textMuted },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  kindTag: { ...monoType, fontSize: 10, letterSpacing: 0.3, textTransform: 'uppercase', color: colors.textMuted },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2 },
  pillText: { ...monoType, fontSize: 9.5, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: '700' },
  progress: { flexDirection: 'row', gap: 2 },
  progressBar: { width: 8, height: 4, borderRadius: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  backText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  detailHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  detailSubject: { ...displayType, fontSize: 22, lineHeight: 26, fontWeight: '800', color: colors.text },
  detailMeta: { fontSize: fontSize.sm, color: colors.textMuted },
  detailMetaLabel: { fontWeight: '700', color: colors.text },
  banner: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, alignItems: 'flex-start' },
  bannerText: { fontSize: fontSize.sm, fontWeight: '700' },
  bannerSub: { fontSize: fontSize.xs, color: colors.textMuted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  confirm: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  confirmText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  feedback: { fontSize: fontSize.sm, fontWeight: '600' },
  sectionLabel: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted, marginBottom: spacing.xs },
  step: { flexDirection: 'row', gap: spacing.md },
  stepRail: { alignItems: 'center', width: 12 },
  stepDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, marginTop: 3 },
  stepLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
  stepHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
  stepLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  stepAt: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  stepHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  counters: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.xs },
  counter: { flex: 1, alignItems: 'flex-start' },
  counterValue: { ...displayType, fontSize: 20, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  counterLabel: { ...monoType, fontSize: 9.5, letterSpacing: 0.3, textTransform: 'uppercase', color: colors.textMuted },
  note: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  threadItem: { borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: spacing.md, paddingVertical: 2, gap: 2 },
  threadIncoming: { borderLeftColor: colors.success },
  threadMeta: { fontSize: fontSize.xs, color: colors.textMuted },
  threadSubject: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  threadSnippet: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
});
