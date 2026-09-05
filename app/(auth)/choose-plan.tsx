import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { startCheckout } from '../../lib/api/billing';
import { openCheckoutUrl } from '../../lib/openUrl';
import { Button, Card, Screen, Switch } from '../../components/ui';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { Plan } from '../../lib/types';

export default function ChoosePlanScreen() {
  const { t } = useTranslation();
  const { organization, refreshOrganization, isPlatformAdmin } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .neq('id', 'free')
      .neq('id', 'decouverte')
      .eq('is_contact_only', false)
      .order('price_chf_monthly', { ascending: true })
      .then(({ data }) => setPlans(data ?? []));
  }, []);

  async function choosePlan(planId: string) {
    if (!organization || busyPlan) return;
    setError(null);
    setBusyPlan(planId);

    // Nothing is written to the organization here — plan_id/plan_selected
    // only become real once stripe-webhook sees a completed Checkout
    // Session (see app/_layout.tsx's gate). Setting plan_selected
    // optimistically at this point used to let someone reach the app
    // without ever finishing (or even opening) the Stripe checkout tab.
    // The 14-day trial is automatic server-side (stripe-checkout grants it
    // once per org) — no promo code needed here. A longer trial for a
    // specific existing customer is granted directly on their Stripe
    // subscription from the admin panel, never through this screen.
    const { url, error: err } = await startCheckout(planId, billingInterval);
    if (err || !url) {
      setBusyPlan(null);
      setError(err ?? t('authChoosePlan.checkoutStartError'));
      return;
    }

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('authChoosePlan.title')}</Text>
          <Text style={styles.subtitle}>
            {t('authChoosePlan.subtitle', { name: organization?.name ?? '' })}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {isPlatformAdmin ? (
          <Pressable style={styles.adminShortcut} onPress={() => router.replace('/(admin)')}>
            <Feather name="shield" size={16} color={colors.primary} />
            <Text style={styles.adminShortcutText}>{t('authChoosePlan.adminAccess')}</Text>
          </Pressable>
        ) : null}

        <View style={styles.promoBanner}>
          <Feather name="gift" size={16} color={colors.primary} />
          <Text style={styles.promoBannerText}>
            {t('authChoosePlan.trialBanner')}
          </Text>
        </View>

        <Pressable
          onPress={() => setBillingInterval((v) => (v === 'year' ? 'month' : 'year'))}
          style={styles.billingToggle}
        >
          <Text style={styles.billingToggleLabel}>
            {billingInterval === 'year' ? t('authChoosePlan.billingYearly') : t('authChoosePlan.billingMonthly')}
          </Text>
          <View style={styles.billingToggleSaveBadge}>
            <Text style={styles.billingToggleSaveText}>-20%</Text>
          </View>
          <Switch value={billingInterval === 'year'} onChange={(v) => setBillingInterval(v ? 'year' : 'month')} />
        </Pressable>

        <View style={styles.grid}>
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              billingInterval={billingInterval}
              highlight={p.id === 'equipe'}
              loading={busyPlan === p.id}
              disabled={!!busyPlan}
              onChoose={() => choosePlan(p.id)}
            />
          ))}
        </View>

        <Pressable
          style={styles.contactCard}
          onPress={() => router.push((getAppLocale() === 'de' ? '/de/sur-mesure' : '/sur-mesure') as any)}
          hitSlop={8}
        >
          <Feather name="tool" size={16} color={colors.textMuted} />
          <Text style={styles.contactCardText}>
            {t('authChoosePlan.contactText')}{' '}
            <Text style={styles.contactCardLink}>{t('authChoosePlan.contactLink')}</Text>
          </Text>
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
  const { t } = useTranslation();
  const PLAN_TAGLINE = t('authChoosePlan.planTaglines', { returnObjects: true }) as Record<string, string>;
  const PLAN_HIGHLIGHTS = t('authChoosePlan.planHighlights', { returnObjects: true }) as Record<string, string[]>;
  const isYearly = billingInterval === 'year';
  // is_contact_only plans are filtered out of the query this screen loads
  // from (self-serve checkout only), so price_chf_monthly is always set here.
  const displayMonthly = (isYearly && plan.price_chf_yearly != null ? plan.price_chf_yearly / 12 : plan.price_chf_monthly) ?? 0;
  return (
    <Card style={[styles.card, highlight && styles.cardHighlight]}>
      {highlight ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('authChoosePlan.recommended')}</Text>
        </View>
      ) : null}
      <Text style={styles.planName}>{plan.name}</Text>
      {PLAN_TAGLINE[plan.id] ? <Text style={styles.tagline}>{PLAN_TAGLINE[plan.id]}</Text> : null}
      <View style={styles.priceRow}>
        <Text style={styles.price}>CHF {Number.isInteger(displayMonthly) ? displayMonthly : displayMonthly.toFixed(2)}</Text>
        <Text style={styles.period}>{t('authChoosePlan.perMonth')}</Text>
      </View>
      {isYearly && plan.price_chf_yearly != null ? (
        <Text style={styles.yearlyNote}>{t('authChoosePlan.billedYearly', { amount: plan.price_chf_yearly.toFixed(2) })}</Text>
      ) : null}
      <View style={styles.features}>
        <Feature text={t('authChoosePlan.storageFeature', { gb: (plan.storage_quota_mb / 1024).toFixed(plan.storage_quota_mb < 1024 ? 1 : 0) })} />
        <Feature text={t('authChoosePlan.membersFeature', { count: plan.max_members })} />
        {(PLAN_HIGHLIGHTS[plan.id] ?? []).map((text) => (
          <Feature key={text} text={text} />
        ))}
      </View>
      <Button
        title={t('authChoosePlan.choosePlanBtn', { name: plan.name })}
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
  adminShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  adminShortcutText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    maxWidth: 460,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  promoBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primaryDark,
    lineHeight: 18,
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  billingToggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
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
  tagline: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: spacing.xs,
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    maxWidth: 460,
    marginTop: spacing.xxl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  contactCardText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
  },
  contactCardLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
