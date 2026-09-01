import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MicrosoftLogo } from './MicrosoftLogo';
import { useAuth } from '../lib/auth-context';
import { colors, fontSize, radius, spacing } from '../lib/theme';

export function MicrosoftSignInButton() {
  const { signInWithMicrosoft } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithMicrosoft();
    setLoading(false);
    // Same as GoogleSignInButton: on success the auth-state listener picks
    // up the new session and the root layout redirects automatically, and
    // a dismissed browser sheet on native lands here with no error too.
    if (err) setError(err);
  }

  return (
    <View>
      <Pressable style={styles.button} onPress={handlePress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <>
            <MicrosoftLogo size={16} />
            <Text style={styles.text}>Continuer avec Microsoft</Text>
          </>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
