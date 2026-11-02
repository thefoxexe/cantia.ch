import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { MarketingHead } from '../components/MarketingHead';
import { BrandLockup, BrandLogo } from '../components/brand/Logo';
import { bodyInk, ink } from '../components/landing/brand';
import { TOOLS } from '../lib/tools/registry';
import { authHref } from '../lib/appHost';
import { colors } from '../lib/theme';
import { marketingFonts } from '../lib/marketingTheme';

// cantia.ch/liens: the link in the Instagram / LinkedIn bio. Every Cantia
// product, the free tools (which ask for an e-mail before the PDF) and the
// guides, on one phone-sized page. Visits to the other Cantia sites carry
// utm_medium=liens so the traffic report shows where they came from.

const UTM = 'utm_source=cantia.ch&utm_medium=liens';
const FONT = { fontFamily: `${marketingFonts.body}, system-ui, sans-serif` };

function Row({ href, children, style }: { href: string; children: React.ReactNode; style?: any }) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={style}>{children}</Pressable>
    </Link>
  );
}

export default function LinksPage() {
  return (
    <Screen style={{ padding: 0 }}>
      <MarketingHead
        title="Cantia · Tous nos liens"
        description="Cantia, Cantia Accounting, Cantia Partners et nos calculateurs gratuits pour les PME suisses : salaire, taux horaire, TVA, marge, intérêts de retard, vacances."
      />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.col}>
          <View style={styles.top}>
            <BrandLogo height={34} />
            <Text style={styles.tagline}>Le logiciel de gestion des PME suisses, du devis au salaire.</Text>
            <Text style={styles.swiss}>Conçu et hébergé en Suisse · Français, Deutsch, Italiano</Text>
          </View>

          {/* main product */}
          <View style={styles.hero}>
            <Text style={styles.heroKicker}>Pour les entreprises</Text>
            <Text style={styles.heroTitle}>Devis, factures QR, chantiers, salaires et compta, dans une seule app.</Text>
            <View style={styles.heroActions}>
              <Link href={authHref('signup') as any} asChild>
                <Pressable style={styles.btn}>
                  <Text style={styles.btnText}>Essai gratuit 14 jours</Text>
                </Pressable>
              </Link>
              <Link href="/" asChild>
                <Pressable style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Découvrir cantia.ch</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          <Text style={styles.section}>Nos autres produits</Text>
          <View style={styles.group}>
            <Row href={`https://accounting.cantia.ch/?${UTM}`} style={styles.product}>
              <View style={{ flex: 1, gap: 8 }}>
                <BrandLockup height={24} product="Accounting" />
                <Text style={styles.productText}>Le logiciel des fiduciaires. Tous vos mandants, la TVA de l’AFC et le bouclement. Gratuit.</Text>
              </View>
              <Feather name="arrow-up-right" size={20} color={ink} />
            </Row>
            <View style={styles.sep} />
            <Row href={`https://partners.cantia.ch/?${UTM}`} style={styles.product}>
              <View style={{ flex: 1, gap: 8 }}>
                <BrandLockup height={24} product="Partners" />
                <Text style={styles.productText}>Fiduciaires, intégrateurs, associations : un partenariat sur la durée.</Text>
              </View>
              <Feather name="arrow-up-right" size={20} color={ink} />
            </Row>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>Outils gratuits</Text>
            <Text style={styles.sectionNote}>Sans compte · PDF du calcul</Text>
          </View>
          <View style={styles.group}>
            {TOOLS.map((t, i) => (
              <View key={t.slug}>
                {i > 0 ? <View style={styles.sep} /> : null}
                <Row href={t.href} style={styles.tool}>
                  <View style={styles.toolIcon}>
                    <Feather name={t.icon as any} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.toolTitle}>{t.title}</Text>
                    <Text style={styles.toolText} numberOfLines={2}>{t.text}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.textMuted} />
                </Row>
              </View>
            ))}
          </View>

          <Text style={styles.section}>À lire</Text>
          <View style={styles.group}>
            <Row href="/blog" style={styles.tool}>
              <View style={styles.toolIcon}><Feather name="book-open" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.toolTitle}>Le blog</Text>
                <Text style={styles.toolText}>Soumissions, prix, TVA, salaires : des guides concrets pour les PME suisses.</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </Row>
            <View style={styles.sep} />
            <Row href="/tarifs" style={styles.tool}>
              <View style={styles.toolIcon}><Feather name="tag" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.toolTitle}>Les tarifs</Text>
                <Text style={styles.toolText}>Dès CHF 39.– par mois, sans engagement.</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </Row>
            <View style={styles.sep} />
            <Row href="/contact" style={styles.tool}>
              <View style={styles.toolIcon}><Feather name="message-circle" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.toolTitle}>Nous écrire</Text>
                <Text style={styles.toolText} selectable>info@cantia.ch</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </Row>
          </View>

          <Text style={styles.foot}>© Cantia · Suisse</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: colors.bg, paddingHorizontal: 18, paddingTop: 44, paddingBottom: 56, alignItems: 'center' },
  col: { width: '100%', maxWidth: 540 },
  top: { alignItems: 'center', gap: 12, marginBottom: 28 },
  tagline: { ...FONT, fontSize: 17, lineHeight: 24, color: ink, fontWeight: '600', textAlign: 'center', maxWidth: 360, letterSpacing: -0.2 },
  swiss: { ...FONT, fontSize: 13, color: colors.textMuted, textAlign: 'center' },

  hero: { backgroundColor: '#1B1714', borderRadius: 22, padding: 24, gap: 14 },
  heroKicker: { ...FONT, fontSize: 13, fontWeight: '700', color: '#E0A27C', letterSpacing: 0.2 },
  heroTitle: { ...FONT, fontSize: 24, lineHeight: 29, fontWeight: '700', color: '#F7F1E6', letterSpacing: -0.6 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  btn: { backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20 },
  btnText: { ...FONT, color: '#fff', fontSize: 15, fontWeight: '700' },
  btnGhost: { borderWidth: 1, borderColor: 'rgba(247,241,230,.35)', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20 },
  btnGhostText: { ...FONT, color: '#F7F1E6', fontSize: 15, fontWeight: '600' },

  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  section: { ...FONT, fontSize: 14, fontWeight: '700', color: ink, marginTop: 32, marginBottom: 10, letterSpacing: -0.1 },
  sectionNote: { ...FONT, fontSize: 13, color: colors.textMuted, marginTop: 32, marginBottom: 10 },
  group: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: '#EADFCE', overflow: 'hidden' },
  sep: { height: 1, backgroundColor: '#EFE6D8', marginHorizontal: 18 },

  product: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  productText: { ...FONT, fontSize: 14, lineHeight: 20, color: bodyInk },

  tool: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 18 },
  toolIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  toolTitle: { ...FONT, fontSize: 15, fontWeight: '700', color: ink },
  toolText: { ...FONT, fontSize: 13, lineHeight: 18, color: colors.textMuted },

  foot: { ...FONT, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 32 },
});

