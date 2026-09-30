import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { STATUS_STEPS, emailStatus, needsAttention, type EmailMessage, type EmailStatus } from '../../lib/api/emails';
import type { SalesEmail } from '../../lib/api/salesEmails';
import { formatRelativeTime } from '../../lib/api/notifications';
import { useTranslation } from '../../lib/translations';
import { colors, fontSize, spacing } from '../../lib/theme';

// Building blocks of App › E-mails, laid out like a mail client: avatars,
// list rows (sent e-mails and received replies) and the status of a sent
// e-mail in one compact line.

export type MailItem = { type: 'sent'; id: string; at: string; m: EmailMessage } | { type: 'received'; id: string; at: string; e: SalesEmail };

export const STATUS_ICON: Record<EmailStatus, React.ComponentProps<typeof Feather>['name']> = {
  sent: 'send',
  delivered: 'check',
  opened: 'eye',
  viewed: 'file-text',
  replied: 'corner-up-left',
  bounced: 'alert-triangle',
};

export function statusColor(status: EmailStatus): string {
  switch (status) {
    case 'bounced':
      return colors.danger;
    case 'replied':
      return colors.success;
    case 'viewed':
      return colors.primaryDark;
    case 'opened':
      return colors.warning;
    default:
      return colors.textMuted;
  }
}

const AVATAR_TONES = ['#A95C30', '#3E6B5A', '#4B5E86', '#8A5A83', '#9A7B2F', '#5F6B73'];

export function initialsOf(nameOrEmail: string): string {
  const base = nameOrEmail.includes('@') && !nameOrEmail.includes(' ') ? nameOrEmail.split('@')[0].replace(/[._-]+/g, ' ') : nameOrEmail;
  const parts = base.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Avatar({ label, size = 36 }: { label: string; size?: number }) {
  let hash = 0;
  for (const ch of label) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: AVATAR_TONES[hash % AVATAR_TONES.length] }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initialsOf(label)}</Text>
    </View>
  );
}

export function isFresh(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 48 * 3600 * 1000;
}

export function MailRow({ item, selected, onPress }: { item: MailItem; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  if (item.type === 'received') {
    const e = item.e;
    const outgoing = e.direction === 'outgoing';
    const who = outgoing ? e.counterpart_email || e.from_email : e.from_name || e.devis?.client_name || e.counterpart_email || e.from_email;
    const fresh = !outgoing && !e.read_at;
    const doc = e.devis?.number ?? e.facture?.number ?? null;
    return (
      <Pressable onPress={onPress} style={({ pressed, hovered }: any) => [styles.row, (selected || pressed || hovered) && styles.rowActive, selected && styles.rowSelected]}>
        <Avatar label={who} />
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            {fresh ? <View style={styles.dot} /> : null}
            <Text style={[styles.rowWho, fresh && styles.bold]} numberOfLines={1}>{who}</Text>
            {e.attachments?.length ? <Feather name="paperclip" size={12} color={colors.textMuted} /> : null}
            <Text style={[styles.rowTime, fresh && styles.timeFresh]}>{formatRelativeTime(e.occurred_at)}</Text>
          </View>
          <Text style={[styles.rowSubject, fresh && styles.bold]} numberOfLines={1}>{e.subject || '—'}</Text>
          <Text style={styles.rowSnippet} numberOfLines={1}>
            {doc ? <Text style={styles.docTag}>{doc}  </Text> : null}
            {e.snippet || t('emailHub.noSnippet')}
          </Text>
        </View>
      </Pressable>
    );
  }
  const m = item.m;
  const status = emailStatus(m);
  const attention = needsAttention(m);
  return (
    <Pressable onPress={onPress} style={({ pressed, hovered }: any) => [styles.row, (selected || pressed || hovered) && styles.rowActive, selected && styles.rowSelected]}>
      <Avatar label={m.to_name || m.to_email} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowWho} numberOfLines={1}>{m.to_name || m.to_email}</Text>
          {attention ? <Feather name="alert-circle" size={13} color={attention === 'bounced' ? colors.danger : colors.warning} /> : null}
          <Text style={styles.rowTime}>{formatRelativeTime(m.sent_at)}</Text>
        </View>
        <Text style={styles.rowSubject} numberOfLines={1}>{m.subject || m.document_number}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.docTag} numberOfLines={1}>
            {t(`emailHub.kind.${m.kind}`)}
            {m.document_number ? ` · ${m.document_number}` : ''}
          </Text>
          <View style={{ flex: 1 }} />
          <StatusPill m={m} />
        </View>
      </View>
    </Pressable>
  );
}

// Where a sent e-mail stands, at a glance: a tinted pill, with how many
// times it was opened once that happened more than once.
export function StatusPill({ m }: { m: EmailMessage }) {
  const { t } = useTranslation();
  const status = emailStatus(m);
  const color = statusColor(status);
  const opens = status === 'opened' && m.open_count > 1 ? ` · ${m.open_count}×` : status === 'viewed' && m.view_count > 1 ? ` · ${m.view_count}×` : '';
  return (
    <View style={[styles.pill, { backgroundColor: statusTint(status) }]}>
      <Feather name={STATUS_ICON[status]} size={11} color={color} />
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>
        {t(`emailHub.status.${status}`)}
        {opens}
      </Text>
    </View>
  );
}

function statusTint(status: EmailStatus): string {
  switch (status) {
    case 'bounced':
      return colors.dangerSoft;
    case 'replied':
      return colors.successSoft;
    case 'viewed':
      return colors.primarySoft;
    case 'opened':
      return colors.warningSoft;
    default:
      return colors.surfaceAlt;
  }
}

// The five steps of a sent e-mail on one line: dots joined by a rail.
export function StatusTrack({ m }: { m: EmailMessage }) {
  const { t } = useTranslation();
  const status = emailStatus(m);
  if (status === 'bounced') {
    return (
      <View style={styles.bounced}>
        <Feather name="alert-triangle" size={14} color={colors.danger} />
        <Text style={[styles.statusText, { color: colors.danger }]}>{t('emailHub.status.bounced')}</Text>
        {m.bounce_reason ? <Text style={styles.bounceReason} numberOfLines={2}>{m.bounce_reason}</Text> : null}
      </View>
    );
  }
  const reached = STATUS_STEPS.indexOf(status);
  const color = statusColor(status);
  return (
    <View style={styles.track}>
      {STATUS_STEPS.map((s, i) => (
        <View key={s} style={styles.trackStep}>
          <View style={styles.trackLineWrap}>
            <View style={[styles.trackLine, i === 0 && { opacity: 0 }, i <= reached && { backgroundColor: color }]} />
            <View style={[styles.trackDot, i <= reached && { backgroundColor: color, borderColor: color }]} />
            <View style={[styles.trackLine, i === STATUS_STEPS.length - 1 && { opacity: 0 }, i < reached && { backgroundColor: color }]} />
          </View>
          <Text style={[styles.trackLabel, i <= reached && { color: colors.text }]} numberOfLines={1}>{t(`emailHub.status.${s}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '700' },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: 12, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  rowActive: { backgroundColor: colors.bg },
  rowSelected: { borderLeftColor: colors.primary },
  rowBody: { flex: 1, minWidth: 0, gap: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowWho: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  bold: { fontWeight: '800', color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  rowTime: { fontSize: 11.5, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  timeFresh: { color: colors.primary, fontWeight: '700' },
  rowSubject: { fontSize: fontSize.sm, color: colors.text },
  rowSnippet: { fontSize: 12.5, color: colors.textMuted },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docTag: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2, color: colors.textMuted },
  statusText: { fontSize: 11.5, fontWeight: '700' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  track: { flexDirection: 'row' },
  trackStep: { flex: 1, alignItems: 'center', gap: 4 },
  trackLineWrap: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  trackLine: { flex: 1, height: 2, backgroundColor: colors.border },
  trackDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  trackLabel: { fontSize: 10.5, color: colors.textMuted, fontWeight: '600' },
  bounced: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, backgroundColor: colors.dangerSoft, borderRadius: 6, padding: spacing.sm },
  bounceReason: { width: '100%', fontSize: 12, color: colors.textMuted },
});
