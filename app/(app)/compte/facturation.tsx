import { useCallback, useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { openBillingPortal, startCheckout } from '../../../lib/api/billing';
import { openCheckoutUrl } from '../../../lib/openUrl';
import { Button, Container, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Plan } from '../../../lib/types';

export default function FacturationScreen() {
  const { organization, role, refreshOrganization } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';
  const hasActiveSubscription = !!organization?.stripe_subscription_id;

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ data: all }, { data: current }] = await Promise.all([
      supabase.from('plans').select('*').order('price_chf_monthly', { ascending: true }),
      supabase.from('plans').select('*').eq('id', organization.plan_id).maybeSingle(),
    ]);
    setPlans(all ?? []);
    setPlan(current ?? null);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // "Sur devis" plan is never self-serve: no Stripe checkout for it, contact
  // Cantia by e-mail instead. Kept out of paidPlans so it never enters the
  // checkout/upgrade progression below. "decouverte" is the auto-assigned
  // trial, never a checkout target either.
  const paidPlans = useMemo(() => plans.filter((p) => p.id !== 'free' && p.id !== 'decouverte' && !p.is_contact_only), [plans]);
  const isTrialing = organization?.plan_id === 'decouverte';
  const trialDaysLeft = organization?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(organization.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null;
  const contactPlan = useMemo(() => plans.find((p) => p.is_contact_only), [plans]);
  const currentIndex = paidPlans.findIndex((p) => p.id === organization?.plan_id);
  const nextPlan = hasActiveSubscription && currentIndex >= 0 ? paidPlans[currentIndex + 1] : undefined;
  const isMaxPlan = hasActiveSubscription && currentIndex >= 0 && currentIndex === paidPlans.length - 1;

  function contactForCustomPlan() {
    Linking.openURL('mailto:info@cantia.ch?subject=Plan sur mesure Cantia').catch(() => {});
  }

  async function goToCheckout(planId: string) {
    if (!organization || busy) return;
    setError(null);
    setBusy(true);
    const { url, error: err } = await startCheckout(planId);
    if (err || !url) {
      setBusy(false);
      setError(err ?? 'Impossible de démarrer le paiement.');
      return;
    }
    await openCheckoutUrl(url);
    await refreshOrganization();
    await load();
    setBusy(false);
  }

  async function goToPortal(flow?: 'cancel') {
    if (!organization || busy) return;
    setError(null);
    setBusy(true);
    const { url, error: err } = await openBillingPortal(flow);
    if (err || !url) {
      setBusy(false);
      setError(err ?? "Impossible d'ouvrir la gestion de l'abonnement.");
      return;
    }
    await openCheckoutUrl(url);
    await refreshOrganization();
    await load();
    setBusy(false);
  }

  function chooseFromModal(planId: string) {
    setShowChoice(false);
    goToCheckout(planId);
  }

  function pickManageAction(flow?: 'cancel') {
    setShowManage(false);
    goToPortal(flow);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Abonnement" backTo="/(app)/compte" />

          <View style={styles.planRow}>
            <Text style={styles.planName}>{plan?.name ?? '—'}</Text>
            <Text style={styles.planPrice}>
              {plan ? (plan.is_contact_only ? 'Sur devis' : `CHF ${plan.price_chf_monthly}/mois`) : ''}
            </Text>
          </View>
          {plan ? (
            <Text style={styles.meta}>
              {(plan.storage_quota_mb / 1024).toFixed(plan.storage_quota_mb < 1024 ? 1 : 0)} Go de stockage ·{' '}
              {plan.max_members} membre{plan.max_members > 1 ? 's' : ''}
            </Text>
          ) : null}

          {isTrialing ? (
            <View style={styles.trialBanner}>
              <Feather name="clock" size={16} color={colors.accent} />
              <Text style={styles.trialBannerText}>
                Essai Découverte — {trialDaysLeft ?? 0} jour{(trialDaysLeft ?? 0) > 1 ? 's' : ''} restant
                {(trialDaysLeft ?? 0) > 1 ? 's' : ''}. Tout est débloqué pour l'essayer en vrai ; votre carte sera
                débitée automatiquement à la fin de l'essai, sauf annulation avant cette date.
              </Text>
            </View>
          ) : hasActiveSubscription ? (
            <View style={styles.banner}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.bannerText}>
                Abonnement {organization?.subscription_status === 'active' ? 'actif' : organization?.subscription_status}.
                {isMaxPlan
                  ? contactPlan
                    ? ' Vous êtes sur le plan le plus élevé en libre-service. Besoin de plus ? Contactez-nous.'
                    : ' Vous êtes sur le plan le plus élevé.'
                  : ' Le moyen de paiement, le downgrade et la résiliation se gèrent depuis "Gérer mon abonnement".'}
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>
              Passez à un plan payant pour débloquer davantage de stockage et de fonctionnalités.
            </Text>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isAdmin ? (
            <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
              {!hasActiveSubscription ? (
                <Button
                  title="Passer à un plan payant"
                  icon="arrow-up-circle"
                  onPress={() => setShowChoice(true)}
                  loading={busy}
                />
              ) : null}
              {nextPlan ? (
                <Button
                  title={`Passer à ${nextPlan.name} (CHF ${nextPlan.price_chf_monthly}/mois)`}
                  icon="arrow-up-circle"
                  onPress={() => goToCheckout(nextPlan.id)}
                  loading={busy}
                />
              ) : null}
              {isMaxPlan && contactPlan ? (
                <Button title="Nous contacter (plan sur mesure)" icon="mail" variant="secondary" onPress={contactForCustomPlan} />
              ) : null}
              {hasActiveSubscription ? (
                <Button
                  title="Gérer mon abonnement"
                  icon="settings"
                  variant="secondary"
                  onPress={() => setShowManage(true)}
                  loading={busy}
                />
              ) : null}
            </View>
          ) : null}
        </Container>
      </ScrollView>

      {/* Free -> paid: pick which paid plan before ever touching Stripe,
          instead of always sending everyone to the cheapest one. */}
      <Modal visible={showChoice} animationType="slide" transparent onRequestClose={() => setShowChoice(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choisissez votre plan</Text>
              <Pressable onPress={() => setShowChoice(false)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>
            {paidPlans.map((p) => (
              <Pressable key={p.id} style={styles.planOption} onPress={() => chooseFromModal(p.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planOptionName}>{p.name}</Text>
                  <Text style={styles.planOptionMeta}>
                    {(p.storage_quota_mb / 1024).toFixed(p.storage_quota_mb < 1024 ? 1 : 0)} Go · {p.max_members} membre
                    {p.max_members > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.planOptionPrice}>CHF {p.price_chf_monthly}/mois</Text>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
            {contactPlan ? (
              <Pressable
                style={styles.planOption}
                onPress={() => {
                  setShowChoice(false);
                  contactForCustomPlan();
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.planOptionName}>{contactPlan.name}</Text>
                  <Text style={styles.planOptionMeta}>Plus de 10 personnes, besoins spécifiques — sur devis</Text>
                </View>
                <Text style={styles.planOptionPrice}>Nous contacter</Text>
                <Feather name="mail" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* "Gérer mon abonnement": either the full Stripe portal, or a direct
          shortcut into Stripe's own cancellation flow. */}
      <Modal visible={showManage} animationType="slide" transparent onRequestClose={() => setShowManage(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Gérer mon abonnement</Text>
              <Pressable onPress={() => setShowManage(false)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>
            <Pressable style={styles.planOption} onPress={() => pickManageAction()}>
              <Feather name="credit-card" size={18} color={colors.text} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planOptionName}>Gérer mon abonnement</Text>
                <Text style={styles.planOptionMeta}>Moyen de paiement, factures, changer de plan</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
            <Pressable style={styles.planOption} onPress={() => pickManageAction('cancel')}>
              <Feather name="x-circle" size={18} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.planOptionName, { color: colors.danger }]}>Résilier mon abonnement</Text>
                <Text style={styles.planOptionMeta}>Annuler directement sur Stripe</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
      </Modal>
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
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  trialBannerText: {
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
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  planOptionName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  planOptionMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  planOptionPrice: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
});
