import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl } from '../../../lib/api/storage';
import { generateDevisPdf } from '../../../lib/api/pdf';
import { Button, Card, Container, LoadingScreen, Screen, StatusBadge } from '../../../components/ui';
import { colors, fontSize, spacing } from '../../../lib/theme';
import type { Devis, DevisItem, DevisStatus } from '../../../lib/types';

const STATUS_FLOW: DevisStatus[] = ['draft', 'sent', 'accepted', 'refused'];
const STATUS_LABELS: Record<DevisStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
};

export default function DevisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [devis, setDevis] = useState<Devis | null>(null);
  const [items, setItems] = useState<DevisItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: d }, { data: i }] = await Promise.all([
      supabase.from('devis').select('*').eq('id', id).single(),
      supabase.from('devis_items').select('*').eq('devis_id', id).order('sort_order', { ascending: true }),
    ]);
    setDevis(d ?? null);
    setItems(i ?? []);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function changeStatus(status: DevisStatus) {
    await supabase.from('devis').update({ status }).eq('id', id);
    load();
  }

  async function handleGeneratePdf() {
    setGenerating(true);
    setError(null);
    const { error } = await generateDevisPdf(id);
    setGenerating(false);
    if (error) {
      setError(error);
      return;
    }
    load();
  }

  async function openPdf() {
    if (!devis?.pdf_path) return;
    const url = await getSignedUrl(devis.pdf_path);
    if (url) Linking.openURL(url);
  }

  if (!devis) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);
  const vat = subtotal * (Number(devis.vat_rate) / 100);
  const total = subtotal + vat;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Container>
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.number}>{devis.number}</Text>
            <StatusBadge status={devis.status} />
          </View>
          <Text style={styles.client}>{devis.client_name}</Text>
          {devis.client_address ? <Text style={styles.meta}>{devis.client_address}</Text> : null}
          {devis.client_email ? <Text style={styles.meta}>{devis.client_email}</Text> : null}
        </Card>

        <Text style={styles.sectionTitle}>Statut</Text>
        <View style={styles.statusRow}>
          {STATUS_FLOW.map((s) => (
            <Pressable
              key={s}
              onPress={() => changeStatus(s)}
              style={[styles.statusChip, devis.status === s && styles.statusChipActive]}
            >
              <Text style={[styles.statusChipText, devis.status === s && styles.statusChipTextActive]}>
                {STATUS_LABELS[s]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Lignes</Text>
        <Card>
          {items.map((it, idx) => (
            <View key={it.id} style={[styles.itemRow, idx > 0 && styles.itemRowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemDesc}>{it.description}</Text>
                <Text style={styles.meta}>
                  {it.quantity} {it.unit} × CHF {Number(it.unit_price).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>CHF {(Number(it.quantity) * Number(it.unit_price)).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.meta}>Sous-total</Text>
              <Text style={styles.meta}>CHF {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.meta}>TVA ({devis.vat_rate}%)</Text>
              <Text style={styles.meta}>CHF {vat.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total TTC</Text>
              <Text style={styles.totalLabel}>CHF {total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={devis.pdf_path ? 'Régénérer le PDF' : 'Générer le PDF'}
          onPress={handleGeneratePdf}
          loading={generating}
          style={{ marginTop: spacing.lg }}
        />
        {devis.pdf_path ? (
          <Button
            title="Ouvrir le PDF"
            icon="file-text"
            onPress={openPdf}
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
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
  number: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  client: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  statusChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemDesc: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  itemTotal: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  totalsBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});
