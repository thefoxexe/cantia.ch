import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { generateDevisPdf, generateFacturePdf } from '../lib/api/pdf';
import { downloadFile } from '../lib/downloadFile';
import { Card, EmptyState, LoadingScreen, StatusBadge } from './ui';
import { colors, fontSize, spacing } from '../lib/theme';
import type { Devis, Facture } from '../lib/types';

// The org-side counterpart to the client portal's own document history
// (app/client-documents/[token].tsx): same idea — devis and factures kept
// in clearly separated sections, one row per document, direct download
// without having to open it first — but scoped to a single chantier and
// backed by the org's authenticated session instead of a public token.
export function ProjectBilling({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: d }, { data: f }] = await Promise.all([
      supabase.from('devis').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('factures').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    ]);
    setDevisList(d ?? []);
    setFactures(f ?? []);
    setLoading(false);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleDownloadDevis(devis: Devis) {
    setError(null);
    setDownloadingId(devis.id);
    const { url, error: genError } = await generateDevisPdf(devis.id);
    setDownloadingId(null);
    if (genError || !url) {
      setError(genError ?? 'Échec de la génération du PDF.');
      return;
    }
    await downloadFile(url, `Devis-${devis.number ?? devis.id}.pdf`);
  }

  async function handleDownloadFacture(facture: Facture) {
    setError(null);
    setDownloadingId(facture.id);
    const { url, error: genError } = await generateFacturePdf(facture.id);
    setDownloadingId(null);
    if (genError || !url) {
      setError(genError ?? 'Échec de la génération du PDF.');
      return;
    }
    await downloadFile(url, `Facture-${facture.number ?? facture.id}.pdf`);
  }

  if (loading) return <LoadingScreen />;

  if (devisList.length === 0 && factures.length === 0) {
    return <EmptyState title="Aucun devis ni facture" subtitle="Les devis et factures liés à ce chantier apparaîtront ici." />;
  }

  return (
    <View style={{ gap: spacing.lg }}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {devisList.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Devis</Text>
          <Card style={styles.card}>
            {devisList.map((d, i) => (
              <View key={d.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <Pressable style={styles.rowInfo} onPress={() => router.push(`/(app)/devis/${d.id}`)}>
                  <Feather name="file-text" size={16} color={colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Devis {d.number ?? ''}</Text>
                    <Text style={styles.rowMeta}>{new Date(d.created_at).toLocaleDateString('fr-CH')}</Text>
                  </View>
                  <StatusBadge status={d.status} />
                </Pressable>
                {d.status !== 'draft' ? (
                  <Pressable
                    onPress={() => handleDownloadDevis(d)}
                    style={styles.downloadButton}
                    hitSlop={8}
                    disabled={downloadingId === d.id}
                  >
                    <Feather name={downloadingId === d.id ? 'loader' : 'download'} size={16} color={colors.primary} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {factures.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Factures</Text>
          <Card style={styles.card}>
            {factures.map((f, i) => (
              <View key={f.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <Pressable style={styles.rowInfo} onPress={() => router.push(`/(app)/devis/factures/${f.id}`)}>
                  <Feather name="file" size={16} color={colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {f.is_deposit ? "Facture d'acompte" : 'Facture'} {f.number ?? ''}
                    </Text>
                    <Text style={styles.rowMeta}>{new Date(f.created_at).toLocaleDateString('fr-CH')}</Text>
                  </View>
                  <StatusBadge status={f.status} />
                </Pressable>
                {f.status !== 'draft' ? (
                  <Pressable
                    onPress={() => handleDownloadFacture(f)}
                    style={styles.downloadButton}
                    hitSlop={8}
                    disabled={downloadingId === f.id}
                  >
                    <Feather name={downloadingId === f.id ? 'loader' : 'download'} size={16} color={colors.primary} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </Card>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  downloadButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
