import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../../lib/auth-context';
import { useProject } from '../../../../../lib/useProject';
import { supabase } from '../../../../../lib/supabase';
import { Button, Card, Field, Screen } from '../../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import { fetchCatalog, findMatches, guessUnit, normalizeDescription, updateCatalogItemPrice, type CatalogEntry } from '../../../../../lib/catalog';
import type { Devis } from '../../../../../lib/types';

interface Line {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  unitAuto: boolean;
}

interface PriceMismatch {
  catalogItemId: string;
  description: string;
  unit: string;
  catalogPrice: number;
  enteredPrice: number;
  updateCatalog: boolean;
}

function emptyLine(): Line {
  return { description: '', quantity: '1', unit: 'pce', unitPrice: '0', unitAuto: true };
}

export default function NewExtraWorkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { organization, user } = useAuth();
  const { project } = useProject(id);

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [devisOptions, setDevisOptions] = useState<Devis[]>([]);
  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [priceMismatches, setPriceMismatches] = useState<PriceMismatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project?.client_name) setClientName(project.client_name);
  }, [project]);

  useEffect(() => {
    if (!organization) return;
    fetchCatalog(organization.id).then(setCatalog);
  }, [organization]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('devis')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setDevisOptions(data ?? []));
  }, [id]);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function handleDescriptionChange(index: number, text: string) {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const guessed = l.unitAuto ? guessUnit(text) : null;
        return { ...l, description: text, unit: guessed ?? l.unit };
      }),
    );
  }

  function applyMatch(index: number, match: CatalogEntry) {
    updateLine(index, { description: match.description, unit: match.unit, unitPrice: String(match.unitPrice), unitAuto: false });
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);

  function computeMismatches(validLines: Line[]): PriceMismatch[] {
    const mismatches: PriceMismatch[] = [];
    validLines.forEach((line) => {
      const key = normalizeDescription(line.description);
      const match = catalog.find((c) => c.id && normalizeDescription(c.description) === key);
      if (!match || !match.id || match.unitPrice <= 0) return;
      const entered = Number(line.unitPrice) || 0;
      if (entered <= 0 || Math.round(entered * 100) === Math.round(match.unitPrice * 100)) return;
      mismatches.push({
        catalogItemId: match.id,
        description: line.description,
        unit: line.unit.trim() || match.unit,
        catalogPrice: match.unitPrice,
        enteredPrice: entered,
        updateCatalog: false,
      });
    });
    return mismatches;
  }

  async function handleCreate() {
    if (!title.trim()) {
      setError('Le titre est requis.');
      return;
    }
    if (!clientName.trim()) {
      setError('Le nom du client est requis.');
      return;
    }
    const validLines = lines.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      setError('Ajoutez au moins une ligne.');
      return;
    }
    setError(null);

    const mismatches = computeMismatches(validLines);
    if (mismatches.length > 0) {
      setPriceMismatches(mismatches);
      return;
    }
    await submit(validLines, []);
  }

  async function submit(validLines: Line[], mismatches: PriceMismatch[]) {
    if (!organization) return;
    setLoading(true);

    await Promise.all(mismatches.filter((m) => m.updateCatalog).map((m) => updateCatalogItemPrice(m.catalogItemId, m.enteredPrice, m.unit)));

    const { data: work, error: workError } = await supabase
      .from('extra_works')
      .insert({
        organization_id: organization.id,
        project_id: id,
        devis_id: selectedDevisId,
        title: title.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        notes: notes.trim() || null,
        vat_rate: organization.default_vat_rate,
        created_by: user?.id,
      })
      .select()
      .single();

    if (workError || !work) {
      setError(workError?.message ?? 'Échec de la création.');
      setLoading(false);
      return;
    }

    const itemsPayload = validLines.map((l, i) => ({
      extra_work_id: work.id,
      description: l.description.trim(),
      quantity: Number(l.quantity) || 1,
      unit: l.unit.trim() || 'pce',
      unit_price: Number(l.unitPrice) || 0,
      sort_order: i,
    }));

    const { error: itemsError } = await supabase.from('extra_work_items').insert(itemsPayload);
    setLoading(false);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    router.replace(`/(app)/chantiers/${id}/travaux-supplementaires/${work.id}` as any);
  }

  function toggleMismatchUpdate(catalogItemId: string) {
    setPriceMismatches((prev) => (prev ? prev.map((m) => (m.catalogItemId === catalogItemId ? { ...m, updateCatalog: !m.updateCatalog } : m)) : prev));
  }

  async function confirmMismatchesAndSubmit() {
    if (!priceMismatches) return;
    const mismatches = priceMismatches;
    const validLines = lines.filter((l) => l.description.trim());
    setPriceMismatches(null);
    await submit(validLines, mismatches);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Nouveaux travaux supplémentaires</Text>
          <Text style={styles.pageSubtitle}>{project?.name}</Text>

          <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Ex. Percement mur porteur supplémentaire" />

          <Text style={styles.sectionTitle}>Client</Text>
          <Field label="Nom du client" value={clientName} onChangeText={setClientName} />
          <Field label="E-mail (pour l'envoi et la validation en ligne)" value={clientEmail} onChangeText={setClientEmail} autoCapitalize="none" keyboardType="email-address" />

          {devisOptions.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Devis d'origine</Text>
              <Text style={styles.sectionHint}>Optionnel — relie ces travaux au devis initial du chantier.</Text>
              <View style={styles.devisRow}>
                <Pressable
                  onPress={() => setSelectedDevisId(null)}
                  style={[styles.devisChip, selectedDevisId === null && styles.devisChipActive]}
                >
                  <Text style={[styles.devisChipText, selectedDevisId === null && styles.devisChipTextActive]}>Aucun</Text>
                </Pressable>
                {devisOptions.map((d) => (
                  <Pressable
                    key={d.id}
                    onPress={() => setSelectedDevisId(d.id)}
                    style={[styles.devisChip, selectedDevisId === d.id && styles.devisChipActive]}
                  >
                    <Text style={[styles.devisChipText, selectedDevisId === d.id && styles.devisChipTextActive]}>{d.number ?? 'Devis'}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Lignes</Text>
          {lines.map((line, i) => {
            const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
            const matches = findMatches(catalog, line.description);
            return (
              <View key={i} style={styles.lineCard}>
                <View style={styles.lineCardHeader}>
                  <Text style={styles.lineIndex}>Ligne {i + 1}</Text>
                  {lines.length > 1 ? (
                    <Pressable onPress={() => removeLine(i)} hitSlop={8}>
                      <Feather name="trash-2" size={16} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
                <TextInput
                  style={styles.lineDesc}
                  value={line.description}
                  onChangeText={(t) => handleDescriptionChange(i, t)}
                  placeholder="Description du travail supplémentaire"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
                {matches.length > 0 ? (
                  <View style={styles.suggestionRow}>
                    <Feather name="zap" size={11} color={colors.primary} style={{ marginTop: 3 }} />
                    <View style={styles.suggestionChips}>
                      {matches.map((m) => (
                        <Pressable key={m.description} style={styles.suggestionChip} onPress={() => applyMatch(i, m)}>
                          <Text style={styles.suggestionMatch}>{Math.round(m.score * 100)}%</Text>
                          <Text style={styles.suggestionText} numberOfLines={1}>
                            {m.description}
                          </Text>
                          <Text style={styles.suggestionPrice}>CHF {m.unitPrice.toFixed(2)}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
                <View style={styles.lineFields}>
                  <View style={styles.lineFieldQty}>
                    <Text style={styles.lineFieldLabel}>Qté</Text>
                    <TextInput style={styles.lineInput} value={line.quantity} onChangeText={(t) => updateLine(i, { quantity: t })} keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
                  </View>
                  <View style={styles.lineFieldUnit}>
                    <Text style={styles.lineFieldLabel}>Unité</Text>
                    <TextInput style={styles.lineInput} value={line.unit} onChangeText={(t) => updateLine(i, { unit: t, unitAuto: false })} placeholder="pce, h, m²…" placeholderTextColor={colors.textMuted} />
                  </View>
                  <View style={styles.lineFieldPrice}>
                    <Text style={styles.lineFieldLabel}>Prix unit. CHF</Text>
                    <TextInput style={styles.lineInput} value={line.unitPrice} onChangeText={(t) => updateLine(i, { unitPrice: t })} keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
                  </View>
                </View>
                <Text style={styles.lineTotal}>Sous-total : CHF {lineTotal.toFixed(2)}</Text>
              </View>
            );
          })}

          <Pressable style={styles.addLine} onPress={addLine}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.addLineText}>Ajouter une ligne</Text>
          </Pressable>

          <Field label="Notes (optionnel)" value={notes} onChangeText={setNotes} multiline style={{ minHeight: 70 }} />

          <Text style={styles.total}>Total HT estimé : CHF {total.toFixed(2)}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Créer" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} />
        </View>
      </ScrollView>

      <Modal visible={priceMismatches != null} animationType="slide" transparent onRequestClose={() => setPriceMismatches(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prix différent du catalogue</Text>
              <Pressable hitSlop={8} onPress={() => setPriceMismatches(null)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.mismatchIntro}>
                Le prix saisi diffère de celui déjà connu. Choisissez, pour chaque ligne, si le nouveau prix doit être enregistré dans le catalogue
                ou rester une exception.
              </Text>
              {(priceMismatches ?? []).map((m) => (
                <View key={m.catalogItemId} style={styles.mismatchCard}>
                  <Text style={styles.mismatchDesc} numberOfLines={2}>
                    {m.description}
                  </Text>
                  <View style={styles.mismatchPrices}>
                    <Text style={styles.mismatchOldPrice}>Catalogue : CHF {m.catalogPrice.toFixed(2)}</Text>
                    <Feather name="arrow-right" size={12} color={colors.textMuted} />
                    <Text style={styles.mismatchNewPrice}>Saisi : CHF {m.enteredPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.mismatchChoices}>
                    <Pressable style={[styles.mismatchChoice, !m.updateCatalog && styles.mismatchChoiceActive]} onPress={() => m.updateCatalog && toggleMismatchUpdate(m.catalogItemId)}>
                      <Text style={[styles.mismatchChoiceText, !m.updateCatalog && styles.mismatchChoiceTextActive]}>Garder l'écart</Text>
                    </Pressable>
                    <Pressable style={[styles.mismatchChoice, m.updateCatalog && styles.mismatchChoiceActive]} onPress={() => !m.updateCatalog && toggleMismatchUpdate(m.catalogItemId)}>
                      <Text style={[styles.mismatchChoiceText, m.updateCatalog && styles.mismatchChoiceTextActive]}>Mettre à jour le catalogue</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <Button title="Confirmer et créer" onPress={confirmMismatchesAndSubmit} loading={loading} style={{ marginTop: spacing.md }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  devisRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  devisChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  devisChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  devisChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  devisChipTextActive: {
    color: colors.primary,
  },
  lineCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  lineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lineIndex: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lineDesc: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    minHeight: 44,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  suggestionChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 260,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  suggestionMatch: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  suggestionText: {
    fontSize: fontSize.xs,
    color: colors.text,
    flexShrink: 1,
  },
  suggestionPrice: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  lineFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  lineFieldQty: {
    flexBasis: 80,
    flexGrow: 1,
  },
  lineFieldUnit: {
    flexBasis: 100,
    flexGrow: 1,
  },
  lineFieldPrice: {
    flexBasis: 130,
    flexGrow: 1.4,
  },
  lineFieldLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  lineInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  lineTotal: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    marginTop: spacing.md,
  },
  addLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  addLineText: {
    color: colors.primary,
    fontWeight: '600',
  },
  total: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  mismatchIntro: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  mismatchCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mismatchDesc: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mismatchPrices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mismatchOldPrice: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  mismatchNewPrice: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  mismatchChoices: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mismatchChoice: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  mismatchChoiceActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  mismatchChoiceText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  mismatchChoiceTextActive: {
    color: colors.primary,
  },
});
