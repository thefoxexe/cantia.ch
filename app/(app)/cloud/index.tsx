import { useCallback, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { deleteFromOrgBucket, formatBytes, getSignedUrl, uploadToOrgBucket } from '../../../lib/api/storage';
import { Card, EmptyState, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { OpusFile, Plan } from '../../../lib/types';

export default function CloudScreen() {
  const { organization, user } = useAuth();
  const [files, setFiles] = useState<OpusFile[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data: fileRows }, { data: planRow }] = await Promise.all([
      supabase.from('files').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }),
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
    ]);
    setFiles(fileRows ?? []);
    setPlan(planRow ?? null);
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const usedBytes = files.reduce((sum, f) => sum + f.size_bytes, 0);
  const quotaBytes = (plan?.storage_quota_mb ?? 0) * 1024 * 1024;
  const usageRatio = quotaBytes > 0 ? Math.min(usedBytes / quotaBytes, 1) : 0;

  async function handleUpload() {
    if (!organization) return;
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;

    if (quotaBytes > 0) {
      const incoming = result.assets.reduce((sum, a) => sum + (a.size ?? 0), 0);
      if (usedBytes + incoming > quotaBytes) {
        Alert.alert(
          'Quota atteint',
          "L'ajout de ces fichiers dépasserait le quota de stockage de votre plan. Passez à un plan supérieur pour continuer.",
        );
        return;
      }
    }

    setUploading(true);
    for (const asset of result.assets) {
      const subPath = `files/${Date.now()}-${asset.name}`;
      const { path } = await uploadToOrgBucket(organization.id, subPath, asset.uri, asset.mimeType ?? 'application/octet-stream');
      if (path) {
        await supabase.from('files').insert({
          organization_id: organization.id,
          name: asset.name,
          storage_path: path,
          size_bytes: asset.size ?? 0,
          mime_type: asset.mimeType ?? null,
          uploaded_by: user?.id,
        });
      }
    }
    setUploading(false);
    load();
  }

  async function openFile(file: OpusFile) {
    const url = await getSignedUrl(file.storage_path);
    if (url) Linking.openURL(url);
  }

  async function removeFile(file: OpusFile) {
    Alert.alert('Supprimer ce fichier ?', file.name, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteFromOrgBucket(file.storage_path);
          await supabase.from('files').delete().eq('id', file.id);
          load();
        },
      },
    ]);
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.planTitle}>Plan {plan?.name ?? '—'}</Text>
        <View style={styles.usageBarTrack}>
          <View style={[styles.usageBarFill, { width: `${usageRatio * 100}%` }]} />
        </View>
        <Text style={styles.usageText}>
          {formatBytes(usedBytes)} utilisés sur {plan ? formatBytes(quotaBytes) : '—'}
        </Text>
      </Card>

      <Pressable style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
        <Feather name="upload" size={16} color="#fff" />
        <Text style={styles.uploadButtonText}>{uploading ? 'Envoi en cours…' : 'Importer un document'}</Text>
      </Pressable>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.sm }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState title="Aucun document" subtitle="Plans, soumissions, contrats… tout au même endroit, chiffré." />
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.fileRow}>
            <Feather name="file" size={18} color={colors.textMuted} />
            <Pressable style={{ flex: 1 }} onPress={() => openFile(item)}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.meta}>
                {formatBytes(item.size_bytes)} · {new Date(item.created_at).toLocaleDateString('fr-CH')}
              </Text>
            </Pressable>
            <Pressable onPress={() => removeFile(item)} hitSlop={8}>
              <Feather name="trash-2" size={16} color={colors.textMuted} />
            </Pressable>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  planTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  usageBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: 8,
    backgroundColor: colors.primary,
  },
  usageText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  uploadButton: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  fileName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
