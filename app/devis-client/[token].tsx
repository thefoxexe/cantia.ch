import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPublicDevis, getPublicDocumentPdfUrl, acceptPublicDevis } from '../../lib/api/publicPortal';
import { downloadFile } from '../../lib/downloadFile';
import { SignaturePad } from '../../components/SignaturePad';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { ClientPortalFooter } from '../../components/ClientPortalFooter';
import { Button, Field } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { premiumCard, portalFonts, heroWash } from '../../lib/clientPortalTheme';
import type { PublicDevisPayload } from '../../lib/types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  ready: "Prêt à l'envoi",
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
};

const TRUST_POINTS: { icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
  { icon: 'lock', label: 'Lien chiffré et personnel' },
  { icon: 'map-pin', label: 'Hébergé en Suisse' },
  { icon: 'eye-off', label: 'Vos données ne sont pas partagées' },
];

function chf(n: number): string {
  return `${n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

export default function PublicDevisScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
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

  function handleOpenHistory() {
    if (!token || !email.trim()) return;
    router.push(`/client-documents/${token}?kind=devis&email=${encodeURIComponent(email.trim())}` as any);
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
      <ScrollView style={[styles.screen, heroWash]} contentContainerStyle={styles.gate}>
        <View style={styles.gateHeader}>
          <ClientPortalHeader />
        </View>
        <View style={[premiumCard, styles.gateCard]}>
          <View style={styles.gateIcon}>
            <Feather name="lock" size={22} color={colors.primary} />
          </View>
          <Text style={styles.gateTitle}>Consulter mon devis</Text>
          <Text style={styles.gateSubtitle}>
            Pour votre sécurité, saisissez l'adresse email à laquelle ce devis vous a été adressé. Ce lien est personnel et ne fonctionne
            qu'avec cette adresse.
          </Text>
          <Field label="Adresse email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.ch" />
          {checkError ? <Text style={styles.error}>{checkError}</Text> : null}
          <Button title="Voir le devis" onPress={handleVerify} loading={checking} disabled={!email.trim()} style={styles.pillButton} />
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

  const { devis, items, totals, organization } = payload;
  const isAccepted = accepted || devis.status === 'accepted';
  const isRefused = devis.status === 'refused' && !isAccepted;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader onMenuPress={handleOpenHistory} />

      <View style={[premiumCard, styles.headerCard]}>
        <Text style={styles.eyebrow}>Devis {devis.number ?? ''}</Text>
        <Text style={styles.orgName}>{organization.name}</Text>
        <View style={[styles.statusPill, isAccepted && styles.statusPillAccepted, isRefused && styles.statusPillRefused]}>
          <Text
            style={[
              styles.statusPillText,
              isAccepted && styles.statusPillTextAccepted,
              isRefused && styles.statusPillTextRefused,
            ]}
          >
            {STATUS_LABELS[devis.status] ?? devis.status}
          </Text>
        </View>
        {devis.has_pdf ? (
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
        <Text style={styles.line}>{devis.client_name}</Text>
        {devis.client_address ? <Text style={styles.lineMuted}>{devis.client_address}</Text> : null}
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
          <Text style={styles.lineMuted}>TVA ({devis.vat_rate}%)</Text>
          <Text style={styles.line}>{chf(totals.vat)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{chf(totals.total)}</Text>
        </View>
        {devis.notes ? <Text style={[styles.lineMuted, { marginTop: spacing.md }]}>{devis.notes}</Text> : null}
      </View>

      {isAccepted ? (
        <View style={[premiumCard, styles.confirmCard]}>
          <View style={styles.confirmIcon}>
            <Feather name="check" size={22} color={colors.success} />
          </View>
          <Text style={styles.confirmTitle}>Devis accepté</Text>
          <Text style={styles.confirmSubtitle}>
            {devis.client_signer_name ? `Signé par ${devis.client_signer_name}. ` : ''}
            {organization.name} a été notifié et prendra contact avec vous.
          </Text>
        </View>
      ) : isRefused ? (
        <View style={[premiumCard, styles.card]}>
          <Text style={styles.line}>Ce devis a été refusé et n'est plus disponible à l'acceptation en ligne. Contactez {organization.name} pour toute question.</Text>
        </View>
      ) : (
        <View style={[premiumCard, styles.card]}>
          <Text style={styles.sectionTitle}>Accepter ce devis</Text>
          <Field label="Prénom" value={firstName} onChangeText={setFirstName} />
          <Field label="Nom" value={lastName} onChangeText={setLastName} />

          <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Signature</Text>
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
          <Button title="Accepter le devis" onPress={handleAccept} loading={accepting} style={[styles.pillButton, { marginTop: spacing.md }]} />
        </View>
      )}
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
  statusPillRefused: {
    backgroundColor: colors.dangerSoft,
  },
  statusPillText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statusPillTextAccepted: {
    color: colors.success,
  },
  statusPillTextRefused: {
    color: colors.danger,
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
  confirmCard: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  confirmTitle: {
    fontFamily: portalFonts.display,
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  confirmSubtitle: {
    fontFamily: portalFonts.body,
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
    fontFamily: portalFonts.body,
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
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
