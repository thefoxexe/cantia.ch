import { Redirect } from 'expo-router';

// Moved to /it/creare-preventivo (a page in the language of its readers, SEO November
// 2026). Netlify answers the old address with a 301; this covers a link
// followed inside the site.
export default function MovedQuotePage() {
  return <Redirect href="/it/creare-preventivo" />;
}
