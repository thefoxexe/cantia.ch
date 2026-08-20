import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { registerPushToken } from '../api/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// No EAS projectId configured yet (this app hasn't been through `eas init`
// with a connected Expo account) — getExpoPushTokenAsync() needs one to
// address the token to this project. Everything here still runs safely
// without it: permission is requested (real, useful on its own for local
// notifications later) but the remote token step is skipped rather than
// throwing, so push simply activates itself the moment a projectId shows up
// in app.json/eas.json after a real EAS build.
export async function registerForPushNotificationsAsync(userId: string): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#BC5A31',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await registerPushToken(userId, token, Platform.OS === 'ios' ? 'ios' : 'android');
  } catch (err) {
    console.warn('Push token registration failed', err);
  }
}
