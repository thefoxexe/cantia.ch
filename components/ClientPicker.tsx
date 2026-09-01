import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { listClients, createClient } from '../lib/api/clients';
import { Button, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useTranslation } from '../lib/translations';
import type { Client, ClientType } from '../lib/types';

// Trigger + modal used from devis/facture creation to fill the client fields
// from a saved contact in one tap, or create a new one inline without
// leaving the form. Selecting a contact only copies its fields into the
// caller's own state (name/address/email) — devis/factures keep their own
// free-text columns, this is purely a fast-fill shortcut.
export function ClientPicker({ organizationId, onSelect }: { organizationId: string; onSelect: (client: Client) => void }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const [newType, setNewType] = useState<ClientType>('particulier');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    listClients(organizationId).then((data) => {
      setClients(data);
      setLoading(false);
    });
  }, [visible, organizationId]);

  function close() {
    setVisible(false);
    setCreating(false);
    setSearch('');
    setError(null);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewType('particulier');
  }

  function pick(client: Client) {
    onSelect(client);
    close();
  }

  async function handleCreate() {
    if (!newName.trim()) {
      setError(t('newClient.nameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    const { id, error: createError } = await createClient(organizationId, {
      type: newType,
      name: newName.trim(),
      company_name: null,
      email: newEmail.trim() || null,
      phone: newPhone.trim() || null,
      address: newAddress.trim() || null,
      notes: null,
    });
    setSaving(false);
    if (createError || !id) {
      setError(createError ?? t('newClient.createFailed'));
      return;
    }
    pick({
      id,
      organization_id: organizationId,
      type: newType,
      name: newName.trim(),
      company_name: null,
      email: newEmail.trim() || null,
      phone: newPhone.trim() || null,
      address: newAddress.trim() || null,
      notes: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const filtered = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company_name?.toLowerCase().includes(q);
  });

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={styles.trigger}>
        <Feather name="users" size={15} color={colors.primary} />
        <Text style={styles.triggerText}>{t('clientPicker.trigger')}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{creating ? t('clientPicker.titleNew') : t('clientPicker.titlePick')}</Text>
              <Pressable onPress={close} hitSlop={8}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {creating ? (
              <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.typeRow}>
                  {(['particulier', 'entreprise'] as ClientType[]).map((ct) => (
                    <Pressable
                      key={ct}
                      onPress={() => setNewType(ct)}
                      style={[styles.typeChip, newType === ct && styles.typeChipActive]}
                    >
                      <Text style={[styles.typeChipText, newType === ct && styles.typeChipTextActive]}>
                        {ct === 'particulier' ? t('newClient.typeParticulier') : t('newClient.typeEntreprise')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Field label={t('newClient.nameLabel')} value={newName} onChangeText={setNewName} placeholder={t('newClient.namePlaceholder')} />
                <Field label={t('newClient.emailLabel')} value={newEmail} onChangeText={setNewEmail} placeholder={t('newClient.emailPlaceholder')} keyboardType="email-address" autoCapitalize="none" />
                <Field label={t('newClient.phoneLabel')} value={newPhone} onChangeText={setNewPhone} placeholder="+41 79 000 00 00" keyboardType="phone-pad" />
                <Field label={t('newClient.addressLabel')} value={newAddress} onChangeText={setNewAddress} placeholder={t('newClient.addressPlaceholder')} />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={styles.formActions}>
                  <Button title={t('clientPicker.back')} variant="secondary" onPress={() => setCreating(false)} style={{ flex: 1 }} />
                  <Button title={t('clientPicker.createAndPick')} onPress={handleCreate} loading={saving} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            ) : (
              <>
                <View style={styles.searchRow}>
                  <Feather name="search" size={14} color={colors.textMuted} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t('clientPicker.searchPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    style={styles.searchInput}
                    autoCapitalize="none"
                  />
                </View>
                <Pressable onPress={() => setCreating(true)} style={styles.newRow}>
                  <Feather name="plus" size={15} color={colors.primary} />
                  <Text style={styles.newRowText}>{t('clientPicker.newContact')}</Text>
                </Pressable>
                <ScrollView style={styles.list}>
                  {loading ? (
                    <Text style={styles.hint}>{t('clientPicker.loading')}</Text>
                  ) : filtered.length === 0 ? (
                    <Text style={styles.hint}>{t('clientPicker.empty')}</Text>
                  ) : (
                    filtered.map((c) => (
                      <Pressable key={c.id} onPress={() => pick(c)} style={styles.clientRow}>
                        <View>
                          <Text style={styles.clientName}>{c.name}</Text>
                          <Text style={styles.clientMeta}>{[c.company_name, c.email].filter(Boolean).join(' · ') || t('clientPicker.noInfo')}</Text>
                        </View>
                        <Feather name="chevron-right" size={16} color={colors.textMuted} />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  triggerText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  newRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  newRowText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  list: {
    maxHeight: 320,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clientName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  clientMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  form: {
    gap: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  typeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  typeChipTextActive: {
    color: colors.primary,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
});
