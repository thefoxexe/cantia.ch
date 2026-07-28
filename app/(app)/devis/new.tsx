import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button, Field, Screen } from '../../../components/ui';
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
    <Screen style={{ padding: spacing.xl }}>
      <ScrollView>
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
        {lines.map((line, i) => (
          <View key={i} style={styles.lineCard}>
            <TextInput
              style={styles.lineDesc}
              value={line.description}
              onChangeText={(t) => updateLine(i, { description: t })}
              placeholder="Description de la prestation"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={styles.lineRow}>
              <TextInput
                style={styles.lineSmall}
                value={line.quantity}
                onChangeText={(t) => updateLine(i, { quantity: t })}
                placeholder="Qté"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={styles.lineSmall}
                value={line.unit}
                onChangeText={(t) => updateLine(i, { unit: t })}
                placeholder="Unité"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={styles.lineSmall}
                value={line.unitPrice}
                onChangeText={(t) => updateLine(i, { unitPrice: t })}
                placeholder="Prix CHF"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable onPress={() => removeLine(i)}>
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable style={styles.addLine} onPress={addLine}>
          <Text style={styles.addLineText}>+ Ajouter une ligne</Text>
        </Pressable>

        <Text style={styles.total}>Total HT estimé : CHF {total.toFixed(2)}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Créer le devis" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  lineDesc: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  lineSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    height: 38,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  remove: {
    fontSize: fontSize.lg,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
  addLine: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
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
