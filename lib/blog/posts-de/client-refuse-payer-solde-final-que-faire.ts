import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'client-refuse-payer-solde-final-que-faire',
  question: 'Ein Kunde weigert sich, den Restbetrag der Baustelle zu bezahlen: was tun?',
  title: 'Ein Kunde weigert sich, den Restbetrag zu zahlen: die Methode, Schritt für Schritt',
  description:
    'Eine Zahlungsverweigerung beim Restbetrag ist fast nie endgültig. Meist handelt es sich um eine Unstimmigkeit zu einem bestimmten Punkt. Die beiden zu unterscheiden verändert die gesamte zu verfolgende Strategie.',
  excerpt:
    'Ein Kunde, der „nicht zahlen will", hat fast immer einen konkreten Grund im Kopf: einen Mangel, eine Preisdifferenz, einen Zweifel. Diesen zu identifizieren verändert alles Weitere.',
  category: 'Devis & facturation',
  keywords: ['unbezahlter Restbetrag', 'Zahlungsverweigerung', 'Baustellenstreit', 'Betreibung Schweiz', 'Garantierückbehalt'],
  publishedAt: '2026-04-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Die Baustelle ist fertig, die Schlussrechnung verschickt, und dennoch zahlt der Kunde nicht. Vor jedem Inkassoschritt steht eine Frage über allen anderen: warum? Eine Zahlungsverweigerung hat fast nie nur eine Ursache, und die zu verfolgende Strategie ändert sich je nach Antwort völlig.',
    },
    { type: 'h2', text: 'Drei sehr unterschiedliche Situationen unterscheiden' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Der Kunde beanstandet einen konkreten Mangel an den Arbeiten: die Zahlung ist an eine berechtigte oder unberechtigte Reklamation zur Qualität des Ergebnisses geknüpft',
        'Der Kunde beanstandet den Betrag selbst (nicht genehmigter Nachtrag, nicht erklärte Überschreitung): die Uneinigkeit betrifft den Preis, nicht die Arbeit',
        'Der Kunde hat schlicht nicht die nötige Liquidität, um zu zahlen, oder verzögert ohne klare Begründung (ein Problem des Willens oder der Fähigkeit, nicht der Sache)',
      ],
    },
    {
      type: 'callout',
      title: 'Der Reflex, der die Lage nicht noch verschärft',
      text: 'Beruft sich der Kunde auf einen Mangel, ist ein Garantierückbehalt im Verhältnis zu diesem konkreten Mangel (nicht zum gesamten Restbetrag) rechtlich eine solidere Reaktion als eine vollständige Zahlungsverweigerung. Genau das wird auch ein Richter dokumentiert sehen wollen, wenn sich der Streit verschärft. Umgekehrt schwächt ein Einbehalt von 100 % des Restbetrags wegen eines geringfügigen Mangels die Position des Kunden, nicht Ihre.',
    },
    { type: 'h2', text: 'Das konkrete Vorgehen' },
    {
      type: 'list',
      items: [
        'Schriftlich nach dem genauen Grund der Nichtzahlung fragen: eine vage Antwort oder ausbleibende Antwort sagt bereits viel aus',
        'Wird ein Mangel geltend gemacht, eine rasche Kontrollbesichtigung vorschlagen, statt die Uneinigkeit über E-Mail-Austausch eskalieren zu lassen',
        'Ab diesem Zeitpunkt jeden Austausch schriftlich dokumentieren, denn das bildet die Grundlage eines Dossiers, falls der Streit weitergeht',
        'Eine formelle Mahnung senden, wenn innerhalb einer angemessenen Frist keine konstruktive Antwort eingeht',
        'Als letztes Mittel bleibt ein Betreibungsverfahren (Betreibungsbegehren beim Betreibungsamt am Wohnsitz des Schuldners) das rechtliche Instrument, um die Forderung durchzusetzen',
      ],
    },
    { type: 'h2', text: 'Was im Vorfeld am besten schützt' },
    {
      type: 'p',
      text: 'Der beste Schutz gegen diese Art von Blockade wird aufgebaut, bevor sie eintritt: ein unterzeichnetes Abnahmeprotokoll, datierte Fotos des Endzustands der Arbeiten und eine ausreichend detaillierte Offerte, sodass kein Posten mangels Klarheit angefochten werden kann. Ein solides Dossier verkürzt fast immer die Dauer eines Rechtsstreits, selbst wenn es ihn nicht vollständig verhindert.',
    },
    {
      type: 'cta',
      title: 'Jeder Austausch, jedes Foto, am selben Ort',
      text: 'Cantia zentralisiert Offerten, Rechnungen, Baustellenberichte und Austausch pro Projekt, sodass das Dossier bereits an dem Tag existiert, an dem ein Streit entsteht, ohne Rekonstruktion in letzter Minute.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Darf ein Kunde den gesamten Restbetrag wegen eines geringfügigen Mangels einbehalten?',
      answer:
        'Rechtlich muss ein Einbehalt im Verhältnis zum tatsächlichen Mangel stehen. Den gesamten Restbetrag wegen eines geringfügigen Problems einzubehalten schwächt eher die Position des Kunden als jene des Unternehmens.',
    },
    {
      question: 'Was ist der erste Schritt bei einer Zahlungsverweigerung des Restbetrags?',
      answer:
        'Schriftlich nach dem genauen Grund der Verweigerung fragen: die Antwort zeigt, ob der Streit einen Mangel, den Betrag oder schlicht eine Liquiditätsschwierigkeit des Kunden betrifft.',
    },
    {
      question: 'Ab wann ein Betreibungsverfahren in Betracht ziehen?',
      answer:
        'Als letztes Mittel, nach einer formellen Mahnung, die ohne konstruktive Antwort geblieben ist. Das Betreibungsbegehren wird beim Betreibungsamt am Wohnsitz des Schuldners eingereicht.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
