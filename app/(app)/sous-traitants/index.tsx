import { Redirect } from 'expo-router';

// Sous-traitants now live in Contacts (filter « Sous-traitants »). Kept for old links.
export default function SubcontractorsRedirect() {
  return <Redirect href={{ pathname: '/(app)/clients', params: { type: 'sous-traitant' } } as any} />;
}
