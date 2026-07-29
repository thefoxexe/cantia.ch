import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { Button, Card, EmptyState } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { MetreItem } from '../lib/types';

export function ProjectMetre({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<MetreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('metre_items')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function addItem() {
    const { data } = await supabase
      .from('metre_items')
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        reference: '',
        description: '',
        quantity: 0,
        unit: 'pce',
        sort_order: items.length,
        created_by: user?.id ?? null,
      })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data]);
  }

  function patchLocal(id: string, patch: Partial<MetreItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function saveItem(item: MetreItem) {
    await supabase
      .from('metre_items')
      .update({
        reference: item.reference,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
      })
      .eq('id', item.id);
  }

  async function removeItem(id: string) {
    await supabase.from('metre_items').delete().eq('id', id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const byUnit = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const it of items) {
      const unit = it.unit || 'pce';
      totals[unit] = (totals[unit] ?? 0) + Number(it.quantity || 0);
    }
    return totals;
  }, [items]);

  async function transferToDevis() {
    if (items.length === 0) return;
    setTransferring(true);
    const { data: devis, error } = await supabase
      .from('devis')
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        client_name: 'À compléter',
        notes: 'Devis généré depuis le métré.',
        status: 'draft',
      })
      .select()
      .single();

    if (!error && devis) {
      await supabase.from('devis_items').insert(
        items
          .filter((it) => it.description.trim())
          .map((it, i) => ({
            devis_id: devis.id,
            description: it.reference ? `${it.reference} — ${it.description}` : it.description,
            quantity: it.quantity,
            unit: it.unit,
            unit_price: 0,
            sort_order: i,
          })),
      );
      router.push(`/(app)/devis/${devis.id}`);
    }
    setTransferring(false);
  }

  return (
    <View>
      <View style={styles.actionsRow}>
        <Pressable style={styles.newButton} onPress={addItem}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.newButtonText}>Ajouter une ligne</Text>
        </Pressable>
        {items.length > 0 ? (
          <Button
            title="Créer un devis depuis ce métré"
            variant="secondary"
            icon="file-plus"
            onPress={transferToDevis}
            loading={transferring}
          />
        ) : null}
      </View>

      {items.length === 0 && !loading ? (
        <EmptyState title="Aucune ligne de métré" subtitle="Détaillez vos quantités poste par poste avant de chiffrer le devis." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {items.map((it) => (
            <Card key={it.id} style={styles.itemCard}>
              <View style={styles.itemHeaderRow}>
                <View style={styles.refField}>
                  <Text style={styles.fieldLabel}>Réf.</Text>
                  <TextInput
                    style={styles.cellInput}
                    value={it.reference ?? ''}
                    onChangeText={(t) => patchLocal(it.id, { reference: t })}
                    onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
                    placeholder="1.1"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <Pressable style={styles.deleteButton} hitSlop={8} onPress={() => removeItem(it.id)}>
                  <Feather name="trash-2" size={16} color={colors.danger} />
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Désignation</Text>
                <TextInput
                  style={[styles.cellInput, styles.descInput]}
                  value={it.description}
                  onChangeText={(t) => patchLocal(it.id, { description: t })}
                  onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
                  placeholder="Désignation du poste"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
              </View>

              <View style={styles.row2}>
                <View style={styles.row2Item}>
                  <Text style={styles.fieldLabel}>Quantité</Text>
                  <TextInput
                    style={styles.cellInput}
                    value={String(it.quantity)}
                    onChangeText={(t) => patchLocal(it.id, { quantity: Number(t) || 0 })}
                    onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.row2Item}>
                  <Text style={styles.fieldLabel}>Unité</Text>
                  <TextInput
                    style={styles.cellInput}
                    value={it.unit ?? ''}
                    onChangeText={(t) => patchLocal(it.id, { unit: t })}
                    onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
                    placeholder="m², m³, ml…"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {Object.keys(byUnit).length > 0 ? (
        <View style={styles.totals}>
          <Text style={styles.totalsTitle}>Totaux par unité</Text>
          <View style={styles.totalsRow}>
            {Object.entries(byUnit).map(([unit, qty]) => (
              <View key={unit} style={styles.totalChip}>
                <Text style={styles.totalChipText}>
                  {qty.toLocaleString('fr-CH', { maximumFractionDigits: 2 })} {unit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  itemCard: {
    gap: spacing.sm,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  refField: {
    width: 90,
    gap: 4,
  },
  deleteButton: {
    marginLeft: 'auto',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Quantité/Unité wrap to full width on narrow screens instead of being
  // squeezed into fixed-width table columns — the old table layout summed
  // to well over a phone's screen width, so typing into a cell meant
  // fighting a horizontally squished, unreadable row.
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row2Item: {
    flexGrow: 1,
    flexBasis: 120,
    gap: 4,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  cellInput: {
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  descInput: {
    minHeight: 44,
    textAlignVertical: 'top',
  },
  totals: {
    marginTop: spacing.lg,
  },
  totalsTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  totalChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  totalChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
});
