import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { cancelJoinRequest, getMyPendingRequest, requestToJoin, searchOrganizations, type MyJoinRequest } from '../../../lib/api/invites';
import { Button, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { OrganizationSearchResult } from '../../../lib/types';

export default function JoinOrganizationScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OrganizationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [pending, setPending] = useState<MyJoinRequest | null | undefined>(undefined);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyPendingRequest().then(setPending);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      setResults(await searchOrganizations(query.trim()));
      setSearching(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  async function handleRequest(org: OrganizationSearchResult) {
    if (!user) return;
    setError(null);
    setRequestingId(org.id);
    const { error: reqError } = await requestToJoin(org.id, user.id);
    setRequestingId(null);
    if (reqError) {
      setError(reqError);
      return;
    }
    setPending(await getMyPendingRequest());
  }

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
        <Pressable onPress={() => router.replace('/(auth)/onboarding')} style={styles.backLink} hitSlop={8}>
          <Feather name="arrow-left" size={16} color={colors.textMuted} />
          <Text style={styles.backLinkText}>Retour</Text>
        </Pressable>

        <Text style={styles.title}>Rejoindre une entreprise</Text>
        <Text style={styles.subtitle}>Recherchez le nom de l'entreprise à rejoindre. Le propriétaire devra valider votre demande.</Text>

        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Ex : Editec"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
          {searching ? <ActivityIndicator size="small" color={colors.textMuted} /> : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {results.map((org) => (
            <View key={org.id} style={styles.resultCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{org.name}</Text>
                <Text style={styles.resultMeta}>
                  {org.member_count} membre{Number(org.member_count) > 1 ? 's' : ''}
                </Text>
              </View>
              <Button title="Demander" onPress={() => handleRequest(org)} loading={requestingId === org.id} style={{ minWidth: 110 }} />
            </View>
          ))}
          {query.trim().length >= 2 && !searching && results.length === 0 ? (
            <Text style={styles.emptyText}>Aucune entreprise trouvée pour « {query.trim()} ».</Text>
          ) : null}
        </View>

        <Text style={styles.altText}>
          Vous avez plutôt reçu un lien d'invitation ? Ouvrez-le directement, il vous ajoutera automatiquement.
        </Text>
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backLinkText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
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
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 21,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  resultName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  resultMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  altText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 17,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
