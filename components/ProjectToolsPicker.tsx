import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PROJECT_MODULE_PLAN_GATED, isModuleEnabled, projectModulesFor, type ModuleKey } from '../lib/modules';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { Organization, Plan } from '../lib/types';

const ICONS: Partial<Record<ModuleKey, keyof typeof Feather.glyphMap>> = {
  documents: 'folder',
  photos: 'camera',
  metre: 'list',
  gantt: 'bar-chart-2',
  subcontractors: 'briefcase',
  profitability: 'trending-up',
};

// The tools every new chantier starts with (each chantier can still switch
// them on or off in its own settings). Building companies also get the site
// tools here, ticked by default.
export function ProjectToolsPicker({
  organization,
  plan,
  value,
  onChange,
  disabled,
}: {
  organization: Pick<Organization, 'trade'> | null;
  plan: Plan | null;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: spacing.sm }}>
      {projectModulesFor(organization).map((m) => {
        const field = PROJECT_MODULE_PLAN_GATED[m.key];
        const gated = !!field && !!plan && !plan[field];
        const on = !gated && isModuleEnabled(value, m.key);
        return (
          <Pressable
            key={m.key}
            disabled={disabled || gated}
            onPress={() => onChange(on ? value.filter((k) => k !== m.key) : [...value, m.key])}
            style={[styles.row, on && styles.rowOn, gated && { opacity: 0.55 }]}
          >
            <View style={[styles.icon, on && { backgroundColor: colors.primary }]}>
              <Feather name={ICONS[m.key] ?? 'box'} size={16} color={on ? '#fff' : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t(`modules.${m.key}.label` as any)}</Text>
              <Text style={styles.desc}>{t(`modules.${m.key}.description` as any)}</Text>
              {gated ? <Text style={[styles.desc, { color: colors.primaryDark }]}>{t('newChantier.modulePlanGatedHint')}</Text> : null}
            </View>
            <View style={[styles.check, on && styles.checkOn]}>{on ? <Feather name="check" size={13} color="#fff" /> : null}</View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  rowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  icon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  desc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
