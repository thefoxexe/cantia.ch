import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { uploadToOrgBucket } from '../../../lib/api/storage';
import { assetFileInfo, normalizeImageOrientation } from '../../../lib/imageAsset';
import { suggestBrandColorFromImage } from '../../../lib/colorFromImage';
import { suggestBrandColorsFromWebsite } from '../../../lib/api/brandColors';
import { Button, Field, Screen } from '../../../components/ui';
import { BRAND_COLOR_PRESETS, HEX_COLOR_RE } from '../../../components/PdfTemplatePicker';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { TRADES } from '../../../lib/trades';

const DEFAULT_BRAND_COLOR = '#1F3D3A';

export default function CreateOrganizationScreen() {
  const { user, createOrganization, refreshOrganization } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [locality, setLocality] = useState('');
  const [trade, setTrade] = useState<string | null>(null);
  const [logoAsset, setLogoAsset] = useState<{ uri: string; mimeType?: string | null } | null>(null);
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [analyzingWebsite, setAnalyzingWebsite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addSuggestions(hexList: string[]) {
    if (!hexList.length) return;
    setSuggestedColors((prev) => [...new Set([...hexList, ...prev])].slice(0, 4));
    setBrandColor(hexList[0]);
  }

  async function pickLogo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setLogoAsset({ uri: asset.uri, mimeType: asset.mimeType });
    const suggested = await suggestBrandColorFromImage(asset.uri);
    if (suggested) addSuggestions([suggested]);
  }

  async function analyzeWebsite() {
    if (!website.trim() || analyzingWebsite) return;
    setAnalyzingWebsite(true);
    const found = await suggestBrandColorsFromWebsite(website.trim());
    setAnalyzingWebsite(false);
    addSuggestions(found);
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
      if (street.trim()) updates.street = street.trim();
      if (postalCode.trim()) updates.postal_code = postalCode.trim();
      if (locality.trim()) updates.locality = locality.trim();
      if (HEX_COLOR_RE.test(brandColor) && brandColor.toLowerCase() !== DEFAULT_BRAND_COLOR.toLowerCase()) {
        updates.brand_color = brandColor;
      }
      if (logoAsset) {
        const raw = assetFileInfo(logoAsset);
        const { uri, ext, contentType } = await normalizeImageOrientation(logoAsset.uri, raw.contentType);
        const { path, error: uploadError } = await uploadToOrgBucket(orgId, `branding/logo-${Date.now()}.${ext}`, uri, contentType);
        if (path) updates.logo_url = path;
        else if (uploadError) console.error('Logo upload failed:', uploadError);
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

        <Field
          label="Rue et numéro (optionnel)"
          value={street}
          onChangeText={setStreet}
          placeholder="Rue de l'Exemple 1"
        />
        <View style={styles.row2}>
          <View style={[styles.row2Item, { flexBasis: 100, flexGrow: 0 }]}>
            <Field label="NPA" value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" placeholder="1000" />
          </View>
          <View style={styles.row2Item}>
            <Field label="Localité" value={locality} onChangeText={setLocality} placeholder="Lausanne" />
          </View>
        </View>
        <Text style={styles.hint}>Requis plus tard pour générer des QR-factures conformes — modifiable dans les paramètres.</Text>

        <Text style={styles.fieldLabel}>Logo (optionnel)</Text>
        <View style={styles.logoRow}>
          {logoAsset ? (
            <Image source={{ uri: logoAsset.uri }} style={styles.logoPreview} />
          ) : (
            <View style={[styles.logoPreview, styles.logoPlaceholder]}>
              <Feather name="image" size={20} color={colors.textMuted} />
            </View>
          )}
          <Pressable style={styles.logoButton} onPress={pickLogo}>
            <Text style={styles.logoButtonText}>{logoAsset ? 'Changer le logo' : 'Choisir un logo'}</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Couleur de marque</Text>
        {suggestedColors.length ? (
          <Text style={styles.hint}>Suggérée à partir de votre logo et/ou site web — choisissez une autre couleur si elle ne vous convient pas.</Text>
        ) : (
          <Text style={styles.hint}>Ajoutez un logo ou un site web pour une suggestion automatique, ou choisissez une couleur ci-dessous.</Text>
        )}
        <View style={styles.colorRow}>
          {[...new Set([...suggestedColors, ...BRAND_COLOR_PRESETS])].map((hex) => (
            <Pressable
              key={hex}
              onPress={() => setBrandColor(hex)}
              style={[styles.colorSwatch, { backgroundColor: hex }, brandColor.toLowerCase() === hex.toLowerCase() && styles.colorSwatchActive]}
            >
              {brandColor.toLowerCase() === hex.toLowerCase() ? <Feather name="check" size={14} color={colors.surface} /> : null}
            </Pressable>
          ))}
        </View>
        {website.trim() ? (
          <Pressable onPress={analyzeWebsite} style={styles.analyzeLink} disabled={analyzingWebsite}>
            <Feather name="globe" size={13} color={colors.primary} />
            <Text style={styles.analyzeLinkText}>
              {analyzingWebsite ? 'Analyse du site en cours…' : 'Analyser les couleurs de mon site web'}
            </Text>
          </Pressable>
        ) : null}

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
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 160,
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
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: colors.text,
  },
  analyzeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  analyzeLinkText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
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
