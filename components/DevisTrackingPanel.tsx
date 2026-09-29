import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { getDevisEvents, type DevisEvent } from '../lib/api/salesTracking';
import { getFollowupSettings, nextFollowupAt, sendFollowupNow, setDevisFollowupsPaused, type FollowupSettings } from '../lib/api/followups';
import { getAppLocale, useTranslation } from '../lib/translations';
import { Button, Card } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// History of a devis once it left the office (sent, delivered, viewed on
// the client portal, PDF downloaded, follow-ups, replies). Finance members
// only; plans without sales tracking get a one-line pointer instead.
export function DevisTrackingPanel({
  devisId,
  status,
  hasTracking,
  ready = true,
  followupsPaused = false,
  onChanged,
}: {
  devisId: string;
  status: string;
  hasTracking: boolean;
  // False until the sales tracking migration is live: render nothing.
  ready?: boolean;
  followupsPaused?: boolean;
  // Called after a pause/resume, so the page reloads the devis.
  onChanged?: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { canViewFinances, organization } = useAuth();
  const [events, setEvents] = useState<DevisEvent[] | null>(null);
  const [settings, setSettings] = useState<FollowupSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (!canViewFinances || !hasTracking) return;
    getDevisEvents(devisId).then(setEvents);
    if (organization) getFollowupSettings(organization.id).then(setSettings);
  }, [devisId, status, canViewFinances, hasTracking, organization]);

  async function handleFollowupNow() {
    setBusy(true);
    setMessage(null);
    const { error } = await sendFollowupNow(devisId);
    setMessage(error ? { text: error, error: true } : { text: t('devisTracking.followupSent'), error: false });
    if (!error) setEvents(await getDevisEvents(devisId));
    setBusy(false);
  }

  async function handleTogglePause() {
    setBusy(true);
    setMessage(null);
    const { error } = await setDevisFollowupsPaused(devisId, !followupsPaused);
    if (error) setMessage({ text: error, error: true });
    else onChanged?.();
    setBusy(false);
  }

  if (!ready || !canViewFinances || status === 'draft' || status === 'ready') return null;

  if (!hasTracking) {
    return (
      <Pressable onPress={() => router.push('/(app)/commercial' as any)} style={styles.upsell}>
        <Feather name="eye" size={15} color={colors.primary} />
        <Text style={styles.upsellText}>{t('devisTracking.upsell')}</Text>
        <Feather name="chevron-right" size={16} color={colors.primary} />
      </Pressable>
    );
  }

  const visible = (events ?? []).filter((e) => !(e.kind === 'clicked' && e.meta?.suspected_bot));
  const views = visible.filter((e) => e.kind === 'portal_viewed').length;
  const downloads = visible.filter((e) => e.kind === 'pdf_downloaded').length;

  return (
    <>
      <Text style={styles.sectionTitle}>{t('devisTracking.title')}</Text>
      <Card>
        {events === null ? null : visible.length === 0 ? (
          <Text style={styles.empty}>{t('devisTracking.empty')}</Text>
        ) : (
          <>
            <View style={styles.summary}>
              <Summary label={t('devisTracking.views')} value={String(views)} />
              <Summary label={t('devisTracking.downloads')} value={String(downloads)} />
              <Summary
                label={t('devisTracking.followups')}
                value={String(visible.filter((e) => e.kind === 'followup_sent').length)}
              />
            </View>
            {visible.map((e) => (
              <View key={e.id} style={styles.row}>
                <Text style={styles.time}>
                  {new Date(e.occurred_at).toLocaleString(`${getAppLocale()}-CH`, {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <View style={[styles.dot, { backgroundColor: dotColor(e.kind) }]} />
                <Text style={[styles.label, e.kind === 'opened' && styles.labelSoft]}>{eventLabel(t, e)}</Text>
              </View>
            ))}
            {visible.some((e) => e.kind === 'opened') ? <Text style={styles.note}>{t('devisTracking.openedNote')}</Text> : null}
          </>
        )}
        {status === 'sent' && events !== null ? (
          <View style={styles.followups}>
            <Text style={styles.followupLine}>{followupLine(t, events, settings, followupsPaused)}</Text>
            <View style={styles.followupActions}>
              <Button title={t('devisTracking.followupNow')} icon="send" variant="secondary" onPress={handleFollowupNow} loading={busy} />
              {settings?.enabled ? (
                <Button
                  title={followupsPaused ? t('devisTracking.resume') : t('devisTracking.pause')}
                  icon={followupsPaused ? 'play' : 'pause'}
                  variant="secondary"
                  onPress={handleTogglePause}
                  disabled={busy}
                />
              ) : (
                <Pressable onPress={() => router.push('/(app)/compte/automatisations' as any)} style={styles.link}>
                  <Text style={styles.linkText}>{t('devisTracking.setupFollowups')}</Text>
                </Pressable>
              )}
            </View>
            {message ? <Text style={[styles.message, message.error && { color: colors.danger }]}>{message.text}</Text> : null}
          </View>
        ) : null}
      </Card>
    </>
  );
}

function followupLine(
  t: ReturnType<typeof useTranslation>['t'],
  events: DevisEvent[],
  settings: FollowupSettings | null,
  paused: boolean,
): string {
  if (!settings?.enabled) return t('devisTracking.followupsOff');
  if (paused) return t('devisTracking.followupsPaused');
  if (events.some((e) => e.kind === 'reply_received' || e.kind === 'bounced')) return t('devisTracking.followupsStopped');
  const sent = events.find((e) => e.kind === 'sent');
  const done = events.filter((e) => e.kind === 'followup_sent').length;
  const next = nextFollowupAt(sent?.occurred_at ?? null, settings.days, done);
  if (!sent) return t('devisTracking.followupsNoReference');
  if (!next) return t('devisTracking.followupsDone');
  const date = next.getTime() < Date.now() ? new Date() : next;
  return t('devisTracking.nextFollowup', {
    step: done + 1,
    total: settings.days.length,
    date: date.toLocaleDateString(`${getAppLocale()}-CH`, { weekday: 'long', day: 'numeric', month: 'long' }),
  });
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function dotColor(kind: DevisEvent['kind']): string {
  switch (kind) {
    case 'sent':
    case 'followup_sent':
      return colors.text;
    case 'portal_viewed':
    case 'pdf_downloaded':
    case 'clicked':
      return colors.warning;
    case 'reply_received':
      return colors.primary;
    case 'bounced':
    case 'complained':
      return colors.danger;
    default:
      return colors.border;
  }
}

function eventLabel(t: ReturnType<typeof useTranslation>['t'], e: DevisEvent): string {
  if (e.kind === 'sent') {
    const to = typeof e.meta?.to === 'string' ? e.meta.to : null;
    return to ? t('devisTracking.event.sentTo', { to }) : t('devisTracking.event.sent');
  }
  if (e.kind === 'followup_sent') {
    const step = typeof e.meta?.step === 'number' ? e.meta.step : null;
    return step ? t('devisTracking.event.followupStep', { step }) : t('devisTracking.event.followup_sent');
  }
  return t(`devisTracking.event.${e.kind}`);
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  empty: { fontSize: fontSize.sm, color: colors.textMuted },
  summary: { flexDirection: 'row', gap: spacing.lg, paddingBottom: spacing.md, marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryItem: { minWidth: 70 },
  summaryValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  summaryLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 5 },
  time: { width: 92, fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'], paddingTop: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  label: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  labelSoft: { color: colors.textMuted },
  note: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 16 },
  followups: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  followupLine: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  followupActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  link: { paddingVertical: 6 },
  linkText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  message: { fontSize: fontSize.xs, color: colors.success },
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  upsellText: { flex: 1, fontSize: fontSize.sm, color: colors.text },
});
