import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field } from './ui';
import { fetchNumbering, formatDocumentNumber, isValidNumberFormat, saveNumbering, type NumberedDoc } from '../lib/documentNumbering';
import { useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';

const EXAMPLES: Record<NumberedDoc, string[]> = {
  devis: ['DEV-{AAAA}-{NNNN}', 'D{AA}-{NNN}', '{AAAA}{MM}-{NNN}', 'OF-{NNNNN}'],
  facture: ['FAC-{AAAA}-{NNNN}', 'F{AA}-{NNN}', '{AAAA}{MM}-{NNN}', '{NNNNN}'],
};

// Compte → Devis & factures: the company's own numbering for devis and
// factures — free format and next number, saved one document type at a time.
export function DocumentNumbering({ organizationId, isAdmin }: { organizationId: string; isAdmin: boolean }) {
  const { t } = useTranslation();
  const [state, setState] = useState<Record<NumberedDoc, { format: string; next: string }> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Partial<Record<NumberedDoc, { saving?: boolean; error?: string | null; saved?: string | null }>>>({});

  const load = useCallback(async () => {
    const { data, error } = await fetchNumbering(organizationId);
    if (error || !data) {
      setLoadError(error);
      return;
    }
    setState({
      devis: { format: data.devis.format, next: String(data.devis.next_number) },
      facture: { format: data.facture.format, next: String(data.facture.next_number) },
    });
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError) return <Text style={styles.error}>{loadError}</Text>;
  if (!state) return null;

  const set = (doc: NumberedDoc, patch: Partial<{ format: string; next: string }>) => {
    setState((s) => (s ? { ...s, [doc]: { ...s[doc], ...patch } } : s));
    setStatus((s) => ({ ...s, [doc]: { ...s[doc], saved: null, error: null } }));
  };

  async function save(doc: NumberedDoc) {
    if (!state) return;
    const next = Number(state[doc].next);
    if (!isValidNumberFormat(state[doc].format)) {
      setStatus((s) => ({ ...s, [doc]: { error: t('devisSettings.numberingFormatError') } }));
      return;
    }
    if (!Number.isInteger(next) || next < 1 || next > 99999999) {
      setStatus((s) => ({ ...s, [doc]: { error: t('devisSettings.numberingNextError') } }));
      return;
    }
    setStatus((s) => ({ ...s, [doc]: { saving: true } }));
    const { preview, error } = await saveNumbering(organizationId, doc, state[doc].format, next);
    setStatus((s) => ({ ...s, [doc]: { saving: false, error, saved: preview } }));
  }

  return (
    <View style={{ gap: spacing.md }}>
      {(['facture', 'devis'] as const).map((doc) => {
        const value = state[doc];
        const valid = isValidNumberFormat(value.format);
        const next = Number(value.next);
        const preview = valid && Number.isInteger(next) && next >= 1 ? formatDocumentNumber(value.format, next) : null;
        const st = status[doc] ?? {};
        return (
          <Card key={doc} style={styles.card}>
            <Text style={styles.docTitle}>{t(`devisSettings.numberingDoc.${doc}` as any)}</Text>
            <View style={styles.row}>
              <View style={styles.formatField}>
                <Field
                  label={t('devisSettings.numberingFormatLabel')}
                  value={value.format}
                  onChangeText={(v) => set(doc, { format: v })}
                  editable={isAdmin}
                  autoCapitalize="characters"
                  maxLength={40}
                />
              </View>
              <View style={styles.nextField}>
                <Field
                  label={t('devisSettings.numberingNextLabel')}
                  value={value.next}
                  onChangeText={(v) => set(doc, { next: v.replace(/[^\d]/g, '') })}
                  editable={isAdmin}
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>
            </View>
            {isAdmin ? (
              <View style={styles.chips}>
                {EXAMPLES[doc].map((ex) => (
                  <Pressable key={ex} onPress={() => set(doc, { format: ex })} style={[styles.chip, value.format === ex && styles.chipActive]}>
                    <Text style={[styles.chipText, value.format === ex && styles.chipTextActive]}>{formatDocumentNumber(ex, 1)}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Text style={preview ? styles.preview : styles.error}>
              {preview ? t('devisSettings.numberingPreview', { number: preview }) : t('devisSettings.numberingFormatError')}
            </Text>
            {st.error ? <Text style={styles.error}>{st.error}</Text> : null}
            {st.saved ? <Text style={styles.saved}>{t('devisSettings.numberingSaved', { number: st.saved })}</Text> : null}
            {isAdmin ? (
              <Button title={t('devisSettings.numberingSave')} variant="secondary" loading={st.saving} disabled={!preview} onPress={() => save(doc)} />
            ) : null}
          </Card>
        );
      })}
      <Text style={styles.hint}>{t('devisSettings.numberingTokens')}</Text>
      <Text style={styles.hint}>{t('devisSettings.numberingRules')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  docTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  formatField: { flexGrow: 2, flexBasis: 200 },
  nextField: { flexGrow: 1, flexBasis: 120 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.xs, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  preview: { fontSize: fontSize.sm, color: colors.text },
  saved: { fontSize: fontSize.sm, color: colors.success ?? colors.primary },
  error: { fontSize: fontSize.sm, color: colors.danger },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
});
