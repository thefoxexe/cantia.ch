import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { assetFileInfo, normalizeImageOrientation } from '../../../lib/imageAsset';
import { suggestBrandColorFromImage } from '../../../lib/colorFromImage';
import { BrandColorPicker } from '../../../components/BrandColorPicker';
import { HueColorPicker } from '../../../components/HueColorPicker';
import { DocumentModelThumb, type DocumentModelId } from '../../../components/DocumentModelThumb';
import { Button, Card, Container, Field, PageHeader, AppScreen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { UnsavedChangesBar } from '../../../components/UnsavedChangesBar';
import { RelatedSettings, SettingsSection } from '../../../components/SettingsSection';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { useUnsavedChanges } from '../../../lib/useUnsavedChanges';
import { HEX_COLOR_RE, LOGO_PLACEMENTS } from '../../../components/PdfTemplatePicker';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { downloadWindowTestPage, type WindowTestTexts } from '../../../lib/pdf/windowTestPage';
import { documentOptionsReady } from '../../../lib/documentOptions';
import { Platform } from 'react-native';

const DEFAULT_ACCENT = '#C9A46A';
// base_layout ids already allowed by the database: moderne = Angle,
// structure = Prestige, minimal = Épuré.
const MODELS: { id: DocumentModelId; key: 'classic' | 'angle' | 'prestige' | 'epure' }[] = [
  { id: 'classic', key: 'classic' },
  { id: 'moderne', key: 'angle' },
  { id: 'structure', key: 'prestige' },
  { id: 'minimal', key: 'epure' },
];

export default function ApparenceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, role, refreshOrganization } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState(organization?.brand_color ?? '#1F3D3A');
  const [logoPlacement, setLogoPlacement] = useState<'left' | 'center' | 'right'>(organization?.logo_placement ?? 'right');
  const [footerText, setFooterText] = useState(organization?.footer_text ?? '');
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [addressPosition, setAddressPosition] = useState<'left' | 'right'>(organization?.client_address_position ?? 'left');
  const [offsetX, setOffsetX] = useState(String(organization?.client_address_offset_x_mm ?? 0));
  const [offsetY, setOffsetY] = useState(String(organization?.client_address_offset_y_mm ?? 0));
  const [offsetError, setOffsetError] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasCustomization, setHasCustomization] = useState<boolean | null>(null);
  const [logoColors, setLogoColors] = useState<string[]>([]);
  // Document model (pdf_templates, kind 'devis', shared by devis and
  // factures) and the models' accent colour.
  const [model, setModel] = useState<DocumentModelId>('classic');
  const [savedModel, setSavedModel] = useState<DocumentModelId>('classic');
  const [modelIds, setModelIds] = useState<Partial<Record<DocumentModelId, string>>>({});
  const [modelError, setModelError] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState(organization?.brand_accent_color ?? DEFAULT_ACCENT);
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
    setAddressPosition(organization.client_address_position ?? 'left');
    setOffsetX(String(organization.client_address_offset_x_mm ?? 0));
    setOffsetY(String(organization.client_address_offset_y_mm ?? 0));
    setOffsetError(null);
    if (organization.logo_url) setLogoUrl(await getSignedUrl(organization.logo_url));
    setAccentColor(organization.brand_accent_color ?? DEFAULT_ACCENT);
    const { data: plan } = await supabase.from('plans').select('has_customization').eq('id', organization.plan_id).maybeSingle();
    setHasCustomization(plan?.has_customization ?? true);
    const { data: templates, error: templatesError } = await supabase
      .from('pdf_templates')
      .select('id, base_layout, is_default')
      .eq('organization_id', organization.id)
      .eq('kind', 'devis');
    if (templatesError) {
      setModelError(t('apparence.modelUnavailable'));
    } else {
      setModelError(null);
      const ids: Partial<Record<DocumentModelId, string>> = {};
      let current: DocumentModelId = 'classic';
      for (const row of templates ?? []) {
        if (!MODELS.some((m) => m.id === row.base_layout)) continue;
        ids[row.base_layout as DocumentModelId] = row.id;
        if (row.is_default) current = row.base_layout as DocumentModelId;
      }
      setModelIds(ids);
      setModel(current);
      setSavedModel(current);
    }
  }, [organization, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!organization) return false;
    const validHex = HEX_COLOR_RE.test(brandColor.trim());
    const dx = parseOffset(offsetX);
    const dy = parseOffset(offsetY);
    if (dx == null || dy == null) {
      setOffsetError(t('apparence.addressOffsetError'));
      return false;
    }
    setOffsetError(null);
    setSaveError(null);
    const validAccent = HEX_COLOR_RE.test(accentColor.trim());
    const { error } = await supabase
      .from('organizations')
      .update({
        brand_color: validHex ? brandColor.trim() : organization.brand_color,
        // Only once the column exists (migration 20261113100000).
        ...('brand_accent_color' in organization && validAccent ? { brand_accent_color: accentColor.trim() } : {}),
        logo_placement: logoPlacement,
        footer_text: footerText.trim() || null,
        website: website.trim() || null,
        ...(documentOptionsReady(organization) ? { client_address_position: addressPosition, client_address_offset_x_mm: dx, client_address_offset_y_mm: dy } : {}),
      })
      .eq('id', organization.id);
    if (error) {
      setSaveError(`${t('entreprise.saveFailed')} (${error.message})`);
      return false;
    }
    if (model !== savedModel && modelIds[model]) {
      const { error: modelSaveError } = await supabase.rpc('set_default_pdf_template', { p_org: organization.id, p_template: modelIds[model], p_kind: 'devis' });
      if (modelSaveError) {
        setSaveError(`${t('entreprise.saveFailed')} (${modelSaveError.message})`);
        return false;
      }
      setSavedModel(model);
    }
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
      if (suggested) {
        setLogoColors([suggested]);
        withDirty(setBrandColor)(suggested);
      }
      showSavedCheckmark();
    }
  }

  const previewColor = HEX_COLOR_RE.test(brandColor.trim()) ? brandColor.trim() : colors.border;
  const thumbBrand = HEX_COLOR_RE.test(brandColor.trim()) ? brandColor.trim() : '#1F3D3A';
  const thumbAccent = HEX_COLOR_RE.test(accentColor.trim()) ? accentColor.trim() : DEFAULT_ACCENT;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 3 }}>
        <Container>
          <PageHeader title={t('apparence.title')} backTo="/(app)/compte" onBeforeBack={confirmBeforeBack} />

          <Text style={styles.introText}>{t('apparence.intro')}</Text>

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

          <SettingsSection icon="image" title={t('apparence.sections.logo.title')} hint={t('apparence.sections.logo.hint')}>
            <View style={styles.logoRow}>
              <Pressable onPress={pickLogo} disabled={!isAdmin} style={styles.logoInlineWrap}>
                {logoUrl ? (
                  <Image source={{ uri: logoUrl }} style={styles.logoPreviewSmall} />
                ) : (
                  <View style={[styles.logoPreviewSmall, styles.brandPlaceholder]}>
                    <Feather name="image" size={16} color={colors.textMuted} />
                  </View>
                )}
              </Pressable>
              {isAdmin ? (
                <Button title={logoUrl ? t('apparence.changeLogo') : t('apparence.chooseLogo')} variant="secondary" icon="upload" onPress={pickLogo} />
              ) : null}
            </View>
            <Text style={styles.hint}>{t('apparence.logoFormatHint')}</Text>
            {hasCustomization !== false ? (
              <>
                <Text style={styles.fieldLabel}>{t('apparence.logoPlacementTitle')}</Text>
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
              </>
            ) : null}
            <Text style={styles.hint}>{t('apparence.signatureHint')}</Text>
          </SettingsSection>

          {hasCustomization === false ? (
            <Card style={[styles.upsell, { marginTop: spacing.xl }]}>
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
            <SettingsSection icon="droplet" title={t('apparence.sections.color.title')} hint={t('apparence.sections.color.hint')}>
              <Field
                label={t('apparence.websiteLabel')}
                value={website}
                onChangeText={withDirty(setWebsite)}
                editable={isAdmin}
                autoCapitalize="none"
                keyboardType="url"
                placeholder={t('apparence.websitePlaceholder')}
              />
              <BrandColorPicker
                value={brandColor}
                onChange={withDirty(setBrandColor)}
                website={website}
                logoColors={logoColors}
                companyName={organization?.name}
                disabled={!isAdmin}
              />
            </SettingsSection>
          )}

          {hasCustomization !== false ? (
            <SettingsSection icon="layout" title={t('apparence.sections.model.title')} hint={t('apparence.sections.model.hint')}>
              {modelError ? <Text style={styles.errorText}>{modelError}</Text> : null}
              <View style={styles.modelGrid}>
                {MODELS.map((m) => {
                  const selected = model === m.id;
                  const available = !!modelIds[m.id];
                  return (
                    <Pressable
                      key={m.id}
                      disabled={!isAdmin || !available}
                      onPress={() => withDirty(setModel)(m.id)}
                      style={[styles.modelCard, selected && { borderColor: thumbBrand, backgroundColor: colors.surface }, !available && { opacity: 0.5 }]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                    >
                      <DocumentModelThumb model={m.id} brand={thumbBrand} accent={thumbAccent} logoUri={logoUrl} width={128} />
                      <View style={styles.modelText}>
                        <View style={styles.modelNameRow}>
                          <Text style={styles.modelName}>{t(`apparence.models.${m.key}.name`)}</Text>
                          {selected ? <Feather name="check-circle" size={16} color={thumbBrand} /> : null}
                        </View>
                        <Text style={styles.modelHint}>{t(`apparence.models.${m.key}.text`)}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              {model !== 'classic' ? <Text style={styles.modelNote}>{t('apparence.modelLogoNote')}</Text> : null}

              {'brand_accent_color' in (organization ?? {}) ? (
                <View style={{ marginTop: spacing.lg }}>
                  <Text style={styles.accentLabel}>{t('apparence.accentLabel')}</Text>
                  <Text style={styles.modelHint}>{t('apparence.accentHint')}</Text>
                  <View style={{ marginTop: spacing.sm }}>
                    <HueColorPicker value={accentColor} onChange={withDirty(setAccentColor)} disabled={!isAdmin} />
                  </View>
                </View>
              ) : null}
            </SettingsSection>
          ) : null}

          {documentOptionsReady(organization) ? (
            <SettingsSection icon="mail" title={t('apparence.sections.address.title')} hint={t('apparence.sections.address.hint')}>
              <View style={styles.placementRow}>
                {(['left', 'right'] as const).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => isAdmin && withDirty(setAddressPosition)(p)}
                    disabled={!isAdmin}
                    style={[styles.placementChip, addressPosition === p && styles.chipActive, !isAdmin && styles.chipDisabled]}
                  >
                    <Feather name={p === 'left' ? 'align-left' : 'mail'} size={14} color={addressPosition === p ? colors.primary : colors.textMuted} />
                    <Text style={[styles.chipText, addressPosition === p && styles.chipTextActive]}>{t(`apparence.addressPositions.${p}` as any)}</Text>
                  </Pressable>
                ))}
              </View>
              {addressPosition === 'right' ? (
                <>
                  <Text style={styles.hint}>{t('apparence.addressRightHint')}</Text>
                  <View style={styles.offsetRow}>
                    <View style={styles.offsetField}>
                      <Field label={t('apparence.addressOffsetX')} value={offsetX} onChangeText={withDirty(setOffsetX)} editable={isAdmin} keyboardType="numbers-and-punctuation" />
                    </View>
                    <View style={styles.offsetField}>
                      <Field label={t('apparence.addressOffsetY')} value={offsetY} onChangeText={withDirty(setOffsetY)} editable={isAdmin} keyboardType="numbers-and-punctuation" />
                    </View>
                  </View>
                  <Text style={styles.hint}>{t('apparence.addressOffsetHint')}</Text>
                  {offsetError ? <Text style={styles.error}>{offsetError}</Text> : null}
                  {Platform.OS === 'web' ? (
                    <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
                      <Button
                        title={t('apparence.addressTest')}
                        variant="secondary"
                        icon="printer"
                        onPress={async () => {
                          setTestError(null);
                          const dx = parseOffset(offsetX);
                          const dy = parseOffset(offsetY);
                          if (dx == null || dy == null) {
                            setOffsetError(t('apparence.addressOffsetError'));
                            return;
                          }
                          const raw = t('apparence.addressTestPdf', { returnObjects: true }) as WindowTestTexts;
                          const texts = { ...raw, offsets: t('apparence.addressTestPdf.offsets', { x: dx, y: dy }) };
                          const { error } = await downloadWindowTestPage(dx, dy, texts, t('apparence.addressTestFile'));
                          if (error) setTestError(error);
                        }}
                      />
                      <Text style={styles.hint}>{t('apparence.addressTestHint')}</Text>
                      {testError ? <Text style={styles.error}>{testError}</Text> : null}
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={styles.hint}>{t('apparence.addressLeftHint')}</Text>
              )}
            </SettingsSection>
          ) : null}

          {hasCustomization !== false ? (
            <SettingsSection icon="align-center" title={t('apparence.sections.footer.title')} hint={t('apparence.sections.footer.hint')}>
              <Field
                label={t('apparence.footerLabel')}
                value={footerText}
                onChangeText={withDirty(setFooterText)}
                editable={isAdmin}
                placeholder={t('apparence.footerPlaceholder')}
              />
            </SettingsSection>
          ) : null}

          <RelatedSettings items={['documents', 'company', 'emails']} />
        </Container>
      </ScrollView>
      {saveError ? <Text style={[styles.error, { textAlign: 'center', padding: spacing.sm }]}>{saveError}</Text> : null}
      {isAdmin ? <UnsavedChangesBar visible={dirty} saving={saving} onSave={save} onDiscard={() => discard(load)} /> : null}
      <UnsavedChangesModal visible={leaveModalVisible} saving={saving} onSave={onLeaveSave} onDiscard={onLeaveDiscard} onCancel={onLeaveCancel} />
    </AppScreen>
  );
}

// "-2,5" or "3" → a number of millimetres, null when out of range.
function parseOffset(raw: string): number | null {
  const n = Number(String(raw).trim().replace(',', '.').replace('−', '-') || '0');
  return Number.isFinite(n) && n >= -30 && n <= 30 ? Math.round(n * 10) / 10 : null;
}

const styles = StyleSheet.create({
  modelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  modelCard: { flexBasis: 150, flexGrow: 1, maxWidth: 260, padding: spacing.sm, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, alignItems: 'center', gap: spacing.sm },
  modelText: { alignSelf: 'stretch', gap: 2 },
  modelNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modelName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  modelHint: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 18 },
  modelNote: { marginTop: spacing.md, fontSize: fontSize.sm, color: colors.textMuted },
  accentLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: 2 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: colors.text },
  errorText: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  offsetRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, flexWrap: 'wrap' },
  offsetField: { flex: 1, minWidth: 160 },
  error: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.xs },
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
    marginTop: spacing.xs,
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
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  introText: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
