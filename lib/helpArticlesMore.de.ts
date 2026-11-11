import type { HelpArticleMore } from './helpArticlesMore';

// Extra sections and questions for the help articles, German (Swiss usage:
// ss, Offerte, MWST). Same content as lib/helpArticlesMore.fr.ts.
export const HELP_MORE_DE: Record<string, HelpArticleMore> = {
  demarrage: {
    sections: [
      {
        title: 'Womit Sie in der ersten Woche beginnen',
        paragraphs: [
          'Beginnen Sie mit Konto → Unternehmen: Name, Adresse, IBAN, Logo und Farbe. Diese Angaben stehen auf jeder Offerte und jeder Rechnung und geben Ihren Dokumenten sofort einen professionellen Auftritt.',
          'Erstellen Sie danach eine erste Baustelle und eine erste Offerte mit einem echten Kunden. Sie sehen, wie beides zusammenhängt und wie die Rechnung entsteht, sobald die Offerte angenommen ist. Wenn Sie bereits eine Kundenliste haben, importieren Sie sie unter Konto → Datenimport (Excel oder CSV), statt alles neu zu erfassen.',
          'Steht die Grundlage, laden Sie das Team unter Konto → Team ein und aktivieren nur die Module, die Sie brauchen. Einige gut genutzte Module bringen mehr, als alles auf einmal einzuschalten.',
        ],
      },
      {
        title: 'Rollen und Berechtigungen',
        paragraphs: [
          'Jedes Mitglied hat eine Rolle. Der Administrator sieht und regelt alles, eine Personal-Rolle verwaltet Stunden und Löhne, ein normaler Mitarbeiter sieht seine eigenen Stunden, seine Baustellen und was seine Rolle erlaubt. Die Rollen werden unter Konto → Team eingestellt.',
        ],
      },
    ],
    faq: [
      { q: 'Kann ich Cantia auf dem Telefon nutzen?', a: 'Ja. Cantia läuft im Browser des Telefons, und Sie können es auf dem Startbildschirm ablegen und wie eine App öffnen.' },
      { q: 'Löscht ein deaktiviertes Modul meine Daten?', a: 'Nein. Ein ausgeschaltetes Modul verschwindet aus der Navigation, seine Daten bleiben. Schalten Sie es wieder ein, ist alles da.' },
      { q: 'Wo finde ich unterwegs Hilfe?', a: 'Unter Konto → Hilfe, mit allen Artikeln dieses Hilfe-Centers, und per E-Mail an info@cantia.ch.' },
    ],
  },
  'devis-creation': {
    sections: [
      {
        title: 'Eine klare Offerte, Position für Position',
        paragraphs: [
          'Jede Position hat eine Beschreibung, eine Menge, eine Einheit und einen Einzelpreis. Cantia berechnet die Summen, die MWST und den Gesamtbetrag. Eine Beschreibung, die Sie schon in einer früheren Offerte verwendet haben, wird mit Einheit und letztem Preis vorgeschlagen (siehe Artikel zum Katalog).',
          'Für Positionen, die oft wiederkommen, fügt eine Vorlage mehrere Positionen auf einmal ein. Die Notizen am Anfang und am Ende der Offerte dienen den Bedingungen: Gültigkeit, verlangte Anzahlung, was nicht inbegriffen ist.',
        ],
      },
      {
        title: 'Versenden und verfolgen',
        paragraphs: [
          'Ist die Offerte bereit, geht sie per E-Mail mit dem PDF und dem Link zum Kundenportal hinaus, wo der Kunde online unterschreiben kann. Die Offerte wechselt auf Versendet, und Sie sehen den Status wechseln, sobald der Kunde annimmt. Mit dem Abo Entreprise sehen Sie zudem, wann der Kunde die Offerte geöffnet hat.',
          'Wünscht der Kunde eine Änderung, duplizieren oder bearbeiten Sie die Offerte, statt eine neue zu erstellen: Der Verlauf bleibt beim selben Kunden und bei derselben Baustelle.',
        ],
      },
    ],
    faq: [
      { q: 'Wie viele Offerten kann ich erstellen?', a: 'So viele Sie wollen: Offerten und Rechnungen sind in allen Abos unbegrenzt.' },
      { q: 'Kann die Offerte auf Französisch oder Italienisch hinausgehen?', a: 'Ja, ab dem Abo Team: Jedes Dokument kann in der Sprache des Kunden erstellt werden.' },
      { q: 'Was passiert, wenn der Kunde unterschreibt?', a: 'Die Offerte wechselt auf Angenommen, die Unterschrift wird mit Zeitstempel gespeichert und die zugehörige Rechnung erstellt. Sie müssen nichts abtippen.' },
    ],
  },
  'devis-trames': {
    sections: [
      {
        title: 'Wann sich eine Vorlage lohnt',
        paragraphs: [
          'Eine Vorlage lohnt sich, sobald dieselbe Gruppe von Positionen von Offerte zu Offerte wiederkommt: ein Standardbad, ein Dach, eine jährliche Unterhaltspauschale. Sie füllen sie einmal mit den richtigen Beschreibungen, Einheiten und Preisen und passen danach nur noch die Mengen an.',
          'Eine Vorlage legt nichts fest: In einer Offerte eingefügt, bleibt jede Position änderbar. Ändern sich Ihre Preise, passen Sie die Vorlage an, und die nächsten Offerten gehen mit den neuen Beträgen hinaus, ohne bereits versendete Offerten zu verändern.',
        ],
      },
      {
        title: 'Eine übersichtliche Bibliothek',
        paragraphs: [
          'Geben Sie jeder Vorlage einen Namen, den das ganze Team versteht («Bad komplett 6 m²» statt «Bad2»). Löschen Sie, was nicht mehr gebraucht wird: Die Liste bleibt kurz, und die richtige Vorlage ist in Sekunden gefunden. Das Abo Essentiel umfasst bis zu 40 Vorlagen, Team und Entreprise haben keine Grenze.',
        ],
      },
    ],
    faq: [
      { q: 'Ändert eine geänderte Vorlage meine alten Offerten?', a: 'Nein. Bereits erstellte Offerten behalten ihre Positionen. Die Vorlage dient nur den nächsten Offerten.' },
      { q: 'Kann ich von einer bestehenden Offerte ausgehen?', a: 'Ja, mit «Als Vorlage speichern» im Menü der Offerte.' },
      { q: 'Sieht das ganze Team die Vorlagen?', a: 'Ja, die Vorlagen gehören dem Unternehmen und stehen allen zur Verfügung, die Offerten erstellen.' },
    ],
  },
  'facturation-acomptes': {
    sections: [
      {
        title: 'Ein konkretes Beispiel',
        paragraphs: [
          "Angenommene Offerte über CHF 20'000.–. Sie fakturieren bei Auftragserteilung eine Anzahlung von 30 %, also CHF 6'000.–, und zur Hälfte der Bauzeit eine zweite Anzahlung von 30 %. Am Schluss übernimmt die Schlussrechnung den Gesamtbetrag der Offerte und zieht die bereits fakturierten CHF 12'000.– ab: Es bleiben CHF 8'000.– zu bezahlen, plus allfällige angenommene Zusatzarbeiten.",
          'Für lange Baustellen, die nach Baufortschritt fakturiert werden, verrechnen Akontorechnungen nach Ausmass den tatsächlich erreichten Prozentsatz und nur die Differenz zur vorherigen Rechnung.',
        ],
      },
      {
        title: 'Zahlungen und Status',
        paragraphs: [
          'Eine Rechnung durchläuft Entwurf, Bereit, Versendet, Teilweise bezahlt und Bezahlt. Eine versendete Rechnung mit überschrittener Fälligkeit wird als überfällig markiert. Jede erfasste Zahlung aktualisiert den offenen Betrag. Die Zuordnung über die QR-Referenz oder der Import eines Kontoauszugs erspart das Erfassen jeder Zahlung von Hand.',
        ],
      },
    ],
    faq: [
      { q: 'Kann ich mehrere Anzahlungen auf derselben Offerte machen?', a: 'Ja. Die Schlussrechnung zieht sie alle automatisch ab.' },
      { q: 'Und wenn ich eine Anzahlung storniere?', a: 'Der Abzug wird neu berechnet: Der Restbetrag der Schlussrechnung stimmt weiterhin.' },
      { q: 'Haben die Rechnungen einen QR-Teil?', a: 'Ja, alle Rechnungen enthalten den Schweizer QR-Teil mit der Zahlungsreferenz.' },
    ],
  },
  'facturation-email-lien': {
    sections: [
      {
        title: 'Der Text der E-Mail',
        paragraphs: [
          'Der Text, der eine Offerte, eine Rechnung oder eine Erinnerung begleitet, wird einmal unter Konto → E-Mails eingestellt. Die Elemente in geschweiften Klammern (Kundenname, Nummer, Betrag) werden beim Versand automatisch ausgefüllt. Das angehängte PDF und der sichere Link zum Dokument werden immer darunter angefügt.',
          'Versände und Antworten der Kunden finden Sie im Bereich E-Mails, mit ihrer Verfolgung. Weist die Adresse des Kunden die E-Mail ab, werden Sie benachrichtigt, damit Sie die Adresse korrigieren und erneut senden können.',
        ],
      },
      {
        title: 'Selbst senden oder über Cantia',
        paragraphs: [
          'Der Versand über Cantia hält alles an einem Ort: Versanddatum, Öffnen des Links, Unterschrift. Der kopierte Link bleibt nützlich für einen Kunden, der WhatsApp bevorzugt, die Versandverfolgung liegt dann aber bei Ihnen.',
        ],
      },
    ],
    faq: [
      { q: 'Muss das PDF vor dem Versand erstellt sein?', a: 'Ja, das PDF muss existieren, um angehängt zu werden. Es wird erstellt, sobald das Dokument den Entwurf verlässt.' },
      { q: 'Läuft der Link ab?', a: 'Der Link bleibt gültig, öffnet sich aber erst nach Bestätigung der E-Mail-Adresse des Kunden, die auf dem Dokument steht.' },
      { q: 'Kann der Kunde über den Link bezahlen?', a: 'Er sieht die Details, den offenen Betrag und die QR-Rechnung. Bezahlt wird danach über seine Bank, wie bei jeder QR-Rechnung.' },
    ],
  },
  'chantiers-rapports': {
    sections: [
      {
        title: 'Den Feed täglich führen',
        paragraphs: [
          'Der Baustellen-Feed funktioniert gut, wenn jeder postet, was er tut, in dem Moment, in dem er es tut: ein Foto, bevor eine Decke geschlossen wird, eine Nachricht bei einer Lieferung, eine Notiz, wenn der Kunde eine Änderung wünscht. Diese Einträge werden zum Gedächtnis der Baustelle, datiert und vom ganzen Team geteilt.',
          'Nachrichten lassen sich diktieren: Sagen Sie am Abend, was gemacht wurde und was bleibt, Cantia schreibt es für Sie.',
        ],
      },
      {
        title: 'Ein versandbereiter Bericht',
        paragraphs: [
          'Für einen Wochenbericht an die Bauherrschaft oder den Architekten wählen Sie die Einträge der Woche aus und erstellen das PDF. Der von der KI vorgeschlagene Zusammenfassungstext lässt sich vor dem Export lesen und korrigieren. Der Bericht trägt Logo und Farbe Ihres Unternehmens.',
        ],
      },
    ],
    faq: [
      { q: 'Sind die Fotos datiert?', a: 'Ja, jedes Foto im Feed hat Zeitstempel und Standort, was es zu einem nützlichen Beweis im Streitfall macht.' },
      { q: 'Kann ich ohne Netz arbeiten?', a: 'Ja, offline aufgenommene Fotos werden synchronisiert, sobald die Verbindung zurück ist.' },
      { q: 'Wer sieht den Feed einer Baustelle?', a: 'Die Mitglieder des Unternehmens mit Zugriff auf diese Baustelle, je nach Rolle.' },
    ],
  },
  rentabilite: {
    sections: [
      {
        title: 'Die Marge einer Baustelle lesen',
        paragraphs: [
          'Die Marge ist der offerierte Betrag (angenommene Offerte und angenommene Zusatzarbeiten) abzüglich der tatsächlichen Kosten: Material, Arbeit und Subunternehmer. Sie erscheint in Franken und in Prozent und wird bei jeder neuen Ausgabe oder Stunde aktualisiert.',
          'Damit sie stimmt, genügen zwei Gewohnheiten: jede Ausgabe der richtigen Baustelle zuordnen und die Stunden auf der Baustelle erfassen, auf der sie geleistet wurden. Der durchschnittliche Stundensatz, den ein Administrator festlegt, sollte die echten Kosten einer Stunde widerspiegeln (Lohn, Sozialabgaben, Ferien), nicht nur den Lohn.',
        ],
      },
      {
        title: 'Vor dem Ende reagieren',
        paragraphs: [
          'Wer die Rentabilität zur Hälfte der Bauzeit anschaut, nicht erst am Schluss, kann noch handeln: eine vergessene Zusatzleistung als Zusatzarbeit fakturieren, das eingeteilte Team anpassen oder die nächste Offerte desselben Typs korrigieren.',
        ],
      },
    ],
    faq: [
      { q: 'Welches Abo braucht es?', a: 'Die Rentabilität pro Baustelle ist ab dem Abo Team enthalten.' },
      { q: 'Werden die Stunden automatisch gezählt?', a: 'Ja, die auf der Baustelle erfassten Stunden werden zum festgelegten Stundensatz bewertet.' },
      { q: 'Zählen die Rechnungen der Subunternehmer?', a: 'Ja, sie werden zu den tatsächlichen Kosten der Baustelle gezählt, mit der sie verknüpft sind.' },
    ],
  },
  planning: {
    sections: [
      {
        title: 'Die Woche organisieren',
        paragraphs: [
          'Die Planung lässt sich nach Tag oder nach Woche anzeigen. Jede Zuteilung verbindet eine Person mit einer Baustelle für einen oder mehrere Tage. Auf einen Blick sehen Sie, wer wo ist, wer frei ist und welcher Baustelle Leute fehlen.',
          'Wenn zwei Baustellen dieselben Personen brauchen, zeigt die Planung es vor dem Montagmorgen, nicht erst vor Ort. Eine Zuteilung zu verschieben genügt zur Korrektur.',
        ],
      },
      {
        title: 'Von der Planung zur Baustelle',
        paragraphs: [
          'Jede Zuteilung verweist auf eine echte Baustelle: Von der Planung aus finden Sie direkt ihre Berichte, Fotos und Offerten. Die Teammitglieder sehen ihre eigene Planung auf dem Telefon und wissen, wohin sie am nächsten Tag fahren.',
          'Für eine Baustelle in mehreren Phasen hilft der von der KI aus der Offerte vorgeschlagene Bauablauf (Diagramm der Etappen), die Reihenfolge und die Dauer der Arbeiten festzulegen, die Sie danach anpassen.',
        ],
      },
    ],
    faq: [
      { q: 'Welches Abo braucht es?', a: 'Die Planung ist ab dem Abo Team enthalten.' },
      { q: 'Ersetzt die Planung die Zeiterfassung?', a: 'Nein. Sie dient als Schätzung, solange keine Stunden erfasst sind, danach übernehmen die tatsächlichen Stunden für die Rentabilität.' },
      { q: 'Sehen die Mitarbeiter die Planung?', a: 'Ja, jeder sieht seine Zuteilungen auf dem Telefon.' },
    ],
  },
  metre: {
    sections: [
      {
        title: 'So funktioniert es',
        paragraphs: [
          'Das Aufmass finden Sie in jeder Baustelle. Dort erfassen Sie die Mengen Position für Position: eine Beschreibung, eine Einheit (m², m³, lfm, Stück, Stunde…) und die Masse, die die Menge ergeben. Die Summe jeder Position und das Total des Aufmasses werden laufend berechnet.',
          'Auf der Baustelle wird die Tabelle auf dem Telefon genutzt. Das erspart Notizen im Heft, die im Büro abgetippt werden müssen. Die Masse bleiben bei der Baustelle und sind später auffindbar, falls der Kunde eine Menge bestreitet.',
        ],
      },
      {
        title: 'Vom Aufmass zur Offerte',
        paragraphs: [
          'Die Schaltfläche «Offerte aus diesem Aufmass erstellen» erzeugt eine vorausgefüllte Offerte mit einer Position pro Aufmassposition und den gemessenen Mengen. Danach prüfen Sie nur noch die Einzelpreise, die der Katalog für bereits verrechnete Positionen oft schon vorschlägt.',
          'Für ein Leistungsverzeichnis vom Architekten oder von der Bauherrschaft können Sie mit dem Modul Leistungsverzeichnis ausfüllen (Beta) das erhaltene Dokument importieren, Ihre Preise eintragen und das ausgefüllte PDF zurücksenden.',
        ],
      },
    ],
    faq: [
      { q: 'Wo aktiviere ich das Aufmass?', a: 'In den Einstellungen der Baustelle, zusammen mit den anderen Werkzeugen der Baustelle.' },
      { q: 'Bleibt die erzeugte Offerte änderbar?', a: 'Ja, es ist eine normale Offerte: Positionen, Preise und Texte lassen sich vor dem Versand ändern.' },
      { q: 'Wird das Aufmass mit der Baustelle gelöscht?', a: 'Ja, beim Löschen einer Baustelle wird auch ihr Aufmass gelöscht. Bereits erstellte Offerten bleiben erhalten.' },
    ],
  },
  inventaire: {
    sections: [
      {
        title: 'Eine Preisbasis, die sich selbst aufbaut',
        paragraphs: [
          'Sie müssen den Katalog nicht vor dem Start füllen. Jede Offerte ergänzt ihn: Nach einigen Wochen sind Ihre üblichen Positionen darin, mit Einheit und zuletzt verrechnetem Preis. So lässt sich eine neue Offerte in wenigen Minuten kalkulieren.',
          'Der Katalog weist auch auf einen Preis hin, der stark von Ihren üblichen Preisen für dieselbe Position abweicht. Nützlich, um einen Tippfehler zu bemerken, bevor die Offerte hinausgeht.',
        ],
      },
      {
        title: 'Vorhandene Listen importieren',
        paragraphs: [
          'Führen Sie bereits eine Preisliste in Excel, exportieren Sie sie als CSV und importieren Sie sie: Die Spalten Beschreibung, Einheit und Preis werden automatisch erkannt. Der Export des Katalogs liefert jederzeit eine aktuelle Datei, zum Beispiel für die jährliche Preisrevision.',
          'Mit der Bexio-Integration (ab dem Abo Team) lassen sich auch die Positionen Ihres Bexio-Katalogs übernehmen.',
        ],
      },
    ],
    faq: [
      { q: 'Verwaltet der Katalog einen Lagerbestand?', a: 'Nein. Er ist eine Bibliothek von Positionen und Preisen, keine Lagerverwaltung.' },
      { q: 'Ändert eine geänderte Position meine alten Offerten?', a: 'Nein, nur die nächsten.' },
      { q: 'Kann ich eine Position löschen?', a: 'Ja, jederzeit im Katalog.' },
    ],
  },
  'equipe-modules': {
    sections: [
      {
        title: 'Jemanden einladen',
        paragraphs: [
          'Kopieren Sie unter Konto → Team den Einladungslink und senden Sie ihn Ihrem Kollegen (E-Mail, SMS, WhatsApp). Wer sich mit diesem Link registriert, tritt direkt Ihrem Unternehmen bei. Danach wählen Sie seine Rolle: Er sieht nur, was diese Rolle erlaubt.',
          'Die Anzahl Mitglieder hängt vom Abo ab: bis 3 mit Essentiel, 10 mit Team, 25 mit Entreprise. Darüber passt sich das Angebot Sur mesure Ihrer Grösse an.',
        ],
      },
      {
        title: 'Die Module wählen',
        paragraphs: [
          'Konto → Module regelt die Bereiche, die das ganze Team sieht. Die Werkzeuge einer Baustelle (Dokumente, Fotos, Aufmass, Subunternehmer, Rentabilität) werden separat in den Einstellungen jeder Baustelle gewählt. Ein kleines Unternehmen kann die App so sehr einfach halten und nach und nach ergänzen.',
        ],
      },
    ],
    faq: [
      { q: 'Behält ein ausgetretenes Mitglied den Zugang?', a: 'Nein, entfernen Sie es unter Konto → Team, dann hat es keinen Zugang mehr. Die Dokumente, die es erstellt hat, bleiben im Unternehmen.' },
      { q: 'Kann ich eigene Rollen erstellen?', a: 'Ja, mit frei gewählten Rechten. Das Abo Essentiel umfasst zwei, Team und Entreprise sind unbegrenzt.' },
      { q: 'Kostet ein Modul extra?', a: 'Nein, die Module Ihres Abos sind im Preis inbegriffen.' },
    ],
  },
  'personnalisation-abonnement': {
    sections: [
      {
        title: 'Die drei Abos im Überblick',
        paragraphs: [
          'Essentiel (CHF 39.– pro Monat): unbegrenzt Offerten, Rechnungen und Berichte, QR-Rechnung, Buchhaltung und MWST, bis 3 Mitglieder und 5 GB. Team (CHF 79.–): Planung, Rentabilität, Liquidität, Löhne, Bexio, Dokumente in der Sprache des Kunden, bis 10 Mitglieder und 15 GB. Entreprise (CHF 129.–): Verkaufsverfolgung, automatische Offert-Erinnerungen, bis 25 Mitglieder und 40 GB. Jährliche Zahlung kostet 20 % weniger.',
          'Sie können das Abo jederzeit unter Konto → Abonnement wechseln. Der Wechsel auf ein höheres Abo gilt sofort.',
        ],
      },
      {
        title: 'Testphase und Kündigung',
        paragraphs: [
          'Die Testphase dauert 14 Tage mit allen Funktionen des gewählten Abos. Während der Testphase wird nichts belastet, und Sie können vor dem Ende online kündigen, ohne etwas zu bezahlen. Danach beginnt das Abo und wird im selben Bildschirm verwaltet, Rechnungen inbegriffen.',
        ],
      },
    ],
    faq: [
      { q: 'Sind die Preise inklusive MWST?', a: 'Massgebend sind die Preise auf der Seite Preise. Ihre Stripe-Rechnung zeigt den Betrag im Detail.' },
      { q: 'Kann ich meine Daten vor dem Austritt mitnehmen?', a: 'Ihre Offerten und Rechnungen existieren als PDF, und die Listen lassen sich exportieren. Für alles Weitere schreiben Sie an info@cantia.ch.' },
      { q: 'Ich habe einen persönlichen Code erhalten, wo gebe ich ihn ein?', a: 'Auf dem Bildschirm zur Wahl des Abos, über «Haben Sie einen persönlichen Plan?».' },
    ],
  },
  'tableau-de-bord': {
    sections: [
      {
        title: 'Was man jeden Morgen anschaut',
        paragraphs: [
          'Die Startseite beantwortet drei Fragen: Was wartet auf eine Antwort (versendete Offerten), was muss hereinkommen (offene und überfällige Rechnungen) und wie stehen die laufenden Baustellen. Jede Kennzahl öffnet die entsprechende, bereits gefilterte Liste.',
          'Eine überfällige Rechnung fällt sofort auf, mit Betrag und Anzahl Tagen Verzug. Oft ist das der Moment für eine Erinnerung, direkt aus der Rechnung.',
        ],
      },
      {
        title: 'Auf dem Telefon',
        paragraphs: [
          'Auf dem Telefon wird die Startseite einspaltig, mit den Kurzbefehlen oben. Mit der Mikrofon-Schaltfläche unten am Bildschirm erfassen Sie Stunden oder eine Ausgabe per Sprache, ohne die Startseite zu verlassen.',
          'Die Benachrichtigungen (Glocke oben) zeigen, was eben passiert ist: eine unterschriebene Offerte, eine E-Mail eines Kunden, eine Rechnung, die überfällig wird. Sie werden unter Konto → Benachrichtigungen eingestellt.',
        ],
      },
    ],
    faq: [
      { q: 'Warum sehe ich die Beträge nicht?', a: 'Die Finanzzahlen hängen von Ihrer Rolle ab. Ein Administrator kann Ihnen den Zugang geben.' },
      { q: 'Sind die Kennzahlen aktuell?', a: 'Ja, sie werden bei jedem Öffnen aus Ihren Dokumenten berechnet.' },
      { q: 'Kann ich Benachrichtigungen per E-Mail erhalten?', a: 'Ja, Typ für Typ, unter Konto → Benachrichtigungen.' },
    ],
  },
  'rejoindre-organisation': {
    sections: [
      {
        title: 'Mit einem Einladungslink',
        paragraphs: [
          'Öffnen Sie den erhaltenen Link, erstellen Sie Ihr Konto mit Ihrer E-Mail-Adresse, und Sie landen direkt im Unternehmen. Es gibt weder ein Abo zu wählen noch etwas zu bezahlen: Das Abo des Unternehmens deckt Sie ab.',
          'Funktioniert der Link nicht mehr, verlangen Sie beim Administrator einen neuen: Er kopiert ihn unter Konto → Team.',
        ],
      },
      {
        title: 'Ohne Link',
        paragraphs: [
          'Wählen Sie bei der Registrierung, einem bestehenden Unternehmen beizutreten, und suchen Sie es nach Namen. Der Administrator erhält eine Benachrichtigung, nimmt die Anfrage an oder lehnt sie ab, und Sie werden informiert, sobald er geantwortet hat. Bis dahin ist nichts vom Unternehmen sichtbar.',
        ],
      },
    ],
    faq: [
      { q: 'Muss mein Chef für mich bezahlen?', a: 'Ihr Zugang ist Teil des Abos des Unternehmens, im Rahmen der Mitgliederzahl seines Abos.' },
      { q: 'Ich bin im falschen Unternehmen, was nun?', a: 'Bitten Sie den Administrator dieses Unternehmens, Sie zu entfernen, und treten Sie dem richtigen bei.' },
      { q: 'Was sieht das Unternehmen von meinem Konto?', a: 'Ihren Namen, Ihre E-Mail und was Sie für das Unternehmen erfassen: Stunden, Spesen, Baustellennachrichten.' },
    ],
  },
  'dictee-vocale': {
    sections: [
      {
        title: 'Gut diktieren',
        paragraphs: [
          'Sprechen Sie wie mit einem Kollegen, ohne Satzzeichen zu diktieren. Für eine Offertposition nennen Sie Arbeit, Menge, Einheit und Preis im selben Satz. Für Stunden nennen Sie Baustelle oder Kunde, die Zeiten und was gemacht wurde.',
          'Die Spracheingabe funktioniert auf Deutsch, Französisch und Italienisch und erkennt die Sprache selbst. Bei Baulärm hilft es, das Telefon näher zu halten.',
        ],
      },
      {
        title: 'Nichts wird ohne Sie gespeichert',
        paragraphs: [
          "Der Assistent zeigt immer, was er verstanden hat, bevor er speichert: Baustelle, Stunden, Betrag, Kategorie. Sie korrigieren von Hand oder diktieren neu. Die Nutzungen des KI-Assistenten werden pro Monat gezählt: 150 mit Essentiel, 600 mit Team, 2'000 mit Entreprise.",
        ],
      },
    ],
    faq: [
      { q: 'Werden meine Aufnahmen gespeichert?', a: 'Nein. Die Aufnahme dient der Transkription, danach wird die temporäre Datei gelöscht. Nur der Text bleibt.' },
      { q: 'Braucht es eine Verbindung?', a: 'Ja, beim Diktieren, denn die Transkription erfolgt auf sicheren Servern.' },
      { q: 'Versteht es Schweizerdeutsch?', a: 'Am besten sprechen Sie Hochdeutsch. Fachbegriffe des Baus und Zahlen werden gut erkannt.' },
    ],
  },
  'chantiers-documents': {
    sections: [
      {
        title: 'Eine Ordnung, die hält',
        paragraphs: [
          'Legen Sie auf jeder Baustelle dieselben Ordner an (Pläne, Bewilligungen, Verträge, Lieferanten, Abnahmefotos): Das ganze Team weiss, wo es suchen muss, und eine Baustelle, die zwei Jahre später wieder aufgenommen wird, ist in wenigen Minuten verständlich.',
          'Pläne lassen sich auf der Baustelle auf Telefon oder Tablet ansehen, ohne jede neue Version auszudrucken. Behalten Sie die alte Version in einem Unterordner, statt sie zu überschreiben, damit klar ist, auf welcher Grundlage gearbeitet wurde.',
        ],
      },
      {
        title: 'Speicherplatz',
        paragraphs: [
          'Jedes Abo hat seinen Platz: 5 GB mit Essentiel, 15 GB mit Team, 40 GB mit Entreprise. Konto → Speicher zeigt nach Dateityp, was Platz braucht. Die Dateien werden in der Schweiz gespeichert.',
        ],
      },
    ],
    faq: [
      { q: 'Kann ich ein Dokument mit dem Kunden teilen?', a: 'Offerten, Rechnungen und Zusatzarbeiten werden über das Kundenportal geteilt. Andere Dokumente laden Sie herunter und leiten sie weiter.' },
      { q: 'Welche Dateien sind möglich?', a: 'Unter anderem PDF, Bilder und Office-Dateien. Die gängigsten öffnen sich in der Vorschau.' },
      { q: 'Was passiert beim Löschen der Baustelle?', a: 'Ihre Dokumente und Fotos werden mit ihr gelöscht. Offerten und Rechnungen bleiben erhalten.' },
    ],
  },
  'chantiers-sous-traitants': {
    sections: [
      {
        title: 'Verfolgen, was vergeben ist',
        paragraphs: [
          'Auf der Baustelle listet der Reiter Subunternehmer die beteiligten Firmen mit ihren Rechnungen und dem, was noch zu bezahlen ist. Am Ende der Baustelle wissen Sie genau, was die Vergabe gekostet hat, ohne die Ordner durchzugehen.',
          'Erfassen Sie jede erhaltene Rechnung sofort mit ihrer Fälligkeit: Sie erscheint in der Liquiditätsprognose, was böse Überraschungen am Monatsende vermeidet.',
        ],
      },
      {
        title: 'Warum es für die Marge zählt',
        paragraphs: [
          'Eine Vergabe macht oft einen grossen Teil der Kosten einer Baustelle aus. Wird sie nicht gezählt, ist die angezeigte Marge zu schön. Mit der Verknüpfung zur Baustelle zeigt der Reiter Rentabilität eine realistische Marge, die Sie mit der geplanten vergleichen können.',
          'Bewahren Sie bei vergebenen Arbeiten auch den Vertrag oder die Offerte des Subunternehmers in den Dokumenten der Baustelle auf: Das ist die Grundlage bei Uneinigkeit über den Umfang.',
        ],
      },
    ],
    faq: [
      { q: 'Muss ich einen Subunternehmer auf jeder Baustelle neu erfassen?', a: 'Nein, im Verzeichnis der Subunternehmer wählen Sie ihn mit wenigen Klicks.' },
      { q: 'Hat der Subunternehmer Zugang zu Cantia?', a: 'Nein, er erscheint als Kontakt. Er hat kein Konto in Ihrem Unternehmen.' },
      { q: 'Wo aktiviere ich diesen Reiter?', a: 'In den Einstellungen der Baustelle.' },
    ],
  },
  'travaux-supplementaires': {
    sections: [
      {
        title: 'Der richtige Reflex vor Ort',
        paragraphs: [
          'Der Kunde wünscht eine Änderung, während Sie auf der Baustelle sind: Erstellen Sie die Zusatzarbeit sofort auf dem Telefon, diktieren Sie Beschreibung und Preis und senden Sie sie. Der Kunde unterschreibt noch am selben Tag online, bevor die Arbeit ausgeführt wird. Keine Diskussion drei Monate später darüber, was gesagt wurde.',
        ],
      },
      {
        title: 'Verfolgung und Fakturierung',
        paragraphs: [
          'Jede Zusatzarbeit behält Datum, Unterschrift und Status. Angenommen, wird sie zur Rechnung oder fliesst in die Schlussrechnung der Baustelle ein. Die Liste der Zusatzarbeiten der Baustelle zeigt, was unterschrieben, offen oder abgelehnt ist.',
          'Halten Sie auch kleine Extras fest: Am Ende einer Baustelle sind es oft mehrere kleine Arbeiten, die zusammen einen spürbaren Betrag ausmachen.',
        ],
      },
    ],
    faq: [
      { q: 'Braucht es eine ursprüngliche Offerte?', a: 'Nein, eine Zusatzarbeit kann mit der ursprünglichen Offerte verknüpft oder allein auf der Baustelle erstellt werden.' },
      { q: 'Muss der Kunde ein Konto erstellen, um zu unterschreiben?', a: 'Nein, er unterschreibt über den Link aus der E-Mail, nach Bestätigung seiner Adresse.' },
      { q: 'Wird die Marge der Baustelle aktualisiert?', a: 'Ja, eine angenommene Zusatzarbeit erhöht den offerierten Betrag der Baustelle.' },
    ],
  },
  'rh-heures-salaires': {
    sections: [
      {
        title: 'Die Löhne einrichten',
        paragraphs: [
          'Erfassen Sie für jeden Mitarbeiter in seiner Kartei den Lohn (Monats- oder Stundenlohn), die Beitragssätze und gegebenenfalls den Quellensteuersatz. Die vorgeschlagenen Werte sind Richtwerte: Übernehmen Sie die Ihrer Ausgleichskasse, Ihrer Pensionskasse und Ihres Unfallversicherers.',
          'Bei Stundenlohn ohne feste Ferien kommt die Ferienentschädigung (8,33 % für 4 Wochen, 10,64 % für 5 Wochen) auf die Abrechnung. Der 13. Monatslohn wird ebenfalls pro Mitarbeiter eingestellt.',
        ],
      },
      {
        title: 'Jeden Monat',
        paragraphs: [
          'Prüfen Sie am Monatsende die Stunden und erstellen Sie die Abrechnungen: Cantia rechnet mit den erfassten Stunden und Spesen vom Brutto- zum Nettolohn. Jeder Mitarbeiter erhält seine Abrechnung und findet sie in seinem Bereich. Die Lohnbuchung kann für die Buchhaltung erstellt werden, und der jährliche Lohnausweis wird aus denselben Daten vorbereitet.',
        ],
      },
    ],
    faq: [
      { q: 'Welches Abo braucht es?', a: 'Die Löhne sind ab dem Abo Team enthalten.' },
      { q: 'Sind die Sätze aktuell?', a: 'Die gesetzlichen Grundsätze sind vorausgefüllt, prüfen Sie aber immer die Ihrer Kassen und Ihres Kantons.' },
      { q: 'Kann meine Treuhand die Löhne sehen?', a: 'Ja, wenn Sie ihr unter Konto → Treuhand Zugang geben.' },
    ],
  },
  'rh-heures-guide': {
    sections: [
      {
        title: 'Die guten Gewohnheiten',
        paragraphs: [
          'Am zuverlässigsten ist es, jeden Tag am Abend von der Baustelle aus zu erfassen. Eine am Freitag rekonstruierte Woche vergisst immer etwas. Die Art der Arbeit (Montage, Transport, Reinigung…) wird bei jedem Eintrag gewählt und erlaubt danach die Fakturierung nach Kategorie.',
          'Die Spesen des Tages (Mahlzeiten, Kilometer) kommen in denselben Eintrag, das vermeidet verlorene Quittungen am Monatsende.',
        ],
      },
      {
        title: 'Von der Zeiterfassung zur Rechnung',
        paragraphs: [
          'Für eine Baustelle in Regie zeigt der Reiter Fakturierung unter Personal → Stunden die noch nicht verrechneten Stunden nach Baustelle und Art. Die erstellte Rechnung übernimmt Stunden und Ansätze, und verrechnete Stunden erscheinen nicht mehr. Bei einer Pauschalbaustelle dienen dieselben Stunden der Rentabilitätsberechnung.',
        ],
      },
    ],
    faq: [
      { q: 'Kann ein Mitarbeiter seine Stunden korrigieren?', a: 'Ja, in seinem Stundenblatt, indem er den Eintrag öffnet.' },
      { q: 'Kann man für jemand anderen erfassen?', a: 'Eine verantwortliche Person mit der passenden Rolle kann die Stunden eines Teammitglieds erfassen.' },
      { q: 'Was enthält der CSV-Export?', a: 'Die Stunden des angezeigten Zeitraums, mit Datum, Person, Baustelle und Art der Arbeit.' },
    ],
  },
  tresorerie: {
    sections: [
      {
        title: 'Die Kurve lesen',
        paragraphs: [
          'Die Kurve beginnt beim erfassten Saldo, addiert die erwarteten Kundenrechnungen zu ihrer Fälligkeit und zieht die Löhne am Zahltag, die Rechnungen der Subunternehmer und die wiederkehrenden Ausgaben ab. Der tiefste Punkt der 90 Tage ist der, den Sie im Auge behalten sollten.',
          'Eine überfällige Kundenrechnung bleibt in der Prognose, wird aber markiert: Hängt das Tief von ihr ab, ist sie zuerst zu mahnen.',
        ],
      },
      {
        title: 'In zwei Minuten aktualisieren',
        paragraphs: [
          'Aktualisieren Sie einmal pro Woche den Banksaldo und prüfen Sie die erhaltenen Zahlungen (der Import eines camt-Auszugs ordnet sie auf einmal zu). Die Prognose bleibt so zuverlässig, ohne mehr Zeit zu kosten.',
        ],
      },
    ],
    faq: [
      { q: 'Welches Abo braucht es?', a: 'Die Liquidität ist ab dem Abo Team enthalten.' },
      { q: 'Greift Cantia auf mein Bankkonto zu?', a: 'Nein. Der Saldo wird von Hand erfasst, und der Kontoauszug ist eine Datei, die Sie selbst hochladen.' },
      { q: 'Zählen einmalige Einkäufe?', a: 'Nein, die Prognose berücksichtigt nur Wiederkehrendes und Erwartetes. Einmalige Einkäufe erscheinen unter Ausgaben.' },
    ],
  },
  depenses: {
    sections: [
      {
        title: 'Eine Quittung scannen',
        paragraphs: [
          'Fotografieren Sie die Quittung oder die Lieferantenrechnung: Lieferant, Datum und Betrag werden automatisch gelesen. Prüfen Sie, wählen Sie die Baustelle, wenn der Einkauf sie betrifft, und speichern Sie. Das Foto bleibt als Beleg bei der Ausgabe.',
          'Per Sprache erfasste Ausgaben landen am selben Ort. Ein kurzer Blick in die Liste am Ende der Woche genügt, um zu prüfen, dass jeder Einkauf bei der richtigen Baustelle ist.',
        ],
      },
      {
        title: 'Für die Buchhaltung',
        paragraphs: [
          'Die Filter nach Zeitraum und Baustelle liefern sofort ein Total, zum Beispiel für die MWST des Quartals. Ihre Treuhand kann auf die Belege zugreifen, wenn Sie ihr unter Konto → Treuhand Zugang geben, ohne Ordner zu verschicken.',
        ],
      },
    ],
    faq: [
      { q: 'Kann eine Ausgabe die Baustelle wechseln?', a: 'Ja, indem Sie sie in der Rentabilität der Baustelle bearbeiten.' },
      { q: 'Was tun bei einer unleserlichen Quittung?', a: 'Erfassen Sie Betrag und Lieferant von Hand, das Foto bleibt als Beleg.' },
      { q: 'Wiederholen sich wiederkehrende Ausgaben selbst?', a: 'Ja, mit einer Erinnerung vor jeder Fälligkeit.' },
    ],
  },
  clients: {
    sections: [
      {
        title: 'Eine gut ausgefüllte Kartei',
        paragraphs: [
          'Erfassen Sie die genaue Rechnungsadresse, die E-Mail, die die Dokumente erhält, und die Sprache des Kunden. Diese Angaben stehen auf jeder Offerte und Rechnung, und die E-Mail sichert auch den Zugang zum Kundenportal.',
          'Für eine Verwaltung oder ein Unternehmen führen Sie eine einzige Kartei pro Firma und geben die Baustellenadresse auf jeder Baustelle an, statt einen Kunden pro Gebäude anzulegen.',
        ],
      },
      {
        title: 'Den Verlauf wiederfinden',
        paragraphs: [
          'Die Kartei bündelt alle Dokumente des Kunden, von der ersten Offerte bis zur letzten Rechnung, mit ihrem Status. Bevor Sie einen Kunden anrufen, genügt ein Blick, um zu wissen, was läuft, was angenommen wurde und was noch offen ist.',
          'Bestehende Kunden importieren Sie aus einer Excel- oder CSV-Datei (Konto → Datenimport) oder aus Bexio, wenn Sie die Integration nutzen.',
        ],
      },
    ],
    faq: [
      { q: 'Wie vermeide ich Doppel?', a: 'Suchen Sie den Kunden, bevor Sie einen neuen erstellen: Bei der Offerte schlägt Cantia die bestehenden Karteien vor.' },
      { q: 'Sieht der Kunde seine Kartei?', a: 'Nein, er sieht nur die Dokumente, die Sie ihm über das Kundenportal senden.' },
      { q: 'Privatperson und Firma, ist das gleich?', a: 'Ja, eine Kundenkartei dient beiden. Geben Sie einfach den Firmennamen an, wenn es einen gibt.' },
    ],
  },
  'sous-traitants': {
    sections: [
      {
        title: 'Das eigene Netzwerk aufbauen',
        paragraphs: [
          'Erfassen Sie jeden Subunternehmer einmal: Firmenname, Kontaktperson, Telefon, E-Mail, Gewerk. Das Verzeichnis wird zu Ihrem Adressbuch der Partner, vom ganzen Team geteilt, statt auf verschiedene Telefone verteilt.',
          'Das Gewerk hilft, schnell einen verfügbaren Elektriker oder Spengler zu finden, wenn eine Baustelle ihn braucht.',
        ],
      },
      {
        title: 'Rechnungen und Zahlungen',
        paragraphs: [
          'Jede erhaltene Rechnung wird mit Betrag, Fälligkeit und Status erfasst. Der Betrag, der jedem Subunternehmer noch zusteht, ist auf einen Blick sichtbar, Baustelle für Baustelle. Die offenen Beträge erscheinen auch in der Liquiditätsprognose.',
          'Bewahren Sie bei grösseren Losen Offerte und Vertrag des Subunternehmers in den Dokumenten der Baustelle auf, neben seinen Rechnungen.',
        ],
      },
    ],
    faq: [
      { q: 'Wo aktiviere ich das Modul?', a: 'Unter Konto → Module.' },
      { q: 'Sehe ich alles, was ich einem Subunternehmer bezahlt habe?', a: 'Ja, seine Kartei bündelt seine Rechnungen über alle Baustellen.' },
      { q: 'Erhält der Subunternehmer einen Zugang?', a: 'Nein, er ist ein Kontakt in Ihrem Verzeichnis, ohne Cantia-Konto.' },
    ],
  },
  'integration-bexio': {
    sections: [
      {
        title: 'Bexio verbinden',
        paragraphs: [
          'Wählen Sie unter Konto → Integrationen Bexio und melden Sie sich wie gewohnt bei Bexio an. Sie erlauben Cantia, die nötigen Daten auszutauschen; Cantia sieht Ihr Passwort nie. Die Verbindung dauert eine Minute.',
          'Kunden fliessen in beide Richtungen: Ein in Bexio erstellter Kunde kommt in Cantia an, ein in Cantia erstellter Kunde geht nach Bexio, mit regelmässiger Synchronisierung.',
        ],
      },
      {
        title: 'Eine klare Aufteilung',
        paragraphs: [
          'Cantia bleibt das Werkzeug für Baustelle und Dokumente (Offerten, Baustellen, Stunden, Rechnungen), Bexio das für die Buchhaltung. Jede gesendete Rechnung kommt in Bexio als Entwurf an: Ihre Treuhand oder Sie geben sie frei, damit nicht zwei Personen dasselbe verbuchen.',
        ],
      },
    ],
    faq: [
      { q: 'Welches Abo braucht es?', a: 'Die Bexio-Integration ist ab dem Abo Team enthalten.' },
      { q: 'Braucht es ein bestimmtes Bexio-Abo?', a: 'Es braucht ein Bexio-Konto mit Zugang zur API. Die aktuellen Bexio-Abos erlauben das in der Regel, prüfen Sie Ihres.' },
      { q: 'Was passiert beim Trennen?', a: 'Der Austausch stoppt sofort. Die bereits vorhandenen Daten bleiben auf beiden Seiten.' },
    ],
  },
  'relances-impayes': {
    sections: [
      {
        title: 'Eine Erinnerung senden',
        paragraphs: [
          'Bei einer überfälligen Rechnung sendet die Schaltfläche «Erinnerung senden» dem Kunden den vorgesehenen Mahntext, mit der Rechnung und dem sicheren Link. Die Texte vor und nach der Fälligkeit werden einmal unter Konto → E-Mails eingestellt, Kundenname und Betrag werden automatisch ausgefüllt.',
          'Jede gesendete Erinnerung erscheint im Bereich E-Mails mit ihrem Datum: Sie wissen, wer wann gemahnt wurde.',
        ],
      },
      {
        title: 'Wenn der Kunde trotzdem nicht zahlt',
        paragraphs: [
          'Nach zwei Erinnerungen ohne Antwort löst ein Anruf die Lage oft. Bewegt sich nichts, bleibt die Betreibung möglich; der Cantia-Blog erklärt die Schritte. Die datierten Erinnerungen in Cantia helfen zu zeigen, dass der Kunde gewarnt wurde.',
        ],
      },
    ],
    faq: [
      { q: 'Kann ich den Text der Erinnerung ändern?', a: 'Ja, unter Konto → E-Mails und vor jedem Versand.' },
      { q: 'Rechnet Cantia Verzugszinsen dazu?', a: 'Nein, das entscheiden Sie. Das kostenlose Werkzeug für Verzugszinsen berechnet den Betrag.' },
      { q: 'Wie vermeide ich, einen Kunden zu mahnen, der bezahlt hat?', a: 'Ordnen Sie die Zahlungen vor dem Mahnen zu, über die QR-Referenz oder den Import des Kontoauszugs.' },
    ],
  },
  'import-releve-bancaire': {
    sections: [
      {
        title: 'Die Datei beschaffen',
        paragraphs: [
          'Suchen Sie im E-Banking den Export des Kontoauszugs im Format camt.053 (manchmal «ISO-20022-Auszug» oder «XML» genannt). Wählen Sie den Zeitraum seit dem letzten Import, laden Sie die Datei herunter und importieren Sie sie in Cantia.',
          'Laden Sie eine bereits importierte Datei, weist Cantia Sie darauf hin, damit dieselben Zahlungen nicht zweimal verarbeitet werden.',
        ],
      },
      {
        title: 'Prüfen und bestätigen',
        paragraphs: [
          'Cantia zeigt jede Zahlung mit der vorgeschlagenen Rechnung. Exakte Treffer sind bereits angehakt; die über Namensähnlichkeit vorgeschlagenen warten auf Ihre Prüfung. Mit der Bestätigung wechseln die Rechnungen auf Bezahlt oder Teilweise bezahlt, und die Liquidität wird aktualisiert.',
          'Ausgehende Zahlungen und Eingänge ohne Rechnung bleiben separat: Sie können sie mit einer bereits erfassten Ausgabe oder einem Lohn verknüpfen oder ignorieren.',
        ],
      },
    ],
    faq: [
      { q: 'Welche Banken sind kompatibel?', a: 'Jede Schweizer Bank, die einen camt.053-Auszug exportiert, was bei den wichtigsten der Fall ist.' },
      { q: 'Verbindet sich Cantia mit meiner Bank?', a: 'Nein, Sie laden selbst eine Datei hoch. Es wird kein Zugang zu Ihrem Konto gegeben.' },
      { q: 'Und wenn ein Kunde zwei Rechnungen auf einmal bezahlt?', a: 'Prüfen Sie den Vorschlag und verteilen Sie die Zahlung auf die betroffenen Rechnungen.' },
    ],
  },
  'portail-client': {
    sections: [
      {
        title: 'Was der Kunde erlebt',
        paragraphs: [
          'Der Kunde erhält eine E-Mail mit Ihrem Text, dem PDF und einer Schaltfläche zum Öffnen des Dokuments. Er bestätigt seine E-Mail-Adresse mit einem erhaltenen Code und sieht dann das Dokument in Ihren Farben: Positionen, Summen, Bedingungen. Bei einer Offerte unterschreibt er unten auf der Seite, ohne etwas zu installieren.',
          'Die Seite funktioniert auf dem Telefon ebenso wie auf dem Computer.',
        ],
      },
      {
        title: 'Was Sie sehen',
        paragraphs: [
          'Sobald der Kunde unterschreibt, wechselt das Dokument in Cantia auf Angenommen, und Sie erhalten eine Benachrichtigung. Unterschrift, Datum und Uhrzeit werden mit dem Dokument gespeichert. Mit dem Abo Entreprise sehen Sie zudem, wann der Kunde die Offerte angesehen hat, was hilft, den richtigen Moment für einen Anruf zu wählen.',
        ],
      },
    ],
    faq: [
      { q: 'Kann der Kunde ablehnen?', a: 'Ja, er kann die Offerte im Portal ablehnen. Sie werden benachrichtigt.' },
      { q: 'Hat eine Online-Unterschrift einen Wert?', a: 'Sie belegt die Zustimmung des Kunden mit Datum und Uhrzeit. Für besondere Fälle fragen Sie eine Fachperson für Recht.' },
      { q: 'Was passiert, wenn der Link weitergeleitet wird?', a: 'Ohne Zugang zur E-Mail-Adresse des Kunden kann der Code nicht empfangen werden, und das Dokument öffnet sich nicht.' },
    ],
  },
};
