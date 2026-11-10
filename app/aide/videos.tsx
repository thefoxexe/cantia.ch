import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Eyebrow, Headline, Hover, Wrap } from '../../components/site/Primitives';
import { Breadcrumbs, SitePage, useSiteLayout } from '../../components/site/Sections';
import { HeroDevices } from '../../components/site/HeroDevices';
import { SITE_PAGES } from '../../lib/site/pages';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { getAppLocale, useTranslation } from '../../lib/translations';
import { sans, site } from '../../lib/siteTheme';

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

  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const { phone, width } = useSiteLayout();
  const L = SITE_PAGES[locale].labels;
  return (
    <SitePage title={`${t('aideVideosPage.title')} | Cantia`} description={t('aideVideosPage.lead')}>
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 50 : 80 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: L.home, href: locale === 'fr' ? '/' : `/${locale}` }, { label: t('aideVideosPage.backLink'), href: aideHref }, { label: t('aideVideosPage.title') }]} />
          <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>{t('aideVideosPage.backLink')}</Eyebrow>
          <Headline level={1} plain={t('aideVideosPage.title')} size={phone ? 42 : 56} style={{ marginTop: 16, marginBottom: 18 }} />
          <Text style={[sans, styles.lead]}>{t('aideVideosPage.lead')}</Text>
          <Hover onPress={() => Linking.openURL('https://www.youtube.com/@Cantiach')} accessibilityRole="link" base={styles.channel} hover={{ opacity: 0.7 }}>
            <Feather name="youtube" size={16} color={site.copper} />
            <Text style={[sans, styles.channelText]}>{t('aideVideosPage.channelLink')}</Text>
            <Feather name="external-link" size={13} color={site.copper} />
          </Hover>

          {loading ? null : available.length === 0 ? (
            <View style={{ marginTop: 44 }}>
              <View style={styles.notice}>
                <Feather name="film" size={20} color={site.copper} />
                <View style={{ flex: 1 }}>
                  <Text style={[sans, styles.noticeTitle]}>{t('aideVideosPage.noticeTitle')}</Text>
                  <Text style={[sans, styles.noticeText]}>{t('aideVideosPage.noticeText')}</Text>
                </View>
              </View>
              <View style={{ marginTop: 40, maxWidth: 980, width: '100%', alignSelf: 'center' }}>
                <HeroDevices locale={locale} phoneOnly={phone} labels={{ desktop: L.appAlt, phone: L.appAlt, note: `${L.appScreen} · ${L.sample}` }} />
              </View>
            </View>
          ) : (
            <View style={{ marginTop: 40 }}>
              <View style={styles.search}>
                <Feather name="search" size={16} color={site.muted} />
                <TextInput value={search} onChangeText={setSearch} placeholder={t('aideVideosPage.searchPlaceholder')} placeholderTextColor="#a1a697" style={[sans, styles.searchInput]} />
                {search ? (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <Feather name="x" size={16} color={site.muted} />
                  </Pressable>
                ) : null}
              </View>
              {filtered.length === 0 ? (
                <Text style={[sans, styles.noResults]}>{t('aideVideosPage.noResults', { query: search })}</Text>
              ) : (
                <View style={styles.grid}>
                  {filtered.map((video) => (
                    <View key={video.id} style={{ width: phone ? '100%' : width <= 900 ? '48%' : '31.5%' }}>
                      <VideoCard video={video} onPress={() => openVideo(video)} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </Wrap>
      </View>
      <VideoPlayerModal video={playing} onClose={() => setPlaying(null)} />
    </SitePage>
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
  lead: { fontSize: 15, color: site.muted, lineHeight: 26, maxWidth: 620 },
  channel: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 22, alignSelf: 'flex-start' },
  channelText: { fontSize: 12, color: site.copper, fontWeight: '600' },
  notice: { flexDirection: 'row', gap: 16, padding: 22, borderRadius: 8, backgroundColor: '#e7d8c5', maxWidth: 760 },
  noticeTitle: { fontSize: 16, color: site.ink, fontWeight: '500' },
  noticeText: { fontSize: 13, color: '#6e6352', lineHeight: 21, marginTop: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, maxWidth: 560, height: 50, paddingHorizontal: 16, borderWidth: 1, borderColor: '#d7dacf', borderRadius: 8, backgroundColor: site.white },
  searchInput: { flex: 1, fontSize: 14, color: site.ink, outlineStyle: 'none' } as object,
  noResults: { fontSize: 13, color: site.muted, marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 26, marginTop: 30 },
  card: { borderWidth: 1, borderColor: site.line, borderRadius: 8, overflow: 'hidden', backgroundColor: site.white },
  thumb: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#e7e4d8' },
  thumbImage: { width: '100%', height: '100%' },
  playBadge: { position: 'absolute', left: 14, bottom: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: site.copper, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, color: site.ink, fontWeight: '500', paddingHorizontal: 16, paddingTop: 14 },
  cardText: { fontSize: 12, color: site.muted, lineHeight: 19, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(31,36,28,0.72)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 960, backgroundColor: site.white, borderRadius: 10, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: site.line },
  modalTitle: { flex: 1, fontSize: 14, color: site.ink, fontWeight: '500', fontFamily: DM },
  modalCloseButton: { padding: 4 },
  modalPlayer: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
});
