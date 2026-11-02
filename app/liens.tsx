import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { authHref } from '../lib/appHost';
import { marketingFonts } from '../lib/marketingTheme';

// cantia.ch/liens: the link in the Instagram / LinkedIn bio, laid out like a
// profile card. A handful of large links only; the free tools are one entry
// that opens cantia.ch/outils (they ask for an e-mail before the PDF). Visits
// to the other Cantia sites carry utm_medium=liens for the traffic report.

const UTM = 'utm_source=cantia.ch&utm_medium=liens';
const FONT = { fontFamily: `${marketingFonts.body}, system-ui, sans-serif` };
const MARK = require('../assets/brand/mark.png');
const MARK_WHITE = require('../assets/brand/mark-white.png');

const INK = '#17130F';
const PAPER = '#F4EFE7';
const CLAY = '#A95C30';
const MUTED = '#776B5E';

type Item = { href: string; title: string; text: string; tile: 'mark' | 'ink' | 'clay' | 'icon'; icon?: string; badge?: string; external?: boolean };

const ITEMS: Item[] = [
  { href: '/', title: 'Cantia', text: 'Le logiciel des PME suisses', tile: 'mark' },
  { href: `https://accounting.cantia.ch/?${UTM}`, title: 'Cantia Accounting', text: 'Pour les fiduciaires, gratuit', tile: 'ink', external: true },
  { href: `https://partners.cantia.ch/?${UTM}`, title: 'Cantia Partners', text: 'Le programme partenaires', tile: 'clay', external: true },
  { href: '/outils', title: 'Outils gratuits', text: 'Salaire, taux horaire, TVA, marge…', tile: 'icon', icon: 'sliders', badge: 'Gratuit' },
  { href: '/blog', title: 'Le blog', text: 'Guides pratiques pour les PME', tile: 'icon', icon: 'book-open' },
];

function Tile({ item }: { item: Item }) {
  if (item.tile === 'mark') return <View style={[styles.tile, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECE3D6' }]}><Image source={MARK} style={styles.tileImg} /></View>;
  if (item.tile === 'ink') return <View style={[styles.tile, { backgroundColor: INK }]}><Image source={MARK_WHITE} style={styles.tileImg} /></View>;
  if (item.tile === 'clay') return <View style={[styles.tile, { backgroundColor: CLAY }]}><Image source={MARK_WHITE} style={styles.tileImg} /></View>;
  return <View style={[styles.tile, { backgroundColor: '#F3E6D8' }]}><Feather name={item.icon as any} size={20} color={CLAY} /></View>;
}

export default function LinksPage() {
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title="Cantia · Tous nos liens"
        description="Cantia, Cantia Accounting, Cantia Partners et nos calculateurs gratuits pour les PME suisses."
      />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.card}>
          {/* cover */}
          <View style={styles.cover}>
            <Image source={MARK_WHITE} style={styles.coverMark} />
          </View>

          {/* identity */}
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Image source={MARK} style={{ width: 54, height: 54 }} />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Cantia</Text>
            </View>
            <Text style={styles.handle}>cantia.ch</Text>
            <Text style={styles.bio}>Le logiciel de gestion des PME suisses : devis, factures QR, chantiers, salaires et comptabilité, dans une seule app.</Text>
            <View style={styles.meta}>
              <View style={styles.metaItem}><Feather name="map-pin" size={13} color={MUTED} /><Text style={styles.metaText}>Suisse</Text></View>
              <View style={styles.metaItem}><Feather name="shield" size={13} color={MUTED} /><Text style={styles.metaText}>Données à Zurich</Text></View>
              <View style={styles.metaItem}><Feather name="globe" size={13} color={MUTED} /><Text style={styles.metaText}>FR · DE · IT</Text></View>
            </View>
            <View style={styles.actions}>
              <Link href={authHref('signup') as any} asChild>
                <Pressable style={styles.primary}>
                  <Text style={styles.primaryText}>Essai gratuit</Text>
                </Pressable>
              </Link>
              <Link href="/contact" asChild>
                <Pressable style={styles.secondary}>
                  <Text style={styles.secondaryText}>Contact</Text>
                </Pressable>
              </Link>
            </View>
            <Text style={styles.trial}>14 jours avec toutes les fonctions, sans engagement</Text>
          </View>

          {/* links */}
          <View style={styles.list}>
            {ITEMS.map((item) => (
              <Link key={item.title} href={item.href as any} asChild>
                <Pressable style={styles.item}>
                  <Tile item={item} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.badge ? <Text style={styles.badge}>{item.badge}</Text> : null}
                    </View>
                    <Text style={styles.itemText} numberOfLines={1}>{item.text}</Text>
                  </View>
                  <Feather name={item.external ? 'arrow-up-right' : 'arrow-right'} size={18} color={INK} />
                </Pressable>
              </Link>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText} selectable>info@cantia.ch</Text>
            <Text style={styles.footerDot}>·</Text>
            <Text style={styles.footerText}>Conçu en Suisse</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: PAPER, alignItems: 'center', paddingVertical: 28, paddingHorizontal: 14 },
  card: {
    width: '100%', maxWidth: 460, backgroundColor: '#FFFDF9', borderRadius: 26, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E9E0D2',
    // soft, layered shadow (web passes boxShadow through)
    boxShadow: '0 1px 2px rgba(23,19,15,.05), 0 18px 50px rgba(23,19,15,.08)',
  } as any,
  cover: {
    height: 132, backgroundColor: INK, overflow: 'hidden',
    backgroundImage: 'radial-gradient(120% 140% at 85% 0%, #B4643A 0%, rgba(180,100,58,.55) 32%, rgba(23,19,15,0) 62%), linear-gradient(160deg, #241C16 0%, #17130F 100%)',
  } as any,
  coverMark: { position: 'absolute', right: -36, bottom: -56, width: 210, height: 210, opacity: 0.08 },

  identity: { alignItems: 'center', paddingHorizontal: 26, marginTop: -48 },
  avatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#FFFDF9', boxShadow: '0 6px 18px rgba(23,19,15,.12)',
  } as any,
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  name: { ...FONT, fontSize: 26, fontWeight: '800', color: INK, letterSpacing: -0.7 },
  handle: { ...FONT, fontSize: 14, color: MUTED, marginTop: 2 },
  bio: { ...FONT, fontSize: 15, lineHeight: 22, color: '#3E352C', textAlign: 'center', marginTop: 14, maxWidth: 360 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { ...FONT, fontSize: 13, color: MUTED },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22, width: '100%' },
  primary: { flex: 1, height: 48, backgroundColor: INK, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  primaryText: { ...FONT, width: '100%', textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  secondary: { flex: 1, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D9CDBC', backgroundColor: '#fff' },
  secondaryText: { ...FONT, width: '100%', textAlign: 'center', color: INK, fontSize: 15, fontWeight: '600' },
  trial: { ...FONT, fontSize: 12, color: MUTED, marginTop: 10 },

  list: { marginTop: 26, paddingHorizontal: 14, gap: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE6DA',
  },
  tile: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tileImg: { width: 30, height: 30 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { ...FONT, fontSize: 16, fontWeight: '700', color: INK, letterSpacing: -0.2 },
  badge: { ...FONT, fontSize: 11, fontWeight: '700', color: '#2E6B4F', backgroundColor: '#E3EFE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  itemText: { ...FONT, fontSize: 13, color: MUTED },

  footer: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 26 },
  footerText: { ...FONT, fontSize: 12, color: MUTED },
  footerDot: { ...FONT, fontSize: 12, color: '#C9BDAD' },
});
