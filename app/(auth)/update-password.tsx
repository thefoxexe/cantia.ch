import { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { enterGoesTo } from '../../components/ui';
import { AuthField, AuthHeading, AuthLayout, AuthNote, AuthSubmit } from '../../components/site/AuthLayout';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { siteHomeHref } from '../../lib/appHost';
import { AUTH_COPY } from '../../lib/site/auth';

// Only reachable via the "mot de passe oublié" e-mail link — the root
// layout force-redirects here for as long as isPasswordRecovery is true
// (see app/_layout.tsx) and updatePassword() clears that flag on success,
// letting the normal session-based redirect take over right after.
export default function UpdatePasswordScreen() {
  const { t } = useTranslation();
  const c = AUTH_COPY[getAppLocale()];
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const confirmRef = useRef<TextInput>(null);

  async function handleSubmit() {
    if (loading) return;
    setError(null);
    if (password.length < 6) {
      setError(t('authUpdatePassword.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('authUpdatePassword.passwordMismatch'));
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/');
  }

  return (
    <AuthLayout backHref={siteHomeHref()}>
      <AuthHeading eyebrow={c.login.eyebrow.cantia} title={c.update.title} text={c.update.text} />
      <AuthField
        label={t('authUpdatePassword.newPasswordLabel')}
        password
        showLabel={c.show}
        hideLabel={c.hide}
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        placeholder={t('authUpdatePassword.passwordPlaceholderMin')}
        returnKeyType="next"
        onSubmitEditing={enterGoesTo(confirmRef, handleSubmit)}
      />
      <AuthField
        ref={confirmRef}
        label={t('authUpdatePassword.confirmPasswordLabel')}
        password
        showLabel={c.show}
        hideLabel={c.hide}
        autoComplete="new-password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder={t('authUpdatePassword.passwordPlaceholderMin')}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      {error ? <AuthNote tone="error">{error}</AuthNote> : null}
      <AuthSubmit label={t('authUpdatePassword.submit')} onPress={handleSubmit} loading={loading} />
    </AuthLayout>
  );
}
