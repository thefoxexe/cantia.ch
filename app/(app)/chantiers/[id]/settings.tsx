import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';
import { Button, Card, Container, Field, Screen } from '../../../../components/ui';
import { SettingsHeader } from '../../../../components/SettingsHeader';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { OrganizationMember } from '../../../../lib/types';

const STATUSES: { key: string; label: string }[] = [
  { key: 'active', label: 'Actif' },
  { key: 'completed', label: 'Terminé' },
  { key: 'archived', label: 'Archivé' },
];

export default function ChantierSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('active');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single();
    if (project) {
      setName(project.name);
      setClientName(project.client_name ?? '');
      setAddress(project.address ?? '');
      setStatus(project.status);
      const { data: memberRows } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', project.organization_id)
        .order('created_at');
      setMembers(memberRows ?? []);
    }
    setLoaded(true);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase
      .from('projects')
      .update({
        name: name.trim(),
        client_name: clientName.trim() || null,
        address: address.trim() || null,
        status,
      })
      .eq('id', id);
    setSaving(false);
  }

  if (!loaded) {
    return (
      <Screen style={{ padding: spacing.xl }}>
        <Text>Chargement…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <SettingsHeader title="Paramètres du chantier" />

          <Field label="Nom du chantier" value={name} onChangeText={setName} />
          <Field label="Client" value={clientName} onChangeText={setClientName} placeholder="Nom du client" />
          <Field label="Adresse" value={address} onChangeText={setAddress} placeholder="Adresse du chantier" />

          <Text style={styles.fieldLabel}>Statut</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <Button
                key={s.key}
                title={s.label}
                variant={status === s.key ? 'primary' : 'secondary'}
                onPress={() => setStatus(s.key)}
                style={{ flex: 1 }}
              />
            ))}
          </View>

          <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />

          <Text style={styles.sectionTitle}>Accès</Text>
          <Card>
            <View style={styles.accessNote}>
              <Feather name="info" size={14} color={colors.textMuted} />
              <Text style={styles.accessNoteText}>
                Pour l'instant, tous les membres de votre équipe voient ce chantier. La restriction d'accès par
                chantier arrive dans une prochaine mise à jour.
              </Text>
            </View>
            {members.map((m, i) => (
              <View key={m.id} style={[styles.memberRow, i < members.length - 1 && styles.memberRowBorder]}>
                <Text style={styles.memberName}>{m.full_name || 'Membre'}</Text>
                <Text style={styles.memberRole}>
                  {m.role === 'owner' ? 'Propriétaire' : m.role === 'admin' ? 'Administrateur' : 'Membre'}
                </Text>
              </View>
            ))}
          </Card>
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
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  accessNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  accessNoteText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  memberRole: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
