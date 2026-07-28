import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { openBillingPortal, startCheckout } from '../../../lib/api/billing';
import { Button, Container, Screen } from '../../../components/ui';
import { SettingsHeader } from '../../../components/SettingsHeader';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

export default function FacturationScreen() {
  const { organization, role } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';
  const hasActiveSubscription = !!organization?.stripe_subscription_id;

  const load = useCallback(async () => {
    if (!organization) return;
    const { data } = await supabase.from('plans').select('*').eq('id', organization.plan_id).maybeSingle();
    setPlan(data ?? null);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleBillingButton() {
    if (!organization || !isAdmin || busy) return;
    setError(null);

    if (hasActiveSubscription) {
      setBusy(true);
      const { url, error: err } = await openBillingPortal();
      setBusy(false);
      if (err || !url) {
        setError(err ?? "Impossible d'ouvrir la gestion de l'abonnement.");
        return;
      }
      Linking.openURL(url);
      return;
    }

    setBusy(true);
    const { url, error: err } = await startCheckout('solo');
    setBusy(false);
    if (err || !url) {
      setError(err ?? 'Impossible de démarrer le paiement.');
      return;
    }
    Linking.openURL(url);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <SettingsHeader title="Facturation" />

          <View style={styles.planRow}>
            <Text style={styles.planName}>{plan?.name ?? '—'}</Text>
            <Text style={styles.planPrice}>{plan ? `CHF ${plan.price_chf_monthly}/mois` : ''}</Text>
          </View>
          {plan ? (
            <Text style={styles.meta}>
              {(plan.storage_quota_mb / 1024).toFixed(plan.storage_quota_mb < 1024 ? 1 : 0)} Go de stockage ·{' '}
              {plan.max_members} membre{plan.max_members > 1 ? 's' : ''}
            </Text>
          ) : null}

          {hasActiveSubscription ? (
            <View style={styles.banner}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.bannerText}>
                Abonnement {organization?.subscription_status === 'active' ? 'actif' : organization?.subscription_status}.
                Le changement de plan, le moyen de paiement et la résiliation se gèrent depuis le portail Stripe.
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>
              Passez à un plan payant pour débloquer les levés RTK, le cadastre suisse et davantage de stockage.
            </Text>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isAdmin ? (
            <Button
              title={hasActiveSubscription ? 'Changer de plan' : 'Passer à un plan payant'}
              icon="external-link"
              variant={hasActiveSubscription ? 'secondary' : 'primary'}
              onPress={handleBillingButton}
              loading={busy}
              style={{ marginTop: spacing.lg }}
            />
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  planName: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  planPrice: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  bannerText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 17,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.md,
  },
});
