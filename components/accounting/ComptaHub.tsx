import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getAppLocale } from '../../lib/translations';
import { breakpoints, colors, fontSize, radius, spacing } from '../../lib/theme';

// Top of Comptabilité: the four things a company does with its books
// besides daily entries, each with one line saying what it is for.

type IconName = keyof typeof Feather.glyphMap;

const COPY = {
  fr: {
    title: 'Vos rendez-vous comptables',
    items: [
      { key: 'tva', icon: 'percent', title: 'Décompte TVA', text: 'Chaque trimestre, le formulaire AFC rempli à partir de vos factures et dépenses.', href: '/(app)/compta/tva' },
      { key: 'fiscalite', icon: 'shield', title: 'Fiscalité & provisions', text: 'Combien mettre de côté pour les impôts, la TVA et l’AVS, et les échéances de l’année.', href: '/(app)/compta/fiscalite' },
      { key: 'bouclement', icon: 'check-square', title: 'Bouclement annuel', text: 'Assistant pas à pas : contrôles, amortissements, provisions, impôts, analyse IA, verrouillage.', href: '/(app)/compta/bouclement' },
      { key: 'fiduciaire', icon: 'send', title: 'Transmettre à la fiduciaire', text: 'Donnez à votre fiduciaire un accès en direct, ou envoyez-lui le dossier de bouclement.', href: '/(app)/compte/fiduciaire' },
    ],
  },
  de: {
    title: 'Ihre Buchhaltungstermine',
    items: [
      { key: 'tva', icon: 'percent', title: 'MWST-Abrechnung', text: 'Jedes Quartal das ESTV-Formular, ausgefüllt aus Ihren Rechnungen und Ausgaben.', href: '/(app)/compta/tva' },
      { key: 'fiscalite', icon: 'shield', title: 'Steuern & Rückstellungen', text: 'Wie viel Sie für Steuern, MWST und AHV zurücklegen sollten, und die Fristen des Jahres.', href: '/(app)/compta/fiscalite' },
      { key: 'bouclement', icon: 'check-square', title: 'Jahresabschluss', text: 'Schritt für Schritt: Kontrollen, Abschreibungen, Rückstellungen, Steuern, KI-Analyse, Abschluss.', href: '/(app)/compta/bouclement' },
      { key: 'fiduciaire', icon: 'send', title: 'An den Treuhänder übermitteln', text: 'Geben Sie Ihrem Treuhänder Live-Zugriff oder senden Sie ihm das Abschlussdossier.', href: '/(app)/compte/fiduciaire' },
    ],
  },
  it: {
    title: 'I vostri appuntamenti contabili',
    items: [
      { key: 'tva', icon: 'percent', title: 'Rendiconto IVA', text: 'Ogni trimestre il modulo AFC compilato dalle vostre fatture e spese.', href: '/(app)/compta/tva' },
      { key: 'fiscalite', icon: 'shield', title: 'Fiscalità e accantonamenti', text: 'Quanto mettere da parte per imposte, IVA e AVS, e le scadenze dell’anno.', href: '/(app)/compta/fiscalite' },
      { key: 'bouclement', icon: 'check-square', title: 'Chiusura annuale', text: 'Passo per passo: controlli, ammortamenti, accantonamenti, imposte, analisi IA, chiusura.', href: '/(app)/compta/bouclement' },
      { key: 'fiduciaire', icon: 'send', title: 'Trasmettere alla fiduciaria', text: 'Date alla fiduciaria un accesso in tempo reale o inviatele il dossier di chiusura.', href: '/(app)/compte/fiduciaire' },
    ],
  },
};

export function ComptaHub() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const l = getAppLocale();
  const c = COPY[l] ?? COPY.fr;
  const cols = width >= breakpoints.desktop ? 4 : width >= breakpoints.tablet ? 2 : 1;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{c.title}</Text>
      <View style={styles.grid}>
        {c.items.map((it) => (
          <Pressable
            key={it.key}
            onPress={() => router.push(it.href as any)}
            style={({ pressed }) => [styles.card, { flexBasis: cols === 1 ? '100%' : cols === 2 ? '47%' : '23%' }, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.icon}>
              <Feather name={it.icon as IconName} size={16} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{it.title}</Text>
            <Text style={styles.cardText}>{it.text}</Text>
            <Feather name="arrow-right" size={14} color={colors.primary} style={{ marginTop: 'auto' }} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.lg },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: { flexGrow: 1, gap: 6, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, minHeight: 150 },
  icon: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardText: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 17 },
});
