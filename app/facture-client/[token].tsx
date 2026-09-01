import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getPublicFacture, getPublicDocumentPdfUrl, requestPortalCode, verifyPortalCode } from '../../lib/api/publicPortal';
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

type GateStage = 'email' | 'code';

export default function PublicFactureScreen() {
  const { token, email: emailParam, session: sessionParam } = useLocalSearchParams<{ token: string; email?: string; session?: string }>();
  const router = useRouter();
  const [stage, setStage] = useState<GateStage>('email');
  const [email, setEmail] = useState(emailParam ?? '');
  const [code, setCode] = useState('');
  const [session, setSession] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [resendHint, setResendHint] = useState<string | null>(null);
  const [payload, setPayload] = useState<PublicFacturePayload | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Same opportunistic skip as the devis portal: a session carried from
  // the "mes documents" history page is tried once, silently, and falls
  // back to the normal gate on failure.
  useEffect(() => {
    if (!token || !emailParam || !sessionParam) return;
    getPublicFacture(token, emailParam, sessionParam).then(({ data }) => {
      if (data) {
        setSession(sessionParam);
        setPayload(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, emailParam, sessionParam]);

  function handleOpenHistory() {
    if (!token || !email.trim() || !session) return;
    router.push(`/client-documents/${token}?kind=facture&email=${encodeURIComponent(email.trim())}&session=${encodeURIComponent(session)}` as any);
  }

  async function handleRequestCode() {
    if (!token || !email.trim()) return;
    setSendingCode(true);
    setGateError(null);
    setResendHint(null);
    const { ok, error } = await requestPortalCode(token, 'facture', email.trim());
    setSendingCode(false);
    if (!ok) {
      setGateError(error ?? "Échec de l'envoi du code.");
      return;
    }
    setCode('');
    setStage('code');
  }

  async function handleResendCode() {
    if (!token || !email.trim() || sendingCode) return;
    setSendingCode(true);
    setGateError(null);
    const { ok, error } = await requestPortalCode(token, 'facture', email.trim());
    setSendingCode(false);
    if (!ok) {
      setGateError(error ?? "Échec de l'envoi du code.");
      return;
    }
    setResendHint('Un nouveau code a été envoyé.');
  }

  async function handleVerifyCode() {
    if (!token || !code.trim()) return;
    setVerifyingCode(true);
    setGateError(null);
    const { session: newSession, error } = await verifyPortalCode(token, email.trim(), code.trim());
    if (error || !newSession) {
      setVerifyingCode(false);
      setGateError(error ?? 'Code invalide.');
      return;
    }
    const { data, error: loadError } = await getPublicFacture(token, email.trim(), newSession);
    setVerifyingCode(false);
    if (loadError || !data) {
      setGateError(loadError ?? 'Impossible de charger la facture.');
      return;
    }
    setSession(newSession);
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
            <Feather name={stage === 'email' ? 'lock' : 'mail'} size={22} color={colors.primary} />
          </View>
          {stage === 'email' ? (
            <>
              <Text style={styles.gateTitle}>Consulter ma facture</Text>
              <Text style={styles.gateSubtitle}>
                Pour votre sécurité, saisissez l'adresse email à laquelle cette facture vous a été adressée. Nous vous enverrons un code
                de vérification à usage unique.
              </Text>
              <Field label="Adresse email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.ch" />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              <Button title="Recevoir mon code" onPress={handleRequestCode} loading={sendingCode} disabled={!email.trim()} style={styles.pillButton} />
            </>
          ) : (
            <>
              <Text style={styles.gateTitle}>Entrez votre code</Text>
              <Text style={styles.gateSubtitle}>
                Un code à 6 chiffres a été envoyé à {email.trim()} s'il correspond à cette facture. Il expire dans 10 minutes.
              </Text>
              <Field
                label="Code de vérification"
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                placeholder="000000"
                maxLength={6}
              />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              {resendHint ? <Text style={styles.hint}>{resendHint}</Text> : null}
              <Button title="Vérifier" onPress={handleVerifyCode} loading={verifyingCode} disabled={code.trim().length !== 6} style={styles.pillButton} />
              <View style={styles.gateLinksRow}>
                <Text onPress={handleResendCode} style={styles.gateLink}>
                  Renvoyer le code
                </Text>
                <Text
                  onPress={() => {
                    setStage('email');
                    setGateError(null);
                    setResendHint(null);
                  }}
                  style={styles.gateLink}
                >
                  Modifier l'adresse email
                </Text>
              </View>
            </>
          )}
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
    if (!token || !session) return;
    setDownloadingPdf(true);
    setDownloadError(null);
    const { url, error } = await getPublicDocumentPdfUrl(token, 'facture', email.trim(), session);
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
  gateLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
  },
  gateLink: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
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
  hint: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.success,
  },
});
