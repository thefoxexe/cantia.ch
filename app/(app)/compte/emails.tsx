import { Redirect } from 'expo-router';

// Moved to E-mails › Réglages › Modèles. Kept for old links.
export default function EmailTemplatesRedirect() {
  return <Redirect href={{ pathname: '/(app)/emails/reglages', params: { tab: 'modeles' } } as any} />;
}
