import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { deleteSocialPost, listSocialPosts, upsertSocialPost } from '../../../lib/api/admin';
import { generateSocialPostDataUrl, SOCIAL_FORMAT_LABEL, type SocialFormat } from '../../../lib/socialPostGenerator';
import { downloadFile } from '../../../lib/downloadFile';
import type { AdminSocialPost, SocialPostStatus } from '../../../lib/types';

const STATUS_ORDER: SocialPostStatus[] = ['idee', 'pret', 'publie'];
const STATUS_LABEL: Record<SocialPostStatus, string> = {
  idee: 'Idée',
  pret: 'Prêt',
  publie: 'Publié',
};
const STATUS_COLOR: Record<SocialPostStatus, { fg: string; bg: string }> = {
  idee: { fg: colors.textMuted, bg: colors.border },
  pret: { fg: colors.primary, bg: colors.primarySoft },
  publie: { fg: colors.success, bg: colors.successSoft },
};

type Draft = {
  topic: string;
  headline: string;
  subheadline: string;
  instagram_caption: string;
  linkedin_caption: string;
  status: SocialPostStatus;
  notes: string;
};

function draftFrom(p: AdminSocialPost): Draft {
  return {
    topic: p.topic,
    headline: p.headline,
    subheadline: p.subheadline,
    instagram_caption: p.instagram_caption,
    linkedin_caption: p.linkedin_caption,
    status: p.status,
    notes: p.notes ?? '',
  };
}

const BLANK_DRAFT: Draft = {
  topic: '',
  headline: '',
  subheadline: '',
  instagram_caption: '',
  linkedin_caption: '',
  status: 'idee',
  notes: '',
};

function slugify(text: string): string {
  return text
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

// Regenerates both visuals from the live draft (not the saved row), so a
// preview updates as soon as headline/subheadline/topic changes — a
// deliberate design decision described in the migration: the visuals are
// never stored, only derived, so there's nothing to keep in sync.
function PreviewPane({ format, draft, slug }: { format: SocialFormat; draft: Draft; slug: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setGenerating(true);
    generateSocialPostDataUrl({ topic: draft.topic, headline: draft.headline, subheadline: draft.subheadline }, format).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
        setGenerating(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, draft.topic, draft.headline, draft.subheadline]);

  async function handleDownload() {
    if (!dataUrl) return;
    await downloadFile(dataUrl, `cantia-social-${format}-${slug || 'post'}.png`);
  }

  return (
    <View style={styles.previewCol}>
      <Text style={styles.previewLabel}>{SOCIAL_FORMAT_LABEL[format]}</Text>
      <View style={[styles.previewFrame, format === 'instagram' ? styles.previewFrameTall : styles.previewFrameWide]}>
        {generating ? (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderText}>Génération…</Text>
          </View>
        ) : dataUrl ? (
          <Image source={{ uri: dataUrl }} style={StyleSheet.absoluteFill as any} resizeMode="contain" />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderText}>Disponible sur web</Text>
          </View>
        )}
      </View>
      <Pressable style={[styles.downloadButton, !dataUrl && styles.downloadButtonDisabled]} onPress={handleDownload} disabled={!dataUrl}>
        <Feather name="download" size={13} color="#fff" />
        <Text style={styles.downloadButtonText}>Télécharger le visuel</Text>
      </Pressable>
    </View>
  );
}

export default function AdminSocialScreen() {
  const [posts, setPosts] = useState<AdminSocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { rows, error: err } = await listSocialPosts();
    setPosts(rows);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openExisting(p: AdminSocialPost) {
    setExpandedId(p.id);
    setDraft(draftFrom(p));
  }

  function openNew() {
    setExpandedId('new');
    setDraft(BLANK_DRAFT);
  }

  async function save(id: string | 'new') {
    if (!draft.topic.trim() || !draft.headline.trim()) return;
    setSaving(true);
    const existing = id !== 'new' ? posts.find((p) => p.id === id) : null;
    const orderIndex = existing ? existing.order_index : posts.length ? Math.max(...posts.map((p) => p.order_index)) + 1 : 1;
    const { post, error: err } = await upsertSocialPost({
      id: existing?.id ?? null,
      order_index: orderIndex,
      topic: draft.topic.trim(),
      headline: draft.headline.trim(),
      subheadline: draft.subheadline.trim(),
      instagram_caption: draft.instagram_caption,
      linkedin_caption: draft.linkedin_caption,
      status: draft.status,
      notes: draft.notes.trim() || null,
    });
    if (!err && post) {
      setPosts((prev) => {
        const withoutOld = prev.filter((p) => p.id !== post.id);
        return [...withoutOld, post].sort((a, b) => a.order_index - b.order_index);
      });
      setExpandedId(null);
    } else if (err) {
      setError(err);
    }
    setSaving(false);
  }

  async function remove(id: string) {
    setSaving(true);
    const { error: err } = await deleteSocialPost(id);
    if (!err) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setExpandedId(null);
    } else {
      setError(err);
    }
    setSaving(false);
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Réseaux sociaux</Text>
            <Text style={styles.hint}>
              Un post par sujet, avec un visuel généré automatiquement dans chaque format (Instagram 4:5, LinkedIn 1200×627) et un
              texte adapté au ton de chaque réseau.
            </Text>
          </View>
          <AdminRefreshButton onPress={load} loading={loading} />
        </View>

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : posts.length === 0 ? (
          <EmptyState title="Aucun post pour l'instant" subtitle="Ajoute le premier ci-dessous." />
        ) : (
          <View style={styles.list}>
            {posts.map((p) => {
              const open = expandedId === p.id;
              const statusColor = STATUS_COLOR[p.status];
              const activeDraft = open ? draft : draftFrom(p);
              return (
                <View key={p.id} style={styles.card}>
                  <Pressable style={styles.row} onPress={() => (open ? setExpandedId(null) : openExisting(p))}>
                    <Text style={styles.orderBadge}>{p.order_index}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTopic}>{p.topic}</Text>
                      <Text style={styles.rowTitle} numberOfLines={open ? undefined : 1}>
                        {p.headline.replace('\\n', ' ')}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.pillText, { color: statusColor.fg }]}>{STATUS_LABEL[p.status]}</Text>
                    </View>
                    <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                  </Pressable>

                  {open ? (
                    <PostEditor
                      draft={activeDraft}
                      setDraft={setDraft}
                      saving={saving}
                      slug={slugify(p.topic)}
                      onSave={() => save(p.id)}
                      onDelete={() => remove(p.id)}
                      onCancel={() => setExpandedId(null)}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {expandedId === 'new' ? (
          <View style={[styles.card, styles.newCard]}>
            <Text style={styles.groupTitle}>Nouveau post</Text>
            <PostEditor
              draft={draft}
              setDraft={setDraft}
              saving={saving}
              slug={slugify(draft.topic)}
              onSave={() => save('new')}
              onCancel={() => setExpandedId(null)}
            />
          </View>
        ) : (
          <Pressable style={styles.addButton} onPress={openNew}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>Ajouter un post</Text>
          </Pressable>
        )}
      </Container>
    </ScrollView>
  );
}

function PostEditor({
  draft,
  setDraft,
  saving,
  slug,
  onSave,
  onDelete,
  onCancel,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  saving: boolean;
  slug: string;
  onSave: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.editor}>
      <View style={styles.previewRow}>
        <PreviewPane format="instagram" draft={draft} slug={slug} />
        <PreviewPane format="linkedin" draft={draft} slug={slug} />
      </View>

      <View style={styles.editorRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Sujet</Text>
          <TextInput
            value={draft.topic}
            onChangeText={(v) => setDraft({ ...draft, topic: v })}
            style={styles.input}
            placeholder="Ex. Devis à la voix"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.statusRow}>
          {STATUS_ORDER.map((s) => {
            const active = draft.status === s;
            const c = STATUS_COLOR[s];
            return (
              <Pressable
                key={s}
                onPress={() => setDraft({ ...draft, status: s })}
                style={[styles.statusChip, { backgroundColor: active ? c.bg : colors.bg, borderColor: active ? c.fg : colors.border }]}
              >
                <Text style={[styles.statusChipText, { color: active ? c.fg : colors.textMuted }]}>{STATUS_LABEL[s]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.fieldLabel}>Titre principal (accroche visuelle — utiliser \n pour une 2e ligne en orange)</Text>
      <TextInput
        value={draft.headline}
        onChangeText={(v) => setDraft({ ...draft, headline: v })}
        style={styles.input}
        placeholder="Ex. Un devis. Trois minutes."
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.fieldLabel}>Sous-titre (phrase d'appui, affichée sous le titre)</Text>
      <TextInput
        value={draft.subheadline}
        onChangeText={(v) => setDraft({ ...draft, subheadline: v })}
        style={styles.input}
        placeholder="Ex. Dictez sur le chantier, Cantia rédige le reste."
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.captionBlock}>
        <View style={styles.captionHeader}>
          <Text style={styles.fieldLabel}>Texte Instagram (ton direct, emojis, hashtags)</Text>
          {draft.instagram_caption ? <CopyButton text={draft.instagram_caption} /> : null}
        </View>
        <TextInput
          value={draft.instagram_caption}
          onChangeText={(v) => setDraft({ ...draft, instagram_caption: v })}
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={8}
          placeholder="Légende à coller sous le post Instagram"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.captionBlock}>
        <View style={styles.captionHeader}>
          <Text style={styles.fieldLabel}>Texte LinkedIn (ton pro, orienté valeur/ROI)</Text>
          {draft.linkedin_caption ? <CopyButton text={draft.linkedin_caption} /> : null}
        </View>
        <TextInput
          value={draft.linkedin_caption}
          onChangeText={(v) => setDraft({ ...draft, linkedin_caption: v })}
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={8}
          placeholder="Texte à coller sous le post LinkedIn"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <Text style={styles.fieldLabel}>Notes</Text>
      <TextInput
        value={draft.notes}
        onChangeText={(v) => setDraft({ ...draft, notes: v })}
        style={[styles.input, styles.textareaSmall]}
        multiline
        numberOfLines={2}
        placeholder="Optionnel — ex. date de publication prévue"
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.editorActions}>
        {onDelete ? (
          <Pressable style={styles.deleteButton} onPress={onDelete} disabled={saving}>
            <Feather name="trash-2" size={14} color={colors.danger} />
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <View style={styles.editorActionsRight}>
          <Pressable style={styles.cancelButton} onPress={onCancel} disabled={saving}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={onSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    maxWidth: 560,
  },
  list: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  newCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  orderBadge: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    width: 20,
  },
  rowTopic: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  editor: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  previewCol: {
    minWidth: 220,
    flex: 1,
    gap: 6,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewFrame: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  previewFrameTall: {
    aspectRatio: 4 / 5,
  },
  previewFrameWide: {
    aspectRatio: 1200 / 627,
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholderText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  editorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  textarea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  textareaSmall: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  captionBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 4,
  },
  captionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  editorActionsRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.danger,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
});
