import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../../lib/api/storage';
import { assetFileInfo } from '../../../../lib/imageAsset';
import { Button, Card, Container, Field, LoadingScreen, PageHeader, AppScreen, Switch } from '../../../../components/ui';
import { UnsavedChangesBar } from '../../../../components/UnsavedChangesBar';
import { UnsavedChangesModal } from '../../../../components/UnsavedChangesModal';
import { useUnsavedChanges } from '../../../../lib/useUnsavedChanges';
import { PROJECT_MODULES, PROJECT_MODULE_PLAN_GATED, isModuleEnabled, type ModuleKey } from '../../../../lib/modules';
import { useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import { confirm } from '../../../../lib/confirm';
import type { OrganizationMember, Plan } from '../../../../lib/types';

const STATUSES: { key: string; labelKey: 'active' | 'completed' | 'archived' }[] = [
  { key: 'active', labelKey: 'active' },
  { key: 'completed', labelKey: 'completed' },
  { key: 'archived', labelKey: 'archived' },
];

export default function ChantierSettingsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('active');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [accessUserIds, setAccessUserIds] = useState<Set<string>>(new Set());
  const [restricted, setRestricted] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [autoDailyReport, setAutoDailyReport] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { dirty, saving, markDirty, save, discard, confirmBeforeBack, leaveModalVisible, onLeaveSave, onLeaveDiscard, onLeaveCancel } =
    useUnsavedChanges(handleSave);

  function withDirty<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      markDirty();
    };
  }

  const load = useCallback(async () => {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single();
    if (project) {
      setName(project.name);
      setClientName(project.client_name ?? '');
      setAddress(project.address ?? '');
      setStatus(project.status);
      setCoverPhotoUrl(project.cover_photo_url ? await getSignedUrl(project.cover_photo_url) : null);
      setEnabledModules(project.enabled_modules ?? []);
      setAutoDailyReport(!!project.auto_daily_report_enabled);
      const [{ data: memberRows }, { data: accessRows }, { data: org }] = await Promise.all([
        supabase.from('organization_members').select('*').eq('organization_id', project.organization_id).order('created_at'),
        supabase.from('project_members').select('user_id').eq('project_id', id),
        supabase.from('organizations').select('plan_id').eq('id', project.organization_id).single(),
      ]);
      setMembers(memberRows ?? []);
      setRestricted((accessRows ?? []).length > 0);
      setAccessUserIds(new Set((accessRows ?? []).map((r) => r.user_id)));
      if (org) {
        const { data: planRow } = await supabase.from('plans').select('*').eq('id', org.plan_id).single();
        setPlan(planRow ?? null);
      }
    }
    setLoaded(true);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Everything below is staged in local state only — the single Save
  // action (via UnsavedChangesBar) is what actually writes to Supabase, so
  // toggling a module or restricting access no longer has a different
  // save behavior than editing the name field.
  async function handleSave() {
    if (!id || !name.trim()) return false;
    await supabase
      .from('projects')
      .update({
        name: name.trim(),
        client_name: clientName.trim() || null,
        address: address.trim() || null,
        status,
        enabled_modules: enabledModules,
        auto_daily_report_enabled: autoDailyReport,
      })
      .eq('id', id);

    // Access list is small (one org's team, per project) — replacing it
    // wholesale on save is simpler and just as correct as diffing.
    await supabase.from('project_members').delete().eq('project_id', id);
    if (restricted && accessUserIds.size > 0) {
      await supabase.from('project_members').insert(Array.from(accessUserIds).map((uid) => ({ project_id: id, user_id: uid })));
    }
  }

  async function pickCoverPhoto() {
    if (!id) return;
    const { data: project } = await supabase.from('projects').select('organization_id').eq('id', id).single();
    if (!project) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [16, 9] });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setUploadingCover(true);
    const { ext, contentType } = assetFileInfo(asset);
    const subPath = `projects/${id}-${Date.now()}.${ext}`;
    const { path } = await uploadToOrgBucket(project.organization_id, subPath, asset.uri, contentType);
    if (path) {
      await supabase.from('projects').update({ cover_photo_url: path }).eq('id', id);
      setCoverPhotoUrl(await getSignedUrl(path));
    }
    setUploadingCover(false);
  }

  function isPlanGated(key: ModuleKey): boolean {
    const field = PROJECT_MODULE_PLAN_GATED[key];
    if (!field || !plan) return false;
    return !plan[field];
  }

  function toggleModule(key: ModuleKey) {
    if (!isAdmin || isPlanGated(key)) return;
    setEnabledModules((prev) => (isModuleEnabled(prev, key) ? prev.filter((m) => m !== key) : [...prev, key]));
    markDirty();
  }

  function hasAccess(userId: string): boolean {
    return restricted ? accessUserIds.has(userId) : true;
  }

  function toggleMemberAccess(member: OrganizationMember) {
    if (!isAdmin || member.role === 'owner' || member.role === 'admin') return;
    if (!restricted) {
      // First restriction on an open chantier: materialize explicit access
      // for everyone except the member being excluded right now.
      setRestricted(true);
      setAccessUserIds(new Set(members.filter((m) => m.user_id !== member.user_id).map((m) => m.user_id)));
    } else if (accessUserIds.has(member.user_id)) {
      setAccessUserIds((prev) => {
        const next = new Set(prev);
        next.delete(member.user_id);
        return next;
      });
    } else {
      setAccessUserIds((prev) => new Set(prev).add(member.user_id));
    }
    markDirty();
  }

  function openToEveryone() {
    if (!isAdmin) return;
    setRestricted(false);
    setAccessUserIds(new Set());
    markDirty();
  }

  function toggleAutoDailyReport() {
    if (!isAdmin) return;
    setAutoDailyReport((v) => !v);
    markDirty();
  }

  async function handleDeleteProject() {
    if (!isAdmin || !id) return;
    const ok = await confirm(t('chantierSettings.deleteConfirmTitle', { name }), t('chantierSettings.deleteConfirmMessage'));
    if (!ok) return;
    setDeleting(true);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    setDeleting(false);
    if (!error) router.replace('/(app)/chantiers');
  }

  if (!loaded) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('chantierSettings.title')} backTo={`/(app)/chantiers/${id}`} onBeforeBack={confirmBeforeBack} />

          <View style={styles.coverRow}>
            <Pressable onPress={pickCoverPhoto} style={styles.coverThumbWrap}>
              {coverPhotoUrl ? (
                <Image source={{ uri: coverPhotoUrl }} style={styles.coverThumb} />
              ) : (
                <View style={[styles.coverThumb, styles.coverPlaceholder]}>
                  <Feather name="image" size={18} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.coverEditBadge}>
                <Feather name="camera" size={11} color="#fff" />
              </View>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.coverTitle}>{t('chantierSettings.coverTitle')}</Text>
              <Text style={styles.coverHint}>
                {uploadingCover
                  ? t('chantierSettings.uploadingCover')
                  : coverPhotoUrl
                    ? t('chantierSettings.changeCoverHint')
                    : t('chantierSettings.addCoverHint')}
              </Text>
            </View>
          </View>

          <Field label={t('chantierSettings.nameLabel')} value={name} onChangeText={withDirty(setName)} />
          <Field
            label={t('chantierSettings.clientLabel')}
            value={clientName}
            onChangeText={withDirty(setClientName)}
            placeholder={t('chantierSettings.clientPlaceholder')}
          />
          <Field
            label={t('chantierSettings.addressLabel')}
            value={address}
            onChangeText={withDirty(setAddress)}
            placeholder={t('chantierSettings.addressPlaceholder')}
          />

          <Text style={styles.fieldLabel}>{t('chantierSettings.statusLabel')}</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <Button
                key={s.key}
                title={t(`common.projectStatus.${s.labelKey}`)}
                variant={status === s.key ? 'primary' : 'secondary'}
                onPress={() => withDirty(setStatus)(s.key)}
                style={{ flex: 1 }}
              />
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xxl, marginBottom: spacing.sm }]}>{t('chantierSettings.toolsTitle')}</Text>
          <Text style={styles.accessHint}>{t('chantierSettings.toolsHint')}</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {PROJECT_MODULES.map((m, i) => {
              const gated = isPlanGated(m.key);
              return (
                <View key={m.key} style={[styles.memberRow, i < PROJECT_MODULES.length - 1 && styles.memberRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{t(`modules.${m.key}.label` as any)}</Text>
                    <Text style={styles.memberRole}>{t(`modules.${m.key}.description` as any)}</Text>
                    {gated ? <Text style={styles.openLink}>{t('chantierSettings.modulePlanGatedHint')}</Text> : null}
                  </View>
                  <Switch value={!gated && isModuleEnabled(enabledModules, m.key)} onChange={() => toggleModule(m.key)} disabled={!isAdmin || gated} />
                </View>
              );
            })}
          </Card>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xxl, marginBottom: spacing.sm }]}>{t('chantierSettings.autoReportTitle')}</Text>
          <Text style={styles.accessHint}>{t('chantierSettings.autoReportHint')}</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={styles.memberRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{t('chantierSettings.autoReportLabel')}</Text>
                <Text style={styles.memberRole}>{t('chantierSettings.autoReportDescription')}</Text>
              </View>
              <Switch value={autoDailyReport} onChange={toggleAutoDailyReport} disabled={!isAdmin} />
            </View>
          </Card>

          <View style={styles.accessHeader}>
            <Text style={styles.sectionTitle}>{t('chantierSettings.accessTitle')}</Text>
            {restricted ? (
              <Text style={styles.openLink} onPress={openToEveryone}>
                {t('chantierSettings.openToEveryone')}
              </Text>
            ) : null}
          </View>
          <Text style={styles.accessHint}>
            {restricted ? t('chantierSettings.accessHintRestricted') : t('chantierSettings.accessHintOpen')}
          </Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {members.map((m, i) => {
              const alwaysOn = m.role === 'owner' || m.role === 'admin';
              return (
                <View key={m.id} style={[styles.memberRow, i < members.length - 1 && styles.memberRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.full_name || t('common.member')}</Text>
                    <Text style={styles.memberRole}>
                      {alwaysOn
                        ? m.role === 'owner'
                          ? t('chantierSettings.ownerAlwaysAccess')
                          : t('chantierSettings.adminAlwaysAccess')
                        : t('common.member')}
                    </Text>
                  </View>
                  <Switch value={alwaysOn || hasAccess(m.user_id)} onChange={() => toggleMemberAccess(m)} disabled={!isAdmin || alwaysOn} />
                </View>
              );
            })}
          </Card>

          {isAdmin ? (
            <>
              <View style={styles.dangerHeader}>
                <Feather name="alert-triangle" size={15} color={colors.danger} />
                <Text style={styles.dangerTitle}>{t('chantierSettings.dangerZoneTitle')}</Text>
              </View>
              <Text style={styles.accessHint}>{t('chantierSettings.dangerZoneHint')}</Text>
              <Button
                title={t('chantierSettings.deleteButton')}
                variant="danger"
                icon="trash-2"
                onPress={handleDeleteProject}
                loading={deleting}
              />
            </>
          ) : null}
        </Container>
      </ScrollView>
      {isAdmin ? <UnsavedChangesBar visible={dirty} saving={saving} onSave={save} onDiscard={() => discard(load)} /> : null}
      <UnsavedChangesModal visible={leaveModalVisible} saving={saving} onSave={onLeaveSave} onDiscard={onLeaveDiscard} onCancel={onLeaveCancel} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  coverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  coverThumbWrap: {
    position: 'relative',
  },
  coverThumb: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  coverEditBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  coverTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  coverHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  accessHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  openLink: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  accessHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  memberRole: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  dangerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.danger,
  },
});
