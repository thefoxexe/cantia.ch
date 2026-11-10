import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { toggleLocalePathname, useSyncMarketingLocaleFromPath } from '../lib/appHost';
import { AVAILABLE_LOCALES, getAppLocale, type AppLocale } from '../lib/translations';
import { SiteNav } from './site/SiteNav';
import { SiteFooter } from './site/SiteFooter';
import { sans, site } from '../lib/siteTheme';

// Header, footer and language switcher shared by every public cantia.ch page.
// The header and footer themselves live in components/site (November 2026
// identity); these wrappers keep the names the pages already import.

const LOCALE_META: Record<AppLocale, { flag: string; label: string }> = {
  fr: { flag: '🇫🇷', label: 'Français' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  it: { flag: '🇮🇹', label: 'Italiano' },
};
const LANG_DROPDOWN_WIDTH = 168;

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getAppLocale();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const triggerRef = useRef<View>(null);

  const goToLocale = (next: AppLocale) => {
    setOpen(false);
    if (next === locale) return;
    const target = toggleLocalePathname(pathname, next);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(target);
    } else {
      router.push(target as any);
    }
  };

  function openDropdown() {
    triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setAnchor({ x: pageX, y: pageY, width, height });
      setOpen(true);
    });
  }

  const dropdownLeft = anchor
    ? Math.min(Math.max(12, anchor.x + anchor.width - LANG_DROPDOWN_WIDTH), winWidth - LANG_DROPDOWN_WIDTH - 12)
    : 0;

  const DROPDOWN_ROW_HEIGHT = 40;
  const dropdownHeight = AVAILABLE_LOCALES.length * DROPDOWN_ROW_HEIGHT + 8;
  const gap = 6;
  const openUpward = !!anchor && winHeight - (anchor.y + anchor.height) < dropdownHeight + gap && anchor.y > dropdownHeight + gap;
  const dropdownTop = anchor ? (openUpward ? anchor.y - dropdownHeight - gap : anchor.y + anchor.height + gap) : 0;

  return (
    <View ref={triggerRef} collapsable={false} style={compact ? styles.langSwitcherCompact : undefined}>
      <Pressable onPress={openDropdown} style={({ hovered }: any) => [styles.langTrigger, hovered && styles.langTriggerHovered]}>
        <Text style={styles.langTriggerFlag}>{LOCALE_META[locale].flag}</Text>
        <Text style={styles.langTriggerCode}>{locale.toUpperCase()}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={13} color={site.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        {anchor ? (
          <View style={[styles.langDropdown, { top: dropdownTop, left: dropdownLeft, width: LANG_DROPDOWN_WIDTH }]}>
            {AVAILABLE_LOCALES.map((loc) => (
              <Pressable
                key={loc}
                onPress={() => goToLocale(loc)}
                style={({ hovered }: any) => [styles.langOption, hovered && styles.langOptionHovered]}
              >
                <Text style={styles.langOptionFlag}>{LOCALE_META[loc].flag}</Text>
                <Text style={[styles.langOptionText, loc === locale && styles.langOptionTextActive]}>{LOCALE_META[loc].label}</Text>
                {loc === locale ? <Feather name="check" size={14} color={site.copper} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

export function MarketingNav(_props: { onServicesPress?: () => void; onPricingPress?: () => void } = {}) {
  useSyncMarketingLocaleFromPath();
  return <SiteNav languageSwitcher={<LanguageSwitcher compact />} />;
}

export function MarketingFooter(_props: { onServicesPress?: () => void; onPricingPress?: () => void } = {}) {
  return <SiteFooter languageSwitcher={<LanguageSwitcher compact />} />;
}

const styles = StyleSheet.create({
  langSwitcherCompact: { marginLeft: 0 },
  langTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: site.line,
    alignSelf: 'flex-start',
  },
  langTriggerHovered: { borderColor: site.copper },
  langTriggerFlag: { fontSize: 13 },
  langTriggerCode: { ...sans, fontSize: 10, fontWeight: '600', color: site.ink, letterSpacing: 0.6 },
  langDropdown: {
    position: 'absolute',
    backgroundColor: site.white,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: site.line,
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 18px 40px rgba(36,40,32,0.10)' } as object) : {}),
  },
  langOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 40 },
  langOptionHovered: { backgroundColor: site.bg },
  langOptionFlag: { fontSize: 15 },
  langOptionText: { ...sans, flex: 1, fontSize: 12, fontWeight: '500', color: site.ink },
  langOptionTextActive: { color: site.copper, fontWeight: '600' },
});
