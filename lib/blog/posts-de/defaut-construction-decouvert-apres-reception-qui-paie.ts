import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'defaut-construction-decouvert-apres-reception-qui-paie',
  question: 'Ein Baumangel wird nach der Abnahme entdeckt: wer zahlt die Reparatur?',
  title: 'Mangel nach der Bauabnahme entdeckt: wer zahlt?',
  description:
    'Ein versteckter Mangel, der Monate nach der Abnahme entdeckt wird, geht zulasten des Unternehmers, wenn er rechtzeitig gemeldet wird. Was die Reform des Gewährleistungsrechts 2026 ändert.',
  excerpt:
    'Die Abnahme einer Baustelle beendet nie alles: Ein versteckter Mangel, der später entdeckt wird, geht weiterhin zulasten des Unternehmers – unter einer präzisen Bedingung, die kaum jemand kennt.',
  category: 'Juridique & normes',
  keywords: ['versteckter Mangel', 'Bauabnahme', 'Gewährleistung Baustelle', 'Haftung Unternehmer', 'Baumangel'],
  publishedAt: '2026-03-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Der Kunde unterzeichnet die Abnahme, alles scheint in Ordnung. Dann, acht Monate später, erscheint ein Riss, oder es zeigt sich eine Feuchtigkeit hinter einer geschlossenen Verkleidung. Die Abnahme löscht die Verantwortung des Unternehmers für diese Art von Mangel nicht: genau das soll das 5-jährige Gewährleistungsregime abdecken.',
    },
    { type: 'h2', text: 'Erkennbarer Mangel vs. versteckter Mangel: die Unterscheidung, die alles entscheidet' },
    {
      type: 'p',
      text: 'Ein bei der Abnahme sichtbarer Mangel muss auf der Stelle gemeldet werden; andernfalls gilt er, sofern nichts anderes vereinbart wurde, als vom Kunden so akzeptiert. Ein versteckter Mangel, der bei einer normalen Prüfung nicht erkennbar ist, bleibt auch nach einer vorbehaltlosen Abnahme innerhalb der Gewährleistungsfrist gedeckt.',
    },
    {
      type: 'callout',
      title: 'Die Bedingung, die über die Haftung entscheidet',
      text: 'Seit der 2026 in Kraft getretenen Reform des Gewährleistungsrechts muss ein versteckter Mangel innerhalb von 60 Tagen nach seiner Entdeckung gemeldet werden. Ein Kunde, der sechs Monate wartet, nachdem er das Problem bemerkt hat, riskiert, sein Recht auf Nachbesserung zu verlieren – selbst wenn der Mangel selbst noch innerhalb der 5-jährigen Gewährleistungsfrist liegt.',
    },
    { type: 'h2', text: 'Was bestimmt, wer zahlt' },
    {
      type: 'list',
      items: [
        'Ist der Mangel erkennbar oder versteckt? Ein bei der Abnahme nicht gemeldeter erkennbarer Mangel geht in der Regel verloren',
        'Wurde ein versteckter Mangel innerhalb von 60 Tagen nach seiner Entdeckung gemeldet?',
        'Befindet sich die Baustelle noch innerhalb der 5-jährigen Verjährungsfrist (10 Jahre bei absichtlicher Verheimlichung)?',
        'Resultiert der Mangel aus einem Ausführungsfehler des Unternehmers oder aus einer späteren Fehlnutzung durch den Kunden (die Beweislast spielt hier eine entscheidende Rolle)',
      ],
    },
    { type: 'h2', text: 'Sich auf beiden Seiten schützen' },
    {
      type: 'p',
      text: 'Ein detailliertes Abnahmeprotokoll, ergänzt durch datierte Fotos jeder Zone der Baustelle, schützt sowohl den Unternehmer (Nachweis des tatsächlichen Zustands bei Übergabe) als auch den Kunden (Referenz bei einem späteren Streit). Es ist das am wenigsten genutzte Dokument der Branche: oft auf eine schnelle Unterschrift am Ende der Besichtigung reduziert, obwohl es das zentrale Beweisstück wird, wenn Monate später ein Mangel auftaucht.',
    },
    {
      type: 'cta',
      title: 'Jede Etappe der Baustelle automatisch dokumentiert',
      text: 'Die Cantia-Baustellenberichte versehen jedes auf der Baustelle aufgenommene Foto mit Zeitstempel und Standort. Das ist die solideste Spur bei einem Gewährleistungsstreit, ohne zusätzlichen Ablageaufwand.',
      buttonLabel: 'Baustellenberichte entdecken',
    },
  ],
  faq: [
    {
      question: 'Kann ein Kunde einen ein Jahr nach der Abnahme entdeckten Mangel geltend machen?',
      answer:
        'Ja, sofern es sich um einen versteckten Mangel handelt, der bei einer normalen Prüfung bei der Abnahme nicht erkennbar war, und sofern er innerhalb von 60 Tagen nach seiner Entdeckung gemeldet wird, innerhalb der 5-jährigen Verjährungsfrist.',
    },
    {
      question: 'Was passiert, wenn ein erkennbarer Mangel bei der Abnahme nicht gemeldet wurde?',
      answer:
        'Er gilt grundsätzlich als vom Kunden akzeptiert, sofern der Vertrag nichts anderes vorsieht, was das Interesse an einem detaillierten Abnahmeprotokoll erklärt, das genau auflistet, was geprüft wurde.',
    },
    {
      question: 'Wie lange hat man seit der Reform 2026, um einen versteckten Mangel zu melden?',
      answer:
        '60 Tage ab seiner Entdeckung, ein präziserer Rahmen als die frühere Anforderung einer „sofortigen" Meldung. Eine Verzögerung kann selbst innerhalb der globalen Gewährleistungsfrist zum Verlust des Rechts auf Nachbesserung führen.',
    },
  ],
  relatedSlugs: [
    'garantie-travaux-construction-2-ou-5-ans',
    'norme-sia-118-devis-obligatoire',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
