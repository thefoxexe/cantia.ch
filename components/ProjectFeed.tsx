import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Network from 'expo-network';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { getSignedUrls } from '../lib/api/storage';
import { addNoteEntry, addPhotoEntry, addVoiceEntry, generateReportFromFeed, listFeedEntries } from '../lib/api/feed';
import { captureLocation, exifCoords, exifTakenAt } from '../lib/geo';
import { useVoiceRecorder } from '../lib/useVoiceRecorder';
import {
  enqueuePhoto,
  flushPhotoQueue,
  isOffline,
  listQueuedPhotos,
  resolveQueuedPhotoUri,
  type QueuedPhoto,
} from '../lib/offline/photoQueue';
import { Button, EmptyState, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { FeedEntry } from '../lib/types';

interface StagedPhoto {
  id: string;
  uri: string;
  mimeType: string | null;
  caption: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: string;
}

type FeedListItem = { kind: 'entry'; entry: FeedEntry } | { kind: 'pending'; photo: QueuedPhoto };

function formatDuration(seconds: number | null | undefined): string {
  const total = Math.max(0, seconds ?? 0);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ProjectFeed({ projectId }: { projectId: string }) {
  const { organization, user } = useAuth();
  const router = useRouter();
  const { width: winWidth } = useWindowDimensions();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [authorAvatars, setAuthorAvatars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [composerHeight, setComposerHeight] = useState(72);

  // Real voice messages: recorder gives a playable audio file plus a live
  // transcript (see lib/useVoiceRecorder.ts for the platform split), and a
  // single shared player instance handles playback for whichever bubble is
  // currently playing.
  const voiceRecorder = useVoiceRecorder();
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [sendingVoice, setSendingVoice] = useState(false);
  const [playingEntryId, setPlayingEntryId] = useState<string | null>(null);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  // The "pile" of captured/picked photos not yet sent — shown as a
  // fanned stack bottom-left, reviewed/sent via the swipeable modal.
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [sendingPhotos, setSendingPhotos] = useState(false);

  // The single most-recently captured photo, shown in a quick Kraaft-style
  // popup (caption + send + "shoot another") right after the shutter —
  // separate from the stack so a rapid-fire session doesn't force a caption
  // on every single frame.
  const [quickPhoto, setQuickPhoto] = useState<StagedPhoto | null>(null);
  const [quickSending, setQuickSending] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  const [showStackReview, setShowStackReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewScrollRef = useRef<ScrollView>(null);

  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showTitleField, setShowTitleField] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photos captured with no/flaky signal — queued locally (durably, so they
  // survive an app restart) and shown right in the feed with a "en attente"
  // badge until the connection lets them actually upload.
  const [pendingLocal, setPendingLocal] = useState<QueuedPhoto[]>([]);
  const [pendingPreviewUris, setPendingPreviewUris] = useState<Record<string, string>>({});
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [feed, { data: members }] = await Promise.all([
      listFeedEntries(projectId),
      supabase.from('organization_members').select('user_id, full_name, avatar_url').eq('organization_id', organization.id),
    ]);
    setEntries(feed);
    const names: Record<string, string> = {};
    for (const m of members ?? []) names[m.user_id] = m.full_name || 'Membre';
    setAuthorNames(names);
    const avatarPaths = (members ?? []).filter((m) => m.avatar_url) as { user_id: string; avatar_url: string }[];
    if (avatarPaths.length) {
      const signed = await getSignedUrls(avatarPaths.map((m) => m.avatar_url));
      const byUser: Record<string, string> = {};
      for (const m of avatarPaths) if (signed[m.avatar_url]) byUser[m.user_id] = signed[m.avatar_url];
      setAuthorAvatars(byUser);
    }
    // Voice entries need a signed URL too, same as photos — without this,
    // playback only ever worked for the sender (an optimistic local file
    // uri set right after recording, see below), and broke the moment
    // anyone else loaded the feed from the server, since their storage_path
    // never made it into `urls`.
    const mediaPaths = feed
      .filter((e) => (e.type === 'photo' || e.type === 'voice') && e.storage_path)
      .map((e) => e.storage_path!);
    if (mediaPaths.length) {
      // Merge instead of replace: a transient network error made
      // getSignedUrls return {}, which wiped out every already-loaded photo
      // (not just the new one) and left them spinning until the page was
      // revisited. Merging means a failed batch just leaves those entries
      // to retry on the next load instead of blanking working ones.
      const fresh = await getSignedUrls(mediaPaths);
      setUrls((prev) => ({ ...prev, ...fresh }));
    }
    setLoading(false);
  }, [organization, projectId]);

  const refreshPendingLocal = useCallback(async () => {
    const queued = await listQueuedPhotos(projectId);
    setPendingLocal(queued);
    const resolved = await Promise.all(
      queued.map(async (q) => [q.id, await resolveQueuedPhotoUri(q).catch(() => null)] as const),
    );
    setPendingPreviewUris((prev) => {
      const next: Record<string, string> = {};
      for (const [id, uri] of resolved) if (uri) next[id] = uri;
      // Drop anything no longer queued so we don't leak stale object URLs.
      for (const id of Object.keys(prev)) {
        if (!(id in next) && queued.some((q) => q.id === id)) next[id] = prev[id];
      }
      return next;
    });
  }, [projectId]);

  const flushAndRefresh = useCallback(async () => {
    const sent = await flushPhotoQueue();
    await refreshPendingLocal();
    if (sent > 0) load();
  }, [refreshPendingLocal, load]);

  useFocusEffect(
    useCallback(() => {
      load();
      refreshPendingLocal();
      flushAndRefresh();
    }, [load, refreshPendingLocal, flushAndRefresh]),
  );

  useEffect(() => {
    Network.getNetworkStateAsync()
      .then((state) => setOffline(state.isConnected === false || state.isInternetReachable === false))
      .catch(() => {});
    const sub = Network.addNetworkStateListener((state) => {
      const nowOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(nowOffline);
      if (!nowOffline) flushAndRefresh();
    });
    return () => sub.remove();
  }, [flushAndRefresh]);

  // Keep the review modal's paged position in sync with the stack —
  // a delete mid-review shifts everything left by one, and the last
  // photo being sent/removed should close the modal instead of showing
  // an empty page.
  useEffect(() => {
    if (!showStackReview) return;
    if (stagedPhotos.length === 0) {
      setShowStackReview(false);
      return;
    }
    const clamped = Math.min(reviewIndex, stagedPhotos.length - 1);
    if (clamped !== reviewIndex) {
      setReviewIndex(clamped);
      reviewScrollRef.current?.scrollTo({ x: clamped * winWidth, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedPhotos.length, showStackReview]);

  // Appends a just-sent entry straight into local state instead of
  // re-fetching the whole feed + re-signing every photo URL — the send
  // already has everything needed to show it immediately, so a photo
  // shouldn't take a full reload's worth of network round trips just to
  // appear. For photos, the local picker URI is reused directly since it's
  // the exact same file that was just uploaded.
  function appendSentEntry(entry: FeedEntry, localUri?: string) {
    setEntries((prev) => [...prev, entry]);
    if (localUri && entry.storage_path) {
      setUrls((prev) => ({ ...prev, [entry.storage_path!]: localUri }));
    }
  }

  useEffect(() => {
    if (playerStatus.didJustFinish) setPlayingEntryId(null);
  }, [playerStatus.didJustFinish]);

  function togglePlayback(entry: FeedEntry) {
    if (!entry.storage_path) return;
    const url = urls[entry.storage_path];
    if (!url) return;
    if (playingEntryId === entry.id) {
      player.pause();
      setPlayingEntryId(null);
      return;
    }
    player.replace(url);
    player.play();
    setPlayingEntryId(entry.id);
  }

  async function startVoiceRecording() {
    setVoiceError(null);
    const started = await voiceRecorder.start();
    if (!started) {
      Alert.alert('Permission requise', "Autorisez l'accès au microphone pour envoyer un message vocal.");
    }
  }

  function cancelVoiceRecording() {
    voiceRecorder.cancel();
  }

  async function stopAndSendVoice() {
    if (!organization) return;
    const recording = await voiceRecorder.stop();
    if (!recording) {
      setVoiceError("Échec de l'enregistrement du message vocal.");
      return;
    }
    setSendingVoice(true);
    const { error: err, entry } = await addVoiceEntry({
      organizationId: organization.id,
      projectId,
      userId: user?.id,
      uri: recording.uri,
      mimeType: recording.mimeType,
      durationSeconds: recording.durationSeconds,
      transcript: recording.transcript,
      latitude: null,
      longitude: null,
      takenAt: new Date().toISOString(),
    });
    setSendingVoice(false);
    if (err) {
      setVoiceError(err);
      return;
    }
    if (entry) appendSentEntry(entry, recording.uri);
  }

  async function sendNote() {
    if (!organization || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error: err, entry } = await addNoteEntry({
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
    if (entry) appendSentEntry(entry);
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
    const id = `${Date.now()}-${Math.random()}`;
    setQuickError(null);
    // Show the popup immediately with the shot — GPS fixes can take several
    // seconds, and blocking the popup on `captureLocation()` was the reason
    // it felt slow to appear after pressing the shutter. Coordinates are
    // filled in once available instead.
    setQuickPhoto({
      id,
      uri: asset.uri,
      mimeType: asset.mimeType ?? null,
      caption: '',
      latitude: null,
      longitude: null,
      takenAt: new Date().toISOString(),
    });
    captureLocation().then((coords) => {
      setQuickPhoto((p) => (p && p.id === id ? { ...p, ...coords } : p));
      setStagedPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...coords } : p)));
    });
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
        mimeType: asset.mimeType ?? null,
        caption: '',
        latitude: coords.latitude,
        longitude: coords.longitude,
        takenAt: exifTakenAt(asset.exif),
      };
    });
    const startIndex = stagedPhotos.length;
    setStagedPhotos((prev) => [...prev, ...newPhotos]);
    setReviewIndex(startIndex);
    setShowStackReview(true);
  }

  // Dismissing the quick popup (X, or shooting another frame) never loses
  // the photo — it drops into the stack so it can still be captioned or
  // sent later from the review modal.
  function stashQuickPhoto() {
    setQuickPhoto((current) => {
      if (current) setStagedPhotos((prev) => [...prev, current]);
      return null;
    });
    setQuickError(null);
  }

  async function retakeFromQuick() {
    stashQuickPhoto();
    await takePhoto();
  }

  function updateQuickCaption(caption: string) {
    setQuickPhoto((p) => (p ? { ...p, caption } : p));
  }

  async function sendQuickPhoto() {
    if (!organization || !quickPhoto || quickSending) return;
    setQuickSending(true);
    setQuickError(null);

    // No signal on-site — queue it durably instead of blocking on a request
    // that has nowhere to go, and stop pretending it "failed".
    if (await isOffline()) {
      await enqueuePhoto({
        organizationId: organization.id,
        projectId,
        userId: user?.id,
        uri: quickPhoto.uri,
        mimeType: quickPhoto.mimeType,
        caption: quickPhoto.caption,
        latitude: quickPhoto.latitude,
        longitude: quickPhoto.longitude,
        takenAt: quickPhoto.takenAt,
      });
      setQuickSending(false);
      setQuickPhoto(null);
      refreshPendingLocal();
      return;
    }

    const { error: err, entry } = await addPhotoEntry({
      organizationId: organization.id,
      projectId,
      userId: user?.id,
      uri: quickPhoto.uri,
      mimeType: quickPhoto.mimeType,
      caption: quickPhoto.caption,
      latitude: quickPhoto.latitude,
      longitude: quickPhoto.longitude,
      takenAt: quickPhoto.takenAt,
    });
    setQuickSending(false);
    if (err) {
      setQuickError(err);
      return;
    }
    if (entry) appendSentEntry(entry, quickPhoto.uri);
    setQuickPhoto(null);
  }

  function openStackReview() {
    if (stagedPhotos.length === 0) return;
    setReviewIndex(0);
    setShowStackReview(true);
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

    // No signal — queue the whole stack durably rather than blocking the
    // review modal on requests that can't go anywhere right now.
    if (await isOffline()) {
      for (const photo of stagedPhotos) {
        await enqueuePhoto({
          organizationId: organization.id,
          projectId,
          userId: user?.id,
          uri: photo.uri,
          mimeType: photo.mimeType,
          caption: photo.caption,
          latitude: photo.latitude,
          longitude: photo.longitude,
          takenAt: photo.takenAt,
        });
      }
      setStagedPhotos([]);
      setSendingPhotos(false);
      setShowStackReview(false);
      refreshPendingLocal();
      return;
    }

    let remaining = stagedPhotos;
    while (remaining.length > 0) {
      const photo = remaining[0];
      const { error: err, entry } = await addPhotoEntry({
        organizationId: organization.id,
        projectId,
        userId: user?.id,
        uri: photo.uri,
        mimeType: photo.mimeType,
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
      if (entry) appendSentEntry(entry, photo.uri);
      remaining = remaining.slice(1);
      setStagedPhotos(remaining);
    }
    setSendingPhotos(false);
    setShowStackReview(false);
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
  // Locally-queued (not-yet-sent) photos are merged in after the real
  // entries — they're always the most recent thing on the chantier.
  const invertedData = useMemo<FeedListItem[]>(() => {
    const real: FeedListItem[] = entries.map((entry) => ({ kind: 'entry', entry }));
    const pending: FeedListItem[] = [...pendingLocal]
      .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
      .map((photo) => ({ kind: 'pending', photo }));
    return [...real, ...pending].reverse();
  }, [entries, pendingLocal]);

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
        {!isMe ? (
          entry.created_by && authorAvatars[entry.created_by] ? (
            <Image source={{ uri: authorAvatars[entry.created_by] }} style={styles.avatarBubble} />
          ) : (
            <View style={styles.avatarBubbleFallback}>
              <Text style={styles.avatarBubbleInitial}>{author.charAt(0).toUpperCase()}</Text>
            </View>
          )
        ) : null}
        <View style={[styles.bubble, isMe && styles.bubbleMe]}>
          <View style={styles.bubbleHeader}>
            <Text style={styles.bubbleAuthor}>{isMe ? 'Vous' : author}</Text>
            <Text style={styles.bubbleTime}>{time}</Text>
          </View>
          {entry.type === 'note' ? (
            <Text style={styles.bubbleText}>{entry.body}</Text>
          ) : entry.type === 'voice' ? (
            <View>
              <Pressable onPress={() => togglePlayback(entry)} style={styles.voiceRow} hitSlop={6}>
                <View style={styles.voicePlayButton}>
                  <Feather
                    name={playingEntryId === entry.id && playerStatus.playing ? 'pause' : 'play'}
                    size={14}
                    color="#fff"
                  />
                </View>
                <View style={styles.voiceWave} />
                <Text style={styles.voiceDuration}>{formatDuration(entry.duration_seconds)}</Text>
              </Pressable>
              {entry.transcript ? <Text style={styles.voiceTranscript}>{entry.transcript}</Text> : null}
            </View>
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

  function renderPendingPhoto(photo: QueuedPhoto) {
    const uri = pendingPreviewUris[photo.id];
    return (
      <View style={[styles.bubbleRow, styles.bubbleRowMe]}>
        <View style={[styles.bubble, styles.bubbleMe, styles.bubblePendingBubble]}>
          <View style={styles.bubbleHeader}>
            <Text style={styles.bubbleAuthor}>Vous</Text>
            <View style={styles.pendingTag}>
              <Feather name="clock" size={10} color={colors.textMuted} />
              <Text style={styles.pendingTagText}>En attente</Text>
            </View>
          </View>
          {uri ? (
            <Image source={{ uri }} style={styles.bubblePhoto} />
          ) : (
            <View style={[styles.bubblePhoto, styles.bubblePhotoPlaceholder]}>
              <ActivityIndicator color={colors.textMuted} />
            </View>
          )}
          {photo.caption ? <Text style={styles.bubbleCaption}>{photo.caption}</Text> : null}
          <Text style={styles.pendingHint}>S'enverra automatiquement dès que le réseau revient</Text>
        </View>
      </View>
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

      {offline ? (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={13} color={colors.textMuted} />
          <Text style={styles.offlineBannerText}>
            Hors-ligne
            {pendingLocal.length > 0
              ? ` — ${pendingLocal.length} photo${pendingLocal.length > 1 ? 's' : ''} en attente`
              : ''}
          </Text>
        </View>
      ) : null}

      {entries.length === 0 && pendingLocal.length === 0 && !loading ? (
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
          keyExtractor={(item) => (item.kind === 'entry' ? item.entry.id : `pending-${item.photo.id}`)}
          renderItem={({ item }) => (item.kind === 'entry' ? renderEntry(item.entry) : renderPendingPhoto(item.photo))}
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

      {!selecting && stagedPhotos.length > 0 ? (
        <Pressable
          style={[styles.stackIndicator, { bottom: composerHeight + spacing.sm }]}
          onPress={openStackReview}
        >
          {stagedPhotos.slice(-3).map((p, i) => (
            <Image
              key={p.id}
              source={{ uri: p.uri }}
              style={[styles.stackThumb, { left: i * 9, bottom: i * 5, zIndex: i }]}
            />
          ))}
          <View style={styles.stackBadge}>
            <Text style={styles.stackBadgeText}>{stagedPhotos.length}</Text>
          </View>
        </Pressable>
      ) : null}

      {!selecting ? (
        <View style={styles.composer} onLayout={(e) => setComposerHeight(e.nativeEvent.layout.height)}>
          {voiceRecorder.recording ? (
            <View style={styles.recordingRow}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>{formatDuration(voiceRecorder.elapsedSeconds)}</Text>
              <Text style={styles.recordingHint}>Enregistrement…</Text>
              <View style={{ flex: 1 }} />
              <Pressable style={styles.recordingCancelButton} onPress={cancelVoiceRecording} hitSlop={8}>
                <Feather name="trash-2" size={16} color={colors.danger} />
              </Pressable>
              <Pressable
                style={styles.composerSend}
                onPress={stopAndSendVoice}
                disabled={sendingVoice}
                hitSlop={8}
              >
                {sendingVoice ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="send" size={16} color="#fff" />}
              </Pressable>
            </View>
          ) : (
            <>
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
                <Pressable style={styles.composerIconButton} onPress={startVoiceRecording} disabled={sending}>
                  <Feather name="mic" size={18} color={colors.text} />
                </Pressable>
                <Pressable
                  style={[styles.composerSend, (!text.trim() || sending) && styles.composerSendDisabled]}
                  onPress={sendNote}
                  disabled={!text.trim() || sending}
                >
                  {sending ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="send" size={16} color="#fff" />}
                </Pressable>
              </View>
            </>
          )}
          {voiceError ? <Text style={styles.error}>{voiceError}</Text> : null}
        </View>
      ) : null}

      {/* Quick single-photo popup, shown immediately after the shutter — a
          caption, a send button, and a camera button to rapid-fire another
          shot without having to caption every single frame. */}
      <Modal
        visible={!!quickPhoto}
        animationType="fade"
        transparent
        onRequestClose={stashQuickPhoto}
      >
        <View style={styles.quickOverlay}>
          <Pressable style={styles.quickClose} onPress={stashQuickPhoto} hitSlop={10}>
            <Feather name="x" size={22} color="#fff" />
          </Pressable>
          {stagedPhotos.length > 0 ? (
            <Pressable
              style={styles.quickStackHint}
              onPress={() => {
                stashQuickPhoto();
                openStackReview();
              }}
            >
              <Feather name="layers" size={13} color="#fff" />
              <Text style={styles.quickStackHintText}>
                {stagedPhotos.length} en attente
              </Text>
            </Pressable>
          ) : null}
          {quickPhoto ? <Image source={{ uri: quickPhoto.uri }} style={styles.quickImage} resizeMode="contain" /> : null}
          <View style={styles.quickFooter}>
            {quickError ? <Text style={styles.quickErrorText}>{quickError}</Text> : null}
            <TextInput
              style={styles.quickCaptionInput}
              value={quickPhoto?.caption ?? ''}
              onChangeText={updateQuickCaption}
              placeholder="Ajouter une légende…"
              placeholderTextColor="rgba(255,255,255,0.55)"
            />
            <View style={styles.quickActions}>
              <Pressable style={styles.quickCameraButton} onPress={retakeFromQuick} disabled={quickSending}>
                <Feather name="camera" size={20} color={colors.text} />
              </Pressable>
              <Pressable
                style={[styles.quickSendButton, quickSending && styles.composerSendDisabled]}
                onPress={sendQuickPhoto}
                disabled={quickSending}
              >
                {quickSending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name="send" size={16} color="#fff" />
                    <Text style={styles.quickSendText}>Envoyer</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Swipeable review of the staged stack — caption or delete each
          photo, then send them all at once. */}
      <Modal
        visible={showStackReview}
        animationType="slide"
        onRequestClose={() => setShowStackReview(false)}
        onShow={() => reviewScrollRef.current?.scrollTo({ x: reviewIndex * winWidth, animated: false })}
      >
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeader}>
            <Pressable onPress={() => setShowStackReview(false)} hitSlop={8}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.reviewCounter}>
              {stagedPhotos.length > 0 ? `${reviewIndex + 1} / ${stagedPhotos.length}` : ''}
            </Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView
            ref={reviewScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / winWidth);
              setReviewIndex(idx);
            }}
          >
            {stagedPhotos.map((photo, i) => (
              <View key={photo.id} style={[styles.reviewPage, { width: winWidth }]}>
                <Image source={{ uri: photo.uri }} style={styles.reviewImage} resizeMode="contain" />
                <View style={styles.reviewFooter}>
                  <TextInput
                    style={styles.reviewCaptionInput}
                    value={photo.caption}
                    onChangeText={(t) => updateStagedCaption(photo.id, t)}
                    placeholder={`Légende photo ${i + 1} (optionnel)`}
                    placeholderTextColor={colors.textMuted}
                  />
                  <Pressable
                    style={styles.reviewDeleteButton}
                    onPress={() => removeStagedPhoto(photo.id)}
                    disabled={sendingPhotos}
                  >
                    <Feather name="trash-2" size={16} color={colors.danger} />
                    <Text style={styles.reviewDeleteText}>Supprimer</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
          {error ? <Text style={[styles.error, { paddingHorizontal: spacing.lg }]}>{error}</Text> : null}
          <View style={styles.reviewBottomActions}>
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
            style={styles.reviewSendButton}
          />
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
  avatarBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  avatarBubbleFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBubbleInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
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
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 160,
  },
  voicePlayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  voiceWave: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  voiceDuration: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  voiceTranscript: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  offlineBannerText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  bubblePendingBubble: {
    opacity: 0.7,
  },
  pendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pendingTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pendingHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  stackIndicator: {
    position: 'absolute',
    left: spacing.lg,
    width: 66,
    height: 60,
    zIndex: 5,
  },
  stackThumb: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.bg,
    backgroundColor: colors.surfaceAlt,
  },
  stackBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stackBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
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
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 40,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  recordingTime: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  recordingHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  recordingCancelButton: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  quickOverlay: {
    flex: 1,
    backgroundColor: '#0B0B0BEE',
    justifyContent: 'center',
  },
  quickClose: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  quickStackHint: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.lg,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  quickStackHintText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  quickImage: {
    width: '100%',
    height: '68%',
  },
  quickFooter: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  quickErrorText: {
    color: '#FF8A80',
    fontSize: fontSize.sm,
  },
  quickCaptionInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickCameraButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  quickSendButton: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  quickSendText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#fff',
  },
  reviewContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  reviewCounter: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  reviewPage: {
    flex: 1,
  },
  reviewImage: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  reviewCaptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  reviewDeleteButton: {
    alignItems: 'center',
    gap: 2,
  },
  reviewDeleteText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '600',
  },
  reviewBottomActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
  reviewSendButton: {
    margin: spacing.lg,
  },
});
