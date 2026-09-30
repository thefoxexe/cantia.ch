import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { usePartnersCopy } from '../../lib/partners/locale';
import { PARTNERS_LOCALES, type PartnersLocale } from '../../lib/partners/copy';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { LocaleTabs, ProductFooter, ProductNav } from '../brand/ProductChrome';

export const PAGE_MAX = 1120;

// Pages are prerendered without a window: render the narrow layout first
// and switch after hydration, so the server HTML and the first client render
// always match (React keeps mismatched server styles otherwise).
export function useIsWide(breakpoint = 820): boolean {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && width >= breakpoint;
}

// Language switch. On the landing pages each language has its own URL (so
// each is prerendered); elsewhere it just switches in place.
export function LocaleSwitch({ landing = false, inverse = false }: { landing?: boolean; inverse?: boolean }) {
  const { locale, setLocale } = usePartnersCopy();
  const router = useRouter();
  function choose(next: PartnersLocale) {
    setLocale(next);
    if (landing) router.replace((next === 'fr' ? '/' : `/${next}`) as any);
  }
  return <LocaleTabs locales={PARTNERS_LOCALES} value={locale} onChange={choose} inverse={inverse} />;
}

// cta: the public pages' "Se connecter" + "Devenir partenaire" pair.
export function PartnersNav({ right, landing = false, cta = false }: { right?: ReactNode; landing?: boolean; cta?: boolean }) {
  const { copy, locale } = usePartnersCopy();
  const wide = useIsWide(760);
  return (
    <ProductNav
      product="partners"
      locale={locale}
      wide={wide}
      localeSwitch={<LocaleSwitch landing={landing} inverse />}
      login={cta ? { label: copy.nav.login, href: '/connexion' } : undefined}
      primary={cta ? { label: copy.nav.join, href: '/connexion?mode=signup' } : undefined}
      right={right}
    />
  );
}

export function PartnersFooter() {
  const { copy, locale } = usePartnersCopy();
  const wide = useIsWide(820);
  return (
    <ProductFooter
      product="partners"
      locale={locale}
      wide={wide}
      tagline={copy.footer.tagline}
      productLinks={[
        { label: copy.nav.join, href: '/connexion?mode=signup' },
        { label: copy.nav.login, href: '/connexion' },
      ]}
      privacy={copy.footer.privacy}
      terms={copy.footer.terms}
      status={copy.footer.status}
    />
  );
}

export function PartnersPage({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {nav}
      <View style={{ flex: 1 }}>{children}</View>
      <PartnersFooter />
    </ScrollView>
  );
}

export function NavButton({ href, label, primary = false, inverse = false, large = false }: { href: string; label: string; primary?: boolean; inverse?: boolean; large?: boolean }) {
  return (
    <Link
      href={href as any}
      style={[styles.navButton, large && styles.navButtonLarge, primary && styles.navButtonPrimary, inverse && styles.navButtonInverse]}
    >
      <Text style={[styles.navButtonText, large && styles.navButtonTextLarge, primary && styles.navButtonTextPrimary]}>{label}</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  pageContent: { flexGrow: 1 },
  navButton: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  navButtonLarge: { paddingVertical: 14, paddingHorizontal: 22 },
  navButtonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  navButtonInverse: { backgroundColor: colors.surface, borderColor: colors.surface },
  navButtonText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  navButtonTextLarge: { fontSize: fontSize.md },
  navButtonTextPrimary: { color: '#fff' },
});
