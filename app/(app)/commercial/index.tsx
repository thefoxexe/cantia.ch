import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  callList,
  getSalesTeaser,
  hasSalesTracking,
  loadPipeline,
  pipelineStats,
  type CallReason,
  type DevisTracking,
  type PipelineStage,
} from '../../../lib/api/salesTracking';
import { formatRelativeTime } from '../../../lib/api/notifications';
import { AppScreen, Button, Card, EmptyState, LoadingScreen, PageHeader } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { displayType, monoType } from '../../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

const STAGES: PipelineStage[] = ['sent', 'viewed', 'discussion', 'signed', 'lost'];

// Swiss notation: 184’600.
function chf(n: number): string {
  return `CHF ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
}

export default function CommercialScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, canViewFinances } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 1100;
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState<DevisTracking[]>([]);
  const [teaser, setTeaser] = useState<{ sentWaiting: number; viewedWithoutAnswer: number } | null>(null);

  const load = useCallback(async () => {
    if (!organization || !canViewFinances) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const on = await hasSalesTracking(organization.plan_id);
    setEnabled(on);
    if (on) setItems(await loadPipeline(organization.id));
    else setTeaser(await getSalesTeaser(organization.id));
    setLoading(false);
  }, [organization, canViewFinances]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const stats = useMemo(() => pipelineStats(items), [items]);
  const calls = useMemo(() => callList(items), [items]);
  const byStage = useMemo(() => {
    const map: Record<PipelineStage, DevisTracking[]> = { sent: [], viewed: [], discussion: [], signed: [], lost: [] };
    for (const item of items) map[item.stage].push(item);
    return map;
  }, [items]);

  if (loading) return <LoadingScreen />;

  if (!canViewFinances) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <PageHeader title={t('commercial.title')} backTo="/(app)" />
          <Card>
            <EmptyState title={t('commercial.noAccessTitle')} subtitle={t('commercial.noAccess')} />
          </Card>
        </ScrollView>
      </AppScreen>
    );
  }

  if (!enabled) {
    return (
      <AppScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <PageHeader title={t('commercial.title')} backTo="/(app)" />
          <LockedCommercial teaser={teaser} onUpgrade={() => router.push('/(app)/compte/facturation')} />
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader title={t('commercial.title')} backTo="/(app)" />
        <Text style={styles.subtitle}>{t('commercial.subtitle')}</Text>

        <View style={styles.kpis}>
          <Kpi label={t('commercial.kpiPending')} value={chf(stats.pendingAmount)} />
          <Kpi label={t('commercial.kpiRate')} value={stats.signatureRate === null ? '—' : `${Math.round(stats.signatureRate * 100)} %`} />
          <Kpi
            label={t('commercial.kpiDelay')}
            value={stats.averageDaysToSign === null ? '—' : t('commercial.days', { count: Math.max(1, Math.round(stats.averageDaysToSign)) })}
          />
          <Kpi label={t('commercial.kpiFollowups')} value={String(stats.followupsThisMonth)} last />
        </View>

        <Text style={styles.sectionTitle}>{t('commercial.callTitle')}</Text>
        <Card style={styles.callCard}>
          {calls.length === 0 ? (
            <Text style={styles.callEmpty}>{t('commercial.callEmpty')}</Text>
          ) : (
            calls.slice(0, 6).map(({ item, reason }, i) => (
              <Pressable
                key={item.devis.id}
                onPress={() => router.push(`/(app)/devis/${item.devis.id}` as any)}
                style={[styles.callRow, i > 0 && styles.callRowBorder]}
              >
                <View style={[styles.sev, { backgroundColor: reasonColor(reason) }]} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.callReason}>{reasonLabel(t, reason, item)}</Text>
                  <Text style={styles.callMeta} numberOfLines={1}>
                    {[item.devis.number, item.devis.client_name, chf(item.amount)].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))
          )}
        </Card>

        {items.length === 0 ? (
          <Card style={{ marginTop: spacing.lg }}>
            <EmptyState title={t('commercial.emptyTitle')} subtitle={t('commercial.emptyText')} />
          </Card>
        ) : (
          <ScrollView horizontal={!wide} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.board, wide && { flex: 1 }]}>
            {STAGES.map((stage) => {
              const list = byStage[stage];
              const total = list.reduce((sum, it) => sum + it.amount, 0);
              return (
                <View key={stage} style={[styles.column, wide ? { flex: 1 } : { width: 250 }]}>
                  <View style={styles.columnHead}>
                    <Text style={styles.columnTitle}>{t(`commercial.stage.${stage}`)}</Text>
                    <Text style={styles.columnCount}>
                      {list.length}
                      {stage !== 'lost' && total ? ` · ${chf(total).replace('CHF ', '')}` : ''}
                    </Text>
                  </View>
                  {list.slice(0, 12).map((it) => (
                    <Pressable key={it.devis.id} onPress={() => router.push(`/(app)/devis/${it.devis.id}` as any)} style={styles.card}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {it.devis.client_name || it.devis.number}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {[it.devis.number, chf(it.amount)].filter(Boolean).join(' · ')}
                      </Text>
                      <Chip item={it} />
                    </Pressable>
                  ))}
                  {list.length > 12 ? <Text style={styles.more}>{t('commercial.more', { count: list.length - 12 })}</Text> : null}
                </View>
              );
            })}
          </ScrollView>
        )}
      </ScrollView>
    </AppScreen>
  );
}

function Kpi({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.kpi, last && { borderRightWidth: 0 }]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function reasonColor(reason: CallReason): string {
  if (reason === 'bounced') return colors.danger;
  if (reason === 'viewedOften') return colors.warning;
  return colors.textMuted;
}

function reasonLabel(t: ReturnType<typeof useTranslation>['t'], reason: CallReason, item: DevisTracking): string {
  switch (reason) {
    case 'viewedOften':
      return t('commercial.reason.viewedOften', { count: item.views });
    case 'bigSilent':
      return t('commercial.reason.bigSilent');
    case 'expiringSoon':
      return t('commercial.reason.expiringSoon');
    case 'bounced':
      return t('commercial.reason.bounced');
  }
}

// The one line under each card: the latest thing that matters.
function Chip({ item }: { item: DevisTracking }) {
  const { t } = useTranslation();
  let label: string;
  let tone: 'bad' | 'warm' | 'good' | 'plain' = 'plain';
  if (item.bounced && item.devis.status === 'sent') {
    label = t('commercial.chip.bounced');
    tone = 'bad';
  } else if (item.stage === 'signed') {
    label = item.followups ? t('commercial.chip.signedAfterFollowup') : t('commercial.chip.signed');
    tone = 'good';
  } else if (item.stage === 'lost') {
    label = item.expired ? t('commercial.chip.expired') : t('commercial.chip.refused');
  } else if (item.replied) {
    label = t('commercial.chip.replied');
    tone = 'warm';
  } else if (item.views) {
    label = t('commercial.chip.viewed', { count: item.views, when: item.lastViewAt ? formatRelativeTime(item.lastViewAt) : '' });
    tone = item.views >= 2 ? 'bad' : 'warm';
  } else if (item.followups) {
    label = t('commercial.chip.followup', { count: item.followups });
  } else if (item.sentAt) {
    label = t('commercial.chip.sent', { when: formatRelativeTime(item.sentAt) });
  } else {
    label = t('commercial.chip.sentOutside');
  }
  const palette = {
    bad: { bg: colors.dangerSoft, fg: colors.danger },
    warm: { bg: colors.warningSoft, fg: colors.warning },
    good: { bg: colors.successSoft, fg: colors.success },
    plain: { bg: colors.surfaceAlt, fg: colors.textMuted },
  }[tone];
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Text style={[styles.chipText, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// Plans without sales tracking: the board blurred behind the org's real
// counts (from sales_tracking_teaser) and a way to upgrade.
function LockedCommercial({
  teaser,
  onUpgrade,
}: {
  teaser: { sentWaiting: number; viewedWithoutAnswer: number } | null;
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();
  const viewed = teaser?.viewedWithoutAnswer ?? 0;
  return (
    <View style={styles.lockedWrap}>
      <View style={styles.lockedGhost} pointerEvents="none" aria-hidden>
        <View style={styles.kpis}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.kpi, i === 3 && { borderRightWidth: 0 }]}>
              <View style={[styles.ghostBar, { width: '55%' }]} />
              <View style={[styles.ghostBar, { width: '80%', height: 22, marginTop: 8 }]} />
            </View>
          ))}
        </View>
        <View style={[styles.board, { marginTop: spacing.lg }]}>
          {STAGES.map((s) => (
            <View key={s} style={[styles.column, { flex: 1 }]}>
              <Text style={styles.columnTitle}>{t(`commercial.stage.${s}`)}</Text>
              <View style={[styles.card, { height: 64 }]} />
              <View style={[styles.card, { height: 64 }]} />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.lockedCard}>
        <Text style={styles.lockedEyebrow}>{t('commercial.locked.eyebrow')}</Text>
        <Text style={styles.lockedTitle}>
          {viewed > 0 ? t('commercial.locked.titleViewed', { count: viewed }) : t('commercial.locked.title')}
        </Text>
        {teaser && teaser.sentWaiting > 0 ? (
          <Text style={styles.lockedFact}>{t('commercial.locked.waiting', { count: teaser.sentWaiting })}</Text>
        ) : null}
        <Text style={styles.lockedText}>{t('commercial.locked.text')}</Text>
        <Button title={t('commercial.locked.cta')} onPress={onUpgrade} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxl * 2, width: '100%', maxWidth: 1280, alignSelf: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.lg },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  kpi: { flexGrow: 1, flexBasis: 180, padding: spacing.md, borderRightWidth: 1, borderRightColor: colors.border },
  kpiLabel: { ...monoType, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  kpiValue: { ...displayType, fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4, fontVariant: ['tabular-nums'] },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  callCard: { padding: 0, overflow: 'hidden' },
  callEmpty: { fontSize: fontSize.sm, color: colors.textMuted, padding: spacing.md },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2, paddingRight: spacing.md },
  callRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  sev: { width: 4, alignSelf: 'stretch', borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  callReason: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  callMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  board: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignItems: 'flex-start' },
  column: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, gap: spacing.sm },
  columnHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm, paddingHorizontal: 2 },
  columnTitle: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.textMuted },
  columnCount: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  card: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, gap: 4 },
  cardTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  cardMeta: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  chip: { alignSelf: 'flex-start', borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2, maxWidth: '100%' },
  chipText: { ...monoType, fontSize: 9.5, letterSpacing: 0.3, textTransform: 'uppercase' },
  more: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', paddingVertical: 4 },
  lockedWrap: { position: 'relative', minHeight: 420 },
  lockedGhost: { opacity: 0.35 },
  ghostBar: { height: 10, borderRadius: 2, backgroundColor: colors.surfaceAlt },
  lockedCard: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    marginHorizontal: 'auto',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.text,
    borderRadius: radius.sm,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lockedEyebrow: { ...monoType, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary },
  lockedTitle: { ...displayType, fontSize: 26, lineHeight: 28, fontWeight: '800', color: colors.text },
  lockedFact: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  lockedText: { fontSize: fontSize.sm, lineHeight: 20, color: colors.textMuted },
});
