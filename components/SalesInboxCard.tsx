import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  getSalesInboxSettings,
  regenerateSalesInbox,
  salesInboxAddress,
  updateSalesInboxSettings,
  type SalesInboxSettings,
} from '../lib/api/salesEmails';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/translations';
import { monoType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { Button, Card, Switch } from './ui';

// "Suivi des e-mails" block of Paramètres › Automatisations (plan
// Entreprise). One switch: devis and factures sent from Cantia carry the
// organization's Cantia address next to its own in "Répondre à", so a
// client's reply is filed on the document with nothing to do
// (supabase/functions/_shared/sales-inbox.ts). The address itself, for Cci
// and forwards from Outlook / Gmail, sits under "Options avancées".
export function SalesInboxCard({ orgId, orgEmail }: { orgId: string; orgEmail: string | null }) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SalesInboxSettings | null>(null);
  const [count30, setCount30] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setSettings(await getSalesInboxSettings(orgId));
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { count } = await supabase.from('sales_emails').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).gte('occurred_at', since);
    setCount30(count ?? 0);
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!settings) return null;
  const address = salesInboxAddress(settings.inbox_token);

  async function patch(p: Partial<SalesInboxSettings>) {
    setError(null);
    const previous = settings;
    setSettings((s) => (s ? { ...s, ...p } : s));
    const { error: err } = await updateSalesInboxSettings(orgId, p);
    if (err) {
      setError(err);
      setSettings(previous);
    }
  }

  async function copy() {
    try {
      if (Platform.OS === 'web') await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused: the address stays selectable.
    }
  }

  async function regenerate() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    const { token, error: err } = await regenerateSalesInbox(orgId);
    if (err) setError(err);
    else if (token) setSettings((s) => (s ? { ...s, inbox_token: token } : s));
  }

  const replyTarget = orgEmail || t('salesInbox.ownerEmail');

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t('salesInbox.enable')}</Text>
          <Text style={styles.hint}>{t('salesInbox.enableHint')}</Text>
        </View>
        <Switch value={settings.enabled && settings.reply_to_copy} onChange={(v) => patch({ enabled: v, reply_to_copy: v, ...(v && settings.reply_delivery === 'email' ? { reply_delivery: 'both' as const } : {}) })} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={styles.label}>{t('salesInbox.howTitle')}</Text>
        <Way step={1} icon="send" title={t('salesInbox.step1Title')} text={t('salesInbox.step1')} />
        <Way step={2} icon="corner-down-left" title={t('salesInbox.step2Title')} text={t('salesInbox.step2', { email: replyTarget })} />
        <Way step={3} icon="inbox" title={t('salesInbox.step3Title')} text={t('salesInbox.step3')} />
        <Text style={styles.hint}>{t('salesInbox.nothingToDo')}</Text>
        {count30 !== null && settings.enabled ? <Text style={styles.count}>{t('salesInbox.count30', { count: count30 })}</Text> : null}
      </View>

      {!orgEmail ? <Text style={styles.warning}>{t('salesInbox.noOrgEmail')}</Text> : null}

      {settings.enabled ? (
        <View style={styles.advanced}>
          <Pressable onPress={() => setAdvanced((v) => !v)} style={styles.advancedToggle}>
            <Feather name={advanced ? 'chevron-down' : 'chevron-right'} size={14} color={colors.textMuted} />
            <Text style={styles.advancedTitle}>{t('salesInbox.advanced')}</Text>
          </Pressable>
          {advanced ? (
            <View style={{ gap: spacing.md }}>
              <Text style={styles.hint}>{t('salesInbox.advancedIntro')}</Text>
              <View style={styles.addressRow}>
                <Text style={styles.address} selectable numberOfLines={1}>
                  {address}
                </Text>
                <Button title={copied ? t('salesInbox.copied') : t('salesInbox.copy')} icon={copied ? 'check' : 'copy'} variant="secondary" onPress={copy} />
              </View>
              <Text style={styles.hint}>{t('salesInbox.tip')}</Text>
              <Pressable onPress={regenerate} style={styles.regenerate}>
                <Feather name="refresh-cw" size={13} color={confirming ? colors.danger : colors.textMuted} />
                <Text style={[styles.regenerateText, confirming && { color: colors.danger }]}>
                  {confirming ? t('salesInbox.regenerateConfirm') : t('salesInbox.regenerate')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
      {error ? <Text style={styles.warning}>{error}</Text> : null}
    </Card>
  );
}

function Way({ step, icon, title, text }: { step: number; icon: keyof typeof Feather.glyphMap; title: string; text: string }) {
  return (
    <View style={styles.way}>
      <View style={styles.wayIcon} accessibilityLabel={String(step)}>
        <Feather name={icon} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.wayTitle}>{title}</Text>
        <Text style={styles.hint}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17, marginTop: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  address: {
    ...monoType,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 200,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  way: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  wayIcon: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  wayTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  warning: { fontSize: fontSize.sm, color: colors.warning, lineHeight: 19 },
  count: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  advanced: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.md },
  advancedToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  advancedTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  regenerate: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  regenerateText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
});
