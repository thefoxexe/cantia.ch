import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth-context';
import { Button, Field, Screen } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const TRADES = [
  'Génie civil',
  'Maçonnerie',
  'Serrurerie',
  'Électricité',
  'Plomberie / Sanitaire',
  'Menuiserie / Charpente',
  'Peinture',
  'Carrelage',
  'Chauffage / Ventilation',
  'Paysagisme',
  'Autre',
];

export default function OnboardingScreen() {
  const { createOrganization, signOut } = useAuth();
  const [name, setName] = useState('');
  const [trade, setTrade] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    if (!name.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    setLoading(true);
    const { error } = await createOrganization(name.trim(), trade);
    setLoading(false);
    if (error) setError(error);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bienvenue sur Opus-Flow</Text>
        <Text style={styles.subtitle}>Créez votre espace entreprise pour commencer.</Text>

        <Field
          label="Nom de l'entreprise / raison individuelle"
          value={name}
          onChangeText={setName}
          placeholder="Ex : Dupont Serrurerie Sàrl"
        />

        <Text style={styles.fieldLabel}>Métier</Text>
        <View style={styles.chips}>
          {TRADES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTrade(t)}
              style={[styles.chip, trade === t && styles.chipActive]}
            >
              <Text style={[styles.chipText, trade === t && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Créer mon espace" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.xl }} />
        <Button title="Se déconnecter" onPress={signOut} variant="secondary" style={{ marginTop: spacing.md }} />
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
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
