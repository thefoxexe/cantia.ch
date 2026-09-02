import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { addFacturePayment, listReconciliationCandidates, type ReconciliationCandidate } from '../../../../lib/api/factures';
import { generatePaymentReference } from '../../../../lib/qrReference';
import { parseCamt053, type BankStatementEntry } from '../../../../lib/bankStatement';
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { getAppLocale, useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

interface MatchedRow {
  entry: BankStatementEntry;
  candidate: ReconciliationCandidate;
  confidence: 'reference' | 'amount';
  checked: boolean;
}

function formatDateFr(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(`${getAppLocale()}-CH`, { day: 'numeric', month: 'short', year: 'numeric' });
}

// Reference matches win first (unambiguous — the QR reference is
// deterministic per facture), then amount-only matches fill in remaining
// entries only when exactly one still-unmatched candidate shares that
// remaining balance — anything ambiguous is left for manual reconciliation
// rather than guessed.
function matchEntries(
  entries: BankStatementEntry[],
  candidates: ReconciliationCandidate[],
  referenceByFacture: Map<string, string>,
): { matched: MatchedRow[]; unmatched: BankStatementEntry[] } {
  const credits = entries.filter((e) => e.direction === 'credit');
  const candidateByReference = new Map<string, ReconciliationCandidate>();
  for (const c of candidates) {
    const ref = referenceByFacture.get(c.id);
    if (ref) candidateByReference.set(ref, c);
  }

  const matched: MatchedRow[] = [];
  const usedCandidateIds = new Set<string>();
  const remainingEntries: BankStatementEntry[] = [];

  for (const entry of credits) {
    const byRef = entry.reference ? candidateByReference.get(entry.reference) : undefined;
    if (byRef && !usedCandidateIds.has(byRef.id)) {
      matched.push({ entry, candidate: byRef, confidence: 'reference', checked: true });
      usedCandidateIds.add(byRef.id);
      continue;
    }
    remainingEntries.push(entry);
  }

  for (const entry of remainingEntries.slice()) {
    const amountMatches = candidates.filter((c) => !usedCandidateIds.has(c.id) && Math.abs(c.remaining - entry.amount) < 0.01);
    if (amountMatches.length === 1) {
      matched.push({ entry, candidate: amountMatches[0], confidence: 'amount', checked: true });
      usedCandidateIds.add(amountMatches[0].id);
      const idx = remainingEntries.indexOf(entry);
      if (idx >= 0) remainingEntries.splice(idx, 1);
    }
  }

  return { matched, unmatched: remainingEntries };
}

export default function ImportReleveScreen() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<BankStatementEntry[] | null>(null);
  const [rows, setRows] = useState<MatchedRow[]>([]);
  const [unmatched, setUnmatched] = useState<BankStatementEntry[]>([]);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{ applied: number; failed: number } | null>(null);

  async function handlePick() {
    if (!organization) return;
    setError(null);
    setResult(null);
    const picked = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.length) return;

    setPicking(true);
    try {
      const xml = await fetch(picked.assets[0].uri).then((r) => r.text());
      const parsed = parseCamt053(xml);
      if (parsed.error) {
        setError(parsed.error);
        return;
      }
      const cands = await listReconciliationCandidates(organization.id);
      const refs = new Map<string, string>();
      for (const c of cands) {
        const ref = generatePaymentReference(organization.iban, c.id);
        if (ref) refs.set(c.id, ref.reference);
      }
      const { matched, unmatched: rest } = matchEntries(parsed.entries, cands, refs);
      setEntries(parsed.entries);
      setRows(matched);
      setUnmatched(rest);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('importReleve.readError'));
    } finally {
      setPicking(false);
    }
  }

  function toggleRow(index: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, checked: !r.checked } : r)));
  }

  async function handleApply() {
    const toApply = rows.filter((r) => r.checked);
    if (toApply.length === 0) return;
    setApplying(true);
    let applied = 0;
    let failed = 0;
    for (const row of toApply) {
      const { error: err } = await addFacturePayment(row.candidate.id, row.entry.amount, row.entry.date, row.candidate.total);
      if (err) failed += 1;
      else applied += 1;
    }
    setApplying(false);
    setResult({ applied, failed });
    setRows([]);
  }

  const creditCount = entries?.filter((e) => e.direction === 'credit').length ?? 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <PageHeader title={t('importReleve.title')} backTo="/(app)/devis/factures" />
        <Text style={styles.pageSubtitle}>
          {t('importReleve.subtitle')}
        </Text>

        {!entries ? (
          <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl }}>
            <Feather name="upload-cloud" size={28} color={colors.primary} />
            <Text style={styles.pickTitle}>{t('importReleve.pickTitle')}</Text>
            <Text style={styles.pickHint}>{t('importReleve.pickHint')}</Text>
            <Button title={t('importReleve.chooseFile')} icon="upload" onPress={handlePick} loading={picking} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Card>
        ) : result ? (
          <Card style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl }}>
            <Feather name="check-circle" size={28} color={colors.success} />
            <Text style={styles.pickTitle}>
              {t('importReleve.paymentsReconciled', { count: result.applied })}
            </Text>
            {result.failed > 0 ? <Text style={styles.error}>{t('importReleve.failuresText', { count: result.failed })}</Text> : null}
            <Button title={t('importReleve.backToFactures')} variant="secondary" onPress={() => router.replace('/(app)/devis/factures')} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : (
          <View style={{ gap: spacing.lg }}>
            <Text style={styles.summary}>
              {t('importReleve.summaryCredits', { count: creditCount })} · {t('importReleve.summaryMatches', { count: rows.length })}
            </Text>

            {rows.length === 0 ? (
              <Card>
                <EmptyState title={t('importReleve.noMatchTitle')} subtitle={t('importReleve.noMatchSubtitle')} />
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {rows.map((row, i) => (
                  <Pressable key={`${row.entry.reference}-${row.entry.date}-${i}`} onPress={() => toggleRow(i)}>
                    <Card style={[styles.matchRow, !row.checked && styles.matchRowOff]}>
                      <View style={[styles.checkbox, row.checked && styles.checkboxOn]}>
                        {row.checked ? <Feather name="check" size={13} color="#fff" /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchLabel} numberOfLines={1}>
                          {row.candidate.number ?? t('importReleve.factureFallback')} — {row.candidate.clientName}
                        </Text>
                        <Text style={styles.matchMeta}>
                          {formatDateFr(row.entry.date)} · {row.confidence === 'reference' ? t('importReleve.matchedByReference') : t('importReleve.matchedByAmount')}
                        </Text>
                      </View>
                      <Text style={styles.matchAmount}>CHF {row.entry.amount.toFixed(2)}</Text>
                    </Card>
                  </Pressable>
                ))}
                <Button
                  title={t('importReleve.confirmPayments', { count: rows.filter((r) => r.checked).length })}
                  icon="check"
                  onPress={handleApply}
                  loading={applying}
                  disabled={rows.every((r) => !r.checked)}
                />
              </View>
            )}

            {unmatched.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{t('importReleve.unmatchedTitle', { count: unmatched.length })}</Text>
                <View style={{ gap: spacing.xs }}>
                  {unmatched.map((entry, i) => (
                    <Card key={`u-${i}`} style={styles.unmatchedRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchMeta} numberOfLines={1}>
                          {formatDateFr(entry.date)} · {entry.debtorName ?? entry.info ?? t('importReleve.noReference')}
                        </Text>
                      </View>
                      <Text style={styles.matchMetaAmount}>CHF {entry.amount.toFixed(2)}</Text>
                    </Card>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  pickTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  pickHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  matchRowOff: {
    opacity: 0.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  matchLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  matchMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  matchAmount: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.success,
    fontVariant: ['tabular-nums'],
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  unmatchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  matchMetaAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
