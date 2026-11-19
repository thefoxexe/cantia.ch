import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminCancellationReasons } from '../../../components/AdminCancellationReasons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { EmptyState, LoadingScreen, Switch } from '../../../components/ui';
import { AdminButton, AdminCard, AdminEmpty, AdminPage, AdminSection, AdminTabs, Badge, Fact } from '../../../components/admin/kit';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminOrgStatusPill } from '../../../components/AdminOrgStatusPill';
import { AdminSignupOrigin } from '../../../components/AdminSignupOrigin';
import { OrgUsagePanel } from '../../../components/AdminOrgUsage';
import type { UsageData } from '../../../components/AdminUsagePanel';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { Feather } from '@expo/vector-icons';
import { getOrgBillingStatuses, getOrganizationDetail, getOrganizationEvents, getOrganizationOrigin, getOrganizationUsage, grantTrial, listModules, setOrganizationModule } from '../../../lib/api/admin';
import type { AdminOrgEvent, AdminOrgOrigin } from '../../../lib/api/admin';
import { ORG_MODULES, PROJECT_MODULES, PROJECT_MODULE_PLAN_GATED, defaultProjectModules, projectModulesFor, type ModuleKey } from '../../../lib/modules';
import { supabase } from '../../../lib/supabase';
import type { Plan } from '../../../lib/types';
import type { AdminModuleSummary, AdminOrgBillingStatus, AdminOrganizationDetail } from '../../../lib/types';
import { OrgEmailsPanel } from '../../../components/admin/OrgEmailsPanel';

const STANDARD_MODULE_LABELS = new Map<string, string>([...ORG_MODULES, ...PROJECT_MODULES].map((m) => [m.key, m.label]));

const ROLE_LABEL: Record<string, string> = { owner: 'Propriétaire', admin: 'Administrateur', member: 'Membre' };

const CARD_BRAND_LABEL: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express' };

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  card: 'Carte',
  link: 'Stripe Link',
  twint: 'TWINT',
  paypal: 'PayPal',
  sepa_debit: 'Prélèvement SEPA',
  revolut_pay: 'Revolut Pay',
  amazon_pay: 'Amazon Pay',
  klarna: 'Klarna',
};
const WALLET_LABEL: Record<string, string> = { apple_pay: 'Apple Pay', google_pay: 'Google Pay', link: 'Stripe Link', samsung_pay: 'Samsung Pay' };

function describePaymentMethod(b: AdminOrgBillingStatus): string {
  if (!b.has_payment_method) return 'Aucun moyen de paiement enregistré chez Stripe (aucun type : carte, Link, wallet, TWINT, PayPal…)';
  const type = b.payment_method_type ?? 'inconnu';
  const wallet = b.payment_method_wallet ? ` via ${WALLET_LABEL[b.payment_method_wallet] ?? b.payment_method_wallet}` : '';
  const more = b.payment_methods_count > 1 ? ` · ${b.payment_methods_count} moyens enregistrés` : '';
  if (b.card_brand && b.card_last4) {
    return `${CARD_BRAND_LABEL[b.card_brand] ?? b.card_brand} •••• ${b.card_last4} : exp. ${b.card_exp_month}/${b.card_exp_year}${wallet}${more}`;
  }
  if (type === 'link') return `Stripe Link (carte liée au compte Link, détails non exposés par Stripe)${more}`;
  return `${PAYMENT_METHOD_LABEL[type] ?? type}${wallet}${more}`;
}

function describePaymentMethodSource(b: AdminOrgBillingStatus): string {
  if (b.payment_method_source === 'subscription') return "Défini comme moyen de paiement de l'abonnement";
  if (b.payment_method_source === 'customer_default') return 'Moyen de paiement par défaut du client (utilisé pour l’abonnement)';
  return "Enregistré chez le client mais défini par défaut nulle part : Stripe ne l'utilisera pas automatiquement";
}

function describeChargeOutlook(b: AdminOrgBillingStatus): string {
  if (b.cancel_at_period_end || b.cancel_at) {
    const when = b.cancel_at ?? b.next_invoice_date;
    return `Résiliation programmée${when ? ` le ${formatDate(when)}` : ''} : ne sera plus débité`;
  }
  if (b.will_be_charged) {
    return b.next_invoice_amount_chf != null
      ? `Sera débité : ${formatChf(b.next_invoice_amount_chf)} le ${formatDate(b.next_invoice_date)}`
      : 'Sera débité au prochain cycle';
  }
  if (!['active', 'trialing', 'past_due'].includes(b.subscription_status ?? '')) return 'Ne sera pas débité (abonnement inactif)';
  const atTrialEnd =
    b.subscription_status !== 'trialing'
      ? ''
      : b.trial_end_without_payment_method === 'cancel'
        ? " À la fin de l'essai, Stripe annulera l'abonnement."
        : b.trial_end_without_payment_method === 'pause'
          ? " À la fin de l'essai, Stripe mettra l'abonnement en pause."
          : " À la fin de l'essai, Stripe créera une facture qui ne pourra pas être payée : l'accès sera coupé et l'e-mail « paiement échoué » partira.";
  const why =
    b.checkout_payment_method_collection === 'if_required'
      ? ' (le paiement Stripe a laissé démarrer l’essai sans moyen de paiement)'
      : '';
  return `Ne sera pas débité automatiquement : aucun moyen de paiement par défaut${why}.${atTrialEnd}`;
}

const EVENT_META: Record<AdminOrgEvent['event_type'], { label: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  activated: { label: 'Abonnement activé', icon: 'check-circle', color: colors.success },
  trial_started: { label: "Période d'essai démarrée", icon: 'clock', color: colors.primary },
  plan_changed: { label: 'Changement de plan', icon: 'repeat', color: colors.warning },
  canceled: { label: 'Abonnement résilié', icon: 'x-circle', color: colors.danger },
};

function describeEvent(event: AdminOrgEvent): string | null {
  const d = event.detail ?? {};
  if (event.event_type === 'plan_changed' && d.from && d.to) return `${d.from} → ${d.to}`;
  if (event.event_type === 'canceled' && d.reason === 'payment_failed') return `Paiement échoué (statut Stripe : ${typeof d.status === 'string' ? d.status : '—'})`;
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
  const { id, onglet } = useLocalSearchParams<{ id: string; onglet?: string }>();
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
  const [origin, setOrigin] = useState<AdminOrgOrigin | null>(null);
  const [originError, setOriginError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [planFlags, setPlanFlags] = useState<Plan | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [d, mods, ev, orig, use] = await Promise.all([
      getOrganizationDetail(id),
      listModules(),
      getOrganizationEvents(id),
      getOrganizationOrigin(id),
      getOrganizationUsage(id),
    ]);
    setUsage(use.usage);
    if (d.detail?.organization.plan_id) {
      const { data: planRow } = await supabase.from('plans').select('*').eq('id', d.detail.organization.plan_id).maybeSingle();
      setPlanFlags((planRow as Plan | null) ?? null);
    }
    setUsageError(use.error);
    setDetail(d.detail);
    setAllModules(mods.rows);
    setEvents(ev.rows);
    setOrigin(orig.origin);
    setOriginError(orig.error);
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
      setFeedback(next ? `${moduleName} assigné à ${detail?.organization.name}, actif tout de suite.` : `${moduleName} retiré à ${detail?.organization.name}.`);
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
      setFeedback(`✓ Essai de 30 jours accordé : prochain débit le ${formatDate(trialEnd)}`);
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

  type Tab = 'activite' | 'emails' | 'abonnement' | 'membres' | 'modules' | 'provenance';
  const tab: Tab = (['activite', 'emails', 'abonnement', 'membres', 'modules', 'provenance'] as const).includes(onglet as Tab) ? (onglet as Tab) : 'activite';
  const setTab = (k: Tab) => router.setParams({ onglet: k === 'activite' ? undefined : k });
  const trialEnd = org.trial_ends_at ?? (org.subscription_status === 'trialing' ? billing?.next_invoice_date ?? null : null);
  const nextCharge = billing?.will_be_charged && billing.next_invoice_amount_chf != null ? `${formatChf(billing.next_invoice_amount_chf)} le ${formatDate(billing.next_invoice_date)}` : null;
  const place = [org.locality, org.trade].filter(Boolean).join(' · ');

  return (
    <AdminPage
      back={{ href: '/(admin)/organizations', label: 'Entreprises' }}
      title={org.name}
      subtitle={[`Inscrite le ${formatDate(org.created_at)}`, `${detail.members.length} membre${detail.members.length > 1 ? 's' : ''}`, place].filter(Boolean).join(' · ')}
      actions={
        <>
          {contactEmail ? <AdminButton label="Écrire" icon="mail" onPress={() => Linking.openURL(`mailto:${contactEmail}`).catch(() => {})} /> : null}
          {org.stripe_customer_id ? (
            <AdminButton label="Stripe" icon="external-link" onPress={() => Linking.openURL(`https://dashboard.stripe.com/customers/${org.stripe_customer_id}`).catch(() => {})} />
          ) : null}
          <AdminButton label="Copier l’ID" icon="hash" onPress={copyOrgId} />
        </>
      }
    >
      {error ? <AdminErrorBanner message={error} /> : null}
      {feedback ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}

      <AdminCard>
        <View style={styles.factsRow}>
          <Fact label="Plan" value={org.plan_name} />
          <Fact label="Statut">
            <AdminOrgStatusPill org={org} />
          </Fact>
          <Fact label={org.subscription_status === 'trialing' ? 'Fin de l’essai' : 'Prochain débit'} value={org.subscription_status === 'trialing' ? formatDate(trialEnd) : billingLoading ? '…' : nextCharge ?? '—'} />
          <Fact label="Paiement" value={billingLoading ? '…' : billing?.has_payment_method ? (billing.card_brand && billing.card_last4 ? `${CARD_BRAND_LABEL[billing.card_brand] ?? billing.card_brand} •••• ${billing.card_last4}` : PAYMENT_METHOD_LABEL[billing.payment_method_type ?? ''] ?? 'Enregistré') : 'Aucun'} />
          <Fact label="Contact" value={contactEmail ?? null} />
        </View>
      </AdminCard>

      <AdminTabs
        tabs={[
          { key: 'activite' as const, label: 'Activité' },
          { key: 'emails' as const, label: 'E-mails' },
          { key: 'abonnement' as const, label: 'Abonnement', count: events.length || null },
          { key: 'membres' as const, label: 'Membres', count: detail.members.length },
          { key: 'modules' as const, label: 'Modules', count: detail.private_modules.filter((m) => m.enabled).length || null },
          { key: 'provenance' as const, label: 'Provenance' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'activite' ? (
        usage ? (
          <AdminCard>
            <OrgUsagePanel usage={usage} />
          </AdminCard>
        ) : (
          <AdminCard>
            <AdminEmpty icon="bar-chart-2" title="Aucune donnée d’utilisation" text={usageError ? `Indisponible : ${usageError}` : undefined} />
          </AdminCard>
        )
      ) : null}

      {tab === 'abonnement' ? (
        <View style={{ gap: spacing.xl }}>
          {org.stripe_customer_id || org.promo_code_used ? (
            <AdminSection title="Facturation Stripe" subtitle="Lu en direct chez Stripe.">
              {billingLoading ? (
                <Text style={styles.emptyText}>Vérification auprès de Stripe…</Text>
              ) : (
                <AdminCard style={styles.billingCard}>
                  <View style={styles.billingRow}>
                    <Feather
                      name="credit-card"
                      size={16}
                      color={billing?.payment_method_is_default ? colors.success : billing?.has_payment_method ? colors.warning : colors.danger}
                    />
                    <Text style={styles.billingText}>{billing ? describePaymentMethod(billing) : 'Aucun moyen de paiement enregistré'}</Text>
                  </View>
                  {billing?.has_payment_method ? (
                    <View style={styles.billingRow}>
                      <Feather name="info" size={16} color={colors.textMuted} />
                      <Text style={styles.billingText}>{describePaymentMethodSource(billing)}</Text>
                    </View>
                  ) : null}
                  {billing?.subscription_status ? (
                    <View style={styles.billingRow}>
                      <Feather name={billing.will_be_charged ? 'check-circle' : 'alert-triangle'} size={16} color={billing.will_be_charged ? colors.success : colors.warning} />
                      <Text style={styles.billingText}>{describeChargeOutlook(billing)}</Text>
                    </View>
                  ) : null}
                  {org.promo_code_used ? (
                    <View style={styles.billingRow}>
                      <Feather name="tag" size={16} color={colors.textMuted} />
                      <Text style={styles.billingText}>Code utilisé à l'inscription : {org.promo_code_used}</Text>
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
                            ? 'Confirmer : décale le prochain débit à dans 30 jours'
                            : 'Accorder un essai de 30 jours'}
                      </Text>
                    </Pressable>
                  ) : null}
                </AdminCard>
              )}
            </AdminSection>
          ) : null}

          <AdminSection title="Historique de l'abonnement">
            {eventsLoading ? (
              <Text style={styles.emptyText}>Chargement…</Text>
            ) : events.length === 0 ? (
              <AdminCard>
                <AdminEmpty icon="clock" title="Aucun événement enregistré pour l'instant" />
              </AdminCard>
            ) : (
              <AdminCard padded={false}>
                {events.map((ev, i) => {
                  const meta = EVENT_META[ev.event_type] ?? { label: ev.event_type, icon: 'circle' as const, color: colors.textMuted };
                  const sub = describeEvent(ev);
                  return (
                    <View key={ev.id} style={[styles.eventRow, i > 0 && styles.rowBorder]}>
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
              </AdminCard>
            )}
          </AdminSection>

          <AdminCancellationReasons organizationId={detail.organization.id} />
        </View>
      ) : null}

      {tab === 'membres' ? (
        <AdminCard padded={false}>
          {detail.members.map((m, i) => (
            <Pressable
              key={m.user_id}
              style={({ hovered }: any) => [styles.memberRow, i > 0 && styles.rowBorder, hovered && { backgroundColor: colors.bg }]}
              onPress={() => router.push(`/(admin)/users?q=${encodeURIComponent(m.email)}` as any)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(m.full_name || m.email).slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.memberName}>{m.full_name || m.email}</Text>
                <Text style={styles.memberSubtitle} numberOfLines={1}>
                  {m.email} · {ROLE_LABEL[m.role] ?? m.role}
                </Text>
              </View>
              <View style={styles.memberDates}>
                <Text style={styles.memberMeta}>Vu {formatDateTime(m.last_seen_at)}</Text>
                <Text style={styles.memberMetaSub}>Connexion {formatDateTime(m.last_sign_in_at)}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </AdminCard>
      ) : null}

      {tab === 'modules' ? (
        <View style={{ gap: spacing.xl }}>
          <AdminSection title="Modules sur mesure" subtitle="Assigner un module l’active tout de suite pour cette entreprise. La liste complète est dans Produit › Modules.">
            {nonStandardModules.length === 0 ? (
              <AdminCard>
                <AdminEmpty icon="grid" title="Aucun module sur mesure dans le registre" />
              </AdminCard>
            ) : (
              <AdminCard padded={false}>
                {nonStandardModules.map((mod, i) => {
                  const enabled = enabledByKey.get(mod.key) ?? false;
                  const pending = pendingKeys.has(mod.key);
                  return (
                    <View key={mod.id} style={[styles.moduleRow, i > 0 && styles.rowBorder]}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.moduleTitleRow}>
                          <Text style={styles.memberName}>{mod.name}</Text>
                          {enabled ? <Badge label="Assigné" tone="success" /> : null}
                        </View>
                        {mod.description ? <Text style={styles.memberSubtitle}>{mod.description}</Text> : null}
                      </View>
                      <Switch value={enabled} disabled={pending} onChange={(next) => toggle(mod.key, next, mod.name)} />
                    </View>
                  );
                })}
              </AdminCard>
            )}
          </AdminSection>

          <AdminSection title="Modules de l’entreprise" subtitle="Ce que l’entreprise a allumé elle-même dans ses paramètres.">
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
          </AdminSection>

          <AdminSection title="Outils des nouveaux chantiers">
            <View style={styles.chipRow}>
              {projectModulesFor(org).length === 0 || defaultProjectModules(org).length === 0 ? (
                <Text style={styles.emptyText}>Aucun outil coché d'office.</Text>
              ) : (
                defaultProjectModules(org).map((key) => {
                  const field = PROJECT_MODULE_PLAN_GATED[key as ModuleKey];
                  const planBlocked = !!field && planFlags !== null && !planFlags[field];
                  return (
                    <View key={key} style={[styles.chip, planBlocked && { opacity: 0.45 }]}>
                      <Text style={styles.chipText}>
                        {STANDARD_MODULE_LABELS.get(key) ?? key}
                        {planBlocked ? ' · pas dans son plan' : ''}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </AdminSection>
        </View>
      ) : null}

      {tab === 'emails' ? <OrgEmailsPanel organizationId={org.id} /> : null}

      {tab === 'provenance' ? (
        origin ? (
          <AdminSignupOrigin origin={origin} />
        ) : (
          <AdminCard>
            <AdminEmpty icon="compass" title="Aucune donnée de provenance" text={originError ? `Indisponible : ${originError}` : undefined} />
          </AdminCard>
        )
      ) : null}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  memberDates: { alignItems: 'flex-end' },
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
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
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
  usageCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  billingCard: { gap: spacing.md },
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
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
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
    textAlign: 'right',
  },
  memberMetaSub: {
    fontSize: 10,
    color: colors.textMuted,
    opacity: 0.7,
    textAlign: 'right',
    marginTop: 1,
  },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
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
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
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
