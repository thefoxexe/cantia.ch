import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPublicExtraWork, acceptPublicExtraWork } from '../../lib/api/extraWorks';
import { SignaturePad } from '../../components/SignaturePad';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { Button, Card, Field } from '../../components/ui';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { applyClientPortalLocale, detectAndApplyBrowserLocale, getAppLocale, useTranslation } from '../../lib/translations';
import type { PublicExtraWorkPayload } from '../../lib/types';

detectAndApplyBrowserLocale();

function chf(n: number): string {
  return `${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

export default function PublicExtraWorkScreen() {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<string, string> = {
    draft: t('common.status.draft'),
    sent: t('common.status.sent'),
    accepted: t('common.status.accepted'),
    refused: t('common.status.refused'),
  };
  const { token } = useLocalSearchParams<{ token: string }>();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [payload, setPayload] = useState<PublicExtraWorkPayload | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  async function handleVerify() {
    if (!token || !email.trim()) return;
    setChecking(true);
    setCheckError(null);
    const { data, error } = await getPublicExtraWork(token, email.trim());
    setChecking(false);
    if (error || !data) {
      setCheckError(t('publicExtraWorkPortal.verifyFailed'));
      return;
    }
    setPayload(data);
    applyClientPortalLocale(data.extra_work.locale ?? data.organization.locale);
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
      setAcceptError(t('publicExtraWorkPortal.nameRequired'));
      return;
    }
    if (!signatureData) {
      setAcceptError(t('publicExtraWorkPortal.signatureRequired'));
      return;
    }
    setAccepting(true);
    setAcceptError(null);
    const { status, error } = await acceptPublicExtraWork(token, email.trim(), `${firstName.trim()} ${lastName.trim()}`, signatureData);
    setAccepting(false);
    if (error || !status) {
      setAcceptError(error ?? t('publicExtraWorkPortal.acceptFailed'));
      return;
    }
    setAccepted(true);
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
            <Text style={styles.secureBadgeText}>{t('publicExtraWorkPortal.secureConnection')}</Text>
          </View>
          <Text style={styles.gateTitle}>{t('publicExtraWorkPortal.gateTitle')}</Text>
          <Text style={styles.gateSubtitle}>
            {t('publicExtraWorkPortal.gateSubtitle')}
          </Text>
          <Field label={t('publicExtraWorkPortal.emailLabel')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder={t('publicExtraWorkPortal.emailPlaceholder')} />
          {checkError ? <Text style={styles.error}>{checkError}</Text> : null}
          <Button title={t('publicExtraWorkPortal.viewDocument')} onPress={handleVerify} loading={checking} disabled={!email.trim()} />
        </Card>
      </View>
    );
  }

  const { extra_work: work, items, totals, organization } = payload;
  const isAccepted = accepted || work.status === 'accepted';
  const isRefused = work.status === 'refused' && !isAccepted;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader />
      <View style={styles.secureBadge}>
        <Feather name="shield" size={14} color={colors.success} />
        <Text style={styles.secureBadgeText}>{t('publicExtraWorkPortal.secureConnectionFull')}</Text>
      </View>

      <Card style={styles.headerCard}>
        <Text style={styles.orgName}>{organization.name}</Text>
        <Text style={styles.workNumber}>{t('publicExtraWorkPortal.workNumber', { number: work.number ?? '' })}</Text>
        <Text style={styles.workTitle}>{work.title}</Text>
        <View style={[styles.statusPill, isAccepted && styles.statusPillAccepted, isRefused && styles.statusPillRefused]}>
          <Text style={styles.statusPillText}>{STATUS_LABELS[work.status] ?? work.status}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{t('publicExtraWorkPortal.clientLabel')}</Text>
        <Text style={styles.line}>{work.client_name}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{t('publicExtraWorkPortal.detailLabel')}</Text>
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
          <Text style={styles.lineMuted}>{t('publicExtraWorkPortal.subtotal')}</Text>
          <Text style={styles.line}>{chf(totals.subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.lineMuted}>{t('publicExtraWorkPortal.vat', { rate: work.vat_rate })}</Text>
          <Text style={styles.line}>{chf(totals.vat)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>{t('publicExtraWorkPortal.total')}</Text>
          <Text style={styles.totalAmount}>{chf(totals.total)}</Text>
        </View>
        {work.notes ? <Text style={[styles.lineMuted, { marginTop: spacing.md }]}>{work.notes}</Text> : null}
      </Card>

      {isAccepted ? (
        <Card style={styles.confirmCard}>
          <Feather name="check-circle" size={22} color={colors.success} />
          <Text style={styles.confirmTitle}>{t('publicExtraWorkPortal.acceptedTitle')}</Text>
          <Text style={styles.confirmSubtitle}>
            {work.client_signer_name ? t('publicExtraWorkPortal.acceptedSignedBy', { name: work.client_signer_name }) : ''}
            {t('publicExtraWorkPortal.acceptedNotified', { org: organization.name })}
          </Text>
        </Card>
      ) : isRefused ? (
        <Card>
          <Text style={styles.line}>{t('publicExtraWorkPortal.refusedText', { org: organization.name })}</Text>
        </Card>
      ) : (
        <Card>
          <Text style={styles.sectionTitle}>{t('publicExtraWorkPortal.acceptTitle')}</Text>
          <Field label={t('publicExtraWorkPortal.firstNameLabel')} value={firstName} onChangeText={setFirstName} />
          <Field label={t('publicExtraWorkPortal.lastNameLabel')} value={lastName} onChangeText={setLastName} />

          <Text style={styles.sectionTitle}>{t('publicExtraWorkPortal.signatureLabel')}</Text>
          <View style={styles.toggleRow}>
            <Text onPress={() => setSignatureMode('draw')} style={[styles.toggleOption, signatureMode === 'draw' && styles.toggleOptionActive]}>
              {t('publicExtraWorkPortal.draw')}
            </Text>
            <Text onPress={() => setSignatureMode('upload')} style={[styles.toggleOption, signatureMode === 'upload' && styles.toggleOptionActive]}>
              {t('publicExtraWorkPortal.importPhoto')}
            </Text>
          </View>

          {signatureMode === 'draw' ? (
            <SignaturePad onChange={setSignatureData} />
          ) : (
            <View>
              <Button title={signatureData ? t('publicExtraWorkPortal.changePhoto') : t('publicExtraWorkPortal.choosePhoto')} variant="secondary" icon="camera" onPress={handlePickPhoto} />
              {signatureData ? <Text style={styles.lineMuted}>{t('publicExtraWorkPortal.photoSelected')}</Text> : null}
            </View>
          )}

          {acceptError ? <Text style={styles.error}>{acceptError}</Text> : null}
          <Button title={t('publicExtraWorkPortal.acceptWork')} onPress={handleAccept} loading={accepting} style={{ marginTop: spacing.md }} />
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
  workNumber: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  workTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
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
