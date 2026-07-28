import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { Button, Container, Field, Screen } from '../../../components/ui';
import { SettingsHeader } from '../../../components/SettingsHeader';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

export default function EntrepriseScreen() {
  const { organization, role, refreshOrganization } = useAuth();
  const [name, setName] = useState(organization?.name ?? '');
  const [address, setAddress] = useState(organization?.address ?? '');
  const [ideNumber, setIdeNumber] = useState(organization?.ide_number ?? '');
  const [phone, setPhone] = useState(organization?.phone ?? '');
  const [email, setEmail] = useState(organization?.email ?? '');
  const [website, setWebsite] = useState(organization?.website ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isAdmin = role === 'owner' || role === 'admin';

  const load = useCallback(async () => {
    if (!organization) return;
    setName(organization.name);
    setAddress(organization.address ?? '');
    setIdeNumber(organization.ide_number ?? '');
    setPhone(organization.phone ?? '');
    setEmail(organization.email ?? '');
    setWebsite(organization.website ?? '');
    if (organization.logo_url) setLogoUrl(await getSignedUrl(organization.logo_url));
    if (organization.signature_url) setSignatureUrl(await getSignedUrl(organization.signature_url));
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!organization) return;
    setSaving(true);
    await supabase
      .from('organizations')
      .update({
        name: name.trim(),
        address: address.trim() || null,
        ide_number: ideNumber.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
      })
      .eq('id', organization.id);
    setSaving(false);
    refreshOrganization();
  }

  async function pickBranding(kind: 'logo' | 'signature') {
    if (!organization) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const ext = (asset.uri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const subPath = `branding/${kind}-${Date.now()}.${ext}`;
    const { path } = await uploadToOrgBucket(organization.id, subPath, asset.uri, contentType);
    if (path) {
      const column = kind === 'logo' ? 'logo_url' : 'signature_url';
      await supabase.from('organizations').update({ [column]: path }).eq('id', organization.id);
      await refreshOrganization();
      const url = await getSignedUrl(path);
      if (kind === 'logo') setLogoUrl(url);
      else setSignatureUrl(url);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <SettingsHeader title="Profil entreprise" />

          <Field label="Nom" value={name} onChangeText={setName} editable={isAdmin} />
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
              <Pressable style={styles.brandingButton} onPress={() => pickBranding('logo')}>
                <Text style={styles.brandingButtonText}>Choisir un logo</Text>
              </Pressable>
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
              <Pressable style={styles.brandingButton} onPress={() => pickBranding('signature')}>
                <Text style={styles.brandingButtonText}>Choisir une signature</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.hint}>Utilisés automatiquement sur vos rapports et devis PDF.</Text>
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
});
