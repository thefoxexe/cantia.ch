import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-facadier-isolation-suisse',
  question: 'Wie kalkuliert man eine Offerte für Fassade und Aussenwärmedämmung unter Berücksichtigung kantonaler Förderbeiträge?',
  title: 'Fassadenbauer und Aussenwärmedämmung: Offerte unter Berücksichtigung der Förderbeiträge kalkulieren',
  description:
    'Eine Offerte für die Aussenwärmedämmung (GEAK, Programm Gebäude) geht oft mit einem parallelen Fördergesuch einher. So strukturieren Sie Offerte und Rechnungsstellung, ohne das Dossier des Kunden zu blockieren.',
  excerpt:
    'Die Aussenwärmedämmung gehört zu den wenigen Bauprojekten, bei denen der Offertpreis direkt ein paralleles Verwaltungsdossier beeinflusst – jenes des kantonalen Förderbeitrags – und diese Abhängigkeit verändert die Art der Rechnungsstellung.',
  category: 'Métiers du bâtiment',
  keywords: ['Offerte Fassade Wärmedämmung', 'Verrechnung Aussenwärmedämmung Schweiz', 'Förderbeitrag Programm Gebäude Offerte', 'Preis Fassadendämmung m2', 'GEAK Offerte Sanierung'],
  publishedAt: '2026-09-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Im Gegensatz zu den meisten Bauprojekten geht ein Projekt zur Aussenwärmedämmung oft mit einem kantonalen Fördergesuch (über das Programm Gebäude) oder einem GEAK-Zertifikat einher. Der Kunde erwartet häufig eine Offerte, die den Anforderungen des Dossiers entspricht, noch bevor er sie unterzeichnet – das kehrt die übliche Reihenfolge zwischen Offerte und Zusage um.',
    },
    { type: 'h2', text: 'Was die Offerte enthalten muss, um förderkompatibel zu bleiben' },
    {
      type: 'list',
      items: [
        'Dämmstärke und Dämmwert (U-Wert) klar angegeben, nicht nur die Materialart',
        'Behandelte Fassadenfläche detailliert ausgewiesen, da Förderbeiträge oft pro m² berechnet werden',
        'Unterscheidung zwischen Fassade, Sockel und Fensterlaibungen, die unterschiedliche Anforderungen haben können',
        'Voraussichtliches Ausführungsdatum, da manche Kantone eine Frist zwischen Zusage und Bauende vorschreiben',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 400-1200',
      label: 'Grössenordnung der kantonalen Förderbeiträge pro sanierten Gebäudehüllenelement, je nach Kanton und Gebäudetyp sehr unterschiedlich',
    },
    { type: 'h2', text: 'Die Liquidität nicht vom Zeitplan der Förderung abhängig machen' },
    {
      type: 'p',
      text: 'Die Auszahlung eines Förderbeitrags kann mehrere Monate nach Bauende dauern. Wer den Kunden normal nach Baufortschritt in Rechnung stellt, ohne die Rechnung erst nach der kantonalen Auszahlung zu stellen, verhindert, dass die Liquidität des Unternehmens vom Verwaltungsrhythmus Dritter abhängt.',
    },
    {
      type: 'callout',
      title: 'Die Offerte muss während der gesamten Dauer des Förderverfahrens gültig bleiben',
      text: 'Ein Fördergesuch kann mehrere Wochen bis zur Bewilligung dauern. Eine ausreichend lange Offertgültigkeit oder ersatzweise eine klare Preisanpassungsklausel bei Fristüberschreitung erspart es, wegen einer reinen Verwaltungsfrist eine identische Offerte neu zu erstellen.',
    },
    {
      type: 'cta',
      title: 'Detaillierte Offerten, bereit als Grundlage für ein Fördergesuch',
      text: 'Cantia erstellt klare, nach Posten gegliederte Offerten mit allen Flächen und Mengen, die für ein kantonales Fördergesuch nötig sind.',
      buttonLabel: 'Kostenlos testen',
    },
  ],
  faq: [
    {
      question: 'Muss die Offerte für Aussenwärmedämmung den U-Wert des Materials angeben?',
      answer:
        'Das wird dringend empfohlen, da kantonale Förderdossiers (Programm Gebäude) in der Regel einen präzisen Dämmwert verlangen, nicht nur eine kommerzielle Bezeichnung des Materials.',
    },
    {
      question: 'Muss man die Auszahlung des Förderbeitrags abwarten, bevor man dem Kunden Rechnung stellt?',
      answer:
        'Nein, es empfiehlt sich, nach normalem Baufortschritt Rechnung zu stellen, ohne die eigene Liquidität an den oft langen Auszahlungskalender des kantonalen Förderbeitrags zu binden.',
    },
    {
      question: 'Sollte eine Offerte für Aussenwärmedämmung eine längere Gültigkeit als üblich haben?',
      answer:
        'Das ist ratsam, da die Zusammenstellung eines Förderdossiers mehrere Wochen dauern kann; eine klare Anpassungsklausel erspart dann, wegen einer reinen Fristüberschreitung eine identische Offerte neu zu erstellen.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'devis-charpente-bois-facturation-suisse',
    'permis-construire-renovation-quand-necessaire',
  ],
};
