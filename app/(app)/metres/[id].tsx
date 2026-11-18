import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, LoadingScreen, PageHeader } from '../../../components/ui';
import { Btn, Chip, kit, usePhone } from '../../../components/admin/ledger/kit';
import { loadComparison, type Comparison, type CompareLine } from '../../../lib/tenders/postcalc';
import { postcalcCopy } from '../../../lib/tenders/postcalcCopy';
import { formatChf, formatQuantity } from '../../../lib/tenders/numbers';
import type { TenderBundle } from '../../../lib/tenders/api';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// One métré against its soumission: what can be billed (quantities executed
// × prices of the soumission) against what it really cost, per position,
// per chapter and for the whole chantier (lib/tenders/postcalc.ts).

const money = (n: number | null) => (n == null ? '–' : formatChf(n));
const tone = (n: number | null) => (n == null ? colors.textMuted : n < 0 ? colors.danger : n > 0 ? colors.success : colors.text);

export default function MetreCompareScreen() {
  const c = postcalcCopy();
  const router = useRouter();
  const { phone } = usePhone();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state, setState] = useState<{ metre: TenderBundle | null; base: TenderBundle | null; comparison: Comparison | null; error: string | null } | null>(null);
  const [onlyLoss, setOnlyLoss] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadComparison(id).then(setState);
    }, [id]),
  );

  const chapters = useMemo(() => {
    const list = state?.comparison?.chapters ?? [];
    if (!onlyLoss) return list;
    return list.map((ch) => ({ ...ch, lines: ch.lines.filter((l) => (l.profit ?? 0) < 0) })).filter((ch) => ch.lines.length > 0);
  }, [state, onlyLoss]);

  if (!state) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }
  const { metre, base, comparison, error } = state;
  const projectId = metre?.tender.project_id;

  return (
    <AppScreen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.page, phone && { padding: spacing.lg }]}>
        <PageHeader title={metre?.tender.name ?? c.title} backTo="/(app)/metres" style={{ marginBottom: 0 }} />
        {base ? (
          <Text style={kit.hint}>
            {c.base} : {base.tender.number ? `${base.tender.number} · ` : ''}
            {base.tender.name}
          </Text>
        ) : null}

        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        {metre && !base && !error ? <Text style={kit.muted}>{c.noBase}</Text> : null}

        {metre && projectId ? (
          <View style={[kit.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
            <Btn label={c.edit} icon="edit-3" variant="primary" onPress={() => router.push(`/(app)/chantiers/${projectId}/metres/${metre.tender.id}` as any)} />
            {base ? <Btn label={c.openBase} icon="file-text" onPress={() => router.push(`/(app)/chantiers/${projectId}/metres/${base.tender.id}` as any)} /> : null}
          </View>
        ) : null}

        {comparison && !comparison.pricesVisible ? <Text style={kit.muted}>{c.noPrices}</Text> : null}

        {comparison && comparison.pricesVisible ? (
          <>
            <View style={[styles.kpis, phone && { flexDirection: 'column', flexWrap: 'nowrap' }]}>
              <Kpi phone={phone} label={c.offer} value={money(comparison.offerNet)} />
              <Kpi phone={phone} label={c.billable} value={money(comparison.billableNet)} hint={c.billableHint} />
              <Kpi phone={phone} label={c.real} value={money(comparison.real)} />
              <Kpi
                label={c.profit}
                value={money(comparison.profit)}
                color={tone(comparison.profit)}
                hint={comparison.marginPercent != null ? `${c.margin} ${comparison.marginPercent.toLocaleString('fr-CH')} %` : undefined}
                strong
              />
            </View>

            {comparison.missingCosts > 0 ? (
              <View style={styles.warn}>
                <Feather name="alert-circle" size={15} color={colors.warning} />
                <Text style={[kit.body, { flex: 1 }]}>{c.missing(comparison.missingCosts)}</Text>
              </View>
            ) : null}

            <View style={[kit.row, { gap: spacing.sm }]}>
              <Chip label={c.all} active={!onlyLoss} onPress={() => setOnlyLoss(false)} />
              <Chip label={c.onlyLoss} active={onlyLoss} onPress={() => setOnlyLoss(true)} tone="bad" />
            </View>

            <View style={{ gap: spacing.lg }}>
              {chapters.map((ch) => (
                <View key={ch.key} style={styles.chapter}>
                  <View style={styles.chapterHead}>
                    <Text style={styles.chapterTitle} numberOfLines={2}>
                      {ch.title || '—'}
                    </Text>
                    <Text style={[styles.chapterProfit, { color: tone(ch.profit) }]}>{money(ch.profit)}</Text>
                  </View>
                  {!phone ? (
                    <View style={[styles.tr, styles.thead]}>
                      <Text style={[styles.th, styles.cRef]}>{c.colRef}</Text>
                      <Text style={[styles.th, styles.cTitle]}>{c.colTitle}</Text>
                      <Text style={[styles.th, styles.cNum]}>{c.colSold}</Text>
                      <Text style={[styles.th, styles.cNum]}>{c.colReal}</Text>
                      <Text style={[styles.th, styles.cNum]}>{c.billable}</Text>
                      <Text style={[styles.th, styles.cNum]}>{c.real}</Text>
                      <Text style={[styles.th, styles.cNum]}>{c.profit}</Text>
                    </View>
                  ) : null}
                  {ch.lines.map((l) => (phone ? <LineCard key={l.key} l={l} /> : <LineRow key={l.key} l={l} />))}
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function Kpi({ label, value, hint, color, strong, phone }: { label: string; value: string; hint?: string; color?: string; strong?: boolean; phone?: boolean }) {
  return (
    <View style={[styles.kpi, phone && { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', minWidth: 0, padding: spacing.md }, strong && { borderColor: color ?? colors.border }]}>
      <Text style={kit.hint}>{label}</Text>
      <Text style={[styles.kpiValue, color ? { color } : null]}>{value}</Text>
      {hint ? <Text style={[kit.hint, { fontSize: 11 }]}>{hint}</Text> : null}
    </View>
  );
}

function Tag({ l }: { l: CompareLine }) {
  const c = postcalcCopy();
  const text = l.only === 'base' ? c.notExecuted : l.only === 'real' ? c.added : l.realQty !== 0 && l.realCost == null ? c.missingShort : null;
  if (!text) return null;
  const bad = l.only == null;
  return (
    <Text style={[styles.tag, bad ? { color: colors.warning, backgroundColor: colors.warningSoft } : null]} accessibilityHint={l.only === 'real' ? c.addedHint : undefined}>
      {text}
    </Text>
  );
}

function qtyPrice(q: number | null, p: number | null, unit: string): string {
  if (q == null && p == null) return '–';
  return `${formatQuantity(q)} ${unit}${p != null ? ` × ${formatChf(p)}` : ''}`.trim();
}

function LineRow({ l }: { l: CompareLine }) {
  return (
    <View style={styles.tr}>
      <Text style={[styles.td, styles.cRef]}>{l.ref}</Text>
      <View style={[styles.cTitle, { gap: 4, paddingVertical: 10, paddingHorizontal: 8 }]}>
        <Text style={styles.tdTitle} numberOfLines={3}>
          {l.title}
        </Text>
        <Tag l={l} />
      </View>
      <Text style={[styles.td, styles.cNum]}>{qtyPrice(l.soldQty, l.soldPrice, l.unit)}</Text>
      <Text style={[styles.td, styles.cNum]}>{qtyPrice(l.realQty, l.realCost, l.unit)}</Text>
      <Text style={[styles.td, styles.cNum]}>{money(l.billable)}</Text>
      <Text style={[styles.td, styles.cNum]}>{money(l.real)}</Text>
      <Text style={[styles.td, styles.cNum, { color: tone(l.profit), fontWeight: '700' }]}>{money(l.profit)}</Text>
    </View>
  );
}

function LineCard({ l }: { l: CompareLine }) {
  const c = postcalcCopy();
  return (
    <View style={styles.lineCard}>
      <View style={[kit.row, { justifyContent: 'space-between', gap: spacing.sm, alignItems: 'flex-start' }]}>
        <Text style={[styles.tdTitle, { flex: 1 }]}>
          {l.ref ? <Text style={{ color: colors.textMuted }}>{l.ref} · </Text> : null}
          {l.title}
        </Text>
        <Text style={{ color: tone(l.profit), fontWeight: '800', fontVariant: ['tabular-nums'] }}>{money(l.profit)}</Text>
      </View>
      <Tag l={l} />
      <Text style={kit.hint}>
        {c.colSold} : {qtyPrice(l.soldQty, l.soldPrice, l.unit)}
      </Text>
      <Text style={kit.hint}>
        {c.colReal} : {qtyPrice(l.realQty, l.realCost, l.unit)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl * 3 },
  kpis: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  kpi: { flex: 1, minWidth: 180, gap: 4, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  kpiValue: { fontSize: 22, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  warn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warningSoft },
  chapter: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  chapterHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md, backgroundColor: colors.bg },
  chapterTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  chapterProfit: { fontSize: fontSize.md, fontWeight: '800', fontVariant: ['tabular-nums'] },
  tr: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  thead: { backgroundColor: colors.surface },
  th: { paddingVertical: 8, paddingHorizontal: 8, fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: colors.text, fontVariant: ['tabular-nums'] },
  tdTitle: { fontSize: 13, color: colors.text },
  cRef: { width: 90 },
  cTitle: { flex: 1, minWidth: 0 },
  cNum: { width: 130, textAlign: 'right' },
  tag: { alignSelf: 'flex-start', fontSize: 10.5, fontWeight: '700', color: colors.textMuted, backgroundColor: colors.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill, overflow: 'hidden' },
  lineCard: { gap: 4, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
