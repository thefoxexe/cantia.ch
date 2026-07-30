import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { deleteFromOrgBucket, formatBytes, getSignedUrl, uploadToOrgBucket } from '../lib/api/storage';
import { downloadFile } from '../lib/downloadFile';
import { EmptyState } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { Folder, OpusFile } from '../lib/types';

interface Crumb {
  id: string | null;
  name: string;
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const { organization, user } = useAuth();
  const [crumbs, setCrumbs] = useState<Crumb[]>([{ id: null, name: 'Documents' }]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<OpusFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const currentFolderId = crumbs[crumbs.length - 1].id;

  const load = useCallback(async () => {
    setLoading(true);
    const folderQuery = supabase.from('folders').select('*').eq('project_id', projectId).order('name');
    const fileQuery = supabase.from('files').select('*').eq('project_id', projectId).order('name');

    const [{ data: folderRows }, { data: fileRows }] = await Promise.all([
      currentFolderId ? folderQuery.eq('parent_id', currentFolderId) : folderQuery.is('parent_id', null),
      currentFolderId ? fileQuery.eq('folder_id', currentFolderId) : fileQuery.is('folder_id', null),
    ]);
    setFolders(folderRows ?? []);
    setFiles(fileRows ?? []);
    setLoading(false);
  }, [projectId, currentFolderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openFolder(folder: Folder) {
    setCrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function goToCrumb(index: number) {
    setCrumbs((prev) => prev.slice(0, index + 1));
  }

  async function createFolder() {
    if (!organization || !newFolderName.trim()) return;
    setBusy(true);
    await supabase.from('folders').insert({
      organization_id: organization.id,
      project_id: projectId,
      parent_id: currentFolderId,
      name: newFolderName.trim(),
      created_by: user?.id,
    });
    setNewFolderName('');
    setCreatingFolder(false);
    setBusy(false);
    load();
  }

  async function removeFolder(folder: Folder) {
    Alert.alert('Supprimer ce dossier ?', `"${folder.name}" et tout son contenu seront supprimés.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('folders').delete().eq('id', folder.id);
          load();
        },
      },
    ]);
  }

  async function uploadFile() {
    if (!organization) return;
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;

    setBusy(true);
    for (const asset of result.assets) {
      const subPath = `projects/${projectId}/documents/${Date.now()}-${asset.name}`;
      const { path } = await uploadToOrgBucket(organization.id, subPath, asset.uri, asset.mimeType ?? 'application/octet-stream');
      if (path) {
        await supabase.from('files').insert({
          organization_id: organization.id,
          project_id: projectId,
          folder_id: currentFolderId,
          name: asset.name,
          storage_path: path,
          size_bytes: asset.size ?? 0,
          mime_type: asset.mimeType ?? null,
          uploaded_by: user?.id,
        });
      }
    }
    setBusy(false);
    load();
  }

  async function openFile(file: OpusFile) {
    const url = await getSignedUrl(file.storage_path);
    if (url) await downloadFile(url, file.name);
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

  const rows: Array<{ type: 'folder'; data: Folder } | { type: 'file'; data: OpusFile }> = [
    ...folders.map((f) => ({ type: 'folder' as const, data: f })),
    ...files.map((f) => ({ type: 'file' as const, data: f })),
  ];

  return (
    <View>
      <View style={styles.breadcrumbRow}>
        {crumbs.map((c, i) => (
          <View key={c.id ?? 'root'} style={styles.breadcrumbItem}>
            <Pressable onPress={() => goToCrumb(i)}>
              <Text style={[styles.breadcrumbText, i === crumbs.length - 1 && styles.breadcrumbTextActive]}>
                {c.name}
              </Text>
            </Pressable>
            {i < crumbs.length - 1 ? <Feather name="chevron-right" size={14} color={colors.textMuted} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarButton} onPress={() => setCreatingFolder((v) => !v)}>
          <Feather name="folder-plus" size={16} color={colors.text} />
          <Text style={styles.toolbarButtonText}>Nouveau dossier</Text>
        </Pressable>
        <Pressable style={styles.toolbarButton} onPress={uploadFile} disabled={busy}>
          <Feather name="upload" size={16} color={colors.text} />
          <Text style={styles.toolbarButtonText}>{busy ? 'Envoi…' : 'Ajouter un fichier'}</Text>
        </Pressable>
      </View>

      {creatingFolder ? (
        <View style={styles.newFolderRow}>
          <TextInput
            style={styles.newFolderInput}
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholder="Nom du dossier"
            placeholderTextColor={colors.textMuted}
            autoFocus
            onSubmitEditing={createFolder}
          />
          <Pressable style={styles.newFolderConfirm} onPress={createFolder}>
            <Feather name="check" size={16} color="#fff" />
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={rows}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        scrollEnabled={false}
        ListEmptyComponent={
          !loading ? <EmptyState title="Dossier vide" subtitle="Ajoutez des sous-dossiers ou des fichiers." /> : null
        }
        renderItem={({ item }) =>
          item.type === 'folder' ? (
            <Pressable style={styles.row} onPress={() => openFolder(item.data)}>
              <Feather name="folder" size={20} color={colors.accent} />
              <Text style={styles.rowText} numberOfLines={1}>
                {item.data.name}
              </Text>
              <Pressable hitSlop={8} onPress={() => removeFolder(item.data)}>
                <Feather name="trash-2" size={16} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          ) : (
            <Pressable style={styles.row} onPress={() => openFile(item.data)}>
              <Feather name="file" size={20} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText} numberOfLines={1}>
                  {item.data.name}
                </Text>
                <Text style={styles.rowMeta}>{formatBytes(item.data.size_bytes)}</Text>
              </View>
              <Pressable hitSlop={8} onPress={() => removeFile(item.data)}>
                <Feather name="trash-2" size={16} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breadcrumbText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  breadcrumbTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  toolbarButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  newFolderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  newFolderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  newFolderConfirm: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  rowMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
