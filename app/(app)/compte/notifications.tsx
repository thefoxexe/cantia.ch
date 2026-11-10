import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { NOTIFICATION_TYPES, listPreferences, upsertPreference } from '../../../lib/api/notifications';
import { getMyNewsletterSubscription, setMyNewsletterSubscription } from '../../../lib/api/newsletter';
import { registerForPushNotificationsAsync } from '../../../lib/notifications/registerPush';
import { Card, Container, PageHeader, AppScreen, Switch } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, spacing } from '../../../lib/theme';
import type { NotificationPreference, NotificationType } from '../../../lib/types';

type Prefs = Record<NotificationType, { in_app: boolean; email: boolean; push: boolean }>;

function toPrefs(raw: Record<NotificationType, NotificationPreference | null>): Prefs {
  const result = {} as Prefs;
  for (const { type } of NOTIFICATION_TYPES) {
    const p = raw[type];
    result[type] = {
      in_app: p?.in_app_enabled ?? true,
      email: p?.email_enabled ?? false,
      push: p?.push_enabled ?? true,
    };
  }
  return result;
}

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const { organization, user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization || !user) return;
    const raw = await listPreferences(organization.id, user.id);
    setPrefs(toPrefs(raw));
    setNewsletterSubscribed(await getMyNewsletterSubscription(user.id));
  }, [organization, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function toggleNewsletter(value: boolean) {
    if (!user) return;
    setNewsletterSubscribed(value);
    setSaveError(null);
    const { error } = await setMyNewsletterSubscription(user.id, value);
    if (error) {
      setNewsletterSubscribed(!value);
      setSaveError(t('notificationSettings.saveError'));
    }
  }

  async function toggle(type: NotificationType, field: 'in_app' | 'email' | 'push', value: boolean) {
    if (!organization || !user || !prefs) return;
    const before = prefs;
    const next = { ...prefs[type], [field]: value };
    setPrefs({ ...prefs, [type]: next });
    setSaveError(null);
    // The whole row is written each time, so a first save never leaves the
    // other two channels to the database defaults.
    const { error } = await upsertPreference(organization.id, user.id, type, { in_app_enabled: next.in_app, email_enabled: next.email, push_enabled: next.push });
    if (error) {
      setPrefs(before);
      setSaveError(t('notificationSettings.saveError'));
      return;
    }
    if (field === 'push' && value && Platform.OS !== 'web') {
      registerForPushNotificationsAsync(user.id);
    }
  }

  if (!prefs) return null;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title={t('notificationSettings.title')} backTo="/(app)/compte" />
          <Text style={styles.hint}>{t('notificationSettings.hint')}</Text>
          {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

          <Card style={styles.newsletterRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('notificationSettings.newsletterLabel')}</Text>
              <Text style={styles.description}>{t('notificationSettings.newsletterDescription')}</Text>
            </View>
            <Switch value={newsletterSubscribed} onChange={toggleNewsletter} />
          </Card>

          <View style={styles.columnHeader}>
            <View style={{ flex: 1 }} />
            <Text style={styles.columnLabel}>{t('notificationSettings.colInApp')}</Text>
            <Text style={styles.columnLabel}>{t('notificationSettings.colEmail')}</Text>
            <Text style={styles.columnLabel}>{t('notificationSettings.colPush')}</Text>
          </View>

          <View style={{ gap: spacing.md }}>
            {NOTIFICATION_TYPES.map(({ type }) => (
              <Card key={type} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t(`notificationSettings.types.${type}.label` as any)}</Text>
                  <Text style={styles.description}>{t(`notificationSettings.types.${type}.description` as any)}</Text>
                </View>
                <View style={styles.switchCol}>
                  <Switch value={prefs[type].in_app} onChange={(v) => toggle(type, 'in_app', v)} />
                </View>
                <View style={styles.switchCol}>
                  <Switch value={prefs[type].email} onChange={(v) => toggle(type, 'email', v)} />
                </View>
                <View style={styles.switchCol}>
                  <Switch value={prefs[type].push} onChange={(v) => toggle(type, 'push', v)} />
                </View>
              </Card>
            ))}
          </View>
        </Container>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  newsletterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  columnLabel: {
    width: 44,
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  switchCol: {
    width: 44,
    alignItems: 'center',
  },
});
