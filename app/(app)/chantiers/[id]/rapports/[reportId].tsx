import { useCallback, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../../../lib/supabase';
import { getSignedUrl, getSignedUrls } from '../../../../../lib/api/storage';
import { generateReportPdf } from '../../../../../lib/api/pdf';
import { Button, Card, Container, Screen, StatusBadge } from '../../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import type { Report, ReportPhoto } from '../../../../../lib/types';

export default function ReportDetailScreen() {
  const { reportId } = useLocalSearchParams<{ id: string; reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading || !report) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <Text>Chargement…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Container>
          <Button
            title="Retour"
            icon="arrow-left"
            variant="secondary"
            onPress={() => router.back()}
            style={{ alignSelf: 'flex-start', marginBottom: spacing.lg }}
          />

          <Card>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{report.title}</Text>
              <StatusBadge status={report.status} />
            </View>
            <Text style={styles.meta}>{new Date(report.created_at).toLocaleDateString('fr-CH')}</Text>
            {report.notes ? <Text style={styles.notes}>{report.notes}</Text> : null}
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}

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
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    flexShrink: 1,
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
