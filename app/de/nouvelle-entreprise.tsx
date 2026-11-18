import { Redirect } from 'expo-router';

// Moved to /de/neues-unternehmen (an address in the language of its readers, SEO
// November 2026). Netlify answers the old address with a 301; this covers a
// link followed inside the site.
export default function MovedNewCompanyPage() {
  return <Redirect href="/de/neues-unternehmen" />;
}
