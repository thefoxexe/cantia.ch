import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';
import { getSignedUrl } from '../../../../lib/api/storage';
import { generateFacturePdf } from '../../../../lib/api/pdf';
import { downloadFile } from '../../../../lib/downloadFile';
import { Button, Card, Container, LoadingScreen, Screen, StatusBadge } from '../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import { generatePaymentReference, formatReferenceForDisplay } from '../../../../lib/qrReference';
import type { Facture, FactureItem, FactureStatus } from '../../../../lib/types';

const STATUS_FLOW: FactureStatus[] = ['draft', 'sent', 'paid', 'cancelled'];
const STATUS_LABELS: Record<FactureStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  cancelled: 'Annulée',
};

export default function FactureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [items, setItems] = useState<FactureItem[]>([]);
  const [orgIban, setOrgIban] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: f }, { data: i }] = await Promise.all([
      supabase.from('factures').select('*').eq('id', id).single(),
      supabase.from('facture_items').select('*').eq('facture_id', id).order('sort_order', { ascending: true }),
    ]);
    setFacture(f ?? null);
    setItems(i ?? []);
    if (f?.organization_id) {
      const { data: org } = await supabase.from('organizations').select('iban').eq('id', f.organization_id).single();
      setOrgIban(org?.iban ?? null);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function changeStatus(status: FactureStatus) {
    const patch: { status: FactureStatus; paid_at?: string | null } = { status };
    if (status === 'paid') patch.paid_at = new Date().toISOString();
    else if (facture?.status === 'paid') patch.paid_at = null;
    await supabase.from('factures').update(patch).eq('id', id);
    load();
  }

  async function handleGeneratePdf() {
    setGenerating(true);
    setError(null);
    const { error } = await generateFacturePdf(id);
    setGenerating(false);
    if (error) {
      setError(error);
      return;
    }
    load();
  }

  async function openPdf() {
    if (!facture?.pdf_path) return;
    const url = await getSignedUrl(facture.pdf_path);
    if (!url) return;
    const { error: dlError } = await downloadFile(url, `Facture ${facture.number || facture.client_name}.pdf`);
    if (dlError) setError(dlError);
  }

  if (!facture) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unit_price), 0);
  const vat = subtotal * (Number(facture.vat_rate) / 100);
  const total = subtotal + vat;
  const overdue = facture.status === 'sent' && facture.due_date < new Date().toISOString().slice(0, 10);
  const paymentRef = generatePaymentReference(orgIban, facture.id);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Container>
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.number}>{facture.number}</Text>
            <StatusBadge status={facture.status} />
          </View>
          <Text style={styles.client}>{facture.client_name}</Text>
          {facture.client_address ? <Text style={styles.meta}>{facture.client_address}</Text> : null}
          {facture.client_email ? <Text style={styles.meta}>{facture.client_email}</Text> : null}
          <Text style={[styles.meta, overdue && styles.overdue]}>
            {overdue ? 'En retard · ' : ''}Échéance {new Date(facture.due_date).toLocaleDateString('fr-CH')}
          </Text>
        </Card>

        {paymentRef ? (
          <View style={styles.refCard}>
            <Feather name="hash" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.refLabel}>Référence de paiement</Text>
              <Text selectable style={styles.refValue}>
                {formatReferenceForDisplay(paymentRef.reference, paymentRef.type)}
              </Text>
              <Text style={styles.refHint}>Appui long pour copier</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Statut</Text>
        <View style={styles.statusRow}>
          {STATUS_FLOW.map((s) => (
            <Pressable
              key={s}
              onPress={() => changeStatus(s)}
              style={[styles.statusChip, facture.status === s && styles.statusChipActive]}
            >
              <Text style={[styles.statusChipText, facture.status === s && styles.statusChipTextActive]}>
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
              <Text style={styles.meta}>TVA ({facture.vat_rate}%)</Text>
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
          title={facture.pdf_path ? 'Régénérer le PDF' : 'Générer le PDF'}
          onPress={handleGeneratePdf}
          loading={generating}
          style={{ marginTop: spacing.lg }}
        />
        {facture.pdf_path ? (
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
  overdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  refCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  refLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  refValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  refHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
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
