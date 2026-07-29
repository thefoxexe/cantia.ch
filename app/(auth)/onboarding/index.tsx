import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { getMyPendingRequest, cancelJoinRequest, type MyJoinRequest } from '../../../lib/api/invites';
import { Button, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

export default function OnboardingHubScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<MyJoinRequest | null | undefined>(undefined);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getMyPendingRequest().then(setPending);
  }, []);

  async function handleCancel() {
    if (!pending) return;
    setCancelling(true);
    await cancelJoinRequest(pending.id);
    setCancelling(false);
    setPending(null);
  }

  if (pending === undefined) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <Text>Chargement…</Text>
      </Screen>
    );
  }

  if (pending) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.container}>
          <Feather name="clock" size={32} color={colors.primary} style={styles.centerIcon} />
          <Text style={styles.title}>Demande envoyée</Text>
          <Text style={styles.subtitle}>
            Votre demande pour rejoindre <Text style={styles.bold}>{pending.organization_name}</Text> est en attente de validation par un
            administrateur. Vous serez ajouté automatiquement dès qu'elle sera acceptée.
          </Text>
          <Button title="Annuler la demande" variant="secondary" onPress={handleCancel} loading={cancelling} style={{ marginTop: spacing.xl }} />
          <Button title="Se déconnecter" variant="secondary" onPress={signOut} style={{ marginTop: spacing.md }} />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bienvenue sur Opus-Flow</Text>
        <Text style={styles.subtitle}>Voulez-vous créer une entreprise ou rejoindre une entreprise existante ?</Text>

        <Pressable style={styles.choiceCard} onPress={() => router.push('/(auth)/onboarding/create')}>
          <View style={styles.choiceIcon}>
            <Feather name="briefcase" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>Créer une entreprise</Text>
            <Text style={styles.choiceText}>Vous êtes le premier de votre entreprise sur Opus-Flow.</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable style={styles.choiceCard} onPress={() => router.push('/(auth)/onboarding/join')}>
          <View style={styles.choiceIcon}>
            <Feather name="users" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.choiceTitle}>Rejoindre une entreprise</Text>
            <Text style={styles.choiceText}>Votre entreprise utilise déjà Opus-Flow.</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>

        <Button title="Se déconnecter" onPress={signOut} variant="secondary" style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  choiceText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
});
