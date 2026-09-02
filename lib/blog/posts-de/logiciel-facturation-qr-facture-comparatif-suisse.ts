import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-facturation-qr-facture-comparatif-suisse',
  question: 'Wie erkennt man eine Fakturierungssoftware, die die QR-Rechnung wirklich sauber umsetzt?',
  title: 'Fakturierungssoftware mit QR-Rechnung: Was einen echten Support von einem Bastelmodul unterscheidet',
  description:
    'Viele Tools werben mit «QR-Rechnung kompatibel», ohne die Norm im Detail einzuhalten: strukturierte Adresse, IBAN vs. QR-IBAN, QR-Referenz. So erkennen Sie den Unterschied.',
  excerpt:
    'Ein QR-Code, der «richtig aussieht», kann beim Scannen von der Bank abgelehnt werden. Die Schweizer QR-Rechnung folgt präzisen Regeln, und nicht jede Software hält sich gleich genau daran.',
  category: 'Comparatifs & outils',
  keywords: ['Software QR-Rechnung', 'QR-Rechnung Schweiz Vergleich', 'Fakturierungssoftware QR-IBAN', 'Norm QR-Rechnung 2.3', 'konforme Rechnungsstellung Schweiz'],
  publishedAt: '2026-06-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Seit dem Verschwinden des orangen Einzahlungsscheins im Jahr 2022 ist die QR-Rechnung der einzige Zahlungsstandard in der Schweiz. Die meisten Fakturierungsprogramme werben heute mit «QR-Rechnung» als Verkaufsargument. Doch einen QR-Code zu erzeugen, der jedes Mal korrekt scannt, mit den richtigen Daten, ist anspruchsvoller, als es scheint.',
    },
    { type: 'h2', text: 'Was einen echten QR-Rechnung-Support ausmacht' },
    {
      type: 'list',
      items: [
        'Die korrekte Unterscheidung von IBAN und QR-IBAN (zwei unterschiedliche Formate je nach Kontotyp, mit oder ohne QR-Referenz)',
        'Die strukturierte Adresse (PLZ und Ort getrennt), seit der Norm 2.3 obligatorisch: Eine Adresse im Fliesstext wird ab Ende September 2026 abgelehnt',
        'Die automatische Berechnung und Prüfung der QR-Referenz (QRR), um einen Abgleichfehler auf Kundenseite zu vermeiden',
        'Eine ausreichende Ruhezone (Quiet Zone) rund um den QR-Code: Ein zu knapp gesetzter Code kann beim Scannen scheitern, selbst wenn die Daten korrekt sind',
      ],
    },
    {
      type: 'callout',
      title: 'Ein Fehler bei der QR-Rechnung-Generierung zeigt sich oft erst beim Zahlungsversuch',
      text: 'Das PDF sieht normal aus, der Kunde versucht zu scannen oder die Referenz manuell einzugeben, und es scheitert. Das Problem wird dann als Zahlungsverzug wahrgenommen, ohne dass die eigentliche Ursache (ein Konformitätsmangel) erkennbar ist.',
    },
    { type: 'h2', text: 'Wie man die Konformität vor der Wahl überprüft' },
    {
      type: 'list',
      items: [
        'Eine Testrechnung erstellen und mit einer echten Schweizer Banking-App scannen, nicht nur visuell prüfen',
        'Kontrollieren, dass die Adresse tatsächlich strukturiert erscheint (PLZ/Ort getrennt) und nicht als einzelner Textblock',
        'Bestätigen, dass die Software automatisch zwischen Standard-IBAN und QR-IBAN unterscheidet, je nach hinterlegtem Konto',
      ],
    },
    {
      type: 'cta',
      title: 'Konforme QR-Rechnung, automatisch generiert',
      text: 'Cantia erstellt normkonforme QR-Rechnungen bereits bei der Erstellung von Offerte oder Rechnung, ohne technische Konfiguration Ihrerseits.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Was ist der Unterschied zwischen IBAN und QR-IBAN?',
      answer:
        'Die QR-IBAN ist eine spezielle Nummer, die ausschliesslich für QR-Rechnungen mit strukturierter QR-Referenz (QRR) verwendet wird, im Unterschied zu einer Standard-IBAN, die auch ohne Referenz nutzbar ist.',
    },
    {
      question: 'Warum kann eine QR-Rechnung beim Scannen fehlschlagen?',
      answer:
        'Eine unstrukturierte Adresse, eine zu knappe Ruhezone oder eine falsch berechnete QR-Referenz können einen korrekten Scan verhindern, selbst wenn das PDF optisch normal wirkt.',
    },
    {
      question: 'Seit wann ist die strukturierte Adresse auf einer QR-Rechnung obligatorisch?',
      answer:
        'Seit der Norm 2.3 im November 2025. Adressen im Fliesstext werden ab dem 30. September 2026 endgültig abgelehnt.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'meilleur-logiciel-devis-facture-batiment-suisse-2026',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
