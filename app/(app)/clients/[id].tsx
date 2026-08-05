import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { updateClient } from '../../../lib/api/clients';
import { confirm } from '../../../lib/confirm';
import { Button, Container, Field, LoadingScreen, PageHeader, Screen } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Client, ClientType } from '../../../lib/types';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [client, setClient] = useState<Client | null>(null);
  const [type, setType] = useState<ClientType>('particulier');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('clients').select('*').eq('id', id).single();
    if (!data) return;
    setClient(data);
    setType(data.type);
    setName(data.name);
    setCompanyName(data.company_name ?? '');
    setEmail(data.email ?? '');
    setPhone(data.phone ?? '');
    setAddress(data.address ?? '');
    setNotes(data.notes ?? '');
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: updateError } = await updateClient(id, {
      type,
      name: name.trim(),
      company_name: companyName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    load();
  }

  async function handleDelete() {
    const ok = await confirm('Supprimer ce client ?', `${client?.name ?? ''} sera définitivement supprimé.`);
    if (!ok) return;
    const { error: delError } = await supabase.from('clients').delete().eq('id', id);
    if (delError) {
      setError(delError.message);
      return;
    }
    router.replace('/(app)/clients');
  }

  if (!client) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader
            title="Client"
            backTo="/(app)/clients"
            right={
              isAdmin ? (
                <RowActionMenu
                  actions={[{ key: 'delete', icon: 'trash-2', label: 'Supprimer', danger: true, onPress: handleDelete }]}
                />
              ) : undefined
            }
          />

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
          <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
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
