import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { connectBexio, disconnectBexio, getIntegration, setBexioAutoSync, syncBexio } from '../../../lib/api/integrations';
import { Button, Container, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Integration } from '../../../lib/types';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function IntegrationsScreen() {
  const { organization, role } = useAuth();
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
        setNotice('Bexio est connecté.');
        router.setParams({ bexio: undefined, message: undefined });
      } else if (params.bexio === 'error') {
        setError(params.message ? String(params.message) : 'La connexion à Bexio a échoué.');
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
      setNotice('Bexio a été déconnecté.');
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
      setNotice('Synchronisation terminée.');
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
  const locked = !loading && !entitled;

  return (
    <Screen>
      <Container>
        <PageHeader title="Intégrations" backTo="/(app)/compte" />
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

        <View style={[styles.card, locked && styles.cardLocked]}>
          <View style={styles.cardHeader}>
            <View style={[styles.logoBadge, locked && styles.logoBadgeLocked]}>
              <Image source={require('../../../assets/integrations/bexio-logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, locked && styles.textLocked]}>Bexio</Text>
              <Text style={[styles.cardSubtitle, locked && styles.textLocked]}>
                {locked
                  ? 'Disponible à partir du plan Entreprise'
                  : isConnected
                    ? 'Connecté'
                    : "Synchronisez vos clients, produits et factures avec Bexio."}
              </Text>
            </View>
            {locked ? (
              <Feather name="lock" size={16} color={colors.textMuted} />
            ) : isConnected ? (
              <View style={styles.statusDot} />
            ) : null}
          </View>

          {loading ? (
            <Text style={styles.helperText}>Chargement…</Text>
          ) : locked ? (
            <Pressable style={styles.upgradeButton} onPress={() => router.push('/(app)/compte/facturation')}>
              <Text style={styles.upgradeText}>Voir les plans</Text>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </Pressable>
          ) : isConnected ? (
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Entreprise</Text>
                <Text style={styles.detailValue}>{integration?.external_company_name || integration?.external_company_id || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dernière synchronisation</Text>
                <Text style={styles.detailValue}>{formatDateTime(integration?.last_sync_at ?? null)}</Text>
              </View>
              {!isAdmin ? null : (
                <>
                  <View style={styles.autoSyncRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Synchronisation automatique</Text>
                      <Text style={styles.autoSyncHint}>Statut des factures relevé chaque heure</Text>
                    </View>
                    <Switch
                      value={!!integration?.auto_sync_enabled}
                      onValueChange={handleToggleAutoSync}
                      disabled={busy}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                  <Pressable style={styles.syncButton} onPress={handleSyncNow} disabled={busy}>
                    <Feather name="refresh-cw" size={14} color={colors.primary} />
                    <Text style={styles.syncText}>Synchroniser maintenant</Text>
                  </Pressable>
                  <Pressable style={styles.disconnectButton} onPress={handleDisconnect} disabled={busy}>
                    <Feather name="x-circle" size={14} color={colors.danger} />
                    <Text style={styles.disconnectText}>Déconnecter</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : isAdmin ? (
            <Button title="Connecter Bexio" onPress={handleConnect} loading={busy} style={{ marginTop: spacing.md }} />
          ) : (
            <Text style={styles.helperText}>Seul un administrateur peut connecter Bexio.</Text>
          )}
        </View>

        <Text style={styles.footnote}>
          {locked
            ? "L'intégration Bexio permet de synchroniser vos clients, produits et factures. Elle est incluse à partir du plan Entreprise."
            : "Vos clients et vos articles Bexio sont importés automatiquement à la connexion et à chaque synchronisation (les articles viennent alimenter votre Catalogue). Les factures voyagent dans les deux sens : envoyez une facture Cantia vers Bexio depuis son détail, ou créez-la directement dans Bexio — elle apparaît ici à la synchronisation suivante, avec son statut de paiement tenu à jour."}
        </Text>
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  syncText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  disconnectText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  footnote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
