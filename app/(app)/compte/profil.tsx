import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { assetFileInfo } from '../../../lib/imageAsset';
import { SignaturePad } from '../../../components/SignaturePad';
import { showSavedCheckmark } from '../../../components/SaveConfirmation';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// Personal, not company: name/photo/language belong to the person, not the
// org — kept on organization_members (the per user+org row) like full_name
// already was, rather than introducing a separate global profile table.
export default function ProfilScreen() {
  const { user, organization, refreshOrganization } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'photo'>('draw');
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  const load = useCallback(async () => {
    if (!organization || !user) return;
    const { data } = await supabase
      .from('organization_members')
      .select('full_name, avatar_url, signature_url')
      .eq('organization_id', organization.id)
      .eq('user_id', user.id)
      .maybeSingle();
    setFullName(data?.full_name ?? '');
    setAvatarPath(data?.avatar_url ?? null);
    setAvatarUrl(data?.avatar_url ? await getSignedUrl(data.avatar_url) : null);
    setSignatureUrl(data?.signature_url ? await getSignedUrl(data.signature_url) : null);
  }, [organization, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function saveName() {
    if (!organization || !user || !fullName.trim()) return;
    setSaving(true);
    await supabase
      .from('organization_members')
      .update({ full_name: fullName.trim() })
      .eq('organization_id', organization.id)
      .eq('user_id', user.id);
    setSaving(false);
    refreshOrganization();
    showSavedCheckmark();
  }

  async function pickAvatar() {
    if (!organization || !user) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setUploadingAvatar(true);
    const { ext, contentType } = assetFileInfo(asset);
    const subPath = `avatars/${user.id}-${Date.now()}.${ext}`;
    const { path } = await uploadToOrgBucket(organization.id, subPath, asset.uri, contentType);
    if (path) {
      await supabase
        .from('organization_members')
        .update({ avatar_url: path })
        .eq('organization_id', organization.id)
        .eq('user_id', user.id);
      setAvatarPath(path);
      setAvatarUrl(await getSignedUrl(path));
      showSavedCheckmark();
    }
    setUploadingAvatar(false);
  }

  async function pickSignature() {
    if (!organization || !user) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setUploadingSignature(true);
    const { ext, contentType } = assetFileInfo(asset);
    const subPath = `signatures/${user.id}-${Date.now()}.${ext}`;
    const { path } = await uploadToOrgBucket(organization.id, subPath, asset.uri, contentType);
    if (path) {
      await supabase
        .from('organization_members')
        .update({ signature_url: path })
        .eq('organization_id', organization.id)
        .eq('user_id', user.id);
      setSignatureUrl(await getSignedUrl(path));
      showSavedCheckmark();
    }
    setUploadingSignature(false);
  }

  async function saveDrawnSignature() {
    if (!organization || !user || !drawnSignature) return;
    setUploadingSignature(true);
    const subPath = `signatures/${user.id}-${Date.now()}.png`;
    // The canvas already hands back a `data:image/png;base64,...` URL —
    // fetch() resolves data URLs directly, same as it does the file:// URIs
    // the photo picker produces, so uploadToOrgBucket needs no changes.
    const { path } = await uploadToOrgBucket(organization.id, subPath, drawnSignature, 'image/png');
    if (path) {
      await supabase
        .from('organization_members')
        .update({ signature_url: path })
        .eq('organization_id', organization.id)
        .eq('user_id', user.id);
      setSignatureUrl(await getSignedUrl(path));
      setDrawnSignature(null);
      showSavedCheckmark();
    }
    setUploadingSignature(false);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Mon profil" backTo="/(app)/compte" />

          <Card style={styles.avatarCard}>
            <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Feather name="user" size={28} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Feather name="camera" size={12} color="#fff" />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>{uploadingAvatar ? 'Envoi en cours…' : 'Touchez pour changer votre photo'}</Text>
          </Card>

          <Field label="Nom affiché" value={fullName} onChangeText={setFullName} placeholder="Votre nom" />
          <Button title="Enregistrer" icon="check" onPress={saveName} loading={saving} style={{ marginTop: spacing.sm }} />

          <Text style={styles.sectionTitle}>Ma signature</Text>
          <Text style={styles.sectionHint}>
            Utilisée sur les devis que vous créez (à côté de l'emplacement pour la signature du client) et sur vos
            rapports de chantier.
          </Text>

          <View style={styles.toggleRow}>
            <Text onPress={() => setSignatureMode('draw')} style={[styles.toggleOption, signatureMode === 'draw' && styles.toggleOptionActive]}>
              Dessiner
            </Text>
            <Text onPress={() => setSignatureMode('photo')} style={[styles.toggleOption, signatureMode === 'photo' && styles.toggleOptionActive]}>
              Importer une photo
            </Text>
          </View>

          {signatureMode === 'draw' ? (
            <Card>
              <SignaturePad onChange={setDrawnSignature} />
              <Button
                title={uploadingSignature ? 'Enregistrement…' : 'Enregistrer cette signature'}
                icon="check"
                onPress={saveDrawnSignature}
                loading={uploadingSignature}
                disabled={!drawnSignature}
                style={{ marginTop: spacing.md }}
              />
              {signatureUrl ? (
                <View style={{ marginTop: spacing.lg }}>
                  <Text style={styles.avatarHint}>Signature actuelle :</Text>
                  <Image source={{ uri: signatureUrl }} style={styles.signaturePreview} resizeMode="contain" />
                </View>
              ) : null}
            </Card>
          ) : (
            <Card style={styles.signatureCard}>
              <Text style={styles.sectionHint}>
                Pour un rendu propre, prenez en photo ou scannez votre signature sur une feuille blanche, bien
                cadrée, sans ombre.
              </Text>
              <Pressable onPress={pickSignature} style={styles.signatureWrap}>
                {signatureUrl ? (
                  <Image source={{ uri: signatureUrl }} style={styles.signaturePreview} resizeMode="contain" />
                ) : (
                  <View style={[styles.signaturePreview, styles.avatarPlaceholder]}>
                    <Feather name="edit-3" size={22} color={colors.textMuted} />
                  </View>
                )}
              </Pressable>
              <Text style={styles.avatarHint}>
                {uploadingSignature ? 'Envoi en cours…' : signatureUrl ? 'Touchez pour changer votre signature' : 'Touchez pour ajouter votre signature'}
              </Text>
            </Card>
          )}
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
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  signatureCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleOption: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOptionActive: {
    color: colors.primary,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  signatureWrap: {
    width: '100%',
  },
  signaturePreview: {
    width: '100%',
    height: 90,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  avatarCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceAlt,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
