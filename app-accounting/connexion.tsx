import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { enterGoesTo } from '../components/ui';
import { AuthDivider, AuthField, AuthHeading, AuthLayout, AuthNote, AuthSubmit, authStyles } from '../components/site/AuthLayout';
import { AUTH_COPY } from '../lib/site/auth';
import { sans, site } from '../lib/siteTheme';
import { useAccCopy } from '../lib/accounting/locale';
import { fill } from '../lib/accounting/copy';
import { usePartnerSession } from '../lib/partners/session';
import { supabase } from '../lib/supabase';

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

  // Applied after hydration: the prerendered page is the login form.
  useEffect(() => {
    if (params.mode === 'signup') setMode('signup');
  }, [params.mode]);

  // Already signed in (or just verified): straight to the space.
  useEffect(() => {
    if (session) router.replace(next as any);
  }, [session, router, next]);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    if (busy) return;
    if (!email || !password) return setError(copy.auth.missing);
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(err.message);
  }

  async function handleSignup() {
    if (busy) return;
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
  const frame = AUTH_COPY[locale as 'fr' | 'de' | 'it'] ?? AUTH_COPY.fr;

  return (
    <AuthLayout product="accounting" backHref={locale === 'fr' ? '/' : `/${locale}`} locale={locale as 'fr' | 'de' | 'it'}>
      <Head>
        <title>{`${title} · ${copy.brand}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AuthHeading eyebrow={frame.login.eyebrow.accounting} title={title} text={mode === 'code' ? fill(copy.auth.codeText, { email: email.trim() }) : copy.auth.sameAccount} />
      {mode === 'code' ? (
        <>
          <AuthField label={copy.auth.code} value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" onSubmitEditing={handleVerify} />
          <AuthSubmit label={copy.auth.verify} onPress={handleVerify} loading={busy} />
          <View style={styles.links}>
            <Pressable onPress={handleResend}>
              <Text style={[sans, styles.link]}>{copy.auth.resend}</Text>
            </Pressable>
            <Pressable onPress={() => setMode('signup')}>
              <Text style={[sans, styles.linkMuted]}>{copy.auth.back}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {mode === 'signup' ? (
            <View style={styles.row}>
              <View style={styles.half}>
                <AuthField label={copy.auth.firstName} value={firstName} onChangeText={setFirstName} autoComplete="given-name" returnKeyType="next" onSubmitEditing={enterGoesTo(lastNameRef, handleSignup)} />
              </View>
              <View style={styles.half}>
                <AuthField label={copy.auth.lastName} value={lastName} onChangeText={setLastName} autoComplete="family-name" ref={lastNameRef} returnKeyType="next" onSubmitEditing={enterGoesTo(emailRef, handleSignup)} />
              </View>
            </View>
          ) : null}
          <AuthField label={copy.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ref={emailRef} returnKeyType="next" onSubmitEditing={enterGoesTo(passwordRef, mode === 'login' ? handleLogin : handleSignup)} />
          <AuthField
            ref={passwordRef}
            label={copy.auth.password}
            password
            showLabel={frame.show}
            hideLabel={frame.hide}
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'signup' ? copy.auth.passwordHint : undefined}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            returnKeyType="go"
            onSubmitEditing={mode === 'login' ? handleLogin : handleSignup}
            aside={
              mode === 'login' ? (
                <Pressable
                  onPress={() => {
                    if (typeof window !== 'undefined') window.location.href = `https://app.cantia.ch/forgot-password?locale=${locale}`;
                  }}
                >
                  <Text style={authStyles.smallLink}>{copy.auth.forgot}</Text>
                </Pressable>
              ) : undefined
            }
          />
          {error ? <AuthNote tone="error">{error}</AuthNote> : null}
          {info ? <AuthNote>{info}</AuthNote> : null}
          <AuthSubmit label={mode === 'login' ? copy.auth.login : copy.auth.signup} onPress={mode === 'login' ? handleLogin : handleSignup} loading={busy} />
          <AuthDivider label={copy.auth.or} />
          <Pressable onPress={handleGoogle} disabled={googleBusy} style={({ hovered }: any) => [styles.google, hovered && { backgroundColor: site.bg }]} accessibilityRole="button">
            {googleBusy ? <ActivityIndicator size="small" color={site.ink} /> : <Ionicons name="logo-google" size={16} color="#535a49" />}
            <Text style={[sans, styles.googleText]}>{copy.auth.google}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setError(null);
              setMode(mode === 'login' ? 'signup' : 'login');
            }}
            style={{ marginTop: 24, alignSelf: 'center' }}
          >
            <Text style={[sans, styles.link]}>{mode === 'login' ? copy.auth.toSignup : copy.auth.toLogin}</Text>
          </Pressable>
        </>
      )}
      {mode === 'code' && error ? <AuthNote tone="error">{error}</AuthNote> : null}
      {mode === 'code' && info ? <AuthNote>{info}</AuthNote> : null}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  half: { flex: 1, minWidth: 150 },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: 18 },
  link: { fontSize: 11, color: site.copper, fontWeight: '600', textAlign: 'center' },
  linkMuted: { fontSize: 11, color: site.muted },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 45, borderWidth: 1, borderColor: '#d8dbcf', borderRadius: 5, backgroundColor: site.white },
  googleText: { fontSize: 12, color: site.ink, fontWeight: '500' },
});
