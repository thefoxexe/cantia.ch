import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NavButton, PAGE_MAX, useIsWide } from '../partners/PartnersChrome';
import { useAccCopy } from '../../lib/accounting/locale';
import { ACC_LOCALES, type AccLocale } from '../../lib/accounting/copy';
import { colors } from '../../lib/theme';
import { LocaleTabs, ProductFooter, ProductNav } from '../brand/ProductChrome';

// Frame of accounting.cantia.ch: the shared product chrome
// (components/brand/ProductChrome.tsx), same as partners.cantia.ch.
export { NavButton, PAGE_MAX, useIsWide };

export function AccLocaleSwitch({ landing = false, inverse = false }: { landing?: boolean; inverse?: boolean }) {
  const { locale, setLocale } = useAccCopy();
  const router = useRouter();
  function choose(next: AccLocale) {
    setLocale(next);
    if (landing) router.replace((next === 'fr' ? '/' : `/${next}`) as any);
  }
  return <LocaleTabs locales={ACC_LOCALES} value={locale} onChange={choose} inverse={inverse} />;
}

export function AccNav({ right, landing = false, cta = false }: { right?: ReactNode; landing?: boolean; cta?: boolean }) {
  const { copy, locale } = useAccCopy();
  const wide = useIsWide(760);
  return (
    <ProductNav
      product="accounting"
      locale={locale}
      wide={wide}
      localeSwitch={<AccLocaleSwitch landing={landing} inverse />}
      login={cta ? { label: copy.nav.login, href: '/connexion' } : undefined}
      primary={cta ? { label: copy.nav.signup, href: '/connexion?mode=signup' } : undefined}
      right={right}
    />
  );
}

export function AccFooter() {
  const { copy, locale } = useAccCopy();
  const wide = useIsWide(820);
  return (
    <ProductFooter
      product="accounting"
      locale={locale}
      wide={wide}
      tagline={copy.footer.tagline}
      productLinks={[
        { label: copy.nav.signup, href: '/connexion?mode=signup' },
        { label: copy.nav.login, href: '/connexion' },
      ]}
      privacy={copy.footer.privacy}
      terms={copy.footer.terms}
      status={copy.footer.status}
    />
  );
}

export function AccPage({ children, nav, footer = true }: { children: ReactNode; nav: ReactNode; footer?: boolean }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {nav}
      <View style={{ flex: 1 }}>{children}</View>
      {footer ? <AccFooter /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  pageContent: { flexGrow: 1 },
});
