import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { confirm } from '../../lib/confirm';
import { deleteTemplate, listTemplates, updateTemplate, type ScheduleTemplate } from '../../lib/schedule/api';
import { fill } from '../../lib/schedule/copy';
import { useScheduleCopy } from '../../lib/schedule/useCopy';
import { VILLA_TEMPLATE, templateStats, type TemplateData } from '../../lib/schedule/templates';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { tradeColor } from './GanttView';

// Catalogue › Plannings: the company's planning templates (saved from a
// chantier), plus the built-in villa one, read only.
export function TemplatesCatalog({ organizationId, canManage, userId }: { organizationId: string; canManage: boolean; userId: string | null }) {
  const c = useScheduleCopy();
  const [list, setList] = useState<ScheduleTemplate[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => listTemplates(organizationId).then(setList), [organizationId]);
  useEffect(() => {
    load();
  }, [load]);

  const mayEdit = (t: ScheduleTemplate) => canManage || (!!userId && t.created_by === userId);

  const card = (key: string, name: string, description: string | null, data: TemplateData, own?: ScheduleTemplate) => {
    const st = templateStats(data);
    const expanded = open === key;
    return (
      <View key={key} style={styles.card}>
        <Pressable onPress={() => setOpen(expanded ? null : key)} style={styles.head}>
          <View style={[styles.icon, !own && { backgroundColor: colors.surfaceAlt }]}>
            <Feather name={own ? 'bookmark' : 'layers'} size={16} color={own ? colors.primary : colors.textMuted} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            {renaming?.id === key ? (
              <TextInput
                value={renaming.name}
                onChangeText={(name) => setRenaming({ id: key, name })}
                autoFocus
                style={styles.input}
                onSubmitEditing={async () => {
                  if (!renaming.name.trim()) return;
                  const { error: e } = await updateTemplate(key, { name: renaming.name.trim() });
                  setError(e);
                  setRenaming(null);
                  load();
                }}
              />
            ) : (
              <Text style={styles.name} numberOfLines={1}>
                {name}
                {!own ? <Text style={styles.badge}>{`  ${c.builtIn}`}</Text> : null}
              </Text>
            )}
            <Text style={styles.meta} numberOfLines={2}>
              {description ? `${description} · ` : ''}
              {fill(c.templateStats, { p: st.phases, t: st.tasks + st.milestones, d: st.days })}
            </Text>
          </View>
          {own && mayEdit(own) ? (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Pressable hitSlop={6} style={styles.iconBtn} onPress={() => setRenaming({ id: key, name })} accessibilityLabel={c.rename}>
                <Feather name="edit-2" size={14} color={colors.textMuted} />
              </Pressable>
              <Pressable
                hitSlop={6}
                style={styles.iconBtn}
                accessibilityLabel={c.delete}
                onPress={async () => {
                  if (!(await confirm(c.delete, fill(c.deleteConfirm, { name })))) return;
                  const { error: e } = await deleteTemplate(key);
                  setError(e);
                  load();
                }}
              >
                <Feather name="trash-2" size={14} color={colors.danger} />
              </Pressable>
            </View>
          ) : null}
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
        </Pressable>
        {expanded ? (
          <View style={styles.lines}>
            {data.items.map((it) => (
              <View key={it.key} style={[styles.line, it.kind === 'phase' && styles.phaseLine, it.parent ? { paddingLeft: spacing.lg } : null]}>
                {it.kind === 'milestone' ? <Text style={styles.diamond}>◆</Text> : it.trade ? <View style={[styles.dot, { backgroundColor: tradeColor(it.trade) }]} /> : null}
                <Text style={[styles.lineName, it.kind === 'phase' && { fontWeight: '800' }]} numberOfLines={1}>
                  {it.name}
                </Text>
                {it.trade && it.kind !== 'phase' ? <Text style={styles.meta}>{it.trade}</Text> : null}
                {it.kind === 'task' && it.duration ? <Text style={styles.dur}>{`${it.duration} ${c.days}`}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}>
      <View style={styles.hint}>
        <Feather name="info" size={15} color={colors.primary} />
        <Text style={[styles.meta, { flex: 1, color: colors.text }]}>{c.catalogHint}</Text>
      </View>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {list && !list.length ? <Text style={styles.meta}>{c.noTemplates}</Text> : null}
      {(list ?? []).map((t) => card(t.id, t.name, t.description, t.data, t))}
      {card('villa', c.createVilla, null, VILLA_TEMPLATE)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  icon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  badge: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  meta: { fontSize: fontSize.xs, color: colors.textMuted },
  input: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 6, fontSize: fontSize.md, color: colors.text },
  lines: { borderTopWidth: 1, borderTopColor: colors.border },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  phaseLine: { backgroundColor: '#F4F1EC' },
  lineName: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  dur: { fontSize: fontSize.xs, color: colors.text, fontVariant: ['tabular-nums'], minWidth: 40, textAlign: 'right' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  diamond: { fontSize: 10, color: colors.text },
  hint: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
});
