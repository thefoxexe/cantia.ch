import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-serrurier-metallier-suisse',
  question: 'Wie soll ein Schlosser-Metallbauer eine Offerte zwischen Massanfertigung und Notfall-Reparatur kalkulieren?',
  title: 'Schlosser-Metallbauer: Kalkulieren zwischen Massarbeit und Notfall-Reparatur',
  description:
    'Ein Geländer nach Mass wird in Ruhe geplant, eine aufgebrochene Tür muss innert der Stunde repariert werden: Der Schlosser-Metallbauer lebt beide Logiken parallel. So strukturieren Sie sie, ohne sie zu vermischen.',
  excerpt:
    'Zwischen einem über mehrere Wochen gefertigten Stahltor und einem am Samstagabend in Eile ausgewechselten Schloss muss der Metallbauer-Schlosser zwei radikal unterschiedliche Arten der Fakturierung nebeneinander bestehen lassen.',
  category: 'Métiers du bâtiment',
  keywords: ['offerte schlosser metallbau', 'notfall schlüsseldienst rechnung', 'preis massanfertigung metallbau', 'offerte geländer tor', 'tarif schlosser notdienst schweiz'],
  publishedAt: '2026-09-15',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Der Metallbau nach Mass (Geländer, Tore, Treppen, Konstruktionen) folgt dem Rhythmus einer klassischen Baustelle: Aufmass, Planung, Fertigung in der Werkstatt, Montage. Der Notdienst des Schlossers (zugeschlagene Tür, aufgebrochenes Schloss, abgebrochener Schlüssel) folgt einem völlig anderen Rhythmus: sofortiger Einsatz, oft ausserhalb der üblichen Arbeitszeiten, ohne Zeit, vorher eine detaillierte Offerte zu erstellen.',
    },
    { type: 'h2', text: 'Massanfertigung: eine Offerte, die der Fertigung folgt' },
    {
      type: 'list',
      items: [
        'Aufmass und technische Planzeichnung, besonders wichtig bei tragenden Strukturen',
        'Materialbeschaffung (Stahl, Chromstahl, Aluminium), deren Preis zwischen Bestellung und Lieferung schwanken kann',
        'Zuschnitt und Schweissarbeiten in der Werkstatt, je nach Komplexität nach Zeit oder Stück kalkulierbar',
        'Montage, Befestigung und Ausführungsarbeiten (Anstrich, Verzinkung) vor Ort',
      ],
    },
    { type: 'h2', text: 'Notdienst: ein Tarif, der vor dem Einsatz genannt wird, auch unter Druck' },
    {
      type: 'p',
      text: 'Eine Person, die vor ihrer verschlossenen Tür steht, ist nicht in der Lage, gelassen über einen Preis zu verhandeln. Den Tarif für Anfahrt und Einsatz klar mitzuteilen, bevor man losfährt, statt erst im Nachhinein zu fakturieren, schützt den Kunden vor einer bösen Überraschung und den Schlosser vor einer späteren Anfechtung des Preises.',
    },
    {
      type: 'stat',
      value: '30–50 %',
      label: 'übliche Aufschlag auf einen Schlosser-Notdienst ausserhalb der normalen Arbeitszeiten, im Vergleich zu einem geplanten Termin',
    },
    {
      type: 'callout',
      title: 'Die Schwankung des Stahlpreises verdient eine Klausel in der Offerte',
      text: 'Bei einer Massanfertigung, deren Fertigung sich über mehrere Wochen erstreckt, verhindert eine Klausel zur Materialpreisanpassung, dass Sie eine zwischenzeitliche Erhöhung des Stahlpreises zwischen Offerte und effektiver Bestellung allein tragen müssen.',
    },
    {
      type: 'cta',
      title: 'Fakturieren Sie einen Notdienst vom Trottoir aus, in wenigen Minuten',
      text: 'Mit Cantia können Sie direkt nach einem Notfall-Einsatz eine Rechnung vom Telefon aus ausstellen, ohne in die Werkstatt zurückzukehren, um sie nicht zu vergessen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Wie fakturiert man einen Schlosser-Notdienst ohne vorherige Offerte?',
      answer:
        'Indem man den Tarif für Anfahrt und Einsatz klar mündlich oder per Nachricht mitteilt, bevor man sich vor Ort begibt, statt die Rechnung nachträglich ohne vorherige Preiseinigung zu erstellen.',
    },
    {
      question: 'Darf man den Tarif eines Schlosser-Notdienstes ausserhalb der normalen Arbeitszeiten erhöhen?',
      answer:
        'Ja, das ist gängige Praxis (üblicherweise zwischen 30 und 50 % Aufschlag), sofern der Kunde vor dem Einsatz informiert wird, nicht erst auf der Endrechnung.',
    },
    {
      question: 'Sollte man bei einem massgefertigten Metallbauwerk eine Preisanpassungsklausel vorsehen?',
      answer:
        'Das ist empfehlenswert, wenn sich die Fertigung über mehrere Wochen erstreckt, da der Rohstoffpreis wie beim Stahl zwischen Offerte und effektiver Bestellung erheblich schwanken kann.',
    },
  ],
  relatedSlugs: [
    'devis-facture-plombier-sanitaire-suisse',
    'facturer-acompte-suisse-securiser-solde',
    'devis-charpente-bois-facturation-suisse',
  ],
};
