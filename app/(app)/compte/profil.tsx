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
import { UnsavedChangesBar } from '../../../components/UnsavedChangesBar';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { useUnsavedChanges } from '../../../lib/useUnsavedChanges';
import { Button, Card, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { AVAILABLE_LOCALES, useTranslation, type AppLocale } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

const LOCALE_LABEL_KEY: Record<AppLocale, 'languageFrench' | 'languageGerman' | 'languageItalian'> = {
  fr: 'languageFrench',
  de: 'languageGerman',
  it: 'languageItalian',
};

// Personal, not company: name/photo/language belong to the person, not the
// org — kept on organization_members (the per user+org row) like full_name
// already was, rather than introducing a separate global profile table.
export default function ProfilScreen() {
  const { t, i18n } = useTranslation();
  // i18n.language updates (and re-renders this component) the moment
  // changeLocale() below calls i18next.changeLanguage() — no local state
  // to keep in sync by hand.
  const locale = i18n.language as AppLocale;
  const { user, organization, refreshOrganization, changeLocale, signIn, updateEmail, updatePassword } = useAuth();
  const [changingLocale, setChangingLocale] = useState(false);
  const [fullName, setFullName] = useState('');
  const [securityMode, setSecurityMode] = useState<'none' | 'email' | 'password'>('none');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'photo'>('draw');
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  const { dirty, saving, markDirty, save, discard, confirmBeforeBack, leaveModalVisible, onLeaveSave, onLeaveDiscard, onLeaveCancel } =
    useUnsavedChanges(saveName);

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
    if (!organization || !user || !fullName.trim()) return false;
    await supabase
      .from('organization_members')
      .update({ full_name: fullName.trim() })
      .eq('organization_id', organization.id)
      .eq('user_id', user.id);
    refreshOrganization();
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

  async function handleChangeLocale(next: AppLocale) {
    if (next === locale || changingLocale) return;
    setChangingLocale(true);
    const { error } = await changeLocale(next);
    setChangingLocale(false);
    if (!error) showSavedCheckmark();
  }

  function openSecurityMode(mode: 'email' | 'password') {
    setSecurityMode(mode);
    setCurrentPassword('');
    setNewEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setSecurityError(null);
    setSecuritySuccess(null);
  }

  function closeSecurityMode() {
    setSecurityMode('none');
    setSecurityError(null);
  }

  // Supabase's JS SDK has no lightweight "verify this password without
  // changing anything" call — re-running signInWithPassword against the
  // account's own current email is the standard workaround, and since it's
  // the same account it just refreshes the existing session rather than
  // starting a new one. Guards both email and password changes so a
  // hijacked open session (shared computer, unlocked phone) can't silently
  // take over the account without knowing the current password.
  async function verifyCurrentPassword(): Promise<boolean> {
    if (!user?.email) return false;
    const { error } = await signIn(user.email, currentPassword);
    if (error) {
      setSecurityError(t('profil.wrongCurrentPassword'));
      return false;
    }
    return true;
  }

  async function handleChangeEmail() {
    setSecurityError(null);
    const trimmed = newEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setSecurityError(t('profil.invalidEmail'));
      return;
    }
    if (user?.email && trimmed.toLowerCase() === user.email.toLowerCase()) {
      setSecurityError(t('profil.sameEmail'));
      return;
    }
    setSecuritySaving(true);
    const verified = await verifyCurrentPassword();
    if (!verified) {
      setSecuritySaving(false);
      return;
    }
    const { error } = await updateEmail(trimmed);
    setSecuritySaving(false);
    if (error) {
      setSecurityError(error);
      return;
    }
    setSecuritySuccess(t('profil.emailChangeSuccess', { email: trimmed }));
    setSecurityMode('none');
  }

  async function handleChangePassword() {
    setSecurityError(null);
    if (newPassword.length < 6) {
      setSecurityError(t('profil.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError(t('profil.passwordMismatch'));
      return;
    }
    setSecuritySaving(true);
    const verified = await verifyCurrentPassword();
    if (!verified) {
      setSecuritySaving(false);
      return;
    }
    const { error } = await updatePassword(newPassword);
    setSecuritySaving(false);
    if (error) {
      setSecurityError(error);
      return;
    }
    setSecurityMode('none');
    showSavedCheckmark();
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
          <PageHeader title={t('profil.title')} backTo="/(app)/compte" onBeforeBack={confirmBeforeBack} />

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
            <Text style={styles.avatarHint}>{uploadingAvatar ? t('profil.uploading') : t('profil.changePhoto')}</Text>
          </Card>

          <Field
            label={t('profil.displayName')}
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              markDirty();
            }}
            placeholder={t('profil.displayNamePlaceholder')}
          />

          <Text style={styles.sectionTitle}>{t('profil.securityTitle')}</Text>
          <Text style={styles.sectionHint}>{t('profil.securityHint')}</Text>
          <Card style={styles.securityCard}>
            {securitySuccess ? (
              <View style={styles.securityBanner}>
                <Feather name="mail" size={16} color={colors.primary} />
                <Text style={styles.securityBannerText}>{securitySuccess}</Text>
              </View>
            ) : null}

            <View style={styles.securityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.securityRowLabel}>{t('profil.currentEmailLabel')}</Text>
                <Text style={styles.securityRowValue}>{user?.email}</Text>
              </View>
              {securityMode !== 'email' ? (
                <Pressable onPress={() => openSecurityMode('email')} style={styles.securityLinkBtn}>
                  <Text style={styles.securityLinkBtnText}>{t('profil.changeEmailButton')}</Text>
                </Pressable>
              ) : null}
            </View>

            {securityMode === 'email' ? (
              <View style={styles.securityForm}>
                <Field
                  label={t('profil.newEmailLabel')}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="nouveau@email.ch"
                />
                <Field
                  label={t('profil.currentPasswordLabel')}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder={t('profil.currentPasswordPlaceholder')}
                />
                {securityError ? <Text style={styles.securityError}>{securityError}</Text> : null}
                <View style={styles.securityFormActions}>
                  <Button title={t('profil.cancelButton')} variant="secondary" onPress={closeSecurityMode} style={{ flex: 1 }} disabled={securitySaving} />
                  <Button title={t('profil.confirmEmailButton')} onPress={handleChangeEmail} loading={securitySaving} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.securityDivider} />
                <View style={styles.securityRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.securityRowLabel}>{t('profil.passwordLabel')}</Text>
                    <Text style={styles.securityRowValue}>••••••••</Text>
                  </View>
                  {securityMode !== 'password' ? (
                    <Pressable onPress={() => openSecurityMode('password')} style={styles.securityLinkBtn}>
                      <Text style={styles.securityLinkBtnText}>{t('profil.changePasswordButton')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            )}

            {securityMode === 'password' ? (
              <View style={styles.securityForm}>
                <Field
                  label={t('profil.currentPasswordLabel')}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder={t('profil.currentPasswordPlaceholder')}
                />
                <Field
                  label={t('profil.newPasswordLabel')}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder={t('profil.newPasswordPlaceholder')}
                />
                <Field
                  label={t('profil.confirmPasswordLabel')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder={t('profil.newPasswordPlaceholder')}
                />
                {securityError ? <Text style={styles.securityError}>{securityError}</Text> : null}
                <View style={styles.securityFormActions}>
                  <Button title={t('profil.cancelButton')} variant="secondary" onPress={closeSecurityMode} style={{ flex: 1 }} disabled={securitySaving} />
                  <Button title={t('profil.confirmPasswordButton')} onPress={handleChangePassword} loading={securitySaving} style={{ flex: 1 }} />
                </View>
              </View>
            ) : null}
          </Card>

          <Text style={styles.sectionTitle}>{t('profil.languageTitle')}</Text>
          <Text style={styles.sectionHint}>{t('profil.languageHint')}</Text>
          <View style={styles.toggleRow}>
            {AVAILABLE_LOCALES.map((loc) => (
              <Text
                key={loc}
                onPress={() => handleChangeLocale(loc)}
                style={[styles.toggleOption, locale === loc && styles.toggleOptionActive]}
              >
                {t(`profil.${LOCALE_LABEL_KEY[loc]}`)}
              </Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('profil.signatureTitle')}</Text>
          <Text style={styles.sectionHint}>{t('profil.signatureHint')}</Text>

          <View style={styles.toggleRow}>
            <Text onPress={() => setSignatureMode('draw')} style={[styles.toggleOption, signatureMode === 'draw' && styles.toggleOptionActive]}>
              {t('profil.draw')}
            </Text>
            <Text onPress={() => setSignatureMode('photo')} style={[styles.toggleOption, signatureMode === 'photo' && styles.toggleOptionActive]}>
              {t('profil.importPhoto')}
            </Text>
          </View>

          {signatureMode === 'draw' ? (
            <Card>
              <SignaturePad onChange={setDrawnSignature} />
              <Button
                title={uploadingSignature ? t('common.saving') : t('profil.saveSignature')}
                icon="check"
                onPress={saveDrawnSignature}
                loading={uploadingSignature}
                disabled={!drawnSignature}
                style={{ marginTop: spacing.md }}
              />
              {signatureUrl ? (
                <View style={{ marginTop: spacing.lg }}>
                  <Text style={styles.avatarHint}>{t('profil.currentSignature')}</Text>
                  <Image source={{ uri: signatureUrl }} style={styles.signaturePreview} resizeMode="contain" />
                </View>
              ) : null}
            </Card>
          ) : (
            <Card style={styles.signatureCard}>
              <Text style={styles.sectionHint}>{t('profil.signaturePhotoHint')}</Text>
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
                {uploadingSignature ? t('profil.uploading') : signatureUrl ? t('profil.changeSignature') : t('profil.addSignature')}
              </Text>
            </Card>
          )}
        </Container>
      </ScrollView>
      <UnsavedChangesBar visible={dirty} saving={saving} onSave={save} onDiscard={() => discard(load)} />
      <UnsavedChangesModal visible={leaveModalVisible} saving={saving} onSave={onLeaveSave} onDiscard={onLeaveDiscard} onCancel={onLeaveCancel} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  securityCard: {
    gap: spacing.sm,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  securityBannerText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.primaryDark,
    lineHeight: 17,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  securityRowLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  securityRowValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  securityLinkBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  securityLinkBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
  },
  securityDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  securityForm: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  securityFormActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  securityError: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
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
