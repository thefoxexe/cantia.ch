import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../lib/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tabs.Screen
        name="chantiers"
        options={{ title: 'Chantiers', tabBarIcon: () => <TabIcon emoji="🏗️" /> }}
      />
      <Tabs.Screen
        name="devis"
        options={{ title: 'Devis', tabBarIcon: () => <TabIcon emoji="📄" /> }}
      />
      <Tabs.Screen
        name="cloud"
        options={{ title: 'Cloud', tabBarIcon: () => <TabIcon emoji="☁️" /> }}
      />
      <Tabs.Screen
        name="compte"
        options={{ title: 'Compte', tabBarIcon: () => <TabIcon emoji="⚙️" /> }}
      />
    </Tabs>
  );
}
