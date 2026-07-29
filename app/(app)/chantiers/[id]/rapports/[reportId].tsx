import { useCallback, useState } from 'react';
import { Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../../../lib/supabase';
import { getSignedUrl, getSignedUrls, deleteFromOrgBucket } from '../../../../../lib/api/storage';
import { generateReportPdf } from '../../../../../lib/api/pdf';
import { polishReportNotes } from '../../../../../lib/api/ai';
import { Button, Card, Container, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import type { Report, ReportPhoto } from '../../../../../lib/types';

function confirm(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function ReportDetailScreen() {
  const { id: projectId, reportId } = useLocalSearchParams<{ id: string; reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('reports').select('*').eq('id', reportId).single(),
      supabase.from('report_photos').select('*').eq('report_id', reportId).order('sort_order', { ascending: true }),
    ]);
    setReport(r ?? null);
    setPhotos(p ?? []);
    if (p?.length) setUrls(await getSignedUrls(p.map((x) => x.storage_path)));
    setLoading(false);
  }, [reportId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function openPdf() {
    if (!report?.pdf_path) return;
    const url = await getSignedUrl(report.pdf_path);
    if (url) Linking.openURL(url);
  }

  async function regenerate() {
    setRegenerating(true);
    setError(null);
    const { url, error: genError } = await generateReportPdf(reportId);
    setRegenerating(false);
    if (genError) {
      setError(genError);
      return;
    }
    await load();
    if (url) Linking.openURL(url);
  }

  async function polishNotes() {
    if (!report) return;
    setPolishing(true);
    setError(null);
    const { notes, error: polishError } = await polishReportNotes(reportId);
    setPolishing(false);
    if (polishError) {
      setError(polishError);
      return;
    }
    if (notes) {
      setEditTitle(report.title);
      setEditNotes(notes);
      setEditing(true);
    }
  }

  function startEditing() {
    if (!report) return;
    setEditTitle(report.title);
    setEditNotes(report.notes ?? '');
    setEditing(true);
  }

  async function saveEdits() {
    if (!report || !editTitle.trim()) return;
    setSaving(true);
    await supabase
      .from('reports')
      .update({ title: editTitle.trim(), notes: editNotes.trim() || null })
      .eq('id', report.id);
    setSaving(false);
    setEditing(false);
    load();
  }

  async function deleteReport() {
    if (!report) return;
    const ok = await confirm('Supprimer ce rapport ?', 'Cette action est définitive et supprimera aussi ses photos.');
    if (!ok) return;
    setDeleting(true);
    for (const p of photos) await deleteFromOrgBucket(p.storage_path);
    if (report.pdf_path) await deleteFromOrgBucket(report.pdf_path);
    await supabase.from('reports').delete().eq('id', report.id);
    setDeleting(false);
    router.replace(`/(app)/chantiers/${projectId}`);
  }

  if (loading || !report) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Container>
          <PageHeader
            title={report.title}
            backTo={`/(app)/chantiers/${projectId}`}
            right={!editing ? <StatusBadge status={report.status} /> : undefined}
          />

          <Card>
            {editing ? (
              <View>
                <TextInput
                  style={styles.titleInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Titre du rapport"
                  placeholderTextColor={colors.textMuted}
                />
                <TextInput
                  style={styles.notesInput}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Notes"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.editButtonsRow}>
                  <Button title="Annuler" variant="secondary" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                  <Button title="Enregistrer" icon="check" onPress={saveEdits} loading={saving} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.meta}>{new Date(report.created_at).toLocaleDateString('fr-CH')}</Text>
                {report.notes ? <Text style={styles.notes}>{report.notes}</Text> : null}
              </>
            )}
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {!editing ? (
            <View style={styles.actionsRow}>
              {report.pdf_path ? (
                <Button title="Ouvrir le PDF" icon="file-text" onPress={openPdf} style={{ flex: 1 }} />
              ) : null}
              <Button
                title={report.pdf_path ? 'Régénérer le PDF' : 'Générer le PDF'}
                icon="refresh-cw"
                variant={report.pdf_path ? 'secondary' : 'primary'}
                onPress={regenerate}
                loading={regenerating}
                style={{ flex: 1 }}
              />
            </View>
          ) : null}

          {!editing && report.notes?.trim() ? (
            <View style={styles.actionsRow}>
              <Button
                title="Rédiger avec l'IA"
                icon="zap"
                variant="secondary"
                onPress={polishNotes}
                loading={polishing}
                style={{ flex: 1 }}
              />
            </View>
          ) : null}

          {!editing ? (
            <View style={styles.actionsRow}>
              <Button title="Modifier" icon="edit-2" variant="secondary" onPress={startEditing} style={{ flex: 1 }} />
              <Button title="Supprimer" icon="trash-2" variant="danger" onPress={deleteReport} loading={deleting} style={{ flex: 1 }} />
            </View>
          ) : null}

          {photos.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
              <View style={styles.photoGrid}>
                {photos.map((p) => (
                  <View key={p.id} style={styles.photoCard}>
                    {urls[p.storage_path] ? (
                      <Image source={{ uri: urls[p.storage_path] }} style={styles.photoImg} />
                    ) : (
                      <View style={[styles.photoImg, styles.photoPlaceholder]} />
                    )}
                    {p.caption ? <Text style={styles.photoCaption}>{p.caption}</Text> : null}
                    <Text style={styles.photoMeta}>
                      {p.latitude != null ? `${p.latitude.toFixed(4)}, ${p.longitude!.toFixed(4)}` : 'Position non disponible'}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  notes: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  titleInput: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notesInput: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoCard: {
    width: 160,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  photoImg: {
    width: '100%',
    height: 120,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  photoPlaceholder: {},
  photoCaption: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  photoMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
