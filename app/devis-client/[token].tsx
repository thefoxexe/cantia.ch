import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPublicDevis, getPublicDocumentPdfUrl, acceptPublicDevis, listClientDocuments } from '../../lib/api/publicPortal';
import { downloadFile } from '../../lib/downloadFile';
import { SignaturePad } from '../../components/SignaturePad';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { ClientHistoryModal } from '../../components/ClientHistoryModal';
import { Button, Card, Field } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { ClientDocumentsPayload, PublicDevisPayload } from '../../lib/types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  ready: "Prêt à l'envoi",
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
};

function chf(n: number): string {
  return `${n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

export default function PublicDevisScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [payload, setPayload] = useState<PublicDevisPayload | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPayload, setHistoryPayload] = useState<ClientDocumentsPayload | null>(null);

  async function handleOpenHistory() {
    setHistoryVisible(true);
    if (!token || !email.trim()) return;
    setHistoryLoading(true);
    setHistoryError(null);
    const { data, error } = await listClientDocuments(token, 'devis', email.trim());
    setHistoryLoading(false);
    if (error || !data) {
      setHistoryError('Impossible de charger vos documents.');
      return;
    }
    setHistoryPayload(data);
  }

  async function handleVerify() {
    if (!token || !email.trim()) return;
    setChecking(true);
    setCheckError(null);
    const { data, error } = await getPublicDevis(token, email.trim());
    setChecking(false);
    if (error || !data) {
      setCheckError("Impossible de vérifier ce devis. Vérifiez l'adresse email associée à ce devis.");
      return;
    }
    setPayload(data);
  }

  async function handlePickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.4, base64: true });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const mime = result.assets[0].mimeType ?? 'image/jpeg';
    setSignatureData(`data:${mime};base64,${result.assets[0].base64}`);
  }

  async function handleAccept() {
    if (!token) return;
    if (!firstName.trim() || !lastName.trim()) {
      setAcceptError('Merci de renseigner votre prénom et votre nom.');
      return;
    }
    if (!signatureData) {
      setAcceptError('Merci de signer (dessin ou photo) avant de valider.');
      return;
    }
    setAccepting(true);
    setAcceptError(null);
    const { status, error } = await acceptPublicDevis(token, email.trim(), `${firstName.trim()} ${lastName.trim()}`, signatureData);
    setAccepting(false);
    if (error || !status) {
      setAcceptError(error ?? "Échec de l'acceptation.");
      return;
    }
    setAccepted(true);
  }

  async function handleDownloadPdf() {
    if (!token) return;
    setDownloadingPdf(true);
    setDownloadError(null);
    const { url, error } = await getPublicDocumentPdfUrl(token, 'devis', email.trim());
    setDownloadingPdf(false);
    if (error || !url) {
      setDownloadError(error ?? 'Échec du téléchargement.');
      return;
    }
    await downloadFile(url, `Devis-${payload?.devis.number ?? token}.pdf`);
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
          <Text style={styles.gateTitle}>Consulter mon devis</Text>
          <Text style={styles.gateSubtitle}>
            Pour votre sécurité, saisissez l'adresse email à laquelle ce devis vous a été adressé. Ce lien est personnel et ne fonctionne
            qu'avec cette adresse.
          </Text>
          <Field label="Adresse email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.ch" />
          {checkError ? <Text style={styles.error}>{checkError}</Text> : null}
          <Button title="Voir le devis" onPress={handleVerify} loading={checking} disabled={!email.trim()} />
        </Card>
      </View>
    );
  }

  const { devis, items, totals, organization } = payload;
  const isAccepted = accepted || devis.status === 'accepted';
  const isRefused = devis.status === 'refused' && !isAccepted;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader onMenuPress={handleOpenHistory} />
      <ClientHistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        organizationName={organization.name}
        payload={historyPayload}
        loading={historyLoading}
        error={historyError}
      />
      <View style={styles.secureBadge}>
        <Feather name="shield" size={14} color={colors.success} />
        <Text style={styles.secureBadgeText}>Connexion sécurisée — vos informations ne sortent pas de cette page</Text>
      </View>

      <Card style={styles.headerCard}>
        <Text style={styles.orgName}>{organization.name}</Text>
        <Text style={styles.devisNumber}>Devis {devis.number ?? ''}</Text>
        <View style={[styles.statusPill, isAccepted && styles.statusPillAccepted, isRefused && styles.statusPillRefused]}>
          <Text style={styles.statusPillText}>{STATUS_LABELS[devis.status] ?? devis.status}</Text>
        </View>
        {devis.has_pdf ? (
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
        <Text style={styles.line}>{devis.client_name}</Text>
        {devis.client_address ? <Text style={styles.lineMuted}>{devis.client_address}</Text> : null}
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
          <Text style={styles.lineMuted}>TVA ({devis.vat_rate}%)</Text>
          <Text style={styles.line}>{chf(totals.vat)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{chf(totals.total)}</Text>
        </View>
        {devis.notes ? <Text style={[styles.lineMuted, { marginTop: spacing.md }]}>{devis.notes}</Text> : null}
      </Card>

      {isAccepted ? (
        <Card style={styles.confirmCard}>
          <Feather name="check-circle" size={22} color={colors.success} />
          <Text style={styles.confirmTitle}>Devis accepté</Text>
          <Text style={styles.confirmSubtitle}>
            {devis.client_signer_name ? `Signé par ${devis.client_signer_name}. ` : ''}
            {organization.name} a été notifié et prendra contact avec vous.
          </Text>
        </Card>
      ) : isRefused ? (
        <Card>
          <Text style={styles.line}>Ce devis a été refusé et n'est plus disponible à l'acceptation en ligne. Contactez {organization.name} pour toute question.</Text>
        </Card>
      ) : (
        <Card>
          <Text style={styles.sectionTitle}>Accepter ce devis</Text>
          <Field label="Prénom" value={firstName} onChangeText={setFirstName} />
          <Field label="Nom" value={lastName} onChangeText={setLastName} />

          <Text style={styles.sectionTitle}>Signature</Text>
          <View style={styles.toggleRow}>
            <Text
              onPress={() => setSignatureMode('draw')}
              style={[styles.toggleOption, signatureMode === 'draw' && styles.toggleOptionActive]}
            >
              Dessiner
            </Text>
            <Text
              onPress={() => setSignatureMode('upload')}
              style={[styles.toggleOption, signatureMode === 'upload' && styles.toggleOptionActive]}
            >
              Importer une photo
            </Text>
          </View>

          {signatureMode === 'draw' ? (
            <SignaturePad onChange={setSignatureData} />
          ) : (
            <View>
              <Button title={signatureData ? 'Changer la photo' : 'Choisir une photo'} variant="secondary" icon="camera" onPress={handlePickPhoto} />
              {signatureData ? <Text style={styles.lineMuted}>Photo sélectionnée.</Text> : null}
            </View>
          )}

          {acceptError ? <Text style={styles.error}>{acceptError}</Text> : null}
          <Button title="Accepter le devis" onPress={handleAccept} loading={accepting} style={{ marginTop: spacing.md }} />
        </Card>
      )}
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
  statusPillRefused: {
    backgroundColor: colors.dangerSoft,
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
  confirmCard: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  confirmTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  confirmSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleOption: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOptionActive: {
    color: colors.primary,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
