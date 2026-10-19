import { Redirect } from 'expo-router';

// Cantia Relief, then Maquette, is now Cantia Panorama: old links and
// notifications (/relief) land on the new screen.
export default function ReliefRedirect() {
  return <Redirect href={'/panorama' as never} />;
}
