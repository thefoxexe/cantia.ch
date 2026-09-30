import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import {
  DEFAULT_FOLLOWUP_SETTINGS,
  FOLLOWUP_PRESETS,
  MAX_FOLLOWUP_STEPS,
  getFollowupSettings,
  saveFollowupSettings,
  type FollowupPreset,
  type FollowupSettings,
} from '../../lib/api/followups';
import { hasSalesTracking, loadPipeline, type DevisTracking } from '../../lib/api/salesTracking';
import { showSavedCheckmark } from '../SaveConfirmation';
import { Button, Card, EmptyState, Switch } from '../ui';
import { useTranslation } from '../../lib/translations';
import { monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

const PRESETS: FollowupPreset[] = ['doux', 'standard', 'soutenu', 'custom'];
const DAY_MS = 24 * 60 * 60 * 1000;

// E-mails › Réglages › Relances automatiques: automatic devis follow-ups
// (Entreprise), their results, and pointers to the other automations set
// elsewhere (daily reports, Bexio, notifications). Finance members only.
export function FollowupSettings({ onOpenTemplates }: { onOpenTemplates: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { organization, user, canViewFinances } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [settings, setSettings] = useState<FollowupSettings>(DEFAULT_FOLLOWUP_SETTINGS);
  const [saved, setSaved] = useState<FollowupSettings>(DEFAULT_FOLLOWUP_SETTINGS);
  const [pipeline, setPipeline] = useState<DevisTracking[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization || !canViewFinances) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const on = await hasSalesTracking(organization.plan_id);
    setTracking(on);
    const s = await getFollowupSettings(organization.id);
    setSettings(s);
    setSaved(s);
    if (on) setPipeline(await loadPipeline(organization.id));
    setLoading(false);
  }, [organization, canViewFinances]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);
  const stats = useMemo(() => followupStats(pipeline), [pipeline]);

  function update(patch: Partial<FollowupSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  function choosePreset(preset: FollowupPreset) {
    if (preset === 'custom') update({ preset });
    else update({ preset, days: [...FOLLOWUP_PRESETS[preset]] });
  }

  function setDay(index: number, value: number) {
    const days = [...settings.days];
    days[index] = Math.min(90, Math.max(1, value));
    update({ days, preset: 'custom' });
  }

  function addStep() {
    if (settings.days.length >= MAX_FOLLOWUP_STEPS) return;
    const last = settings.days[settings.days.length - 1] ?? 3;
    update({ days: [...settings.days, Math.min(90, last + 7)], preset: 'custom' });
  }

  function removeStep(index: number) {
    if (settings.days.length <= 1) return;
    update({
      days: settings.days.filter((_, i) => i !== index),
      messages: settings.messages.filter((_, i) => i !== index),
      preset: 'custom',
    });
  }

  function setMessage(index: number, text: string) {
    const messages = [...settings.messages];
    while (messages.length <= index) messages.push('');
    messages[index] = text;
    update({ messages });
  }

  async function handleSave() {
    if (!organization) return;
    const sorted = [...settings.days].every((d, i, arr) => i === 0 || d > arr[i - 1]);
    if (!sorted) {
      setError(t('automations.followups.errorOrder'));
      return;
    }
    setSaving(true);
    setError(null);
    const { error: err } = await saveFollowupSettings(organization.id, user?.id, settings);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setSaved(settings);
    showSavedCheckmark();
  }

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />;

  if (!canViewFinances) {
    return (
      <Card>
        <EmptyState title={t('commercial.noAccessTitle')} subtitle={t('automations.noAccess')} />
      </Card>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

        {/* Relances de devis */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t('automations.followups.title')}</Text>
          <Text style={styles.planTag}>{t('commercial.locked.eyebrow')}</Text>
        </View>
        {!tracking ? (
          <Card style={styles.lockedCard}>
            <Text style={styles.body}>{t('automations.followups.locked')}</Text>
            <Button title={t('commercial.locked.cta')} onPress={() => router.push('/(app)/compte/facturation')} style={{ alignSelf: 'flex-start' }} />
          </Card>
        ) : (
          <Card style={{ gap: spacing.lg }}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('automations.followups.enable')}</Text>
                <Text style={styles.hint}>{t('automations.followups.enableHint')}</Text>
              </View>
              <Switch value={settings.enabled} onChange={(v) => update({ enabled: v })} />
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text style={styles.label}>{t('automations.followups.rhythm')}</Text>
              <View style={styles.presets}>
                {PRESETS.map((p) => {
                  const active = settings.preset === p;
                  return (
                    <Pressable key={p} onPress={() => choosePreset(p)} style={[styles.preset, active && styles.presetActive]}>
                      <Text style={[styles.presetName, active && styles.presetNameActive]}>{t(`automations.followups.preset.${p}`)}</Text>
                      <Text style={[styles.presetDays, active && styles.presetNameActive]}>
                        {p === 'custom' ? t('automations.followups.presetCustomHint') : FOLLOWUP_PRESETS[p].map((d) => `J+${d}`).join(' · ')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text style={styles.label}>{t('automations.followups.steps')}</Text>
              {settings.days.map((day, i) => (
                <View key={i} style={styles.step}>
                  <View style={styles.stepHead}>
                    <Text style={styles.stepTitle}>{t('automations.followups.stepTitle', { step: i + 1 })}</Text>
                    <View style={styles.stepper}>
                      <Pressable onPress={() => setDay(i, day - 1)} style={styles.stepBtn} accessibilityLabel={t('automations.followups.fewerDays')}>
                        <Text style={styles.stepBtnText}>−</Text>
                      </Pressable>
                      <Text style={styles.stepValue}>{t('automations.followups.dayAfter', { count: day })}</Text>
                      <Pressable onPress={() => setDay(i, day + 1)} style={styles.stepBtn} accessibilityLabel={t('automations.followups.moreDays')}>
                        <Text style={styles.stepBtnText}>+</Text>
                      </Pressable>
                    </View>
                    {settings.days.length > 1 ? (
                      <Pressable onPress={() => removeStep(i)} hitSlop={8} accessibilityLabel={t('automations.followups.removeStep')}>
                        <Feather name="trash-2" size={16} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                  </View>
                  <TextInput
                    value={settings.messages[i] ?? ''}
                    onChangeText={(v) => setMessage(i, v)}
                    placeholder={t(`automations.followups.defaultMessage${Math.min(i + 1, 3)}`)}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    style={styles.message}
                  />
                </View>
              ))}
              {settings.days.length < MAX_FOLLOWUP_STEPS ? (
                <Pressable onPress={addStep} style={styles.addStep}>
                  <Feather name="plus" size={15} color={colors.primary} />
                  <Text style={styles.addStepText}>{t('automations.followups.addStep')}</Text>
                </Pressable>
              ) : null}
              <Text style={styles.hint}>{t('automations.followups.messagesHint')}</Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text style={styles.label}>{t('automations.followups.window')}</Text>
              <View style={styles.windowRow}>
                <HourStepper value={settings.send_from_hour} onChange={(v) => update({ send_from_hour: Math.min(v, settings.send_to_hour - 1) })} min={0} max={22} />
                <Text style={styles.body}>→</Text>
                <HourStepper value={settings.send_to_hour} onChange={(v) => update({ send_to_hour: Math.max(v, settings.send_from_hour + 1) })} min={1} max={24} />
              </View>
              <View style={styles.row}>
                <Text style={[styles.body, { flex: 1 }]}>{t('automations.followups.weekdaysOnly')}</Text>
                <Switch value={settings.weekdays_only} onChange={(v) => update({ weekdays_only: v })} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('automations.followups.attachPdf')}</Text>
                <Text style={styles.hint}>{t('automations.followups.attachPdfHint')}</Text>
              </View>
              <Switch value={settings.attach_pdf} onChange={(v) => update({ attach_pdf: v })} />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('automations.followups.minAmount')}</Text>
                <Text style={styles.hint}>{t('automations.followups.minAmountHint')}</Text>
              </View>
              <View style={styles.amountBox}>
                <Text style={styles.amountPrefix}>CHF</Text>
                <TextInput
                  value={settings.min_amount ? String(settings.min_amount) : ''}
                  onChangeText={(v) => update({ min_amount: Number(v.replace(/[^0-9.]/g, '')) || 0 })}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={styles.amountInput}
                />
              </View>
            </View>

            <Text style={styles.hint}>{t('automations.followups.stops')}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={t('automations.save')} onPress={handleSave} loading={saving} disabled={!dirty} style={{ alignSelf: 'flex-start' }} />
          </Card>
        )}

        {/* Résultats */}
        {tracking ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>{t('automations.stats.title')}</Text>
            <View style={styles.stats}>
              <Stat label={t('automations.stats.followups30')} value={String(stats.followups30)} />
              <Stat label={t('automations.stats.signedAfter')} value={String(stats.signedAfterFollowup)} />
              <Stat label={t('automations.stats.viewRate')} value={stats.viewRate === null ? '—' : `${Math.round(stats.viewRate * 100)} %`} />
              <Stat
                label={t('automations.stats.answerAfter')}
                value={stats.answerRateAfterFollowup === null ? '—' : `${Math.round(stats.answerRateAfterFollowup * 100)} %`}
                last
              />
            </View>
            <Text style={styles.hint}>{t('automations.stats.hint')}</Text>
          </>
        ) : null}

        {/* Autres automatisations */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>{t('automations.others.title')}</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <LinkRow icon="dollar-sign" title={t('automations.others.factures')} text={t('automations.others.facturesText')} onPress={onOpenTemplates} />
          <LinkRow icon="file-text" title={t('automations.others.reports')} text={t('automations.others.reportsText')} onPress={() => router.push('/(app)/chantiers' as any)} />
          <LinkRow icon="refresh-cw" title={t('automations.others.bexio')} text={t('automations.others.bexioText')} onPress={() => router.push('/(app)/compte/integrations' as any)} />
          <LinkRow icon="bell" title={t('automations.others.notifications')} text={t('automations.others.notificationsText')} onPress={() => router.push('/(app)/compte/notifications' as any)} />
        </Card>
    </ScrollView>
  );
}

// Results of the follow-ups, from the devis pipeline (lib/api/salesTracking.ts).
function followupStats(items: DevisTracking[]) {
  const now = Date.now();
  let followups30 = 0;
  let signedAfterFollowup = 0;
  let sent90 = 0;
  let viewed90 = 0;
  let followedUp = 0;
  let answeredAfter = 0;
  for (const it of items) {
    followups30 += it.followupDates.filter((d) => now - new Date(d).getTime() <= 30 * DAY_MS).length;
    if (it.stage === 'signed' && it.followups > 0) signedAfterFollowup += 1;
    if (it.sentAt && now - new Date(it.sentAt).getTime() <= 90 * DAY_MS) {
      sent90 += 1;
      if (it.views > 0) viewed90 += 1;
    }
    if (it.followups > 0) {
      followedUp += 1;
      if (it.replied || it.stage === 'signed' || it.devis.status === 'refused') answeredAfter += 1;
    }
  }
  return {
    followups30,
    signedAfterFollowup,
    viewRate: sent90 ? viewed90 / sent90 : null,
    answerRateAfterFollowup: followedUp ? answeredAfter / followedUp : null,
  };
}

function HourStepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={styles.stepBtn}>
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{`${value} h`}</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={styles.stepBtn}>
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

function Stat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.stat, last && { borderRightWidth: 0 }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LinkRow({
  icon,
  title,
  text,
  onPress,
  soon,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  text: string;
  onPress?: () => void;
  soon?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.linkRow}>
      <View style={styles.linkIcon}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.hint}>{text}</Text>
      </View>
      {soon ? <Text style={styles.soon}>{t('integrationsSettings.comingSoon')}</Text> : <Feather name="chevron-right" size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, width: '100%', maxWidth: 852, alignSelf: 'center' },
  intro: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.lg, lineHeight: 20 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  planTag: { ...monoType, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.primary, marginBottom: spacing.sm },
  lockedCard: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17, marginTop: 2 },
  body: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preset: { flexGrow: 1, flexBasis: 150, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, backgroundColor: colors.surface },
  presetActive: { borderColor: colors.text, backgroundColor: colors.text },
  presetName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  presetNameActive: { color: colors.bg },
  presetDays: { ...monoType, fontSize: 10.5, color: colors.textMuted, marginTop: 2 },
  step: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, gap: spacing.sm, backgroundColor: colors.bg },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  stepTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.text, borderRadius: radius.sm, backgroundColor: colors.surface },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, color: colors.text },
  stepValue: { ...monoType, minWidth: 92, textAlign: 'center', fontSize: 12, color: colors.text, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.text, paddingVertical: 9 },
  message: { minHeight: 84, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' },
  addStep: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  addStepText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, paddingHorizontal: spacing.sm },
  amountPrefix: { fontSize: fontSize.sm, color: colors.textMuted, marginRight: 4 },
  amountInput: { width: 90, paddingVertical: 8, fontSize: fontSize.sm, color: colors.text },
  error: { fontSize: fontSize.sm, color: colors.danger },
  stats: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  stat: { flexGrow: 1, flexBasis: 170, padding: spacing.md, borderRightWidth: 1, borderRightColor: colors.border },
  statValue: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  linkIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  soon: { fontSize: 11, fontWeight: '700', color: colors.textMuted, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
});
