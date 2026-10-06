import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { StatusBadge } from '../ui';
import { useTranslation } from '../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { Project } from '../../lib/types';

// The chantier page on a computer: a working layout instead of the phone's
// stacked tiles. Left, what is used every day (notes, rapports) and the
// chantier's modules as one list; right, where the chantier stands (status,
// client, address) and what happened last.

type IconName = keyof typeof Feather.glyphMap;

export interface DeskItem {
  key: string;
  label: string;
  icon: IconName;
  route: string;
  subtitle: string | null;
  featured?: boolean;
}

interface Activity {
  id: string;
  kind: 'note' | 'photo' | 'voice' | 'report';
  text: string;
  at: string;
  route: string;
}

const STEPS = ['active', 'completed', 'archived'] as const;

export function ChantierDesk({ project, coverUrl, items }: { project: Project; coverUrl: string | null; items: DeskItem[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity[] | null>(null);
  const id = project.id;

  useEffect(() => {
    let live = true;
    Promise.all([
      supabase.from('feed_entries').select('id, type, body, caption, transcript, created_at').eq('project_id', id).order('created_at', { ascending: false }).limit(5),
      supabase.from('reports').select('id, title, created_at').eq('project_id', id).order('created_at', { ascending: false }).limit(3),
    ]).then(([feed, reports]) => {
      if (!live) return;
      const rows: Activity[] = [
        ...(feed.data ?? []).map((f) => ({
          id: f.id,
          kind: f.type as Activity['kind'],
          text: (f.body || f.caption || f.transcript || '').replace(/\s+/g, ' ').trim() || t(f.type === 'photo' ? 'chantierHub.activityPhoto' : f.type === 'voice' ? 'chantierHub.activityVoice' : 'chantierHub.activityNote'),
          at: f.created_at,
          route: `/(app)/chantiers/${id}/feed`,
        })),
        ...(reports.data ?? []).map((r) => ({ id: r.id, kind: 'report' as const, text: r.title, at: r.created_at, route: `/(app)/chantiers/${id}/rapports/${r.id}` })),
      ];
      setActivity(rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6));
    });
    return () => {
      live = false;
    };
  }, [id, t]);

  const featured = items.filter((it) => it.featured);
  const modules = items.filter((it) => !it.featured);
  const stepIndex = STEPS.indexOf(project.status as (typeof STEPS)[number]);
  const day = (iso: string) => new Date(iso).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const actionFor = (key: string) =>
    key === 'feed'
      ? { label: t('chantierHub.newNote'), route: `/(app)/chantiers/${id}/feed` }
      : key === 'reports'
        ? { label: t('chantierHub.newReport'), route: `/(app)/chantiers/${id}/rapport-new` }
        : null;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.page}>
        <View style={styles.head}>
          <Pressable onPress={() => router.replace('/(app)/chantiers')} style={styles.back} hitSlop={6}>
            <Feather name="arrow-left" size={15} color={colors.textMuted} />
            <Text style={styles.backText}>{t('nav.chantiers')}</Text>
          </Pressable>
          <View style={styles.titleRow}>
            {coverUrl ? <Image source={{ uri: coverUrl }} style={styles.cover} /> : null}
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                {project.reference ? <Text style={styles.ref}>{project.reference}</Text> : null}
                <Text style={styles.title} numberOfLines={2}>
                  {project.name}
                </Text>
                <StatusBadge status={project.status} />
              </View>
              {project.client_name || project.address ? (
                <Text style={styles.meta} numberOfLines={1}>
                  {[project.client_name, project.address].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={() => router.push(`/(app)/chantiers/${id}/settings`)} style={({ hovered }: any) => [styles.ghostBtn, hovered && styles.ghostBtnHover]}>
              <Feather name="settings" size={15} color={colors.text} />
              <Text style={styles.ghostBtnText}>{t('chantierHub.settings')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.main}>
            <View style={styles.dailyRow}>
              {featured.map((it) => {
                const action = actionFor(it.key);
                return (
                  <Pressable key={it.key} onPress={() => router.push(it.route as any)} style={({ hovered }: any) => [styles.daily, hovered && styles.cardHover]}>
                    <View style={styles.dailyTop}>
                      <View style={styles.iconBig}>
                        <Feather name={it.icon} size={20} color={colors.primary} />
                      </View>
                      <Feather name="arrow-up-right" size={16} color={colors.textMuted} />
                    </View>
                    <Text style={styles.dailyLabel}>{it.label}</Text>
                    <Text style={styles.dailySub}>{it.subtitle ?? ' '}</Text>
                    {action ? (
                      <Pressable onPress={() => router.push(action.route as any)} style={({ hovered }: any) => [styles.dailyAction, hovered && { backgroundColor: colors.primarySoft }]}>
                        <Feather name="plus" size={14} color={colors.primary} />
                        <Text style={styles.dailyActionText}>{action.label}</Text>
                      </Pressable>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {modules.length ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('chantierHub.modules')}</Text>
                {modules.map((it, i) => (
                  <Pressable key={it.key} onPress={() => router.push(it.route as any)} style={({ hovered }: any) => [styles.modRow, i > 0 && styles.modRowLine, hovered && styles.modRowHover]}>
                    <View style={styles.iconSmall}>
                      <Feather name={it.icon} size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.modLabel}>{it.label}</Text>
                      {it.subtitle ? (
                        <Text style={styles.modSub} numberOfLines={1}>
                          {it.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.side}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('chantierHub.state')}</Text>
              <View style={styles.steps}>
                {STEPS.map((s, i) => {
                  const done = stepIndex >= 0 && i <= stepIndex;
                  return (
                    <View key={s} style={styles.step}>
                      <View style={[styles.stepBar, done && styles.stepBarOn]} />
                      <Text style={[styles.stepText, i === stepIndex && styles.stepTextOn]}>{t(`common.projectStatus.${s}`)}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.infoList}>
                <Info label={t('chantierHub.client')} value={project.client_name} />
                <Info
                  label={t('chantierHub.address')}
                  value={project.address}
                  link={project.address ? { label: t('chantierHub.openMap'), url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}` } : undefined}
                />
                {project.contact_name || project.contact_phone || project.contact_email ? (
                  <Info label={t('projectInfo.sectionContact')} value={[project.contact_name, project.contact_phone, project.contact_email].filter(Boolean).join(' · ')} />
                ) : null}
                {project.start_date || project.end_date ? (
                  <Info label={t('projectInfo.sectionDates')} value={`${project.start_date ? day(project.start_date) : '…'} → ${project.end_date ? day(project.end_date) : '…'}`} />
                ) : null}
                <Info label={t('chantierHub.created')} value={day(project.created_at)} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('chantierHub.activity')}</Text>
              {activity === null ? null : activity.length === 0 ? (
                <Text style={styles.empty}>{t('chantierHub.noActivity')}</Text>
              ) : (
                activity.map((a) => (
                  <Pressable key={`${a.kind}-${a.id}`} onPress={() => router.push(a.route as any)} style={({ hovered }: any) => [styles.act, hovered && styles.modRowHover]}>
                    <Feather name={a.kind === 'report' ? 'file-text' : a.kind === 'photo' ? 'image' : a.kind === 'voice' ? 'mic' : 'edit-3'} size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.actText} numberOfLines={2}>
                        {a.text}
                      </Text>
                      <Text style={styles.actDate}>{day(a.at)}</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Info({ label, value, link }: { label: string; value: string | null; link?: { label: string; url: string } }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
      {link ? (
        <Pressable onPress={() => Linking.openURL(link.url)}>
          <Text style={styles.infoLink}>{link.label} ↗</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ref: { fontSize: fontSize.sm, fontWeight: '800', color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontVariant: ['tabular-nums'], overflow: 'hidden' },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
  page: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl },
  head: { gap: spacing.md },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  cover: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, flexShrink: 1 },
  meta: { fontSize: fontSize.md, color: colors.textMuted },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  ghostBtnHover: { borderColor: colors.text },
  ghostBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  main: { flex: 1, minWidth: 0, gap: spacing.xl },
  side: { width: 340, gap: spacing.lg },
  dailyRow: { flexDirection: 'row', gap: spacing.lg },
  daily: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  cardHover: { borderColor: colors.primary },
  dailyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  iconBig: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  dailyLabel: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  dailySub: { fontSize: fontSize.sm, color: colors.textMuted },
  dailyAction: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: spacing.md, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary },
  dailyActionText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  cardTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted, marginBottom: 4 },
  modRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: radius.md },
  modRowLine: { borderTopWidth: 1, borderTopColor: colors.border },
  modRowHover: { backgroundColor: colors.surfaceAlt },
  iconSmall: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  modLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  modSub: { fontSize: fontSize.sm, color: colors.textMuted },
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, gap: 6 },
  stepBar: { height: 5, borderRadius: 3, backgroundColor: colors.border },
  stepBarOn: { backgroundColor: colors.primary },
  stepText: { fontSize: fontSize.xs, color: colors.textMuted },
  stepTextOn: { color: colors.text, fontWeight: '700' },
  infoList: { gap: spacing.md, marginTop: spacing.md },
  info: { gap: 2 },
  infoLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  infoValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  infoLink: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600', marginTop: 2 },
  empty: { fontSize: fontSize.sm, color: colors.textMuted },
  act: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: radius.md },
  actText: { fontSize: fontSize.sm, color: colors.text },
  actDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
