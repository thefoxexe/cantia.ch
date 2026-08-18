import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Container, Screen } from '../../components/ui';
import { MarketingFooter, MarketingNav } from '../../components/MarketingChrome';
import { TUTORIAL_VIDEOS } from '../../lib/tutorialVideos';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

// Public tutorial/demo library, one card per module — reachable from the
// Centre d'aide. Only videos with a youtubeId filled in (see
// lib/tutorialVideos.ts) ever render as a card; until at least one exists,
// the page shows a single "in production" notice instead of a grid of
// individually-pending placeholders.
export default function TutorialVideosScreen() {
  const available = TUTORIAL_VIDEOS.filter((v) => v.youtubeId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MarketingNav />

        <Container style={styles.container}>
          <Link href="/aide" style={styles.backLink}>
            <Feather name="arrow-left" size={14} color={colors.textMuted} />
            <Text style={styles.backLinkText}>Centre d'aide</Text>
          </Link>
          <Text style={styles.title}>Tutoriels & démos</Text>
          <Text style={styles.lead}>
            De courtes vidéos pour voir chaque module en action — prise en main, formation d'une nouvelle recrue,
            ou juste un aperçu avant de s'inscrire.
          </Text>

          {available.length === 0 ? (
            <View style={styles.notice}>
              <Feather name="film" size={22} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>Vidéos en préparation</Text>
                <Text style={styles.noticeText}>
                  Une vidéo de présentation par module est en cours de tournage. Elles seront disponibles ici
                  courant septembre.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.grid}>
              {available.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </View>
          )}
        </Container>

        <MarketingFooter />
      </ScrollView>
    </Screen>
  );
}

function VideoCard({ video }: { video: (typeof TUTORIAL_VIDEOS)[number] }) {
  const thumbnail = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <Pressable onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${video.youtubeId}`)} style={styles.card}>
      <View style={styles.thumb}>
        <Image source={{ uri: thumbnail }} style={styles.thumbImage} resizeMode="cover" />
        <View style={styles.playBadge}>
          <Feather name="play" size={14} color="#fff" />
        </View>
      </View>
      <Text style={styles.cardTitle}>{video.title}</Text>
      <Text style={styles.cardText}>{video.description}</Text>
    </Pressable>
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
    color: colors.textMuted,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  lead: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    maxWidth: 560,
    lineHeight: 22,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    maxWidth: 560,
  },
  noticeTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  noticeText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 19,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  card: {
    width: 280,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  thumb: {
    height: 140,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  cardText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
  },
});
