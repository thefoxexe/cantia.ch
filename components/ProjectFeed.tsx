import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { getSignedUrls } from '../lib/api/storage';
import { addNoteEntry, addPhotoEntry, generateReportFromFeed, listFeedEntries } from '../lib/api/feed';
import { captureLocation, exifCoords, exifTakenAt } from '../lib/geo';
import { Button, EmptyState, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { FeedEntry } from '../lib/types';

export function ProjectFeed({ projectId }: { projectId: string }) {
  const { organization, user } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showTitleField, setShowTitleField] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [feed, { data: members }] = await Promise.all([
      listFeedEntries(projectId),
      supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organization.id),
    ]);
    setEntries(feed);
    const names: Record<string, string> = {};
    for (const m of members ?? []) names[m.user_id] = m.full_name || 'Membre';
    setAuthorNames(names);
    const photoPaths = feed.filter((e) => e.type === 'photo' && e.storage_path).map((e) => e.storage_path!);
    if (photoPaths.length) setUrls(await getSignedUrls(photoPaths));
    setLoading(false);
  }, [organization, projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function sendNote() {
    if (!organization || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error: err } = await addNoteEntry({
      organizationId: organization.id,
      projectId,
      userId: user?.id,
      body: text,
    });
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setText('');
    load();
  }

  async function sendPhoto(fromCamera: boolean) {
    if (!organization || sending) return;
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', fromCamera ? "Autorisez l'accès à l'appareil photo." : 'Autorisez l’accès à vos photos.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, exif: true });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const coords = fromCamera ? await captureLocation() : exifCoords(asset.exif);
    const takenAt = fromCamera ? new Date().toISOString() : exifTakenAt(asset.exif);

    setSending(true);
    setError(null);
    const { error: err } = await addPhotoEntry({
      organizationId: organization.id,
      projectId,
      userId: user?.id,
      uri: asset.uri,
      caption: text,
      ...coords,
      takenAt,
    });
    setSending(false);
    if (err) {
      setError(err);
      return;
    }
    setText('');
    load();
  }

  function toggleSelecting() {
    setSelecting((s) => !s);
    setSelected(new Set());
    setShowTitleField(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedEntries = useMemo(() => entries.filter((e) => selected.has(e.id)), [entries, selected]);

  // Newest-first for the inverted FlatList: index 0 renders at the bottom of
  // the screen, so the feed opens already scrolled to the latest message.
  const invertedData = useMemo(() => [...entries].reverse(), [entries]);

  async function confirmGenerate() {
    if (!organization || selectedEntries.length === 0 || generating) return;
    setGenerating(true);
    setError(null);
    const { reportId, error: err } = await generateReportFromFeed({
      organizationId: organization.id,
      projectId,
      userId: user?.id,
      title: reportTitle.trim() || `Rapport du ${new Date().toLocaleDateString('fr-CH')}`,
      entries: selectedEntries,
      authorNames,
    });
    setGenerating(false);
    if (err) setError(err);
    if (reportId) {
      setSelecting(false);
      setSelected(new Set());
      setShowTitleField(false);
      load();
      router.push(`/(app)/chantiers/${projectId}/rapports/${reportId}`);
    }
  }

  function openMap(entry: FeedEntry) {
    if (entry.latitude == null || entry.longitude == null) return;
    Linking.openURL(`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`);
  }

  function renderEntry(entry: FeedEntry) {
    const isMe = entry.created_by === user?.id;
    const author = (entry.created_by && authorNames[entry.created_by]) || 'Membre';
    const isSelected = selected.has(entry.id);
    const time = new Date(entry.created_at).toLocaleString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Pressable
        onPress={() => (selecting ? toggleSelect(entry.id) : undefined)}
        style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}
      >
        {selecting ? (
          <Feather
            name={isSelected ? 'check-circle' : 'circle'}
            size={18}
            color={isSelected ? colors.primary : colors.textMuted}
            style={styles.selectIcon}
          />
        ) : null}
        <View style={[styles.bubble, isMe && styles.bubbleMe]}>
          <View style={styles.bubbleHeader}>
            <Text style={styles.bubbleAuthor}>{isMe ? 'Vous' : author}</Text>
            <Text style={styles.bubbleTime}>{time}</Text>
          </View>
          {entry.type === 'note' ? (
            <Text style={styles.bubbleText}>{entry.body}</Text>
          ) : (
            <View>
              {urls[entry.storage_path ?? ''] ? (
                <Image source={{ uri: urls[entry.storage_path!] }} style={styles.bubblePhoto} />
              ) : (
                <View style={[styles.bubblePhoto, styles.bubblePhotoPlaceholder]}>
                  <ActivityIndicator color={colors.textMuted} />
                </View>
              )}
              {entry.caption ? <Text style={styles.bubbleCaption}>{entry.caption}</Text> : null}
              {entry.latitude != null ? (
                <Pressable onPress={() => openMap(entry)} style={styles.mapLink} hitSlop={6}>
                  <Feather name="map-pin" size={11} color={colors.accent} />
                  <Text style={styles.mapLinkText}>Voir sur la carte</Text>
                </Pressable>
              ) : null}
            </View>
          )}
          {entry.report_id ? (
            <View style={styles.usedBadge}>
              <Feather name="check" size={10} color={colors.success} />
              <Text style={styles.usedBadgeText}>Inclus dans un rapport</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarButton} onPress={toggleSelecting}>
          <Feather name={selecting ? 'x' : 'file-text'} size={15} color={colors.primary} />
          <Text style={styles.toolbarButtonText}>{selecting ? 'Annuler la sélection' : 'Générer un rapport'}</Text>
        </Pressable>
      </View>

      {selecting ? (
        <Text style={styles.selectHint}>
          Touchez les notes et photos à inclure ({selected.size} sélectionné{selected.size > 1 ? 's' : ''}).
        </Text>
      ) : null}

      {entries.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Aucune activité pour l'instant"
            subtitle="Décrivez l'avancement, ajoutez des photos — c'est le journal de bord du chantier."
          />
        </View>
      ) : (
        <FlatList
          data={invertedData}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderEntry(item)}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
        />
      )}

      {selecting && selected.size > 0 ? (
        <View style={styles.generatePanel}>
          {showTitleField ? (
            <>
              <Field
                label="Titre du rapport"
                value={reportTitle}
                onChangeText={setReportTitle}
                placeholder={`Rapport du ${new Date().toLocaleDateString('fr-CH')}`}
              />
              <Button title="Créer le rapport PDF" icon="check" onPress={confirmGenerate} loading={generating} />
            </>
          ) : (
            <Button
              title={`Générer un rapport avec ${selected.size} élément${selected.size > 1 ? 's' : ''}`}
              icon="arrow-right"
              onPress={() => setShowTitleField(true)}
            />
          )}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!selecting ? (
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={text}
            onChangeText={setText}
            placeholder="Décrivez l'avancement, une remarque…"
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <View style={styles.composerActions}>
            <Pressable style={styles.composerIconButton} onPress={() => sendPhoto(true)} disabled={sending}>
              <Feather name="camera" size={18} color={colors.text} />
            </Pressable>
            <Pressable style={styles.composerIconButton} onPress={() => sendPhoto(false)} disabled={sending}>
              <Feather name="image" size={18} color={colors.text} />
            </Pressable>
            <Pressable
              style={[styles.composerSend, (!text.trim() || sending) && styles.composerSendDisabled]}
              onPress={sendNote}
              disabled={!text.trim() || sending}
            >
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="send" size={16} color="#fff" />}
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.md,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  toolbarButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  selectHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  selectIcon: {
    marginBottom: spacing.sm,
  },
  bubble: {
    maxWidth: '78%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  bubbleMe: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: 4,
  },
  bubbleAuthor: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  bubbleTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  bubbleText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 19,
  },
  bubblePhoto: {
    width: 220,
    maxWidth: '100%',
    height: 160,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  bubblePhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleCaption: {
    fontSize: fontSize.xs,
    color: colors.text,
    marginTop: spacing.xs,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.xs,
  },
  mapLinkText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  usedBadgeText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },
  generatePanel: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  composer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  composerInput: {
    minHeight: 40,
    maxHeight: 100,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  composerIconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  composerSend: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  composerSendDisabled: {
    opacity: 0.5,
  },
});
