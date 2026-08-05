import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrl } from '../../../lib/api/storage';
import { generateDevisPdf } from '../../../lib/api/pdf';
import { downloadFile } from '../../../lib/downloadFile';
import { duplicateDevis } from '../../../lib/api/devis';
import { convertDevisToFacture, listFacturesForDevis } from '../../../lib/api/factures';
import { confirm } from '../../../lib/confirm';
import { Button, Card, Container, LoadingScreen, Screen, StatusBadge } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { StatusDropdown } from '../../../components/StatusDropdown';
import { colors, fontSize, spacing } from '../../../lib/theme';
import type { Devis, DevisItem, DevisStatus, Facture } from '../../../lib/types';

type RelatedFacture = Pick<Facture, 'id' | 'number' | 'status' | 'is_deposit'>;

const STATUS_FLOW: DevisStatus[] = ['draft', 'sent', 'accepted', 'refused'];
const STATUS_LABELS: Record<DevisStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
};

export default function DevisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [devis, setDevis] = useState<Devis | null>(null);
  const [items, setItems] = useState<DevisItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [relatedFactures, setRelatedFactures] = useState<RelatedFacture[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: d }, { data: i }, f] = await Promise.all([
      supabase.from('devis').select('*').eq('id', id).single(),
      supabase.from('devis_items').select('*').eq('devis_id', id).order('sort_order', { ascending: true }),
      listFacturesForDevis(id),
    ]);
    setDevis(d ?? null);
    setItems(i ?? []);
    setRelatedFactures(f);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Accepting a devis creates its final invoice on the spot — no separate
  // "transformer en facture" step — and jumps straight to it, since that's
  // the next thing the user needs after acceptance. Skipped if a non-deposit
  // facture already exists for this devis (re-accepting shouldn't duplicate it).
  async function changeStatus(status: DevisStatus) {
    await supabase.from('devis').update({ status }).eq('id', id);
    if (status === 'accepted' && !relatedFactures.some((f) => !f.is_deposit)) {
      setConverting(true);
      setError(null);
      const { id: newId, error: rpcError } = await convertDevisToFacture(id);
      setConverting(false);
      if (rpcError) {
        setError(rpcError);
        load();
        return;
      }
      if (newId) {
        router.push(`/(app)/devis/factures/${newId}`);
        return;
      }
    }
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
    if (!url) return;
    const { error: dlError } = await downloadFile(url, `Devis ${devis.number || devis.client_name}.pdf`);
    if (dlError) setError(dlError);
  }

  async function handleDuplicate() {
    setError(null);
    const { id: newId, error: dupError } = await duplicateDevis(id);
    if (dupError) {
      setError(dupError);
      return;
    }
    if (newId) router.push(`/(app)/devis/${newId}`);
  }

  async function handleDelete() {
    const ok = await confirm('Supprimer ce devis ?', `Le devis ${devis?.number ?? ''} sera définitivement supprimé.`);
    if (!ok) return;
    setError(null);
    const { error: delError } = await supabase.from('devis').delete().eq('id', id);
    if (delError) {
      setError(delError.message);
      return;
    }
    router.replace('/(app)/devis');
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
            <View style={styles.headerRight}>
              <StatusDropdown status={devis.status} options={STATUS_FLOW} labels={STATUS_LABELS} onChange={changeStatus} />
              <RowActionMenu
                actions={[
                  { key: 'duplicate', icon: 'copy', label: 'Dupliquer', onPress: handleDuplicate },
                  ...(isAdmin
                    ? [{ key: 'delete', icon: 'trash-2' as const, label: 'Supprimer', danger: true, onPress: handleDelete }]
                    : []),
                ]}
              />
            </View>
          </View>
          <Text style={styles.client}>{devis.client_name}</Text>
          {devis.client_address ? <Text style={styles.meta}>{devis.client_address}</Text> : null}
          {devis.client_email ? <Text style={styles.meta}>{devis.client_email}</Text> : null}
        </Card>

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
        {error?.includes('plan payant') ? (
          <Button
            title="Passer à un plan payant"
            icon="arrow-up-circle"
            variant="secondary"
            onPress={() => router.push('/(app)/compte/facturation')}
            style={{ marginTop: spacing.sm }}
          />
        ) : null}

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

        {relatedFactures.length ? (
          <>
            <Text style={styles.sectionTitle}>Factures liées</Text>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {relatedFactures.map((f, idx) => (
                <Pressable
                  key={f.id}
                  onPress={() => router.push(`/(app)/devis/factures/${f.id}`)}
                  style={[styles.factureRow, idx > 0 && styles.itemRowBorder]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemDesc}>{f.number}</Text>
                    <Text style={styles.meta}>{f.is_deposit ? 'Acompte' : 'Facture finale'}</Text>
                  </View>
                  <StatusBadge status={f.status} />
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </Card>
          </>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  factureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
