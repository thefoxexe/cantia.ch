import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Field } from '../components/ui';
import { NavButton, PAGE_MAX, PartnersNav, PartnersPage } from '../components/partners/PartnersChrome';
import { PartnerDashboard } from '../components/partners/PartnerDashboard';
import { usePartnersCopy } from '../lib/partners/locale';
import { fill, PARTNER_TYPES, type PartnerType } from '../lib/partners/copy';
import { usePartnerSession } from '../lib/partners/session';
import { amPartnersAdmin, becomePartner, getMyPartnerProfile, notifyPartnersAdmin, type PartnerProfile } from '../lib/partners/api';
import { PARTNERS_APP_COPY } from '../lib/partners/appCopy';
import { supabase } from '../lib/supabase';
import { displayType, monoType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

export default function PartnerSpace() {
  const { copy, locale } = usePartnersCopy();
  const router = useRouter();
  const session = usePartnerSession();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyPartnerProfile();
    setProfile(result.profile);
    setCode(result.code);
    setLoaded(true);
    setIsAdmin(await amPartnersAdmin());
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
              <>
                <Pressable onPress={signOut} style={styles.signOut} accessibilityRole="button">
                  <Text style={styles.signOutText}>{copy.dashboard.signOut}</Text>
                </Pressable>
              </>
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
        <PartnerDashboard profile={profile} code={code} email={session.user.email ?? null} />
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
    if (err) return setError(err);
    // Tells the Cantia team a new partner is waiting for their terms.
    await notifyPartnersAdmin('signup');
    onDone();
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
