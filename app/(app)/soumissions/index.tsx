import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, LoadingScreen, PageHeader } from '../../../components/ui';
import { Btn, Sheet, kit, usePhone } from '../../../components/admin/ledger/kit';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { useTranslation } from '../../../lib/translations';
import { tenderQuota, type TenderQuota } from '../../../lib/tenders/api';
import { formatChf } from '../../../lib/tenders/numbers';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// Every soumission of the company, across its chantiers (each one still
// lives in its chantier: chantiers/[id]/metre). Importing starts by picking
// the chantier, then the PDF on that chantier's screen.

interface Row {
  id: string;
  project_id: string;
  name: string;
  number: string | null;
  status: string;
  created_at: string;
  project: { name: string } | null;
  positions: number;
  amount: number | null;
}

export default function SoumissionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = usePhone();
  const { organization } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [quota, setQuota] = useState<TenderQuota | null>(null);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [picking, setPicking] = useState(false);
  const quotaReached = !!quota && quota.limit != null && quota.used >= quota.limit;
  const trial = quota?.period === 'total';

  const load = useCallback(async () => {
    if (!organization) return;
    const [{ data }, q, { data: proj }] = await Promise.all([
      supabase
        .from('tenders')
        .select('id, project_id, name, number, status, created_at, projects(name), tender_positions(count)')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false }),
      tenderQuota(organization.id),
      supabase.from('projects').select('id, name').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(200),
    ]);
    const list = (data ?? []) as any[];
    const ids = list.map((r) => r.id);
    // Prices only come back for members with the Finances permission.
    const { data: prices } = ids.length
      ? await supabase.from('tender_position_prices').select('tender_id, amount').in('tender_id', ids)
      : { data: [] as { tender_id: string; amount: number | null }[] };
    const totals = new Map<string, number>();
    for (const p of prices ?? []) totals.set(p.tender_id, (totals.get(p.tender_id) ?? 0) + Number(p.amount ?? 0));
    setRows(
      list.map((r) => ({
        id: r.id,
        project_id: r.project_id,
        name: r.name,
        number: r.number,
        status: r.status,
        created_at: r.created_at,
        project: r.projects ?? null,
        positions: r.tender_positions?.[0]?.count ?? 0,
        amount: totals.has(r.id) ? totals.get(r.id)! : null,
      })),
    );
    setQuota(q);
    setProjects((proj ?? []) as { id: string; name: string }[]);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!rows) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  const allowed = !!quota?.allowed;
  const statuses = t('soumissionsPage.statuses', { returnObjects: true }) as Record<string, string>;

  return (
    <AppScreen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.page, phone && { padding: spacing.lg }]}>
        <View style={styles.head}>
          <View style={[kit.row, { alignItems: 'center', flex: 1, minWidth: 220 }]}>
            <PageHeader title={t('soumissionsPage.title')} style={{ marginBottom: 0 }} />
            <View style={styles.beta}>
              <Text style={styles.betaText}>{t('soumissionsPage.beta')}</Text>
            </View>
          </View>
          {allowed && !phone ? (
            <Btn label={t('soumissionsPage.importCta')} icon="upload" variant="primary" onPress={() => setPicking(true)} disabled={quotaReached} />
          ) : null}
        </View>
        <Text style={[kit.muted, { maxWidth: 680 }]}>{t('soumissionsPage.intro')}</Text>

        {!allowed ? (
          <View style={styles.upsell}>
            <Feather name="lock" size={16} color={colors.primary} />
            <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
              <Text style={styles.upsellTitle}>{t('soumissionsPage.upsellTitle')}</Text>
              <Text style={kit.muted}>{t('soumissionsPage.upsellText')}</Text>
            </View>
            <Btn label={t('soumissionsPage.upsellCta')} icon="arrow-right" variant="primary" onPress={() => router.push('/(app)/compte/facturation' as any)} />
          </View>
        ) : quota?.limit != null ? (
          quotaReached ? (
            <View style={styles.upsell}>
              <Feather name="lock" size={16} color={colors.primary} />
              <Text style={[kit.muted, { flex: 1, minWidth: 200 }]}>{trial ? t('soumissionsPage.quotaTrialReached') : t('soumissionsPage.quotaReached', { limit: quota.limit })}</Text>
              <Btn label={trial ? t('soumissionsPage.trialCta') : t('soumissionsPage.upsellCta')} icon="arrow-right" variant="primary" onPress={() => router.push('/(app)/compte/facturation' as any)} />
            </View>
          ) : (
            <Text style={kit.hint}>{t(trial ? 'soumissionsPage.quotaTrial' : 'soumissionsPage.quota', { used: quota.used, limit: quota.limit })}</Text>
          )
        ) : null}

        {rows.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="file-text" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('soumissionsPage.empty')}</Text>
            <Text style={[kit.muted, { textAlign: 'center', maxWidth: 440 }]}>{t('soumissionsPage.emptyText')}</Text>
            {allowed && !phone && !quotaReached ? (
              <Btn label={t('soumissionsPage.importCta')} icon="upload" variant="primary" onPress={() => setPicking(true)} />
            ) : null}
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {rows.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => router.push(`/(app)/chantiers/${r.project_id}/metres/${r.id}` as any)}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
              >
                <View style={styles.cardIcon}>
                  <Feather name="file-text" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {r.number ? <Text style={styles.cardNumber}>{r.number} · </Text> : null}
                    {r.name}
                  </Text>
                  <Text style={kit.hint} numberOfLines={1}>
                    {[r.project?.name, statuses[r.status] ?? r.status, t('soumissionsPage.positions', { n: r.positions })].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {r.amount != null ? <Text style={styles.amount}>{formatChf(r.amount)}</Text> : null}
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {picking ? (
        <Sheet title={t('soumissionsPage.pickChantier')} onClose={() => setPicking(false)}>
          <Text style={kit.hint}>{t('soumissionsPage.pickChantierHint')}</Text>
          {projects.length === 0 ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={kit.muted}>{t('soumissionsPage.noChantier')}</Text>
              <Btn label={t('soumissionsPage.newChantier')} icon="plus" variant="primary" onPress={() => router.push('/(app)/chantiers/new' as any)} />
            </View>
          ) : (
            <View style={{ gap: 6 }}>
              {projects.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setPicking(false);
                    router.push(`/(app)/chantiers/${p.id}/metre` as any);
                  }}
                  style={({ pressed }) => [styles.pickRow, pressed && { opacity: 0.85 }]}
                >
                  <Feather name="layers" size={15} color={colors.primary} />
                  <Text style={[kit.body, { flex: 1 }]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Feather name="chevron-right" size={15} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 980, alignSelf: 'center', padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  beta: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.warningSoft },
  betaText: { fontSize: 10, fontWeight: '800', color: colors.warning, letterSpacing: 0.5, textTransform: 'uppercase' },
  upsell: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.primarySoft },
  upsellTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg },
  emptyTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  cardIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardNumber: { color: colors.textMuted, fontWeight: '600' },
  amount: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
});
