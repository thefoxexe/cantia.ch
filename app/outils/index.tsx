import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Eyebrow, Headline, Hover, Wrap } from '../../components/site/Primitives';
import { Breadcrumbs, SitePage, useSiteLayout } from '../../components/site/Sections';
import { TOOLS } from '../../lib/tools/registry';
import { sans, site } from '../../lib/siteTheme';

// cantia.ch/outils: every free tool (lead magnets) on one page.

export default function ToolsHubPage() {
  const { phone, tablet, width } = useSiteLayout();
  const h1 = phone ? 40 : tablet ? 46 : 56;
  return (
    <SitePage
      title="Outils gratuits pour les entreprises du bâtiment en Suisse | Cantia"
      description="Calculateurs gratuits : salaire net et charges, taux horaire, TVA, marge, intérêts de retard, indemnité de vacances. Aux règles suisses 2026, sans inscription."
    >
      <View style={{ paddingTop: phone ? 32 : 58, paddingBottom: phone ? 60 : 96 }}>
        <Wrap>
          <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Outils gratuits' }]} />
          <Eyebrow style={{ marginTop: phone ? 24 : 32 }}>Gratuit · Sans inscription</Eyebrow>
          <Headline level={1} plain="Les calculs de la semaine." accent="Aux règles suisses." size={h1} style={{ marginTop: 16, marginBottom: 20, letterSpacing: phone ? -1.6 : -2.6 }} />
          <Text style={[sans, styles.lede, phone && { fontSize: 13, lineHeight: 24 }]}>
            Les calculs qu’un patron du bâtiment fait toutes les semaines, aux règles suisses en vigueur. Résultat immédiat, PDF à télécharger.
          </Text>
          <View style={[styles.grid, { marginTop: phone ? 36 : 56 }]}>
            {TOOLS.map((t, i) => (
              <Link key={t.slug} href={t.href as any} asChild>
                <Hover accessibilityRole="link" base={[styles.card, { width: phone ? '100%' : width <= 900 ? '47.5%' : '31.5%' }]} hover={{ borderColor: site.copper }}>
                  {(hovered) => (
                    <>
                      <View style={styles.cardTop}>
                        <Feather name={t.icon as any} size={19} color={site.copper} />
                        <Text style={[sans, styles.num]}>{String(i + 1).padStart(2, '0')}</Text>
                      </View>
                      <Text style={[sans, styles.title]}>{t.title}</Text>
                      <Text style={[sans, styles.text]}>{t.text}</Text>
                      <View style={styles.open}>
                        <Text style={[sans, styles.openText, hovered && { color: site.copper }]}>Ouvrir l’outil</Text>
                        <Feather name="arrow-right" size={14} color={hovered ? site.copper : site.ink} />
                      </View>
                    </>
                  )}
                </Hover>
              </Link>
            ))}
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  lede: { fontSize: 15, color: site.muted, lineHeight: 28, maxWidth: 640 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 20 },
  card: { padding: 26, borderWidth: 1, borderColor: site.line, borderRadius: 8, backgroundColor: site.white, minHeight: 230 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  num: { fontSize: 10, color: site.muted },
  title: { fontSize: 19, color: site.ink, letterSpacing: -0.4, marginTop: 22, marginBottom: 10 },
  text: { fontSize: 12, lineHeight: 21, color: site.muted },
  open: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 20 },
  openText: { fontSize: 12, fontWeight: '600', color: site.ink },
});
