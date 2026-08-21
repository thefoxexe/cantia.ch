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
import { suggestBrandColorsFromWebsite } from '../../../lib/api/brandColors';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { BRAND_COLOR_PRESETS, HEX_COLOR_RE, LOGO_PLACEMENTS } from '../../../components/PdfTemplatePicker';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

export default function ApparenceScreen() {
  const router = useRouter();
  const { organization, role, refreshOrganization } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState(organization?.brand_color ?? '#1F3D3A');
  const [logoPlacement, setLogoPlacement] = useState<'left' | 'center' | 'right'>(organization?.logo_placement ?? 'right');
  const [footerText, setFooterText] = useState(organization?.footer_text ?? '');
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [saving, setSaving] = useState(false);
  const [hasCustomization, setHasCustomization] = useState<boolean | null>(null);
  const [analyzingWebsite, setAnalyzingWebsite] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';

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
    if (!organization) return;
    setSaving(true);
    const validHex = HEX_COLOR_RE.test(brandColor.trim());
    await supabase
      .from('organizations')
      .update({
        brand_color: validHex ? brandColor.trim() : organization.brand_color,
        logo_placement: logoPlacement,
        footer_text: footerText.trim() || null,
      })
      .eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
    showSavedCheckmark();
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
    const found = await suggestBrandColorsFromWebsite(website.trim());
    setAnalyzingWebsite(false);
    if (found.length) setBrandColor(found[0]);
  }

  const previewColor = HEX_COLOR_RE.test(brandColor.trim()) ? brandColor.trim() : colors.border;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Apparence" backTo="/(app)/compte" />

          <Text style={styles.hint}>
            Le logo et la couleur de marque habillent automatiquement vos devis et rapports PDF.
          </Text>

          <Card style={styles.previewCard}>
            <View style={[styles.previewBand, { backgroundColor: previewColor }]}>
              <Text style={styles.previewBandText}>DEVIS</Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={[styles.previewOrgName, { color: previewColor }]} numberOfLines={1}>
                {organization?.name || 'Votre entreprise'}
              </Text>
              <Text style={styles.previewTrade}>{(organization?.trade || 'Métier').toUpperCase()} · Aperçu</Text>
              <Text style={styles.previewTotal}>Total 1'234.50 CHF</Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Logo</Text>
          <View style={styles.brandingRow}>
            <View style={styles.brandingItem}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
              ) : (
                <View style={[styles.logoPreview, styles.brandPlaceholder]}>
                  <Feather name="image" size={20} color={colors.textMuted} />
                </View>
              )}
              {isAdmin ? (
                <Pressable style={styles.brandingButton} onPress={pickLogo}>
                  <Text style={styles.brandingButtonText}>Choisir un logo</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <Text style={styles.hint}>
            La signature (sur les devis et rapports) est personnelle à chaque membre — chacun ajoute la sienne dans
            l'onglet « Mon profil ».
          </Text>

          {hasCustomization === false ? (
            <Card style={styles.upsell}>
              <Feather name="lock" size={20} color={colors.accent} />
              <Text style={styles.upsellTitle}>Couleur de marque, placement du logo, pied de page</Text>
              <Text style={styles.hint}>Disponible à partir du plan Indépendant (dès CHF 9/mois).</Text>
              <Button
                title="Voir les plans"
                variant="secondary"
                icon="arrow-right"
                onPress={() => router.push('/(app)/compte/facturation')}
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Couleur de marque</Text>
              <Text style={styles.hint}>Suggérée automatiquement quand vous changez de logo — modifiable ci-dessous.</Text>
              {isAdmin && website.trim() ? (
                <Pressable onPress={analyzeWebsite} style={styles.analyzeLink} disabled={analyzingWebsite}>
                  <Feather name="globe" size={13} color={colors.primary} />
                  <Text style={styles.analyzeLinkText}>
                    {analyzingWebsite ? 'Analyse du site en cours…' : 'Analyser les couleurs de mon site web'}
                  </Text>
                </Pressable>
              ) : null}
              <View style={styles.colorRow}>
                {BRAND_COLOR_PRESETS.map((hex) => (
                  <Pressable
                    key={hex}
                    onPress={() => isAdmin && setBrandColor(hex)}
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
                    label="Couleur personnalisée (hex)"
                    value={brandColor}
                    onChangeText={setBrandColor}
                    editable={isAdmin}
                    autoCapitalize="none"
                    placeholder="#1F3D3A"
                  />
                </View>
              </View>
              {isAdmin && brandColor.trim() && !HEX_COLOR_RE.test(brandColor.trim()) ? (
                <Text style={styles.errorHint}>Format attendu : #RRGGBB</Text>
              ) : null}

              <Text style={styles.sectionTitle}>Placement du logo sur vos PDF</Text>
              <View style={styles.placementRow}>
                {LOGO_PLACEMENTS.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => isAdmin && setLogoPlacement(p.id)}
                    disabled={!isAdmin}
                    style={[styles.placementChip, logoPlacement === p.id && styles.chipActive, !isAdmin && styles.chipDisabled]}
                  >
                    <Feather name={p.icon} size={14} color={logoPlacement === p.id ? colors.primary : colors.textMuted} />
                    <Text style={[styles.chipText, logoPlacement === p.id && styles.chipTextActive]}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Pied de page</Text>
              <Field
                label="Pied de page personnalisé (PDF)"
                value={footerText}
                onChangeText={setFooterText}
                editable={isAdmin}
                placeholder="Ex : Rue Example 1, 1000 Lausanne — www.entreprise.ch"
              />
              <Text style={styles.hint}>Remplace le nom de l'entreprise en bas de page. Laissez vide pour garder le nom.</Text>
            </>
          )}

          {isAdmin ? (
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
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
  brandingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  brandingItem: {
    flexGrow: 1,
    flexBasis: 120,
    alignItems: 'center',
  },
  brandPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  brandingButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brandingButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  analyzeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  analyzeLinkText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
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
