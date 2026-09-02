import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../lib/theme';
import { getAppLocale, i18next, useTranslation } from '../lib/translations';
import type { Organization } from '../lib/types';

export interface PreviewLine {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

interface Props {
  kind: 'devis' | 'facture';
  organization: Organization | null;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  projectName?: string | null;
  lines: PreviewLine[];
  discountPercent: string;
}

// Same shape the real submit builds: the discount is one more (negative)
// line item, not a separate totals row — see devis/new.tsx and
// devis/factures/new.tsx's buildItemsPayload/submitDevis. Shared by
// DocumentPreview and LivePreviewBar so the running total shown while
// typing (bar) never drifts from the full preview (page) even by a
// rounding step.
export function computeDocumentTotals(lines: PreviewLine[], discountPercent: string, vatRate: number) {
  const validLines = lines.filter((l) => l.description.trim());
  const discountPct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const rawSubtotal = validLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const discountAmount = discountPct > 0 ? Math.round(rawSubtotal * (discountPct / 100) * 100) / 100 : 0;
  const tableRows: PreviewLine[] =
    discountAmount > 0
      ? [...validLines, { description: i18next.t('documentPreview.discountLine', { pct: discountPct }), quantity: '1', unit: 'pce', unitPrice: String(-discountAmount) }]
      : validLines;
  const subtotal = tableRows.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const vat = subtotal * (vatRate / 100);
  const total = subtotal + vat;
  return { validLines, tableRows, subtotal, vat, total };
}

// A4-proportioned, purely client-side facsimile of the real PDF layout —
// same page ratio, same single-column header (no logo: the real renderer
// never draws one, see supabase/functions/_shared/pdf-document-renderers.ts
// — the org name in brand color is the document's identity mark instead),
// same 4-column table, same totals composition (a discount is folded into
// the line items as a negative row server-side, not a separate totals
// line — mirrored here so the numbers read exactly like the eventual PDF),
// same colors (INK/MUTED/LINE pulled straight from pdf-helpers.ts). Not a
// render of the real thing (that's server-generated, see
// generate-devis-pdf / generate-facture-pdf) — recomputed instantly from
// the same raw form state on every keystroke, with zero network calls.
const INK = '#181C1B';
const MUTED = '#5C6560';
const LINE = '#E1DED4';
// PDF page constants (pt), from supabase/functions/_shared/pdf-helpers.ts —
// only the ratio matters here, the preview scales to fit its column.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

export function DocumentPreview({ kind, organization, clientName, clientAddress, clientEmail, projectName, lines, discountPercent }: Props) {
  const { t } = useTranslation();
  const brandColor = organization?.brand_color || '#1F3D3A';
  const vatRate = organization?.default_vat_rate ?? 8.1;
  const docLabel = kind === 'devis' ? t('documentPreview.docLabelDevis') : t('documentPreview.docLabelFacture');
  const { tableRows, subtotal, vat, total } = computeDocumentTotals(lines, discountPercent, vatRate);

  const orgAddressParts = [
    organization?.street || organization?.address,
    [organization?.postal_code, organization?.locality].filter(Boolean).join(' ') || null,
  ].filter((p): p is string => !!p && p.trim().length > 0);
  const orgLine = [orgAddressParts.join(', '), organization?.ide_number ? `IDE ${organization.ide_number}` : null].filter(Boolean).join(' · ');
  const contactLine = [organization?.phone, organization?.email, organization?.website].filter(Boolean).join(' · ');

  const locale = `${getAppLocale()}-CH`;
  const today = new Date();
  const dueDate = new Date(today.getTime() + 30 * 86400000);
  const metaLine = kind === 'facture' ? t('documentPreview.dueDate', { date: dueDate.toLocaleDateString(locale) }) : null;

  const clientLines = [clientName || t('documentPreview.clientFallback'), clientAddress, clientEmail, projectName ? t('documentPreview.projectLine', { name: projectName }) : null].filter(
    (l): l is string => !!l,
  );

  const validityDays = organization?.devis_validity_days ?? 30;
  const termsBase =
    kind === 'devis' ? t('documentPreview.devisValidity', { days: validityDays }) : t('documentPreview.factureTermsBase');
  const terms = `${organization?.devis_terms?.trim() ? `${organization.devis_terms.trim()} ` : ''}${termsBase} ${t('documentPreview.priceInChf')}`;

  const footerText = organization?.footer_text?.trim() || t('documentPreview.footerFallback');
  const showQrNote = kind === 'facture' && !!organization?.iban;

  return (
    <View style={styles.wrap}>
      <View style={styles.badgeRow}>
        <Text style={styles.badgeText}>{t('documentPreview.liveBadge')}</Text>
      </View>

      <View style={styles.page}>
        <Text style={[styles.orgName, { color: brandColor }]}>{organization?.name || t('documentPreview.orgFallback')}</Text>
        {orgLine ? <Text style={styles.meta}>{orgLine}</Text> : null}
        {contactLine ? <Text style={styles.meta}>{contactLine}</Text> : null}
        <View style={styles.rule} />

        <View style={styles.titleRow}>
          <Text style={[styles.docTitle, { color: brandColor }]} numberOfLines={1}>
            {docLabel}
          </Text>
          <Text style={styles.meta}>{today.toLocaleDateString(locale)}</Text>
        </View>
        {metaLine ? <Text style={[styles.meta, styles.metaLine]}>{metaLine}</Text> : null}

        <Text style={styles.label}>{t('documentPreview.clientLabel')}</Text>
        {clientLines.map((line, i) => (
          <Text key={i} style={[styles.body, i === 0 && styles.clientName]}>
            {line}
          </Text>
        ))}

        <View style={styles.tableHeadRow}>
          <Text style={[styles.th, styles.colDesc]}>{t('documentPreview.colDescription')}</Text>
          <Text style={[styles.th, styles.colQty]}>{t('documentPreview.colQty')}</Text>
          <Text style={[styles.th, styles.colUnit]}>{t('documentPreview.colUnit')}</Text>
          <Text style={[styles.th, styles.colPrice]}>{t('documentPreview.colPrice')}</Text>
          <Text style={[styles.th, styles.colTotal]}>{t('documentPreview.colTotal')}</Text>
        </View>
        {tableRows.length === 0 ? (
          <Text style={styles.emptyHint}>{t('documentPreview.emptyLinesHint')}</Text>
        ) : (
          tableRows.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, styles.colDesc]} numberOfLines={2}>
                {l.description}
              </Text>
              <Text style={[styles.td, styles.colQty]}>{l.quantity}</Text>
              <Text style={[styles.td, styles.colUnit]}>{l.unit}</Text>
              <Text style={[styles.td, styles.colPrice]}>{(Number(l.unitPrice) || 0).toFixed(2)}</Text>
              <Text style={[styles.td, styles.colTotal]}>{((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)).toFixed(2)}</Text>
            </View>
          ))
        )}
        <View style={styles.tableBottomRule} />

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.body}>{t('documentPreview.subtotal')}</Text>
            <Text style={styles.body}>CHF {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.body}>{t('documentPreview.vat', { rate: vatRate })}</Text>
            <Text style={styles.body}>CHF {vat.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>{t('documentPreview.grandTotal')}</Text>
            <Text style={styles.grandTotalValue}>CHF {total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.terms}>{terms}</Text>

        {kind === 'devis' ? (
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>{t('documentPreview.signature')}</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>{clientName ? t('documentPreview.signatureFor', { name: clientName }) : t('documentPreview.signatureClient')}</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        ) : null}

        {showQrNote ? <Text style={styles.qrNote}>{t('documentPreview.qrNote')}</Text> : null}

        <View style={styles.footerRow}>
          <Text style={styles.footerText} numberOfLines={1}>
            {footerText}
          </Text>
          <Text style={styles.footerText}>{t('documentPreview.page1')}</Text>
        </View>
      </View>
    </View>
  );
}

// A single, minimal circular button — an eye, nothing else — floating
// above the form. Tapping it opens the full A4 preview (live: it reflects
// whatever's been typed the instant it opens, no stale snapshot). Kept
// deliberately plain rather than surfacing a running total or last line
// here — that read as UI noise; the preview itself is one tap away.
export function LivePreviewBar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={barStyles.fab} onPress={onPress} hitSlop={8}>
      <Feather name="eye" size={20} color="#fff" />
    </Pressable>
  );
}

const barStyles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  badgeRow: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  page: {
    width: '100%',
    aspectRatio: PAGE_WIDTH / PAGE_HEIGHT,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 2,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  orgName: {
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 2,
  },
  rule: {
    height: 1,
    backgroundColor: LINE,
    marginTop: 10,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  docTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  metaLine: {
    textAlign: 'right',
    marginTop: 3,
  },
  label: {
    fontSize: 7.5,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 4,
  },
  body: {
    fontSize: 8.5,
    color: INK,
    marginTop: 1,
  },
  clientName: {
    fontWeight: '700',
  },
  tableHeadRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingBottom: 5,
    marginTop: 16,
  },
  th: {
    fontSize: 7.5,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  td: {
    fontSize: 8.5,
    color: INK,
  },
  colDesc: {
    flex: 2.6,
    paddingRight: 4,
  },
  colQty: {
    flex: 0.5,
    textAlign: 'right',
  },
  colUnit: {
    flex: 0.7,
    textAlign: 'right',
  },
  colPrice: {
    flex: 0.9,
    textAlign: 'right',
  },
  colTotal: {
    flex: 0.9,
    textAlign: 'right',
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 8.5,
    color: MUTED,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  tableBottomRule: {
    height: 1,
    backgroundColor: LINE,
    marginTop: 2,
  },
  totals: {
    alignSelf: 'flex-end',
    minWidth: '48%',
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: 2,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: INK,
  },
  grandTotalValue: {
    fontSize: 9.5,
    fontWeight: '700',
    color: INK,
  },
  terms: {
    fontSize: 7,
    color: MUTED,
    marginTop: 16,
    lineHeight: 10,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 22,
  },
  signatureBlock: {
    alignItems: 'flex-start',
    minWidth: 90,
  },
  signatureLabel: {
    fontSize: 7,
    color: MUTED,
    marginBottom: 16,
  },
  signatureLine: {
    height: 1,
    width: '100%',
    backgroundColor: LINE,
  },
  qrNote: {
    fontSize: 7,
    color: MUTED,
    fontStyle: 'italic',
    marginTop: 14,
  },
  footerRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 6.5,
    color: MUTED,
  },
});
