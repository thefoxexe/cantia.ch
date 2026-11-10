import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../../components/ui';
import { Heading } from '../../components/Heading';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { site } from '../../lib/siteTheme';

const DM = "'DM Sans', 'DM Sans Fallback', Arial, sans-serif";

interface PublicTutorialVideo {
  id: string;
  title: string;
  public_description: string | null;
  youtube_url: string;
}

// Pulls straight from the same tutorial_chapters table the admin Tutoriels
// page manages (public_list_tutorial_videos, RLS-free RPC) — a chapter
// shows up here the moment its YouTube link is set and "Intégré sur le
// site" is flipped on, nothing else to wire.
function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Public tutorial/demo library, one card per module — reachable from the
// Centre d'aide. Only chapters with a YouTube link AND "Intégré sur le
// site" checked in the admin panel ever render as a card; until at least
// one exists, the page shows a single "in production" notice instead of a
// grid of individually-pending placeholders.
type Video = PublicTutorialVideo & { youtubeId: string };

export default function TutorialVideosScreen() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<PublicTutorialVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState<Video | null>(null);
  const aideHref = getAppLocale() === 'de' ? '/de/aide' : getAppLocale() === 'it' ? '/it/aide' : '/aide';

  useEffect(() => {
    supabase
      .rpc('public_list_tutorial_videos')
      .then(({ data }) => {
        setVideos((data ?? []) as PublicTutorialVideo[]);
        setLoading(false);
      });
  }, []);

  const available = useMemo(
    () =>
      videos
        .map((v) => ({ ...v, youtubeId: extractYoutubeId(v.youtube_url) }))
        .filter((v): v is Video => !!v.youtubeId),
    [videos],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return available;
    return available.filter((v) => v.title.toLowerCase().includes(q) || (v.public_description ?? '').toLowerCase().includes(q));
  }, [available, search]);

  // Web plays the video right here, in a lightbox — a visitor asking "does
  // this feature do X" shouldn't have to leave the site to find out. Native
  // has no equivalent lightweight in-app player wired up, so it falls back
  // to opening YouTube directly (see VideoCard's onPress below).
  function openVideo(video: Video) {
    if (Platform.OS === 'web') setPlaying(video);
    else Linking.openURL(`https://www.youtube.com/watch?v=${video.youtubeId}`);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <Link href={aideHref as any} style={styles.backLink}>
            <Feather name="arrow-left" size={14} color={site.muted} />
            <Text style={styles.backLinkText}>{t('aideVideosPage.backLink')}</Text>
          </Link>
          <Heading level={1} style={styles.title}>{t('aideVideosPage.title')}</Heading>
          <Text style={styles.lead}>{t('aideVideosPage.lead')}</Text>

          <Pressable
            onPress={() => Linking.openURL('https://www.youtube.com/@Cantiach')}
            style={styles.channelLink}
          >
            <Feather name="youtube" size={16} color={site.copper} />
            <Text style={styles.channelLinkText}>{t('aideVideosPage.channelLink')}</Text>
            <Feather name="external-link" size={13} color={site.copper} />
          </Pressable>

          {loading ? null : available.length === 0 ? (
            <View style={styles.notice}>
              <Feather name="film" size={22} color={site.copper} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>{t('aideVideosPage.noticeTitle')}</Text>
                <Text style={styles.noticeText}>{t('aideVideosPage.noticeText')}</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.searchBar}>
                <Feather name="search" size={16} color={site.muted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t('aideVideosPage.searchPlaceholder')}
                  placeholderTextColor={site.muted}
                  style={styles.searchInput}
                />
                {search ? (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <Feather name="x" size={16} color={site.muted} />
                  </Pressable>
                ) : null}
              </View>

              {filtered.length === 0 ? (
                <Text style={styles.noResults}>{t('aideVideosPage.noResults', { query: search })}</Text>
              ) : (
                <View style={styles.grid}>
                  {filtered.map((video) => (
                    <VideoCard key={video.id} video={video} onPress={() => openVideo(video)} />
                  ))}
                </View>
              )}
            </>
          )}
        </Container>

        <MarketingFooter />
      </ScrollView>

      <VideoPlayerModal video={playing} onClose={() => setPlaying(null)} />
    </Screen>
  );
}

function VideoCard({ video, onPress }: { video: Video; onPress: () => void }) {
  const thumbnail = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.thumb}>
        <Image source={{ uri: thumbnail }} style={styles.thumbImage} resizeMode="cover" accessibilityLabel={video.title} />
        <View style={styles.playBadge}>
          <Feather name="play" size={14} color="#fff" />
        </View>
      </View>
      <Text style={styles.cardTitle}>{video.title}</Text>
      {video.public_description ? <Text style={styles.cardText}>{video.public_description}</Text> : null}
    </Pressable>
  );
}

// Web-only lightbox (see openVideo above — native never sets `playing`, so
// this modal never opens there, but the iframe itself still stays guarded
// by Platform.OS since RN has no such host component at all.
function VideoPlayerModal({ video, onClose }: { video: Video | null; onClose: () => void }) {
  return (
    <Modal visible={!!video} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {video?.title}
            </Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.modalCloseButton}>
              <Feather name="x" size={18} color={site.ink} />
            </Pressable>
          </View>
          <View style={styles.modalPlayer}>
            {video && Platform.OS === 'web' ? (
              // A raw DOM iframe — RN Web renders it as-is; no native
              // equivalent needed since this modal only ever opens on web
              // (see openVideo above).
              <iframe
                key={video.id}
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                style={{ border: 0, width: '100%', height: '100%' }}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  container: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  backLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: site.muted,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: site.ink,
  },
  lead: {
    fontSize: fontSize.md,
    color: site.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    maxWidth: 560,
    lineHeight: 22,
  },
  channelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  channelLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: site.copper,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#f3e6da',
    borderRadius: 3,
    padding: spacing.lg,
    maxWidth: 560,
  },
  noticeTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: site.ink,
  },
  noticeText: {
    fontSize: fontSize.sm,
    color: site.muted,
    marginTop: 2,
    lineHeight: 19,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 360,
    borderWidth: 1,
    borderColor: site.line,
    backgroundColor: site.white,
    borderRadius: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: site.ink,
  },
  noResults: {
    fontSize: fontSize.sm,
    color: site.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  card: {
    width: 280,
    borderWidth: 1,
    borderColor: site.line,
    backgroundColor: site.white,
    borderRadius: 3,
    padding: spacing.md,
    gap: spacing.xs,
  },
  thumb: {
    height: 140,
    borderRadius: 3,
    backgroundColor: '#efede5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: site.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: site.ink,
  },
  cardText: {
    fontSize: fontSize.sm,
    color: site.muted,
    lineHeight: 19,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 8, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: site.white,
    borderRadius: 3,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: site.line,
  },
  modalTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: site.ink,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efede5',
  },
  modalPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
});
