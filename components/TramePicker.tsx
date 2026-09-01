import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { listTrames, fetchTrame } from '../lib/api/trames';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useTranslation } from '../lib/translations';
import type { DevisTrame, DevisTrameItem } from '../lib/types';

// Trigger + modal used from devis creation to pre-fill the line items from a
// saved trame in one tap — mirrors ClientPicker's shape, but there's no
// inline "create" mode here: a trame's item list is involved enough that it
// gets its own dedicated screen (devis/trames/new.tsx) instead.
export function TramePicker({ organizationId, onSelect }: { organizationId: string; onSelect: (items: DevisTrameItem[]) => void }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [trames, setTrames] = useState<DevisTrame[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    listTrames(organizationId).then((data) => {
      setTrames(data);
      setLoading(false);
    });
  }, [visible, organizationId]);

  function close() {
    setVisible(false);
    setSearch('');
  }

  async function pick(trame: DevisTrame) {
    setApplying(trame.id);
    const { items } = await fetchTrame(trame.id);
    setApplying(null);
    onSelect(items);
    close();
  }

  const filtered = trames.filter((tr) => !search.trim() || tr.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={styles.trigger}>
        <Feather name="layout" size={15} color={colors.primary} />
        <Text style={styles.triggerText}>{t('tramePicker.trigger')}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('tramePicker.title')}</Text>
              <Pressable onPress={close} hitSlop={8}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.searchRow}>
              <Feather name="search" size={14} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t('tramePicker.searchPlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>
            <ScrollView style={styles.list}>
              {loading ? (
                <Text style={styles.hint}>{t('tramePicker.loading')}</Text>
              ) : filtered.length === 0 ? (
                <Text style={styles.hint}>{t('tramePicker.empty')}</Text>
              ) : (
                filtered.map((tr, i) => (
                  <Pressable key={tr.id} disabled={applying === tr.id} onPress={() => pick(tr)} style={[styles.row, i > 0 && styles.rowBorder]}>
                    <Text style={styles.rowName}>{tr.name}</Text>
                    {applying === tr.id ? <Text style={styles.hint}>…</Text> : <Feather name="chevron-right" size={16} color={colors.textMuted} />}
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
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
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
  list: {
    maxHeight: 360,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
});
