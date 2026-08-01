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
import { isValidSwissIban } from '../../../lib/iban';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { BRAND_COLOR_PRESETS, HEX_COLOR_RE, LOGO_PLACEMENTS } from '../../../components/PdfTemplatePicker';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { TRADES } from '../../../lib/trades';

export default function EntrepriseScreen() {
  const router = useRouter();
  const { organization, role, refreshOrganization } = useAuth();
  const [name, setName] = useState(organization?.name ?? '');
  const [trade, setTrade] = useState(organization?.trade ?? null);
  const [address, setAddress] = useState(organization?.address ?? '');
  const [ideNumber, setIdeNumber] = useState(organization?.ide_number ?? '');
  const [phone, setPhone] = useState(organization?.phone ?? '');
  const [email, setEmail] = useState(organization?.email ?? '');
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [iban, setIban] = useState(organization?.iban ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState(organization?.brand_color ?? '#1F3D3A');
  const [logoPlacement, setLogoPlacement] = useState<'left' | 'center' | 'right'>(organization?.logo_placement ?? 'right');
  const [footerText, setFooterText] = useState(organization?.footer_text ?? '');
  const [saving, setSaving] = useState(false);
  const [hasCustomization, setHasCustomization] = useState<boolean | null>(null);
  const [analyzingWebsite, setAnalyzingWebsite] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setName(organization.name);
    setTrade(organization.trade ?? null);
    setAddress(organization.address ?? '');
    setIdeNumber(organization.ide_number ?? '');
    setPhone(organization.phone ?? '');
    setEmail(organization.email ?? '');
    setWebsite(organization.website ?? '');
    setIban(organization.iban ?? '');
    setBrandColor(organization.brand_color ?? '#1F3D3A');
    setLogoPlacement(organization.logo_placement ?? 'right');
    setFooterText(organization.footer_text ?? '');
    if (organization.logo_url) setLogoUrl(await getSignedUrl(organization.logo_url));
    if (organization.signature_url) setSignatureUrl(await getSignedUrl(organization.signature_url));
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
    const ibanTrimmed = iban.trim();
    const validIban = !ibanTrimmed || isValidSwissIban(ibanTrimmed);
    await supabase
      .from('organizations')
      .update({
        name: name.trim(),
        trade,
        address: address.trim() || null,
        ide_number: ideNumber.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        iban: validIban ? ibanTrimmed.replace(/\s+/g, '').toUpperCase() || null : organization.iban,
        brand_color: validHex ? brandColor.trim() : organization.brand_color,
        logo_placement: logoPlacement,
        footer_text: footerText.trim() || null,
      })
      .eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
  }

  async function pickBranding(kind: 'logo' | 'signature') {
    if (!organization || !isAdmin) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const raw = assetFileInfo(asset);
    const { uri, ext, contentType } = await normalizeImageOrientation(asset.uri, raw.contentType);
    const subPath = `branding/${kind}-${Date.now()}.${ext}`;
    const { path } = await uploadToOrgBucket(organization.id, subPath, uri, contentType);
    if (path) {
      const column = kind === 'logo' ? 'logo_url' : 'signature_url';
      await supabase.from('organizations').update({ [column]: path }).eq('id', organization.id);
      await refreshOrganization();
      const url = await getSignedUrl(path);
      if (kind === 'logo') {
        setLogoUrl(url);
        const suggested = await suggestBrandColorFromImage(uri);
        if (suggested) setBrandColor(suggested);
      } else {
        setSignatureUrl(url);
      }
    }
  }

  async function analyzeWebsite() {
    if (!website.trim() || analyzingWebsite) return;
    setAnalyzingWebsite(true);
    const found = await suggestBrandColorsFromWebsite(website.trim());
    setAnalyzingWebsite(false);
    if (found.length) setBrandColor(found[0]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Profil entreprise" backTo="/(app)/compte" />

          <Field label="Nom" value={name} onChangeText={setName} editable={isAdmin} />

          <Text style={styles.fieldLabel}>Métier</Text>
          <View style={styles.chips}>
            {TRADES.map((t) => (
              <Pressable
                key={t}
                onPress={() => isAdmin && setTrade(t)}
                disabled={!isAdmin}
                style={[styles.chip, trade === t && styles.chipActive, !isAdmin && styles.chipDisabled]}
              >
                <Text style={[styles.chipText, trade === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
          {!isAdmin ? (
            <Text style={styles.readOnlyHint}>
              Seul un propriétaire ou administrateur peut modifier le profil de l'entreprise.
            </Text>
          ) : null}

          <Field label="Adresse" value={address} onChangeText={setAddress} editable={isAdmin} />
          <Field label="Numéro IDE" value={ideNumber} onChangeText={setIdeNumber} editable={isAdmin} />
          <View style={styles.row2}>
            <View style={styles.row2Item}>
              <Field
                label="Téléphone"
                value={phone}
                onChangeText={setPhone}
                editable={isAdmin}
                keyboardType="phone-pad"
                placeholder="+41 79 000 00 00"
              />
            </View>
            <View style={styles.row2Item}>
              <Field
                label="E-mail entreprise"
                value={email}
                onChangeText={setEmail}
                editable={isAdmin}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="contact@entreprise.ch"
              />
            </View>
          </View>
          <Field
            label="Site web"
            value={website}
            onChangeText={setWebsite}
            editable={isAdmin}
            autoCapitalize="none"
            placeholder="www.entreprise.ch"
          />
          <Field
            label="IBAN (pour la QR-facture)"
            value={iban}
            onChangeText={setIban}
            editable={isAdmin}
            autoCapitalize="characters"
            placeholder="CH00 0000 0000 0000 0000 0"
          />
          {iban.trim() && !isValidSwissIban(iban.trim()) ? (
            <Text style={styles.errorHint}>IBAN suisse ou liechtensteinois invalide (format CHxx.../LIxx...).</Text>
          ) : (
            <Text style={styles.hint}>
              Renseigné, un bulletin de paiement QR suisse conforme est ajouté automatiquement à vos devis.
            </Text>
          )}
          {isAdmin ? (
            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
          ) : null}

          <Text style={styles.sectionTitle}>Identité visuelle</Text>
          <View style={styles.brandingRow}>
            <View style={styles.brandingItem}>
              <Text style={styles.brandingLabel}>Logo</Text>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
              ) : (
                <View style={[styles.logoPreview, styles.brandPlaceholder]}>
                  <Feather name="image" size={20} color={colors.textMuted} />
                </View>
              )}
              {isAdmin ? (
                <Pressable style={styles.brandingButton} onPress={() => pickBranding('logo')}>
                  <Text style={styles.brandingButtonText}>Choisir un logo</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.brandingItem}>
              <Text style={styles.brandingLabel}>Signature</Text>
              {signatureUrl ? (
                <Image source={{ uri: signatureUrl }} style={styles.signaturePreview} />
              ) : (
                <View style={[styles.signaturePreview, styles.brandPlaceholder]}>
                  <Feather name="edit-3" size={20} color={colors.textMuted} />
                </View>
              )}
              {isAdmin ? (
                <Pressable style={styles.brandingButton} onPress={() => pickBranding('signature')}>
                  <Text style={styles.brandingButtonText}>Choisir une signature</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <Text style={styles.hint}>Utilisés automatiquement sur vos rapports et devis PDF.</Text>

          {hasCustomization === false ? (
            <Card style={styles.upsell}>
              <Feather name="lock" size={20} color={colors.accent} />
              <Text style={styles.upsellTitle}>Couleur de marque, placement du logo, pied de page</Text>
              <Text style={styles.hint}>Disponible à partir du plan Indépendant (dès CHF 9/mois).</Text>
              <Button
                title="Voir les plans"
                variant="secondary"
                icon="arrow-right"
                onPress={() => router.push('/(app)/compte')}
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Couleur de marque</Text>
              <Text style={styles.hint}>Suggérée automatiquement quand vous changez de logo (depuis le site web) — modifiable ci-dessous.</Text>
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
                <View style={[styles.hexPreview, { backgroundColor: HEX_COLOR_RE.test(brandColor) ? brandColor : colors.border }]} />
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

              <Text style={styles.fieldLabel}>Placement du logo sur vos PDF</Text>
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
  chipDisabled: {
    opacity: 0.6,
  },
  readOnlyHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 160,
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
  brandingLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
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
  signaturePreview: {
    width: 120,
    height: 60,
    borderRadius: radius.sm,
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
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
});
