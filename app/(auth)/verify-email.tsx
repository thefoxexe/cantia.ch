import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { Button, Field, Screen } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Reached two ways: signup.tsx routes here when signUp() comes back with
// needsVerification (Supabase's "Confirm email" is on), and login.tsx
// routes here when signIn() fails with Supabase's "Email not confirmed"
// error. Either way there's nothing else to do here but enter the code —
// success sets a real session, and app/_layout.tsx's own session-driven
// redirect takes it from there (onboarding or straight into the app).
export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { verifySignupCode, resendSignupCode } = useAuth();
  const [email] = useState(emailParam ?? '');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendHint, setResendHint] = useState<string | null>(null);

  async function handleVerify() {
    if (!email || code.trim().length !== 6) return;
    setVerifying(true);
    setError(null);
    const { error: err } = await verifySignupCode(email, code.trim());
    setVerifying(false);
    if (err) setError(err);
    // On success the session updates and app/_layout.tsx redirects away —
    // nothing else to do here.
  }

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setError(null);
    setResendHint(null);
    const { error: err } = await resendSignupCode(email);
    setResending(false);
    if (err) {
      setError(err);
      return;
    }
    setResendHint('Un nouveau code a été envoyé.');
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Cantia</Text>
          <Text style={styles.subtitle}>Confirmez votre adresse e-mail</Text>
          <Text style={styles.hint}>
            {email ? `Un code à 6 chiffres a été envoyé à ${email}.` : 'Un code à 6 chiffres a été envoyé à votre adresse e-mail.'}
          </Text>

          <View style={styles.form}>
            <Field
              label="Code de vérification"
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="000000"
              maxLength={6}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {resendHint ? <Text style={styles.success}>{resendHint}</Text> : null}
            <Button title="Vérifier" onPress={handleVerify} loading={verifying} disabled={code.trim().length !== 6} />
          </View>

          <View style={styles.resendRow}>
            <Text onPress={handleResend} style={styles.linkText}>
              {resending ? 'Envoi…' : 'Renvoyer le code'}
            </Text>
          </View>
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
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  success: {
    color: colors.success,
    fontSize: fontSize.sm,
  },
  resendRow: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
