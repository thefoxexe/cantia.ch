import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { acceptInvite, getInvitePreview } from '../../../lib/api/invites';
import { setPendingInvite, clearPendingInvite } from '../../../lib/pendingInvite';
import { Button, Screen } from '../../../components/ui';
import { colors, fontSize, spacing } from '../../../lib/theme';

export default function JoinScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { session, organization, refreshOrganization } = useAuth();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) setPendingInvite(token);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    getInvitePreview(token).then(({ organizationName, valid: v }) => {
      setOrgName(organizationName);
      setValid(v);
    });
  }, [token]);

  useEffect(() => {
    if (organization) clearPendingInvite();
  }, [organization]);

  async function handleAccept() {
    setJoining(true);
    setError(null);
    const { error: err } = await acceptInvite(token);
    setJoining(false);
    if (err) {
      setError(err);
      return;
    }
    await clearPendingInvite();
    await refreshOrganization();
  }

  async function handleCreateInstead() {
    await clearPendingInvite();
    router.replace('/(auth)/onboarding');
  }

  if (valid === null) {
    return (
      <Screen>
        <View style={styles.container}>
          <Text style={styles.subtitle}>Chargement…</Text>
        </View>
      </Screen>
    );
  }

  if (!valid) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Invitation invalide</Text>
            <Text style={styles.subtitle}>
              Ce lien d'invitation n'est plus valable : il a peut-être déjà été utilisé, révoqué, ou a expiré.
              Demandez un nouveau lien à la personne qui vous a invité.
            </Text>
            <Button title="Aller à la connexion" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.xl }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Vous êtes invité·e à rejoindre</Text>
            <Text style={styles.orgName}>{orgName}</Text>
            <Text style={styles.subtitle}>Créez votre compte ou connectez-vous pour rejoindre l'équipe.</Text>
            <Button title="Créer mon compte" onPress={() => router.push('/(auth)/signup')} style={{ marginTop: spacing.xl }} />
            <Button
              title="J'ai déjà un compte — Se connecter"
              variant="secondary"
              onPress={() => router.push('/(auth)/login')}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (organization) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <Text style={styles.title}>Vous êtes déjà dans une entreprise</Text>
            <Text style={styles.subtitle}>
              Votre compte fait déjà partie de {organization.name}. Un compte ne peut appartenir qu'à une seule
              entreprise à la fois.
            </Text>
            <Button title="Retour à l'application" onPress={() => router.replace('/(app)')} style={{ marginTop: spacing.xl }} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Image source={require('../../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Rejoindre</Text>
          <Text style={styles.orgName}>{orgName}</Text>
          <Text style={styles.subtitle}>Vous allez rejoindre cette entreprise avec votre compte actuel.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Rejoindre l'entreprise" onPress={handleAccept} loading={joining} style={{ marginTop: spacing.xl }} />
          <Button
            title="Créer ma propre entreprise à la place"
            variant="secondary"
            onPress={handleCreateInstead}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: spacing.xl,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    width: 48,
    height: 36,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  orgName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
