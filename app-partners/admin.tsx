import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components/ui';
import { NavButton, PAGE_MAX, PartnersNav, PartnersPage } from '../components/partners/PartnersChrome';
import { usePartnerSession } from '../lib/partners/session';
import {
  amPartnersAdmin,
  formatChf,
  partnersAdmin,
  type AdminCommission,
  type AdminOverview,
  type AdminPartner,
  type AdminPayout,
} from '../lib/partners/api';
import { PARTNERS_COPY } from '../lib/partners/copy';
import { displayType, monoType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Cantia Partners administration (partners.admin permission, checked by
// every database function; this screen only decides what to show). Monthly
// routine: check bank details, prepare the payouts, make the transfers,
// mark them paid. Internal tool: French only.

const TABS = ['toPay', 'partners', 'commissions', 'history'] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = { toPay: 'Versements à faire', partners: 'Partenaires', commissions: 'Commissions', history: 'Historique' };
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  BLOCKED: 'Bloqué',
  PENDING: 'En validation',
  AVAILABLE: 'Disponible',
  PAID: 'Payé',
  CANCELLED: 'Annulé',
  TO_PAY: 'À payer',
};

const date = (iso: string) => new Date(iso).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
const month = (iso: string) => new Date(iso).toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
const formatIban = (iban: string | null) => (iban ?? '').replace(/(.{4})/g, '$1 ').trim();

export default function PartnersAdmin() {
  const router = useRouter();
  const session = usePartnerSession();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [partners, setPartners] = useState<AdminPartner[] | null>(null);
  const [toPay, setToPay] = useState<AdminPayout[] | null>(null);
  const [history, setHistory] = useState<AdminPayout[] | null>(null);
  const [commissions, setCommissions] = useState<AdminCommission[] | null>(null);
  const [tab, setTab] = useState<Tab>('toPay');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const load = useCallback(async () => {
    const [o, p, t, h, c] = await Promise.all([
      partnersAdmin.overview(),
      partnersAdmin.partners(),
      partnersAdmin.payouts('TO_PAY'),
      partnersAdmin.payouts(),
      partnersAdmin.commissions(),
    ]);
    setOverview(o.data);
    setPartners(p.data ?? []);
    setToPay(t.data ?? []);
    setHistory((h.data ?? []).filter((x) => x.status !== 'TO_PAY'));
    setCommissions(c.data ?? []);
  }, []);

  useEffect(() => {
    if (session === null) {
      router.replace('/connexion');
      return;
    }
    if (!session) return;
    amPartnersAdmin().then((ok) => {
      setAllowed(ok);
      if (ok) load();
    });
  }, [session, router, load]);

  async function run(action: () => Promise<{ error: string | null }>, success: string) {
    setBusy(true);
    setMessage(null);
    const { error } = await action();
    setBusy(false);
    setMessage(error ? { text: error, error: true } : { text: success, error: false });
    await load();
  }

  return (
    <PartnersPage nav={<PartnersNav right={<NavButton href="/espace" label="Espace partenaire" />} />}>
      <Head>
        <title>Administration · Cantia Partners</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.wrap}>
        {allowed === null ? (
          <Text style={styles.muted}>Chargement…</Text>
        ) : !allowed ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Accès réservé</Text>
            <Text style={styles.muted}>Cette page est réservée à l’équipe Cantia.</Text>
          </View>
        ) : (
          <>
            <View style={styles.head}>
              <View style={{ flex: 1, minWidth: 240 }}>
                <Text style={styles.eyebrow}>Administration</Text>
                <Text style={styles.h1} role="heading" aria-level={1}>
                  Cantia Partners
                </Text>
              </View>
              {overview ? <Text style={styles.period}>{month(overview.period)}</Text> : null}
            </View>

            {overview ? <Checklist o={overview} busy={busy} onPrepare={() => run(async () => {
              const r = await partnersAdmin.preparePayouts();
              return { error: r.error };
            }, 'Versements préparés.')} /> : null}

            {overview ? (
              <View style={styles.kpis}>
                <Kpi label="Partenaires actifs" value={String(overview.partners_active)} hint={`${overview.partners_new_30d} nouveaux en 30 jours`} />
                <Kpi label="Clics (30 jours)" value={String(overview.clicks_30d)} hint={`${overview.signups_30d} inscriptions`} />
                <Kpi label="Clients payants" value={String(overview.paying_customers)} hint={`${overview.signups_total} inscriptions au total`} />
                <Kpi label="En validation" value={formatChf(overview.pending_chf)} />
                <Kpi label="Disponible" value={formatChf(overview.available_chf)} />
                <Kpi label="Versé au total" value={formatChf(overview.paid_chf)} />
              </View>
            ) : null}

            {message ? <Text style={message.error ? styles.error : styles.info}>{message.text}</Text> : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
              {TABS.map((t) => (
                <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                    {TAB_LABELS[t]}
                    {t === 'toPay' && toPay?.length ? ` (${toPay.length})` : ''}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {tab === 'toPay' ? (
              <ToPay
                payouts={toPay}
                busy={busy}
                onPaid={(id, ref) => run(async () => ({ error: (await partnersAdmin.markPaid(id, ref)).error }), 'Versement marqué comme payé.')}
                onCancel={(id) => run(async () => ({ error: (await partnersAdmin.cancelPayout(id)).error }), 'Versement annulé, commissions remises en disponible.')}
              />
            ) : tab === 'partners' ? (
              <Partners
                partners={partners}
                busy={busy}
                onUpdate={(id, patch, label) => run(async () => ({ error: (await partnersAdmin.setPartner(id, patch)).error }), label)}
              />
            ) : tab === 'commissions' ? (
              <Commissions commissions={commissions} />
            ) : (
              <History payouts={history} />
            )}
          </>
        )}
      </View>
    </PartnersPage>
  );
}

function Checklist({ o, busy, onPrepare }: { o: AdminOverview; busy: boolean; onPrepare: () => void }) {
  const steps = [
    {
      title: 'Coordonnées bancaires',
      detail: o.missing_iban ? `${o.missing_iban} partenaire(s) avec un solde disponible n’ont pas encore d’IBAN.` : 'Tous les partenaires à payer ont un IBAN.',
      done: o.missing_iban === 0,
    },
    {
      title: 'Préparer les versements du mois',
      detail: o.eligible_partners
        ? `${o.eligible_partners} partenaire(s) atteignent CHF ${o.min_payout_chf} : ${formatChf(o.eligible_chf)}.`
        : o.prepared_this_period
          ? `${o.prepared_this_period} versement(s) préparé(s) ce mois-ci.`
          : 'Aucun partenaire n’atteint le minimum ce mois-ci.',
      done: o.eligible_partners === 0,
      action: o.eligible_partners > 0 ? <Button title="Préparer" icon="play" onPress={onPrepare} loading={busy} /> : null,
    },
    {
      title: 'Faire les virements et les marquer payés',
      detail: o.to_pay_count ? `${o.to_pay_count} virement(s) à faire : ${formatChf(o.to_pay_chf)}.` : 'Rien à virer.',
      done: o.to_pay_count === 0,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>Check-list du mois</Text>
        <Text style={styles.muted}>
          {doneCount}/{steps.length} · rappel le {o.reminder_day}, versements le {o.payout_day}
        </Text>
      </View>
      {steps.map((s, i) => (
        <View key={s.title} style={styles.step}>
          <View style={[styles.stepIcon, s.done && styles.stepIconDone]}>
            {s.done ? <Feather name="check" size={14} color="#fff" /> : <Text style={styles.stepNum}>{i + 1}</Text>}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.stepTitle, s.done && { color: colors.textMuted }]}>{s.title}</Text>
            <Text style={styles.small}>{s.detail}</Text>
          </View>
          {s.action ?? null}
        </View>
      ))}
    </View>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {hint ? <Text style={styles.small}>{hint}</Text> : null}
    </View>
  );
}

function CopyValue({ value, mono = true }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <Pressable
      onPress={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, mono ? '' : ' '));
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Selectable anyway.
        }
      }}
      style={styles.copy}
    >
      <Text style={[mono ? styles.mono : styles.value]} selectable>
        {value}
      </Text>
      <Feather name={copied ? 'check' : 'copy'} size={13} color={copied ? colors.success : colors.textMuted} />
    </Pressable>
  );
}

function ToPay({
  payouts,
  busy,
  onPaid,
  onCancel,
}: {
  payouts: AdminPayout[] | null;
  busy: boolean;
  onPaid: (id: string, reference: string) => void;
  onCancel: (id: string) => void;
}) {
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  if (payouts === null) return null;
  if (!payouts.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.muted}>Aucun versement à faire. Préparez ceux du mois depuis la check-list quand des partenaires atteignent le minimum.</Text>
      </View>
    );
  }
  return (
    <View style={styles.stack}>
      {payouts.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.cardHead}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text style={styles.cardTitle}>{p.partner_name}</Text>
              <Text style={styles.small}>{[p.company_name, p.email, `${p.commission_count} commission(s)`, month(p.period)].filter(Boolean).join(' · ')}</Text>
            </View>
            <Text style={styles.amount}>{formatChf(p.amount_chf)}</Text>
          </View>
          <View style={styles.bank}>
            <Field label="Titulaire" value={p.account_holder ?? '–'} mono={false} />
            <Field label="IBAN" value={formatIban(p.iban)} />
            <Field label="Montant" value={Number(p.amount_chf).toFixed(2)} />
            <Field label="Communication" value={p.reference ?? ''} />
          </View>
          <View style={styles.actions}>
            <TextInput
              value={refs[p.id] ?? ''}
              onChangeText={(v) => setRefs((r) => ({ ...r, [p.id]: v }))}
              placeholder="Référence bancaire (facultatif)"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <Button title="Marquer comme payé" icon="check" onPress={() => onPaid(p.id, refs[p.id] ?? '')} loading={busy} />
            <Button
              title={confirmCancel === p.id ? 'Confirmer l’annulation' : 'Annuler'}
              variant={confirmCancel === p.id ? 'danger' : 'secondary'}
              onPress={() => {
                if (confirmCancel === p.id) {
                  setConfirmCancel(null);
                  onCancel(p.id);
                } else setConfirmCancel(p.id);
              }}
              disabled={busy}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <CopyValue value={value} mono={mono} />
    </View>
  );
}

function Pill({ status }: { status: string }) {
  const tone =
    status === 'ACTIVE' || status === 'PAID'
      ? styles.pillOk
      : status === 'BLOCKED' || status === 'CANCELLED'
        ? styles.pillBad
        : status === 'AVAILABLE' || status === 'TO_PAY'
          ? styles.pillInfo
          : styles.pillWarn;
  return (
    <View style={[styles.pill, tone]}>
      <Text style={styles.pillText}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

function Partners({
  partners,
  busy,
  onUpdate,
}: {
  partners: AdminPartner[] | null;
  busy: boolean;
  onUpdate: (id: string, patch: { status?: AdminPartner['status']; frozen?: boolean }, label: string) => void;
}) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  if (partners === null) return null;
  const q = query.trim().toLowerCase();
  const list = q
    ? partners.filter((p) => [p.first_name, p.last_name, p.company_name, p.email, p.code].filter(Boolean).join(' ').toLowerCase().includes(q))
    : partners;
  return (
    <View style={styles.stack}>
      <TextInput value={query} onChangeText={setQuery} placeholder="Rechercher un partenaire, un e-mail, un code…" placeholderTextColor={colors.textMuted} style={styles.input} />
      {list.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.muted}>Aucun partenaire.</Text>
        </View>
      ) : null}
      {list.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.cardHead}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={styles.cardTitle}>
                {p.first_name} {p.last_name}
                {p.company_name ? <Text style={styles.muted}>{`  ·  ${p.company_name}`}</Text> : null}
              </Text>
              <Text style={styles.small}>
                {[p.email, PARTNERS_COPY.fr.types[p.partner_type as keyof typeof PARTNERS_COPY.fr.types] ?? p.partner_type, `code ${p.code ?? '–'}`, `depuis le ${date(p.created_at)}`].join(' · ')}
              </Text>
            </View>
            <Pill status={p.status} />
            {p.payouts_frozen ? <Pill status="Versements gelés" /> : null}
          </View>
          <View style={styles.metrics}>
            <Metric label="Clics" value={String(p.clicks)} />
            <Metric label="Inscriptions" value={String(p.signups)} />
            <Metric label="Payants" value={String(p.paying)} />
            <Metric label="En validation" value={formatChf(p.pending_chf)} />
            <Metric label="Disponible" value={formatChf(p.available_chf)} />
            <Metric label="Versé" value={formatChf(p.paid_chf)} />
            <Metric label="IBAN" value={p.iban_masked ?? 'manquant'} />
          </View>
          <View style={styles.actions}>
            {p.status === 'ACTIVE' ? (
              <Button title="Suspendre" variant="secondary" onPress={() => onUpdate(p.id, { status: 'SUSPENDED' }, 'Partenaire suspendu.')} disabled={busy} />
            ) : (
              <Button title="Réactiver" variant="secondary" onPress={() => onUpdate(p.id, { status: 'ACTIVE' }, 'Partenaire réactivé.')} disabled={busy} />
            )}
            <Button
              title={p.payouts_frozen ? 'Dégeler les versements' : 'Geler les versements'}
              variant="secondary"
              onPress={() => onUpdate(p.id, { frozen: !p.payouts_frozen }, p.payouts_frozen ? 'Versements dégelés.' : 'Versements gelés.')}
              disabled={busy}
            />
            {p.status !== 'BLOCKED' ? (
              <Button
                title={confirm === p.id ? 'Confirmer le blocage' : 'Bloquer'}
                variant="danger"
                onPress={() => {
                  if (confirm === p.id) {
                    setConfirm(null);
                    onUpdate(p.id, { status: 'BLOCKED' }, 'Partenaire bloqué.');
                  } else setConfirm(p.id);
                }}
                disabled={busy}
              />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.small}>{label}</Text>
    </View>
  );
}

function Commissions({ commissions }: { commissions: AdminCommission[] | null }) {
  if (commissions === null) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>50 dernières commissions</Text>
      {commissions.length === 0 ? <Text style={styles.muted}>Aucune commission pour l’instant.</Text> : null}
      {commissions.map((c) => (
        <View key={c.id} style={styles.row}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.rowTitle}>
              {c.partner_name} · {c.kind === 'adjustment' ? 'correction' : c.public_ref}
            </Text>
            <Text style={styles.small}>
              payé le {date(c.paid_at)}
              {c.status === 'PENDING' ? ` · disponible le ${date(c.available_at)}` : ''}
              {c.kind === 'commission' ? ` · base ${formatChf(c.base_amount_chf)}` : ''}
            </Text>
          </View>
          <Text style={[styles.rowAmount, c.amount_chf < 0 && { color: colors.danger }]}>{formatChf(c.amount_chf)}</Text>
          <Pill status={c.status} />
        </View>
      ))}
    </View>
  );
}

function History({ payouts }: { payouts: AdminPayout[] | null }) {
  if (payouts === null) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Versements passés</Text>
      {payouts.length === 0 ? <Text style={styles.muted}>Aucun versement pour l’instant.</Text> : null}
      {payouts.map((p) => (
        <View key={p.id} style={styles.row}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.rowTitle}>
              {p.partner_name} · {month(p.period)}
            </Text>
            <Text style={styles.small}>{[p.reference, p.paid_at ? `payé le ${date(p.paid_at)}` : null].filter(Boolean).join(' · ')}</Text>
          </View>
          <Text style={styles.rowAmount}>{formatChf(p.amount_chf)}</Text>
          <Pill status={p.status} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: 32, gap: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', gap: spacing.md },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  h1: { ...displayType, fontSize: 36, lineHeight: 40, fontWeight: '800', color: colors.text },
  period: { fontSize: fontSize.md, fontWeight: '700', color: colors.textMuted, textTransform: 'capitalize' },
  muted: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted, fontWeight: '400' },
  small: { fontSize: fontSize.xs, lineHeight: 17, color: colors.textMuted },
  stack: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, flexWrap: 'wrap' },
  stepIcon: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepIconDone: { backgroundColor: colors.success, borderColor: colors.success },
  stepNum: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  stepTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexGrow: 1, flexBasis: 170, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  kpiLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  kpiValue: { ...displayType, fontSize: 22, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  tabs: { gap: 4, borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 1 },
  tab: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text },
  amount: { ...displayType, fontSize: 28, fontWeight: '800', color: colors.text },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md },
  field: { flexGrow: 1, flexBasis: 200, gap: 4 },
  fieldLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mono: { ...monoType, fontSize: 13, color: colors.text },
  value: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  input: { flexGrow: 1, minWidth: 220, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metric: { flexGrow: 1, flexBasis: 110, gap: 2 },
  metricValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  rowAmount: { ...monoType, fontSize: 13, fontWeight: '700', color: colors.text },
  pill: { borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.text },
  pillOk: { backgroundColor: colors.successSoft },
  pillBad: { backgroundColor: colors.dangerSoft },
  pillInfo: { backgroundColor: colors.primarySoft },
  pillWarn: { backgroundColor: colors.warningSoft },
  error: { fontSize: fontSize.sm, color: colors.danger },
  info: { fontSize: fontSize.sm, color: colors.success },
});
