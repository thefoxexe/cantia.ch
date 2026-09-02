import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useTranslation } from '../lib/translations';

export function GoogleSignInButton() {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithGoogle();
    setLoading(false);
    // On success the auth-state listener picks up the new session and the
    // root layout redirects automatically — nothing else to do here. On
    // native, a user simply dismissing the browser sheet also lands here
    // with no error, which is correct (not a failure to report).
    if (err) setError(err);
  }

  return (
    <View>
      <Pressable style={styles.button} onPress={handlePress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color={colors.text} />
            <Text style={styles.text}>{t('googleSignIn.continueWithGoogle')}</Text>
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
