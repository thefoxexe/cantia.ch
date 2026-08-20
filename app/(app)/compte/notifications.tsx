import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { NOTIFICATION_TYPES, listPreferences, upsertPreference } from '../../../lib/api/notifications';
import { registerForPushNotificationsAsync } from '../../../lib/notifications/registerPush';
import { Card, Container, PageHeader, Screen, Switch } from '../../../components/ui';
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
  const { organization, user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  const load = useCallback(async () => {
    if (!organization || !user) return;
    const raw = await listPreferences(organization.id, user.id);
    setPrefs(toPrefs(raw));
  }, [organization, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function toggle(type: NotificationType, field: 'in_app' | 'email' | 'push', value: boolean) {
    if (!organization || !user || !prefs) return;
    setPrefs({ ...prefs, [type]: { ...prefs[type], [field]: value } });
    const fieldName = field === 'in_app' ? 'in_app_enabled' : field === 'email' ? 'email_enabled' : 'push_enabled';
    await upsertPreference(organization.id, user.id, type, { [fieldName]: value });
    if (field === 'push' && value && Platform.OS !== 'web') {
      registerForPushNotificationsAsync(user.id);
    }
  }

  if (!prefs) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Container>
          <PageHeader title="Notifications" backTo="/(app)/compte" />
          <Text style={styles.hint}>
            Pour chaque type d'événement, choisissez comment vous voulez être prévenu — dans l'application, par e-mail, et sur votre téléphone.
          </Text>

          <View style={styles.columnHeader}>
            <View style={{ flex: 1 }} />
            <Text style={styles.columnLabel}>In-app</Text>
            <Text style={styles.columnLabel}>E-mail</Text>
            <Text style={styles.columnLabel}>Push</Text>
          </View>

          <View style={{ gap: spacing.md }}>
            {NOTIFICATION_TYPES.map(({ type, label, description }) => (
              <Card key={type} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.description}>{description}</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
