import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container, EmptyState, LoadingScreen, Switch } from '../../../components/ui';
import { AdminErrorBanner } from '../../../components/AdminErrorBanner';
import { AdminRefreshButton } from '../../../components/AdminRefreshButton';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { deleteTutorialChapter, listTutorialChapters, upsertTutorialChapter } from '../../../lib/api/admin';
import type { AdminTutorialChapter, TutorialChapterStatus } from '../../../lib/types';

const STATUS_ORDER: TutorialChapterStatus[] = ['a_faire', 'tourne', 'monte', 'publie'];
const STATUS_LABEL: Record<TutorialChapterStatus, string> = {
  a_faire: 'À faire',
  tourne: 'Tourné',
  monte: 'Monté',
  publie: 'Publié',
};
const STATUS_COLOR: Record<TutorialChapterStatus, { fg: string; bg: string }> = {
  a_faire: { fg: colors.textMuted, bg: colors.border },
  tourne: { fg: colors.primary, bg: colors.primarySoft },
  monte: { fg: colors.warning, bg: colors.warningSoft },
  publie: { fg: colors.success, bg: colors.successSoft },
};

type Draft = {
  feature_area: string;
  title: string;
  talking_points: string;
  status: TutorialChapterStatus;
  youtube_url: string;
  site_embed_done: boolean;
  notes: string;
};

function draftFrom(c: AdminTutorialChapter): Draft {
  return {
    feature_area: c.feature_area,
    title: c.title,
    talking_points: c.talking_points,
    status: c.status,
    youtube_url: c.youtube_url ?? '',
    site_embed_done: c.site_embed_done,
    notes: c.notes ?? '',
  };
}

const BLANK_DRAFT: Draft = {
  feature_area: '',
  title: '',
  talking_points: '',
  status: 'a_faire',
  youtube_url: '',
  site_embed_done: false,
  notes: '',
};

// Suivi de production des tutoriels vidéo Cantia — un chapitre par
// fonctionnalité, avec le script/points à montrer, un statut d'avancement
// et le lien YouTube une fois publié. Persisté en base (pas juste un
// fichier local) pour que l'avancement survive d'une session à l'autre.
// La liste de départ est écrite dans la migration elle-même
// (20260903180000_tutorial_chapters_admin.sql) ; tout ici est ensuite
// éditable/supprimable librement.
export default function AdminTutorialsScreen() {
  const [chapters, setChapters] = useState<AdminTutorialChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);

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

  const grouped = useMemo(() => {
    const map = new Map<string, AdminTutorialChapter[]>();
    for (const c of chapters) {
      const list = map.get(c.feature_area) ?? [];
      list.push(c);
      map.set(c.feature_area, list);
    }
    return Array.from(map.entries());
  }, [chapters]);

  const progress = useMemo(() => {
    const total = chapters.length;
    const publie = chapters.filter((c) => c.status === 'publie').length;
    return { total, publie, pct: total ? Math.round((publie / total) * 100) : 0 };
  }, [chapters]);

  function openExisting(c: AdminTutorialChapter) {
    setExpandedId(c.id);
    setDraft(draftFrom(c));
  }

  function openNew() {
    setExpandedId('new');
    setDraft({ ...BLANK_DRAFT, feature_area: grouped[grouped.length - 1]?.[0] ?? '' });
  }

  async function save(id: string | 'new') {
    if (!draft.title.trim() || !draft.feature_area.trim()) return;
    setSaving(true);
    const existing = id !== 'new' ? chapters.find((c) => c.id === id) : null;
    const orderIndex = existing ? existing.order_index : chapters.length ? Math.max(...chapters.map((c) => c.order_index)) + 1 : 1;
    const { chapter, error: err } = await upsertTutorialChapter({
      id: existing?.id ?? null,
      order_index: orderIndex,
      feature_area: draft.feature_area.trim(),
      title: draft.title.trim(),
      talking_points: draft.talking_points,
      status: draft.status,
      youtube_url: draft.youtube_url.trim() || null,
      site_embed_done: draft.site_embed_done,
      notes: draft.notes.trim() || null,
    });
    if (!err && chapter) {
      setChapters((prev) => {
        const withoutOld = prev.filter((c) => c.id !== chapter.id);
        return [...withoutOld, chapter].sort((a, b) => a.order_index - b.order_index);
      });
      setExpandedId(null);
    } else if (err) {
      setError(err);
    }
    setSaving(false);
  }

  async function remove(id: string) {
    setSaving(true);
    const { error: err } = await deleteTutorialChapter(id);
    if (!err) {
      setChapters((prev) => prev.filter((c) => c.id !== id));
      setExpandedId(null);
    } else {
      setError(err);
    }
    setSaving(false);
  }

  return (
    <ScrollView>
      <Container style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tutoriels</Text>
            <Text style={styles.hint}>
              Plan de tournage : un chapitre par fonctionnalité, avec les points à montrer et le lien YouTube une fois publié.
            </Text>
          </View>
          <AdminRefreshButton onPress={load} loading={loading} />
        </View>

        {!loading && chapters.length > 0 ? (
          <View style={styles.progressCard}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress.pct}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {progress.publie} / {progress.total} publiés ({progress.pct}%)
            </Text>
          </View>
        ) : null}

        {error ? <AdminErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : chapters.length === 0 ? (
          <EmptyState title="Aucun chapitre pour l'instant" subtitle="Ajoute le premier ci-dessous." />
        ) : (
          <View style={styles.groups}>
            {grouped.map(([area, list]) => (
              <View key={area} style={styles.group}>
                <Text style={styles.groupTitle}>{area}</Text>
                <View style={styles.list}>
                  {list.map((c) => {
                    const open = expandedId === c.id;
                    const statusColor = STATUS_COLOR[c.status];
                    return (
                      <View key={c.id} style={styles.card}>
                        <Pressable style={styles.row} onPress={() => (open ? setExpandedId(null) : openExisting(c))}>
                          <Text style={styles.orderBadge}>{c.order_index}</Text>
                          <Text style={styles.rowTitle} numberOfLines={open ? undefined : 1}>
                            {c.title}
                          </Text>
                          <View style={[styles.pill, { backgroundColor: statusColor.bg }]}>
                            <Text style={[styles.pillText, { color: statusColor.fg }]}>{STATUS_LABEL[c.status]}</Text>
                          </View>
                          {c.youtube_url ? <Feather name="youtube" size={15} color={colors.danger} /> : null}
                          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                        </Pressable>

                        {open ? (
                          <ChapterEditor
                            draft={draft}
                            setDraft={setDraft}
                            saving={saving}
                            onSave={() => save(c.id)}
                            onDelete={() => remove(c.id)}
                            onCancel={() => setExpandedId(null)}
                          />
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {expandedId === 'new' ? (
          <View style={[styles.card, styles.newCard]}>
            <Text style={styles.groupTitle}>Nouveau chapitre</Text>
            <ChapterEditor
              draft={draft}
              setDraft={setDraft}
              saving={saving}
              onSave={() => save('new')}
              onCancel={() => setExpandedId(null)}
            />
          </View>
        ) : (
          <Pressable style={styles.addButton} onPress={openNew}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>Ajouter un chapitre</Text>
          </Pressable>
        )}
      </Container>
    </ScrollView>
  );
}

function ChapterEditor({
  draft,
  setDraft,
  saving,
  onSave,
  onDelete,
  onCancel,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  saving: boolean;
  onSave: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.editor}>
      <View style={styles.editorRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Titre du chapitre</Text>
          <TextInput
            value={draft.title}
            onChangeText={(v) => setDraft({ ...draft, title: v })}
            style={styles.input}
            placeholder="Ex. Créer un devis à la voix"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Section</Text>
          <TextInput
            value={draft.feature_area}
            onChangeText={(v) => setDraft({ ...draft, feature_area: v })}
            style={styles.input}
            placeholder="Ex. Devis"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Points à montrer / à dire (texte à l'écran)</Text>
      <TextInput
        value={draft.talking_points}
        onChangeText={(v) => setDraft({ ...draft, talking_points: v })}
        style={[styles.input, styles.textarea]}
        multiline
        numberOfLines={5}
        placeholder="Une ligne par point — sert de script pour le tournage"
        placeholderTextColor={colors.textMuted}
      />

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

      <View style={styles.editorRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Lien YouTube (une fois publié)</Text>
          <TextInput
            value={draft.youtube_url}
            onChangeText={(v) => setDraft({ ...draft, youtube_url: v })}
            style={styles.input}
            placeholder="https://youtube.com/..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.embedToggle}>
          <Text style={styles.fieldLabel}>Intégré sur le site</Text>
          <Switch value={draft.site_embed_done} onChange={(v) => setDraft({ ...draft, site_embed_done: v })} />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Notes</Text>
      <TextInput
        value={draft.notes}
        onChangeText={(v) => setDraft({ ...draft, notes: v })}
        style={[styles.input, styles.textareaSmall]}
        multiline
        numberOfLines={2}
        placeholder="Optionnel"
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
    maxWidth: 480,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  groups: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
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
  rowTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
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
  editorRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
    minHeight: 100,
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
  embedToggle: {
    justifyContent: 'center',
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
