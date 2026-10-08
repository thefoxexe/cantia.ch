import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { decideFiduciaryProposal, getFiduciaryProposals, type FiduciaryProposalForClient } from '../lib/api/fiduciary';
import { Button, Card } from './ui';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Paramètres › Fiduciaire: correcting entries prepared by the fiduciary.
// Nothing reaches the books until someone with accounting rights accepts.

const formatDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' });
const chf = (n: number) => (Number(n) ? Number(n).toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');

export function FiduciaryProposals({ orgId }: { orgId: string }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<FiduciaryProposalForClient[] | null>(null);
  const [showDone, setShowDone] = useState(false);
  const load = useCallback(async () => setRows(await getFiduciaryProposals(orgId)), [orgId]);
  useEffect(() => {
    load();
  }, [load]);
  if (!rows || rows.length === 0) return null;
  const pending = rows.filter((r) => r.status === 'pending');
  const done = rows.filter((r) => r.status !== 'pending');
  return (
    <View style={styles.stack}>
      <Text style={styles.sectionTitle}>
        {t('fiduciary.prop.title')}
        {pending.length ? <Text style={styles.count}>{`  ${pending.length}`}</Text> : null}
      </Text>
      <Text style={styles.muted}>{t('fiduciary.prop.intro')}</Text>
      {pending.map((r) => (
        <ProposalItem key={r.id} proposal={r} onDone={load} />
      ))}
      {done.length ? (
        <Pressable onPress={() => setShowDone((v) => !v)}>
          <Text style={styles.link}>{showDone ? t('fiduciary.prop.hideDone') : t('fiduciary.prop.showDone', { count: done.length })}</Text>
        </Pressable>
      ) : null}
      {showDone ? done.map((r) => <ProposalItem key={r.id} proposal={r} onDone={load} />) : null}
    </View>
  );
}

function ProposalItem({ proposal: r, onDone }: { proposal: FiduciaryProposalForClient; onDone: () => void }) {
  const { t } = useTranslation();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(accept: boolean) {
    setBusy(true);
    setError(null);
    const { error: e } = await decideFiduciaryProposal(r.id, accept, accept ? null : reason.trim());
    setBusy(false);
    if (e) setError(e.includes('droits') ? t('fiduciary.prop.needsRights') : e);
    else onDone();
  }

  return (
    <Card style={[styles.card, r.status === 'pending' && styles.pending]}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Feather name="git-pull-request" size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardTitle}>{r.label}</Text>
          <Text style={styles.muted}>{[r.firm_name, formatDate(r.entry_date)].join(' · ')}</Text>
        </View>
      </View>
      {r.reason ? <Text style={styles.body}>{r.reason}</Text> : null}
      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          <Text style={[styles.thText, { flex: 1 }]}>{t('fiduciary.prop.account')}</Text>
          <Text style={[styles.thText, styles.num]}>{t('fiduciary.prop.debit')}</Text>
          <Text style={[styles.thText, styles.num]}>{t('fiduciary.prop.credit')}</Text>
        </View>
        {r.lines.map((l, i) => (
          <View key={i} style={styles.tr}>
            <Text style={[styles.body, { flex: 1 }]} numberOfLines={1}>
              {l.account_code} {l.account_label ?? ''}
              {l.label ? <Text style={styles.small}>{` · ${l.label}`}</Text> : null}
            </Text>
            <Text style={[styles.body, styles.num]}>{chf(l.debit)}</Text>
            <Text style={[styles.body, styles.num]}>{chf(l.credit)}</Text>
          </View>
        ))}
      </View>
      {r.status === 'accepted' ? (
        <Text style={[styles.body, { color: colors.success, fontWeight: '700' }]}>{r.posted ? t('fiduciary.prop.acceptedPosted') : t('fiduciary.prop.acceptedDraft')}</Text>
      ) : r.status === 'rejected' ? (
        <Text style={[styles.body, { color: colors.danger, fontWeight: '700' }]}>
          {t('fiduciary.prop.rejectedLabel')}
          {r.rejection_reason ? ` · ${r.rejection_reason}` : ''}
        </Text>
      ) : rejecting ? (
        <View style={{ gap: spacing.sm }}>
          <TextInput value={reason} onChangeText={setReason} placeholder={t('fiduciary.prop.reason')} placeholderTextColor={colors.textMuted} multiline style={styles.input} maxLength={1000} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title={t('fiduciary.prop.confirmReject')} variant="danger" onPress={() => decide(false)} loading={busy} disabled={!reason.trim()} />
            <Pressable onPress={() => setRejecting(false)}>
              <Text style={styles.linkMuted}>{t('common.cancel', { defaultValue: 'Annuler' })}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title={t('fiduciary.prop.accept')} icon="check" onPress={() => decide(true)} loading={busy} />
            <Pressable onPress={() => setRejecting(true)}>
              <Text style={styles.linkMuted}>{t('fiduciary.prop.reject')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  count: { color: colors.primary, fontWeight: '800' },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  small: { fontSize: 12, color: colors.textMuted },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  card: { gap: spacing.md },
  pending: { borderColor: colors.primary, borderWidth: 1.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  th: { backgroundColor: colors.surfaceAlt, borderTopWidth: 0 },
  thText: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  num: { width: 96, textAlign: 'right', fontVariant: ['tabular-nums'] },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface, minHeight: 70, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  linkMuted: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
