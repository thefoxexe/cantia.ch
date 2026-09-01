import { Redirect } from 'expo-router';

// On native, an OAuth provider's redirect (Google, Microsoft) lands on
// `cantia://auth-callback`. WebBrowser.openAuthSessionAsync (see
// lib/auth-context.tsx) already
// catches that URL and establishes the session from it, but Expo Router's
// own linking listener also treats the same incoming URL as an in-app
// navigation target — without a matching route it showed "Unmatched
// Route" right after a successful sign-in. This route just bounces back
// to "/", where the normal session-based redirect takes over.
export default function AuthCallback() {
  return <Redirect href="/" />;
}
