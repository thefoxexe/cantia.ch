import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { conversationFor, documentHref, needsAttention, resendEmail, type EmailMessage } from '../../lib/api/emails';
import { getSalesEmailBody, type SalesEmail, type SalesEmailBody } from '../../lib/api/salesEmails';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { displayType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { Avatar, StatusTrack, type MailItem } from './MailParts';
import { Attachments, MailBody } from './MailBody';

// Reading pane of App › E-mails: a toolbar (reply, resend, open the
// document), the message like a mail client shows it, then the exchange.

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(`${getAppLocale()}-CH`, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function replyTo(email: string, subject: string | null) {
  const s = subject ? (subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`) : '';
  Linking.openURL(`mailto:${email}${s ? `?subject=${encodeURIComponent(s)}` : ''}`);
}

export function MailReader({
  item,
  orgId,
  orgName,
  senderNames,
  projects,
  related,
  onBack,
  onResent,
  onMarkUnread,
}: {
  item: MailItem;
  orgId: string;
  orgName: string;
  senderNames: Record<string, string>;
  projects: Record<string, string>;
  related: EmailMessage | null;
  onBack?: () => void;
  onResent: () => void;
  onMarkUnread?: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const sent = item.type === 'sent' ? item.m : related;
  const [thread, setThread] = useState<SalesEmail[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [body, setBody] = useState<SalesEmailBody | null>(null);
  useEffect(() => {
    setBody(null);
    if (item.type === 'received') getSalesEmailBody(item.e.id).then(setBody);
  }, [item.id]);

  useEffect(() => {
    setThread([]);
    if (sent) conversationFor(orgId, sent).then(setThread);
  }, [orgId, sent?.id]);

  const received = item.type === 'received' ? item.e : null;
  const clientEmail = received ? received.counterpart_email || received.from_email : item.type === 'sent' ? item.m.to_email : '';
  const subject = received ? received.subject : item.type === 'sent' ? item.m.subject || item.m.document_number : null;
  const href = sent
    ? documentHref(sent, projects[sent.document_id])
    : received?.devis_id
      ? `/(app)/devis/${received.devis_id}`
      : received?.facture_id
        ? `/(app)/devis/factures/${received.facture_id}`
        : null;

  async function resend() {
    if (!sent) return;
    setSending(true);
    const { sent: ok, error } = await resendEmail(sent);
    setSending(false);
    setConfirming(false);
    setFeedback(ok ? { ok: true, text: t('emailHub.resent') } : { ok: false, text: error ?? '' });
    if (ok) onResent();
  }

  // The exchange after the original e-mail, without the reply already shown
  // at the top.
  const others = thread.filter((e) => e.id !== received?.id);
  const attention = sent ? needsAttention(sent) : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.tool} accessibilityLabel={t('emailHub.back')}>
            <Feather name="arrow-left" size={18} color={colors.text} />
          </Pressable>
        ) : null}
        <Pressable onPress={() => replyTo(clientEmail, subject)} style={[styles.tool, styles.toolMain]}>
          <Feather name="corner-up-left" size={15} color="#FFFFFF" />
          <Text style={styles.toolMainText}>{t('emailHub.reply')}</Text>
        </Pressable>
        {sent ? (
          <Pressable onPress={() => { setFeedback(null); setConfirming(true); }} style={styles.tool} accessibilityLabel={t('emailHub.resend')}>
            <Feather name="repeat" size={15} color={colors.text} />
            {onBack ? null : <Text style={styles.toolText}>{sent.kind === 'facture_reminder' ? t('emailHub.sendReminder') : t('emailHub.resend')}</Text>}
          </Pressable>
        ) : null}
        {received && onMarkUnread ? (
          <Pressable onPress={onMarkUnread} style={styles.tool} accessibilityLabel={t('emailHub.markUnread')}>
            <Feather name="mail" size={15} color={colors.text} />
            {onBack ? null : <Text style={styles.toolText}>{t('emailHub.markUnread')}</Text>}
          </Pressable>
        ) : null}
        {href ? (
          <Pressable onPress={() => router.push(href as any)} style={styles.tool} accessibilityLabel={t('emailHub.openDocument')}>
            <Feather name="file-text" size={15} color={colors.text} />
            {onBack ? null : <Text style={styles.toolText}>{t('emailHub.openDocument')}</Text>}
          </Pressable>
        ) : null}
      </View>

      {confirming && sent ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>{t('emailHub.confirmResend', { email: sent.to_email })}</Text>
          <Pressable onPress={resend} disabled={sending} style={[styles.tool, styles.toolMain]}>
            <Text style={styles.toolMainText}>{sending ? '…' : t('emailHub.confirm')}</Text>
          </Pressable>
          <Pressable onPress={() => setConfirming(false)} style={styles.tool}>
            <Text style={styles.toolText}>{t('emailHub.cancel')}</Text>
          </Pressable>
        </View>
      ) : null}
      {feedback ? <Text style={[styles.feedback, { color: feedback.ok ? colors.success : colors.danger }]}>{feedback.text}</Text> : null}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
        <Text style={styles.subject}>{subject || '—'}</Text>

        {received ? (
          <View style={[styles.card, received.direction === 'incoming' && styles.cardIncoming]}>
            <View style={styles.head}>
              <Avatar label={received.from_name || received.devis?.client_name || received.counterpart_email || received.from_email} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.from} numberOfLines={1}>
                  {received.from_name || received.devis?.client_name || received.from_email}{' '}
                  <Text style={styles.fromEmail}>{`<${received.from_email}>`}</Text>
                </Text>
                <Text style={styles.to} numberOfLines={2} selectable>
                  {t('emailHub.to')} {body?.to_emails?.length ? body.to_emails.join(', ') : orgName}
                  {body?.cc_emails?.length ? `  ·  ${t('emailHub.cc')} ${body.cc_emails.join(', ')}` : ''}
                </Text>
              </View>
              <Text style={styles.date}>{formatDateTime(received.occurred_at)}</Text>
            </View>
            {body ? (
              <MailBody html={body.body_html} text={body.body_text || received.snippet || t('emailHub.noSnippet')} />
            ) : (
              <Text style={styles.text}>{received.snippet || ''}</Text>
            )}
            <Attachments items={body?.attachments ?? received.attachments ?? []} />
          </View>
        ) : null}

        {sent ? (
          <View style={styles.card}>
            {received ? <Text style={styles.cardLabel}>{t('emailHub.originalEmail')}</Text> : null}
            <View style={styles.head}>
              <Avatar label={orgName} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.from} numberOfLines={1}>
                  {sent.sent_by && senderNames[sent.sent_by] ? `${senderNames[sent.sent_by]} · ${orgName}` : orgName}
                </Text>
                <Text style={styles.to} numberOfLines={1} selectable>
                  {t('emailHub.to')} {sent.to_name ? `${sent.to_name} <${sent.to_email}>` : sent.to_email}
                </Text>
              </View>
              <Text style={styles.date}>{formatDateTime(sent.sent_at)}</Text>
            </View>
            <View style={styles.docChip}>
              <Feather name="paperclip" size={13} color={colors.textMuted} />
              <Text style={styles.docChipText}>
                {t(`emailHub.kind.${sent.kind}`)}
                {sent.document_number ? ` ${sent.document_number}` : ''}.pdf
              </Text>
            </View>
            <StatusTrack m={sent} />
            {attention === 'notOpened' ? (
              <Text style={styles.watch}>{t('emailHub.watchNotOpened', { count: Math.floor((Date.now() - new Date(sent.sent_at).getTime()) / 86400000) })}</Text>
            ) : null}
            <Text style={styles.counts}>
              {sent.open_count} {t('emailHub.opens').toLowerCase()} · {sent.click_count} {t('emailHub.clicks').toLowerCase()} · {sent.view_count}{' '}
              {t('emailHub.views').toLowerCase()}
            </Text>
          </View>
        ) : null}

        {others.map((e) =>
          e.direction === 'incoming' ? (
            <Message key={e.id} who={e.counterpart_email ?? e.from_email} email={e.from_email} to={orgName} at={e.occurred_at} text={e.snippet || t('emailHub.noSnippet')} />
          ) : (
            <Message key={e.id} who={orgName} email={e.from_email} to={e.counterpart_email ?? ''} at={e.occurred_at} text={e.snippet || ''} outgoing />
          ),
        )}
        <Text style={styles.note}>{t('emailHub.openNote')}</Text>
      </ScrollView>
    </View>
  );
}

function Message({ who, email, to, at, text, outgoing }: { who: string; email: string; to: string; at: string; text: string; outgoing?: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.card, !outgoing && styles.cardIncoming]}>
      <View style={styles.head}>
        <Avatar label={who} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.from} numberOfLines={1}>
            {who} <Text style={styles.fromEmail}>{who !== email ? `<${email}>` : ''}</Text>
          </Text>
          <Text style={styles.to} numberOfLines={1}>
            {t('emailHub.to')} {to}
          </Text>
        </View>
        <Text style={styles.date}>{formatDateTime(at)}</Text>
      </View>
      <Text style={styles.text} selectable>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  toolText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  toolMain: { backgroundColor: colors.text, borderColor: colors.text },
  toolMainText: { fontSize: fontSize.sm, fontWeight: '700', color: '#FFFFFF' },
  confirm: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.bg },
  confirmText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  feedback: { fontSize: fontSize.sm, fontWeight: '600', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  body: { padding: spacing.lg, gap: spacing.md },
  subject: { ...displayType, fontSize: 22, lineHeight: 28, fontWeight: '800', color: colors.text },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.md, backgroundColor: colors.surface },
  cardIncoming: { borderLeftWidth: 3, borderLeftColor: colors.success },
  cardLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  from: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  fromEmail: { fontWeight: '400', color: colors.textMuted },
  to: { fontSize: 12.5, color: colors.textMuted },
  date: { fontSize: 11.5, color: colors.textMuted, alignSelf: 'flex-start' },
  text: { fontSize: 15, lineHeight: 23, color: colors.text },
  docChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.bg },
  docChipText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
  watch: { fontSize: 12.5, fontWeight: '600', color: colors.warning },
  counts: { fontSize: 12, color: colors.textMuted },
  note: { fontSize: 11.5, color: colors.textMuted, lineHeight: 16 },
});
