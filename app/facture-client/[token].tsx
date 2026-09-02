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
import { applyClientPortalLocale, detectAndApplyBrowserLocale, getAppLocale, useTranslation } from '../../lib/translations';
import type { PublicFacturePayload } from '../../lib/types';

detectAndApplyBrowserLocale();

function chf(n: number): string {
  return `${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

type GateStage = 'email' | 'code';

export default function PublicFactureScreen() {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<string, string> = {
    draft: t('common.status.draft'),
    sent: t('common.status.sent'),
    partial: t('common.status.partial'),
    paid: t('common.status.paid'),
    cancelled: t('common.status.cancelled'),
  };
  const TRUST_POINTS: { icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
    { icon: 'lock', label: t('publicFacturePortal.trustEncrypted') },
    { icon: 'map-pin', label: t('publicFacturePortal.trustHostedSwitzerland') },
    { icon: 'eye-off', label: t('publicFacturePortal.trustDataNotShared') },
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
        applyClientPortalLocale(data.organization.locale);
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
      setGateError(error ?? t('publicFacturePortal.codeSendFailed'));
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
      setGateError(error ?? t('publicFacturePortal.codeSendFailed'));
      return;
    }
    setResendHint(t('publicFacturePortal.newCodeSent'));
  }

  async function handleVerifyCode() {
    if (!token || !code.trim()) return;
    setVerifyingCode(true);
    setGateError(null);
    const { session: newSession, error } = await verifyPortalCode(token, email.trim(), code.trim());
    if (error || !newSession) {
      setVerifyingCode(false);
      setGateError(error ?? t('publicFacturePortal.invalidCode'));
      return;
    }
    const { data, error: loadError } = await getPublicFacture(token, email.trim(), newSession);
    setVerifyingCode(false);
    if (loadError || !data) {
      setGateError(loadError ?? t('publicFacturePortal.loadFailed'));
      return;
    }
    setSession(newSession);
    setPayload(data);
    applyClientPortalLocale(data.organization.locale);
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
              <Text style={styles.gateTitle}>{t('publicFacturePortal.gateTitleEmail')}</Text>
              <Text style={styles.gateSubtitle}>
                {t('publicFacturePortal.gateSubtitleEmail')}
              </Text>
              <Field label={t('publicFacturePortal.emailLabel')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('publicFacturePortal.emailPlaceholder')} />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              <Button title={t('publicFacturePortal.receiveCode')} onPress={handleRequestCode} loading={sendingCode} disabled={!email.trim()} style={styles.pillButton} />
            </>
          ) : (
            <>
              <Text style={styles.gateTitle}>{t('publicFacturePortal.gateTitleCode')}</Text>
              <Text style={styles.gateSubtitle}>
                {t('publicFacturePortal.gateSubtitleCode', { email: email.trim() })}
              </Text>
              <Field
                label={t('publicFacturePortal.codeLabel')}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                placeholder="000000"
                maxLength={6}
              />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              {resendHint ? <Text style={styles.hint}>{resendHint}</Text> : null}
              <Button title={t('publicFacturePortal.verify')} onPress={handleVerifyCode} loading={verifyingCode} disabled={code.trim().length !== 6} style={styles.pillButton} />
              <View style={styles.gateLinksRow}>
                <Text onPress={handleResendCode} style={styles.gateLink}>
                  {t('publicFacturePortal.resendCode')}
                </Text>
                <Text
                  onPress={() => {
                    setStage('email');
                    setGateError(null);
                    setResendHint(null);
                  }}
                  style={styles.gateLink}
                >
                  {t('publicFacturePortal.changeEmail')}
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
      setDownloadError(error ?? t('publicFacturePortal.downloadFailed'));
      return;
    }
    await downloadFile(url, `Facture-${payload?.facture.number ?? token}.pdf`);
  }

  const { facture, items, totals, paid, remaining, organization } = payload;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader onMenuPress={handleOpenHistory} />

      <View style={[premiumCard, styles.headerCard]}>
        <Text style={styles.eyebrow}>{facture.is_deposit ? t('publicFacturePortal.depositFactureNumber', { number: facture.number ?? '' }) : t('publicFacturePortal.factureNumber', { number: facture.number ?? '' })}</Text>
        <Text style={styles.orgName}>{organization.name}</Text>
        <View style={[styles.statusPill, facture.status === 'paid' && styles.statusPillAccepted]}>
          <Text style={[styles.statusPillText, facture.status === 'paid' && styles.statusPillTextAccepted]}>
            {STATUS_LABELS[facture.status] ?? facture.status}
          </Text>
        </View>
        {facture.has_pdf ? (
          <Button
            title={t('publicFacturePortal.downloadPdf')}
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
        <Text style={styles.sectionTitle}>{t('publicFacturePortal.clientLabel')}</Text>
        <Text style={styles.line}>{facture.client_name}</Text>
        {facture.client_address ? <Text style={styles.lineMuted}>{facture.client_address}</Text> : null}
      </View>

      <View style={[premiumCard, styles.card]}>
        <Text style={styles.sectionTitle}>{t('publicFacturePortal.detailLabel')}</Text>
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
          <Text style={styles.lineMuted}>{t('publicFacturePortal.subtotal')}</Text>
          <Text style={styles.line}>{chf(totals.subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.lineMuted}>{t('publicFacturePortal.vat', { rate: facture.vat_rate })}</Text>
          <Text style={styles.line}>{chf(totals.vat)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>{t('publicFacturePortal.total')}</Text>
          <Text style={styles.totalAmount}>{chf(totals.total)}</Text>
        </View>
        {paid > 0 ? (
          <View style={styles.totalsRow}>
            <Text style={styles.lineMuted}>{t('publicFacturePortal.alreadyPaid')}</Text>
            <Text style={styles.line}>{chf(paid)}</Text>
          </View>
        ) : null}
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>{t('publicFacturePortal.remainingBalance')}</Text>
          <Text style={styles.totalAmount}>{chf(remaining)}</Text>
        </View>
        {facture.notes ? <Text style={[styles.lineMuted, { marginTop: spacing.md }]}>{facture.notes}</Text> : null}
      </View>

      <View style={[premiumCard, styles.card]}>
        <Text style={styles.sectionTitle}>{t('publicFacturePortal.dueDateLabel')}</Text>
        <Text style={styles.line}>{new Date(facture.due_date).toLocaleDateString(`${getAppLocale()}-CH`)}</Text>
        {facture.paid_at ? <Text style={styles.lineMuted}>{t('publicFacturePortal.paidOn', { date: new Date(facture.paid_at).toLocaleDateString(`${getAppLocale()}-CH`) })}</Text> : null}
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
