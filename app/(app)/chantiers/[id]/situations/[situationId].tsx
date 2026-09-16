import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { confirm } from '../../../../../lib/confirm';
import {
  finalizeSituation,
  getSituation,
  updateSituationItemPercent,
  updateSituationRetenue,
} from '../../../../../lib/api/situations';
import { Button, Card, LoadingScreen, PageHeader, AppScreen, StatusBadge } from '../../../../../components/ui';
import { getAppLocale, useTranslation } from '../../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import type { ChantierSituation, ChantierSituationItem } from '../../../../../lib/types';

function chf(n: number): string {
  return `${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

function deltaAmount(item: ChantierSituationItem): number {
  const contractAmount = item.contract_quantity * item.unit_price;
  const delta = Math.max(0, item.cumulative_percent - item.previous_percent);
  return (contractAmount * delta) / 100;
}

export default function SituationDetailScreen() {
  const { t } = useTranslation();
  const { id, situationId } = useLocalSearchParams<{ id: string; situationId: string }>();
  const router = useRouter();
  const [situation, setSituation] = useState<ChantierSituation | null>(null);
  const [items, setItems] = useState<ChantierSituationItem[]>([]);
  const [retenueInput, setRetenueInput] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { situation: s, items: it } = await getSituation(situationId);
    setSituation(s);
    setItems(it);
    setRetenueInput(s ? String(s.retenue_garantie_percent) : '0');
    setLoading(false);
  }, [situationId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading || !situation) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }

  const isDraft = situation.status === 'draft';
  const subtotal = items.reduce((sum, it) => sum + deltaAmount(it), 0);
  const retenuePercent = Number(retenueInput.replace(',', '.')) || 0;
  const retenueAmount = subtotal * (retenuePercent / 100);
  const netAmount = subtotal - retenueAmount;
  const vat = netAmount * (situation.vat_rate / 100);
  const totalWithVat = netAmount + vat;

  function updateLocalPercent(itemId: string, value: string) {
    const parsed = Math.max(0, Math.min(100, Number(value.replace(',', '.')) || 0));
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, cumulative_percent: parsed } : it)));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    await Promise.all([
      ...items.map((it) => updateSituationItemPercent(it.id, it.cumulative_percent)),
      updateSituationRetenue(situationId, retenuePercent),
    ]);
    setSaving(false);
    load();
  }

  async function handleFinalize() {
    if (subtotal <= 0) {
      setError(t('situationDetail.noProgressError'));
      return;
    }
    const ok = await confirm(t('situationDetail.finalizeConfirmTitle'), t('situationDetail.finalizeConfirmBody'));
    if (!ok) return;
    setFinalizing(true);
    setError(null);
    await Promise.all([
      ...items.map((it) => updateSituationItemPercent(it.id, it.cumulative_percent)),
      updateSituationRetenue(situationId, retenuePercent),
    ]);
    const { factureId, error: finalizeError } = await finalizeSituation(situationId);
    setFinalizing(false);
    if (finalizeError || !factureId) {
      setError(finalizeError ?? t('situationDetail.finalizeFailed'));
      return;
    }
    router.replace(`/(app)/devis/factures/${factureId}` as any);
  }

  return (
    <AppScreen style={{ padding: spacing.xl }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.container}>
          <PageHeader title={situation.number ?? t('situationDetail.fallbackTitle')} backTo={`/(app)/chantiers/${id}/situations`} />

          <Card style={{ gap: spacing.sm }}>
            <View style={styles.row}>
              <Text style={styles.title}>{situation.title}</Text>
              <StatusBadge status={situation.status} />
            </View>
            <Text style={styles.client}>{situation.client_name}</Text>
            <Text style={styles.meta}>{t('situationDetail.situationIndex', { index: situation.situation_index })}</Text>
          </Card>

          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>{t('situationDetail.lines')}</Text>
            {items.map((it) => {
              const contractAmount = it.contract_quantity * it.unit_price;
              return (
                <View key={it.id} style={styles.itemRow}>
                  <Text style={styles.itemDesc}>{it.description}</Text>
                  <Text style={styles.itemMeta}>
                    {t('situationDetail.contractAmount', { amount: chf(contractAmount) })} · {t('situationDetail.previousPercent', { percent: it.previous_percent })}
                  </Text>
                  <View style={styles.percentRow}>
                    <Text style={styles.percentLabel}>{t('situationDetail.cumulativePercentLabel')}</Text>
                    <TextInput
                      style={[styles.percentInput, !isDraft && styles.percentInputDisabled]}
                      value={String(it.cumulative_percent)}
                      onChangeText={(v) => updateLocalPercent(it.id, v)}
                      keyboardType="decimal-pad"
                      editable={isDraft}
                    />
                    <Text style={styles.percentSuffix}>%</Text>
                    <Text style={styles.itemDelta}>{chf(deltaAmount(it))}</Text>
                  </View>
                </View>
              );
            })}
          </Card>

          <Card style={{ marginTop: spacing.md }}>
            <View style={styles.percentRow}>
              <Text style={styles.percentLabel}>{t('situationDetail.retenueLabel')}</Text>
              <TextInput
                style={[styles.percentInput, !isDraft && styles.percentInputDisabled]}
                value={retenueInput}
                onChangeText={setRetenueInput}
                keyboardType="decimal-pad"
                editable={isDraft}
              />
              <Text style={styles.percentSuffix}>%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalsRow}>
              <Text style={styles.metaLine}>{t('situationDetail.subtotalThisPeriod')}</Text>
              <Text style={styles.line}>{chf(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.metaLine}>{t('situationDetail.retenueAmount')}</Text>
              <Text style={styles.line}>-{chf(retenueAmount)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.metaLine}>{t('situationDetail.vat', { rate: situation.vat_rate })}</Text>
              <Text style={styles.line}>{chf(vat)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>{t('situationDetail.totalThisPeriod')}</Text>
              <Text style={styles.totalAmount}>{chf(totalWithVat)}</Text>
            </View>
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {situation.status === 'finalized' ? (
            situation.facture_id ? (
              <Button
                title={t('situationDetail.viewGeneratedInvoice')}
                variant="secondary"
                icon="file-text"
                onPress={() => router.push(`/(app)/devis/factures/${situation.facture_id}` as any)}
                style={{ marginTop: spacing.lg }}
              />
            ) : null
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <Button title={t('situationDetail.save')} variant="secondary" icon="check" onPress={handleSave} loading={saving} />
              <Button title={t('situationDetail.finalize')} icon="send" onPress={handleFinalize} loading={finalizing} />
            </View>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  client: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  itemDesc: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  percentLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flex: 1,
  },
  percentInput: {
    width: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    height: 36,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.bg,
    textAlign: 'right',
  },
  percentInputDisabled: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
  },
  percentSuffix: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  itemDelta: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    minWidth: 90,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs / 2,
  },
  metaLine: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  line: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.md,
  },
});
