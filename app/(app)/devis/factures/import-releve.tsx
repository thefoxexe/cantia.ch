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
  confidence: 'reference' | 'amount' | 'fuzzy';
  checked: boolean;
}

function formatDateFr(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(`${getAppLocale()}-CH`, { day: 'numeric', month: 'short', year: 'numeric' });
}

// Lowercase, strip accents and common Swiss legal-form suffixes (Sàrl, SA,
// GmbH...) so "Dubois Sàrl" and "DUBOIS" score as a near-perfect match
// instead of being thrown off by punctuation a bank happens to keep or drop.
function normalizeName(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/\b(sa|sarl|s\.a\.r\.l|gmbh|ag|sagl|sc)\b\.?/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Classic edit-distance ratio between two single tokens (0 = nothing in
// common, 1 = identical) — tolerant of typos within a word.
function levenshteinRatio(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  const dist = new Array(len2 + 1);
  for (let j = 0; j <= len2; j++) dist[j] = j;
  for (let i = 1; i <= len1; i++) {
    let prev = dist[0];
    dist[0] = i;
    for (let j = 1; j <= len2; j++) {
      const tmp = dist[j];
      dist[j] = s1[i - 1] === s2[j - 1] ? prev : 1 + Math.min(prev, dist[j], dist[j - 1]);
      prev = tmp;
    }
  }
  return 1 - dist[len2] / Math.max(len1, len2);
}

// Token-set comparison rather than a single whole-string edit distance —
// a raw Levenshtein ratio on the full strings scores "Marc Dubois" vs
// "Dubois Marc" as almost unrelated (0.09) even though they're the same
// two words swapped, and Swiss bank statements commonly give the debtor
// name surname-first while a client record is given-name-first. For each
// word of the shorter name, this takes its best match among the longer
// name's words (typo-tolerant via levenshteinRatio) and averages those —
// order-independent, and still rewards a partial match ("Régie Pictet SA"
// vs "Régie Pictet & Cie") without demanding every word line up.
function nameSimilarity(a: string, b: string): number {
  const s1 = normalizeName(a);
  const s2 = normalizeName(b);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const tokens1 = s1.split(' ').filter(Boolean);
  const tokens2 = s2.split(' ').filter(Boolean);
  const [shorter, longer] = tokens1.length <= tokens2.length ? [tokens1, tokens2] : [tokens2, tokens1];
  if (shorter.length === 0 || longer.length === 0) return 0;
  let totalBest = 0;
  for (const t of shorter) {
    let best = 0;
    for (const u of longer) best = Math.max(best, levenshteinRatio(t, u));
    totalBest += best;
  }
  return totalBest / shorter.length;
}

// Reference matches win first (unambiguous — the QR reference is
// deterministic per facture), then amount-only matches fill in remaining
// entries when exactly one still-unmatched candidate shares that remaining
// balance. What's left goes through a third, lower-confidence pass: a
// client name (from the statement's debtor name or free-text remittance
// info) close to a candidate's name, combined with an amount within a
// small tolerance (bank rounding, a deducted transfer fee) — both signals
// have to line up, and the winner has to clearly beat the runner-up, or the
// entry is left unmatched rather than guessed. Unlike the first two tiers,
// these start unchecked: worth surfacing, not worth trusting blindly.
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
  let remainingEntries: BankStatementEntry[] = [];

  for (const entry of credits) {
    const byRef = entry.reference ? candidateByReference.get(entry.reference) : undefined;
    if (byRef && !usedCandidateIds.has(byRef.id)) {
      matched.push({ entry, candidate: byRef, confidence: 'reference', checked: true });
      usedCandidateIds.add(byRef.id);
      continue;
    }
    remainingEntries.push(entry);
  }

  const stillRemaining: BankStatementEntry[] = [];
  for (const entry of remainingEntries) {
    const amountMatches = candidates.filter((c) => !usedCandidateIds.has(c.id) && Math.abs(c.remaining - entry.amount) < 0.01);
    if (amountMatches.length === 1) {
      matched.push({ entry, candidate: amountMatches[0], confidence: 'amount', checked: true });
      usedCandidateIds.add(amountMatches[0].id);
    } else {
      stillRemaining.push(entry);
    }
  }
  remainingEntries = stillRemaining;

  const FUZZY_NAME_THRESHOLD = 0.55;
  const FUZZY_SCORE_MARGIN = 0.15; // winner must clearly beat the runner-up
  const finalRemaining: BankStatementEntry[] = [];
  for (const entry of remainingEntries) {
    const label = entry.debtorName ?? entry.info ?? '';
    if (!label) {
      finalRemaining.push(entry);
      continue;
    }
    const scored = candidates
      .filter((c) => !usedCandidateIds.has(c.id))
      .map((c) => {
        const amountTolerance = Math.max(c.remaining * 0.02, 1);
        const withinTolerance = Math.abs(c.remaining - entry.amount) <= amountTolerance;
        const nameScore = nameSimilarity(label, c.clientName);
        return { candidate: c, score: withinTolerance && nameScore >= FUZZY_NAME_THRESHOLD ? nameScore : 0 };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    const runnerUp = scored[1];
    if (best && (!runnerUp || best.score - runnerUp.score >= FUZZY_SCORE_MARGIN)) {
      matched.push({ entry, candidate: best.candidate, confidence: 'fuzzy', checked: false });
      usedCandidateIds.add(best.candidate.id);
    } else {
      finalRemaining.push(entry);
    }
  }

  return { matched, unmatched: finalRemaining };
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
                {rows.some((r) => r.confidence === 'fuzzy') ? (
                  <View style={styles.fuzzyBanner}>
                    <Feather name="alert-triangle" size={14} color={colors.warning} />
                    <Text style={styles.fuzzyBannerText}>{t('importReleve.fuzzyHint')}</Text>
                  </View>
                ) : null}
                {rows.map((row, i) => (
                  <Pressable key={`${row.entry.reference}-${row.entry.date}-${i}`} onPress={() => toggleRow(i)}>
                    <Card style={[styles.matchRow, !row.checked && styles.matchRowOff, row.confidence === 'fuzzy' && styles.matchRowFuzzy]}>
                      <View style={[styles.checkbox, row.checked && styles.checkboxOn]}>
                        {row.checked ? <Feather name="check" size={13} color="#fff" /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchLabel} numberOfLines={1}>
                          {row.candidate.number ?? t('importReleve.factureFallback')} — {row.candidate.clientName}
                        </Text>
                        <Text style={[styles.matchMeta, row.confidence === 'fuzzy' && styles.matchMetaFuzzy]}>
                          {formatDateFr(row.entry.date)} ·{' '}
                          {row.confidence === 'reference'
                            ? t('importReleve.matchedByReference')
                            : row.confidence === 'amount'
                              ? t('importReleve.matchedByAmount')
                              : t('importReleve.matchedByFuzzy')}
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
  matchRowFuzzy: {
    borderWidth: 1,
    borderColor: colors.warningSoft,
  },
  matchMetaFuzzy: {
    color: colors.warning,
    fontWeight: '600',
  },
  fuzzyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  fuzzyBannerText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.warning,
    lineHeight: 17,
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
