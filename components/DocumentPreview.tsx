import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getSignedUrl } from '../lib/api/storage';
import { colors, fontSize, radius, spacing } from '../lib/theme';
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
  lines: PreviewLine[];
  discountPercent: string;
}

// A live, purely client-side facsimile of the eventual PDF — not a render of
// the real thing (that's generated server-side, see generate-devis-pdf /
// generate-facture-pdf), just close enough visually that filling in the form
// reads as "building a document" instead of "filling in a spreadsheet".
// Recomputes from the same raw line data the form already holds, so it's
// always in sync with zero extra network calls.
export function DocumentPreview({ kind, organization, clientName, clientAddress, clientEmail, lines, discountPercent }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!organization?.logo_url) {
      setLogoUrl(null);
      return;
    }
    getSignedUrl(organization.logo_url).then((url) => {
      if (!cancelled) setLogoUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [organization?.logo_url]);

  const validLines = lines.filter((l) => l.description.trim());
  const subtotal = validLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const discountPct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const discountAmount = discountPct > 0 ? subtotal * (discountPct / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const vatRate = organization?.default_vat_rate ?? 8.1;
  const vat = afterDiscount * (vatRate / 100);
  const total = afterDiscount + vat;

  const brandColor = organization?.brand_color || colors.primary;
  const orgAddressLines = [organization?.street || organization?.address, [organization?.postal_code, organization?.locality].filter(Boolean).join(' ')].filter(
    (l): l is string => !!l,
  );
  const today = new Date().toLocaleDateString('fr-CH');

  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Aperçu — se met à jour au fur et à mesure</Text>
      </View>
      <ScrollView style={styles.sheet} contentContainerStyle={styles.paper} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" /> : null}
            <Text style={styles.orgName}>{organization?.name || 'Votre entreprise'}</Text>
            {orgAddressLines.map((line) => (
              <Text key={line} style={styles.meta}>
                {line}
              </Text>
            ))}
            {organization?.ide_number ? <Text style={styles.meta}>IDE {organization.ide_number}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.docType, { color: brandColor }]}>{kind === 'devis' ? 'DEVIS' : 'FACTURE'}</Text>
            <Text style={styles.meta}>Brouillon</Text>
            <Text style={styles.meta}>{today}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: brandColor }]} />

        <View style={styles.clientBlock}>
          <Text style={styles.clientLabel}>{kind === 'devis' ? 'Devis pour' : 'Facturé à'}</Text>
          <Text style={styles.clientName}>{clientName || 'Nom du client'}</Text>
          {clientAddress ? <Text style={styles.meta}>{clientAddress}</Text> : null}
          {clientEmail ? <Text style={styles.meta}>{clientEmail}</Text> : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeadRow}>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qté</Text>
            <Text style={[styles.th, styles.colPrice]}>P.U.</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>
          {validLines.length === 0 ? (
            <Text style={styles.emptyHint}>Les lignes ajoutées ci-contre apparaîtront ici.</Text>
          ) : (
            validLines.map((l, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, styles.colDesc]} numberOfLines={2}>
                  {l.description}
                </Text>
                <Text style={[styles.td, styles.colQty]}>
                  {l.quantity} {l.unit}
                </Text>
                <Text style={[styles.td, styles.colPrice]}>{(Number(l.unitPrice) || 0).toFixed(2)}</Text>
                <Text style={[styles.td, styles.colTotal]}>{((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)).toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>CHF {subtotal.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise ({discountPct}%)</Text>
              <Text style={styles.totalValue}>− CHF {discountAmount.toFixed(2)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({vatRate}%)</Text>
            <Text style={styles.totalValue}>CHF {vat.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow, { borderTopColor: brandColor }]}>
            <Text style={styles.grandTotalLabel}>Total {kind === 'facture' ? 'TTC' : 'estimé'}</Text>
            <Text style={[styles.grandTotalValue, { color: brandColor }]}>CHF {total.toFixed(2)}</Text>
          </View>
        </View>

        {kind === 'devis' && organization?.devis_terms ? <Text style={styles.terms}>{organization.devis_terms}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 640,
  },
  paper: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  logo: {
    width: 90,
    height: 36,
    marginBottom: spacing.xs,
  },
  orgName: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  docType: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  meta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    marginVertical: spacing.md,
    opacity: 0.7,
  },
  clientBlock: {
    marginBottom: spacing.lg,
    gap: 2,
  },
  clientLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  clientName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  table: {
    marginBottom: spacing.md,
  },
  tableHeadRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 4,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  td: {
    fontSize: 11.5,
    color: colors.text,
  },
  colDesc: {
    flex: 2.4,
    paddingRight: spacing.xs,
  },
  colQty: {
    flex: 1,
    textAlign: 'right',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  totals: {
    alignSelf: 'flex-end',
    minWidth: 200,
    gap: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalLabel: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 11.5,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  grandTotalRow: {
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 6,
  },
  grandTotalLabel: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  terms: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 14,
  },
});
