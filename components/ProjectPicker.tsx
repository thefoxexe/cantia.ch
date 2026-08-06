import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { Project } from '../lib/types';

// Optional chantier link for a devis — purely organizational (it's what
// lets the Rentabilité tab know which accepted devis count as revenue for
// which chantier). Leaving it unset doesn't block anything else about the
// devis, so this is a lightweight picker, not a required field.
export function ProjectPicker({
  organizationId,
  selectedProject,
  onSelect,
}: {
  organizationId: string;
  selectedProject: Project | null;
  onSelect: (project: Project | null) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
  }, [visible, organizationId]);

  function pick(project: Project | null) {
    onSelect(project);
    setVisible(false);
    setSearch('');
  }

  const filtered = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || (p.client_name ?? '').toLowerCase().includes(q);
  });

  return (
    <>
      {selectedProject ? (
        <Pressable onPress={() => setVisible(true)} style={styles.selectedCard}>
          <View style={styles.selectedIcon}>
            <Feather name="layers" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedLabel}>Chantier lié</Text>
            <Text style={styles.selectedName}>{selectedProject.name}</Text>
            {selectedProject.client_name ? <Text style={styles.selectedMeta}>{selectedProject.client_name}</Text> : null}
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              pick(null);
            }}
            hitSlop={8}
            style={styles.selectedClear}
          >
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      ) : (
        <Pressable onPress={() => setVisible(true)} style={styles.trigger}>
          <Feather name="layers" size={16} color={colors.primary} />
          <Text style={styles.triggerText}>Lier à un chantier (optionnel)</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
        </Pressable>
      )}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Lier à un chantier</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={8}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.searchRow}>
              <Feather name="search" size={14} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher un chantier"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>
            {selectedProject ? (
              <Pressable onPress={() => pick(null)} style={styles.clearRow}>
                <Feather name="x-circle" size={15} color={colors.textMuted} />
                <Text style={styles.clearRowText}>Ne lier à aucun chantier</Text>
              </Pressable>
            ) : null}
            <ScrollView style={styles.list}>
              {loading ? (
                <Text style={styles.hint}>Chargement…</Text>
              ) : filtered.length === 0 ? (
                <Text style={styles.hint}>Aucun chantier.</Text>
              ) : (
                filtered.map((p) => (
                  <Pressable key={p.id} onPress={() => pick(p)} style={styles.projectRow}>
                    <View>
                      <Text style={styles.projectName}>{p.name}</Text>
                      {p.client_name ? <Text style={styles.projectMeta}>{p.client_name}</Text> : null}
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))
              )}
            </ScrollView>
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
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  triggerText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  selectedIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selectedName: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  selectedMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 1,
  },
  selectedClear: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  clearRowText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  list: {
    maxHeight: 320,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  projectName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  projectMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
