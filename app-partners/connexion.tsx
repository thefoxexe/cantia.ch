import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Field } from '../components/ui';
import { PartnersNav, PartnersPage } from '../components/partners/PartnersChrome';
import { usePartnersCopy } from '../lib/partners/locale';
import { fill } from '../lib/partners/copy';
import { usePartnerSession } from '../lib/partners/session';
import { supabase } from '../lib/supabase';
import { displayType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

type Mode = 'login' | 'signup' | 'code';

export default function PartnersAuth() {
  const { copy, locale } = usePartnersCopy();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
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

  // Applied after hydration: the prerendered page is the login form.
  useEffect(() => {
    if (params.mode === 'signup') setMode('signup');
  }, [params.mode]);

  // Already signed in (or just verified): straight to the partner space.
  useEffect(() => {
    if (session) router.replace('/espace');
  }, [session, router]);

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
          signup_source: 'partners',
        },
      },
    });
    setBusy(false);
    if (err) return setError(err.message);
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

  async function handleResend() {
    setError(null);
    const { error: err } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    if (err) setError(err.message);
    else setInfo(copy.auth.resent);
  }

  const title = mode === 'login' ? copy.auth.loginTitle : mode === 'signup' ? copy.auth.signupTitle : copy.auth.codeTitle;

  return (
    <PartnersPage nav={<PartnersNav />}>
      <Head>
        <title>{`${title} · Cantia Partners`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.wrap}>
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
            </>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}
        </View>
      </View>
    </PartnersPage>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: 56, alignItems: 'center' },
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
