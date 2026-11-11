import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CalendarConnections } from '../../../components/planning/CalendarSheet';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { connectBexio, disconnectBexio, getIntegration, setBexioAutoSync, syncBexio } from '../../../lib/api/integrations';
import { Button, Container, PageHeader, AppScreen } from '../../../components/ui';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Integration } from '../../../lib/types';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(`${getAppLocale()}-CH`, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function IntegrationsScreen() {
  const { t } = useTranslation();
  const { organization, role, user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ bexio?: string; message?: string }>();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [entitled, setEntitled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data }, { data: plan }] = await Promise.all([
      getIntegration(organization.id, 'bexio'),
      supabase.from('plans').select('has_bexio_integration').eq('id', organization.plan_id).maybeSingle(),
    ]);
    setIntegration(data);
    setEntitled(!!plan?.has_bexio_integration);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // The OAuth callback lands back here with ?bexio=connected|error — surface
  // it once, then drop the params so a manual refresh doesn't re-show it.
  useFocusEffect(
    useCallback(() => {
      if (params.bexio === 'connected') {
        setNotice(t('integrationsSettings.bexioConnected'));
        router.setParams({ bexio: undefined, message: undefined });
      } else if (params.bexio === 'error') {
        setError(params.message ? String(params.message) : t('integrationsSettings.bexioConnectFailed'));
        router.setParams({ bexio: undefined, message: undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.bexio, params.message]),
  );

  async function handleConnect() {
    if (!organization || busy || !entitled) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { outcome, error: err } = await connectBexio(organization.id);
    if (err) setError(err);
    if (outcome === 'connected') await load();
    setBusy(false);
  }

  async function handleDisconnect() {
    if (!organization || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: err } = await disconnectBexio(organization.id);
    if (err) {
      setError(err);
    } else {
      setNotice(t('integrationsSettings.bexioDisconnected'));
      await load();
    }
    setBusy(false);
  }

  async function handleSyncNow() {
    if (!organization || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: err } = await syncBexio(organization.id, 'all');
    if (err) {
      setError(err);
    } else {
      setNotice(t('integrationsSettings.syncComplete'));
      await load();
    }
    setBusy(false);
  }

  async function handleToggleAutoSync(value: boolean) {
    if (!organization || busy) return;
    setBusy(true);
    setError(null);
    const { error: err } = await setBexioAutoSync(organization.id, value);
    if (err) setError(err);
    await load();
    setBusy(false);
  }

  const isConnected = integration?.status === 'connected';
  const needsReconnect = isConnected && !!integration?.needs_reconnect;
  const locked = !loading && !entitled;

  return (
    <AppScreen>
      <Container>
        <PageHeader title={t('integrationsSettings.title')} subtitle={t('integrationsSettings.pageSubtitle')} backTo="/(app)/compte" />
        {error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {notice ? (
          <View style={styles.noticeBanner}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        <Text style={styles.eyebrow}>{t('integrationsSettings.sectionAccounting')}</Text>
        <Text style={styles.sectionDesc}>{t('integrationsSettings.sectionAccountingDesc')}</Text>
        <View style={[styles.card, locked && styles.cardLocked]}>
          <View style={styles.cardHeader}>
            <View style={[styles.logoBadge, locked && styles.logoBadgeLocked]}>
              <Image source={require('../../../assets/integrations/bexio-logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, locked && styles.textLocked]}>Bexio</Text>
              <Text style={[styles.cardSubtitle, locked && styles.textLocked]}>
                {locked
                  ? t('integrationsSettings.subtitleLocked')
                  : // The status pill on the right already says « Connecté ».
                    t('integrationsSettings.subtitleDisconnected')}
              </Text>
            </View>
            {locked ? (
              <Feather name="lock" size={16} color={colors.textMuted} />
            ) : (
              <View style={[styles.statusPill, isConnected ? styles.statusPillOn : null]}>
                <View style={[styles.statusPillDot, { backgroundColor: isConnected ? colors.success : colors.textMuted }]} />
                <Text style={[styles.statusPillText, isConnected && { color: colors.success }]}>
                  {isConnected ? t('integrationsSettings.statusConnected') : t('integrationsSettings.statusOff')}
                </Text>
              </View>
            )}
          </View>

          {loading ? (
            <Text style={styles.helperText}>{t('integrationsSettings.loading')}</Text>
          ) : locked ? (
            <Pressable style={styles.upgradeButton} onPress={() => router.push('/(app)/compte/facturation')}>
              <Text style={styles.upgradeText}>{t('integrationsSettings.seePlans')}</Text>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </Pressable>
          ) : isConnected ? (
            <View style={styles.details}>
              {needsReconnect ? (
                <View style={styles.reconnectBanner}>
                  <Feather name="alert-triangle" size={14} color={colors.warning} />
                  <Text style={styles.reconnectText}>{t('integrationsSettings.reconnectHint')}</Text>
                  {isAdmin ? (
                    <Pressable style={styles.reconnectButton} onPress={handleConnect} disabled={busy}>
                      <Text style={styles.reconnectButtonText}>{t('integrationsSettings.reconnectBexio')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('integrationsSettings.company')}</Text>
                <Text style={styles.detailValue}>{integration?.external_company_name || integration?.external_company_id || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('integrationsSettings.lastSync')}</Text>
                <Text style={styles.detailValue}>{formatDateTime(integration?.last_sync_at ?? null)}</Text>
              </View>
              {!isAdmin ? null : (
                <>
                  <View style={styles.autoSyncRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>{t('integrationsSettings.autoSync')}</Text>
                      <Text style={styles.autoSyncHint}>{t('integrationsSettings.autoSyncHint')}</Text>
                    </View>
                    <Switch
                      value={!!integration?.auto_sync_enabled}
                      onValueChange={handleToggleAutoSync}
                      disabled={busy}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                  <View style={styles.actionsRow}>
                    <Pressable style={styles.syncButton} onPress={handleSyncNow} disabled={busy}>
                      <Feather name="refresh-cw" size={14} color={colors.text} />
                      <Text style={styles.syncText}>{t('integrationsSettings.syncNow')}</Text>
                    </Pressable>
                    <Pressable style={styles.disconnectButton} onPress={handleDisconnect} disabled={busy}>
                      <Text style={styles.disconnectText}>{t('integrationsSettings.disconnect')}</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ) : isAdmin ? (
            <Button title={t('integrationsSettings.connectBexio')} onPress={handleConnect} loading={busy} style={{ marginTop: spacing.md }} />
          ) : (
            <Text style={styles.helperText}>{t('integrationsSettings.adminOnlyHint')}</Text>
          )}
          {/* What travels, inside the card it explains. */}
          <View style={styles.howBlock}>
            <Text style={styles.howTitle}>{t('integrationsSettings.howItWorks')}</Text>
            <Text style={styles.footnote}>
              {locked ? t('integrationsSettings.footnoteLocked') : t('integrationsSettings.footnoteUnlocked')}
            </Text>
          </View>
        </View>

        {/* Each person's own calendar (Planning ↔ Google Agenda). */}
        <Text style={[styles.eyebrow, { marginTop: spacing.xxl }]}>{t('integrationsSettings.calendarSectionTitle')}</Text>
        <Text style={styles.sectionDesc}>{t('integrationsSettings.sectionCalendarDesc')}</Text>
        {organization && user ? (
          <View style={styles.card}>
            <CalendarConnections organizationId={organization.id} userId={user.id} />
          </View>
        ) : null}
      </Container>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: colors.primary },
  sectionDesc: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt },
  statusPillOn: { backgroundColor: colors.successSoft },
  statusPillDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  howBlock: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  howTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: 4 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FDECEC',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E9F7EF',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: {
    flex: 1,
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#0A3A47',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoBadgeLocked: {
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  logoImage: {
    width: 42,
    height: 42,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  textLocked: {
    color: colors.textMuted,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  upgradeText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  details: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  reconnectBanner: {
    backgroundColor: '#FDF3E3',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reconnectText: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: '600',
    lineHeight: 16,
  },
  reconnectButton: {
    alignSelf: 'flex-start',
  },
  reconnectButtonText: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  autoSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  autoSyncHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  syncText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  disconnectButton: {
    paddingHorizontal: 12,
    minHeight: 38,
    justifyContent: 'center',
  },
  disconnectText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  footnote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
