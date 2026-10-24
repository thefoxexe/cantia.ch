import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'rabais-escompte-tva-ordre-soumission',
  question: 'In welcher Reihenfolge werden Rabatt, Skonto und MWST im Leistungsverzeichnis angewendet?',
  title: 'Rabatt, Skonto, MWST: in welcher Reihenfolge in der Zusammenstellung eines Leistungsverzeichnisses?',
  description:
    'Rabatt und Skonto sind nicht dasselbe, und die Reihenfolge verändert das Total. Rechenbeispiel einer Schweizer Zusammenstellung, von der Bruttosumme bis zum Total inklusive MWST.',
  excerpt:
    'Zwei Unternehmen gewähren denselben Rabatt und dasselbe Skonto, kommen aber nicht auf dasselbe Total. Eines der beiden hat die Reihenfolge verwechselt.',
  category: 'Devis & facturation',
  keywords: ['Rabatt Skonto Leistungsverzeichnis', 'Skonto 2%', 'Zusammenstellung LV', 'MWST Offerte Bau', 'Total Angebot Bau'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Am Ende eines Leistungsverzeichnisses addiert die Zusammenstellung die Kapitel und wendet dann Abzüge und die MWST an. Die zwei häufigsten Abzüge, Rabatt und Skonto, haben nicht dieselbe Funktion, und das Dokument gibt in der Regel vor, in welcher Reihenfolge sie anzuwenden sind.',
    },
    { type: 'h2', text: 'Rabatt und Skonto, zwei verschiedene Dinge' },
    {
      type: 'list',
      items: [
        'Der Rabatt senkt den Angebotspreis ohne Bedingung: eine kommerzielle Geste, oft um den Auftrag zu gewinnen.',
        'Das Skonto ist ein Abzug, der gewährt wird, wenn der Kunde innert kurzer Frist zahlt (zum Beispiel 2 % innert 30 Tagen). Es gilt nur, wenn die Bedingung erfüllt ist.',
      ],
    },
    { type: 'h2', text: 'Die häufigste Reihenfolge' },
    {
      type: 'table',
      headers: ['Zeile', 'Berechnung', 'CHF'],
      rows: [
        ['Bruttototal der Kapitel', '', '100’000.00'],
        ['Rabatt 3 %', '100’000 × 3 %', '− 3’000.00'],
        ['Total nach Rabatt', '', '97’000.00'],
        ['Skonto 2 %', '97’000 × 2 %', '− 1’940.00'],
        ['Nettototal exkl. MWST', '', '95’060.00'],
        ['MWST 8,1 %', '95’060 × 8,1 %', '7’699.86'],
        ['Total inkl. MWST', '', '102’759.86'],
      ],
    },
    {
      type: 'callout',
      title: 'Immer dem Dokument folgen',
      text: 'Manche Leistungsverzeichnisse setzen das Skonto nach der MWST, andere verlangen ein Nettototal ohne Skonto. Massgebend ist die Zusammenstellung des Dokuments: Füllen Sie die vorgesehenen Zeilen in ihrer Reihenfolge aus, nicht in Ihrer gewohnten Darstellung.',
    },
    { type: 'h2', text: 'Häufige Fehler' },
    {
      type: 'list',
      items: [
        'Rabatt und Skonto addieren (5 % auf das Brutto), statt sie nacheinander anzuwenden: Der Unterschied ist klein, aber das Total stimmt nicht mehr mit dem des Architekten überein.',
        'Die MWST auf das Brutto berechnen und danach die Abzüge vornehmen.',
        'Vergessen, dass ein Rabatt in der Zusammenstellung zu bereits knapp kalkulierten Einheitspreisen hinzukommt.',
      ],
    },
    {
      type: 'p',
      text: 'Der Normalsatz der MWST in der Schweiz beträgt seit 2024 8,1 %. Ein nicht mehrwertsteuerpflichtiges Unternehmen schlägt keine MWST auf und muss das klar angeben.',
    },
    { type: 'h2', text: 'Mit Cantia (Beta)' },
    {
      type: 'p',
      text: 'Wenn Sie ein Leistungsverzeichnis in Cantia ausfüllen, werden Rabatt, Skonto und MWST in der Zusammenstellung eingestellt; die Totale werden neu berechnet und an ihrer Stelle ins Original-PDF geschrieben. Funktion in der Beta: 1 zum Testen im Plan Basis, 3 pro Monat im Plan Team, unbegrenzt im Plan Entreprise.',
    },
    {
      type: 'cta',
      title: 'Eine korrekte Zusammenstellung, ohne Taschenrechner',
      text: 'Leistungsverzeichnis importieren, Preise und Abzüge eingeben: Cantia rechnet und füllt das PDF aus.',
      buttonLabel: '14 Tage testen',
    },
  ],
  faq: [
    {
      question: 'Wird die MWST vor oder nach dem Skonto berechnet?',
      answer:
        'Meistens nach den Abzügen, auf dem Nettobetrag. Massgebend ist aber die Zusammenstellung des Leistungsverzeichnisses: Folgen Sie der dort angegebenen Reihenfolge.',
    },
    {
      question: 'Muss man in einem Leistungsverzeichnis Skonto gewähren?',
      answer: 'Das ist keine Pflicht. Manche Leistungsverzeichnisse sehen die Zeile vor und lassen Sie den Satz bestimmen, andere schreiben ihn vor. Ein Skonto ergibt nur Sinn, wenn Ihnen eine schnelle Zahlung wichtig ist.',
    },
    {
      question: 'Welcher MWST-Satz gilt für Bauarbeiten?',
      answer: 'In der Regel der Normalsatz von 8,1 %. Ein nicht mehrwertsteuerpflichtiges Unternehmen verrechnet keine MWST.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'erreurs-soumission-qui-coutent-le-marche', 'calculer-prix-unitaire-soumission'],
};
