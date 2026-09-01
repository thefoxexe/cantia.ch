import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../../../../lib/supabase';
import { sendExtraWorkEmail, publicExtraWorkUrl } from '../../../../../lib/api/extraWorks';
import { confirm } from '../../../../../lib/confirm';
import { Button, Card, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../../../components/ui';
import { getAppLocale, useTranslation } from '../../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import type { ExtraWork, ExtraWorkItem } from '../../../../../lib/types';

function chf(n: number): string {
  return `${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

export default function ExtraWorkDetailScreen() {
  const { t } = useTranslation();
  const { id, workId } = useLocalSearchParams<{ id: string; workId: string }>();
  const router = useRouter();
  const [work, setWork] = useState<ExtraWork | null>(null);
  const [items, setItems] = useState<ExtraWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: w }, { data: it }] = await Promise.all([
      supabase.from('extra_works').select('*').eq('id', workId).single(),
      supabase.from('extra_work_items').select('*').eq('extra_work_id', workId).order('sort_order', { ascending: true }),
    ]);
    setWork(w ?? null);
    setItems(it ?? []);
    setLoading(false);
  }, [workId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading || !work) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const vat = subtotal * (work.vat_rate / 100);
  const total = subtotal + vat;

  async function handleCopyLink() {
    await Clipboard.setStringAsync(publicExtraWorkUrl(work!.public_token));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  async function handleSendEmail() {
    if (!work!.client_email) {
      setError(t('extraWorkDetail.noEmailForSend'));
      return;
    }
    setSendingEmail(true);
    setError(null);
    const { sent, error: sendError } = await sendExtraWorkEmail(work!.id);
    if (sent && work!.status === 'draft') {
      await supabase.from('extra_works').update({ status: 'sent' }).eq('id', work!.id);
      load();
    }
    setSendingEmail(false);
    if (sendError || !sent) {
      setError(sendError ?? t('extraWorkDetail.emailSendFailed'));
      return;
    }
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 2500);
  }

  async function handleMarkSent() {
    await supabase.from('extra_works').update({ status: 'sent' }).eq('id', work!.id);
    load();
  }

  async function handleRefuse() {
    const ok = await confirm(t('extraWorkDetail.refuseConfirmTitle'), t('extraWorkDetail.refuseConfirmBody'));
    if (!ok) return;
    await supabase.from('extra_works').update({ status: 'refused' }).eq('id', work!.id);
    load();
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.container}>
          <PageHeader title={work.number ?? t('extraWorkDetail.fallbackTitle')} backTo={`/(app)/chantiers/${id}/travaux-supplementaires`} />

          <Card style={{ gap: spacing.sm }}>
            <View style={styles.row}>
              <Text style={styles.title}>{work.title}</Text>
              <StatusBadge status={work.status} />
            </View>
            <Text style={styles.client}>{work.client_name}</Text>
            {work.client_email ? <Text style={styles.meta}>{work.client_email}</Text> : null}
            {work.notes ? <Text style={styles.notes}>{work.notes}</Text> : null}
          </Card>

          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>{t('extraWorkDetail.lines')}</Text>
            {items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemDesc}>{it.description}</Text>
                <Text style={styles.itemQty}>
                  {it.quantity} {it.unit ?? ''}
                </Text>
                <Text style={styles.itemAmount}>{chf(it.quantity * it.unit_price)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalsRow}>
              <Text style={styles.metaLine}>{t('extraWorkDetail.subtotal')}</Text>
              <Text style={styles.line}>{chf(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.metaLine}>{t('extraWorkDetail.vat', { rate: work.vat_rate })}</Text>
              <Text style={styles.line}>{chf(vat)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>{t('extraWorkDetail.total')}</Text>
              <Text style={styles.totalAmount}>{chf(total)}</Text>
            </View>
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {work.status === 'accepted' ? (
            <Card style={styles.acceptedCard}>
              <Text style={styles.acceptedTitle}>
                {work.client_signer_name
                  ? t('extraWorkDetail.acceptedTitleBySigner', { name: work.client_signer_name })
                  : t('extraWorkDetail.acceptedTitle')}
              </Text>
              {work.facture_id ? (
                <Button
                  title={t('extraWorkDetail.viewGeneratedInvoice')}
                  variant="secondary"
                  icon="file-text"
                  onPress={() => router.push(`/(app)/devis/factures/${work.facture_id}` as any)}
                  style={{ marginTop: spacing.sm }}
                />
              ) : null}
            </Card>
          ) : work.status === 'refused' ? (
            <Text style={[styles.meta, { marginTop: spacing.md }]}>{t('extraWorkDetail.refusedNotice')}</Text>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              {work.status === 'draft' ? (
                <Button title={t('extraWorkDetail.markAsSent')} variant="secondary" icon="send" onPress={handleMarkSent} />
              ) : null}
              <Button
                title={linkCopied ? t('extraWorkDetail.linkCopied') : t('extraWorkDetail.copyClientLink')}
                variant="secondary"
                icon={linkCopied ? 'check' : 'link'}
                onPress={handleCopyLink}
              />
              <Button
                title={emailSent ? t('extraWorkDetail.emailSent') : t('extraWorkDetail.sendByEmail')}
                icon="mail"
                onPress={handleSendEmail}
                loading={sendingEmail}
              />
              <Button title={t('extraWorkDetail.markAsRefused')} variant="secondary" icon="x-circle" onPress={handleRefuse} />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  client: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  notes: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemDesc: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  itemQty: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  itemAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    minWidth: 90,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs / 2,
  },
  metaLine: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  line: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.md,
  },
  acceptedCard: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  acceptedTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
  },
});
