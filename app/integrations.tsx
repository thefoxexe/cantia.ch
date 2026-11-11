import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SolutionPage } from '../components/SolutionPage';
import { getAppLocale, useTranslation } from '../lib/translations';
import { Callout, ScreenShot, Section, SectionHead, useSiteLayout } from '../components/site/Sections';
import { EXPORTS } from '../components/site/exports';
import { sans, site } from '../lib/siteTheme';

type Dir = 'both' | 'in' | 'out';

// What travels between Cantia and Bexio, read from the sync functions
// (supabase/functions/bexio-*): "in" = Bexio -> Cantia, "out" = Cantia -> Bexio.
const SYNC = {
  fr: {
    eyebrow: 'Ce qui circule',
    title: 'Chaque donnée, dans le bon sens.',
    text: 'Synchronisation automatique toutes les 15 minutes, ou à la demande depuis Compte → Intégrations.',
    head: ['Donnée', 'Sens', 'Ce qui se passe'],
    rows: [
      ['Clients', 'both', 'Un client créé d’un côté apparaît de l’autre, puis reste à jour.'],
      ['Articles', 'in', 'Les articles et prestations Bexio alimentent le Catalogue Cantia.'],
      ['Devis', 'out', 'Envoyé depuis son détail comme offre Bexio, en brouillon ; son numéro Bexio revient dans Cantia.'],
      ['Factures', 'both', 'Envoyée depuis Cantia en brouillon, ou créée dans Bexio : elle apparaît à la synchronisation suivante.'],
      ['Statuts de paiement', 'in', 'Une facture payée dans Bexio passe en payée dans Cantia.'],
    ],
    legend: { both: 'Dans les deux sens', in: 'Bexio → Cantia', out: 'Cantia → Bexio' },
  },
  de: {
    eyebrow: 'Was übertragen wird',
    title: 'Jede Angabe, in die richtige Richtung.',
    text: 'Automatische Synchronisierung alle 15 Minuten oder sofort über Konto → Integrationen.',
    head: ['Daten', 'Richtung', 'Was passiert'],
    rows: [
      ['Kunden', 'both', 'Ein auf einer Seite erfasster Kunde erscheint auf der anderen und bleibt aktuell.'],
      ['Artikel', 'in', 'Artikel und Leistungen aus Bexio speisen den Cantia-Katalog.'],
      ['Offerten', 'out', 'Aus der Detailansicht als Bexio-Angebot gesendet, als Entwurf; die Bexio-Nummer erscheint in Cantia.'],
      ['Rechnungen', 'both', 'Aus Cantia als Entwurf gesendet oder in Bexio erstellt: sie erscheint bei der nächsten Synchronisierung.'],
      ['Zahlungsstatus', 'in', 'Eine in Bexio bezahlte Rechnung gilt auch in Cantia als bezahlt.'],
    ],
    legend: { both: 'In beide Richtungen', in: 'Bexio → Cantia', out: 'Cantia → Bexio' },
  },
  it: {
    eyebrow: 'Cosa viene sincronizzato',
    title: 'Ogni dato, nel senso giusto.',
    text: 'Sincronizzazione automatica ogni 15 minuti, o subito da Conto → Integrazioni.',
    head: ['Dato', 'Direzione', 'Cosa succede'],
    rows: [
      ['Clienti', 'both', 'Un cliente creato da una parte appare dall’altra e resta aggiornato.'],
      ['Articoli', 'in', 'Articoli e prestazioni Bexio alimentano il Catalogo Cantia.'],
      ['Preventivi', 'out', 'Inviato dal suo dettaglio come offerta Bexio, in bozza; il numero Bexio torna in Cantia.'],
      ['Fatture', 'both', 'Inviata da Cantia in bozza, o creata in Bexio: appare alla sincronizzazione successiva.'],
      ['Stato dei pagamenti', 'in', 'Una fattura pagata in Bexio risulta pagata anche in Cantia.'],
    ],
    legend: { both: 'Nei due sensi', in: 'Bexio → Cantia', out: 'Cantia → Bexio' },
  },
} as const;

// Data import as it works in the app (app/(app)/compte/import.tsx):
// .xlsx, .xls or .csv; five kinds; columns matched automatically then checked.
const IMPORT = {
  fr: {
    eyebrow: 'On reprend vos données',
    title: 'Vous ne repartez pas de zéro.',
    text: 'Vos clients, vos projets et votre historique vous suivent. Vous les importez en quelques minutes, depuis Compte → Import de données. Vos données actuelles ne sont jamais écrasées.',
    cards: [
      { icon: 'file-text', title: 'Excel ou CSV', text: 'Exportez depuis votre ancien logiciel ou votre tableur : Cantia lit les fichiers .xlsx, .xls et .csv.' },
      { icon: 'layers', title: 'Cinq types de données', text: 'Contacts, projets (chantiers), devis, factures et dépenses. Devis et factures reprennent le montant total de chaque document, pour garder l’historique.' },
      { icon: 'check-square', title: 'Colonnes reconnues', text: 'Cantia associe vos colonnes aux bons champs. Vous vérifiez la correspondance avant d’importer.' },
    ],
    helpStrong: 'Un fichier compliqué ?',
    help: 'Envoyez votre export à info@cantia.ch : nous regardons avec vous comment le reprendre.',
  },
  de: {
    eyebrow: 'Wir übernehmen Ihre Daten',
    title: 'Sie fangen nicht bei null an.',
    text: 'Ihre Kunden, Projekte und Ihr Verlauf kommen mit. Sie importieren sie in wenigen Minuten unter Konto → Datenimport. Bestehende Daten werden nie überschrieben.',
    cards: [
      { icon: 'file-text', title: 'Excel oder CSV', text: 'Exportieren Sie aus Ihrer bisherigen Software oder Tabelle: Cantia liest .xlsx-, .xls- und .csv-Dateien.' },
      { icon: 'layers', title: 'Fünf Datenarten', text: 'Kontakte, Projekte (Baustellen), Offerten, Rechnungen und Ausgaben. Offerten und Rechnungen übernehmen den Gesamtbetrag jedes Dokuments, für den Verlauf.' },
      { icon: 'check-square', title: 'Spalten erkannt', text: 'Cantia ordnet Ihre Spalten den richtigen Feldern zu. Sie prüfen die Zuordnung vor dem Import.' },
    ],
    helpStrong: 'Eine schwierige Datei?',
    help: 'Senden Sie Ihren Export an info@cantia.ch: Wir schauen gemeinsam, wie wir ihn übernehmen.',
  },
  it: {
    eyebrow: 'Riprendiamo i vostri dati',
    title: 'Non ripartite da zero.',
    text: 'I vostri clienti, progetti e lo storico vi seguono. Li importate in pochi minuti, da Conto → Importazione dati. I dati attuali non vengono mai sovrascritti.',
    cards: [
      { icon: 'file-text', title: 'Excel o CSV', text: 'Esportate dal vostro vecchio software o foglio di calcolo: Cantia legge i file .xlsx, .xls e .csv.' },
      { icon: 'layers', title: 'Cinque tipi di dati', text: 'Contatti, progetti (cantieri), preventivi, fatture e spese. Preventivi e fatture riprendono l’importo totale di ogni documento, per conservare lo storico.' },
      { icon: 'check-square', title: 'Colonne riconosciute', text: 'Cantia associa le vostre colonne ai campi giusti. Verificate la corrispondenza prima di importare.' },
    ],
    helpStrong: 'Un file complicato?',
    help: 'Inviate il vostro export a info@cantia.ch: vediamo insieme come riprenderlo.',
  },
} as const;

function ImportSection() {
  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const c = IMPORT[locale] ?? IMPORT.fr;
  const { phone } = useSiteLayout();
  return (
    <Section white>
      <SectionHead eyebrow={c.eyebrow} plain={c.title} text={c.text} />
      <View style={[styles.cards, phone && { flexDirection: 'column', gap: 28 }]}>
        {c.cards.map((card) => (
          <View key={card.title} style={[styles.card, !phone && { flex: 1 }]}>
            <Feather name={card.icon as keyof typeof Feather.glyphMap} size={18} color={site.copper} />
            <Text style={[sans, styles.cardTitle]}>{card.title}</Text>
            <Text style={[sans, styles.what]}>{card.text}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 36 }}>
        <Callout strong={c.helpStrong} text={c.help} />
      </View>
    </Section>
  );
}

const DIR_ICON: Record<Dir, keyof typeof Feather.glyphMap> = { both: 'repeat', in: 'arrow-left', out: 'arrow-right' };

function SyncTable() {
  const locale = (getAppLocale() as 'fr' | 'de' | 'it') ?? 'fr';
  const c = SYNC[locale] ?? SYNC.fr;
  const { phone } = useSiteLayout();
  return (
    <Section>
      <SectionHead eyebrow={c.eyebrow} plain={c.title} text={c.text} />
      <View style={styles.table}>
        {!phone ? (
          <View style={[styles.row, styles.headRow]}>
            <Text style={[sans, styles.th, { width: 190 }]}>{c.head[0].toUpperCase()}</Text>
            <Text style={[sans, styles.th, { width: 190 }]}>{c.head[1].toUpperCase()}</Text>
            <Text style={[sans, styles.th, { flex: 1 }]}>{c.head[2].toUpperCase()}</Text>
          </View>
        ) : null}
        {c.rows.map(([name, dir, what]) => (
          <View key={name} style={[styles.row, phone && { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
            <Text style={[sans, styles.name, !phone && { width: 190 }]}>{name}</Text>
            <View style={[styles.dir, !phone && { width: 190 }]}>
              <Feather name={DIR_ICON[dir as Dir]} size={14} color={site.copper} />
              <Text style={[sans, styles.dirText]}>{c.legend[dir as Dir]}</Text>
            </View>
            <Text style={[sans, styles.what, !phone && { flex: 1 }]}>{what}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

// The real Bexio settings screen of the app (connected, sample company).
function BexioScreen() {
  const locale = getAppLocale() as 'fr' | 'de' | 'it';
  const shot = EXPORTS[locale]?.app.bexio ?? EXPORTS.fr.app.bexio;
  return <ScreenShot source={shot.source} ratio={shot.ratio} alt="Cantia · Bexio" />;
}

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const blogPrefix = locale === 'de' ? '/de/blog' : locale === 'it' ? '/it/blog' : '/blog';
  const solutionsPrefix = locale === 'de' ? '/de/solutions' : locale === 'it' ? '/it/solutions' : '/solutions';
  return (
    <SolutionPage
      kicker={t('integrationsPage.kicker')}
      title={t('integrationsPage.title')}
      subtitle={t('integrationsPage.subtitle')}
      visual={<BexioScreen />}
      visualBelow
      afterFeatures={<><SyncTable /><ImportSection /></>}
      features={[
        { icon: 'users', title: t('integrationsPage.feature1Title'), text: t('integrationsPage.feature1Text') },
        { icon: 'package', title: t('integrationsPage.feature2Title'), text: t('integrationsPage.feature2Text') },
        { icon: 'send', title: t('integrationsPage.feature3Title'), text: t('integrationsPage.feature3Text') },
        { icon: 'refresh-cw', title: t('integrationsPage.feature4Title'), text: t('integrationsPage.feature4Text') },
        { icon: 'shield', title: t('integrationsPage.feature5Title'), text: t('integrationsPage.feature5Text') },
        { icon: 'plus-circle', title: t('integrationsPage.feature6Title'), text: t('integrationsPage.feature6Text') },
      ]}
      steps={[
        { title: t('integrationsPage.step1Title'), text: t('integrationsPage.step1Text') },
        { title: t('integrationsPage.step2Title'), text: t('integrationsPage.step2Text') },
        { title: t('integrationsPage.step3Title'), text: t('integrationsPage.step3Text') },
      ]}
      faq={[
        { question: t('integrationsPage.faq1Question'), answer: t('integrationsPage.faq1Answer') },
        { question: t('integrationsPage.faq2Question'), answer: t('integrationsPage.faq2Answer') },
        { question: t('integrationsPage.faq3Question'), answer: t('integrationsPage.faq3Answer') },
        { question: t('integrationsPage.faq4Question'), answer: t('integrationsPage.faq4Answer') },
      ]}
      related={[
        { href: `${blogPrefix.replace(/blog$/, 'aide')}/integration-bexio`, label: t('integrationsPage.related1Label') },
        { href: `${blogPrefix}/bexio-vs-cantia-logiciel-batiment`, label: t('integrationsPage.related2Label') },
        { href: `${solutionsPrefix}/facturation`, label: t('integrationsPage.related3Label') },
      ]}
      closingTitle={t('integrationsPage.closingTitle')}
      closingText={t('integrationsPage.closingText')}
    />
  );
}

const styles = StyleSheet.create({
  table: { borderTopWidth: 1, borderTopColor: site.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: site.line },
  headRow: { paddingVertical: 14 },
  th: { fontSize: 9, letterSpacing: 1.4, color: site.muted, fontWeight: '600' },
  name: { fontSize: 16, color: site.ink, fontWeight: '500', letterSpacing: -0.3 },
  dir: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dirText: { fontSize: 12, color: site.copper, fontWeight: '500' },
  cards: { flexDirection: 'row', gap: 32 },
  card: { gap: 12, paddingTop: 24, borderTopWidth: 1, borderTopColor: site.line },
  cardTitle: { fontSize: 18, color: site.ink, fontWeight: '500', letterSpacing: -0.4 },
  what: { fontSize: 12, color: site.muted, lineHeight: 21 },
});
