import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Field } from '../components/ui';
import { NavButton, PAGE_MAX, PartnersNav, PartnersPage, useIsWide } from '../components/partners/PartnersChrome';
import { QrCode } from '../components/partners/QrCode';
import QRCode from 'qrcode';
import { usePartnersCopy } from '../lib/partners/locale';
import { fill, PARTNER_TYPES, type PartnerType } from '../lib/partners/copy';
import { usePartnerSession } from '../lib/partners/session';
import {
  becomePartner,
  getMyPartnerProfile,
  getMyPartnerReferrals,
  getMyPartnerStats,
  PARTNER_LINK_BASE,
  setPayoutAccount,
  type PartnerProfile,
  type PartnerReferral,
  type PartnerStats,
} from '../lib/partners/api';
import { supabase } from '../lib/supabase';
import { displayType, monoType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

export default function PartnerSpace() {
  const { copy } = usePartnersCopy();
  const router = useRouter();
  const session = usePartnerSession();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getMyPartnerProfile();
    setProfile(result.profile);
    setCode(result.code);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (session === null) router.replace('/connexion');
    else if (session) load();
  }, [session, router, load]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <PartnersPage
      nav={
        <PartnersNav
          right={
            session ? (
              <Pressable onPress={signOut} style={styles.signOut} accessibilityRole="button">
                <Text style={styles.signOutText}>{copy.dashboard.signOut}</Text>
              </Pressable>
            ) : null
          }
        />
      }
    >
      <Head>
        <title>Cantia Partners</title>
        <meta name="robots" content="noindex" />
      </Head>
      {!session || !loaded ? (
        <Text style={styles.loading}>{copy.loading}</Text>
      ) : profile ? (
        <Dashboard profile={profile} code={code} onProfileChanged={load} />
      ) : (
        <Onboarding
          defaultFirst={(session.user.user_metadata?.first_name as string) ?? ((session.user.user_metadata?.full_name as string) ?? '').split(' ')[0] ?? ''}
          defaultLast={(session.user.user_metadata?.last_name as string) ?? ((session.user.user_metadata?.full_name as string) ?? '').split(' ').slice(1).join(' ')}
          onDone={load}
        />
      )}
    </PartnersPage>
  );
}

function Onboarding({ defaultFirst, defaultLast, onDone }: { defaultFirst: string; defaultLast: string; onDone: () => void }) {
  const { copy, locale } = usePartnersCopy();
  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [companyName, setCompanyName] = useState('');
  const [partnerType, setPartnerType] = useState<PartnerType>('CONSULTANT');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!firstName.trim() || !lastName.trim() || !address.trim() || !postalCode.trim() || !city.trim()) return setError(copy.auth.missing);
    if (!accepted) return setError(copy.onboarding.mustAccept);
    setBusy(true);
    setError(null);
    const { error: err } = await becomePartner({ firstName, lastName, companyName, partnerType, phone, address, postalCode, city, locale });
    setBusy(false);
    if (err) setError(err);
    else onDone();
  }

  return (
    <View style={[styles.section, { maxWidth: 640 }]}>
      <Text style={styles.h1} role="heading" aria-level={1}>
        {copy.onboarding.title}
      </Text>
      <Text style={styles.muted}>{copy.onboarding.text}</Text>
      <View style={styles.card}>
        <View style={styles.formRow}>
          <View style={styles.formCell}>
            <Field label={copy.auth.firstName} value={firstName} onChangeText={setFirstName} />
          </View>
          <View style={styles.formCell}>
            <Field label={copy.auth.lastName} value={lastName} onChangeText={setLastName} />
          </View>
        </View>
        <Field label={copy.onboarding.company} value={companyName} onChangeText={setCompanyName} />
        <Text style={styles.label}>{copy.onboarding.type}</Text>
        <View style={styles.chips}>
          {PARTNER_TYPES.map((type) => (
            <Pressable key={type} onPress={() => setPartnerType(type)} style={[styles.chip, partnerType === type && styles.chipActive]} accessibilityRole="radio" aria-checked={partnerType === type}>
              <Text style={[styles.chipText, partnerType === type && styles.chipTextActive]}>{copy.types[type]}</Text>
            </Pressable>
          ))}
        </View>
        <Field label={copy.onboarding.phone} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label={copy.onboarding.address} value={address} onChangeText={setAddress} autoComplete="street-address" />
        <View style={styles.formRow}>
          <View style={[styles.formCell, { maxWidth: 140 }]}>
            <Field label={copy.onboarding.postalCode} value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" />
          </View>
          <View style={styles.formCell}>
            <Field label={copy.onboarding.city} value={city} onChangeText={setCity} />
          </View>
        </View>
        <Pressable onPress={() => setAccepted(!accepted)} style={styles.accept} accessibilityRole="checkbox" aria-checked={accepted}>
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>{accepted ? <Feather name="check" size={13} color="#fff" /> : null}</View>
          <Text style={styles.acceptText}>{copy.onboarding.accept}</Text>
        </Pressable>
        <Button title={copy.onboarding.submit} onPress={submit} loading={busy} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

function Dashboard({ profile, code, onProfileChanged }: { profile: PartnerProfile; code: string | null; onProfileChanged: () => void }) {
  const { copy, locale } = usePartnersCopy();
  const wide = useIsWide();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [referrals, setReferrals] = useState<PartnerReferral[] | null>(null);
  const [copied, setCopied] = useState(false);
  const link = code ? `${PARTNER_LINK_BASE}${code}` : null;

  useEffect(() => {
    getMyPartnerStats().then(setStats);
    getMyPartnerReferrals().then(setReferrals);
  }, []);

  async function copyLink() {
    if (!link) return;
    try {
      if (Platform.OS === 'web') await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused: the link stays selectable on screen.
    }
  }

  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(`${locale}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const statItems: [string, number | undefined][] = [
    [copy.dashboard.stats.clicks, stats?.clicks],
    [copy.dashboard.stats.visitors, stats?.unique_visitors],
    [copy.dashboard.stats.signups, stats?.signups],
    [copy.dashboard.stats.trials, stats?.trials],
    [copy.dashboard.stats.active, stats?.active_customers],
  ];

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.h1} role="heading" aria-level={1}>
            {fill(copy.dashboard.hello, { name: profile.first_name })}
          </Text>
          <Text style={styles.muted}>{fill(copy.dashboard.memberSince, { date: dateFmt(profile.created_at) })}</Text>
        </View>
        {profile.status === 'ACTIVE' ? (
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>{copy.dashboard.active}</Text>
          </View>
        ) : null}
      </View>

      {profile.status !== 'ACTIVE' ? (
        <View style={styles.alert}>
          <Feather name="alert-triangle" size={16} color={colors.danger} />
          <Text style={styles.alertText}>{copy.dashboard.suspended}</Text>
        </View>
      ) : null}

      <View style={[styles.card, wide && styles.linkCardWide]}>
        <View style={{ flex: 1, gap: spacing.md }}>
          <Text style={styles.cardTitle}>{copy.dashboard.linkTitle}</Text>
          <Text style={styles.muted}>{copy.dashboard.linkText}</Text>
          {link ? (
            <>
              <View style={styles.linkBox}>
                <Text style={styles.linkText} selectable>
                  {link}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <Button title={copied ? copy.dashboard.copied : copy.dashboard.copy} icon={copied ? 'check' : 'copy'} onPress={copyLink} />
                <Text style={styles.codeText}>
                  {copy.dashboard.code} <Text style={styles.codeValue}>{code}</Text>
                </Text>
              </View>
            </>
          ) : null}
        </View>
        {link ? (
          <View style={styles.qr}>
            <QrCode value={link} size={148} />
            <Text style={styles.qrCaption}>{copy.dashboard.qr}</Text>
          </View>
        ) : null}
      </View>

      {link ? <ShareKit link={link} code={code ?? ''} /> : null}

      <View style={styles.stats}>
        {statItems.map(([label, value]) => (
          <View key={label} style={styles.stat}>
            <Text style={styles.statValue}>{value ?? '–'}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.dashboard.commissions}</Text>
        <View style={styles.stats}>
          {[copy.dashboard.pending, copy.dashboard.available, copy.dashboard.paid].map((label) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statValue}>CHF 0.00</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.muted}>{copy.dashboard.commissionsSoon}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.dashboard.referrals}</Text>
        {referrals === null ? null : referrals.length === 0 ? (
          <Text style={styles.muted}>{copy.dashboard.noReferrals}</Text>
        ) : (
          <View>
            <View style={[styles.tr, styles.thRow]}>
              <Text style={[styles.th, styles.cRef]}>{copy.dashboard.ref}</Text>
              <Text style={[styles.th, styles.cDate]}>{copy.dashboard.since}</Text>
              <Text style={[styles.th, styles.cPlan]}>{copy.dashboard.plan}</Text>
              <Text style={[styles.th, styles.cStatus]}>{copy.dashboard.status}</Text>
            </View>
            {referrals.map((r) => (
              <View key={r.public_ref} style={styles.tr}>
                <Text style={[styles.td, styles.mono, styles.cRef]}>{r.public_ref}</Text>
                <Text style={[styles.td, styles.cDate]}>{dateFmt(r.attributed_at)}</Text>
                <Text style={[styles.td, styles.cPlan]}>{r.plan_name ?? '–'}</Text>
                <Text style={[styles.td, styles.cStatus]}>{copy.dashboard.statuses[r.status] ?? r.status}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <PayoutCard profile={profile} onSaved={onProfileChanged} />

      <View style={styles.rulesLink}>
        <NavButton href={locale === 'fr' ? '/' : `/${locale}`} label={copy.dashboard.rules} />
      </View>
    </View>
  );
}

function ShareKit({ link, code }: { link: string; code: string }) {
  const { copy } = usePartnersCopy();
  const message = fill(copy.dashboard.share.message, { link });
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused: the message stays selectable on screen.
    }
  }

  // A 1024 px PNG, for flyers, business cards or a sticker on the van.
  async function downloadQr() {
    if (Platform.OS !== 'web') return;
    const url = await QRCode.toDataURL(link, { errorCorrectionLevel: 'M', width: 1024, margin: 2, color: { dark: '#231A12', light: '#FFFFFF' } });
    const a = document.createElement('a');
    a.href = url;
    a.download = `cantia-partners-${code}.png`;
    a.click();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{copy.dashboard.share.title}</Text>
      <Text style={styles.muted}>{copy.dashboard.share.text}</Text>
      <View style={styles.messageBox}>
        <Text style={styles.messageText} selectable>
          {message}
        </Text>
      </View>
      <View style={styles.linkActions}>
        <Button title={copied ? copy.dashboard.share.copied : copy.dashboard.share.copy} icon={copied ? 'check' : 'message-square'} variant="secondary" onPress={copyMessage} />
        {Platform.OS === 'web' ? <Button title={copy.dashboard.share.downloadQr} icon="download" variant="secondary" onPress={downloadQr} /> : null}
      </View>
    </View>
  );
}

function PayoutCard({ profile, onSaved }: { profile: PartnerProfile; onSaved: () => void }) {
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
    const { error } = await setPayoutAccount(holder, iban);
    setBusy(false);
    if (error) return setMessage({ text: error, error: true });
    setIban('');
    setEditing(false);
    setMessage({ text: copy.dashboard.ibanSaved, error: false });
    onSaved();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{copy.dashboard.payout}</Text>
      <Text style={styles.muted}>{profile.iban_masked ? copy.dashboard.payoutText : copy.dashboard.noIban}</Text>
      {editing ? (
        <>
          <Field label={copy.dashboard.holder} value={holder} onChangeText={setHolder} />
          <Field label={copy.dashboard.iban} value={iban} onChangeText={setIban} autoCapitalize="characters" placeholder="CH00 0000 0000 0000 0000 0" />
          <View style={styles.linkActions}>
            <Button title={copy.dashboard.saveIban} onPress={save} loading={busy} />
          </View>
        </>
      ) : (
        <View style={styles.linkActions}>
          <View style={{ flex: 1 }}>
            <Text style={styles.td}>{profile.payout_account_holder}</Text>
            <Text style={[styles.td, styles.mono]}>{profile.iban_masked}</Text>
          </View>
          <Button title={copy.dashboard.changeIban} variant="secondary" onPress={() => setEditing(true)} />
        </View>
      )}
      {message ? <Text style={message.error ? styles.error : styles.info}>{message.text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { textAlign: 'center', marginTop: 80, color: colors.textMuted },
  section: { width: '100%', maxWidth: PAGE_MAX, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: 40, gap: spacing.lg },
  h1: { ...displayType, fontSize: 36, lineHeight: 40, fontWeight: '800', color: colors.text },
  muted: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  linkCardWide: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl },
  linkBox: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14 },
  linkText: { ...monoType, fontSize: 14, color: colors.text },
  linkActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  codeText: { fontSize: fontSize.sm, color: colors.textMuted },
  codeValue: { ...monoType, color: colors.text, fontWeight: '700' },
  qr: { alignItems: 'center', gap: spacing.sm, alignSelf: 'center' },
  qrCaption: { fontSize: fontSize.xs, color: colors.textMuted, maxWidth: 170, textAlign: 'center' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { flexGrow: 1, flexBasis: 140, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  statValue: { ...displayType, fontSize: 26, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  thRow: { paddingVertical: 6 },
  th: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  td: { fontSize: fontSize.sm, color: colors.text },
  mono: { ...monoType, fontSize: 13 },
  cRef: { flex: 1.1 },
  cDate: { flex: 1 },
  cPlan: { flex: 1 },
  cStatus: { flex: 1 },
  alert: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md },
  alertText: { flex: 1, fontSize: fontSize.sm, color: colors.danger, lineHeight: 19 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  formCell: { flex: 1, minWidth: 140 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.surface },
  accept: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  checkbox: { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  acceptText: { flex: 1, fontSize: fontSize.sm, lineHeight: 19, color: colors.text },
  error: { fontSize: fontSize.sm, color: colors.danger },
  info: { fontSize: fontSize.sm, color: colors.success },
  signOut: { paddingVertical: 9, paddingHorizontal: 12 },
  signOutText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  rulesLink: { flexDirection: 'row' },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 12 },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  pillText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  messageBox: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  messageText: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
});
