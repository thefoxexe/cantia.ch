import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Field } from '../components/ui';
import { AccNav, AccPage, useIsWide } from '../components/accounting/AccountingChrome';
import { useAccCopy } from '../lib/accounting/locale';
import { fill } from '../lib/accounting/copy';
import { usePartnerSession } from '../lib/partners/session';
import { supabase } from '../lib/supabase';
import { displayType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type Mode = 'login' | 'signup' | 'code';

export default function AccountingAuth() {
  const { copy, locale } = useAccCopy();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; next?: string }>();
  // Back to where the visitor came from (an invitation link), same site only.
  const next = typeof params.next === 'string' && params.next.startsWith('/') && !params.next.startsWith('//') ? params.next : '/espace';
  const session = usePartnerSession();
  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const wide = useIsWide(900);

  // Applied after hydration: the prerendered page is the login form.
  useEffect(() => {
    if (params.mode === 'signup') setMode('signup');
  }, [params.mode]);

  // Already signed in (or just verified): straight to the space.
  useEffect(() => {
    if (session) router.replace(next as any);
  }, [session, router, next]);

  async function handleLogin() {
    if (!email || !password) return setError(copy.auth.missing);
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(err.message);
  }

  async function handleSignup() {
    if (!firstName.trim() || !lastName.trim() || !email || !password) return setError(copy.auth.missing);
    if (password.length < 8) return setError(copy.auth.shortPassword);
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          locale,
          newsletter_opt_in: false,
          signup_source: 'accounting',
        },
      },
    });
    setBusy(false);
    if (err) return setError(err.message);
    // An address that already has an account: Supabase answers « OK » with
    // no identity and sends no e-mail, so say it instead of waiting for a code.
    if (data.user && (data.user.identities?.length ?? 1) === 0) {
      setMode('login');
      return setError(copy.auth.exists);
    }
    if (!data.session) setMode('code');
  }

  async function handleVerify() {
    if (!code.trim()) return setError(copy.auth.missing);
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'signup' });
    setBusy(false);
    if (err) setError(err.message);
  }

  // Same Google accounts as app.cantia.ch; back to the space after.
  async function handleGoogle() {
    setError(null);
    setGoogleBusy(true);
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}${next}` : undefined;
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (err) {
      setError(err.message);
      setGoogleBusy(false);
    }
  }

  async function handleResend() {
    setError(null);
    const { error: err } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    if (err) setError(err.message);
    else setInfo(copy.auth.resent);
  }

  const title = mode === 'login' ? copy.auth.loginTitle : mode === 'signup' ? copy.auth.signupTitle : copy.auth.codeTitle;

  return (
    <AccPage nav={<AccNav />}>
      <Head>
        <title>{`${title} · ${copy.brand}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={[styles.split, wide && styles.splitWide]}>
        <View style={[styles.visual, wide && styles.visualWide]}>
          <Image source={{ uri: '/hero-mountain.webp' }} style={styles.visualImage} resizeMode="cover" />
          <View style={styles.visualText}>
            <Text style={styles.visualEyebrow}>{copy.brand}</Text>
            <Text style={[styles.visualTitle, !wide && { fontSize: 28, lineHeight: 32 }]}>{copy.auth.sideTitle}</Text>
            {wide ? <Text style={styles.visualBody}>{copy.auth.sideText}</Text> : null}
          </View>
        </View>
        <View style={[styles.formSide, wide && { flex: 1 }]}>
        <View style={styles.card}>
          <Text style={styles.title} role="heading" aria-level={1}>
            {title}
          </Text>

          {mode === 'code' ? (
            <>
              <Text style={styles.muted}>{fill(copy.auth.codeText, { email: email.trim() })}</Text>
              <Field label={copy.auth.code} value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" onSubmitEditing={handleVerify} />
              <Button title={copy.auth.verify} onPress={handleVerify} loading={busy} />
              <View style={styles.links}>
                <Pressable onPress={handleResend}>
                  <Text style={styles.link}>{copy.auth.resend}</Text>
                </Pressable>
                <Pressable onPress={() => setMode('signup')}>
                  <Text style={styles.link}>{copy.auth.back}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.muted}>{copy.auth.sameAccount}</Text>
              {mode === 'signup' ? (
                <View style={styles.row}>
                  <View style={styles.half}>
                    <Field label={copy.auth.firstName} value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
                  </View>
                  <View style={styles.half}>
                    <Field label={copy.auth.lastName} value={lastName} onChangeText={setLastName} autoComplete="family-name" />
                  </View>
                </View>
              ) : null}
              <Field label={copy.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <Field
                label={copy.auth.password}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={mode === 'signup' ? copy.auth.passwordHint : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                onSubmitEditing={mode === 'login' ? handleLogin : handleSignup}
              />
              <Button title={mode === 'login' ? copy.auth.login : copy.auth.signup} onPress={mode === 'login' ? handleLogin : handleSignup} loading={busy} />
              <View style={styles.links}>
                <Pressable
                  onPress={() => {
                    setError(null);
                    setMode(mode === 'login' ? 'signup' : 'login');
                  }}
                >
                  <Text style={styles.link}>{mode === 'login' ? copy.auth.toSignup : copy.auth.toLogin}</Text>
                </Pressable>
                {mode === 'login' ? (
                  <Pressable
                    onPress={() => {
                      if (typeof window !== 'undefined') window.location.href = `https://app.cantia.ch/forgot-password?locale=${locale}`;
                    }}
                  >
                    <Text style={styles.linkMuted}>{copy.auth.forgot}</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{copy.auth.or}</Text>
                <View style={styles.dividerLine} />
              </View>
              <Pressable onPress={handleGoogle} disabled={googleBusy} style={styles.google} accessibilityRole="button">
                {googleBusy ? <ActivityIndicator size="small" color={colors.text} /> : <Ionicons name="logo-google" size={18} color={colors.text} />}
                <Text style={styles.googleText}>{copy.auth.google}</Text>
              </Pressable>
            </>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}
        </View>
      </View>
      </View>
    </AccPage>
  );
}

const styles = StyleSheet.create({
  split: { flex: 1 },
  splitWide: { flexDirection: 'row', minHeight: 680 },
  visual: { height: 200, position: 'relative', overflow: 'hidden', backgroundColor: '#FBE3CB', justifyContent: 'flex-start' },
  visualWide: { flex: 1, height: 'auto' as any },
  // The photo's peak sits in its bottom-right corner: anchored there, wider
  // than the panel, so the mountain fills the frame instead of the sky.
  visualImage: { position: 'absolute', right: 0, bottom: 0, height: '100%', aspectRatio: 1672 / 941 },
  visualText: { padding: spacing.xl, paddingTop: 56, gap: spacing.sm, maxWidth: 460 },
  visualEyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  visualTitle: { ...displayType, fontSize: 44, lineHeight: 48, fontWeight: '800', color: colors.text },
  visualBody: { fontSize: fontSize.md, lineHeight: 24, color: '#5A4A3B' },
  formSide: { paddingHorizontal: spacing.lg, paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: fontSize.xs, color: colors.textMuted },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.md, backgroundColor: colors.surface },
  googleText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { ...displayType, fontSize: 30, lineHeight: 34, fontWeight: '800', color: colors.text },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  half: { flex: 1, minWidth: 150 },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  linkMuted: { fontSize: fontSize.sm, color: colors.textMuted },
  error: { fontSize: fontSize.sm, color: colors.danger },
  info: { fontSize: fontSize.sm, color: colors.success },
});
