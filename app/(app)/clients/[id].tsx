import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { addClientNote, deleteClientNote, getClientHistory, listClientNotes, updateClient, type ClientHistory } from '../../../lib/api/clients';
import { getClientBexioMapping } from '../../../lib/api/integrations';
import { confirm } from '../../../lib/confirm';
import { Button, Card, Container, EmptyState, Field, LoadingScreen, PageHeader, Screen, StatusBadge } from '../../../components/ui';
import { RowActionMenu } from '../../../components/RowActionMenu';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Client, ClientNote, ClientType } from '../../../lib/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role, user } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [client, setClient] = useState<Client | null>(null);
  const [type, setType] = useState<ClientType>('particulier');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<ClientHistory | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [bexioLinked, setBexioLinked] = useState(false);

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
    const [h, n, linked] = await Promise.all([getClientHistory(id), listClientNotes(id), getClientBexioMapping(data.organization_id, id)]);
    setHistory(h);
    setNotes(n);
    setBexioLinked(linked);
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
      notes: client?.notes ?? null,
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

  async function handleAddNote() {
    if (!newNote.trim() || !client) return;
    setAddingNote(true);
    const { error: noteError } = await addClientNote(client.organization_id, id, newNote.trim(), user?.id);
    setAddingNote(false);
    if (noteError) {
      setError(noteError);
      return;
    }
    setNewNote('');
    const n = await listClientNotes(id);
    setNotes(n);
  }

  async function handleDeleteNote(noteId: string) {
    const ok = await confirm('Supprimer cette note ?', 'Cette note sera définitivement supprimée.');
    if (!ok) return;
    await deleteClientNote(noteId);
    setNotes(await listClientNotes(id));
  }

  if (!client) {
    return (
      <Screen>
        <LoadingScreen />
      </Screen>
    );
  }

  const historyRows = history
    ? [
        ...history.devis.map((d) => ({ kind: 'Devis', label: d.number ?? 'Devis', status: d.status, date: d.created_at, href: `/(app)/devis/${d.id}` as const })),
        ...history.factures.map((f) => ({ kind: 'Facture', label: f.number ?? 'Facture', status: f.status, date: f.created_at, href: `/(app)/devis/factures/${f.id}` as const })),
        ...history.extraWorks.map((e) => ({ kind: 'Travaux suppl.', label: e.number ?? e.title, status: e.status, date: e.created_at, href: `/(app)/chantiers/${e.project_id}/travaux-supplementaires/${e.id}` as const })),
      ].sort((a, b) => b.date.localeCompare(a.date))
    : [];

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

          {bexioLinked ? (
            <View style={styles.bexioBadge}>
              <Feather name="check-circle" size={12} color={colors.success} />
              <Text style={styles.bexioBadgeText}>Lié à Bexio</Text>
            </View>
          ) : null}

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

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />

          <Text style={styles.sectionTitle}>Historique</Text>
          {historyRows.length === 0 ? (
            <Card style={{ marginBottom: spacing.lg }}>
              <EmptyState title="Aucun document lié" subtitle="Les devis, factures et travaux supplémentaires créés pour ce client apparaîtront ici." />
            </Card>
          ) : (
            <Card style={{ marginBottom: spacing.lg, gap: spacing.sm }}>
              {historyRows.map((row, i) => (
                <Pressable key={`${row.kind}-${i}`} onPress={() => router.push(row.href as any)} style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyKind}>{row.kind}</Text>
                    <Text style={styles.historyLabel}>{row.label}</Text>
                  </View>
                  <StatusBadge status={row.status} />
                  <Text style={styles.historyDate}>{formatDate(row.date)}</Text>
                </Pressable>
              ))}
            </Card>
          )}

          <Text style={styles.sectionTitle}>Notes</Text>
          <Card style={{ marginBottom: spacing.md }}>
            <Field
              label="Nouvelle note"
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Ajouter une note (visite, préférence, remarque...)"
              multiline
              style={styles.notes}
            />
            <Button title="Ajouter la note" icon="plus" variant="secondary" onPress={handleAddNote} loading={addingNote} disabled={!newNote.trim()} style={{ marginTop: spacing.sm }} />
          </Card>
          {notes.length === 0 ? (
            <EmptyState title="Aucune note" subtitle="Chaque note ajoutée reste horodatée, sans écraser les précédentes." />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {notes.map((n) => (
                <Card key={n.id} style={styles.noteCard}>
                  <Text style={styles.noteBody}>{n.body}</Text>
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>{formatDate(n.created_at)}</Text>
                    <Pressable onPress={() => handleDeleteNote(n.id)} hitSlop={8}>
                      <Feather name="trash-2" size={14} color={colors.textMuted} />
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )}
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
  bexioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  bexioBadgeText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  historyKind: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  historyLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  noteCard: {
    gap: spacing.xs,
  },
  noteBody: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  noteDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
