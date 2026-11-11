import { useEffect, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Btn, Hover } from './Primitives';
import { sans, site, gutter } from '../../lib/siteTheme';
import { SITE_COPY, type SiteLocale } from '../../lib/site/copy';
import { getAppLocale } from '../../lib/translations';
import { authHref } from '../../lib/appHost';

const LOGO = require('../../assets/brand/logo.png');

type IconName = React.ComponentProps<typeof Feather>['name'];
export const FAMILY_ICONS: Record<string, IconName> = {
  signer: 'file-text',
  organiser: 'calendar',
  collaborer: 'users',
  facturer: 'file',
  piloter: 'trending-up',
  assistant: 'mic',
};

export function localePrefix(locale: SiteLocale): string {
  return locale === 'de' ? '/de' : locale === 'it' ? '/it' : '';
}

export function useSiteLocale(): SiteLocale {
  const l = getAppLocale();
  return l === 'de' || l === 'it' ? l : 'fr';
}

// Header of the public cantia.ch pages: logo, "Le logiciel" with its five
// families, direct links, and the two access buttons. Under 761 px the links
// move into a full-screen menu.
export function SiteNav({ languageSwitcher }: { languageSwitcher?: React.ReactNode }) {
  const locale = useSiteLocale();
  const c = SITE_COPY[locale].nav;
  const families = SITE_COPY[locale].families;
  const p = localePrefix(locale);
  const { width } = useWindowDimensions();
  const phone = width <= 760;
  const tablet = width <= 1100;
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!megaOpen || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMegaOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [megaOpen]);

  const links = [
    { label: c.trade, href: `${p}/metiers` },
    { label: c.pricing, href: `${p}/tarifs` },
    ...(width > 900 ? [{ label: c.discover, href: `${p}/ressources` }] : []),
  ];
  const megaItems = [
    ...families.map((f) => ({ key: f.key, name: f.name, text: f.text, href: `${p}/${f.slug}` })),
    { key: 'assistant', name: c.assistant.name, text: c.assistant.text, href: `${p}/assistant` },
  ];

  return (
    <View style={styles.header}>
      <View style={[styles.bar, { height: phone ? 75 : 86, paddingHorizontal: gutter(width) }]}>
        <Link href={(p || '/') as any} asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Cantia">
            <Image source={LOGO} style={{ width: phone ? 122 : width <= 900 ? 124 : tablet ? 140 : 158, height: (phone ? 122 : width <= 900 ? 124 : tablet ? 140 : 158) * (192 / 1036) }} resizeMode="contain" />
          </Pressable>
        </Link>

        {!phone ? (
          <View style={[styles.main, { gap: width <= 900 ? 12 : tablet ? 15 : 27 }]}>
            <Pressable
              onPress={() => setMegaOpen((o) => !o)}
              accessibilityRole="button"
              aria-expanded={megaOpen}
              style={({ hovered }: any) => [styles.menuButton, hovered && { opacity: 0.7 }]}
            >
              <Text style={[sans, styles.mainLink, tablet && { fontSize: 11 }]}>{c.software}</Text>
              <Feather name={megaOpen ? 'chevron-up' : 'chevron-down'} size={13} color={site.muted} />
            </Pressable>
            {links.map((l) => (
              <Link key={l.href} href={l.href as any} asChild>
                <Hover accessibilityRole="link" hover={{ opacity: 0.7 }}>
                  <Text style={[sans, styles.mainLink, tablet && { fontSize: 11 }]}>{l.label}</Text>
                </Hover>
              </Link>
            ))}
          </View>
        ) : null}

        <View style={[styles.actions, { gap: phone ? 10 : width <= 900 ? 12 : tablet ? 15 : 23 }]}>
          {!tablet ? languageSwitcher : null}
          {!phone ? (
            <Link href={authHref('login') as any} asChild>
              <Pressable accessibilityRole="link">
                <Text style={[sans, styles.actionLink]}>{c.login}</Text>
              </Pressable>
            </Link>
          ) : null}
          {width > 370 ? (
            <View>
              <Btn label={c.tryCta} href={authHref('signup')} small={phone} />
            </View>
          ) : null}
          {phone ? (
            <Pressable onPress={() => setDrawerOpen(true)} accessibilityRole="button" accessibilityLabel={c.menu} style={styles.burger} hitSlop={6}>
              <Feather name="menu" size={20} color={site.ink} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {megaOpen && !phone ? (
        <View style={styles.mega}>
          <View style={{ maxWidth: site.maxWidth, width: '100%', marginHorizontal: 'auto', paddingHorizontal: gutter(width) }}>
            <View style={styles.megaGrid}>
              {megaItems.map((m) => (
                <Link key={m.key} href={m.href as any} asChild>
                  <Hover onPress={() => setMegaOpen(false)} accessibilityRole="link" base={styles.megaLink} hover={{ backgroundColor: site.bg }}>
                    <Feather name={FAMILY_ICONS[m.key]} size={16} color={site.copper} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[sans, styles.megaName]}>{m.name}</Text>
                      <Text style={[sans, styles.megaText]}>{m.text}</Text>
                    </View>
                  </Hover>
                </Link>
              ))}
            </View>
            <View style={styles.megaBottom}>
              <Link href={`${p}/fonctionnalites` as any} asChild>
                <Pressable onPress={() => setMegaOpen(false)} style={styles.inlineRow}>
                  <Text style={[sans, styles.megaBottomStrong]}>{c.allFeatures}</Text>
                  <Feather name="arrow-right" size={14} color={site.ink} />
                </Pressable>
              </Link>
              <View style={[styles.inlineRow, { gap: 24 }]}>
                <Link href={`${p}/telechargement` as any} asChild>
                  <Pressable onPress={() => setMegaOpen(false)}>
                    <Text style={[sans, styles.megaBottomLink]}>{c.devices}</Text>
                  </Pressable>
                </Link>
                <Link href={`${p}/ecosysteme` as any} asChild>
                  <Pressable onPress={() => setMegaOpen(false)}>
                    <Text style={[sans, styles.megaBottomLink]}>{c.ecosystem}</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <Modal visible={drawerOpen} animationType="fade" transparent onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawer}>
          <View style={[styles.drawerHead, { paddingHorizontal: gutter(width) }]}>
            <Image source={LOGO} style={{ width: 135, height: 135 * (192 / 1036) }} resizeMode="contain" />
            <Pressable onPress={() => setDrawerOpen(false)} accessibilityRole="button" accessibilityLabel={c.close} style={styles.burger} hitSlop={6}>
              <Feather name="x" size={20} color={site.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: gutter(width), paddingBottom: 32 }}>
            <DrawerLink label={c.home} href={p || '/'} onNavigate={() => setDrawerOpen(false)} />
            <DrawerGroup title={c.software} initiallyOpen>
              {megaItems.map((m) => (
                <DrawerSubLink key={m.key} icon={FAMILY_ICONS[m.key]} label={m.key === 'assistant' ? m.name : `${m.name} · ${m.text}`} href={m.href} onNavigate={() => setDrawerOpen(false)} />
              ))}
            </DrawerGroup>
            {links.slice(0, 2).map((l) => (
              <DrawerLink key={l.href} label={l.label} href={l.href} onNavigate={() => setDrawerOpen(false)} />
            ))}
            <DrawerGroup title={c.discover}>
              <DrawerSubLink icon="monitor" label={c.devices} href={`${p}/telechargement`} onNavigate={() => setDrawerOpen(false)} />
              <DrawerSubLink icon="briefcase" label={c.ecosystem} href={`${p}/ecosysteme`} onNavigate={() => setDrawerOpen(false)} />
              <DrawerSubLink icon="compass" label={c.discover} href={`${p}/ressources`} onNavigate={() => setDrawerOpen(false)} />
              <DrawerSubLink icon="help-circle" label={c.help} href={`${p}/aide`} onNavigate={() => setDrawerOpen(false)} />
              <DrawerSubLink icon="mail" label={c.contact} href={`${p}/contact`} onNavigate={() => setDrawerOpen(false)} />
            </DrawerGroup>
            <View style={{ marginTop: 28, gap: 16 }}>
              <Btn label={c.tryLong} href={authHref('signup')} />
              <Link href={authHref('login') as any} asChild>
                <Pressable onPress={() => setDrawerOpen(false)}>
                  <Text style={[sans, styles.actionLink, { fontSize: 13 }]}>{c.login}</Text>
                </Pressable>
              </Link>
              {languageSwitcher}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function DrawerLink({ label, href, onNavigate }: { label: string; href: string; onNavigate: () => void }) {
  return (
    <Link href={href as any} asChild>
      <Pressable onPress={onNavigate} style={styles.drawerLink} accessibilityRole="link">
        <Text style={[sans, styles.drawerLinkText]}>{label}</Text>
        <Feather name="arrow-right" size={16} color={site.muted} />
      </Pressable>
    </Link>
  );
}

function DrawerGroup({ title, children, initiallyOpen = false }: { title: string; children: React.ReactNode; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={styles.drawerGroup}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.drawerLink} accessibilityRole="button" aria-expanded={open}>
        <Text style={[sans, styles.drawerLinkText]}>{title}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={site.muted} />
      </Pressable>
      {open ? <View style={{ paddingBottom: 12, gap: 2 }}>{children}</View> : null}
    </View>
  );
}

function DrawerSubLink({ icon, label, href, onNavigate }: { icon: IconName; label: string; href: string; onNavigate: () => void }) {
  return (
    <Link href={href as any} asChild>
      <Pressable onPress={onNavigate} style={styles.drawerSub} accessibilityRole="link">
        <Feather name={icon} size={14} color={site.copper} />
        <Text style={[sans, styles.drawerSubText]}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  header: {
    zIndex: 30,
    position: 'relative',
    backgroundColor: 'rgba(246,244,239,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: site.line,
  },
  bar: {
    width: '100%',
    maxWidth: site.maxWidth,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  main: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mainLink: { fontSize: 12, fontWeight: '600', color: site.ink },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionLink: { fontSize: 11, color: site.ink, fontWeight: '500' },
  burger: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: site.line, borderRadius: 5 },
  mega: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: site.white,
    borderBottomWidth: 1,
    borderBottomColor: site.line,
    paddingTop: 34,
    paddingBottom: 25,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 25px 50px rgba(36,40,32,0.08)' } as object) : {}),
  },
  megaGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 13, columnGap: 30 },
  megaLink: { width: '30%', flexGrow: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 13, borderRadius: 7 },
  megaName: { fontSize: 13, fontWeight: '600', color: site.ink },
  megaText: { fontSize: 11, color: site.muted, marginTop: 3 },
  megaBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: site.line, marginTop: 20, paddingTop: 18, flexWrap: 'wrap', gap: 16 },
  megaBottomStrong: { fontSize: 12, fontWeight: '600', color: site.ink },
  megaBottomLink: { fontSize: 11, color: site.muted },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawer: { flex: 1, backgroundColor: site.bg },
  drawerHead: { height: 75, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: site.line },
  drawerGroup: { borderBottomWidth: 1, borderBottomColor: site.line },
  drawerLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 17, borderBottomWidth: 0 },
  drawerLinkText: { fontSize: 17, fontWeight: '500', color: site.ink, letterSpacing: -0.4 },
  drawerSub: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  drawerSubText: { fontSize: 13, color: site.muted, flex: 1 },
});
