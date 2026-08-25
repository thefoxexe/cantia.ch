import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { connectBexio, disconnectBexio, getIntegration } from '../../../lib/api/integrations';
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
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data, error: err } = await getIntegration(organization.id, 'bexio');
    setIntegration(data);
    if (err) setError(err);
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
    if (!organization || busy) return;
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

  const isConnected = integration?.status === 'connected';

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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Bexio</Text>
              <Text style={styles.cardSubtitle}>
                {isConnected ? 'Connecté' : "Synchronisez vos clients, produits et factures avec Bexio."}
              </Text>
            </View>
            {isConnected ? <View style={styles.statusDot} /> : null}
          </View>

          {loading ? (
            <Text style={styles.helperText}>Chargement…</Text>
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
                <Pressable style={styles.disconnectButton} onPress={handleDisconnect} disabled={busy}>
                  <Feather name="x-circle" size={14} color={colors.danger} />
                  <Text style={styles.disconnectText}>Déconnecter</Text>
                </Pressable>
              )}
            </View>
          ) : isAdmin ? (
            <Button title="Connecter Bexio" onPress={handleConnect} loading={busy} style={{ marginTop: spacing.md }} />
          ) : (
            <Text style={styles.helperText}>Seul un administrateur peut connecter Bexio.</Text>
          )}
        </View>

        <Text style={styles.footnote}>
          La synchronisation des contacts, produits et factures avec Bexio est en cours de construction — pour l'instant, seule la connexion
          de votre compte Bexio est disponible.
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#1C2B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: fontSize.md,
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
