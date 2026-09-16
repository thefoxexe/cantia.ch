import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listTutorialChapters } from '../../../lib/api/admin';
import { generateThumbnailDataUrl } from '../../../lib/thumbnailGenerator';
import { buildYoutubeDescription, buildYoutubeTitle } from '../../../lib/tutorialYoutubeDescription';
import { downloadFile } from '../../../lib/downloadFile';
import type { AdminTutorialChapter } from '../../../lib/types';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <Pressable style={styles.copyButton} onPress={handleCopy}>
      <Feather name={copied ? 'check' : 'copy'} size={13} color={copied ? colors.success : colors.primary} />
      <Text style={[styles.copyButtonText, copied && { color: colors.success }]}>{copied ? 'Copié' : 'Copier'}</Text>
    </Pressable>
  );
}

function ChapterCard({ chapter }: { chapter: AdminTutorialChapter }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setGenerating(true);
    generateThumbnailDataUrl(chapter.title, chapter.feature_area).then((url) => {
      if (!cancelled) {
        setThumb(url);
        setGenerating(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [chapter.title, chapter.feature_area]);

  async function handleDownload() {
    if (!thumb) return;
    await downloadFile(thumb, `cantia-miniature-${slugify(chapter.title)}.png`);
  }

  const youtubeTitle = buildYoutubeTitle(chapter);
  const youtubeDescription = buildYoutubeDescription(chapter);

  return (
    <View style={styles.card}>
      <View style={styles.thumbRow}>
        <View style={styles.thumbWrap}>
          {generating ? (
            <View style={[styles.thumbPreview, styles.thumbPlaceholder]}>
              <Text style={styles.thumbPlaceholderText}>Génération…</Text>
            </View>
          ) : thumb ? (
            <Image source={{ uri: thumb }} style={styles.thumbPreview} resizeMode="cover" />
          ) : (
            <View style={[styles.thumbPreview, styles.thumbPlaceholder]}>
              <Text style={styles.thumbPlaceholderText}>Disponible sur web</Text>
            </View>
          )}
        </View>
        <View style={styles.thumbInfo}>
          <Text style={styles.eyebrow}>{chapter.feature_area}</Text>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.thumbHint}>Format YouTube 1280×720 — logo, nom Cantia et titre appliqués automatiquement.</Text>
          <Pressable style={[styles.downloadButton, !thumb && styles.downloadButtonDisabled]} onPress={handleDownload} disabled={!thumb}>
            <Feather name="download" size={14} color="#fff" />
            <Text style={styles.downloadButtonText}>Télécharger la miniature</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.descBlock}>
        <View style={styles.descHeader}>
          <Text style={styles.descLabel}>Titre YouTube (optimisé recherche, à copier-coller)</Text>
          <CopyButton text={youtubeTitle} />
        </View>
        <Text style={styles.titleText}>{youtubeTitle}</Text>
      </View>

      <View style={styles.descBlock}>
        <View style={styles.descHeader}>
          <Text style={styles.descLabel}>Description YouTube (à copier-coller)</Text>
          <CopyButton text={youtubeDescription} />
        </View>
        <Text style={styles.descText}>{youtubeDescription}</Text>
      </View>

      <View style={styles.descBlock}>
        <View style={styles.descHeader}>
          <Text style={styles.descLabel}>Description app (visible sur /aide/videos)</Text>
          {chapter.public_description ? <CopyButton text={chapter.public_description} /> : null}
        </View>
        {chapter.public_description ? (
          <Text style={styles.descText}>{chapter.public_description}</Text>
        ) : (
          <Text style={styles.descEmpty}>Pas encore renseignée — à ajouter depuis la fiche du chapitre sur la page Tutoriels.</Text>
        )}
      </View>
    </View>
  );
}

// Deux jobs distincts pour un même chapitre : la miniature (image 1280×720
// au format YouTube, générée au chargement via canvas — voir
// lib/thumbnailGenerator.ts) et la description YouTube (texte prêt à
// coller, dérivé des mêmes talking_points que le script de tournage — voir
// lib/tutorialYoutubeDescription.ts). La description "app" reste ce qui
// existait déjà (public_description, éditée depuis la page Tutoriels) : ce
// n'est pas la même chose, donc pas fusionnée avec la description YouTube.
export default function AdminTutorialThumbnailsScreen() {
  const [chapters, setChapters] = useState<AdminTutorialChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { rows, error: err } = await listTutorialChapters();
    setChapters(rows);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <View>
            <Link href="/(admin)/tutoriels" asChild>
              <Pressable style={styles.back} hitSlop={8}>
                <Feather name="arrow-left" size={14} color={colors.textMuted} />
                <Text style={styles.backText}>Tutoriels</Text>
              </Pressable>
            </Link>
            <Text style={styles.title}>Miniatures & descriptions</Text>
            <Text style={styles.hint}>
              Une miniature au format YouTube et une description prête à coller, générées à partir de chaque chapitre.
            </Text>
          </View>
          <AdminRefreshButton onPress={load} loading={loading} />
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : chapters.length === 0 ? (
          <EmptyState title="Aucun chapitre pour l'instant" subtitle="Ajoute des chapitres depuis la page Tutoriels." />
        ) : (
          <View style={styles.list}>
            {chapters.map((c) => (
              <ChapterCard key={c.id} chapter={c} />
            ))}
          </View>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  backText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    maxWidth: 520,
  },
  list: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  thumbWrap: {
    width: 320,
  },
  thumbPreview: {
    width: 320,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  thumbPlaceholderText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  thumbInfo: {
    flex: 1,
    minWidth: 220,
    gap: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  thumbHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  descBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 6,
  },
  descHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  descText: {
    fontSize: fontSize.xs,
    color: colors.text,
    lineHeight: 18,
  },
  titleText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  descEmpty: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
