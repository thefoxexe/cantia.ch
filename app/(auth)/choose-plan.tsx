import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { startCheckout } from '../../lib/api/billing';
import { openCheckoutUrl } from '../../lib/openUrl';
import { Button, Card, Screen } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { Plan } from '../../lib/types';

export default function ChoosePlanScreen() {
  const { organization, refreshOrganization } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [stayingFree, setStayingFree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .neq('id', 'free')
      .order('price_chf_monthly', { ascending: true })
      .then(({ data }) => setPlans(data ?? []));
  }, []);

  async function choosePlan(planId: string) {
    if (!organization || busyPlan) return;
    setError(null);
    setBusyPlan(planId);

    // Fetch the Stripe URL before touching plan_selected: flipping that
    // flag first triggers the root layout's redirect away from this screen,
    // which raced the checkout request and left Stripe's tab never opened.
    const { url, error: err } = await startCheckout(planId, billingInterval);
    if (err || !url) {
      setBusyPlan(null);
      setError(err ?? 'Impossible de démarrer le paiement.');
      return;
    }

    // The choice is locked in the moment you pick a plan — you can always
    // upgrade, downgrade or cancel later from Facturation, but this gate
    // only ever needs to be crossed once.
    await supabase.from('organizations').update({ plan_selected: true }).eq('id', organization.id);

    if (Platform.OS === 'web') {
      // Leaving the SPA for Stripe entirely — no need to refresh local state
      // first, the app reloads fresh on return.
      openCheckoutUrl(url);
      return;
    }

    await refreshOrganization();
    // On native this opens an in-app browser sheet and waits for it to close
    // (either Stripe redirecting back to our app, or the user dismissing it
    // manually) instead of handing off to an external browser with no way
    // back — see lib/openUrl.ts.
    await openCheckoutUrl(url);
    await refreshOrganization();
    setBusyPlan(null);
  }

  async function stayFree() {
    if (!organization || stayingFree) return;
    setStayingFree(true);
    await supabase.from('organizations').update({ plan_selected: true }).eq('id', organization.id);
    await refreshOrganization();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisissez votre plan</Text>
          <Text style={styles.subtitle}>
            Votre espace <Text style={{ fontWeight: '700', color: colors.text }}>{organization?.name}</Text> est
            créé. Choisissez la formule qui vous convient pour commencer.
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.billingToggle}>
          <Pressable
            onPress={() => setBillingInterval('month')}
            style={[styles.billingToggleOption, billingInterval === 'month' && styles.billingToggleOptionActive]}
          >
            <Text style={[styles.billingToggleText, billingInterval === 'month' && styles.billingToggleTextActive]}>Mensuel</Text>
          </Pressable>
          <Pressable
            onPress={() => setBillingInterval('year')}
            style={[styles.billingToggleOption, billingInterval === 'year' && styles.billingToggleOptionActive]}
          >
            <Text style={[styles.billingToggleText, billingInterval === 'year' && styles.billingToggleTextActive]}>Annuel</Text>
            <View style={styles.billingToggleSaveBadge}>
              <Text style={styles.billingToggleSaveText}>-20%</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {plans.map((p, i) => (
            <PlanCard
              key={p.id}
              plan={p}
              billingInterval={billingInterval}
              highlight={i === 0}
              loading={busyPlan === p.id}
              disabled={!!busyPlan}
              onChoose={() => choosePlan(p.id)}
            />
          ))}
        </View>

        <Pressable onPress={stayFree} disabled={stayingFree} style={styles.freeLink} hitSlop={8}>
          {stayingFree ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <Text style={styles.freeLinkText}>Rester sur la version gratuite</Text>
          )}
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function PlanCard({
  plan,
  billingInterval,
  highlight,
  loading,
  disabled,
  onChoose,
}: {
  plan: Plan;
  billingInterval: 'month' | 'year';
  highlight: boolean;
  loading: boolean;
  disabled: boolean;
  onChoose: () => void;
}) {
  const isYearly = billingInterval === 'year';
  const displayMonthly = isYearly && plan.price_chf_yearly != null ? plan.price_chf_yearly / 12 : plan.price_chf_monthly;
  return (
    <Card style={[styles.card, highlight && styles.cardHighlight]}>
      {highlight ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Recommandé</Text>
        </View>
      ) : null}
      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>CHF {Number.isInteger(displayMonthly) ? displayMonthly : displayMonthly.toFixed(2)}</Text>
        <Text style={styles.period}>/mois</Text>
      </View>
      {isYearly && plan.price_chf_yearly != null ? (
        <Text style={styles.yearlyNote}>Facturé CHF {plan.price_chf_yearly.toFixed(2)}/an</Text>
      ) : null}
      <View style={styles.features}>
        <Feature text={`${(plan.storage_quota_mb / 1024).toFixed(plan.storage_quota_mb < 1024 ? 1 : 0)} Go de stockage`} />
        <Feature text={`${plan.max_members} membre${plan.max_members > 1 ? 's' : ''}`} />
        <Feature text="Rapports & devis illimités" />
        <Feature text="Levés & cadastre suisse" muted={!plan.has_rtk} />
      </View>
      <Button
        title={`Choisir ${plan.name}`}
        onPress={onChoose}
        loading={loading}
        disabled={disabled && !loading}
        variant={highlight ? 'primary' : 'secondary'}
        style={{ marginTop: spacing.lg }}
      />
    </Card>
  );
}

function Feature({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Feather name={muted ? 'x' : 'check'} size={14} color={muted ? colors.textMuted : colors.success} />
      <Text style={[styles.featureText, muted && styles.featureTextMuted]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 460,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  billingToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
    marginBottom: spacing.lg,
  },
  billingToggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  billingToggleOptionActive: {
    backgroundColor: colors.surface,
  },
  billingToggleText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  billingToggleTextActive: {
    color: colors.text,
  },
  billingToggleSaveBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  billingToggleSaveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  yearlyNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  card: {
    width: 280,
    gap: spacing.xs,
  },
  cardHighlight: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  planName: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  period: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  features: {
    gap: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  featureTextMuted: {
    color: colors.textMuted,
  },
  freeLink: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  freeLinkText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
