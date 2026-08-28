import { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { Button, Card, Screen } from '../../../../components/ui';
import { ClientPicker } from '../../../../components/ClientPicker';
import { ProjectPicker } from '../../../../components/ProjectPicker';
import { TramePicker } from '../../../../components/TramePicker';
import { DocumentPreview } from '../../../../components/DocumentPreview';
import { colors, fontSize, radius, spacing, breakpoints } from '../../../../lib/theme';
import { fetchCatalog, findMatches, guessUnit, normalizeDescription, updateCatalogItemPrice, type CatalogEntry } from '../../../../lib/catalog';
import { generateDevisLines } from '../../../../lib/api/ai';
import { useDictation } from '../../../../lib/useDictation';
import type { DevisTrameItem, Project } from '../../../../lib/types';

interface PriceMismatch {
  catalogItemId: string;
  description: string;
  unit: string;
  catalogPrice: number;
  enteredPrice: number;
  updateCatalog: boolean;
}

type DictationTarget = { type: 'line'; index: number } | { type: 'factureLines' };

interface Line {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  unitAuto: boolean;
  needsPrice?: boolean;
}

function emptyLine(): Line {
  return { description: '', quantity: '1', unit: 'pce', unitPrice: '0', unitAuto: true };
}

// Direct facture creation — same line-item editor as devis/new.tsx (catalog
// matching, dictation, trames) but writing straight to factures/facture_items
// instead of going through a devis first. No client signature step: a
// facture doesn't carry the client-signature block a devis PDF does.
export default function NewFactureScreen() {
  const { organization, user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const [previewVisible, setPreviewVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [priceMismatches, setPriceMismatches] = useState<PriceMismatch[] | null>(null);
  // A remise is represented as one more ordinary (negative) line item rather
  // than a separate schema field — every place that already sums
  // facture_items (PDF, portail client, paiements, trésorerie, l'envoi vers
  // Bexio) picks it up automatically, with no special-casing needed and no
  // way for the discount to drift out of sync between screens.
  const [discountPercent, setDiscountPercent] = useState('');

  useEffect(() => {
    if (!organization) return;
    fetchCatalog(organization.id).then(setCatalog);
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

  function applyTrameItems(items: DevisTrameItem[]) {
    const newLines: Line[] = items.map((it) => ({
      description: it.description,
      quantity: '1',
      unit: it.unit || 'pce',
      unitPrice: String(it.unit_price),
      unitAuto: false,
    }));
    setLines((prev) => {
      const isBlankStarter = prev.length === 1 && !prev[0].description.trim();
      return isBlankStarter ? newLines : [...prev, ...newLines];
    });
  }

  const [dictationTarget, setDictationTarget] = useState<DictationTarget | null>(null);
  const dictationBaseRef = useRef('');
  const factureLinesTranscriptRef = useRef('');
  const [factureLinesTranscript, setFactureLinesTranscript] = useState('');
  const [generatingLines, setGeneratingLines] = useState(false);
  const [linesDictationError, setLinesDictationError] = useState<string | null>(null);
  const dictation = useDictation((sessionTranscript) => {
    const base = dictationBaseRef.current;
    const merged = base + (base && sessionTranscript ? ' ' : '') + sessionTranscript;
    if (dictationTarget?.type === 'line') updateLine(dictationTarget.index, { description: merged });
    else if (dictationTarget?.type === 'factureLines') {
      factureLinesTranscriptRef.current = merged;
      setFactureLinesTranscript(merged);
    }
  });

  async function toggleDictation(target: DictationTarget) {
    if (dictation.listening) {
      const wasFactureLines = dictationTarget?.type === 'factureLines';
      await dictation.stop();
      if (wasFactureLines) await generateLinesFromDictation();
      return;
    }
    if (target.type === 'factureLines') {
      factureLinesTranscriptRef.current = '';
      setFactureLinesTranscript('');
      setLinesDictationError(null);
    }
    dictationBaseRef.current = target.type === 'line' ? lines[target.index].description : '';
    setDictationTarget(target);
    const started = await dictation.start('fr-FR');
    if (!started) {
      Alert.alert('Permission requise', 'Autorisez l’accès au microphone pour dicter.');
    }
  }

  function isDictating(target: DictationTarget) {
    if ((!dictation.listening && !dictation.transcribing) || !dictationTarget) return false;
    if (target.type === 'factureLines') return dictationTarget.type === 'factureLines';
    return dictationTarget.type === 'line' && target.type === 'line' && dictationTarget.index === target.index;
  }

  function dictationLabel(target: DictationTarget, idleLabel: string, listeningLabel: string): string {
    if (!isDictating(target)) return idleLabel;
    return dictation.transcribing ? 'Transcription…' : listeningLabel;
  }

  async function generateLinesFromDictation() {
    const transcript = factureLinesTranscriptRef.current.trim();
    if (!transcript || !organization) return;
    setGeneratingLines(true);
    setLinesDictationError(null);
    const catalogPayload = catalog.slice(0, 150).map((c) => ({ description: c.description, unit: c.unit, unitPrice: c.unitPrice }));
    const { lines: aiLines, error: err } = await generateDevisLines(transcript, catalogPayload, organization.id);
    setGeneratingLines(false);
    if (err || !aiLines || aiLines.length === 0) {
      setLinesDictationError(err ?? "Aucune position n'a été comprise dans la dictée, réessayez.");
      return;
    }
    const newLines: Line[] = aiLines.map((l) => ({
      description: l.description,
      quantity: String(l.quantity),
      unit: l.unit,
      unitPrice: l.unitPrice != null ? String(l.unitPrice) : '0',
      unitAuto: false,
      needsPrice: l.unitPrice == null,
    }));
    setLines((prev) => {
      const isBlankStarter = prev.length === 1 && !prev[0].description.trim();
      return isBlankStarter ? newLines : [...prev, ...newLines];
    });
    factureLinesTranscriptRef.current = '';
    setFactureLinesTranscript('');
  }

  const subtotal = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const discountAmount = Math.max(0, Math.min(100, Number(discountPercent) || 0)) > 0 ? subtotal * (Math.min(100, Number(discountPercent)) / 100) : 0;
  const total = subtotal - discountAmount;

  // Turns the discount percentage into the one negative line item that
  // actually gets stored/sent — see the discountPercent state comment for
  // why this beats a dedicated column.
  function buildItemsPayload(factureId: string, validLines: Line[]): { facture_id: string; description: string; quantity: number; unit: string; unit_price: number; sort_order: number }[] {
    const payload = validLines.map((l, i) => ({
      facture_id: factureId,
      description: l.description.trim(),
      quantity: Number(l.quantity) || 1,
      unit: l.unit.trim() || 'pce',
      unit_price: Number(l.unitPrice) || 0,
      sort_order: i,
    }));
    if (discountAmount > 0) {
      payload.push({
        facture_id: factureId,
        description: `Remise (${Number(discountPercent)}%)`,
        quantity: 1,
        unit: 'pce',
        unit_price: -Math.round(discountAmount * 100) / 100,
        sort_order: payload.length,
      });
    }
    return payload;
  }

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
    if (!organization) return;
    if (!clientName.trim()) {
      setError('Le nom du client est requis.');
      return;
    }
    const validLines = lines.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      setError('Ajoutez au moins une ligne de facture.');
      return;
    }
    setError(null);

    const mismatches = computeMismatches(validLines);
    if (mismatches.length > 0) {
      setPriceMismatches(mismatches);
      return;
    }
    await submitFacture(validLines, []);
  }

  async function submitFacture(validLines: Line[], mismatches: PriceMismatch[]) {
    if (!organization) return;
    setLoading(true);

    await Promise.all(
      mismatches.filter((m) => m.updateCatalog).map((m) => updateCatalogItemPrice(m.catalogItemId, m.enteredPrice, m.unit)),
    );

    const { data: facture, error: factureError } = await supabase
      .from('factures')
      .insert({
        organization_id: organization.id,
        client_name: clientName.trim(),
        client_address: clientAddress.trim() || null,
        client_email: clientEmail.trim() || null,
        client_id: clientId,
        project_id: selectedProject?.id ?? null,
        vat_rate: organization.default_vat_rate,
        created_by: user?.id,
      })
      .select()
      .single();

    if (factureError || !facture) {
      setError(factureError?.message ?? 'Échec de la création de la facture');
      setLoading(false);
      return;
    }

    const itemsPayload = buildItemsPayload(facture.id, validLines);

    const { error: itemsError } = await supabase.from('facture_items').insert(itemsPayload);
    setLoading(false);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    router.replace(`/(app)/devis/factures/${facture.id}`);
  }

  function toggleMismatchUpdate(catalogItemId: string) {
    setPriceMismatches((prev) => (prev ? prev.map((m) => (m.catalogItemId === catalogItemId ? { ...m, updateCatalog: !m.updateCatalog } : m)) : prev));
  }

  async function confirmMismatchesAndSubmit() {
    if (!priceMismatches) return;
    const mismatches = priceMismatches;
    const validLines = lines.filter((l) => l.description.trim());
    setPriceMismatches(null);
    await submitFacture(validLines, mismatches);
  }

  const previewNode = (
    <DocumentPreview
      kind="facture"
      organization={organization}
      clientName={clientName}
      clientAddress={clientAddress}
      clientEmail={clientEmail}
      projectName={selectedProject?.name}
      lines={lines}
      discountPercent={discountPercent}
    />
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={isDesktop ? styles.layoutDesktop : undefined}>
        <View style={[styles.content, isDesktop && styles.contentDesktop]}>
          <Text style={styles.sectionTitle}>Client</Text>
          {organization ? (
            <ClientPicker
              organizationId={organization.id}
              onSelect={(client) => {
                setClientName(client.name);
                setClientAddress(client.address ?? '');
                setClientEmail(client.email ?? '');
                setClientId(client.id);
              }}
            />
          ) : null}
          {clientName ? (
            <Card style={styles.selectedClientCard}>
              <Text style={styles.selectedClientName}>{clientName}</Text>
              {clientAddress ? <Text style={styles.selectedClientMeta}>{clientAddress}</Text> : null}
              {clientEmail ? <Text style={styles.selectedClientMeta}>{clientEmail}</Text> : null}
            </Card>
          ) : null}

          <Text style={styles.sectionTitle}>Chantier</Text>
          <Text style={styles.sectionHint}>Optionnel — permet de retrouver cette facture depuis la fiche du chantier et de suivre sa rentabilité.</Text>
          {organization ? (
            <ProjectPicker organizationId={organization.id} selectedProject={selectedProject} onSelect={setSelectedProject} />
          ) : null}

          <Text style={styles.sectionTitle}>Lignes de la facture</Text>
          {organization ? <TramePicker organizationId={organization.id} onSelect={applyTrameItems} /> : null}
          {dictation.supported ? (
            <View style={styles.dictateLinesCard}>
              <Pressable
                onPress={() => toggleDictation({ type: 'factureLines' })}
                disabled={generatingLines}
                style={[styles.dictateLinesButton, isDictating({ type: 'factureLines' }) && styles.dictateLinesButtonActive]}
              >
                {generatingLines ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Feather name="mic" size={16} color={isDictating({ type: 'factureLines' }) ? '#fff' : colors.primary} />
                )}
                <Text
                  style={[
                    styles.dictateLinesButtonText,
                    isDictating({ type: 'factureLines' }) && styles.dictateLinesButtonTextActive,
                  ]}
                >
                  {generatingLines
                    ? 'Analyse des positions…'
                    : dictationLabel({ type: 'factureLines' }, 'Dicter les positions de la facture', 'Écoute… (touchez pour arrêter)')}
                </Text>
              </Pressable>
              {isDictating({ type: 'factureLines' }) && factureLinesTranscript ? (
                <Text style={styles.dictateLinesPreview} numberOfLines={3}>
                  {factureLinesTranscript}
                </Text>
              ) : null}
              {linesDictationError ? <Text style={styles.dictateLinesError}>{linesDictationError}</Text> : null}
            </View>
          ) : null}
          {lines.map((line, i) => {
            const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
            const matches = findMatches(catalog, line.description);
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
                          {dictationLabel({ type: 'line', index: i }, 'Dicter', 'Écoute…')}
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
                      style={[styles.lineInput, line.needsPrice && styles.lineInputNeedsPrice]}
                      value={line.unitPrice}
                      onChangeText={(t) => updateLine(i, { unitPrice: t, needsPrice: false })}
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
                {line.needsPrice ? (
                  <View style={styles.needsPriceBadge}>
                    <Feather name="alert-triangle" size={11} color={colors.warning} />
                    <Text style={styles.needsPriceText}>Pas de prix connu pour cet article — à compléter</Text>
                  </View>
                ) : null}
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

          <View style={styles.discountRow}>
            <Text style={styles.discountLabel}>Remise globale (%)</Text>
            <TextInput
              style={styles.discountInput}
              value={discountPercent}
              onChangeText={setDiscountPercent}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {discountAmount > 0 ? (
            <>
              <Text style={styles.totalsSubline}>Sous-total : CHF {subtotal.toFixed(2)}</Text>
              <Text style={styles.totalsSubline}>Remise : − CHF {discountAmount.toFixed(2)}</Text>
            </>
          ) : null}
          <Text style={styles.total}>Total HT estimé : CHF {total.toFixed(2)}</Text>

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

          <Button title="Créer la facture" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} />
        </View>
        {isDesktop ? <View style={styles.previewColumn}>{previewNode}</View> : null}
        </View>
      </ScrollView>

      {!isDesktop ? (
        <Pressable style={styles.previewFab} onPress={() => setPreviewVisible(true)}>
          <Feather name="eye" size={16} color="#fff" />
          <Text style={styles.previewFabText}>Aperçu</Text>
        </Pressable>
      ) : null}

      <Modal visible={previewVisible} animationType="slide" transparent onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aperçu de la facture</Text>
              <Pressable hitSlop={8} onPress={() => setPreviewVisible(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>{previewNode}</View>
          </View>
        </View>
      </Modal>

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
                Le prix saisi diffère de celui déjà connu pour {priceMismatches?.length === 1 ? 'cette position' : 'ces positions'}. Choisissez, pour
                chacune, si le nouveau prix doit être enregistré dans le catalogue ou rester une exception pour cette facture.
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
                    <Pressable
                      style={[styles.mismatchChoice, !m.updateCatalog && styles.mismatchChoiceActive]}
                      onPress={() => m.updateCatalog && toggleMismatchUpdate(m.catalogItemId)}
                    >
                      <Text style={[styles.mismatchChoiceText, !m.updateCatalog && styles.mismatchChoiceTextActive]}>
                        Garder l'écart pour cette facture
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.mismatchChoice, m.updateCatalog && styles.mismatchChoiceActive]}
                      onPress={() => !m.updateCatalog && toggleMismatchUpdate(m.catalogItemId)}
                    >
                      <Text style={[styles.mismatchChoiceText, m.updateCatalog && styles.mismatchChoiceTextActive]}>Mettre à jour le catalogue</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <Button title="Confirmer et créer la facture" onPress={confirmMismatchesAndSubmit} loading={loading} style={{ marginTop: spacing.md }} />
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
  layoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
    maxWidth: 1120,
    width: '100%',
    alignSelf: 'center',
  },
  contentDesktop: {
    flex: 1,
    maxWidth: 660,
    alignSelf: 'stretch',
  },
  previewColumn: {
    width: 380,
    position: 'sticky' as 'relative',
    top: spacing.xl,
  },
  previewFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  previewFabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.sm,
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
  selectedClientCard: {
    marginTop: spacing.xs,
  },
  selectedClientName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  selectedClientMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
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
  dictateLinesCard: {
    borderWidth: 1,
    borderColor: colors.primarySoft,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  dictateLinesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  dictateLinesButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  dictateLinesButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  dictateLinesButtonTextActive: {
    color: '#fff',
  },
  dictateLinesPreview: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  dictateLinesError: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  needsPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  needsPriceText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.warning,
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
  lineInputNeedsPrice: {
    borderColor: colors.warning,
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
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  discountLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  discountInput: {
    width: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    height: 36,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.bg,
    textAlign: 'right',
  },
  totalsSubline: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: 2,
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
