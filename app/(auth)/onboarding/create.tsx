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
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { TRADES, TRADE_KEYS } from '../../../lib/trades';
import { localityForNpa } from '../../../lib/swissPostalCodes';
import { SwissAddressField } from '../../../components/SwissAddressField';

const DEFAULT_BRAND_COLOR = '#1F3D3A';

export default function CreateOrganizationScreen() {
  const { t } = useTranslation();
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

  function handlePostalCodeChange(value: string) {
    setPostalCode(value);
    const match = localityForNpa(value);
    if (match && !locality.trim()) setLocality(match);
  }

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
      setError(t('authOnboardingCreate.nameRequired'));
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
          <Text style={styles.backLinkText}>{t('authOnboardingCreate.backLink')}</Text>
        </Pressable>

        <Text style={styles.title}>{t('authOnboardingCreate.title')}</Text>
        <Text style={styles.subtitle}>{t('authOnboardingCreate.subtitle')}</Text>

        <Field
          label={t('authOnboardingCreate.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('authOnboardingCreate.namePlaceholder')}
        />

        <Field
          label={t('authOnboardingCreate.websiteLabel')}
          value={website}
          onChangeText={setWebsite}
          autoCapitalize="none"
          placeholder={t('authOnboardingCreate.websitePlaceholder')}
        />

        <SwissAddressField
          label={t('authOnboardingCreate.streetLabel')}
          value={street}
          onChangeText={setStreet}
          onSelectAddress={(addr) => {
            setStreet(addr.street);
            setPostalCode(addr.postalCode);
            setLocality(addr.locality);
          }}
          placeholder={t('authOnboardingCreate.streetPlaceholder')}
        />
        <View style={styles.row2}>
          <View style={[styles.row2Item, { flexBasis: 100, flexGrow: 0 }]}>
            <Field label={t('authOnboardingCreate.npaLabel')} value={postalCode} onChangeText={handlePostalCodeChange} keyboardType="number-pad" placeholder="1000" />
          </View>
          <View style={styles.row2Item}>
            <Field label={t('authOnboardingCreate.localityLabel')} value={locality} onChangeText={setLocality} placeholder={t('authOnboardingCreate.localityPlaceholder')} />
          </View>
        </View>
        <Text style={styles.hint}>{t('authOnboardingCreate.addressHint')}</Text>

        <Text style={styles.fieldLabel}>{t('authOnboardingCreate.logoLabel')}</Text>
        <View style={styles.logoRow}>
          {logoAsset ? (
            <Image source={{ uri: logoAsset.uri }} style={styles.logoPreview} />
          ) : (
            <View style={[styles.logoPreview, styles.logoPlaceholder]}>
              <Feather name="image" size={20} color={colors.textMuted} />
            </View>
          )}
          <Pressable style={styles.logoButton} onPress={pickLogo}>
            <Text style={styles.logoButtonText}>{logoAsset ? t('authOnboardingCreate.changeLogo') : t('authOnboardingCreate.chooseLogo')}</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>{t('authOnboardingCreate.brandColorLabel')}</Text>
        {suggestedColors.length ? (
          <Text style={styles.hint}>{t('authOnboardingCreate.colorSuggestedHint')}</Text>
        ) : (
          <Text style={styles.hint}>{t('authOnboardingCreate.colorDefaultHint')}</Text>
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
              {analyzingWebsite ? t('authOnboardingCreate.analyzingWebsite') : t('authOnboardingCreate.analyzeWebsite')}
            </Text>
          </Pressable>
        ) : null}

        <Text style={styles.fieldLabel}>{t('authOnboardingCreate.tradeLabel')}</Text>
        <View style={styles.chips}>
          {TRADES.map((tr) => (
            <Pressable key={tr} onPress={() => setTrade(tr)} style={[styles.chip, trade === tr && styles.chipActive]}>
              <Text style={[styles.chipText, trade === tr && styles.chipTextActive]}>{t(`trades.${TRADE_KEYS[tr]}` as any)}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={t('authOnboardingCreate.submit')} onPress={handleCreate} loading={loading} style={{ marginTop: spacing.xl }} />
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
