import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getPublicFacture, getPublicDocumentPdfUrl } from '../../lib/api/publicPortal';
import { downloadFile } from '../../lib/downloadFile';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { Button, Card, Field } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { PublicFacturePayload } from '../../lib/types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  partial: 'Partiellement payée',
  paid: 'Payée',
  cancelled: 'Annulée',
};

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
      <View style={styles.gate}>
        <View style={styles.gateHeader}>
          <ClientPortalHeader />
        </View>
        <Card style={styles.gateCard}>
          <View style={styles.secureBadge}>
            <Feather name="shield" size={14} color={colors.success} />
            <Text style={styles.secureBadgeText}>Connexion sécurisée</Text>
          </View>
          <Text style={styles.gateTitle}>Consulter ma facture</Text>
          <Text style={styles.gateSubtitle}>
            Pour votre sécurité, saisissez l'adresse email à laquelle cette facture vous a été adressée. Ce lien est personnel et ne
            fonctionne qu'avec cette adresse.
          </Text>
          <Field label="Adresse email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.ch" />
          {checkError ? <Text style={styles.error}>{checkError}</Text> : null}
          <Button title="Voir la facture" onPress={handleVerify} loading={checking} disabled={!email.trim()} />
        </Card>
      </View>
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
      <View style={styles.secureBadge}>
        <Feather name="shield" size={14} color={colors.success} />
        <Text style={styles.secureBadgeText}>Connexion sécurisée — vos informations ne sortent pas de cette page</Text>
      </View>

      <Card style={styles.headerCard}>
        <Text style={styles.orgName}>{organization.name}</Text>
        <Text style={styles.devisNumber}>
          {facture.is_deposit ? 'Facture d’acompte' : 'Facture'} {facture.number ?? ''}
        </Text>
        <View style={[styles.statusPill, facture.status === 'paid' && styles.statusPillAccepted]}>
          <Text style={styles.statusPillText}>{STATUS_LABELS[facture.status] ?? facture.status}</Text>
        </View>
        {facture.has_pdf ? (
          <Button
            title="Télécharger le PDF"
            variant="secondary"
            icon="download"
            loading={downloadingPdf}
            onPress={handleDownloadPdf}
            style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
          />
        ) : null}
        {downloadError ? <Text style={styles.error}>{downloadError}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Client</Text>
        <Text style={styles.line}>{facture.client_name}</Text>
        {facture.client_address ? <Text style={styles.lineMuted}>{facture.client_address}</Text> : null}
      </Card>

      <Card>
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
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Échéance</Text>
        <Text style={styles.line}>{new Date(facture.due_date).toLocaleDateString('fr-CH')}</Text>
        {facture.paid_at ? <Text style={styles.lineMuted}>Réglée le {new Date(facture.paid_at).toLocaleDateString('fr-CH')}</Text> : null}
      </Card>
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
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  gateHeader: {
    width: '100%',
    maxWidth: 420,
  },
  gateCard: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.md,
  },
  gateTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  gateSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  secureBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.success,
  },
  headerCard: {
    gap: spacing.xs,
  },
  orgName: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  devisNumber: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  statusPillAccepted: {
    backgroundColor: colors.successSoft,
  },
  statusPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  line: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  lineMuted: {
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
    fontSize: fontSize.sm,
    color: colors.text,
  },
  itemQty: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  itemAmount: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '700',
    minWidth: 90,
    textAlign: 'right',
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
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
