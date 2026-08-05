import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { createClient } from '../../../lib/api/clients';
import { Button, Container, Field, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { ClientType } from '../../../lib/types';

export default function NewClientScreen() {
  const { organization } = useAuth();
  const router = useRouter();
  const [type, setType] = useState<ClientType>('particulier');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!organization) return;
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setSaving(true);
    setError(null);
    const { id, error: createError } = await createClient(organization.id, {
      type,
      name: name.trim(),
      company_name: companyName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (createError || !id) {
      setError(createError ?? 'Échec de la création.');
      return;
    }
    router.replace(`/(app)/clients/${id}`);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Nouveau client" backTo="/(app)/clients" />

          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeRow}>
            {(['particulier', 'entreprise'] as ClientType[]).map((t) => (
              <Pressable key={t} onPress={() => setType(t)} style={[styles.typeChip, type === t && styles.typeChipActive]}>
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                  {t === 'particulier' ? 'Particulier' : 'Entreprise'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Field label="Nom" value={name} onChangeText={setName} placeholder="Nom du contact" />
          {type === 'entreprise' ? (
            <Field label="Entreprise" value={companyName} onChangeText={setCompanyName} placeholder="Raison sociale" />
          ) : null}
          <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="client@exemple.ch" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="+41 79 000 00 00" keyboardType="phone-pad" />
          <Field label="Adresse" value={address} onChangeText={setAddress} placeholder="Adresse" />
          <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Notes internes" multiline style={styles.notes} />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Créer le client" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  typeChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  notes: {
    minHeight: 70,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
