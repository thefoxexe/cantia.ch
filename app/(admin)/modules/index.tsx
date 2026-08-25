import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Container, EmptyState, Field, LoadingScreen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listModules, upsertModule } from '../../../lib/api/admin';
import type { AdminModuleSummary } from '../../../lib/types';

const VISIBILITY_LABEL: Record<string, string> = { standard: 'Standard', private: 'Privé', experimental: 'Beta' };
const STATUS_LABEL: Record<string, string> = { active: 'Actif', beta: 'Beta', disabled: 'Désactivé' };

function CreateModuleModal({ visible, onClose, onCreated }: { visible: boolean; onClose: () => void; onCreated: () => void }) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!key.trim() || !name.trim()) {
      setError('Clé et nom sont requis.');
      return;
    }
    setSaving(true);
    const { error: err } = await upsertModule({
      key: key.trim(),
      name: name.trim(),
      description: description.trim() || null,
      visibility: 'private',
      status: 'active',
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setKey('');
    setName('');
    setDescription('');
    onCreated();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Nouveau module privé</Text>
          <Field label="Clé (ex: field_service_workflow)" value={key} onChangeText={setKey} autoCapitalize="none" />
          <Field label="Nom affiché" value={name} onChangeText={setName} />
          <Field label="Description" value={description} onChangeText={setDescription} multiline />
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <View style={styles.modalActions}>
            <Button title="Annuler" variant="secondary" onPress={onClose} />
            <Button title="Créer" onPress={save} loading={saving} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function AdminModulesList() {
  const [modules, setModules] = useState<AdminModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    setModules(await listModules());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView>
      <Container style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Modules</Text>
          <Button title="Nouveau module" icon="plus" onPress={() => setModalVisible(true)} />
        </View>

        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : modules.length === 0 ? (
          <EmptyState title="Aucun module enregistré" subtitle="Créez le premier module privé avec le bouton ci-dessus." />
        ) : (
          <View style={styles.list}>
            {modules.map((mod) => (
              <View key={mod.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTitleLine}>
                    <Text style={styles.rowTitle}>{mod.name}</Text>
                    <Text style={styles.rowKey}>{mod.key}</Text>
                  </View>
                  {mod.description ? <Text style={styles.rowDescription}>{mod.description}</Text> : null}
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{VISIBILITY_LABEL[mod.visibility] ?? mod.visibility}</Text>
                </View>
                <View style={[styles.pill, mod.status === 'disabled' && styles.pillDisabled]}>
                  <Text style={styles.pillText}>{STATUS_LABEL[mod.status] ?? mod.status}</Text>
                </View>
                <Text style={styles.rowCount}>
                  {mod.organizations_count} entreprise{mod.organizations_count > 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Container>
      <CreateModuleModal visible={modalVisible} onClose={() => setModalVisible(false)} onCreated={load} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  rowKey: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  rowDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillDisabled: {
    backgroundColor: colors.border,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
