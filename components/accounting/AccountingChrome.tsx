import { type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusLink } from '../StatusLink';
import { NavButton, PAGE_MAX, useIsWide } from '../partners/PartnersChrome';
import { useAccCopy } from '../../lib/accounting/locale';
import { ACC_LOCALES, type AccLocale } from '../../lib/accounting/copy';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { Wordmark } from '../../components/brand/Logo';

// Frame of accounting.cantia.ch: same brand family as Cantia and Partners,
// with the localized name of the space (Fiduciaires / Treuhand / Fiduciari).
export { NavButton, PAGE_MAX, useIsWide };

export function AccWordmark() {
  const { copy } = useAccCopy();
  return (
    <Link href="/" asChild>
      <Pressable style={styles.wordmark} accessibilityLabel={copy.brand}>
        <Wordmark height={18} product="Accounting" />
      </Pressable>
    </Link>
  );
}

export function AccLocaleSwitch({ landing = false }: { landing?: boolean }) {
  const { locale, setLocale } = useAccCopy();
  const router = useRouter();
  function choose(next: AccLocale) {
    setLocale(next);
    if (landing) router.replace((next === 'fr' ? '/' : `/${next}`) as any);
  }
  return (
    <View style={styles.locales}>
      {ACC_LOCALES.map((l) => (
        <Pressable key={l} onPress={() => choose(l)} accessibilityRole="button" aria-pressed={l === locale} style={[styles.locale, l === locale && styles.localeActive]}>
          <Text style={[styles.localeText, l === locale && styles.localeTextActive]}>{l.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AccNav({ right, landing = false, cta = false }: { right?: ReactNode; landing?: boolean; cta?: boolean }) {
  const { copy } = useAccCopy();
  const wide = useIsWide(680);
  return (
    <View style={styles.navWrap}>
      <View style={styles.nav}>
        <AccWordmark />
        <View style={styles.navRight}>
          {wide ? <AccLocaleSwitch landing={landing} /> : null}
          {cta ? (
            <>
              <Link href="/connexion" style={styles.navLink}>
                {copy.nav.login}
              </Link>
              {wide ? <NavButton href="/connexion?mode=signup" label={copy.nav.signup} primary /> : null}
            </>
          ) : null}
          {right}
        </View>
      </View>
      {!wide ? (
        <View style={styles.navMobileLocales}>
          <AccLocaleSwitch landing={landing} />
        </View>
      ) : null}
    </View>
  );
}

export function AccFooter() {
  const { copy, locale } = useAccCopy();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  return (
    <View style={styles.footerWrap}>
      <View style={styles.footer}>
        <View style={styles.footerBrand}>
          <AccWordmark />
          <Text style={[styles.footerText, { maxWidth: 320 }]}>{copy.footer.tagline}</Text>
        </View>
        <View style={styles.footerCols}>
          <View style={styles.footerCol}>
            <Link href="/connexion?mode=signup" style={styles.footerLink}>
              {copy.nav.signup}
            </Link>
            <Link href="/connexion" style={styles.footerLink}>
              {copy.nav.login}
            </Link>
          </View>
          <View style={styles.footerCol}>
            <Link href={`https://cantia.ch${prefix || '/'}` as any} style={styles.footerLink}>
              {copy.footer.site}
            </Link>
            <Link href="https://partners.cantia.ch" style={styles.footerLink}>
              {copy.footer.partners}
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
  // Solid, not sticky: a blurred sticky header inside a scroll view painted
  // black areas and blocked scrolling in Safari.
  navWrap: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
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
  wordmarkSub: { ...displayType, fontSize: 21, fontWeight: '500', color: colors.accent },
  locales: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  locale: { paddingVertical: 6, paddingHorizontal: 9 },
  localeActive: { backgroundColor: colors.text },
  localeText: { ...monoType, fontSize: 11, fontWeight: '600', color: colors.textMuted },
  localeTextActive: { color: colors.surface },
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
