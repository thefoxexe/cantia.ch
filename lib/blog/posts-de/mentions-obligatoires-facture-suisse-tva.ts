import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'mentions-obligatoires-facture-suisse-tva',
  question: 'Welche Angaben sind auf einer Rechnung in der Schweiz für die MWST gesetzlich vorgeschrieben?',
  title: 'Schweizer Rechnung: die obligatorischen Angaben, damit sie MWST-seitig gültig ist',
  description:
    'MWST-Nummer, anwendbarer Satz, Leistungsdatum, QR-Referenz: Eine unvollständige Rechnung kann in der Buchhaltung abgelehnt oder von einem Kunden beanstandet werden. Hier die genaue Liste zum Überprüfen.',
  excerpt:
    'Eine Rechnung, die «korrekt aussieht», und eine Rechnung, die alle Anforderungen der ESTV erfüllt, sind nicht immer dasselbe. Eine einzige fehlende Angabe genügt, um sie angreifbar zu machen.',
  category: 'Devis & facturation',
  keywords: ['obligatorische Angaben Rechnung Schweiz', 'MWST Nummer Rechnung', 'ESTV Rechnung', 'konforme Rechnung', 'Fakturierung Handwerker'],
  publishedAt: '2026-08-15',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Ein mehrwertsteuerpflichtiges Unternehmen muss Rechnungen ausstellen, die bestimmte formelle Anforderungen erfüllen. Das ist keine blosse Papierkram-Frage: Eine unvollständige Rechnung kann beim Kunden den Vorsteuerabzug verweigern lassen oder bei einer Kontrolle der Eidgenössischen Steuerverwaltung (ESTV) angreifbar werden.',
    },
    { type: 'h2', text: 'Die Liste der erwarteten Angaben' },
    {
      type: 'list',
      items: [
        'Name und vollständige Adresse des ausstellenden Unternehmens sowie des Empfängers',
        'UID-Nummer / MWST-Nummer des ausstellenden Unternehmens',
        'Ausstellungsdatum der Rechnung sowie Datum oder Zeitraum der Leistung, falls abweichend',
        'Ausreichend präzise Beschreibung von Art und Umfang der Leistung',
        'Betrag der Gegenleistung und anwendbarer MWST-Satz (in der Regel 8,1 % für Bauleistungen)',
        'Betrag der MWST, gesondert ausgewiesen oder durch einen klaren Vermerk des Satzes, falls der Preis inkl. MWST angegeben ist',
      ],
    },
    {
      type: 'callout',
      title: 'Unter CHF 400.- genügt eine vereinfachte Rechnung',
      text: 'Bei Kleinbeträgen muss weder der Name des Empfängers noch der genaue MWST-Satz angegeben werden. Die UID-Nummer und der Bruttobetrag bleiben hingegen obligatorisch.',
    },
    { type: 'h2', text: 'Die QR-Rechnung bringt eigene Anforderungen mit' },
    {
      type: 'p',
      text: 'Eine QR-Rechnung muss zusätzlich dem Schweizer Zahlungsstandard entsprechen (gültige IBAN oder QR-IBAN, QR-Referenz oder ohne Referenz je nach verwendetem Konto, strukturierte Adresse mit getrennter PLZ und Ort gemäss Version 2.3 der Norm). Ein nicht konformes Format kann von manchen Banken zurückgewiesen werden oder beim Scannen auf Kundenseite einen Fehler erzeugen.',
    },
    {
      type: 'cta',
      title: 'Konforme Rechnungen, ohne darüber nachzudenken',
      text: 'Cantia erstellt automatisch Rechnungen und QR-Rechnungen mit allen aktuellen gesetzlichen Angaben (MWST, IBAN, strukturierte Adresse), ohne dass Sie jedes Feld von Hand prüfen müssen.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Ist die UID-Nummer auf jeder Schweizer Rechnung obligatorisch?',
      answer:
        'Ja, sobald ein Unternehmen mehrwertsteuerpflichtig ist, muss seine UID-/MWST-Nummer auf der Rechnung erscheinen, damit der Kunde die Vorsteuer abziehen kann.',
    },
    {
      question: 'Welcher MWST-Satz gilt für Bauleistungen in der Schweiz?',
      answer:
        'Der Normalsatz von 8,1 % gilt seit 2024 für die Mehrheit der Bauleistungen, ausser bei Sonderfällen mit einem reduzierten Satz oder einer spezifischen Befreiung.',
    },
    {
      question: 'Ist eine Rechnung ohne detaillierte MWST gültig?',
      answer:
        'Bei Beträgen über CHF 400.- müssen Satz und Betrag der MWST klar ersichtlich sein, da deren Fehlen dem Empfänger den Vorsteuerabzug verweigern kann.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'difference-devis-offre-facture-pro-forma',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
