import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Field, Screen } from '../../../components/ui';
import { FeatureHint } from '../../../components/FeatureHint';
import { PdfTemplatePicker } from '../../../components/PdfTemplatePicker';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

interface Line {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

function emptyLine(): Line {
  return { description: '', quantity: '1', unit: 'pce', unitPrice: '0' };
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

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
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
            title="Choisissez le style de votre PDF"
            text="Sélectionnez le modèle utilisé pour vos devis ci-dessous. Vous pourrez toujours en changer depuis Compte."
          />

          <Text style={styles.sectionTitle}>Modèle de devis</Text>
          {organization ? (
            <PdfTemplatePicker
              organizationId={organization.id}
              kind="devis"
              hasLogo={!!organization?.logo_url}
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

          <Text style={styles.fieldLabel}>Notes de rendez-vous</Text>
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
                  onChangeText={(t) => updateLine(i, { description: t })}
                  placeholder="Description de la prestation"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
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
                      onChangeText={(t) => updateLine(i, { unit: t })}
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
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
});
