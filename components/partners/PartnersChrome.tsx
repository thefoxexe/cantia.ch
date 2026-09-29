import { useEffect, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusLink } from '../StatusLink';
import { usePartnersCopy } from '../../lib/partners/locale';
import { PARTNERS_LOCALES, type PartnersLocale } from '../../lib/partners/copy';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

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

export function Wordmark() {
  return (
    <Link href="/" asChild>
      <Pressable style={styles.wordmark} accessibilityLabel="Cantia Partners">
        <Image source={require('../../assets/logo-mark.png')} style={styles.logoMark} resizeMode="contain" />
        <Text style={styles.wordmarkMain}>Cantia</Text>
        <Text style={styles.wordmarkSub}>Partners</Text>
      </Pressable>
    </Link>
  );
}

// Language switch. On the landing pages each language has its own URL (so
// each is prerendered); elsewhere it just switches in place.
export function LocaleSwitch({ landing = false }: { landing?: boolean }) {
  const { locale, setLocale } = usePartnersCopy();
  const router = useRouter();
  function choose(next: PartnersLocale) {
    setLocale(next);
    if (landing) router.replace((next === 'fr' ? '/' : `/${next}`) as any);
  }
  return (
    <View style={styles.locales}>
      {PARTNERS_LOCALES.map((l) => (
        <Pressable key={l} onPress={() => choose(l)} accessibilityRole="button" aria-pressed={l === locale} style={[styles.locale, l === locale && styles.localeActive]}>
          <Text style={[styles.localeText, l === locale && styles.localeTextActive]}>{l.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// cta: the public pages' "Se connecter" + "Devenir partenaire" pair.
export function PartnersNav({ right, landing = false, cta = false }: { right?: ReactNode; landing?: boolean; cta?: boolean }) {
  const { copy } = usePartnersCopy();
  const wide = useIsWide(640);
  return (
    <View style={styles.navWrap}>
      <View style={styles.nav}>
        <Wordmark />
        <View style={styles.navRight}>
          {wide ? <LocaleSwitch landing={landing} /> : null}
          {cta ? (
            <>
              <Link href="/connexion" style={styles.navLink}>
                {copy.nav.login}
              </Link>
              {wide ? <NavButton href="/connexion?mode=signup" label={copy.nav.join} primary /> : null}
            </>
          ) : null}
          {right}
        </View>
      </View>
      {!wide ? (
        <View style={styles.navMobileLocales}>
          <LocaleSwitch landing={landing} />
        </View>
      ) : null}
    </View>
  );
}

export function PartnersFooter() {
  const { copy, locale } = usePartnersCopy();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  return (
    <View style={styles.footerWrap}>
      <View style={styles.footer}>
        <View style={styles.footerBrand}>
          <Wordmark />
          <Text style={styles.footerText}>{copy.hero.eyebrow}</Text>
        </View>
        <View style={styles.footerCols}>
          <View style={styles.footerCol}>
            <Link href="/connexion?mode=signup" style={styles.footerLink}>
              {copy.nav.join}
            </Link>
            <Link href="/connexion" style={styles.footerLink}>
              {copy.nav.login}
            </Link>
          </View>
          <View style={styles.footerCol}>
            <Link href={`https://cantia.ch${prefix || '/'}` as any} style={styles.footerLink}>
              {copy.footer.site}
            </Link>
            <Link href={`https://cantia.ch${prefix}/confidentialite` as any} style={styles.footerLink}>
              {copy.footer.privacy}
            </Link>
            <Link href={`https://cantia.ch${prefix}/conditions-generales` as any} style={styles.footerLink}>
              {copy.footer.terms}
            </Link>
            <StatusLink label={copy.footer.status} textStyle={styles.footerLink} />
          </View>
        </View>
      </View>
      <View style={styles.footerBottom}>
        <Text style={styles.footerSmall}>© {new Date().getFullYear()} Cantia · Suisse</Text>
      </View>
    </View>
  );
}

export function PartnersPage({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} stickyHeaderIndices={[0]}>
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
  navWrap: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, backgroundColor: 'rgba(247,241,230,0.94)', backdropFilter: 'blur(8px)' } as any,
  nav: {
    width: '100%',
    maxWidth: PAGE_MAX - spacing.lg * 2,
    alignSelf: 'center',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  navMobileLocales: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', alignItems: 'flex-start', paddingBottom: spacing.sm },
  navLink: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoMark: { width: 26, height: 26 },
  wordmarkMain: { ...displayType, fontSize: 21, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  wordmarkSub: { ...displayType, fontSize: 21, fontWeight: '500', color: colors.primary },
  locales: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  locale: { paddingVertical: 6, paddingHorizontal: 9 },
  localeActive: { backgroundColor: colors.text },
  localeText: { ...monoType, fontSize: 11, fontWeight: '600', color: colors.textMuted },
  localeTextActive: { color: colors.surface },
  navButton: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  navButtonLarge: { paddingVertical: 14, paddingHorizontal: 22 },
  navButtonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  navButtonInverse: { backgroundColor: colors.surface, borderColor: colors.surface },
  navButtonText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  navButtonTextLarge: { fontSize: fontSize.md },
  navButtonTextPrimary: { color: '#fff' },
  footerWrap: { borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, marginTop: 96, backgroundColor: colors.surfaceAlt },
  footer: {
    width: '100%',
    maxWidth: PAGE_MAX - spacing.lg * 2,
    alignSelf: 'center',
    paddingVertical: spacing.xxl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  footerBrand: { gap: spacing.sm },
  footerCols: { flexDirection: 'row', flexWrap: 'wrap', gap: 56 },
  footerCol: { gap: spacing.sm },
  footerText: { fontSize: fontSize.sm, color: colors.textMuted },
  footerLink: { fontSize: fontSize.sm, color: colors.text },
  footerBottom: { width: '100%', maxWidth: PAGE_MAX - spacing.lg * 2, alignSelf: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.md },
  footerSmall: { fontSize: fontSize.xs, color: colors.textMuted },
});
