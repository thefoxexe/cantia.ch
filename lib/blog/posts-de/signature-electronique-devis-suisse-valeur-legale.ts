import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'signature-electronique-devis-suisse-valeur-legale',
  question: 'Hat eine elektronische Unterschrift auf einer Offerte in der Schweiz rechtlichen Wert?',
  title: 'Eine Offerte online unterschreiben: was das vor dem Gesetz wirklich zählt',
  description:
    'Die einfache elektronische Signatur gilt für nahezu alle Offerten im Baugewerbe als vertragliche Annahme. Die qualifizierte Signatur ist nur in bestimmten, in der Praxis seltenen Fällen nötig.',
  excerpt:
    'Ein Kunde, der auf einen Link klickt und «Ich akzeptiere» wählt, unterschreibt genauso verbindlich wie mit einem Stift: Für die überwiegende Mehrheit der Offerten im Baugewerbe verlangt das Schweizer Recht nicht mehr.',
  category: 'Devis & facturation',
  keywords: ['elektronische unterschrift offerte', 'offerte online unterzeichnen', 'rechtsgültigkeit e-signatur', 'offerte unterschrieben gültig', 'zertes gesetz signatur'],
  publishedAt: '2026-04-20',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Ein Kunde erhält einen Link, klickt auf «Ich akzeptiere», die Baustelle beginnt (ohne Stift, ohne ausgedrucktes Papier). Viele Handwerker fragen sich noch, ob das vor dem Gesetz «wirklich zählt». Die Antwort ist in der übergrossen Mehrheit der Fälle: ja.',
    },
    { type: 'h2', text: 'Drei Stufen der elektronischen Signatur, nicht nur eine' },
    {
      type: 'table',
      headers: ['Typ', 'Was es ist', 'Typischer Anwendungsfall'],
      rows: [
        ['Einfach', 'Klick, angekreuztes Feld, zeitgestempelte Validierung', 'Offerten, Rechnungen, die meisten Geschäftsverträge'],
        ['Fortgeschritten', 'Identität des Unterzeichners geprüft, eindeutig verknüpft', 'Verträge mit höherem Risiko'],
        ['Qualifiziert (SES/SEQ im Sinne des ZertES)', 'Qualifiziertes Zertifikat, gleichwertig mit der handschriftlichen Unterschrift', 'Rechtsgeschäfte, die gesetzlich die qualifizierte Schriftform verlangen'],
      ],
    },
    {
      type: 'callout',
      title: 'Der Punkt, der die meisten Handwerker beruhigt',
      text: 'Da der Werkvertrag keine besondere Form erfordert (siehe Art. 11 OR), genügt eine einfache elektronische Signatur (ein zeitgestempelter Klick auf einem Portal), um die Annahme einer Offerte zu dokumentieren. Die qualifizierte Signatur ist nur für die seltenen Rechtsgeschäfte nötig, bei denen das Gesetz ausdrücklich die qualifizierte Schriftform verlangt (etwa bestimmte Grundstücksgeschäfte) – das betrifft eine Bauofferte praktisch nie.',
    },
    { type: 'h2', text: 'Was eine einfache elektronische Signatur solide macht' },
    {
      type: 'list',
      items: [
        'Ein präziser Zeitstempel der Annahme, als Beweis aufbewahrt',
        'Die klare Identifikation des angenommenen Dokuments (Version, Betrag, Datum), nicht nur ein isolierter Klick ohne Kontext',
        'Idealerweise eine Spur der E-Mail-Adresse oder des Kontos, das validiert hat, um die Annahme der richtigen Person zuzuordnen',
      ],
    },
    { type: 'h2', text: 'Warum das besser ist als ein ausgedrucktes, unterschriebenes, gescanntes PDF' },
    {
      type: 'p',
      text: 'Ein von Hand unterschriebenes und dann gescanntes PDF hat rechtlich gesehen keinen höheren Wert als ein zeitgestempelter Klick. Beide sind Annahmenachweise, keiner solider als der andere, bei einem formfreien Vertrag. Der eigentliche Unterschied ist praktischer Natur: Der Klick eliminiert den Druckschritt, reduziert die Reibung für den Kunden und hinterlässt eine digitale Spur, die Jahre später leichter wiederzufinden ist als ein verlorener Scan in einer Mailbox.',
    },
    {
      type: 'cta',
      title: 'Online unterschrieben, automatisch zeitgestempelt',
      text: 'Das Kundenportal von Cantia erlaubt es dem Kunden, seine Offerte direkt online einzusehen und zu unterschreiben, mit einer zeitgestempelten Annahme, die zusammen mit dem Dokument aufbewahrt wird.',
      buttonLabel: 'Modul Offerten ansehen',
    },
  ],
  faq: [
    {
      question: 'Genügt eine einfache elektronische Signatur für eine Bauofferte?',
      answer:
        'Ja, in nahezu allen Fällen: Der Werkvertrag erfordert keine besondere Form, ein zeitgestempelter Klick genügt daher, um die Annahme zu dokumentieren.',
    },
    {
      question: 'Wann braucht es eine qualifizierte statt einer einfachen elektronischen Signatur?',
      answer:
        'Nur für Rechtsgeschäfte, bei denen das Gesetz ausdrücklich die qualifizierte Schriftform verlangt. Das ist ein seltener Fall, der eine Bauofferte praktisch nie betrifft.',
    },
    {
      question: 'Ist eine elektronisch unterschriebene Offerte mehr wert als ein ausgedrucktes und von Hand unterschriebenes PDF?',
      answer:
        'Beide haben bei einem formfreien Vertrag einen vergleichbaren Beweiswert. Die elektronische Signatur hat vor allem den praktischen Vorteil, die Reibung zu reduzieren und eine leicht wiederauffindbare digitale Spur zu hinterlassen.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'validite-devis-signe-prix-qui-bouge',
  ],
};
