import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '../../lib/theme';

type IconName = keyof typeof Feather.glyphMap;

function TabIcon({ name, color }: { name: IconName; color: unknown }) {
  return <Feather name={name} size={21} color={color as string} />;
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="chantiers"
        options={{ title: 'Chantiers', tabBarIcon: ({ color }) => <TabIcon name="layers" color={color} /> }}
      />
      <Tabs.Screen
        name="devis"
        options={{ title: 'Devis', tabBarIcon: ({ color }) => <TabIcon name="file-text" color={color} /> }}
      />
      <Tabs.Screen
        name="cloud"
        options={{ title: 'Cloud', tabBarIcon: ({ color }) => <TabIcon name="cloud" color={color} /> }}
      />
      <Tabs.Screen
        name="compte"
        options={{ title: 'Compte', tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} /> }}
      />
    </Tabs>
  );
}
