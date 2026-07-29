import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

interface StagedPhoto {
  id: string;
  uri: string;
  caption: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: string;
}

export function ProjectFeed({ projectId }: { projectId: string }) {
  const { organization, user } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [showPhotoStaging, setShowPhotoStaging] = useState(false);
  const [sendingPhotos, setSendingPhotos] = useState(false);

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
    if (photoPaths.length) {
      // Merge instead of replace: a transient network error made
      // getSignedUrls return {}, which wiped out every already-loaded photo
      // (not just the new one) and left them spinning until the page was
      // revisited. Merging means a failed batch just leaves those entries
      // to retry on the next load instead of blanking working ones.
      const fresh = await getSignedUrls(photoPaths);
      setUrls((prev) => ({ ...prev, ...fresh }));
    }
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

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', "Autorisez l'accès à l'appareil photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const coords = await captureLocation();
    setStagedPhotos((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        uri: asset.uri,
        caption: '',
        latitude: coords.latitude,
        longitude: coords.longitude,
        takenAt: new Date().toISOString(),
      },
    ]);
    setShowPhotoStaging(true);
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', 'Autorisez l’accès à vos photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, exif: true, allowsMultipleSelection: true });
    if (result.canceled || !result.assets?.length) return;
    const newPhotos: StagedPhoto[] = result.assets.map((asset) => {
      const coords = exifCoords(asset.exif);
      return {
        id: `${Date.now()}-${Math.random()}`,
        uri: asset.uri,
        caption: '',
        latitude: coords.latitude,
        longitude: coords.longitude,
        takenAt: exifTakenAt(asset.exif),
      };
    });
    setStagedPhotos((prev) => [...prev, ...newPhotos]);
    setShowPhotoStaging(true);
  }

  function updateStagedCaption(id: string, caption: string) {
    setStagedPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  }

  function removeStagedPhoto(id: string) {
    setStagedPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  // Sends staged photos one by one, dropping each from local state only
  // once it's actually confirmed sent — so if one fails partway through
  // (e.g. a network blip), the ones already sent aren't re-sent on retry
  // and the rest stay staged instead of silently vanishing.
  async function sendStagedPhotos() {
    if (!organization || stagedPhotos.length === 0 || sendingPhotos) return;
    setSendingPhotos(true);
    setError(null);
    let remaining = stagedPhotos;
    while (remaining.length > 0) {
      const photo = remaining[0];
      const { error: err } = await addPhotoEntry({
        organizationId: organization.id,
        projectId,
        userId: user?.id,
        uri: photo.uri,
        caption: photo.caption,
        latitude: photo.latitude,
        longitude: photo.longitude,
        takenAt: photo.takenAt,
      });
      if (err) {
        setError(err);
        setStagedPhotos(remaining);
        setSendingPhotos(false);
        return;
      }
      remaining = remaining.slice(1);
      setStagedPhotos(remaining);
    }
    setSendingPhotos(false);
    setShowPhotoStaging(false);
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
            <Pressable style={styles.composerIconButton} onPress={takePhoto} disabled={sending}>
              <Feather name="camera" size={18} color={colors.text} />
            </Pressable>
            <Pressable style={styles.composerIconButton} onPress={pickFromGallery} disabled={sending}>
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

      <Modal
        visible={showPhotoStaging}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!sendingPhotos) setShowPhotoStaging(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {stagedPhotos.length > 0 ? `${stagedPhotos.length} photo${stagedPhotos.length > 1 ? 's' : ''}` : 'Photos'}
              </Text>
              <Pressable hitSlop={8} onPress={() => setShowPhotoStaging(false)} disabled={sendingPhotos}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              {stagedPhotos.length === 0 ? (
                <Text style={styles.stagingEmptyText}>Prenez une photo ou choisissez-en depuis la galerie.</Text>
              ) : (
                <View style={{ gap: spacing.md }}>
                  {stagedPhotos.map((photo, i) => (
                    <View key={photo.id} style={styles.stagedItem}>
                      <Image source={{ uri: photo.uri }} style={styles.stagedThumb} />
                      <View style={styles.stagedItemBody}>
                        <TextInput
                          style={styles.stagedCaptionInput}
                          value={photo.caption}
                          onChangeText={(t) => updateStagedCaption(photo.id, t)}
                          placeholder={`Commentaire photo ${i + 1} (optionnel)`}
                          placeholderTextColor={colors.textMuted}
                          multiline
                        />
                      </View>
                      <Pressable hitSlop={8} onPress={() => removeStagedPhoto(photo.id)} disabled={sendingPhotos}>
                        <Feather name="trash-2" size={16} color={colors.danger} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>
            <View style={styles.stagingActions}>
              <Pressable style={styles.stagingActionButton} onPress={takePhoto} disabled={sendingPhotos}>
                <Feather name="camera" size={16} color={colors.primary} />
                <Text style={styles.stagingActionText}>Reprendre une photo</Text>
              </Pressable>
              <Pressable style={styles.stagingActionButton} onPress={pickFromGallery} disabled={sendingPhotos}>
                <Feather name="image" size={16} color={colors.primary} />
                <Text style={styles.stagingActionText}>Galerie</Text>
              </Pressable>
            </View>
            <Button
              title={sendingPhotos ? 'Envoi en cours…' : `Envoyer ${stagedPhotos.length} photo${stagedPhotos.length > 1 ? 's' : ''}`}
              icon="send"
              onPress={sendStagedPhotos}
              loading={sendingPhotos}
              disabled={stagedPhotos.length === 0}
              style={styles.stagingSendButton}
            />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  stagingEmptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  stagedItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  stagedThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  stagedItemBody: {
    flex: 1,
  },
  stagedCaptionInput: {
    fontSize: fontSize.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  stagingActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  stagingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stagingActionText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  stagingSendButton: {
    margin: spacing.lg,
  },
});
