import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import QRCode from 'qrcode';
import { Button, Field } from '../ui';
import { PAGE_MAX, useIsWide } from './PartnersChrome';
import { QrCode } from './QrCode';
import { usePartnersCopy } from '../../lib/partners/locale';
import { PARTNERS_APP_COPY } from '../../lib/partners/appCopy';
import { fill } from '../../lib/partners/copy';
import {
  formatChf,
  getMyPartnerCommissions,
  getMyPartnerPayouts,
  getMyPartnerReferrals,
  getMyPartnerStats,
  getMyPartnerSummary,
  LEVEL_THRESHOLDS,
  PARTNER_LINK_BASE,
  setPayoutAccount,
  type PartnerCommission,
  type PartnerLevel,
  type PartnerPayout,
  type PartnerProfile,
  type PartnerReferral,
  type PartnerStats,
  type PartnerSummary,
} from '../../lib/partners/api';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const TABS = ['overview', 'clients', 'commissions', 'payouts', 'resources', 'profile'] as const;
type Tab = (typeof TABS)[number];
const TAB_ICONS: Record<Tab, keyof typeof Feather.glyphMap> = {
  overview: 'grid',
  clients: 'users',
  commissions: 'percent',
  payouts: 'credit-card',
  resources: 'share-2',
  profile: 'user',
};
const LEVELS: PartnerLevel[] = ['MEMBER', 'CONFIRMED', 'PREMIUM'];

function useAppCopy() {
  const { locale, copy } = usePartnersCopy();
  return { locale, copy, app: PARTNERS_APP_COPY[locale] };
}

function useDate() {
  const { locale } = usePartnersCopy();
  return (iso: string, withYear = true) =>
    new Date(iso).toLocaleDateString(`${locale}-CH`, withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' });
}

// Next payout date: the payout day of this month, or of next month once
// it has passed.
function nextPayoutDate(day: number): Date {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), day);
  return candidate.getTime() > now.getTime() ? candidate : new Date(now.getFullYear(), now.getMonth() + 1, day);
}

export function PartnerDashboard({ profile, code, email }: { profile: PartnerProfile; code: string | null; email: string | null }) {
  const { app, copy } = useAppCopy();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const wide = useIsWide();
  const [tab, setTab] = useState<Tab>('overview');
  const [summary, setSummary] = useState<PartnerSummary | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [referrals, setReferrals] = useState<PartnerReferral[] | null>(null);
  const [commissions, setCommissions] = useState<PartnerCommission[] | null>(null);
  const [payouts, setPayouts] = useState<PartnerPayout[] | null>(null);
  const [profileState, setProfileState] = useState(profile);
  const link = code ? `${PARTNER_LINK_BASE}${code}` : null;

  useEffect(() => {
    if (params.tab && (TABS as readonly string[]).includes(params.tab)) setTab(params.tab as Tab);
  }, [params.tab]);

  useEffect(() => {
    getMyPartnerSummary().then(setSummary);
    getMyPartnerStats().then(setStats);
    getMyPartnerReferrals().then(setReferrals);
    getMyPartnerCommissions().then(setCommissions);
    getMyPartnerPayouts().then(setPayouts);
  }, []);

  function go(next: Tab) {
    setTab(next);
    router.setParams({ tab: next });
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 220, gap: 4 }}>
          <Text style={styles.h1} role="heading" aria-level={1}>
            {fill(copy.dashboard.hello, { name: profileState.first_name })}
          </Text>
          <Text style={styles.muted}>{profileState.company_name || copy.types[profileState.partner_type]}</Text>
        </View>
        {summary ? <LevelBadge level={summary.level} /> : null}
      </View>

      {profileState.status !== 'ACTIVE' ? (
        <View style={styles.alert}>
          <Feather name="alert-triangle" size={16} color={colors.danger} />
          <Text style={styles.alertText}>{copy.dashboard.suspended}</Text>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => go(t)} style={[styles.tab, tab === t && styles.tabActive]} accessibilityRole="tab" aria-selected={tab === t}>
            <Feather name={TAB_ICONS[t]} size={15} color={tab === t ? colors.text : colors.textMuted} />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{app.tabs[t]}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === 'overview' ? (
        <Overview summary={summary} stats={stats} commissions={commissions} link={link} code={code} wide={wide} onSeeAll={() => go('commissions')} />
      ) : tab === 'clients' ? (
        <Clients stats={stats} referrals={referrals} />
      ) : tab === 'commissions' ? (
        <Commissions commissions={commissions} />
      ) : tab === 'payouts' ? (
        <Payouts payouts={payouts} summary={summary} profile={profileState} onSaved={(p) => setProfileState(p)} />
      ) : tab === 'resources' ? (
        <Resources link={link} code={code} />
      ) : (
        <ProfileTab profile={profileState} email={email} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------

function LevelBadge({ level }: { level: PartnerLevel }) {
  const { app } = useAppCopy();
  return (
    <View style={[styles.badge, level === 'PREMIUM' && styles.badgePremium, level === 'CONFIRMED' && styles.badgeConfirmed]}>
      <Feather name="award" size={14} color={level === 'MEMBER' ? colors.text : '#fff'} />
      <Text style={[styles.badgeText, level !== 'MEMBER' && { color: '#fff' }]}>{app.level.names[level]}</Text>
    </View>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string | null; accent?: boolean }) {
  return (
    <View style={[styles.kpi, accent && styles.kpiAccent]}>
      <Text style={[styles.kpiLabel, accent && { color: '#F6E4D2' }]}>{label}</Text>
      <Text style={[styles.kpiValue, accent && { color: '#fff' }]}>{value}</Text>
      {hint ? <Text style={[styles.kpiHint, accent && { color: '#F6E4D2' }]}>{hint}</Text> : null}
    </View>
  );
}

function Overview({
  summary,
  stats,
  commissions,
  link,
  code,
  wide,
  onSeeAll,
}: {
  summary: PartnerSummary | null;
  stats: PartnerStats | null;
  commissions: PartnerCommission[] | null;
  link: string | null;
  code: string | null;
  wide: boolean;
  onSeeAll: () => void;
}) {
  const { app, copy } = useAppCopy();
  const date = useDate();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused: the link stays selectable.
    }
  }

  const payoutHint = summary ? fill(app.nextPayout, { date: date(nextPayoutDate(summary.payout_day).toISOString(), false), min: summary.min_payout_chf }) : null;
  const availableHint = summary?.next_available_at ? fill(app.nextAvailable, { date: date(summary.next_available_at, false) }) : null;

  return (
    <View style={styles.stack}>
      <View style={styles.kpis}>
        <Kpi label={app.kpis.available} value={summary ? formatChf(summary.available_chf + summary.in_payout_chf) : '–'} hint={payoutHint} accent />
        <Kpi label={app.kpis.pending} value={summary ? formatChf(summary.pending_chf) : '–'} hint={availableHint} />
        <Kpi label={app.kpis.paid} value={summary ? formatChf(summary.paid_chf) : '–'} />
        <Kpi label={app.kpis.paying} value={summary ? String(summary.paying_customers) : '–'} />
      </View>

      <View style={[styles.row2, wide && { flexDirection: 'row' }]}>
        <View style={[styles.card, wide && { flex: 1.2 }]}>
          <Text style={styles.cardTitle}>{copy.dashboard.linkTitle}</Text>
          {link ? (
            <View style={[styles.linkRow, !wide && { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={{ flex: 1, gap: spacing.md, alignSelf: 'stretch' }}>
                <View style={styles.linkBox}>
                  <Text style={styles.linkText} selectable numberOfLines={1}>
                    {link}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Button title={copied ? copy.dashboard.copied : copy.dashboard.copy} icon={copied ? 'check' : 'copy'} onPress={copyLink} />
                  <Text style={styles.muted}>
                    {copy.dashboard.code} <Text style={styles.mono}>{code}</Text>
                  </Text>
                </View>
                <Text style={styles.small}>{copy.dashboard.linkText}</Text>
              </View>
              <QrCode value={link} size={120} />
            </View>
          ) : null}
        </View>
        <LevelCard summary={summary} stats={stats} wide={wide} />
      </View>

      <Milestones summary={summary} stats={stats} />

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{app.activity}</Text>
          {commissions && commissions.length ? (
            <Pressable onPress={onSeeAll}>
              <Text style={styles.link}>{app.seeAll} →</Text>
            </Pressable>
          ) : null}
        </View>
        {commissions === null ? null : commissions.length === 0 ? (
          <Text style={styles.muted}>{app.noActivity}</Text>
        ) : (
          commissions.slice(0, 5).map((c) => <CommissionRow key={c.id} c={c} compact />)
        )}
      </View>
    </View>
  );
}

function LevelCard({ summary, stats, wide }: { summary: PartnerSummary | null; stats: PartnerStats | null; wide: boolean }) {
  const { app } = useAppCopy();
  if (!summary) return <View style={[styles.card, wide && { flex: 1 }]} />;
  const index = LEVELS.indexOf(summary.level);
  const next = LEVELS[index + 1] as PartnerLevel | undefined;
  const count = summary.paying_customers;
  const from = LEVEL_THRESHOLDS[summary.level];
  const to = next ? LEVEL_THRESHOLDS[next] : from;
  const progress = next ? Math.min(1, (count - from) / Math.max(1, to - from)) : 1;
  void stats;
  return (
    <View style={[styles.card, styles.levelCard, wide && { flex: 1 }]}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{app.level.title}</Text>
        <LevelBadge level={summary.level} />
      </View>
      <View style={styles.levelSteps}>
        {LEVELS.map((l, i) => (
          <View key={l} style={styles.levelStep}>
            <View style={[styles.levelDot, i <= index && styles.levelDotOn]} />
            <Text style={[styles.levelStepText, i <= index && { color: colors.text, fontWeight: '700' }]}>{app.level.names[l]}</Text>
            <Text style={styles.levelStepHint}>{LEVEL_THRESHOLDS[l]}+</Text>
          </View>
        ))}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>
      <Text style={styles.small}>{next ? fill(app.level.progress, { count, target: to, level: app.level.names[next] }) : app.level.top}</Text>
      <Text style={styles.benefitsTitle}>{app.level.benefitsTitle}</Text>
      {LEVELS.slice(0, index + 1).flatMap((l) => app.level.benefits[l]).map((b) => (
        <View key={b} style={styles.benefit}>
          <Feather name="check" size={14} color={colors.success} />
          <Text style={styles.benefitText}>{b}</Text>
        </View>
      ))}
      {next ? (
        <>
          <Text style={styles.benefitsTitle}>{fill(app.level.nextTitle, { level: app.level.names[next] })}</Text>
          {app.level.benefits[next].map((b) => (
            <View key={b} style={styles.benefit}>
              <Feather name="lock" size={13} color={colors.textMuted} />
              <Text style={[styles.benefitText, { color: colors.textMuted }]}>{b}</Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

function Milestones({ summary, stats }: { summary: PartnerSummary | null; stats: PartnerStats | null }) {
  const { app } = useAppCopy();
  const paying = summary?.paying_customers ?? 0;
  const items: { label: string; done: boolean; icon: keyof typeof Feather.glyphMap }[] = [
    { label: app.milestones.firstClick, done: (stats?.clicks ?? 0) > 0, icon: 'mouse-pointer' },
    { label: app.milestones.firstSignup, done: (stats?.signups ?? 0) > 0, icon: 'user-plus' },
    { label: app.milestones.firstPaying, done: paying >= 1 || (summary?.lifetime_chf ?? 0) > 0, icon: 'check-circle' },
    { label: app.milestones.firstPayout, done: (summary?.paid_chf ?? 0) > 0, icon: 'credit-card' },
    { label: fill(app.milestones.levelReached, { level: app.level.names.CONFIRMED }), done: paying >= LEVEL_THRESHOLDS.CONFIRMED, icon: 'shield' },
    { label: fill(app.milestones.levelReached, { level: app.level.names.PREMIUM }), done: paying >= LEVEL_THRESHOLDS.PREMIUM, icon: 'award' },
  ];
  const doneCount = items.filter((m) => m.done).length;
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{app.milestones.title}</Text>
        <Text style={styles.small}>{doneCount} / {items.length}</Text>
      </View>
      <View style={styles.milestones}>
        {items.map((m) => (
          <View key={m.label} style={[styles.milestone, m.done && styles.milestoneDone]}>
            <View style={[styles.milestoneIcon, m.done && styles.milestoneIconDone]}>
              <Feather name={m.done ? 'check' : m.icon} size={15} color={m.done ? '#fff' : colors.textMuted} />
            </View>
            <Text style={[styles.milestoneText, m.done && { color: colors.text }]}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Clients({ stats, referrals }: { stats: PartnerStats | null; referrals: PartnerReferral[] | null }) {
  const { app, copy } = useAppCopy();
  const date = useDate();
  const steps: [string, number | undefined][] = [
    [copy.dashboard.stats.clicks, stats?.clicks],
    [copy.dashboard.stats.visitors, stats?.unique_visitors],
    [copy.dashboard.stats.signups, stats?.signups],
    [copy.dashboard.stats.trials, stats?.trials],
    [copy.dashboard.stats.active, stats?.active_customers],
  ];
  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{app.funnel}</Text>
        <View style={styles.funnel}>
          {steps.map(([label, value], i) => (
            <View key={label} style={styles.funnelStep}>
              <Text style={styles.funnelValue}>{value ?? '–'}</Text>
              <Text style={styles.funnelLabel}>{label}</Text>
              {i < steps.length - 1 ? <Feather name="chevron-right" size={16} color={colors.border} style={styles.funnelArrow} /> : null}
            </View>
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.dashboard.referrals}</Text>
        {referrals === null ? null : referrals.length === 0 ? (
          <Text style={styles.muted}>{copy.dashboard.noReferrals}</Text>
        ) : (
          <Table
            head={[copy.dashboard.ref, copy.dashboard.since, copy.dashboard.plan, copy.dashboard.status]}
            rows={referrals.map((r) => [r.public_ref, date(r.attributed_at), r.plan_name ?? '–', copy.dashboard.statuses[r.status] ?? r.status])}
            mono={[0]}
          />
        )}
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: PartnerCommission['status'] | PartnerPayout['status'] }) {
  const { app } = useAppCopy();
  const label = (app.commissions.statuses as Record<string, string>)[status] ?? (app.payouts.statuses as Record<string, string>)[status] ?? status;
  const tone =
    status === 'PAID' ? styles.pillPaid : status === 'AVAILABLE' ? styles.pillAvailable : status === 'CANCELLED' ? styles.pillCancelled : styles.pillPending;
  return (
    <View style={[styles.pill, tone]}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function CommissionRow({ c, compact }: { c: PartnerCommission; compact?: boolean }) {
  const { app } = useAppCopy();
  const date = useDate();
  return (
    <View style={styles.cRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.cTitle}>
          {c.kind === 'adjustment' ? app.commissions.adjustment : c.public_ref ?? '—'}
          {c.billing && c.kind === 'commission' ? <Text style={styles.cMeta}>{`  ·  ${(app.commissions.billing as Record<string, string>)[c.billing] ?? c.billing}`}</Text> : null}
        </Text>
        <Text style={styles.cMeta}>
          {date(c.paid_at)}
          {!compact && c.kind === 'commission' ? `  ·  ${formatChf(c.base_amount_chf)}` : ''}
          {c.status === 'PENDING' ? `  ·  ${fill(app.commissions.availableOn, { date: date(c.available_at, false) })}` : ''}
        </Text>
      </View>
      <Text style={[styles.cAmount, c.amount_chf < 0 && { color: colors.danger }]}>{formatChf(c.amount_chf)}</Text>
      <StatusPill status={c.status} />
    </View>
  );
}

function Commissions({ commissions }: { commissions: PartnerCommission[] | null }) {
  const { app } = useAppCopy();
  const totals = useMemo(() => {
    const sum = (s: PartnerCommission['status']) => (commissions ?? []).filter((c) => c.status === s).reduce((t, c) => t + Number(c.amount_chf), 0);
    return { pending: sum('PENDING'), available: sum('AVAILABLE'), paid: sum('PAID') };
  }, [commissions]);
  return (
    <View style={styles.stack}>
      <Text style={styles.intro}>{app.commissions.intro}</Text>
      <View style={styles.kpis}>
        <Kpi label={app.commissions.statuses.PENDING} value={formatChf(totals.pending)} />
        <Kpi label={app.commissions.statuses.AVAILABLE} value={formatChf(totals.available)} />
        <Kpi label={app.commissions.statuses.PAID} value={formatChf(totals.paid)} />
      </View>
      <View style={styles.card}>
        {commissions === null ? null : commissions.length === 0 ? (
          <Text style={styles.muted}>{app.commissions.empty}</Text>
        ) : (
          commissions.map((c) => <CommissionRow key={c.id} c={c} />)
        )}
      </View>
    </View>
  );
}

function Payouts({
  payouts,
  summary,
  profile,
  onSaved,
}: {
  payouts: PartnerPayout[] | null;
  summary: PartnerSummary | null;
  profile: PartnerProfile;
  onSaved: (p: PartnerProfile) => void;
}) {
  const { app } = useAppCopy();
  const { locale } = usePartnersCopy();
  const date = useDate();
  const month = (iso: string) => new Date(iso).toLocaleDateString(`${locale}-CH`, { month: 'long', year: 'numeric' });
  return (
    <View style={styles.stack}>
      {summary ? <Text style={styles.intro}>{fill(app.payouts.intro, { day: summary.payout_day, min: summary.min_payout_chf })}</Text> : null}
      <PayoutAccountCard profile={profile} onSaved={onSaved} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{app.payouts.title}</Text>
        {payouts === null ? null : payouts.length === 0 ? (
          <Text style={styles.muted}>{app.payouts.empty}</Text>
        ) : (
          payouts.map((p) => (
            <View key={p.id} style={styles.cRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.cTitle}>{month(p.period)}</Text>
                <Text style={styles.cMeta}>
                  {[`${p.commission_count} ${app.payouts.count.toLowerCase()}`, p.reference, p.paid_at ? date(p.paid_at) : null, p.iban_last4 ? `IBAN •••• ${p.iban_last4}` : null]
                    .filter(Boolean)
                    .join('  ·  ')}
                </Text>
              </View>
              <Text style={styles.cAmount}>{formatChf(p.amount_chf)}</Text>
              <StatusPill status={p.status} />
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function PayoutAccountCard({ profile, onSaved }: { profile: PartnerProfile; onSaved: (p: PartnerProfile) => void }) {
  const { copy } = usePartnersCopy();
  const [editing, setEditing] = useState(!profile.iban_masked);
  const [holder, setHolder] = useState(profile.payout_account_holder ?? `${profile.first_name} ${profile.last_name}`);
  const [iban, setIban] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function save() {
    if (!holder.trim() || !iban.trim()) return setMessage({ text: copy.auth.missing, error: true });
    setBusy(true);
    setMessage(null);
    const { ibanMasked, error } = await setPayoutAccount(holder, iban);
    setBusy(false);
    if (error) return setMessage({ text: error, error: true });
    setIban('');
    setEditing(false);
    setMessage({ text: copy.dashboard.ibanSaved, error: false });
    onSaved({ ...profile, iban_masked: ibanMasked, payout_account_holder: holder.trim() });
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{copy.dashboard.payout}</Text>
      <Text style={styles.muted}>{profile.iban_masked ? copy.dashboard.payoutText : copy.dashboard.noIban}</Text>
      {editing ? (
        <>
          <Field label={copy.dashboard.holder} value={holder} onChangeText={setHolder} />
          <Field label={copy.dashboard.iban} value={iban} onChangeText={setIban} autoCapitalize="characters" placeholder="CH00 0000 0000 0000 0000 0" />
          <View style={styles.actions}>
            <Button title={copy.dashboard.saveIban} onPress={save} loading={busy} />
          </View>
        </>
      ) : (
        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cTitle}>{profile.payout_account_holder}</Text>
            <Text style={styles.mono}>{profile.iban_masked}</Text>
          </View>
          <Button title={copy.dashboard.changeIban} variant="secondary" onPress={() => setEditing(true)} />
        </View>
      )}
      {message ? <Text style={message.error ? styles.error : styles.info}>{message.text}</Text> : null}
    </View>
  );
}

function Resources({ link, code }: { link: string | null; code: string | null }) {
  const { app, copy } = useAppCopy();
  const [campaign, setCampaign] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  if (!link) return null;
  const slug = campaign
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const campaignLink = slug ? `${link}&utm_source=partner&utm_campaign=${slug}` : link;
  const message = fill(copy.dashboard.share.message, { link });

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard refused: the text stays selectable.
    }
  }

  async function downloadQr() {
    if (Platform.OS !== 'web') return;
    const url = await QRCode.toDataURL(campaignLink, { errorCorrectionLevel: 'M', width: 1024, margin: 2, color: { dark: '#231A12', light: '#FFFFFF' } });
    const a = document.createElement('a');
    a.href = url;
    a.download = `cantia-partners-${code}${slug ? `-${slug}` : ''}.png`;
    a.click();
  }

  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{app.resources.campaignTitle}</Text>
        <Text style={styles.muted}>{app.resources.campaignText}</Text>
        <TextInput value={campaign} onChangeText={setCampaign} placeholder={app.resources.campaignPlaceholder} placeholderTextColor={colors.textMuted} style={styles.input} />
        <View style={[styles.linkRow, { flexWrap: 'wrap' }]}>
          <View style={{ flex: 1, minWidth: 240, gap: spacing.sm }}>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} selectable>
                {campaignLink}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button title={copied === 'link' ? app.resources.copied : app.resources.copy} icon={copied === 'link' ? 'check' : 'copy'} onPress={() => copyText('link', campaignLink)} />
              {Platform.OS === 'web' ? <Button title={copy.dashboard.share.downloadQr} icon="download" variant="secondary" onPress={downloadQr} /> : null}
            </View>
          </View>
          <QrCode value={campaignLink} size={132} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.dashboard.share.title}</Text>
        <Text style={styles.muted}>{copy.dashboard.share.text}</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText} selectable>
            {message}
          </Text>
        </View>
        <View style={styles.actions}>
          <Button
            title={copied === 'message' ? copy.dashboard.share.copied : copy.dashboard.share.copy}
            icon={copied === 'message' ? 'check' : 'message-square'}
            variant="secondary"
            onPress={() => copyText('message', message)}
          />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.rules.title}</Text>
        {copy.rules.items.map((r) => (
          <View key={r.q} style={{ gap: 2, paddingVertical: 6 }}>
            <Text style={styles.cTitle}>{r.q}</Text>
            <Text style={styles.small}>{r.a}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProfileTab({ profile, email }: { profile: PartnerProfile; email: string | null }) {
  const { app, copy } = useAppCopy();
  const date = useDate();
  const rows: [string, string][] = [
    [app.profile.name, `${profile.first_name} ${profile.last_name}`],
    [app.profile.company, profile.company_name ?? '–'],
    [app.profile.type, copy.types[profile.partner_type]],
    [app.profile.email, email ?? '–'],
    [app.profile.since, date(profile.created_at)],
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{app.profile.title}</Text>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.kv}>
          <Text style={styles.kvKey}>{k}</Text>
          <Text style={styles.kvValue}>{v}</Text>
        </View>
      ))}
      <Text style={styles.small}>{app.profile.contact}</Text>
    </View>
  );
}

function Table({ head, rows, mono = [] }: { head: string[]; rows: string[][]; mono?: number[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: '100%' as any }}>
        <View style={[styles.tr, styles.thRow]}>
          {head.map((h) => (
            <Text key={h} style={[styles.th, styles.td]}>
              {h}
            </Text>
          ))}
        </View>
        {rows.map((r, i) => (
          <View key={i} style={styles.tr}>
            {r.map((cell, j) => (
              <Text key={j} style={[styles.td, mono.includes(j) && styles.mono]}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: 32, gap: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
  h1: { ...displayType, fontSize: 34, lineHeight: 38, fontWeight: '800', color: colors.text },
  muted: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted },
  small: { fontSize: fontSize.xs, lineHeight: 18, color: colors.textMuted },
  intro: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted, maxWidth: 720 },
  mono: { ...monoType, fontSize: 13, color: colors.text },
  link: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  alert: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md },
  alertText: { flex: 1, fontSize: fontSize.sm, color: colors.danger, lineHeight: 19 },
  tabs: { gap: 4, borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 1 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text },
  stack: { gap: spacing.lg },
  row2: { gap: spacing.lg },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexGrow: 1, flexBasis: 150, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  kpiAccent: { backgroundColor: colors.text, borderColor: colors.text },
  kpiLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  kpiValue: { ...displayType, fontSize: 26, lineHeight: 30, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  kpiHint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  linkBox: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14 },
  linkText: { ...monoType, fontSize: 13, color: colors.text },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  badgeConfirmed: { backgroundColor: colors.primary, borderColor: colors.primary },
  badgePremium: { backgroundColor: colors.text, borderColor: colors.text },
  badgeText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.8 },
  levelCard: { gap: spacing.sm },
  levelSteps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  levelStep: { alignItems: 'flex-start', gap: 2, flex: 1 },
  levelDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  levelDotOn: { backgroundColor: colors.primary },
  levelStepText: { fontSize: fontSize.sm, color: colors.textMuted },
  levelStepHint: { ...monoType, fontSize: 10, color: colors.textMuted },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.primary },
  benefitsTitle: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: spacing.sm },
  benefit: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  benefitText: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 19 },
  milestones: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  milestone: { flexGrow: 1, flexBasis: 150, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, opacity: 0.75 },
  milestoneDone: { opacity: 1, backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  milestoneIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  milestoneIconDone: { backgroundColor: colors.success },
  milestoneText: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  funnel: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  funnelStep: { flexGrow: 1, flexBasis: 110, gap: 2, position: 'relative' },
  funnelValue: { ...displayType, fontSize: 30, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  funnelLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  funnelArrow: { position: 'absolute', right: 0, top: 12 },
  cRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  cTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  cMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, fontWeight: '400' },
  cAmount: { ...monoType, fontSize: 13, fontWeight: '700', color: colors.text },
  pill: { borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.text },
  pillPending: { backgroundColor: colors.warningSoft },
  pillAvailable: { backgroundColor: colors.primarySoft },
  pillPaid: { backgroundColor: colors.successSoft },
  pillCancelled: { backgroundColor: colors.surfaceAlt },
  tr: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  thRow: { borderTopWidth: 0 },
  th: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { flex: 1, minWidth: 120, paddingVertical: 10, paddingRight: spacing.md, fontSize: fontSize.sm, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  messageBox: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  messageText: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  kv: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  kvKey: { width: 160, fontSize: fontSize.sm, color: colors.textMuted },
  kvValue: { flex: 1, minWidth: 160, fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  error: { fontSize: fontSize.sm, color: colors.danger },
  info: { fontSize: fontSize.sm, color: colors.success },
});
