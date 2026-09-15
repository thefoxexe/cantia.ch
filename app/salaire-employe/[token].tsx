import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getPublicPayslips, getPublicPayslipPdfUrl, requestPortalCode, verifyPortalCode } from '../../lib/api/publicPortal';
import { downloadFile } from '../../lib/downloadFile';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { ClientPortalFooter } from '../../components/ClientPortalFooter';
import { Button, Field } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { premiumCard, portalFonts, heroWash } from '../../lib/clientPortalTheme';
import { applyClientPortalLocale, detectAndApplyBrowserLocale, getAppLocale, useTranslation } from '../../lib/translations';
import type { PublicPayslipsPayload } from '../../lib/types';

detectAndApplyBrowserLocale();

function chf(n: number): string {
  return `${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(`${getAppLocale()}-CH`, { month: 'long', year: 'numeric' });
}

type GateStage = 'email' | 'code';

// Employee-facing counterpart to devis-client/facture-client — the same
// two-factor OTP portal, but pointed at payroll_profiles.public_token and
// listing every finalized (validee/payee) payslip for that employee, each
// with its own download. Reachable regardless of whether the employee has
// (or uses) an app.cantia.ch account at all — see the migration/edge
// function comments for why that mattered here.
export default function PublicPayslipsScreen() {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<string, string> = {
    validee: t('publicPayslipPortal.statusValidated'),
    payee: t('publicPayslipPortal.statusPaid'),
  };
  const { token, email: emailParam, session: sessionParam } = useLocalSearchParams<{ token: string; email?: string; session?: string }>();
  const [stage, setStage] = useState<GateStage>('email');
  const [email, setEmail] = useState(emailParam ?? '');
  const [code, setCode] = useState('');
  const [session, setSession] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [resendHint, setResendHint] = useState<string | null>(null);
  const [payload, setPayload] = useState<PublicPayslipsPayload | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !emailParam || !sessionParam) return;
    getPublicPayslips(token, emailParam, sessionParam).then(({ data }) => {
      if (data) {
        setSession(sessionParam);
        setPayload(data);
        applyClientPortalLocale(data.organization_locale);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, emailParam, sessionParam]);

  async function handleRequestCode() {
    if (!token || !email.trim()) return;
    setSendingCode(true);
    setGateError(null);
    setResendHint(null);
    const { ok, error } = await requestPortalCode(token, 'payslip', email.trim());
    setSendingCode(false);
    if (!ok) {
      setGateError(error ?? t('publicPayslipPortal.codeSendFailed'));
      return;
    }
    setCode('');
    setStage('code');
  }

  async function handleResendCode() {
    if (!token || !email.trim() || sendingCode) return;
    setSendingCode(true);
    setGateError(null);
    const { ok, error } = await requestPortalCode(token, 'payslip', email.trim());
    setSendingCode(false);
    if (!ok) {
      setGateError(error ?? t('publicPayslipPortal.codeSendFailed'));
      return;
    }
    setResendHint(t('publicPayslipPortal.newCodeSent'));
  }

  async function handleVerifyCode() {
    if (!token || !code.trim()) return;
    setVerifyingCode(true);
    setGateError(null);
    const { session: newSession, error } = await verifyPortalCode(token, email.trim(), code.trim());
    if (error || !newSession) {
      setVerifyingCode(false);
      setGateError(error ?? t('publicPayslipPortal.invalidCode'));
      return;
    }
    const { data, error: loadError } = await getPublicPayslips(token, email.trim(), newSession);
    setVerifyingCode(false);
    if (loadError || !data) {
      setGateError(loadError ?? t('publicPayslipPortal.loadFailed'));
      return;
    }
    setSession(newSession);
    setPayload(data);
    applyClientPortalLocale(data.organization_locale);
  }

  async function handleDownload(slipId: string, label: string) {
    if (!token || !session) return;
    setDownloadingId(slipId);
    setDownloadError(null);
    const { url, error } = await getPublicPayslipPdfUrl(token, email.trim(), session, slipId);
    setDownloadingId(null);
    if (error || !url) {
      setDownloadError(error ?? t('publicPayslipPortal.downloadFailed'));
      return;
    }
    await downloadFile(url, `${label}.pdf`);
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
              <Text style={styles.gateTitle}>{t('publicPayslipPortal.gateTitleEmail')}</Text>
              <Text style={styles.gateSubtitle}>{t('publicPayslipPortal.gateSubtitleEmail')}</Text>
              <Field
                label={t('publicPayslipPortal.emailLabel')}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder={t('publicPayslipPortal.emailPlaceholder')}
              />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              <Button title={t('publicPayslipPortal.receiveCode')} onPress={handleRequestCode} loading={sendingCode} disabled={!email.trim()} style={styles.pillButton} />
            </>
          ) : (
            <>
              <Text style={styles.gateTitle}>{t('publicPayslipPortal.gateTitleCode')}</Text>
              <Text style={styles.gateSubtitle}>{t('publicPayslipPortal.gateSubtitleCode', { email: email.trim() })}</Text>
              <Field
                label={t('publicPayslipPortal.codeLabel')}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                placeholder="000000"
                maxLength={6}
              />
              {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
              {resendHint ? <Text style={styles.hint}>{resendHint}</Text> : null}
              <Button title={t('publicPayslipPortal.verify')} onPress={handleVerifyCode} loading={verifyingCode} disabled={code.trim().length !== 6} style={styles.pillButton} />
              <View style={styles.gateLinksRow}>
                <Text onPress={handleResendCode} style={styles.gateLink}>
                  {t('publicPayslipPortal.resendCode')}
                </Text>
                <Text
                  onPress={() => {
                    setStage('email');
                    setGateError(null);
                    setResendHint(null);
                  }}
                  style={styles.gateLink}
                >
                  {t('publicPayslipPortal.changeEmail')}
                </Text>
              </View>
            </>
          )}
          <View style={styles.trustList}>
            {[
              { icon: 'lock' as const, label: t('publicPayslipPortal.trustEncrypted') },
              { icon: 'map-pin' as const, label: t('publicPayslipPortal.trustHostedSwitzerland') },
              { icon: 'eye-off' as const, label: t('publicPayslipPortal.trustDataNotShared') },
            ].map((p) => (
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

  const { employee_name, organization_name, organization_logo_url, payslips } = payload;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader />

      <View style={[premiumCard, styles.headerCard]}>
        {organization_logo_url ? (
          <Image source={{ uri: organization_logo_url }} style={styles.orgLogo} resizeMode="contain" accessibilityLabel={organization_name} />
        ) : null}
        <Text style={styles.eyebrow}>{organization_name}</Text>
        <Text style={styles.orgName}>{employee_name || t('publicPayslipPortal.title')}</Text>
        <Text style={styles.lineMuted}>{t('publicPayslipPortal.subtitle')}</Text>
      </View>

      {downloadError ? <Text style={styles.error}>{downloadError}</Text> : null}

      <View style={[premiumCard, styles.card]}>
        <Text style={styles.sectionTitle}>{t('publicPayslipPortal.listTitle')}</Text>
        {payslips.length === 0 ? <Text style={styles.lineMuted}>{t('publicPayslipPortal.empty')}</Text> : null}
        {payslips.map((slip) => (
          <View key={slip.id} style={styles.slipRow}>
            <Pressable style={styles.slipInfoRow} onPress={() => handleDownload(slip.id, monthLabel(slip.year, slip.month))} disabled={downloadingId === slip.id}>
              <Feather name="file-text" size={16} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.line}>{monthLabel(slip.year, slip.month)}</Text>
                <Text style={styles.lineMuted}>
                  {STATUS_LABELS[slip.status] ?? slip.status} · {chf(slip.net_chf)}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => handleDownload(slip.id, monthLabel(slip.year, slip.month))}
              style={styles.downloadButton}
              hitSlop={8}
              disabled={downloadingId === slip.id}
            >
              <Feather name={downloadingId === slip.id ? 'loader' : 'download'} size={16} color={colors.primary} />
            </Pressable>
          </View>
        ))}
      </View>

      <ClientPortalFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  gate: { flexGrow: 1, padding: spacing.lg, alignItems: 'center' },
  gateHeader: { width: '100%', maxWidth: 440 },
  gateCard: { width: '100%', maxWidth: 440, gap: spacing.md, marginTop: spacing.xl },
  gateIcon: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  gateTitle: { fontFamily: portalFonts.display, fontSize: 28, fontWeight: '600', color: colors.text, letterSpacing: -0.4 },
  gateSubtitle: { fontFamily: portalFonts.body, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 21 },
  gateLinksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.xs },
  gateLink: { fontFamily: portalFonts.body, fontSize: fontSize.xs, fontWeight: '700', color: colors.primary },
  pillButton: { width: '100%', borderRadius: radius.pill },
  trustList: { gap: spacing.sm, marginTop: spacing.xs },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  trustText: { fontFamily: portalFonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  headerCard: { gap: 2 },
  orgLogo: { width: 120, height: 44, marginBottom: spacing.sm, alignSelf: 'flex-start' },
  card: { gap: spacing.xs },
  eyebrow: { fontFamily: portalFonts.body, fontSize: fontSize.xs, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  orgName: { fontFamily: portalFonts.display, fontSize: 26, fontWeight: '600', color: colors.text, letterSpacing: -0.4, marginTop: 2, marginBottom: spacing.xs },
  sectionTitle: { fontFamily: portalFonts.body, fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm },
  line: { fontFamily: portalFonts.body, fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  lineMuted: { fontFamily: portalFonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  slipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  slipInfoRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  downloadButton: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  error: { fontFamily: portalFonts.body, fontSize: fontSize.sm, color: colors.danger },
  hint: { fontFamily: portalFonts.body, fontSize: fontSize.sm, color: colors.success },
});
