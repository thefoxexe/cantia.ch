import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { Button, Field, Screen } from '../../components/ui';
import { useTranslation } from '../../lib/translations';
import { colors, fontSize, spacing } from '../../lib/theme';

// Only reachable via the "mot de passe oublié" e-mail link — the root
// layout force-redirects here for as long as isPasswordRecovery is true
// (see app/_layout.tsx) and updatePassword() clears that flag on success,
// letting the normal session-based redirect take over right after.
export default function UpdatePasswordScreen() {
  const { t } = useTranslation();
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
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
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Cantia</Text>
          <Text style={styles.subtitle}>{t('authUpdatePassword.subtitle')}</Text>

          <Field
            label={t('authUpdatePassword.newPasswordLabel')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder={t('authUpdatePassword.passwordPlaceholderMin')}
          />
          <Field
            label={t('authUpdatePassword.confirmPasswordLabel')}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('authUpdatePassword.passwordPlaceholderMin')}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title={t('authUpdatePassword.submit')} onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
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
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: fontSize.sm,
  },
});
