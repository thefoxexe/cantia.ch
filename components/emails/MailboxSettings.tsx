import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getSalesInboxSettings, salesInboxAddress, updateSalesInboxSettings, type SalesInboxSettings } from '../../lib/api/salesEmails';
import { useTranslation } from '../../lib/translations';
import { displayType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { Switch } from '../ui';

// Réglages of App › E-mails: the organization's Cantia address (where the
// mailbox receives), whether received e-mails are filed, and whether devis /
// factures carry that address as Reply-To. Without the Entreprise plan: what
// the mailbox would bring.

export function MailboxSettings({ orgId, hasPlan, onBack }: { orgId: string; hasPlan: boolean; onBack?: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [settings, setSettings] = useState<SalesInboxSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasPlan) getSalesInboxSettings(orgId).then(setSettings);
  }, [orgId, hasPlan]);

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

  const address = settings ? salesInboxAddress(settings.inbox_token) : '';
  async function copy() {
    try {
      if (Platform.OS === 'web') await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard refused: the address stays selectable.
    }
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
      ) : null}
      <Text style={styles.title}>{t('emailHub.settings')}</Text>

      {!hasPlan ? (
        <View style={styles.plan}>
          <Feather name="inbox" size={22} color={colors.primary} />
          <Text style={styles.planTitle}>{t('emailHub.planTitle')}</Text>
          <Text style={styles.lead}>{t('emailHub.planText')}</Text>
          <Pressable onPress={() => router.push('/(app)/compte/facturation' as any)} style={styles.cta}>
            <Text style={styles.ctaText}>{t('emailHub.planCta')}</Text>
          </Pressable>
        </View>
      ) : settings ? (
        <>
          <Text style={styles.lead}>{t('emailHub.settingsLead')}</Text>
          <View style={styles.card}>
            <Text style={styles.label}>{t('emailHub.addressLabel')}</Text>
            <View style={styles.addressRow}>
              <Text style={styles.address} selectable numberOfLines={1}>
                {address}
              </Text>
              <Pressable onPress={copy} style={styles.copy} accessibilityRole="button">
                <Feather name={copied ? 'check' : 'copy'} size={14} color={colors.text} />
                <Text style={styles.copyText}>{copied ? t('emailHub.copied') : t('emailHub.copy')}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <SettingRow label={t('emailHub.enabledLabel')} hint={t('emailHub.enabledHint')} value={settings.enabled} onChange={(v) => patch({ enabled: v })} />
            <View style={styles.divider} />
            <SettingRow label={t('emailHub.replyToLabel')} hint={t('emailHub.replyToHint')} value={settings.reply_to_copy} onChange={(v) => patch({ reply_to_copy: v })} disabled={!settings.enabled} />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.card}>
            <Text style={styles.label}>{t('emailHub.howTitle')}</Text>
            {(['how1', 'how2', 'how3'] as const).map((k, i) => (
              <View key={k} style={styles.how}>
                <Text style={styles.howNum}>{i + 1}</Text>
                <Text style={styles.howText}>{t(`emailHub.${k}`)}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, styles.soon]}>
            <Text style={styles.label}>{t('emailHub.connected')}</Text>
            <Text style={styles.hint}>{t('emailHub.connectedText')}</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function SettingRow({ label, hint, value, onChange, disabled }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <View style={[styles.setting, disabled && { opacity: 0.5 }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <Switch value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, maxWidth: 680 },
  back: { alignSelf: 'flex-start', padding: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  title: { ...displayType, fontSize: 22, fontWeight: '800', color: colors.text },
  lead: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  address: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  copyText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  setting: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  hint: { fontSize: 12.5, lineHeight: 18, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border },
  error: { fontSize: fontSize.sm, color: colors.danger },
  how: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  howNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, color: colors.primaryDark, fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 22 },
  howText: { flex: 1, fontSize: fontSize.sm, lineHeight: 21, color: colors.text },
  soon: { backgroundColor: colors.bg },
  plan: { alignItems: 'flex-start', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg, backgroundColor: colors.surface },
  planTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  cta: { marginTop: spacing.xs, backgroundColor: colors.text, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 16 },
  ctaText: { fontSize: fontSize.sm, fontWeight: '700', color: '#FFFFFF' },
});
