import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { MicrosoftSignInButton } from '../../components/MicrosoftSignInButton';
import { Button, Field, Screen } from '../../components/ui';
import { colors, fontSize, spacing } from '../../lib/theme';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!fullName.trim()) {
      setError('Votre nom est requis.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    const { error, needsVerification } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (error) {
      setError(error);
    } else if (needsVerification) {
      router.replace(`/(auth)/verify-email?email=${encodeURIComponent(email.trim())}` as any);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <Screen>
        <View style={styles.container}>
          <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Cantia</Text>
          <Text style={[styles.subtitle, { marginTop: spacing.lg }]}>Compte créé.</Text>
          <Button title="Continuer" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.xl }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Cantia</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>

          <View style={styles.form}>
            <Field
              label="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ex : Jean Dupont"
              autoCapitalize="words"
            />
            <Field
              label="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="vous@entreprise.ch"
            />
            <Field
              label="Mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Au moins 6 caractères"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Créer mon compte" onPress={handleSubmit} loading={loading} />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <GoogleSignInButton />
            <MicrosoftSignInButton />
          </View>

          <Link href="/(auth)/login" style={styles.link}>
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
          </Link>
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
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
