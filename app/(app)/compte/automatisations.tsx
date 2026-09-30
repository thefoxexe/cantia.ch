import { Redirect } from 'expo-router';

// Moved to E-mails › Réglages › Relances automatiques. Kept for old links.
export default function AutomationsRedirect() {
  return <Redirect href={{ pathname: '/(app)/emails/reglages', params: { tab: 'relances' } } as any} />;
}
