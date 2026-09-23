import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { assetFileInfo, normalizeImageOrientation } from '../../../lib/imageAsset';
import { suggestBrandColorFromImage } from '../../../lib/colorFromImage';
import { suggestBrandColorsFromWebsite } from '../../../lib/api/brandColors';
import { Button, Card, Container, Field, PageHeader, AppScreen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { UnsavedChangesBar } from '../../../components/UnsavedChangesBar';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { useUnsavedChanges } from '../../../lib/useUnsavedChanges';
import { BRAND_COLOR_PRESETS, HEX_COLOR_RE, LOGO_PLACEMENTS } from '../../../components/PdfTemplatePicker';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

export default function ApparenceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, role, refreshOrganization } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState(organization?.brand_color ?? '#1F3D3A');
  const [logoPlacement, setLogoPlacement] = useState<'left' | 'center' | 'right'>(organization?.logo_placement ?? 'right');
  const [footerText, setFooterText] = useState(organization?.footer_text ?? '');
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [hasCustomization, setHasCustomization] = useState<boolean | null>(null);
  const [analyzingWebsite, setAnalyzingWebsite] = useState(false);
  const [websiteColors, setWebsiteColors] = useState<string[]>([]);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const isAdmin = role === 'owner' || role === 'admin';

  const { dirty, saving, markDirty, save, discard, confirmBeforeBack, leaveModalVisible, onLeaveSave, onLeaveDiscard, onLeaveCancel } =
    useUnsavedChanges(handleSave);

  function withDirty<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      markDirty();
    };
  }

  const load = useCallback(async () => {
    if (!organization) return;
    setBrandColor(organization.brand_color ?? '#1F3D3A');
    setLogoPlacement(organization.logo_placement ?? 'right');
    setFooterText(organization.footer_text ?? '');
    setWebsite(organization.website ?? '');
    if (organization.logo_url) setLogoUrl(await getSignedUrl(organization.logo_url));
    const { data: plan } = await supabase.from('plans').select('has_customization').eq('id', organization.plan_id).maybeSingle();
    setHasCustomization(plan?.has_customization ?? true);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!organization) return false;
    const validHex = HEX_COLOR_RE.test(brandColor.trim());
    await supabase
      .from('organizations')
      .update({
        brand_color: validHex ? brandColor.trim() : organization.brand_color,
        logo_placement: logoPlacement,
        footer_text: footerText.trim() || null,
        website: website.trim() || null,
      })
      .eq('id', organization.id);
    refreshOrganization();
  }

  async function pickLogo() {
    if (!organization || !isAdmin) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const raw = assetFileInfo(asset);
    const { uri, ext, contentType } = await normalizeImageOrientation(asset.uri, raw.contentType);
    const subPath = `branding/logo-${Date.now()}.${ext}`;
    const { path } = await uploadToOrgBucket(organization.id, subPath, uri, contentType);
    if (path) {
      await supabase.from('organizations').update({ logo_url: path }).eq('id', organization.id);
      await refreshOrganization();
      const url = await getSignedUrl(path);
      setLogoUrl(url);
      const suggested = await suggestBrandColorFromImage(uri);
      if (suggested) setBrandColor(suggested);
      showSavedCheckmark();
    }
  }

  async function analyzeWebsite() {
    if (!website.trim() || analyzingWebsite) return;
    setAnalyzingWebsite(true);
    setAnalyzeError(null);
    setWebsiteColors([]);
    const found = await suggestBrandColorsFromWebsite(website.trim());
    setAnalyzingWebsite(false);
    if (found.length) {
      setWebsiteColors(found);
    } else {
      setAnalyzeError(t('apparence.websiteNoColorsFound'));
    }
  }

  const previewColor = HEX_COLOR_RE.test(brandColor.trim()) ? brandColor.trim() : colors.border;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('apparence.title')} backTo="/(app)/compte" onBeforeBack={confirmBeforeBack} />

          <View style={styles.introRow}>
            <Text style={styles.introText}>{t('apparence.intro')}</Text>
            <Pressable onPress={pickLogo} disabled={!isAdmin} style={styles.logoInlineWrap}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoPreviewSmall} />
              ) : (
                <View style={[styles.logoPreviewSmall, styles.brandPlaceholder]}>
                  <Feather name="image" size={16} color={colors.textMuted} />
                </View>
              )}
              {isAdmin ? (
                <View style={styles.logoEditBadge}>
                  <Feather name="camera" size={10} color="#fff" />
                </View>
              ) : null}
            </Pressable>
          </View>
          <Text style={styles.hint}>{t('apparence.logoFormatHint')}</Text>
          <Text style={styles.hint}>{t('apparence.signatureHint')}</Text>

          <Card style={styles.previewCard}>
            <View style={[styles.previewBand, { backgroundColor: previewColor }]}>
              <Text style={styles.previewBandText}>{t('apparence.previewBand')}</Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={[styles.previewOrgName, { color: previewColor }]} numberOfLines={1}>
                {organization?.name || t('apparence.previewOrgFallback')}
              </Text>
              <Text style={styles.previewTrade}>
                {t('apparence.previewTradeSuffix', { trade: (organization?.trade || t('apparence.previewTradeFallback')).toUpperCase() })}
              </Text>
              <Text style={styles.previewTotal}>{t('apparence.previewTotal')}</Text>
            </View>
          </Card>

          {hasCustomization === false ? (
            <Card style={styles.upsell}>
              <Feather name="lock" size={20} color={colors.accent} />
              <Text style={styles.upsellTitle}>{t('apparence.upsellTitle')}</Text>
              <Text style={styles.hint}>{t('apparence.upsellPlanHint')}</Text>
              <Button
                title={t('apparence.seePlans')}
                variant="secondary"
                icon="arrow-right"
                onPress={() => router.push('/(app)/compte/facturation')}
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ) : (
            <>
              <Text style={styles.sectionTitle}>{t('apparence.brandColorTitle')}</Text>
              <Text style={styles.hint}>{t('apparence.brandColorHint')}</Text>

              <Text style={styles.searchLabel}>{t('apparence.websiteLabel')}</Text>
              <View style={styles.searchBar}>
                <Feather name="search" size={15} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={website}
                  onChangeText={(v) => {
                    withDirty(setWebsite)(v);
                    setWebsiteColors([]);
                    setAnalyzeError(null);
                  }}
                  editable={isAdmin}
                  autoCapitalize="none"
                  keyboardType="url"
                  placeholder={t('apparence.websitePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  onSubmitEditing={analyzeWebsite}
                  returnKeyType="search"
                />
                {isAdmin && website.trim() ? (
                  <Pressable onPress={analyzeWebsite} disabled={analyzingWebsite} style={styles.searchButton}>
                    {analyzingWebsite ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.searchButtonText}>{t('apparence.analyzeWebsite')}</Text>
                    )}
                  </Pressable>
                ) : null}
              </View>
              <Text style={styles.hint}>{analyzingWebsite ? t('apparence.analyzing') : t('apparence.websiteHint')}</Text>

              {websiteColors.length > 0 ? (
                <View style={styles.resultsBlock}>
                  <Text style={styles.resultsLabel}>{t('apparence.websiteResultsLabel')}</Text>
                  <View style={styles.colorRow}>
                    {websiteColors.map((hex) => (
                      <Pressable
                        key={hex}
                        onPress={() => withDirty(setBrandColor)(hex)}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: hex },
                          brandColor.toLowerCase() === hex.toLowerCase() && styles.colorSwatchActive,
                        ]}
                      >
                        {brandColor.toLowerCase() === hex.toLowerCase() ? <Feather name="check" size={14} color="#fff" /> : null}
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : analyzeError ? (
                <Text style={styles.errorHint}>{analyzeError}</Text>
              ) : null}

              <Text style={styles.sectionTitle}>{t('apparence.presetsTitle')}</Text>
              <View style={styles.colorRow}>
                {BRAND_COLOR_PRESETS.map((hex) => (
                  <Pressable
                    key={hex}
                    onPress={() => isAdmin && withDirty(setBrandColor)(hex)}
                    disabled={!isAdmin}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: hex },
                      brandColor.toLowerCase() === hex.toLowerCase() && styles.colorSwatchActive,
                    ]}
                  >
                    {brandColor.toLowerCase() === hex.toLowerCase() ? <Feather name="check" size={14} color={colors.surface} /> : null}
                  </Pressable>
                ))}
              </View>
              <View style={styles.hexRow}>
                <View style={[styles.hexPreview, { backgroundColor: previewColor }]} />
                <View style={{ flex: 1 }}>
                  <Field
                    label={t('apparence.customColorLabel')}
                    value={brandColor}
                    onChangeText={withDirty(setBrandColor)}
                    editable={isAdmin}
                    autoCapitalize="none"
                    placeholder="#1F3D3A"
                  />
                </View>
              </View>
              {isAdmin && brandColor.trim() && !HEX_COLOR_RE.test(brandColor.trim()) ? (
                <Text style={styles.errorHint}>{t('apparence.hexFormatError')}</Text>
              ) : null}

              <Text style={styles.sectionTitle}>{t('apparence.logoPlacementTitle')}</Text>
              <View style={styles.placementRow}>
                {LOGO_PLACEMENTS.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => isAdmin && withDirty(setLogoPlacement)(p.id)}
                    disabled={!isAdmin}
                    style={[styles.placementChip, logoPlacement === p.id && styles.chipActive, !isAdmin && styles.chipDisabled]}
                  >
                    <Feather name={p.icon} size={14} color={logoPlacement === p.id ? colors.primary : colors.textMuted} />
                    <Text style={[styles.chipText, logoPlacement === p.id && styles.chipTextActive]}>{t(`apparence.logoPlacements.${p.id}` as any)}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionTitle}>{t('apparence.footerTitle')}</Text>
              <Field
                label={t('apparence.footerLabel')}
                value={footerText}
                onChangeText={withDirty(setFooterText)}
                editable={isAdmin}
                placeholder={t('apparence.footerPlaceholder')}
              />
              <Text style={styles.hint}>{t('apparence.footerHint')}</Text>
            </>
          )}
        </Container>
      </ScrollView>
      {isAdmin ? <UnsavedChangesBar visible={dirty} saving={saving} onSave={save} onDiscard={() => discard(load)} /> : null}
      <UnsavedChangesModal visible={leaveModalVisible} saving={saving} onSave={onLeaveSave} onDiscard={onLeaveDiscard} onCancel={onLeaveCancel} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  previewCard: {
    padding: 0,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  previewBand: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewBandText: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  previewBody: {
    padding: spacing.lg,
    gap: 2,
  },
  previewOrgName: {
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  previewTrade: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  previewTotal: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  introText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
  logoInlineWrap: {
    position: 'relative',
  },
  logoPreviewSmall: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  logoEditBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  brandPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  searchLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingLeft: spacing.md,
    paddingRight: 4,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    height: '100%',
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  resultsBlock: {
    marginTop: spacing.md,
  },
  resultsLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorHint: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  upsellTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  hexRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  hexPreview: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  placementRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  placementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
  chipDisabled: {
    opacity: 0.6,
  },
});
