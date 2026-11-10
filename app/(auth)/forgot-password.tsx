import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { AuthField, AuthHeading, AuthLayout, AuthNote, AuthSubmit, AuthSwitch } from '../../components/site/AuthLayout';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { siteHomeHref } from '../../lib/appHost';
import { AUTH_COPY } from '../../lib/site/auth';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const c = AUTH_COPY[getAppLocale()];
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || loading) return;
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <AuthLayout backHref={siteHomeHref()}>
      <AuthHeading eyebrow={c.login.eyebrow.cantia} title={c.forgot.title} text={sent ? undefined : c.forgot.text} />
      {sent ? (
        <AuthNote>{t('authForgotPassword.sentText', { email: email.trim() })}</AuthNote>
      ) : (
        <>
          <AuthField
            label={t('authForgotPassword.emailLabel')}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder={t('authForgotPassword.emailPlaceholder')}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          {error ? <AuthNote tone="error">{error}</AuthNote> : null}
          <AuthSubmit label={c.forgot.submit} onPress={handleSubmit} loading={loading} />
        </>
      )}
      <AuthSwitch text="" link={c.forgot.backToLogin} href="/(auth)/login" />
    </AuthLayout>
  );
}
