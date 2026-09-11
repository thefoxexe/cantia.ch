import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Container, EmptyState, LoadingScreen, PageHeader, Switch } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminOrgStatusPill } from '../../../components/AdminOrgStatusPill';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { Feather } from '@expo/vector-icons';
import { getOrgBillingStatuses, getOrganizationDetail, getOrganizationEvents, grantTrial, listModules, setOrganizationModule } from '../../../lib/api/admin';
import type { AdminOrgEvent } from '../../../lib/api/admin';
import { ORG_MODULES, PROJECT_MODULES } from '../../../lib/modules';
import type { AdminModuleSummary, AdminOrgBillingStatus, AdminOrganizationDetail } from '../../../lib/types';

const STANDARD_MODULE_LABELS = new Map<string, string>([...ORG_MODULES, ...PROJECT_MODULES].map((m) => [m.key, m.label]));

const CARD_BRAND_LABEL: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express' };

const EVENT_META: Record<AdminOrgEvent['event_type'], { label: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  activated: { label: 'Abonnement activé', icon: 'check-circle', color: colors.success },
  trial_started: { label: "Période d'essai démarrée", icon: 'clock', color: colors.primary },
  plan_changed: { label: 'Changement de plan', icon: 'repeat', color: colors.warning },
  canceled: { label: 'Abonnement résilié', icon: 'x-circle', color: colors.danger },
};

function describeEvent(event: AdminOrgEvent): string | null {
  const d = event.detail ?? {};
  if (event.event_type === 'plan_changed' && d.from && d.to) return `${d.from} → ${d.to}`;
  if (event.event_type === 'canceled' && d.was_trialing) return "Résilié pendant la période d'essai";
  if (event.event_type === 'trial_started' && typeof d.trial_end === 'string') return `Jusqu'au ${formatDate(d.trial_end)}`;
  if ((event.event_type === 'activated' || event.event_type === 'trial_started') && typeof d.plan_id === 'string') return `Plan : ${d.plan_id}`;
  return null;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Signup/last-seen moments need the time, not just the day — the admin
// dashboard is used to trace exactly when something happened, and "aujourd'hui"
// alone doesn't answer that. Billing dates (trial end, next invoice) stay
// date-only via formatDate above; those are just calendar deadlines.
function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatChf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
}

export default function AdminOrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<AdminOrganizationDetail | null>(null);
  const [allModules, setAllModules] = useState<AdminModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<AdminOrgBillingStatus | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [confirmingTrial, setConfirmingTrial] = useState(false);
  const [grantingTrial, setGrantingTrial] = useState(false);
  const [events, setEvents] = useState<AdminOrgEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [d, mods, ev] = await Promise.all([getOrganizationDetail(id), listModules(), getOrganizationEvents(id)]);
    setDetail(d.detail);
    setAllModules(mods.rows);
    setEvents(ev.rows);
    setEventsLoading(false);
    setError(d.error ?? mods.error);
    setLoading(false);
    setBillingLoading(true);
    const { statuses } = await getOrgBillingStatuses([id]);
    setBilling(statuses[id] ?? null);
    setBillingLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const enabledByKey = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const m of detail?.private_modules ?? []) map.set(m.key, m.enabled);
    return map;
  }, [detail]);

  const nonStandardModules = useMemo(() => allModules.filter((m) => m.visibility !== 'standard'), [allModules]);

  async function toggle(moduleKey: string, next: boolean, moduleName: string) {
    if (!id) return;
    setPendingKeys((prev) => new Set(prev).add(moduleKey));
    const { error } = await setOrganizationModule(id, moduleKey, next);
    setPendingKeys((prev) => {
      const copy = new Set(prev);
      copy.delete(moduleKey);
      return copy;
    });
    if (error) {
      setFeedback(`Erreur : ${error}`);
    } else {
      setFeedback(next ? `✓ ${moduleName} activé pour ${detail?.organization.name}` : `${moduleName} désactivé pour ${detail?.organization.name}`);
      await load();
    }
    setTimeout(() => setFeedback(null), 4000);
  }

  // Sets trial_end 30 days out directly on the Stripe subscription — real
  // trial time, never a discount. Ends the current billing period early
  // and starts a fresh trial until then, so it's meant for someone who
  // hasn't really started paying yet (e.g. their first period was
  // accidentally waived), not for truncating an established customer's
  // already-paid period — hence the confirm step.
  async function handleGrantTrial() {
    if (!id) return;
    if (!confirmingTrial) {
      setConfirmingTrial(true);
      setTimeout(() => setConfirmingTrial(false), 5000);
      return;
    }
    setConfirmingTrial(false);
    setGrantingTrial(true);
    const { trialEnd, error: err } = await grantTrial(id);
    setGrantingTrial(false);
    if (err || !trialEnd) {
      setFeedback(`Erreur : ${err ?? 'échec inconnu'}`);
    } else {
      setFeedback(`✓ Essai de 30 jours accordé — prochain débit le ${formatDate(trialEnd)}`);
      await load();
    }
    setTimeout(() => setFeedback(null), 4000);
  }

  if (loading) return <LoadingScreen label="Chargement de l'entreprise…" />;
  if (!detail) return <EmptyState title="Entreprise introuvable" />;

  const org = detail.organization;
  const owner = detail.members.find((m) => m.role === 'owner');
  const contactEmail = owner?.email ?? org.email;

  async function copyOrgId() {
    await Clipboard.setStringAsync(org.id);
    setFeedback('✓ Identifiant copié');
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    // style={{ flex: 1 }} is required here: a bare <ScrollView> inside this
    // layout's flex:1/minHeight:0 content column doesn't reliably get a
    // constrained height on web, so it never gets a scrollable viewport —
    // the page just silently doesn't scroll once content overflows.
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <PageHeader title={org.name} backTo="/(admin)/organizations" />

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={copyOrgId}>
            <Feather name="hash" size={13} color={colors.text} />
            <Text style={styles.actionButtonText}>Copier l'ID</Text>
          </Pressable>
          {contactEmail ? (
            <Pressable
              style={styles.actionButton}
              onPress={() => Linking.openURL(`mailto:${contactEmail}`).catch(() => {})}
            >
              <Feather name="mail" size={13} color={colors.text} />
              <Text style={styles.actionButtonText}>Contacter le propriétaire</Text>
            </Pressable>
          ) : null}
          {org.stripe_customer_id ? (
            <Pressable
              style={styles.actionButton}
              onPress={() => Linking.openURL(`https://dashboard.stripe.com/customers/${org.stripe_customer_id}`).catch(() => {})}
            >
              <Feather name="external-link" size={13} color={colors.text} />
              <Text style={styles.actionButtonText}>Voir dans Stripe</Text>
            </Pressable>
          ) : null}
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        {feedback ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={styles.infoValue}>{org.plan_name}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Statut abonnement</Text>
            <AdminOrgStatusPill org={org} />
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Essai jusqu'au</Text>
            <Text style={styles.infoValue}>
              {formatDate(org.trial_ends_at ?? (org.subscription_status === 'trialing' ? billing?.next_invoice_date ?? null : null))}
            </Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Créée le</Text>
            <Text style={styles.infoValue}>{formatDateTime(org.created_at)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Identifiant</Text>
            <Text style={styles.infoValueMono} numberOfLines={1}>
              {org.id}
            </Text>
          </View>
        </View>

        {org.stripe_customer_id || org.promo_code_used ? (
          <>
            <Text style={styles.sectionTitle}>Facturation Stripe</Text>
            {billingLoading ? (
              <Text style={styles.emptyText}>Vérification auprès de Stripe…</Text>
            ) : (
              <View style={styles.billingCard}>
                <View style={styles.billingRow}>
                  <Feather name="credit-card" size={16} color={billing?.has_payment_method ? colors.success : colors.danger} />
                  <Text style={styles.billingText}>
                    {billing?.has_payment_method
                      ? billing.card_brand && billing.card_last4
                        ? `${CARD_BRAND_LABEL[billing.card_brand] ?? billing.card_brand} •••• ${billing.card_last4} — exp. ${billing.card_exp_month}/${billing.card_exp_year}`
                        : billing.payment_method_type === 'link'
                          ? 'Moyen de paiement enregistré via Stripe Link (carte liée à un numéro de téléphone, détails non exposés par Stripe)'
                          : `Moyen de paiement enregistré (${billing.payment_method_type ?? 'type inconnu'})`
                      : 'Aucune carte enregistrée'}
                  </Text>
                </View>
                {billing?.subscription_status ? (
                  <View style={styles.billingRow}>
                    <Feather name={billing.will_be_charged ? 'check-circle' : 'alert-triangle'} size={16} color={billing.will_be_charged ? colors.success : colors.warning} />
                    <Text style={styles.billingText}>
                      {billing.will_be_charged
                        ? billing.next_invoice_amount_chf != null
                          ? `Sera débité : ${formatChf(billing.next_invoice_amount_chf)} le ${formatDate(billing.next_invoice_date)}`
                          : 'Sera débité au prochain cycle'
                        : billing.cancel_at_period_end
                          ? "Résiliation programmée — ne sera plus débité"
                          : "Ne sera pas débité (pas de carte ou abonnement inactif)"}
                    </Text>
                  </View>
                ) : null}
                {org.promo_code_used ? (
                  <View style={styles.billingRow}>
                    <Feather name="tag" size={16} color={colors.textMuted} />
                    <Text style={styles.billingText}>Code promo utilisé à l'inscription : {org.promo_code_used}</Text>
                  </View>
                ) : null}
                {org.stripe_subscription_id ? (
                  <Pressable
                    style={[styles.trialButton, confirmingTrial && styles.trialButtonConfirm]}
                    onPress={handleGrantTrial}
                    disabled={grantingTrial}
                  >
                    <Feather name="clock" size={14} color={confirmingTrial ? '#fff' : colors.primary} />
                    <Text style={[styles.trialButtonText, confirmingTrial && styles.trialButtonTextConfirm]}>
                      {grantingTrial
                        ? 'Application…'
                        : confirmingTrial
                          ? 'Confirmer — décale le prochain débit à dans 30 jours'
                          : 'Accorder un essai de 30 jours'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Historique de l'abonnement</Text>
        {eventsLoading ? (
          <Text style={styles.emptyText}>Chargement…</Text>
        ) : events.length === 0 ? (
          <Text style={[styles.emptyText, { marginBottom: spacing.xl }]}>Aucun événement enregistré pour l'instant.</Text>
        ) : (
          <View style={styles.list}>
            {events.map((ev) => {
              const meta = EVENT_META[ev.event_type];
              const sub = describeEvent(ev);
              return (
                <View key={ev.id} style={styles.eventRow}>
                  <View style={[styles.eventIcon, { backgroundColor: `${meta.color}1a` }]}>
                    <Feather name={meta.icon} size={14} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{meta.label}</Text>
                    {sub ? <Text style={styles.memberSubtitle}>{sub}</Text> : null}
                  </View>
                  <Text style={styles.memberMeta}>{formatDateTime(ev.created_at)}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Membres ({detail.members.length})</Text>
        <View style={styles.list}>
          {detail.members.map((m) => (
            <Pressable
              key={m.user_id}
              style={styles.memberRow}
              onPress={() => router.push(`/(admin)/users?q=${encodeURIComponent(m.email)}` as any)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{m.full_name || m.email}</Text>
                <Text style={styles.memberSubtitle}>
                  {m.email} · {m.role}
                </Text>
              </View>
              <Text style={styles.memberMeta}>Dernière connexion : {m.last_sign_in_at ? formatDateTime(m.last_sign_in_at) : 'jamais'}</Text>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Modules standards</Text>
        <View style={styles.chipRow}>
          {detail.standard_modules.length === 0 ? (
            <Text style={styles.emptyText}>Aucun module standard activé.</Text>
          ) : (
            detail.standard_modules.map((key) => (
              <View key={key} style={styles.chip}>
                <Text style={styles.chipText}>{STANDARD_MODULE_LABELS.get(key) ?? key}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Modules privés / Extensions</Text>
        <View style={styles.list}>
          {nonStandardModules.length === 0 ? (
            <Text style={styles.emptyText}>Aucun module privé enregistré dans le registre.</Text>
          ) : (
            nonStandardModules.map((mod) => {
              const enabled = enabledByKey.get(mod.key) ?? false;
              const pending = pendingKeys.has(mod.key);
              return (
                <View key={mod.id} style={styles.moduleRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.moduleTitleRow}>
                      <Text style={styles.memberName}>{mod.name}</Text>
                      <View style={[styles.visibilityPill, mod.visibility === 'experimental' && styles.visibilityPillExperimental]}>
                        <Text style={styles.visibilityPillText}>{mod.visibility === 'experimental' ? 'Beta' : 'Privé'}</Text>
                      </View>
                    </View>
                    {mod.description ? <Text style={styles.memberSubtitle}>{mod.description}</Text> : null}
                  </View>
                  <Switch value={enabled} disabled={pending} onChange={(next) => toggle(mod.key, next, mod.name)} />
                </View>
              );
            })
          )}
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  feedback: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  feedbackText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  infoCell: {
    minWidth: 160,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '700',
  },
  infoValueMono: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  billingCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  billingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  trialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  trialButtonConfirm: {
    backgroundColor: colors.warning,
  },
  trialButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  trialButtonTextConfirm: {
    color: '#fff',
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  memberName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  memberSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  memberMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  eventIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visibilityPill: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  visibilityPillExperimental: {
    backgroundColor: colors.warningSoft,
  },
  visibilityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
