import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { MicrosoftSignInButton } from '../../components/MicrosoftSignInButton';
import { enterGoesTo } from '../../components/ui';
import { AuthDivider, AuthField, AuthHeading, AuthLayout, AuthNote, AuthSubmit, AuthSwitch, authStyles } from '../../components/site/AuthLayout';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { siteHomeHref } from '../../lib/appHost';
import { AUTH_COPY } from '../../lib/site/auth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const c = AUTH_COPY[getAppLocale()];
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  async function handleSubmit() {
    if (loading) return;
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (!error) return;
    // Supabase's exact wording for a not-yet-confirmed account when
    // "Confirm email" is on — send them to enter the code instead of just
    // showing a dead-end error.
    if (error.toLowerCase().includes('email not confirmed')) {
      router.push(`/(auth)/verify-email?email=${encodeURIComponent(email.trim())}` as any);
      return;
    }
    setError(error);
  }

  return (
    <AuthLayout backHref={siteHomeHref()}>
      <AuthHeading eyebrow={c.login.eyebrow.cantia} title={c.login.title} text={c.login.text.cantia} />
      <AuthField
        label={t('authLogin.emailLabel')}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        placeholder={t('authLogin.emailPlaceholder')}
        returnKeyType="next"
        onSubmitEditing={enterGoesTo(passwordRef, handleSubmit)}
      />
      <AuthField
        ref={passwordRef}
        label={t('authLogin.passwordLabel')}
        password
        showLabel={c.show}
        hideLabel={c.hide}
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
        placeholder={t('authLogin.passwordPlaceholder')}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        aside={
          <Link href="/(auth)/forgot-password">
            <Text style={authStyles.smallLink}>{t('authLogin.forgotPassword')}</Text>
          </Link>
        }
      />
      {error ? <AuthNote tone="error">{error}</AuthNote> : null}
      <AuthSubmit label={t('authLogin.submit')} onPress={handleSubmit} loading={loading} />
      <AuthDivider label={t('authLogin.or')} />
      <View style={{ gap: 10 }}>
        <GoogleSignInButton />
        <MicrosoftSignInButton />
      </View>
      <AuthSwitch text="" link={t('authLogin.noAccount')} href="/(auth)/signup" />
    </AuthLayout>
  );
}
