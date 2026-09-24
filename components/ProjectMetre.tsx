import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { Button, Card, EmptyState } from './ui';
import { fetchCatalog, findMatches, metreItemsFromTable, parseMetreCsv, type CatalogEntry, type CatalogMatch } from '../lib/catalog';
import { getAppLocale, useTranslation } from '../lib/translations';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { MetreItem } from '../lib/types';

// .xls (legacy binary) alongside .xlsx (zipped XML) — SheetJS reads both
// from the same buffer, same detection as the org-level data-import wizard
// (app/(app)/compte/import.tsx) so a métré exported from Excel doesn't need
// to be saved as CSV first.
const EXCEL_MIME_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

function isExcelFile(name: string | null | undefined, mimeType: string | null | undefined): boolean {
  const lower = (name ?? '').toLowerCase();
  return lower.endsWith('.xlsx') || lower.endsWith('.xls') || EXCEL_MIME_TYPES.includes(mimeType ?? '');
}

// Reads the first sheet into the same {headers, rows} shape parseMetreCsv
// produces from CSV text, so metreItemsFromTable's column detection runs
// identically regardless of which format was picked.
function parseExcelToTable(buffer: ArrayBuffer): { headers: string[]; rows: string[][] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!sheet) return { headers: [], rows: [] };
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '' });
  const [headerRow, ...dataRows] = aoa;
  const headers = (headerRow ?? []).map((h) => String(h ?? '').trim());
  const rows = dataRows
    .filter((r) => r.some((cell) => String(cell ?? '').trim().length > 0))
    .map((r) => headers.map((_, i) => String(r[i] ?? '').trim()));
  return { headers, rows };
}

export function ProjectMetre({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<MetreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('metre_items')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Same catalog as the devis screen — a métré is the step right before a
  // devis, so a description that matches something already priced there
  // should offer that price immediately instead of the writer having to
  // remember it or leave the métré to look it up.
  useEffect(() => {
    fetchCatalog(organizationId).then(setCatalog);
  }, [organizationId]);

  async function addItem(section: string | null = null) {
    const { data } = await supabase
      .from('metre_items')
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        reference: '',
        description: '',
        quantity: 0,
        unit: 'pce',
        unit_price: 0,
        section,
        sort_order: items.length,
        created_by: user?.id ?? null,
      })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data]);
  }

  function patchLocal(id: string, patch: Partial<MetreItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function saveItem(item: MetreItem) {
    await supabase
      .from('metre_items')
      .update({
        reference: item.reference,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        section: item.section,
      })
      .eq('id', item.id);
  }

  async function removeItem(id: string) {
    await supabase.from('metre_items').delete().eq('id', id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  // Fills description/unit/price from a catalog match in one tap — same
  // move as devis/new.tsx's applyMatch, but persisted immediately (a métré
  // line autosaves per field on blur, there's no separate "save" step).
  function applyMatch(item: MetreItem, m: CatalogMatch) {
    const patch = { description: m.description, unit: m.unit, unit_price: m.unitPrice };
    patchLocal(item.id, patch);
    saveItem({ ...item, ...patch });
  }

  function applySection(item: MetreItem, section: string) {
    patchLocal(item.id, { section });
    saveItem({ ...item, section });
  }

  // Groups preserve the order sections first appear in (Map insertion
  // order), which follows sort_order since items load already sorted —
  // there's no separate "sections" table to sort by, a section is just
  // whatever string its lines share.
  const grouped = useMemo(() => {
    const map = new Map<string, MetreItem[]>();
    for (const it of items) {
      const key = (it.section ?? '').trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return map;
  }, [items]);

  const distinctSections = useMemo(
    () => [...new Set(items.map((it) => (it.section ?? '').trim()).filter(Boolean))],
    [items],
  );

  // Section headers/subtotals only earn their visual weight once someone is
  // actually using more than one group — a métré nobody has organized into
  // lots yet still renders as the same plain list it always was.
  const showSections = grouped.size > 1 || (grouped.size === 1 && [...grouped.keys()][0] !== '');

  function lineTotal(it: MetreItem): number {
    return (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
  }

  const byUnit = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const it of items) {
      const unit = it.unit || 'pce';
      totals[unit] = (totals[unit] ?? 0) + Number(it.quantity || 0);
    }
    return totals;
  }, [items]);

  const grandTotal = useMemo(() => items.reduce((sum, it) => sum + lineTotal(it), 0), [items]);

  async function handleImport() {
    setImportError(null);
    setImportSummary(null);
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;

    setImporting(true);
    try {
      const asset = result.assets[0];
      let parsed;
      if (isExcelFile(asset.name, asset.mimeType)) {
        const buffer = await fetch(asset.uri).then((r) => r.arrayBuffer());
        const { headers, rows } = parseExcelToTable(buffer);
        parsed = metreItemsFromTable(headers, rows);
      } else {
        const text = await fetch(asset.uri).then((r) => r.text());
        parsed = parseMetreCsv(text);
      }

      if (parsed.error) {
        setImportError(parsed.error);
        return;
      }
      if (!parsed.items.length) {
        setImportError(t('projectMetre.noValidLines'));
        return;
      }

      const rows = parsed.items.map((it, i) => ({
        organization_id: organizationId,
        project_id: projectId,
        reference: it.reference || null,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unitPrice,
        section: it.section,
        sort_order: items.length + i,
        created_by: user?.id ?? null,
      }));
      const { error } = await supabase.from('metre_items').insert(rows);
      if (error) {
        setImportError(error.message);
        return;
      }
      setImportSummary(
        t('projectMetre.importSummary', { count: rows.length }) +
          (parsed.skipped ? t('projectMetre.importSkippedSuffix', { count: parsed.skipped }) : ''),
      );
      load();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
    } finally {
      setImporting(false);
    }
  }

  async function transferToDevis() {
    if (items.length === 0) return;
    setTransferring(true);
    const { data: devis, error } = await supabase
      .from('devis')
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        client_name: t('projectMetre.generatedClientName'),
        notes: t('projectMetre.generatedDevisNote'),
        status: 'draft',
      })
      .select()
      .single();

    if (!error && devis) {
      await supabase.from('devis_items').insert(
        items
          .filter((it) => it.description.trim())
          .map((it, i) => ({
            devis_id: devis.id,
            description: it.reference ? `${it.reference} — ${it.description}` : it.description,
            quantity: it.quantity,
            unit: it.unit,
            unit_price: it.unit_price || 0,
            sort_order: i,
          })),
      );
      router.push(`/(app)/devis/${devis.id}`);
    }
    setTransferring(false);
  }

  function renderItem(it: MetreItem) {
    const matches = findMatches(catalog, it.description);
    return (
      <Card key={it.id} style={styles.itemCard}>
        <View style={styles.itemHeaderRow}>
          <View style={styles.refField}>
            <Text style={styles.fieldLabel}>{t('projectMetre.ref')}</Text>
            <TextInput
              style={styles.cellInput}
              value={it.reference ?? ''}
              onChangeText={(val) => patchLocal(it.id, { reference: val })}
              onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
              placeholder={t('projectMetre.refPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.sectionField}>
            <Text style={styles.fieldLabel}>{t('projectMetre.section')}</Text>
            <TextInput
              style={styles.cellInput}
              value={it.section ?? ''}
              onChangeText={(val) => patchLocal(it.id, { section: val })}
              onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
              placeholder={t('projectMetre.sectionPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <Pressable style={styles.deleteButton} hitSlop={8} onPress={() => removeItem(it.id)}>
            <Feather name="trash-2" size={16} color={colors.danger} />
          </Pressable>
        </View>

        {!it.section && distinctSections.length > 0 ? (
          <View style={styles.suggestionChips}>
            {distinctSections.slice(0, 5).map((s) => (
              <Pressable key={s} style={styles.sectionChip} onPress={() => applySection(it, s)}>
                <Feather name="folder" size={10} color={colors.primary} />
                <Text style={styles.sectionChipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('projectMetre.designation')}</Text>
          <TextInput
            style={[styles.cellInput, styles.descInput]}
            value={it.description}
            onChangeText={(val) => patchLocal(it.id, { description: val })}
            onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
            placeholder={t('projectMetre.designationPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        {matches.length > 0 ? (
          <View style={styles.suggestionRow}>
            <Feather name="zap" size={11} color={colors.primary} style={{ marginTop: 3 }} />
            <View style={styles.suggestionChips}>
              {matches.map((m) => (
                <Pressable key={m.description} style={styles.suggestionChip} onPress={() => applyMatch(it, m)}>
                  <Text style={styles.suggestionMatch}>{Math.round(m.score * 100)}%</Text>
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {m.description}
                  </Text>
                  <Text style={styles.suggestionPrice}>CHF {m.unitPrice.toFixed(2)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.row3}>
          <View style={styles.row3Item}>
            <Text style={styles.fieldLabel}>{t('projectMetre.quantity')}</Text>
            <TextInput
              style={styles.cellInput}
              value={String(it.quantity)}
              onChangeText={(val) => patchLocal(it.id, { quantity: Number(val) || 0 })}
              onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.row3Item}>
            <Text style={styles.fieldLabel}>{t('projectMetre.unit')}</Text>
            <TextInput
              style={styles.cellInput}
              value={it.unit ?? ''}
              onChangeText={(val) => patchLocal(it.id, { unit: val })}
              onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
              placeholder={t('projectMetre.unitPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.row3Item}>
            <Text style={styles.fieldLabel}>{t('projectMetre.unitPrice')}</Text>
            <TextInput
              style={styles.cellInput}
              value={String(it.unit_price ?? 0)}
              onChangeText={(val) => patchLocal(it.id, { unit_price: Number(val) || 0 })}
              onBlur={() => saveItem(items.find((x) => x.id === it.id)!)}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
        {lineTotal(it) > 0 ? <Text style={styles.lineTotal}>{t('projectMetre.lineTotal', { amount: lineTotal(it).toFixed(2) })}</Text> : null}
      </Card>
    );
  }

  return (
    <View>
      <View style={styles.actionsRow}>
        <Button title={t('projectMetre.addLine')} icon="plus" onPress={() => addItem(null)} />
        <Button
          title={importing ? t('projectMetre.importing') : t('projectMetre.importFile')}
          variant="secondary"
          icon="upload"
          onPress={handleImport}
          loading={importing}
        />
        {items.length > 0 ? (
          <Button
            title={t('projectMetre.createDevisFromMetre')}
            variant="secondary"
            icon="file-plus"
            onPress={transferToDevis}
            loading={transferring}
          />
        ) : null}
      </View>
      {importError ? <Text style={styles.importError}>{importError}</Text> : null}
      {importSummary ? <Text style={styles.importSummary}>{importSummary}</Text> : null}

      {items.length === 0 && !loading ? (
        <EmptyState title={t('projectMetre.emptyTitle')} subtitle={t('projectMetre.emptySubtitle')} />
      ) : (
        <View style={{ gap: spacing.xl }}>
          {[...grouped.entries()].map(([section, sectionItems]) => {
            const sectionTotal = sectionItems.reduce((sum, it) => sum + lineTotal(it), 0);
            return (
              <View key={section || '__none__'} style={{ gap: spacing.md }}>
                {showSections ? (
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeaderText}>{section || t('projectMetre.noSection')}</Text>
                    <View style={styles.sectionHeaderRight}>
                      {sectionTotal > 0 ? (
                        <Text style={styles.sectionHeaderTotal}>{t('projectMetre.lineTotal', { amount: sectionTotal.toFixed(2) })}</Text>
                      ) : null}
                      <Pressable style={styles.sectionAddLine} onPress={() => addItem(section || null)} hitSlop={6}>
                        <Feather name="plus" size={13} color={colors.primary} />
                        <Text style={styles.sectionAddLineText}>{t('projectMetre.addLine')}</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
                <View style={{ gap: spacing.md }}>{sectionItems.map(renderItem)}</View>
              </View>
            );
          })}
        </View>
      )}

      {Object.keys(byUnit).length > 0 ? (
        <View style={styles.totals}>
          <Text style={styles.totalsTitle}>{t('projectMetre.totalsTitle')}</Text>
          <View style={styles.totalsRow}>
            {Object.entries(byUnit).map(([unit, qty]) => (
              <View key={unit} style={styles.totalChip}>
                <Text style={styles.totalChipText}>
                  {qty.toLocaleString(`${getAppLocale()}-CH`, { maximumFractionDigits: 2 })} {unit}
                </Text>
              </View>
            ))}
          </View>
          {grandTotal > 0 ? (
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>{t('projectMetre.grandTotal')}</Text>
              <Text style={styles.grandTotalValue}>CHF {grandTotal.toFixed(2)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  importError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  importSummary: {
    color: colors.success,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  sectionHeaderText: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionHeaderTotal: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionAddLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionAddLineText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  itemCard: {
    gap: spacing.sm,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  refField: {
    width: 80,
    gap: 4,
  },
  sectionField: {
    flex: 1,
    minWidth: 100,
    gap: 4,
  },
  deleteButton: {
    marginLeft: 'auto',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  sectionChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  // Quantité/Unité/Prix wrap to full width on narrow screens instead of
  // being squeezed into fixed-width table columns — the old table layout
  // summed to well over a phone's screen width, so typing into a cell meant
  // fighting a horizontally squished, unreadable row.
  row3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row3Item: {
    flexGrow: 1,
    flexBasis: 100,
    gap: 4,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  cellInput: {
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  descInput: {
    minHeight: 44,
    textAlignVertical: 'top',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  suggestionChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 260,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  suggestionMatch: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  suggestionText: {
    fontSize: fontSize.xs,
    color: colors.text,
    flexShrink: 1,
  },
  suggestionPrice: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  lineTotal: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  totals: {
    marginTop: spacing.lg,
  },
  totalsTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  totalChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  totalChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  grandTotalLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
});
