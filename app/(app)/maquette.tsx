import { Redirect } from 'expo-router';

// Cantia Maquette was renamed Cantia Panorama: old links land on the new screen.
export default function MaquetteRedirect() {
  return <Redirect href={'/panorama' as never} />;
}
