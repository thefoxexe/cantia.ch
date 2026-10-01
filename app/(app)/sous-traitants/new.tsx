import { Redirect } from 'expo-router';

// Created from Contacts › Nouveau contact › Sous-traitant. Kept for old links.
export default function NewSubcontractorRedirect() {
  return <Redirect href={{ pathname: '/(app)/clients/new', params: { type: 'sous-traitant' } } as any} />;
}
