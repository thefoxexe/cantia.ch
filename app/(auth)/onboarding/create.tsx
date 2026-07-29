import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { uploadToOrgBucket } from '../../../lib/api/storage';
import { Button, Field, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

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

export default function CreateOrganizationScreen() {
  const { user, createOrganization, refreshOrganization } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [trade, setTrade] = useState<string | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickLogo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.length) return;
    setLogoUri(result.assets[0].uri);
  }

  async function handleCreate() {
    setError(null);
    if (!name.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    setLoading(true);
    const { error: createError } = await createOrganization(name.trim(), trade);
    if (createError) {
      setLoading(false);
      setError(createError);
      return;
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user?.id ?? '')
      .single();
    const orgId = membership?.organization_id as string | undefined;

    if (orgId) {
      const updates: Record<string, string | null> = {};
      if (website.trim()) updates.website = website.trim();
      if (logoUri) {
        const ext = (logoUri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
        const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
        const { path } = await uploadToOrgBucket(orgId, `branding/logo-${Date.now()}.${ext}`, logoUri, contentType);
        if (path) updates.logo_url = path;
      }
      if (Object.keys(updates).length) {
        await supabase.from('organizations').update(updates).eq('id', orgId);
      }
    }

    await refreshOrganization();
    setLoading(false);
    // The root layout redirects to /choose-plan automatically once
    // `organization` is set and `plan_selected` is false.
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.replace('/(auth)/onboarding')} style={styles.backLink} hitSlop={8}>
          <Feather name="arrow-left" size={16} color={colors.textMuted} />
          <Text style={styles.backLinkText}>Retour</Text>
        </Pressable>

        <Text style={styles.title}>Créer votre entreprise</Text>
        <Text style={styles.subtitle}>Ces informations apparaîtront sur vos devis et rapports.</Text>

        <Field
          label="Nom de l'entreprise / raison individuelle"
          value={name}
          onChangeText={setName}
          placeholder="Ex : Dupont Serrurerie Sàrl"
        />

        <Field
          label="Site web (optionnel)"
          value={website}
          onChangeText={setWebsite}
          autoCapitalize="none"
          placeholder="www.entreprise.ch"
        />

        <Text style={styles.fieldLabel}>Logo (optionnel)</Text>
        <View style={styles.logoRow}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoPreview} />
          ) : (
            <View style={[styles.logoPreview, styles.logoPlaceholder]}>
              <Feather name="image" size={20} color={colors.textMuted} />
            </View>
          )}
          <Pressable style={styles.logoButton} onPress={pickLogo}>
            <Text style={styles.logoButtonText}>{logoUri ? 'Changer le logo' : 'Choisir un logo'}</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Métier</Text>
        <View style={styles.chips}>
          {TRADES.map((t) => (
            <Pressable key={t} onPress={() => setTrade(t)} style={[styles.chip, trade === t && styles.chipActive]}>
              <Text style={[styles.chipText, trade === t && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Créer mon espace" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.xl }} />
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
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  logoPreview: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  logoButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
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
