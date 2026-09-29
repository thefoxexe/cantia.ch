import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusLink } from '../StatusLink';
import { usePartnersCopy } from '../../lib/partners/locale';
import { PARTNERS_LOCALES, type PartnersLocale } from '../../lib/partners/copy';
import { displayType, monoType } from '../../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

export const PAGE_MAX = 1080;

export function Wordmark() {
  return (
    <Link href="/" style={styles.wordmark}>
      <Text style={styles.wordmarkMain}>Cantia</Text>
      <Text style={styles.wordmarkSub}> Partners</Text>
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
        <Pressable key={l} onPress={() => choose(l)} accessibilityRole="button" style={[styles.locale, l === locale && styles.localeActive]}>
          <Text style={[styles.localeText, l === locale && styles.localeTextActive]}>{l.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function PartnersNav({ right, landing = false }: { right?: ReactNode; landing?: boolean }) {
  return (
    <View style={styles.navWrap}>
      <View style={styles.nav}>
        <Wordmark />
        <View style={styles.navRight}>
          <LocaleSwitch landing={landing} />
          {right}
        </View>
      </View>
    </View>
  );
}

export function PartnersFooter() {
  const { copy, locale } = usePartnersCopy();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  return (
    <View style={styles.footerWrap}>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} Cantia</Text>
        <View style={styles.footerLinks}>
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

// Pages are prerendered without a window: render the narrow layout first
// and switch after hydration, so the server HTML and the first client render
// always match (React keeps mismatched server styles otherwise).
export function useIsWide(): boolean {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && width >= 820;
}

export function NavButton({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link href={href as any} style={[styles.navButton, primary && styles.navButtonPrimary]}>
      <Text style={[styles.navButtonText, primary && styles.navButtonTextPrimary]}>{label}</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  pageContent: { flexGrow: 1 },
  navWrap: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg },
  nav: {
    width: '100%',
    maxWidth: PAGE_MAX,
    alignSelf: 'center',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  wordmark: { flexDirection: 'row', alignItems: 'baseline' },
  wordmarkMain: { ...displayType, fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  wordmarkSub: { ...displayType, fontSize: 22, fontWeight: '500', color: colors.primary },
  locales: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  locale: { paddingVertical: 6, paddingHorizontal: 9 },
  localeActive: { backgroundColor: colors.text },
  localeText: { ...monoType, fontSize: 11, fontWeight: '600', color: colors.textMuted },
  localeTextActive: { color: colors.surface },
  navButton: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  navButtonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  navButtonText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  navButtonTextPrimary: { color: '#fff' },
  footerWrap: { borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, marginTop: spacing.xxxl },
  footer: {
    width: '100%',
    maxWidth: PAGE_MAX,
    alignSelf: 'center',
    paddingVertical: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerText: { fontSize: fontSize.sm, color: colors.textMuted },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg },
  footerLink: { fontSize: fontSize.sm, color: colors.textMuted },
});
