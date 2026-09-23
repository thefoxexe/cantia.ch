import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../lib/theme';
import { getAppLocale, i18next, useTranslation } from '../lib/translations';
import { getSignedUrl } from '../lib/api/storage';
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
  // Free text typed for this specific document — devis.notes/factures.notes
  // — printed below the totals, ahead of the org-wide terms. Distinct from
  // organization.devis_terms, which is fixed across every document.
  remark?: string;
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
// kept in sync by hand with supabase/functions/_shared/pdf-document-
// renderers.ts (there is no code sharing between a Deno edge function and
// this React Native component, so every visual change made there has to be
// mirrored here): the logo + its left/center/right placement, the brand-
// colored doc-type label, the tinted reference/date/validity box with its
// left accent edge, the brand-colored table header band, zebra-striped
// rows, and the boxed total highlight. The terms line is genuinely
// optional now too — only org.devis_terms, printed if set, nothing
// auto-generated — matching drawTerms() removing the old boilerplate.
// Recomputed instantly from the same raw form state on every keystroke,
// zero network calls — not a render of the real thing (that's server-
// generated, see generate-devis-pdf / generate-facture-pdf), but built to
// track it as closely as a client-side facsimile reasonably can.
const INK = '#181C1B';
const MUTED = '#5C6560';
const LINE = '#E1DED4';
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
// PDF page constants (pt), from supabase/functions/_shared/pdf-helpers.ts —
// only the ratio matters here, the preview scales to fit its column.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

// Same softTint/pickReadableTextColor math as pdf-helpers.ts, reimplemented
// in JS since the edge function's Deno code isn't importable here.
function safeHex(hex: string | null | undefined): string {
  return hex && HEX_RE.test(hex) ? hex : '#1F3D3A';
}
function tint(hex: string, amount: number): string {
  const clean = safeHex(hex);
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
function readableTextColor(hex: string): string {
  const clean = safeHex(hex);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const r = lin(parseInt(clean.slice(1, 3), 16) / 255);
  const g = lin(parseInt(clean.slice(3, 5), 16) / 255);
  const b = lin(parseInt(clean.slice(5, 7), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? INK : '#fff';
}

export function DocumentPreview({ kind, organization, clientName, clientAddress, clientEmail, projectName, lines, discountPercent, remark }: Props) {
  const { t } = useTranslation();
  const brandColor = safeHex(organization?.brand_color);
  const vatRate = organization?.default_vat_rate ?? 8.1;
  const docLabel = kind === 'devis' ? t('documentPreview.docLabelDevis') : t('documentPreview.docLabelFacture');
  const { tableRows, subtotal, vat, total } = computeDocumentTotals(lines, discountPercent, vatRate);

  // Same asset + left/center/right placement setting as the real PDF's
  // header (compte/apparence) — resolved to a signed URL like every other
  // screen that displays org.logo_url (a storage path, not a public URL).
  const [logoUri, setLogoUri] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (organization?.logo_url) {
      getSignedUrl(organization.logo_url).then((url) => {
        if (!cancelled) setLogoUri(url);
      });
    } else {
      setLogoUri(null);
    }
    return () => {
      cancelled = true;
    };
  }, [organization?.logo_url]);
  const logoPlacement = organization?.logo_placement ?? 'right';
  const headerDirection = logoPlacement === 'left' ? 'row' : logoPlacement === 'center' ? 'column' : 'row-reverse';
  const centerHeader = logoPlacement === 'center';

  const orgAddressParts = [
    organization?.street || organization?.address,
    [organization?.postal_code, organization?.locality].filter(Boolean).join(' ') || null,
  ].filter((p): p is string => !!p && p.trim().length > 0);
  const orgLine = [orgAddressParts.join(', '), organization?.ide_number ? `IDE ${organization.ide_number}` : null].filter(Boolean).join(' · ');
  const contactLine = [organization?.phone, organization?.email, organization?.website].filter(Boolean).join(' · ');

  const locale = `${getAppLocale()}-CH`;
  const today = new Date();
  const dueDate = new Date(today.getTime() + 30 * 86400000);
  const validityDays = organization?.devis_validity_days ?? 30;

  // Same 3-row reference box as the real PDF (Référence/Date + either
  // Échéance or Validité) — "—" for the reference since a draft doesn't
  // have a document number yet (the real renderer's own fallback for a
  // missing devis.number/facture.number).
  const boxRows = [
    `${t('documentPreview.reference')} : —`,
    `${t('documentPreview.date')} : ${today.toLocaleDateString(locale)}`,
    kind === 'facture' ? t('documentPreview.dueDate', { date: dueDate.toLocaleDateString(locale) }) : t('documentPreview.validity', { days: validityDays }),
  ];

  const clientLines = [clientName || t('documentPreview.clientFallback'), clientAddress, clientEmail, projectName ? t('documentPreview.projectLine', { name: projectName }) : null].filter(
    (l): l is string => !!l,
  );

  // No more auto-generated "valable X jours" / "prix en CHF" / "merci de
  // régler" — matches drawTerms() in pdf-document-renderers.ts, which now
  // only prints the org's own optional custom terms, nothing else.
  const terms = organization?.devis_terms?.trim() || null;
  const remarkText = remark?.trim() || null;

  const footerText = organization?.footer_text?.trim() || t('documentPreview.footerFallback');
  const showQrNote = kind === 'facture' && !!organization?.iban;

  const headTextColor = readableTextColor(brandColor);
  const refBoxBg = tint(brandColor, 0.93);
  const zebraBg = tint(brandColor, 0.96);
  const totalBoxBg = tint(brandColor, 0.9);

  return (
    <View style={styles.wrap}>
      <View style={styles.badgeRow}>
        <Text style={styles.badgeText}>{t('documentPreview.liveBadge')}</Text>
      </View>

      <View style={styles.page}>
        <View style={[styles.headerRow, { flexDirection: headerDirection }, centerHeader && styles.headerRowCenter]}>
          {logoUri ? <Image source={{ uri: logoUri }} style={[styles.logo, centerHeader && styles.logoCenter]} resizeMode="contain" /> : null}
          <View style={centerHeader ? styles.headerTextCenter : styles.headerText}>
            <Text style={[styles.orgName, { color: brandColor }, centerHeader && styles.textCenter]}>{organization?.name || t('documentPreview.orgFallback')}</Text>
            {orgLine ? <Text style={[styles.meta, centerHeader && styles.textCenter]}>{orgLine}</Text> : null}
            {contactLine ? <Text style={[styles.meta, centerHeader && styles.textCenter]}>{contactLine}</Text> : null}
          </View>
        </View>
        <View style={styles.rule} />

        <Text style={[styles.docTitle, { color: brandColor }]}>{docLabel.toUpperCase()}</Text>

        <View style={[styles.refBox, { backgroundColor: refBoxBg, borderLeftColor: brandColor }]}>
          {boxRows.map((row, i) => (
            <Text key={i} style={styles.refBoxLine}>
              {row}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>{t('documentPreview.clientLabel')}</Text>
        {clientLines.map((line, i) => (
          <Text key={i} style={[styles.body, i === 0 && styles.clientName]}>
            {line}
          </Text>
        ))}

        <View style={[styles.tableHeadRow, { backgroundColor: brandColor }]}>
          <Text style={[styles.th, styles.colDesc, { color: headTextColor }]}>{t('documentPreview.colDescription')}</Text>
          <Text style={[styles.th, styles.colQty, { color: headTextColor }]}>{t('documentPreview.colQty')}</Text>
          <Text style={[styles.th, styles.colUnit, { color: headTextColor }]}>{t('documentPreview.colUnit')}</Text>
          <Text style={[styles.th, styles.colPrice, { color: headTextColor }]}>{t('documentPreview.colPrice')}</Text>
          <Text style={[styles.th, styles.colTotal, { color: headTextColor }]}>{t('documentPreview.colTotal')}</Text>
        </View>
        {tableRows.length === 0 ? (
          <Text style={styles.emptyHint}>{t('documentPreview.emptyLinesHint')}</Text>
        ) : (
          tableRows.map((l, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && { backgroundColor: zebraBg }]}>
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

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.body}>{t('documentPreview.subtotal')}</Text>
            <Text style={styles.body}>CHF {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.body}>{t('documentPreview.vat', { rate: vatRate })}</Text>
            <Text style={styles.body}>CHF {vat.toFixed(2)}</Text>
          </View>
          <View style={[styles.grandTotalBox, { backgroundColor: totalBoxBg, borderColor: brandColor }]}>
            <Text style={[styles.grandTotalLabel, { color: brandColor }]}>{t('documentPreview.grandTotal')}</Text>
            <Text style={[styles.grandTotalValue, { color: brandColor }]}>CHF {total.toFixed(2)}</Text>
          </View>
        </View>

        {remarkText ? (
          <View style={styles.remarkBlock}>
            <Text style={styles.remarkBlockLabel}>{t('documentPreview.remarkLabel')}</Text>
            <Text style={styles.remarkBlockText}>{remarkText}</Text>
          </View>
        ) : null}

        {terms ? <Text style={styles.terms}>{terms}</Text> : null}

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
  headerRow: {
    alignItems: 'flex-start',
    gap: 10,
  },
  headerRowCenter: {
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTextCenter: {
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 26,
  },
  logoCenter: {
    width: 54,
    height: 30,
    marginBottom: 4,
  },
  textCenter: {
    textAlign: 'center',
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
  docTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  refBox: {
    borderLeftWidth: 2.5,
    borderRadius: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 8,
    gap: 2,
    alignSelf: 'flex-start',
  },
  refBoxLine: {
    fontSize: 8,
    color: INK,
  },
  label: {
    fontSize: 7.5,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 12,
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
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginTop: 14,
    borderRadius: 1,
  },
  th: {
    fontSize: 7.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
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
  totals: {
    alignSelf: 'flex-end',
    minWidth: '55%',
    marginTop: 10,
    gap: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  grandTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 3,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: '800',
  },
  remarkBlock: {
    marginTop: 14,
  },
  remarkBlockLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  remarkBlockText: {
    fontSize: 8,
    color: INK,
    lineHeight: 11,
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
