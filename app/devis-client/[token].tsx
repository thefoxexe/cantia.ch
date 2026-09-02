import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPublicDevis, getPublicDocumentPdfUrl, acceptPublicDevis, requestPortalCode, verifyPortalCode } from '../../lib/api/publicPortal';
import { downloadFile } from '../../lib/downloadFile';
import { SignaturePad } from '../../components/SignaturePad';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { ClientPortalFooter } from '../../components/ClientPortalFooter';
import { Button, Field } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { premiumCard, portalFonts, heroWash } from '../../lib/clientPortalTheme';
import { detectAndApplyBrowserLocale, getAppLocale, useTranslation } from '../../lib/translations';
import type { PublicDevisPayload } from '../../lib/types';

detectAndApplyBrowserLocale();

function chf(n: number): string {
  return `${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

type GateStage = 'email' | 'code';

export default function PublicDevisScreen() {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<string, string> = {
    draft: t('common.status.draft'),
    ready: t('common.status.ready'),
    sent: t('common.status.sent'),
    accepted: t('common.status.accepted'),
    refused: t('common.status.refused'),
  };
  const TRUST_POINTS: { icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
    { icon: 'lock', label: t('publicDevisPortal.trustEncrypted') },
    { icon: 'map-pin', label: t('publicDevisPortal.trustHostedSwitzerland') },
    { icon: 'eye-off', label: t('publicDevisPortal.trustDataNotShared') },
  ];
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
  const [payload, setPayload] = useState<PublicDevisPayload | null>(null);

  // Arriving from the "mes documents" history page carries the email +
  // session forward — try it once, silently: on success it skips the gate
  // entirely, and on failure (expired/invalid) it just falls back to the
  // normal email step with no error shown, since the visitor never
  // consciously "did" anything that could fail here.
  useEffect(() => {
    if (!token || !emailParam || !sessionParam) return;
    getPublicDevis(token, emailParam, sessionParam).then(({ data }) => {
      if (data) {
        setSession(sessionParam);
        setPayload(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, emailParam, sessionParam]);

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
    if (!token || !email.trim() || !session) return;
    router.push(`/client-documents/${token}?kind=devis&email=${encodeURIComponent(email.trim())}&session=${encodeURIComponent(session)}` as any);
  }

  async function handleRequestCode() {
    if (!token || !email.trim()) return;
    setSendingCode(true);
    setGateError(null);
    setResendHint(null);
    const { ok, error } = await requestPortalCode(token, 'devis', email.trim());
    setSendingCode(false);
    if (!ok) {
      setGateError(error ?? t('publicDevisPortal.codeSendFailed'));
      return;
    }
    setCode('');
    setStage('code');
  }

  async function handleResendCode() {
    if (!token || !email.trim() || sendingCode) return;
    setSendingCode(true);
    setGateError(null);
    const { ok, error } = await requestPortalCode(token, 'devis', email.trim());
    setSendingCode(false);
    if (!ok) {
      setGateError(error ?? t('publicDevisPortal.codeSendFailed'));
      return;
    }
    setResendHint(t('publicDevisPortal.newCodeSent'));
  }

  async function handleVerifyCode() {
    if (!token || !code.trim()) return;
    setVerifyingCode(true);
    setGateError(null);
    const { session: newSession, error } = await verifyPortalCode(token, email.trim(), code.trim());
    if (error || !newSession) {
      setVerifyingCode(false);
      setGateError(error ?? t('publicDevisPortal.invalidCode'));
      return;
    }
    const { data, error: loadError } = await getPublicDevis(token, email.trim(), newSession);
    setVerifyingCode(false);
    if (loadError || !data) {
      setGateError(loadError ?? t('publicDevisPortal.loadFailed'));
      return;
    }
    setSession(newSession);
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
    if (!token || !session) return;
    if (!firstName.trim() || !lastName.trim()) {
      setAcceptError(t('publicDevisPortal.nameRequired'));
      return;
    }
    if (!signatureData) {
      setAcceptError(t('publicDevisPortal.signatureRequired'));
      return;
    }
    setAccepting(true);
    setAcceptError(null);
    const { status, error } = await acceptPublicDevis(token, email.trim(), `${firstName.trim()} ${lastName.trim()}`, signatureData, session);
    setAccepting(false);
    if (error || !status) {
      setAcceptError(error ?? t('publicDevisPortal.acceptFailed'));
      return;
    }
    setAccepted(true);
  }

  async function handleDownloadPdf() {
    if (!token || !session) return;
    setDownloadingPdf(true);
    setDownloadError(null);
    const { url, error } = await getPublicDocumentPdfUrl(token, 'devis', email.trim(), session);
    setDownloadingPdf(false);
    if (error || !url) {
      setDownloadError(error ?? t('publicDevisPortal.downloadFailed'));
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
            <Feather name={stage === 'email' ? 'lock' : 'mail'} size={22} color={colors.primary} />
          </View>
          {stage === 'email' ? (
            <>
              <Text style={styles.gateTitle}>{t('publicDevisPortal.gateTitleEmail')}</Text>
              <Text style={styles.gateSubtitle}>
                {t('publicDevisPortal.gateSubtitleEmail')}
              </Text>
              <Field label={t('publicDevisPortal.emailLabel')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('publicDevisPortal.emailPlaceholder')} />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              <Button title={t('publicDevisPortal.receiveCode')} onPress={handleRequestCode} loading={sendingCode} disabled={!email.trim()} style={styles.pillButton} />
            </>
          ) : (
            <>
              <Text style={styles.gateTitle}>{t('publicDevisPortal.gateTitleCode')}</Text>
              <Text style={styles.gateSubtitle}>
                {t('publicDevisPortal.gateSubtitleCode', { email: email.trim() })}
              </Text>
              <Field
                label={t('publicDevisPortal.codeLabel')}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                placeholder="000000"
                maxLength={6}
              />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              {resendHint ? <Text style={styles.hint}>{resendHint}</Text> : null}
              <Button title={t('publicDevisPortal.verify')} onPress={handleVerifyCode} loading={verifyingCode} disabled={code.trim().length !== 6} style={styles.pillButton} />
              <View style={styles.gateLinksRow}>
                <Text onPress={handleResendCode} style={styles.gateLink}>
                  {t('publicDevisPortal.resendCode')}
                </Text>
                <Text
                  onPress={() => {
                    setStage('email');
                    setGateError(null);
                    setResendHint(null);
                  }}
                  style={styles.gateLink}
                >
                  {t('publicDevisPortal.changeEmail')}
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

  const { devis, items, totals, organization } = payload;
  const isAccepted = accepted || devis.status === 'accepted';
  const isRefused = devis.status === 'refused' && !isAccepted;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader onMenuPress={handleOpenHistory} />

      <View style={[premiumCard, styles.headerCard]}>
        <Text style={styles.eyebrow}>{t('publicDevisPortal.devisNumber', { number: devis.number ?? '' })}</Text>
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
            title={t('publicDevisPortal.downloadPdf')}
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
        <Text style={styles.sectionTitle}>{t('publicDevisPortal.clientLabel')}</Text>
        <Text style={styles.line}>{devis.client_name}</Text>
        {devis.client_address ? <Text style={styles.lineMuted}>{devis.client_address}</Text> : null}
      </View>

      <View style={[premiumCard, styles.card]}>
        <Text style={styles.sectionTitle}>{t('publicDevisPortal.detailLabel')}</Text>
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
          <Text style={styles.lineMuted}>{t('publicDevisPortal.subtotal')}</Text>
          <Text style={styles.line}>{chf(totals.subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.lineMuted}>{t('publicDevisPortal.vat', { rate: devis.vat_rate })}</Text>
          <Text style={styles.line}>{chf(totals.vat)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>{t('publicDevisPortal.total')}</Text>
          <Text style={styles.totalAmount}>{chf(totals.total)}</Text>
        </View>
        {devis.notes ? <Text style={[styles.lineMuted, { marginTop: spacing.md }]}>{devis.notes}</Text> : null}
      </View>

      {isAccepted ? (
        <View style={[premiumCard, styles.confirmCard]}>
          <View style={styles.confirmIcon}>
            <Feather name="check" size={22} color={colors.success} />
          </View>
          <Text style={styles.confirmTitle}>{t('publicDevisPortal.acceptedTitle')}</Text>
          <Text style={styles.confirmSubtitle}>
            {devis.client_signer_name ? t('publicDevisPortal.acceptedSignedBy', { name: devis.client_signer_name }) : ''}
            {t('publicDevisPortal.acceptedNotified', { org: organization.name })}
          </Text>
        </View>
      ) : isRefused ? (
        <View style={[premiumCard, styles.card]}>
          <Text style={styles.line}>{t('publicDevisPortal.refusedText', { org: organization.name })}</Text>
        </View>
      ) : (
        <View style={[premiumCard, styles.card]}>
          <Text style={styles.sectionTitle}>{t('publicDevisPortal.acceptTitle')}</Text>
          <Field label={t('publicDevisPortal.firstNameLabel')} value={firstName} onChangeText={setFirstName} />
          <Field label={t('publicDevisPortal.lastNameLabel')} value={lastName} onChangeText={setLastName} />

          <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>{t('publicDevisPortal.signatureLabel')}</Text>
          <View style={styles.toggleRow}>
            <Text
              onPress={() => setSignatureMode('draw')}
              style={[styles.toggleOption, signatureMode === 'draw' && styles.toggleOptionActive]}
            >
              {t('publicDevisPortal.draw')}
            </Text>
            <Text
              onPress={() => setSignatureMode('upload')}
              style={[styles.toggleOption, signatureMode === 'upload' && styles.toggleOptionActive]}
            >
              {t('publicDevisPortal.importPhoto')}
            </Text>
          </View>

          {signatureMode === 'draw' ? (
            <SignaturePad onChange={setSignatureData} />
          ) : (
            <View>
              <Button title={signatureData ? t('publicDevisPortal.changePhoto') : t('publicDevisPortal.choosePhoto')} variant="secondary" icon="camera" onPress={handlePickPhoto} />
              {signatureData ? <Text style={styles.lineMuted}>{t('publicDevisPortal.photoSelected')}</Text> : null}
            </View>
          )}

          {acceptError ? <Text style={styles.error}>{acceptError}</Text> : null}
          <Button title={t('publicDevisPortal.acceptDevis')} onPress={handleAccept} loading={accepting} style={[styles.pillButton, { marginTop: spacing.md }]} />
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
  hint: {
    fontFamily: portalFonts.body,
    fontSize: fontSize.sm,
    color: colors.success,
  },
});
