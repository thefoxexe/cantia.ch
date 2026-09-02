import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { Button, Field, Screen } from '../../components/ui';
import { useTranslation } from '../../lib/translations';
import { colors, fontSize, spacing } from '../../lib/theme';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Cantia</Text>

          {sent ? (
            <>
              <Text style={styles.subtitle}>
                {t('authForgotPassword.sentText', { email: email.trim() })}
              </Text>
              <Link href="/(auth)/login" style={styles.link}>
                <Text style={styles.linkText}>{t('authForgotPassword.backToLogin')}</Text>
              </Link>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>{t('authForgotPassword.subtitle')}</Text>
              <View style={styles.form}>
                <Field
                  label={t('authForgotPassword.emailLabel')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('authForgotPassword.emailPlaceholder')}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title={t('authForgotPassword.submit')} onPress={handleSubmit} loading={loading} disabled={!email.trim()} />
              </View>
              <Link href="/(auth)/login" style={styles.link}>
                <Text style={styles.linkText}>{t('authForgotPassword.backToLogin')}</Text>
              </Link>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: fontSize.sm,
  },
  link: {
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
