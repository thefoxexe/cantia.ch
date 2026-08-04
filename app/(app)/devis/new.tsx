import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Field, Screen } from '../../../components/ui';
import { FeatureHint } from '../../../components/FeatureHint';
import { PdfTemplatePicker } from '../../../components/PdfTemplatePicker';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { buildCatalog, findMatches, guessUnit, type CatalogEntry } from '../../../lib/catalog';
import { useDictation } from '../../../lib/useDictation';

type DictationTarget = { type: 'notes' } | { type: 'line'; index: number };

interface Line {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  // True until the user (or a catalog match) explicitly sets the unit —
  // while true, editing the description keeps re-guessing it from keywords
  // ("PVC" → "ml"); a manual edit or an applied match turns this off so the
  // guess never overwrites a deliberate choice.
  unitAuto: boolean;
}

function emptyLine(): Line {
  return { description: '', quantity: '1', unit: 'pce', unitPrice: '0', unitAuto: true };
}

export default function NewDevisScreen() {
  const { organization, user } = useAuth();
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The org's own past devis lines double as its catalog — no separate
  // table to maintain, every devis created immediately enriches the pool
  // the next one can match against. Fetched once per visit; a session that
  // creates several devis in a row won't see items from earlier in that
  // same session suggested back, which is an acceptable trade-off for not
  // re-querying on every keystroke.
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);

  useEffect(() => {
    if (!organization) return;
    supabase
      .from('devis_items')
      .select('description, unit, unit_price, created_at, devis!inner(organization_id)')
      .eq('devis.organization_id', organization.id)
      .order('created_at', { ascending: false })
      .limit(400)
      .then(({ data }) => {
        if (data) setCatalog(buildCatalog(data as any));
      });
  }, [organization]);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function handleLineDescriptionChange(index: number, text: string) {
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

  // Which field a dictation session is currently feeding, and that field's
  // text as it stood before the session started — the live transcript is
  // appended after it rather than overwriting anything already typed.
  const [dictationTarget, setDictationTarget] = useState<DictationTarget | null>(null);
  const dictationBaseRef = useRef('');
  const dictation = useDictation((sessionTranscript) => {
    const base = dictationBaseRef.current;
    const merged = base + (base && sessionTranscript ? ' ' : '') + sessionTranscript;
    if (dictationTarget?.type === 'notes') setNotes(merged);
    else if (dictationTarget?.type === 'line') updateLine(dictationTarget.index, { description: merged });
  });

  async function toggleDictation(target: DictationTarget) {
    if (dictation.listening) {
      dictation.stop();
      return;
    }
    dictationBaseRef.current = target.type === 'notes' ? notes : lines[target.index].description;
    setDictationTarget(target);
    const started = await dictation.start('fr-FR');
    if (!started) {
      Alert.alert('Permission requise', 'Autorisez l’accès au microphone pour dicter.');
    }
  }

  function isDictating(target: DictationTarget) {
    if (!dictation.listening || !dictationTarget) return false;
    if (target.type === 'notes') return dictationTarget.type === 'notes';
    return dictationTarget.type === 'line' && dictationTarget.index === target.index;
  }

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);

  async function handleCreate() {
    if (!organization) return;
    if (!clientName.trim()) {
      setError('Le nom du client est requis.');
      return;
    }
    const validLines = lines.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      setError('Ajoutez au moins une ligne de devis.');
      return;
    }
    setError(null);
    setLoading(true);

    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .insert({
        organization_id: organization.id,
        client_name: clientName.trim(),
        client_address: clientAddress.trim() || null,
        client_email: clientEmail.trim() || null,
        notes: notes.trim() || null,
        vat_rate: organization.default_vat_rate,
        template_id: templateId,
        created_by: user?.id,
      })
      .select()
      .single();

    if (devisError || !devis) {
      setError(devisError?.message ?? 'Échec de la création du devis');
      setLoading(false);
      return;
    }

    const itemsPayload = validLines.map((l, i) => ({
      devis_id: devis.id,
      description: l.description.trim(),
      quantity: Number(l.quantity) || 1,
      unit: l.unit.trim() || 'pce',
      unit_price: Number(l.unitPrice) || 0,
      sort_order: i,
    }));

    const { error: itemsError } = await supabase.from('devis_items').insert(itemsPayload);
    setLoading(false);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    router.replace(`/(app)/devis/${devis.id}`);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={styles.content}>
          <FeatureHint
            id="devis-new"
            icon="file-text"
            title="Choisissez la couleur de votre PDF"
            text="Vos devis et factures utilisent une mise en page unique ; sélectionnez la couleur ci-dessous. Vous pourrez toujours en changer depuis Compte."
          />

          <Text style={styles.sectionTitle}>Modèle de devis</Text>
          {organization ? (
            <PdfTemplatePicker
              organizationId={organization.id}
              kind="devis"
              compact
              selectedId={templateId}
              onSelect={setTemplateId}
            />
          ) : null}

          <Text style={styles.sectionTitle}>Client</Text>
          <Field label="Client" value={clientName} onChangeText={setClientName} placeholder="Nom du client" />
          <Field label="Adresse du client" value={clientAddress} onChangeText={setClientAddress} placeholder="Adresse" />
          <Field
            label="E-mail du client"
            value={clientEmail}
            onChangeText={setClientEmail}
            placeholder="client@exemple.ch"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.notesLabelRow}>
            <Text style={styles.fieldLabel}>Notes de rendez-vous</Text>
            {dictation.supported ? (
              <Pressable
                onPress={() => toggleDictation({ type: 'notes' })}
                style={[styles.dictateButton, isDictating({ type: 'notes' }) && styles.dictateButtonActive]}
              >
                <Feather name="mic" size={13} color={isDictating({ type: 'notes' }) ? '#fff' : colors.primary} />
                <Text
                  style={[styles.dictateButtonText, isDictating({ type: 'notes' }) && styles.dictateButtonTextActive]}
                >
                  {isDictating({ type: 'notes' }) ? 'Écoute…' : 'Dicter'}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            style={styles.notes}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ce que le client souhaite…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.sectionTitle}>Lignes du devis</Text>
          {lines.map((line, i) => {
            const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
            const matches = findMatches(catalog, line.description);
            // How closely the manually-entered price tracks what this org
            // has historically charged for the closest known match — only
            // meaningful once there's both a match and a real entered price,
            // and only worth showing when it actually deviates (a
            // near-identical price would just be visual noise on every line).
            const bestMatch = matches[0] ?? null;
            const enteredPrice = Number(line.unitPrice) || 0;
            const priceCoherence =
              bestMatch && bestMatch.unitPrice > 0 && enteredPrice > 0
                ? Math.max(0, Math.round((1 - Math.abs(enteredPrice - bestMatch.unitPrice) / bestMatch.unitPrice) * 100))
                : null;
            return (
              <View key={i} style={styles.lineCard}>
                <View style={styles.lineCardHeader}>
                  <Text style={styles.lineIndex}>Ligne {i + 1}</Text>
                  <View style={styles.lineCardHeaderActions}>
                    {dictation.supported ? (
                      <Pressable
                        onPress={() => toggleDictation({ type: 'line', index: i })}
                        style={[
                          styles.dictateButton,
                          isDictating({ type: 'line', index: i }) && styles.dictateButtonActive,
                        ]}
                      >
                        <Feather
                          name="mic"
                          size={13}
                          color={isDictating({ type: 'line', index: i }) ? '#fff' : colors.primary}
                        />
                        <Text
                          style={[
                            styles.dictateButtonText,
                            isDictating({ type: 'line', index: i }) && styles.dictateButtonTextActive,
                          ]}
                        >
                          {isDictating({ type: 'line', index: i }) ? 'Écoute…' : 'Dicter'}
                        </Text>
                      </Pressable>
                    ) : null}
                    {lines.length > 1 ? (
                      <Pressable onPress={() => removeLine(i)} hitSlop={8}>
                        <Feather name="trash-2" size={16} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
                <TextInput
                  style={styles.lineDesc}
                  value={line.description}
                  onChangeText={(t) => handleLineDescriptionChange(i, t)}
                  placeholder="Description de la prestation"
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
                    <TextInput
                      style={styles.lineInput}
                      value={line.quantity}
                      onChangeText={(t) => updateLine(i, { quantity: t })}
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View style={styles.lineFieldUnit}>
                    <Text style={styles.lineFieldLabel}>Unité</Text>
                    <TextInput
                      style={styles.lineInput}
                      value={line.unit}
                      onChangeText={(t) => updateLine(i, { unit: t, unitAuto: false })}
                      placeholder="pce, h, m²…"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View style={styles.lineFieldPrice}>
                    <Text style={styles.lineFieldLabel}>Prix unit. CHF</Text>
                    <TextInput
                      style={styles.lineInput}
                      value={line.unitPrice}
                      onChangeText={(t) => updateLine(i, { unitPrice: t })}
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
                {priceCoherence !== null && priceCoherence < 97 && bestMatch ? (
                  <Text
                    style={[
                      styles.priceCoherence,
                      priceCoherence < 60
                        ? styles.priceCoherenceLow
                        : priceCoherence < 85
                          ? styles.priceCoherenceMid
                          : styles.priceCoherenceHigh,
                    ]}
                  >
                    {priceCoherence}% cohérent avec l’historique (CHF {bestMatch.unitPrice.toFixed(2)} habituellement)
                  </Text>
                ) : null}
                <Text style={styles.lineTotal}>Sous-total : CHF {lineTotal.toFixed(2)}</Text>
              </View>
            );
          })}

          <Pressable style={styles.addLine} onPress={addLine}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.addLineText}>Ajouter une ligne</Text>
          </Pressable>

          <Text style={styles.total}>Total HT estimé : CHF {total.toFixed(2)}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Créer le devis" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dictateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.xs,
  },
  dictateButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  dictateButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  dictateButtonTextActive: {
    color: '#fff',
  },
  notes: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
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
  lineCardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  priceCoherence: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  priceCoherenceHigh: {
    color: colors.success,
  },
  priceCoherenceMid: {
    color: colors.accent,
  },
  priceCoherenceLow: {
    color: colors.danger,
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
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
});
