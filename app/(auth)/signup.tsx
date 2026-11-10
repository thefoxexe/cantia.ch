import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { MicrosoftSignInButton } from '../../components/MicrosoftSignInButton';
import { enterGoesTo } from '../../components/ui';
import { AuthDivider, AuthField, AuthHeading, AuthLayout, AuthNote, AuthSubmit, AuthSwitch } from '../../components/site/AuthLayout';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { siteHomeHref } from '../../lib/appHost';
import { getStoredFiduciaryInvite } from '../../lib/siteAnalytics';
import { supabase } from '../../lib/supabase';
import { AUTH_COPY } from '../../lib/site/auth';
import { sans, site } from '../../lib/siteTheme';
import { savePlanIntent } from '../../lib/planIntent';

export default function SignupScreen() {
  const { t } = useTranslation();
  const c = AUTH_COPY[getAppLocale()];
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  // Cantia Accounting: arrived through a fiduciary's invitation link.
  const params = useLocalSearchParams<{ fiduciary_invite?: string; plan?: string; billing?: string; code?: string }>();
  // The plan picked on cantia.ch ("Essayer Équipe") waits for the plan screen.
  useEffect(() => {
    savePlanIntent(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.plan, params.billing, params.code]);
  const [invitedBy, setInvitedBy] = useState<string | null>(null);

  useEffect(() => {
    const token = (typeof params.fiduciary_invite === 'string' ? params.fiduciary_invite : null) ?? (Platform.OS === 'web' ? getStoredFiduciaryInvite() : null);
    if (!token || !/^[a-f0-9]{24,64}$/.test(token)) return;
    supabase.rpc('fiduciary_new_client_preview', { p_token: token }).then(({ data }) => {
      const preview = data as { firm_name?: string; email?: string } | null;
      if (!preview?.firm_name) return;
      setInvitedBy(preview.firm_name);
      if (preview.email) setEmail((current) => current || preview.email!);
    });
  }, [params.fiduciary_invite]);

  // A partner link the visitor came through stays silent here: it is kept
  // in its cookie and applied at signup (lib/siteAnalytics.ts), without
  // showing the partner's code on the form.

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleSubmit() {
    if (loading) return;
    setError(null);
    if (!fullName.trim()) {
      setError(t('authSignup.nameRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('authSignup.passwordTooShort'));
      return;
    }
    setLoading(true);
    const { error, needsVerification, alreadyRegistered } = await signUp(email.trim(), password, fullName.trim(), newsletterOptIn);
    setLoading(false);
    if (error) {
      setError(error);
    } else if (alreadyRegistered) {
      setError(t('authSignup.alreadyRegistered'));
    } else if (needsVerification) {
      router.replace(`/(auth)/verify-email?email=${encodeURIComponent(email.trim())}` as any);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <AuthLayout backHref={siteHomeHref()}>
        <AuthHeading eyebrow={c.login.eyebrow.cantia} title={c.signup.title} />
        <AuthNote>{t('authSignup.accountCreated')}</AuthNote>
        <AuthSubmit label={t('authSignup.continueBtn')} onPress={() => router.replace('/(auth)/login')} />
      </AuthLayout>
    );
  }

  const legalBase = c.privacyHref.replace(/\/confidentialite$/, '');
  return (
    <AuthLayout backHref={siteHomeHref()}>
      <AuthHeading eyebrow={c.login.eyebrow.cantia} title={c.signup.title} text={c.signup.text} />
      {invitedBy ? (
        <View style={styles.invited}>
          <Feather name="briefcase" size={15} color={site.copper} />
          <Text style={[sans, styles.invitedText]}>{t('authSignup.invitedByFiduciary', { firm: invitedBy })}</Text>
        </View>
      ) : null}
      <AuthField
        label={t('authSignup.nameLabel')}
        value={fullName}
        onChangeText={setFullName}
        placeholder={t('authSignup.namePlaceholder')}
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={enterGoesTo(emailRef, handleSubmit)}
      />
      <AuthField
        ref={emailRef}
        label={t('authSignup.emailLabel')}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder={t('authSignup.emailPlaceholder')}
        returnKeyType="next"
        onSubmitEditing={enterGoesTo(passwordRef, handleSubmit)}
      />
      <AuthField
        ref={passwordRef}
        label={t('authSignup.passwordLabel')}
        password
        showLabel={c.show}
        hideLabel={c.hide}
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        placeholder={t('authSignup.passwordPlaceholderMin')}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <Pressable onPress={() => setNewsletterOptIn((v) => !v)} style={styles.checkboxRow} hitSlop={4} accessibilityRole="checkbox" aria-checked={newsletterOptIn}>
        <View style={[styles.checkbox, newsletterOptIn && styles.checkboxChecked]}>{newsletterOptIn ? <Feather name="check" size={11} color="#fff" /> : null}</View>
        <Text style={[sans, styles.checkboxLabel]}>{t('authSignup.newsletterOptIn')}</Text>
      </Pressable>
      <Text style={[sans, styles.legal]}>
        {c.signup.legalBefore}
        <Link href={`${legalBase}/conditions-generales` as any}>
          <Text style={styles.legalLink}>{c.signup.terms}</Text>
        </Link>
        {c.signup.legalMiddle}
        <Link href={c.privacyHref as any}>
          <Text style={styles.legalLink}>{c.signup.privacy}</Text>
        </Link>
        {c.signup.legalAfter}
      </Text>
      {error ? <AuthNote tone="error">{error}</AuthNote> : null}
      <AuthSubmit label={t('authSignup.submit')} onPress={handleSubmit} loading={loading} />
      <AuthDivider label={t('authSignup.or')} />
      <View style={{ gap: 10 }}>
        <GoogleSignInButton />
        <MicrosoftSignInButton />
      </View>
      <AuthSwitch text="" link={t('authSignup.haveAccount')} href="/(auth)/login" />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  invited: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 5, backgroundColor: '#f6ede3', borderWidth: 1, borderColor: '#e6d3bf', marginVertical: 8 },
  invitedText: { flex: 1, fontSize: 11, color: site.ink, lineHeight: 17 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  checkbox: { width: 17, height: 17, borderRadius: 4, borderWidth: 1, borderColor: '#c9cdbf', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: site.copper, borderColor: site.copper },
  checkboxLabel: { flex: 1, fontSize: 11, color: site.muted, lineHeight: 17 },
  legal: { fontSize: 10, color: site.muted, lineHeight: 17, marginTop: 14 },
  legalLink: { textDecorationLine: 'underline', color: site.ink },
});
