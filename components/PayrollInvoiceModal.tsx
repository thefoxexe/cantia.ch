import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createFactureFromLines, markTimeEntriesInvoiced } from '../lib/api/factures';
import { Button, Card, Switch } from './ui';
import { ClientPicker } from './ClientPicker';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useTranslation } from '../lib/translations';

export interface InvoiceCandidateLine {
  workTypeId: string | null;
  label: string;
  hours: number;
  suggestedRate: number | null;
  entryIds: string[];
}

interface LineDraft {
  included: boolean;
  description: string;
  mode: 'rate' | 'fixed';
  rate: string;
  fixedAmount: string;
}

function amountFor(draft: LineDraft, hours: number): number {
  if (draft.mode === 'fixed') return Number(draft.fixedAmount.replace(',', '.')) || 0;
  const rate = Number(draft.rate.replace(',', '.')) || 0;
  return Math.round(rate * hours * 100) / 100;
}

// "Facturer ce chantier" — turns the RH summary's per-work-type hour
// totals into a real facture, one line ("position") per type of work. The
// invoice line itself never shows the hour count: just a label and a final
// CHF amount, computed either from an hourly rate × the logged hours, or
// typed directly as a flat amount — the choice is per line.
export function PayrollInvoiceModal({
  visible,
  onClose,
  organizationId,
  defaultVatRate,
  project,
  candidateLines,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  defaultVatRate: number;
  project: { id: string; name: string; client_name: string | null } | null;
  candidateLines: InvoiceCandidateLine[];
  onCreated: (factureId: string) => void;
}) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<Record<string, LineDraft>>({});
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deliberately keyed on `visible`/`project?.id` alone, not on
  // `candidateLines` — a caller that recomputes that array inline on every
  // render (a new array/object identity each time, even with unchanged
  // content) would otherwise wipe out every draft the admin had already
  // filled in on each unrelated re-render while the modal stays open (e.g.
  // toggling "Prix à l'heure" appeared to silently revert to "Montant
  // fixe"). Re-initializing only on the open transition (or switching to a
  // different project) is what "reset the form" should actually mean.
  useEffect(() => {
    if (!visible) return;
    setClientName(project?.client_name ?? '');
    setClientAddress('');
    setClientEmail('');
    setClientId(null);
    const next: Record<string, LineDraft> = {};
    for (const line of candidateLines) {
      const key = line.workTypeId ?? line.label;
      next[key] = {
        included: line.hours > 0,
        description: '',
        mode: line.suggestedRate != null ? 'rate' : 'fixed',
        rate: line.suggestedRate != null ? String(line.suggestedRate) : '',
        fixedAmount: '',
      };
    }
    setDrafts(next);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, project?.id]);

  function updateDraft(key: string, patch: Partial<LineDraft>) {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  const total = candidateLines.reduce((sum, line) => {
    const key = line.workTypeId ?? line.label;
    const draft = drafts[key];
    if (!draft?.included) return sum;
    return sum + amountFor(draft, line.hours);
  }, 0);

  async function handleCreate() {
    if (!project) return;
    if (!clientName.trim()) {
      setError(t('payrollInvoiceModal.clientNameRequired'));
      return;
    }
    const includedLines = candidateLines.filter((line) => drafts[line.workTypeId ?? line.label]?.included);
    const lines = includedLines.map((line) => {
      const key = line.workTypeId ?? line.label;
      const draft = drafts[key];
      const description = draft.description.trim() ? `${line.label} — ${draft.description.trim()}` : line.label;
      return { description, amountChf: amountFor(draft, line.hours) };
    });
    if (lines.length === 0) {
      setError(t('payrollInvoiceModal.selectAtLeastOneLine'));
      return;
    }
    setSaving(true);
    setError(null);
    const { id, error: err } = await createFactureFromLines({
      organizationId,
      projectId: project.id,
      clientName: clientName.trim(),
      clientAddress: clientAddress.trim() || null,
      clientEmail: clientEmail.trim() || null,
      clientId,
      vatRate: defaultVatRate,
      notes: null,
      lines,
    });
    if (err || !id) {
      setSaving(false);
      setError(err ?? t('payrollInvoiceModal.createFailed'));
      return;
    }
    // So "Facturer ce chantier" doesn't offer these same hours again.
    const entryIds = includedLines.flatMap((line) => line.entryIds);
    await markTimeEntriesInvoiced(entryIds, id);
    setSaving(false);
    onCreated(id);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.sheetTitle}>{t('payrollInvoiceModal.title', { project: project?.name ?? t('payrollInvoiceModal.thisProjectFallback') })}</Text>

            <Text style={styles.fieldLabel}>{t('payrollInvoiceModal.clientLabel')}</Text>
            <ClientPicker
              organizationId={organizationId}
              onSelect={(client) => {
                setClientName(client.name);
                setClientAddress(client.address ?? '');
                setClientEmail(client.email ?? '');
                setClientId(client.id);
              }}
            />
            {clientName ? (
              <Card style={styles.selectedClientCard}>
                <Text style={styles.selectedClientName}>{clientName}</Text>
                {clientAddress ? <Text style={styles.selectedClientMeta}>{clientAddress}</Text> : null}
                {clientEmail ? <Text style={styles.selectedClientMeta}>{clientEmail}</Text> : null}
              </Card>
            ) : null}

            <Text style={styles.fieldLabel}>{t('payrollInvoiceModal.positionsLabel')}</Text>
            <View style={{ gap: spacing.md }}>
              {candidateLines.map((line) => {
                const key = line.workTypeId ?? line.label;
                const draft = drafts[key];
                if (!draft) return null;
                return (
                  <View key={key} style={styles.lineCard}>
                    <View style={styles.lineHeader}>
                      <Switch value={draft.included} onChange={(v) => updateDraft(key, { included: v })} />
                      <Text style={styles.lineLabel}>{line.label}</Text>
                      <Text style={styles.lineHours}>{line.hours} h</Text>
                    </View>

                    {draft.included ? (
                      <>
                        <TextInput
                          style={styles.descInput}
                          value={draft.description}
                          onChangeText={(v) => updateDraft(key, { description: v })}
                          placeholder={t('payrollInvoiceModal.descriptionPlaceholder')}
                          placeholderTextColor={colors.textMuted}
                        />
                        <View style={styles.modeRow}>
                          <Pressable onPress={() => updateDraft(key, { mode: 'rate' })} style={[styles.modeChip, draft.mode === 'rate' && styles.modeChipActive]}>
                            <Text style={[styles.modeChipText, draft.mode === 'rate' && styles.modeChipTextActive]}>{t('payrollInvoiceModal.modeRate')}</Text>
                          </Pressable>
                          <Pressable onPress={() => updateDraft(key, { mode: 'fixed' })} style={[styles.modeChip, draft.mode === 'fixed' && styles.modeChipActive]}>
                            <Text style={[styles.modeChipText, draft.mode === 'fixed' && styles.modeChipTextActive]}>{t('payrollInvoiceModal.modeFixed')}</Text>
                          </Pressable>
                        </View>
                        {draft.mode === 'rate' ? (
                          <View style={styles.amountRow}>
                            <TextInput
                              style={styles.amountInput}
                              value={draft.rate}
                              onChangeText={(v) => updateDraft(key, { rate: v })}
                              keyboardType="decimal-pad"
                              placeholder={t('payrollInvoiceModal.ratePlaceholder')}
                              placeholderTextColor={colors.textMuted}
                            />
                            <Text style={styles.amountResult}>= CHF {amountFor(draft, line.hours).toFixed(2)}</Text>
                          </View>
                        ) : (
                          <TextInput
                            style={styles.amountInput}
                            value={draft.fixedAmount}
                            onChangeText={(v) => updateDraft(key, { fixedAmount: v })}
                            keyboardType="decimal-pad"
                            placeholder={t('payrollInvoiceModal.fixedAmountPlaceholder')}
                            placeholderTextColor={colors.textMuted}
                          />
                        )}
                      </>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('payrollInvoiceModal.totalExclVat')}</Text>
              <Text style={styles.totalValue}>CHF {total.toFixed(2)}</Text>
            </View>
            <Text style={styles.hint}>{t('payrollInvoiceModal.draftHint')}</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title={t('payrollInvoiceModal.create')} icon="check" onPress={handleCreate} loading={saving} style={{ marginTop: spacing.md }} />
            <Button title={t('payrollInvoiceModal.cancel')} variant="secondary" onPress={onClose} style={{ marginTop: spacing.sm }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 18, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  selectedClientCard: {
    marginBottom: spacing.sm,
  },
  selectedClientName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  selectedClientMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  lineCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lineLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  lineHours: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  descInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  modeChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountInput: {
    width: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  amountResult: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
