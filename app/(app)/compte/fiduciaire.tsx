import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import {
  cancelFiduciaryInvitation,
  FIDUCIARY_PERMISSIONS,
  getFiduciaries,
  getFiduciaryAudit,
  inviteFiduciary,
  respondFiduciary,
  revokeFiduciary,
  setFiduciaryPermissions,
  STANDARD_PERMISSIONS,
  type FiduciaryAccess,
  type FiduciaryAuditRow,
  type FiduciaryOverview,
  type FiduciaryPermission,
} from '../../../lib/api/fiduciary';
import { AppScreen, Button, Card, Container, PageHeader, Switch } from '../../../components/ui';
import { FiduciaryRequests } from '../../../components/FiduciaryRequests';
import { getAppLocale, useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

// Paramètres › Fiduciaire: the company decides which fiduciary sees what
// (Cantia Accounting, accounting.cantia.ch). Every action is checked in the
// database; this screen only shows the state.

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function FiduciaireScreen() {
  const { t } = useTranslation();
  const { organization, role, canViewFinances } = useAuth();
  const isAdmin = role === 'owner' || role === 'admin';
  const [data, setData] = useState<FiduciaryOverview | null>(null);
  const [audit, setAudit] = useState<FiduciaryAuditRow[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [email, setEmail] = useState('');
  const [invitePerms, setInvitePerms] = useState<FiduciaryPermission[]>(STANDARD_PERMISSIONS);
  const [customize, setCustomize] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const load = useCallback(async () => {
    if (!organization || !isAdmin) return;
    const [{ data: overview, error }, rows] = await Promise.all([getFiduciaries(organization.id), getFiduciaryAudit(organization.id)]);
    if (error) setMessage({ text: error, error: true });
    setData(overview);
    setAudit(rows);
  }, [organization, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function run(action: () => Promise<{ error: string | null }>, success: string) {
    setBusy(true);
    setMessage(null);
    const { error } = await action();
    setBusy(false);
    setMessage(error ? { text: error, error: true } : { text: success, error: false });
    await load();
  }

  async function handleInvite() {
    if (!organization || !email.trim()) return;
    setBusy(true);
    setMessage(null);
    const { kind, error } = await inviteFiduciary(organization.id, email.trim(), invitePerms);
    setBusy(false);
    if (error) return setMessage({ text: error, error: true });
    setEmail('');
    setCustomize(false);
    setInvitePerms(STANDARD_PERMISSIONS);
    setMessage({ text: kind === 'active' ? t('fiduciary.activated') : kind === 'pending_firm' ? t('fiduciary.invitedExisting') : t('fiduciary.invited'), error: false });
    await load();
  }

  const pendingRequests = data?.accesses.filter((a) => a.status === 'PENDING_CLIENT') ?? [];
  const active = data?.accesses.filter((a) => a.status === 'ACTIVE') ?? [];
  const waitingFirm = data?.accesses.filter((a) => a.status === 'PENDING_FIRM') ?? [];

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('fiduciary.title')} backTo="/(app)/compte" />
          <Text style={styles.intro}>{t('fiduciary.intro')}</Text>
          <View style={styles.privacy}>
            <Feather name="shield" size={16} color={colors.success} />
            <Text style={styles.privacyText}>{t('fiduciary.privacy')}</Text>
          </View>

          {organization && canViewFinances ? (
            <View style={{ marginBottom: spacing.xl }}>
              <FiduciaryRequests orgId={organization.id} />
            </View>
          ) : null}

          {!isAdmin ? (
            <Card>
              <Text style={styles.muted}>{t('fiduciary.adminOnly')}</Text>
            </Card>
          ) : (
            <View style={styles.stack}>
              {message ? <Text style={message.error ? styles.error : styles.success}>{message.text}</Text> : null}

              {pendingRequests.length ? (
                <View style={styles.stack}>
                  <Text style={styles.sectionTitle}>{t('fiduciary.requestsTitle')}</Text>
                  {pendingRequests.map((a) => (
                    <PendingRequest
                      key={a.id}
                      access={a}
                      busy={busy}
                      onAnswer={(accept, perms) => run(() => respondFiduciary(a.id, accept, perms), accept ? t('fiduciary.saved') : t('fiduciary.refuse'))}
                    />
                  ))}
                </View>
              ) : null}

              <Text style={styles.sectionTitle}>{t('fiduciary.activeTitle')}</Text>
              {data && !active.length && !waitingFirm.length && !data.invitations.length ? (
                <Card>
                  <Text style={styles.muted}>{t('fiduciary.none')}</Text>
                </Card>
              ) : null}
              {active.map((a) => (
                <ActiveAccess
                  key={a.id}
                  access={a}
                  busy={busy}
                  onPermissions={(perms) => run(() => setFiduciaryPermissions(a.id, perms), t('fiduciary.saved'))}
                  onRevoke={() => run(() => revokeFiduciary(a.id), t('fiduciary.revoked'))}
                />
              ))}
              {waitingFirm.map((a) => (
                <Card key={a.id} style={styles.card}>
                  <FirmHeader access={a} badge={t('fiduciary.waitingFirm')} />
                  <View style={styles.actions}>
                    <Button title={t('fiduciary.revoke')} variant="secondary" onPress={() => run(() => revokeFiduciary(a.id), t('fiduciary.revoked'))} disabled={busy} />
                  </View>
                </Card>
              ))}
              {data?.invitations.map((i) => (
                <Card key={i.id} style={styles.cardRow}>
                  <Feather name="mail" size={16} color={colors.textMuted} />
                  <Text style={[styles.body, { flex: 1 }]}>{t('fiduciary.invitedEmail', { email: i.email })}</Text>
                  <Pressable onPress={() => run(() => cancelFiduciaryInvitation(i.id), t('fiduciary.cancelInvite'))} disabled={busy} hitSlop={8}>
                    <Text style={styles.link}>{t('fiduciary.cancelInvite')}</Text>
                  </Pressable>
                </Card>
              ))}

              <Card style={styles.card}>
                <Text style={styles.cardTitle}>{t('fiduciary.inviteTitle')}</Text>
                <Text style={styles.muted}>{t('fiduciary.inviteText')}</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('fiduciary.email')}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                />
                {customize ? (
                  <PermissionList value={invitePerms} onChange={setInvitePerms} />
                ) : (
                  <View style={{ gap: 6 }}>
                    <Text style={styles.muted}>{t('fiduciary.standardHint')}</Text>
                    <Pressable onPress={() => setCustomize(true)} hitSlop={8}>
                      <Text style={styles.link}>{t('fiduciary.customize')}</Text>
                    </Pressable>
                  </View>
                )}
                <View style={styles.actions}>
                  <Button title={t('fiduciary.invite')} icon="send" onPress={handleInvite} loading={busy} disabled={!email.trim()} />
                </View>
              </Card>

              <Pressable onPress={() => setShowAudit((v) => !v)} style={styles.auditToggle}>
                <Feather name={showAudit ? 'chevron-down' : 'chevron-right'} size={16} color={colors.textMuted} />
                <Text style={styles.sectionTitle}>{t('fiduciary.historyTitle')}</Text>
              </Pressable>
              {showAudit ? (
                <Card style={styles.card}>
                  {audit.length === 0 ? <Text style={styles.muted}>{t('fiduciary.historyEmpty')}</Text> : null}
                  {audit.map((row) => (
                    <View key={row.id} style={styles.auditRow}>
                      <Text style={styles.auditDate}>{formatDate(row.created_at)}</Text>
                      <Text style={[styles.body, { flex: 1 }]}>
                        {t(`fiduciary.actions.${row.action}` as any, { defaultValue: row.action })}
                        {row.firm_name ? ` · ${row.firm_name}` : ''}
                        {row.actor_name ? ` · ${row.actor_name}` : ''}
                      </Text>
                    </View>
                  ))}
                </Card>
              ) : null}
            </View>
          )}
        </Container>
      </ScrollView>
    </AppScreen>
  );
}

function FirmHeader({ access, badge }: { access: FiduciaryAccess; badge?: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.firmHead}>
      <View style={styles.firmIcon}>
        <Feather name="briefcase" size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 180 }}>
        <Text style={styles.cardTitle}>
          {access.firm.name}
          {access.firm.verified ? '  ✓' : ''}
        </Text>
        <Text style={styles.muted}>
          {[access.firm.city, access.approved_at && access.status === 'ACTIVE' ? t('fiduciary.since', { date: formatDate(access.approved_at) }) : null].filter(Boolean).join(' · ')}
        </Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Members({ access }: { access: FiduciaryAccess }) {
  const { t } = useTranslation();
  if (!access.members.length) return null;
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{t('fiduciary.peopleWithAccess')}</Text>
      {access.members.map((m, i) => (
        <Text key={`${m.email}-${i}`} style={styles.body}>
          {[m.name || null, m.email].filter(Boolean).join(' · ')}
        </Text>
      ))}
    </View>
  );
}

function PermissionList({ value, onChange, disabled }: { value: FiduciaryPermission[]; onChange: (next: FiduciaryPermission[]) => void; disabled?: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.label}>{t('fiduciary.permissionsTitle')}</Text>
      {FIDUCIARY_PERMISSIONS.map((p) => (
        <View key={p} style={styles.permRow}>
          <Text style={[styles.body, { flex: 1 }]}>{t(`fiduciary.permissions.${p}` as any)}</Text>
          <Switch
            value={value.includes(p)}
            disabled={disabled}
            onChange={(on) => onChange(on ? [...value, p] : value.filter((x) => x !== p))}
          />
        </View>
      ))}
    </View>
  );
}

function PendingRequest({ access, busy, onAnswer }: { access: FiduciaryAccess; busy: boolean; onAnswer: (accept: boolean, perms: FiduciaryPermission[]) => void }) {
  const { t } = useTranslation();
  const [perms, setPerms] = useState<FiduciaryPermission[]>(access.permissions.length ? access.permissions : STANDARD_PERMISSIONS);
  return (
    <Card style={[styles.card, styles.pendingCard]}>
      <FirmHeader access={access} />
      <Text style={styles.body}>{t('fiduciary.requestText', { firm: access.firm.name })}</Text>
      <Members access={access} />
      <PermissionList value={perms} onChange={setPerms} disabled={busy} />
      <View style={styles.actions}>
        <Button title={t('fiduciary.accept')} icon="check" onPress={() => onAnswer(true, perms)} disabled={busy} />
        <Button title={t('fiduciary.refuse')} variant="secondary" onPress={() => onAnswer(false, perms)} disabled={busy} />
      </View>
    </Card>
  );
}

function ActiveAccess({
  access,
  busy,
  onPermissions,
  onRevoke,
}: {
  access: FiduciaryAccess;
  busy: boolean;
  onPermissions: (perms: FiduciaryPermission[]) => void;
  onRevoke: () => void;
}) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  return (
    <Card style={styles.card}>
      <FirmHeader access={access} />
      <Members access={access} />
      <PermissionList value={access.permissions} onChange={onPermissions} disabled={busy} />
      <View style={styles.actions}>
        <Button
          title={confirm ? t('fiduciary.revokeConfirm') : t('fiduciary.revoke')}
          variant="danger"
          onPress={() => {
            if (confirm) {
              setConfirm(false);
              onRevoke();
            } else setConfirm(true);
          }}
          disabled={busy}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: fontSize.md, lineHeight: 23, color: colors.text, marginBottom: spacing.md },
  privacy: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: colors.successSoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  privacyText: { flex: 1, fontSize: fontSize.sm, lineHeight: 19, color: colors.text },
  stack: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  card: { gap: spacing.md },
  pendingCard: { borderColor: colors.primary, borderWidth: 1.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  firmHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  firmIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: colors.accentSoft, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.accent },
  label: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { fontSize: fontSize.sm, lineHeight: 19, color: colors.text },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  error: { fontSize: fontSize.sm, color: colors.danger },
  success: { fontSize: fontSize.sm, color: colors.success },
  auditToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  auditRow: { flexDirection: 'row', gap: spacing.md },
  auditDate: { fontSize: fontSize.xs, color: colors.textMuted, width: 80, paddingTop: 2 },
});
