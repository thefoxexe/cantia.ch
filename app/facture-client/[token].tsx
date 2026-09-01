import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getPublicFacture, getPublicDocumentPdfUrl } from '../../lib/api/publicPortal';
import { downloadFile } from '../../lib/downloadFile';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { ClientPortalFooter } from '../../components/ClientPortalFooter';
import { Button, Field } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { premiumCard, portalFonts, heroWash } from '../../lib/clientPortalTheme';
import type { PublicFacturePayload } from '../../lib/types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  partial: 'Partiellement payée',
  paid: 'Payée',
  cancelled: 'Annulée',
};

const TRUST_POINTS: { icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
  { icon: 'lock', label: 'Lien chiffré et personnel' },
  { icon: 'map-pin', label: 'Hébergé en Suisse' },
  { icon: 'eye-off', label: 'Vos données ne sont pas partagées' },
];

function chf(n: number): string {
  return `${n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

export default function PublicFactureScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [payload, setPayload] = useState<PublicFacturePayload | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function handleOpenHistory() {
    if (!token || !email.trim()) return;
    router.push(`/client-documents/${token}?kind=facture&email=${encodeURIComponent(email.trim())}` as any);
  }

  async function handleVerify() {
    if (!token || !email.trim()) return;
    setChecking(true);
    setCheckError(null);
    const { data, error } = await getPublicFacture(token, email.trim());
    setChecking(false);
    if (error || !data) {
      setCheckError("Impossible de vérifier cette facture. Vérifiez l'adresse email associée à cette facture.");
      return;
    }
    setPayload(data);
  }

  if (!payload) {
    return (
      <ScrollView style={[styles.screen, heroWash]} contentContainerStyle={styles.gate}>
        <View style={styles.gateHeader}>
          <ClientPortalHeader />
        </View>
        <View style={[premiumCard, styles.gateCard]}>
          <View style={styles.gateIcon}>
            <Feather name="lock" size={22} color={colors.primary} />
          </View>
          <Text style={styles.gateTitle}>Consulter ma facture</Text>
          <Text style={styles.gateSubtitle}>
            Pour votre sécurité, saisissez l'adresse email à laquelle cette facture vous a été adressée. Ce lien est personnel et ne
            fonctionne qu'avec cette adresse.
          </Text>
          <Field label="Adresse email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.ch" />
          {checkError ? <Text style={styles.error}>{checkError}</Text> : null}
          <Button title="Voir la facture" onPress={handleVerify} loading={checking} disabled={!email.trim()} style={styles.pillButton} />
          <View style={styles.trustList}>
            {TRUST_POINTS.map((p) => (
              <View key={p.label} style={styles.trustRow}>
                <Feather name={p.icon} size={13} color={colors.success} />
                <Text style={styles.trustText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <ClientPortalFooter />
      </ScrollView>
    );
  }

  async function handleDownloadPdf() {
    if (!token) return;
    setDownloadingPdf(true);
    setDownloadError(null);
    const { url, error } = await getPublicDocumentPdfUrl(token, 'facture', email.trim());
    setDownloadingPdf(false);
    if (error || !url) {
      setDownloadError(error ?? 'Échec du téléchargement.');
      return;
    }
    await downloadFile(url, `Facture-${payload?.facture.number ?? token}.pdf`);
  }

  const { facture, items, totals, paid, remaining, organization } = payload;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader onMenuPress={handleOpenHistory} />

      <View style={[premiumCard, styles.headerCard]}>
        <Text style={styles.eyebrow}>{facture.is_deposit ? 'Facture d’acompte' : 'Facture'} {facture.number ?? ''}</Text>
        <Text style={styles.orgName}>{organization.name}</Text>
        <View style={[styles.statusPill, facture.status === 'paid' && styles.statusPillAccepted]}>
          <Text style={[styles.statusPillText, facture.status === 'paid' && styles.statusPillTextAccepted]}>
            {STATUS_LABELS[facture.status] ?? facture.status}
          </Text>
        </View>
        {facture.has_pdf ? (
          <Button
            title="Télécharger le PDF"
            variant="secondary"
            icon="download"
            loading={downloadingPdf}
            onPress={handleDownloadPdf}
            style={{ marginTop: spacing.md, alignSelf: 'flex-start', borderRadius: radius.pill }}
          />
        ) : null}
        {downloadError ? <Text style={styles.error}>{downloadError}</Text> : null}
      </View>

      <View style={[premiumCard, styles.card]}>
        <Text style={styles.sectionTitle}>Client</Text>
        <Text style={styles.line}>{facture.client_name}</Text>
        {facture.client_address ? <Text style={styles.lineMuted}>{facture.client_address}</Text> : null}
      </View>

      <View style={[premiumCard, styles.card]}>
        <Text style={styles.sectionTitle}>Détail</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemQty}>
              {item.quantity} {item.unit ?? ''}
            </Text>
            <Text style={styles.itemAmount}>{chf(item.quantity * item.unit_price)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalsRow}>
          <Text style={styles.lineMuted}>Sous-total</Text>
          <Text style={styles.line}>{chf(totals.subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.lineMuted}>TVA ({facture.vat_rate}%)</Text>
          <Text style={styles.line}>{chf(totals.vat)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{chf(totals.total)}</Text>
        </View>
        {paid > 0 ? (
          <View style={styles.totalsRow}>
            <Text style={styles.lineMuted}>Déjà réglé</Text>
            <Text style={styles.line}>{chf(paid)}</Text>
          </View>
        ) : null}
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>Solde restant dû</Text>
          <Text style={styles.totalAmount}>{chf(remaining)}</Text>
        </View>
        {facture.notes ? <Text style={[styles.lineMuted, { marginTop: spacing.md }]}>{facture.notes}</Text> : null}
      </View>

      <View style={[premiumCard, styles.card]}>
        <Text style={styles.sectionTitle}>Échéance</Text>
        <Text style={styles.line}>{new Date(facture.due_date).toLocaleDateString('fr-CH')}</Text>
        {facture.paid_at ? <Text style={styles.lineMuted}>Réglée le {new Date(facture.paid_at).toLocaleDateString('fr-CH')}</Text> : null}
      </View>
      <ClientPortalFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  gate: {
    flexGrow: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  gateHeader: {
    width: '100%',
    maxWidth: 440,
  },
  gateCard: {
    width: '100%',
    maxWidth: 440,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  gateIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  gateTitle: {
    fontFamily: portalFonts.display,
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.4,
  },
  gateSubtitle: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 21,
  },
  pillButton: {
    width: '100%',
    borderRadius: radius.pill,
  },
  trustList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trustText: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  headerCard: {
    gap: 2,
  },
  card: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orgName: {
    fontFamily: portalFonts.display,
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.4,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.pill,
  },
  statusPillAccepted: {
    backgroundColor: colors.successSoft,
  },
  statusPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statusPillTextAccepted: {
    color: colors.success,
  },
  sectionTitle: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  line: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  lineMuted: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemDescription: {
    flex: 1,
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  itemQty: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  itemAmount: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '700',
    minWidth: 90,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
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
  totalLabel: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  totalAmount: {
    fontFamily: portalFonts.display,
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  error: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
