import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../lib/translations';
import { SECTORS, isBuildingTrade, sectorOf } from '../lib/trades';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Secteur d'activité (drop-down list), then the trades inside it as chips.
// Used at sign-up and in Paramètres › Entreprise.
export function SectorPicker({
  trade,
  specialties,
  onChange,
  disabled,
  labelStyle,
}: {
  trade: string | null;
  specialties: string[];
  onChange: (trade: string, specialties: string[]) => void;
  disabled?: boolean;
  labelStyle?: object;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const sector = sectorOf(trade);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTORS.filter((s) => !q || String(t(`sectors.${s.key}` as any)).toLowerCase().includes(q) || s.specialties.some((k) => String(t(`specialties.${k}` as any)).toLowerCase().includes(q)));
  }, [query, t]);

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[styles.label, labelStyle]}>{t('trades.sectorLabel')}</Text>
      <Pressable disabled={disabled} onPress={() => setOpen(true)} style={[styles.field, disabled && { opacity: 0.6 }]}>
        <Text style={[styles.value, !sector && { color: colors.textMuted }]} numberOfLines={1}>
          {sector ? t(`sectors.${sector.key}` as any) : t('trades.sectorPlaceholder')}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      {sector && sector.specialties.length ? (
        <>
          <Text style={[styles.label, labelStyle]}>{t('trades.specialtiesLabel')}</Text>
          <View style={styles.chips}>
            {sector.specialties.map((k) => {
              const on = specialties.includes(k);
              return (
                <Pressable
                  key={k}
                  disabled={disabled}
                  onPress={() => onChange(sector.label, on ? specialties.filter((x) => x !== k) : [...specialties, k])}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{t(`specialties.${k}` as any)}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
      {isBuildingTrade(trade) ? <Text style={styles.hint}>{t('trades.soumissionsHint')}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.search}>
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput value={query} onChangeText={setQuery} placeholder={t('trades.search')} placeholderTextColor={colors.textMuted} style={styles.searchInput} autoFocus />
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              {filtered.map((s) => {
                const on = sector?.key === s.key;
                return (
                  <Pressable
                    key={s.key}
                    onPress={() => {
                      // a new sector starts with no trades selected
                      onChange(s.label, on ? specialties : []);
                      setOpen(false);
                      setQuery('');
                    }}
                    style={({ hovered }: any) => [styles.option, (on || hovered) && { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Text style={[styles.optionText, on && { fontWeight: '800' }]}>{t(`sectors.${s.key}` as any)}</Text>
                    {on ? <Feather name="check" size={16} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 12 },
  value: { flex: 1, fontSize: fontSize.md, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextOn: { color: '#fff', fontWeight: '700' },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,20,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 440, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: fontSize.md, color: colors.text },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: spacing.md, borderRadius: radius.md },
  optionText: { fontSize: fontSize.md, color: colors.text },
});
