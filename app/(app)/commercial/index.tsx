import { Redirect } from 'expo-router';

// The Commercial page was folded into E-mails (each e-mail shows where it
// stands; follow-ups live in E-mails › Réglages). Kept for old links.
export default function CommercialRedirect() {
  return <Redirect href="/(app)/emails" />;
}
