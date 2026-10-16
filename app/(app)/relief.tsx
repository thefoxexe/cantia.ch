import { Redirect } from 'expo-router';

// Cantia Relief was renamed Cantia Maquette: old links and notifications
// (/relief) land on the new screen.
export default function ReliefRedirect() {
  return <Redirect href={'/maquette' as never} />;
}
