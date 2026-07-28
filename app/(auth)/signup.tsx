import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { Button, Field, Screen } from '../../components/ui';
import { colors, fontSize, spacing } from '../../lib/theme';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <Screen>
        <View style={styles.container}>
          <Text style={styles.brand}>Opus</Text>
          <Text style={[styles.subtitle, { marginTop: spacing.lg }]}>
            Compte créé. Si la confirmation par e-mail est activée, vérifiez votre boîte mail avant de vous
            connecter.
          </Text>
          <Button title="Aller à la connexion" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.xl }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>Opus</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>

          <View style={styles.form}>
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
