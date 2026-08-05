import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../../lib/auth-context';
import { confirm } from '../../../lib/confirm';
import { downloadTextFile } from '../../../lib/downloadFile';
import { Button, Card, EmptyState, Field, PageHeader, Screen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import {
  buildCatalogCsv,
  createCatalogItem,
  deleteCatalogItem,
  fetchCatalog,
  importCatalogItems,
  parseCatalogCsv,
  updateCatalogItem,
  type CatalogEntry,
} from '../../../lib/catalog';

export default function InventaireScreen() {
  const { organization, role } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const [editing, setEditing] = useState<CatalogEntry | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formUnit, setFormUnit] = useState('pce');
  const [formPrice, setFormPrice] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setCatalog(await fetchCatalog(organization.id));
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const sorted = [...catalog].sort((a, b) => b.count - a.count || b.lastUsedAt.localeCompare(a.lastUsedAt));
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((entry) => entry.description.toLowerCase().includes(q));
  }, [catalog, query]);

  function openCreate() {
    setEditing(null);
    setFormDescription('');
    setFormUnit('pce');
    setFormPrice('');
    setFormError(null);
    setModalVisible(true);
  }

  function openEdit(entry: CatalogEntry) {
    setEditing(entry);
    setFormDescription(entry.description);
    setFormUnit(entry.unit);
    setFormPrice(String(entry.unitPrice));
    setFormError(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!organization) return;
    if (!formDescription.trim()) {
      setFormError('La description est requise.');
      return;
    }
    const price = Number(formPrice.replace(',', '.')) || 0;
    setSaving(true);
    setFormError(null);
    const { error } = editing
      ? await updateCatalogItem(editing.id!, formDescription.trim(), formUnit.trim() || 'pce', price)
      : await createCatalogItem(organization.id, formDescription.trim(), formUnit.trim() || 'pce', price);
    setSaving(false);
    if (error) {
      setFormError(error);
      return;
    }
    setModalVisible(false);
    load();
  }

  async function handleDelete() {
    if (!editing?.id) return;
    const ok = await confirm('Supprimer cette prestation ?', `"${editing.description}" sera définitivement retirée de l'inventaire.`);
    if (!ok) return;
    setSaving(true);
    const { error } = await deleteCatalogItem(editing.id);
    setSaving(false);
    if (error) {
      setFormError(error);
      return;
    }
    setModalVisible(false);
    load();
  }

  async function handleImport() {
    if (!organization) return;
    setActionError(null);
    setImportSummary(null);
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;

    setImporting(true);
    try {
      const text = await fetch(result.assets[0].uri).then((r) => r.text());
      const parsed = parseCatalogCsv(text);
      if (parsed.error) {
        setActionError(parsed.error);
        return;
      }
      if (!parsed.items.length) {
        setActionError('Aucune ligne valide trouvée dans ce fichier.');
        return;
      }
      const { count, error } = await importCatalogItems(organization.id, parsed.items);
      if (error) {
        setActionError(error);
        return;
      }
      setImportSummary(
        `${count} prestation${count > 1 ? 's' : ''} importée${count > 1 ? 's' : ''}` +
          (parsed.skipped ? ` · ${parsed.skipped} ligne${parsed.skipped > 1 ? 's' : ''} ignorée${parsed.skipped > 1 ? 's' : ''} (sans titre)` : ''),
      );
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setImporting(false);
    }
  }

  async function handleExport() {
    setActionError(null);
    const csv = buildCatalogCsv(catalog);
    const { error } = await downloadTextFile('inventaire-cantia.csv', csv);
    if (error) setActionError(error);
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <View style={styles.container}>
        <PageHeader title="Inventaire" />
        <Text style={styles.pageSubtitle}>
          Les prix et unités déjà utilisés dans vos devis — Cantia les reconnaît et les suggère automatiquement.
        </Text>

        <View style={styles.toolbar}>
          <Button title="Nouvel article" icon="plus" onPress={openCreate} style={{ flex: Platform.OS === 'web' ? undefined : 1 }} />
          <Button title="Importer CSV" icon="upload" variant="secondary" onPress={handleImport} loading={importing} style={{ flex: Platform.OS === 'web' ? undefined : 1 }} />
          <Button title="Exporter CSV" icon="download" variant="secondary" onPress={handleExport} style={{ flex: Platform.OS === 'web' ? undefined : 1 }} />
        </View>
        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
        {importSummary ? <Text style={styles.importSummary}>{importSummary}</Text> : null}

        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une prestation…"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id ?? item.description}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xxl, gap: spacing.md }}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                title="Aucune entrée"
                subtitle="Créez un article, importez un CSV, ou laissez vos devis enrichir l'inventaire automatiquement."
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => openEdit(item)}>
              <Card style={styles.card}>
                <View style={styles.cardMain}>
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{item.unit}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.meta}>Utilisé {item.count} fois</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.meta}>{new Date(item.lastUsedAt).toLocaleDateString('fr-CH')}</Text>
                  </View>
                </View>
                <Text style={styles.price}>CHF {item.unitPrice.toFixed(2)}</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </Card>
            </Pressable>
          )}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Modifier la prestation' : 'Nouvel article'}</Text>
            <Field label="Description" value={formDescription} onChangeText={setFormDescription} multiline />
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Field label="Unité" value={formUnit} onChangeText={setFormUnit} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Prix unitaire (CHF)" value={formPrice} onChangeText={setFormPrice} keyboardType="decimal-pad" />
              </View>
            </View>
            {formError ? <Text style={styles.actionError}>{formError}</Text> : null}
            <View style={styles.modalActions}>
              <Button title="Annuler" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Enregistrer" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
            {editing && isAdmin ? (
              <Button title="Supprimer" variant="danger" icon="trash-2" onPress={handleDelete} style={styles.deleteButton} />
            ) : null}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  importSummary: {
    fontSize: fontSize.xs,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardMain: {
    flex: 1,
  },
  description: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  deleteButton: {
    marginTop: spacing.sm,
  },
});
