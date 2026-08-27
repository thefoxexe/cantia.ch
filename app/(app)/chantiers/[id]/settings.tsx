import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { getSignedUrl, uploadToOrgBucket } from '../../../../lib/api/storage';
import { assetFileInfo } from '../../../../lib/imageAsset';
import { Button, Card, Container, Field, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { PROJECT_MODULES, PROJECT_MODULE_PLAN_GATED, isModuleEnabled, type ModuleKey } from '../../../../lib/modules';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { OrganizationMember, Plan } from '../../../../lib/types';

const STATUSES: { key: string; label: string }[] = [
  { key: 'active', label: 'Actif' },
  { key: 'completed', label: 'Terminé' },
  { key: 'archived', label: 'Archivé' },
];

export default function ChantierSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single();
    if (project) {
      setName(project.name);
      setClientName(project.client_name ?? '');
      setAddress(project.address ?? '');
      setStatus(project.status);
      setCoverPhotoUrl(project.cover_photo_url ? await getSignedUrl(project.cover_photo_url) : null);
      setEnabledModules(project.enabled_modules ?? []);
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

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase
      .from('projects')
      .update({
        name: name.trim(),
        client_name: clientName.trim() || null,
        address: address.trim() || null,
        status,
      })
      .eq('id', id);
    setSaving(false);
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

  async function toggleModule(key: ModuleKey) {
    if (!isAdmin || isPlanGated(key)) return;
    const next = isModuleEnabled(enabledModules, key)
      ? enabledModules.filter((m) => m !== key)
      : [...enabledModules, key];
    setEnabledModules(next);
    await supabase.from('projects').update({ enabled_modules: next }).eq('id', id);
  }

  function hasAccess(userId: string): boolean {
    return restricted ? accessUserIds.has(userId) : true;
  }

  async function toggleMemberAccess(member: OrganizationMember) {
    if (!isAdmin || member.role === 'owner' || member.role === 'admin') return;

    if (!restricted) {
      // First restriction on an open chantier: materialize explicit access
      // for everyone except the member being excluded right now.
      const rows = members.filter((m) => m.user_id !== member.user_id).map((m) => ({ project_id: id, user_id: m.user_id }));
      if (rows.length) await supabase.from('project_members').insert(rows);
    } else if (accessUserIds.has(member.user_id)) {
      await supabase.from('project_members').delete().eq('project_id', id).eq('user_id', member.user_id);
    } else {
      await supabase.from('project_members').insert({ project_id: id, user_id: member.user_id });
    }
    load();
  }

  async function openToEveryone() {
    if (!isAdmin) return;
    await supabase.from('project_members').delete().eq('project_id', id);
    load();
  }

  if (!loaded) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Paramètres du chantier" backTo={`/(app)/chantiers/${id}`} />

          <Pressable onPress={pickCoverPhoto} style={styles.coverWrap}>
            {coverPhotoUrl ? (
              <Image source={{ uri: coverPhotoUrl }} style={styles.coverImage} />
            ) : (
              <View style={[styles.coverImage, styles.coverPlaceholder]}>
                <Feather name="image" size={22} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.coverEditBadge}>
              <Feather name="camera" size={12} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.coverHint}>
            {uploadingCover ? 'Envoi en cours…' : coverPhotoUrl ? 'Touchez pour changer la photo' : 'Touchez pour ajouter une photo — elle apparaît dans la liste des chantiers'}
          </Text>

          <Field label="Nom du chantier" value={name} onChangeText={setName} />
          <Field label="Client" value={clientName} onChangeText={setClientName} placeholder="Nom du client" />
          <Field label="Adresse" value={address} onChangeText={setAddress} placeholder="Adresse du chantier" />

          <Text style={styles.fieldLabel}>Statut</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <Button
                key={s.key}
                title={s.label}
                variant={status === s.key ? 'primary' : 'secondary'}
                onPress={() => setStatus(s.key)}
                style={{ flex: 1 }}
              />
            ))}
          </View>

          <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />

          <Text style={[styles.sectionTitle, { marginTop: spacing.xxl, marginBottom: spacing.sm }]}>Outils</Text>
          <Text style={styles.accessHint}>Choisissez les outils utiles à ce chantier. Fil d'actualité et Rapports restent toujours actifs.</Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {PROJECT_MODULES.map((m, i) => {
              const gated = isPlanGated(m.key);
              return (
                <View key={m.key} style={[styles.memberRow, i < PROJECT_MODULES.length - 1 && styles.memberRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.label}</Text>
                    <Text style={styles.memberRole}>{m.description}</Text>
                    {gated ? <Text style={styles.openLink}>Disponible à partir du plan Équipe</Text> : null}
                  </View>
                  <Switch
                    value={!gated && isModuleEnabled(enabledModules, m.key)}
                    onValueChange={() => toggleModule(m.key)}
                    disabled={!isAdmin || gated}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              );
            })}
          </Card>

          <View style={styles.accessHeader}>
            <Text style={styles.sectionTitle}>Accès</Text>
            {restricted ? (
              <Text style={styles.openLink} onPress={openToEveryone}>
                Rendre accessible à tous
              </Text>
            ) : null}
          </View>
          <Text style={styles.accessHint}>
            {restricted
              ? 'Ce chantier est restreint : seules les personnes activées ci-dessous y ont accès (fil, rapports, documents, photos).'
              : "Par défaut, tous les membres de l'équipe ont accès à ce chantier. Désactivez une personne pour restreindre l'accès."}
          </Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {members.map((m, i) => {
              const alwaysOn = m.role === 'owner' || m.role === 'admin';
              return (
                <View key={m.id} style={[styles.memberRow, i < members.length - 1 && styles.memberRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.full_name || 'Membre'}</Text>
                    <Text style={styles.memberRole}>
                      {alwaysOn ? (m.role === 'owner' ? 'Propriétaire · toujours accès' : 'Administrateur · toujours accès') : 'Membre'}
                    </Text>
                  </View>
                  <Switch
                    value={alwaysOn || hasAccess(m.user_id)}
                    onValueChange={() => toggleMemberAccess(m)}
                    disabled={!isAdmin || alwaysOn}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              );
            })}
          </Card>
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  coverWrap: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 16 / 9,
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
    right: spacing.sm,
    bottom: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  coverHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.lg,
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
});
