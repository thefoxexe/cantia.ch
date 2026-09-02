import type { TradeLandingPage } from './tradeLandingPages';

export const TRADE_PAGES_DE: Record<string, TradeLandingPage> = {
  charpentier: {
    slug: 'charpentier',
    tradeName: 'Zimmerleute',
    seo: {
      title: 'Verwaltungssoftware für Zimmereien in der Schweiz | Cantia',
      description:
        'Verwalten Sie Offerten, Baustellen, Teams, Stunden und Rechnungen mit Cantia, der Verwaltungssoftware für Zimmereien in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Zimmerleute',
      title: 'Die Software, die Ihre Offerten, Ihre Werkstatt und Ihre Baustellen verbindet',
      subtitle:
        'Cantia hilft Zimmereien, Offerten, Teams, Montagestunden, Baustellenfotos und die Rechnungsstellung von einem einzigen Werkzeug aus zu verwalten.',
    },
    painPoints: [
      {
        problem: 'Die Offerte wartet oft bis zum Feierabend',
        consequence: 'Bis die Leistungen und Preise abends ins Reine geschrieben sind, hat der Kunde manchmal schon eine andere Offerte in der Hand.',
        response: 'Erstellen Sie Ihre Offerte direkt von der Baustelle aus, mit einem Katalog bereits kalkulierter Zimmerei-Leistungen.',
      },
      {
        problem: 'Werkstatt und Baustelle arbeiten nicht immer mit denselben Informationen',
        consequence: 'Pläne, Fotos und Änderungen bleiben teils auf der einen Seite hängen, was Anrufe auslöst und beiden Teams Zeit kostet.',
        response: 'Jede Baustelle bündelt ihre Fotos, Bemerkungen und Dokumente, einsehbar für das ganze Team in Echtzeit.',
      },
      {
        problem: 'Die Montagestunden können schnell an der Marge nagen',
        consequence: 'Die Überschreitung zeigt sich oft erst bei der Rechnungsstellung, wenn die Baustelle bereits abgeschlossen ist.',
        response: 'Verknüpfen Sie die Stunden mit der Baustelle und vergleichen Sie live das Geplante mit dem tatsächlich Benötigten.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Schnelle Offerten aus dem Aufmass', text: 'Kalkulieren Sie eine Zimmerkonstruktion anhand Ihres Aufmasses, mit bereits hinterlegten Leistungen und Preisen.' },
      { icon: 'clock', title: 'Erfassung der Montagestunden', text: 'Jede Teamstunde der richtigen Baustelle zugeordnet, live mit dem Offerierten verglichen.' },
      { icon: 'image', title: 'Vorher-/Nachher-Fotos', text: 'Dokumentieren Sie jeden Montageschritt, einsehbar von der Werkstatt wie von der Baustelle aus.' },
      { icon: 'calendar', title: 'Planung Werkstatt + Baustelle', text: 'Koordinieren Sie die Vorbereitung in der Werkstatt und die Montage vor Ort in einer einzigen Planung.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Eine vor Ort verlangte Anpassung wird direkt der Baustelle hinzugefügt, mit Foto und Bemerkung.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Ist die Baustelle abgeschlossen, wird die Rechnung aus der Offerte erstellt, ohne erneute Erfassung.' },
    ],
    scenario: {
      title: 'Beispiel: Sanierung einer bestehenden Dachkonstruktion',
      text: 'Nach der Besichtigung legen Sie den Kunden an und erstellen die Offerte. Sobald die Baustelle angenommen ist, planen Sie das Team ein. Fotos und Bemerkungen bleiben mit dem Projekt verknüpft. Verlangt der Kunde einen zusätzlichen Einsatz, wird dieser direkt erfasst. Am Ende stehen die nötigen Informationen bereits zur Verfügung, um die Rechnung zu erstellen.',
    },
    comparison: [
      { before: 'Offerte abends auf einer Ecke des Tisches neu erstellt', after: 'Offerte direkt von der Baustelle aus erstellt' },
      { before: 'Pläne und Fotos zwischen Werkstatt und Baustelle verstreut', after: 'Alles pro Baustelle zentralisiert' },
      { before: 'Montagestunden nicht erfasst', after: 'Stunden jeder Baustelle zugeordnet' },
      { before: 'Änderungen während der Arbeiten vergessen', after: 'Zusatzarbeiten live hinzugefügt' },
      { before: 'Rechnung mehrere Tage nach der Montage verschickt', after: 'Rechnung aus der Offerte erstellt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für eine kleine Zimmerei?',
        answer: 'Ja. Der Essentiel-Plan deckt Offerten, Baustellen und Rechnungsstellung für ein Unternehmen ab, das startet oder mit einem kleinen Team arbeitet, ohne die HR-/Planungsmodule, die erst ab mehreren Mitarbeitenden sinnvoll sind.',
      },
      {
        question: 'Kann ich die Stunden meiner Monteure pro Baustelle erfassen?',
        answer: 'Ja, jede erfasste Stunde wird einer bestimmten Baustelle zugeordnet, was den Vergleich zwischen geplanter und tatsächlich für die Montage aufgewendeter Zeit ermöglicht.',
      },
      {
        question: 'Können Fotos direkt von der Baustelle hinzugefügt werden?',
        answer: 'Ja, direkt vom Smartphone oder Tablet vor Ort. Sie werden automatisch nach Baustelle sortiert und können geolokalisiert werden.',
      },
      {
        question: 'Lassen sich mit Cantia Offerten für Zimmerarbeiten erstellen?',
        answer: 'Ja, mit einem wiederverwendbaren Leistungskatalog (Holz, Verbindungen, zugehörige Eindeckung) und einer automatischen Berechnung von MWST und Summen.',
      },
      {
        question: 'Kann ich Cantia zusammen mit Bexio nutzen?',
        answer: 'Ja, die native Integration synchronisiert Kunden, Rechnungen und Zahlungen zwischen Cantia und Bexio, ab dem Team-Plan.',
      },
    ],
    relatedTrades: ['menuisier', 'macon'],
  },

  macon: {
    slug: 'macon',
    tradeName: 'Maurer',
    seo: {
      title: 'Verwaltungssoftware für Maurerbetriebe in der Schweiz | Cantia',
      description:
        'Behalten Sie Teams, Stunden und die tatsächliche Rentabilität Ihrer Baustellen im Blick – mit Cantia, der Verwaltungssoftware für Maurerbetriebe in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Maurer',
      title: 'Weniger Papier. Mehr Überblick über Ihre Baustellen.',
      subtitle:
        'Cantia hilft Maurerbetrieben, ihre Teams, Stunden, Zusatzarbeiten und die tatsächliche Rentabilität jeder Baustelle zu verfolgen.',
    },
    painPoints: [
      {
        problem: 'Stunden und Baustellenrapporte leben auf Papier',
        consequence: 'Die Information geht verloren oder muss später erneut erfasst werden, oft aus dem Gedächtnis, mehrere Tage danach.',
        response: 'Erfassen Sie Stunden und Rapporte direkt von der Baustelle aus, mit automatisch einsortierten Fotos und Bemerkungen.',
      },
      {
        problem: 'Eine mitten in der Betonage beschlossene Zusatzarbeit landet nur im Hinterkopf',
        consequence: 'Ohne schriftliche Spur am richtigen Ort wird diese Arbeit manchmal nie fakturiert.',
        response: 'Fügen Sie die Zusatzarbeit direkt der betreffenden Baustelle hinzu, bei Bedarf mit Foto, automatisch übernommen in die Rechnungsstellung.',
      },
      {
        problem: 'Mehrere Baustellen parallel, die Rentabilität wird zu spät bekannt',
        consequence: 'Eine Baustelle kann bei Material oder Stunden aus dem Ruder laufen, ohne dass es jemand vor dem Abschluss bemerkt.',
        response: 'Vergleichen Sie live Stunden, Material und fakturierten Betrag, um eine Abweichung vor Ende der Baustelle zu erkennen.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Baustellenrapporte mit Fotos', text: 'Notizen und Fotos des Tages werden zu einem versandbereiten Rapport, pro Baustelle.' },
      { icon: 'clock', title: 'Erfassung der Teamstunden', text: 'Jeder Bauarbeiter, jede Baustelle, jede Stunde, verglichen mit dem Offerierten.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Ein unvorhergesehenes Ereignis auf der Baustelle wird direkt hinzugefügt, ohne Umweg über ein Notizheft.' },
      { icon: 'trending-up', title: 'Rentabilität pro Baustelle', text: 'Offeriert, tatsächliche Kosten und Marge sichtbar pro Baustelle, nicht erst am Monatsende.' },
      { icon: 'calendar', title: 'Planung für mehrere Baustellen', text: 'Organisieren Sie mehrere Teams auf mehreren Baustellen ohne Ressourcenkonflikt.' },
      { icon: 'credit-card', title: 'Offerten und Rechnungen', text: 'Von der Rohbau-Offerte bis zur Schlussrechnung, ohne erneute Erfassung.' },
    ],
    scenario: {
      title: 'Beispiel: eine Rohbau-Baustelle, vom Aushub bis zur Abnahme',
      text: 'Das Team wird der Baustelle über die Planung zugeteilt. Stunden und Material werden Tag für Tag erfasst. Eine unvorhergesehene Fundamentverstärkung wird als Zusatzarbeit hinzugefügt, mit einem Foto als Beleg. Die Rentabilität der Baustelle bleibt durchgehend sichtbar, nicht erst nach Versand der Rechnung.',
    },
    comparison: [
      { before: 'Stunden auf Papier notiert', after: 'Stunden der Baustelle zugeordnet' },
      { before: 'Baustellenrapport aus dem Gedächtnis rekonstruiert', after: 'Rapport aus Fotos und Notizen des Tages erstellt' },
      { before: 'Zusatzarbeiten vergessen', after: 'Arbeiten hinzugefügt und fakturiert' },
      { before: 'Rentabilität erst am Ende bekannt', after: 'Rentabilität live verfolgt' },
      { before: 'Ein Notizheft pro Baustelle', after: 'Eine zentrale Planung für alle Baustellen' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen Maurerbetrieb mit mehreren Teams?',
        answer: 'Ja, Planung und Teamrollen ermöglichen die Koordination mehrerer Teams auf mehreren Baustellen, mit einem für jedes Team passenden Zugriff.',
      },
      {
        question: 'Können Stunden pro Baustelle und pro Bauarbeiter erfasst werden?',
        answer: 'Ja, jede erfasste Stunde wird einer Baustelle und der betreffenden Person zugeordnet, was direkt in die Rentabilität der Baustelle einfliesst.',
      },
      {
        question: 'Wie fügt man eine während der Baustelle entdeckte Zusatzarbeit hinzu?',
        answer: 'Sie wird direkt von der Baustelle aus hinzugefügt, mit einer Bemerkung oder einem Foto, und durchläuft anschliessend denselben Weg wie eine Offerte bis zur Rechnungsstellung.',
      },
      {
        question: 'Lässt sich mit Cantia die Rentabilität einer Baustelle vor deren Abschluss einsehen?',
        answer: 'Ja, der Vergleich zwischen offeriertem Betrag und tatsächlichen Kosten (Stunden, Material) ist laufend verfügbar, nicht erst in der Schlussabrechnung.',
      },
      {
        question: 'Kann ich mehrere Maurer-Baustellen parallel verwalten?',
        answer: 'Ja, die Planung zentralisiert alle Ihre aktiven Baustellen und vermeidet Ressourcenkonflikte zwischen Teams.',
      },
    ],
    relatedBlogSlugs: ['calculer-prix-de-revient-chantier-batiment'],
    relatedTrades: ['charpentier', 'entreprise-generale'],
  },

  electricien: {
    slug: 'electricien',
    tradeName: 'Elektriker',
    seo: {
      title: 'Verwaltungssoftware für Elektrounternehmen in der Schweiz | Cantia',
      description:
        'Verwalten Sie Notdienst-Einsätze, Baustellen, Planung und Rechnungsstellung mit Cantia, der Verwaltungssoftware für Elektrounternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Elektriker',
      title: 'Verwalten Sie Ihre Notdienst-Einsätze und Elektro-Baustellen in einem einzigen Tool',
      subtitle:
        'Planung, Kunden, Offerten, Stunden, Rapporte und Rechnungen: Cantia bündelt die Aktivität Ihres Elektrounternehmens, ohne dass Sie mehrere Anwendungen brauchen.',
    },
    painPoints: [
      {
        problem: 'Ein Notfall bringt die ganze Tagesplanung durcheinander',
        consequence: 'Ohne gemeinsame Übersicht läuft die Umverteilung der Techniker über eine Reihe von Anrufen, mit dem Risiko, einen geplanten Termin zu vergessen.',
        response: 'Eine zentrale, für das ganze Team sichtbare Planung erlaubt es, einen Einsatz in Sekundenschnelle umzuverteilen.',
      },
      {
        problem: 'Ein Techniker kommt vor Ort an, ohne die Kundenhistorie zu kennen',
        consequence: 'Er entdeckt die Installation erst vor Ort, ohne zu wissen, was bereits gemacht oder fakturiert wurde.',
        response: 'Die Kundenhistorie (Offerten, Rechnungen, frühere Einsätze) ist bereits vor dem Klingeln vom Terrain aus zugänglich.',
      },
      {
        problem: 'Ein kleiner Einsatz wird nicht sofort fakturiert',
        consequence: 'Er landet vergessen im Verwaltungsstapel, und das entsprechende Geld kommt nie herein.',
        response: 'Fakturieren Sie direkt aus dem Einsatz heraus, mit einer schweizerischen QR-Rechnung, die noch am selben Tag versandbereit ist.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Team- und Einsatzplanung', text: 'Dringende Notdienst-Einsätze und geplante Baustellen in derselben Planung, in Echtzeit umorganisierbar.' },
      { icon: 'users', title: 'Kundenkarte mit Historie', text: 'Jeder Einsatz, jede Offerte und Rechnung eines Kunden bleibt vom Terrain aus zugänglich.' },
      { icon: 'mic', title: 'Schnelle Offerten', text: 'Kalkulieren Sie einen Einsatz oder eine kleine Elektro-Baustelle aus Ihrem Leistungskatalog heraus.' },
      { icon: 'file-text', title: 'Rapporte mit Fotos', text: 'Dokumentieren Sie eine Installation oder einen Notdienst-Einsatz mit Fotos und Bemerkungen, sortiert nach Einsatz.' },
      { icon: 'clock', title: 'Stunden pro Einsatz', text: 'Verfolgen Sie die tatsächlich für jeden Notdienst-Einsatz oder jede Baustelle aufgewendete Zeit.' },
      { icon: 'credit-card', title: 'Sofortige QR-Rechnungsstellung', text: 'QR-Rechnung aus dem Einsatz erstellt, ohne Umweg über das Büro.' },
    ],
    scenario: {
      title: 'Beispiel: ein Tag mit mehreren Einsätzen, vom Notdienst bis zur geplanten Baustelle',
      text: 'Der Tag beginnt mit einer bereits organisierten Planung. Im Laufe des Vormittags kommt ein Notfall dazu und stellt das Team um. Jeder Einsatz wird dokumentiert (Fotos, Stunden), und die Rechnung für den letzten Notdienst-Einsatz geht noch am selben Abend hinaus, direkt vom Terrain aus.',
    },
    comparison: [
      { before: 'Planung im Kopf des Chefs', after: 'Planung, die vom ganzen Team geteilt wird' },
      { before: 'Techniker ohne Kundenhistorie', after: 'Kundenhistorie vor Ort zugänglich' },
      { before: 'Rechnung erst mehrere Tage später verschickt', after: 'Rechnung aus dem Einsatz erstellt' },
      { before: 'Einsatzfotos verstreut', after: 'Fotos nach Einsatz sortiert' },
      { before: 'Stunden keinem bestimmten Einsatz zugeordnet', after: 'Stunden einsatzweise erfasst' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Elektrounternehmen mit mehreren Technikern?',
        answer: 'Ja, die Teamplanung und die individuell anpassbaren Rollen ermöglichen die Koordination mehrerer Techniker bei unterschiedlichen Einsätzen.',
      },
      {
        question: 'Lassen sich sowohl dringende Notdienst-Einsätze als auch geplante Baustellen verwalten?',
        answer: 'Ja, beide leben in derselben Planung, die sich schnell umorganisieren lässt, wenn im Tagesverlauf ein Notfall dazukommt.',
      },
      {
        question: 'Kann ein Techniker die Historie eines Kunden vom Terrain aus einsehen?',
        answer: 'Ja, die Kundenkarte (Offerten, Rechnungen, frühere Einsätze) ist vor dem Einsatz vom Smartphone oder Tablet aus zugänglich.',
      },
      {
        question: 'Lässt sich mit Cantia ein kleiner Einsatz schnell fakturieren?',
        answer: 'Ja, eine Rechnung mit schweizerischer QR-Rechnung kann direkt aus dem Einsatz heraus erstellt werden, ohne Umweg über das Büro.',
      },
      {
        question: 'Kann ich Cantia für meine Buchhaltung zusammen mit Bexio nutzen?',
        answer: 'Ja, die native Integration synchronisiert Kunden, Rechnungen und Zahlungen zwischen Cantia und Bexio, ab dem Team-Plan.',
      },
    ],
    relatedBlogSlugs: ['gestion-chantier-facturation-electricien-suisse'],
    relatedTrades: ['plombier', 'entreprise-generale'],
  },

  plombier: {
    slug: 'plombier',
    tradeName: 'Sanitärinstallateure',
    seo: {
      title: 'Verwaltungssoftware für Sanitärinstallateure in der Schweiz | Cantia',
      description:
        'Zentralisieren Sie Einsätze, Baustellen und Rechnungsstellung mit Cantia, der Verwaltungssoftware für Sanitär- und Installationsbetriebe in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Sanitärinstallateure',
      title: 'Ihre Einsätze sollten nicht auf Zetteln enden',
      subtitle:
        'Cantia zentralisiert Ihre Notdienst-Einsätze, Ihre Sanitär-Baustellen und Ihre Rechnungsstellung, vom ersten Kundenanruf bis zur Zahlung.',
    },
    painPoints: [
      {
        problem: 'Ein dringender Notdienst-Einsatz wird auf einem Zettel notiert',
        consequence: 'Zwischen der Fahrt und dem nächsten Einsatz geht die Information (Kunde, verwendetes Material, aufgewendete Zeit) verloren, bevor sie zur Rechnungsstellung gelangt.',
        response: 'Erfassen Sie jeden Einsatz direkt, mit Kunde, verwendetem Material und Stunden, gleich am Ende der Baustelle.',
      },
      {
        problem: 'Die Kundenbetreuung läuft aus dem Gedächtnis',
        consequence: 'Schwer zu erinnern, wer angerufen hat, weshalb, und ob die letzte Rechnung tatsächlich bezahlt wurde.',
        response: 'Eine zentrale Kundenhistorie (Offerten, Rechnungen, Einsätze) verhindert vergessene Nachverfolgungen und Mahnungen.',
      },
      {
        problem: 'Die Rechnung für einen Notdienst-Einsatz zieht sich mehrere Tage hin',
        consequence: 'In dieser Zeit fliesst das entsprechende Geld nicht in die Liquidität ein.',
        response: 'Erstellen Sie die schweizerische QR-Rechnung direkt aus dem Einsatz heraus, vor Ort oder gleich danach.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Schnelle Offerten und Einsätze', text: 'Kalkulieren Sie einen Notdienst-Einsatz oder eine kleine Sanitär-Baustelle in wenigen Minuten.' },
      { icon: 'users', title: 'Zentrale Kundenbetreuung', text: 'Vollständige Historie der Offerten, Rechnungen und Einsätze pro Kunde.' },
      { icon: 'credit-card', title: 'Sofortige Rechnungsstellung', text: 'Rechnung mit schweizerischer QR-Rechnung, vor Ort erstellt und versandbereit.' },
      { icon: 'clock', title: 'Stunden und Fahrten', text: 'Jeder Einsatz dokumentiert mit der tatsächlich aufgewendeten Zeit.' },
      { icon: 'image', title: 'Vorher-/Nachher-Fotos', text: 'Ein Leck, eine Installation, eine Reparatur: der Nachweis bleibt bei der Baustelle.' },
      { icon: 'calendar', title: 'Planung der Techniker', text: 'Organisieren Sie die Einsätze des Tages und reagieren Sie schnell auf einen Notfall.' },
    ],
    scenario: {
      title: 'Beispiel: ein Notdienst-Einsatz, der zu einer kleinen Baustelle wird',
      text: 'Ein Kunde ruft wegen eines Lecks an. Der Einsatz wird erfasst, ein Foto des Lecks wird vor Ort gemacht. Im Gespräch wird eine ergänzende Offerte für eine grössere Reparatur erstellt. Nach deren Annahme geht die Rechnung für den ersten Notdienst-Einsatz bereits hinaus, ohne auf den Abschluss der zweiten Baustelle zu warten.',
    },
    comparison: [
      { before: 'Notdienst-Einsatz auf einem Zettel notiert', after: 'Einsatz direkt erfasst, mit Kunde und Material' },
      { before: 'Kundenbetreuung aus dem Gedächtnis', after: 'Zentrale Kundenhistorie' },
      { before: 'Rechnung erst mehrere Tage später verschickt', after: 'Rechnung vor Ort erstellt, schweizerische QR-Rechnung' },
      { before: 'Vorher-/Nachher-Fotos in der Handygalerie verloren', after: 'Fotos nach Einsatz sortiert' },
      { before: 'Fahrtstunden nicht erfasst', after: 'Stunden und Fahrten pro Einsatz erfasst' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen kleinen Sanitär- oder Installationsbetrieb?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Einsätze und Rechnungsstellung für einen Sanitärinstallateur ab, der allein oder in einem kleinen Team arbeitet.',
      },
      {
        question: 'Kann ein Notdienst-Einsatz direkt vom Terrain aus fakturiert werden?',
        answer: 'Ja, eine Rechnung mit schweizerischer QR-Rechnung kann vor Ort erstellt werden, gleich nach Abschluss des Einsatzes.',
      },
      {
        question: 'Unterstützt Cantia die schweizerische QR-Rechnung für meine Rechnungen?',
        answer: 'Ja, jede Rechnung enthält den konformen Schweizer QR-Einzahlungsschein, auf allen Plänen.',
      },
      {
        question: 'Kann ich die Historie eines Kunden vor einem Einsatz schnell einsehen?',
        answer: 'Ja, die Kundenkarte zentralisiert Offerten, Rechnungen und frühere Einsätze, zugänglich vom Smartphone aus.',
      },
      {
        question: 'Funktioniert Cantia sowohl für Notfälle als auch für geplante Baustellen?',
        answer: 'Ja, Notdienst-Einsätze und Baustellen leben in derselben Planung, die sich im Notfall schnell umorganisieren lässt.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-plombier-sanitaire-suisse'],
    relatedTrades: ['electricien', 'entreprise-generale'],
  },

  peintre: {
    slug: 'peintre',
    tradeName: 'Maler',
    seo: {
      title: 'Verwaltungssoftware für Malerbetriebe in der Schweiz | Cantia',
      description:
        'Erstellen Sie Ihre Maler-Offerten schneller und behalten Sie Flächen, Teams und Zusatzarbeiten im Blick – mit Cantia, der für die Schweiz konzipierten Verwaltungssoftware.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Maler',
      title: 'Erstellen Sie Ihre Maler-Offerten schneller und behalten Sie Ihre Stunden wirklich im Blick',
      subtitle:
        'Sie wissen, wie viele Quadratmeter Sie fakturiert haben. Cantia hilft Ihnen auch zu wissen, wie viele Stunden diese Sie tatsächlich gekostet haben.',
    },
    painPoints: [
      {
        problem: 'Eine fast identische Offerte wie die vorherige wird von Grund auf neu erstellt',
        consequence: 'Verlorene Zeit durch das erneute Eintippen von Leistungen, die von einer Baustelle zur anderen sehr ähnlich sind.',
        response: 'Ein wiederverwendbarer Katalog von Malerleistungen beschleunigt jede neue Offerte.',
      },
      {
        problem: 'Der Kunde verlangt während der Besichtigung eine andere Ausführungsvariante',
        consequence: 'Schwierig, die Option vor Ort zu kalkulieren, ohne später alles neu zu berechnen.',
        response: 'Passen Sie die Offerte direkt anhand von Aufmass und Katalog an, ohne von vorne zu beginnen.',
      },
      {
        problem: 'Die tatsächlichen Stunden werden nie mit den fakturierten Quadratmetern verglichen',
        consequence: 'Die tatsächliche Marge einer Baustelle bleibt unsichtbar, selbst wenn die Offerte gut verkauft wurde.',
        response: 'Verknüpfen Sie die Stunden mit der Baustelle und vergleichen Sie sie mit dem Offerierten, um zu wissen, was Sie ein m² wirklich kostet.',
      },
    ],
    usages: [
      { icon: 'list', title: 'Leistungskatalog', text: 'Ihre Malerleistungen (Flächen, Ausführungen) gespeichert und wiederverwendbar.' },
      { icon: 'mic', title: 'Offerten mit Flächenaufmass', text: 'Kalkulieren Sie schnell anhand der vor Ort gemessenen Flächen.' },
      { icon: 'clock', title: 'Stundenerfassung pro Baustelle', text: 'Vergleichen Sie die geplante mit der tatsächlich aufgewendeten Zeit, Baustelle für Baustelle.' },
      { icon: 'image', title: 'Vorher-/Nachher-Fotos', text: 'Behalten Sie einen visuellen Nachweis jeder Baustelle, nützlich im Streitfall.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Eine während der Baustelle verlangte Variante oder Ausbesserung wird direkt hinzugefügt.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt automatisch die bestätigten Leistungen.' },
    ],
    scenario: {
      title: 'Beispiel: eine Maler-Offerte mit Ausführungsvarianten',
      text: 'Nach der Besichtigung und dem Flächenaufmass wird eine Offerte mit mehreren möglichen Ausführungen erstellt. Die angenommene Baustelle wird eingeplant, die Stunden des Teams werden Tag für Tag erfasst. Der Kunde verlangt während der Arbeiten eine Ausbesserung: Sie wird als Zusatzarbeit hinzugefügt und anschliessend in die Schlussrechnung übernommen.',
    },
    comparison: [
      { before: 'Offerte jedes Mal von Grund auf neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
      { before: 'Flächen von Hand neu berechnet', after: 'Aufmass in die Offerte integriert' },
      { before: 'Stunden nie mit fakturierten m² verglichen', after: 'Stunden erfasst und mit dem Offerierten verglichen' },
      { before: 'Ausführungsvariante vor Ort schwer zu kalkulieren', after: 'Schnelle Anpassung über den Katalog' },
      { before: 'Ausbesserung in der Rechnung vergessen', after: 'Zusatzarbeiten der Baustelle hinzugefügt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen selbstständigen Malerbetrieb?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Katalog und Rechnungsstellung für einen allein arbeitenden Maler ab, ohne überflüssige Team-Module.',
      },
      {
        question: 'Kann ich einen Katalog meiner üblichen Malerleistungen erstellen?',
        answer: 'Ja, jede in einer Offerte kalkulierte Leistung ergänzt Ihren Katalog, der bei der nächsten Baustelle wiederverwendet werden kann.',
      },
      {
        question: 'Wie handhabt man eine vom Kunden verlangte Ausführungsvariante?',
        answer: 'Sie wird direkt in der Offerte anhand von Katalog und Aufmass hinzugefügt oder angepasst, ohne von vorne zu beginnen.',
      },
      {
        question: 'Lässt sich mit Cantia die tatsächliche Stundenzahl im Vergleich zur Offerte verfolgen?',
        answer: 'Ja, die pro Baustelle erfassten Stunden werden mit dem offerierten Betrag verglichen, um die tatsächliche Rentabilität zu bewerten.',
      },
      {
        question: 'Können für jede Baustelle Vorher-/Nachher-Fotos hinzugefügt werden?',
        answer: 'Ja, die Fotos werden automatisch nach Baustelle sortiert und sind jederzeit einsehbar.',
      },
    ],
    relatedBlogSlugs: ['devis-peintre-batiment-calcul-surface-suisse'],
    relatedTrades: ['menuisier', 'entreprise-generale'],
  },

  menuisier: {
    slug: 'menuisier',
    tradeName: 'Schreiner',
    seo: {
      title: 'Verwaltungssoftware für Schreinereien in der Schweiz | Cantia',
      description:
        'Verfolgen Sie jeden Auftrag, von der Werkstatt bis zur Montage, mit Cantia, der Verwaltungssoftware für Schreinereien in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Schreiner',
      title: 'Von der Werkstatt bis zur Montage – jedes Projekt unter Kontrolle',
      subtitle:
        'Cantia hilft Schreinereien, ihre Massanfertigungen, ihre Masse, ihre Planung von Werkstatt und Montage sowie ihre Rechnungsstellung zu verfolgen.',
    },
    painPoints: [
      {
        problem: 'Zahlreiche kleine Aufträge laufen parallel',
        consequence: 'Masse, Kundenwünsche und Fristen verteilen sich am Ende auf Notizhefte, E-Mails und das Gedächtnis.',
        response: 'Jeder Auftrag hat seine eigene Baustelle, mit allen Informationen an einem einzigen Ort zentralisiert.',
      },
      {
        problem: 'Der Kunde ändert seinen Wunsch nach der Massaufnahme',
        consequence: 'Ohne klare Spur steigt das Risiko eines Fertigungs- oder Montagefehlers.',
        response: 'Die Änderung wird direkt der betreffenden Baustelle hinzugefügt, sichtbar für Werkstatt und Montageteam.',
      },
      {
        problem: 'Niemand weiss genau, wo ein Auftrag steht',
        consequence: 'Der Chef muss die zwingende Anlaufstelle zwischen Werkstatt und Montage sein, um einen Status zu erfahren.',
        response: 'Status und Planung werden zwischen Werkstatt und Montageteam geteilt, ohne zwingenden Vermittler.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Massanfertigungs-Offerten', text: 'Kalkulieren Sie einen individuellen Auftrag aus Ihrem Leistungskatalog.' },
      { icon: 'file-text', title: 'Auftragsverfolgung pro Baustelle', text: 'Masse, Kundenwünsche und Fristen pro Projekt zentralisiert.' },
      { icon: 'calendar', title: 'Planung Werkstatt und Montage', text: 'Koordinieren Sie Fertigung und Montage ohne zwischengeschaltete Anrufe.' },
      { icon: 'image', title: 'Fotos von Fertigung und Montage', text: 'Dokumentieren Sie jeden Schritt, von der Werkstatt bis zur Installation.' },
      { icon: 'plus-circle', title: 'Kundenänderungen', text: 'Ein Last-Minute-Wunsch wird direkt dem betreffenden Projekt hinzugefügt.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt den bestätigten Auftrag, ohne erneute Erfassung.' },
    ],
    scenario: {
      title: 'Beispiel: eine Massmöbel-Bestellung, von der Massaufnahme bis zur Montage',
      text: 'Die Massaufnahme beim Kunden fliesst in eine individuelle Offerte ein. Der Auftrag wird in der Werkstatt verfolgt; eine vom Kunden gewünschte Änderung wird direkt der Baustelle hinzugefügt. Die Montage wird geplant und mit Fotos dokumentiert, anschliessend wird die Rechnung aus der ursprünglichen Offerte erstellt.',
    },
    comparison: [
      { before: 'Masse in einem Notizheft festgehalten', after: 'Masse und Bemerkungen mit der Baustelle verknüpft' },
      { before: 'Kundenänderung zwischen Werkstatt und Montage verloren', after: 'Änderung direkt der betreffenden Baustelle hinzugefügt' },
      { before: 'Auftragsstatus nur dem Chef bekannt', after: 'Status für das ganze Team sichtbar' },
      { before: 'Fotos von Fertigung und Montage verstreut', after: 'Fotos nach Baustelle sortiert' },
      { before: 'Individuelle Offerte von Grund auf neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen Schreiner, der mit individuellen Aufträgen arbeitet?',
        answer: 'Ja, jeder Auftrag wird zu einer Baustelle mit eigenen Massen, Dokumenten und Status, unabhängig vom Grad der Individualisierung.',
      },
      {
        question: 'Wie verfolgt man eine vom Kunden nach der Massaufnahme verlangte Änderung?',
        answer: 'Sie wird direkt der betreffenden Baustelle hinzugefügt, mit einer Bemerkung, sichtbar sowohl für die Werkstatt als auch für das Montageteam.',
      },
      {
        question: 'Lassen sich Werkstatt und Montageteam mit Cantia koordinieren?',
        answer: 'Ja, die Planung und der Status jedes Auftrags werden geteilt, ohne dass ein zwischengeschalteter Anruf nötig ist.',
      },
      {
        question: 'Lassen sich mit Cantia Offerten mit massgeschneiderten Leistungen erstellen?',
        answer: 'Ja, ein wiederverwendbarer Leistungskatalog beschleunigt die Kalkulation und lässt gleichzeitig Raum für auftragsspezifische Positionen.',
      },
      {
        question: 'Kann ich Fotos von Fertigung und Montage pro Projekt hinzufügen?',
        answer: 'Ja, die Fotos werden automatisch nach Baustelle sortiert, von der Werkstatt bis zur finalen Installation.',
      },
    ],
    relatedBlogSlugs: ['devis-menuisier-sur-mesure-facturation-suisse'],
    relatedTrades: ['charpentier', 'peintre'],
  },
  'entreprise-generale': {
    slug: 'entreprise-generale',
    tradeName: 'Generalunternehmen',
    seo: {
      title: 'Verwaltungssoftware für Generalunternehmen im Bauwesen in der Schweiz | Cantia',
      description:
        'Zentralisieren Sie mehrere Baustellen, Subunternehmer und Budgets mit Cantia, der Verwaltungssoftware für Generalunternehmen im Schweizer Bauwesen.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Generalunternehmen',
      title: 'Ein klarer Überblick über alle Baustellen, ohne endlose Dateien',
      subtitle:
        'Cantia zentralisiert Ihre Baustellen, Subunternehmer, Dokumente und die Rentabilität jedes Projekts in einem einzigen Tool.',
    },
    painPoints: [
      {
        problem: 'Mehrere Baustellen laufen parallel, jede mit eigenen Dateien',
        consequence: 'Ohne die Informationen Baustelle für Baustelle neu zusammenzusuchen, ist ein Gesamtüberblick unmöglich.',
        response: 'Alle Ihre Baustellen sind in einem einzigen Tool zentralisiert und an einem Ort einsehbar.',
      },
      {
        problem: 'Zahlreiche Subunternehmer müssen auf verschiedenen Baustellen koordiniert werden',
        consequence: 'Einsatzstatus und Versicherungsnachweise gehen von Baustelle zu Baustelle leicht verloren.',
        response: 'Ein wiederverwendbares Subunternehmer-Verzeichnis mit Status und Nachweisen pro Baustelle.',
      },
      {
        problem: 'Die tatsächliche Rentabilität einer Baustelle zeigt sich erst am Projektende',
        consequence: 'Eine Budget- oder Terminüberschreitung wird zu spät entdeckt, um noch korrigiert zu werden.',
        response: 'Vergleichen Sie Offertbetrag und effektive Kosten laufend, Baustelle für Baustelle, nicht erst in der Schlussabrechnung.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planung für mehrere Baustellen', text: 'Organisieren Sie mehrere Teams und Subunternehmer auf mehreren aktiven Baustellen.' },
      { icon: 'users', title: 'Koordination der Subunternehmer', text: 'Wiederverwendbares Verzeichnis mit gespeicherten und datierten Versicherungsnachweisen.' },
      { icon: 'folder', title: 'Dokumente pro Baustelle', text: 'Pläne, Ausschreibungen und Verträge in einem digitalen Ordner pro Projekt abgelegt.' },
      { icon: 'trending-up', title: 'Rentabilität pro Baustelle', text: 'Offertbetrag, effektive Kosten und Marge für jedes laufende Projekt sichtbar.' },
      { icon: 'shield', title: 'Individuelle Team-Rollen', text: 'Legen Sie genau fest, wer je nach Funktion was sieht.' },
      { icon: 'credit-card', title: 'Rechnungsstellung und Liquidität', text: 'Behalten Sie den Überblick über Rechnungsstellung, Zahlungseingänge und offene Beträge, über alle Baustellen hinweg.' },
    ],
    scenario: {
      title: 'Beispiel: mehrere parallel geführte Baustellen mit Subunternehmern',
      text: 'Jede Baustelle verfügt über einen eigenen Bereich (Dokumente, Planung, Subunternehmer). Die Rentabilität jeder Baustelle bleibt laufend sichtbar, und individuelle Team-Rollen beschränken den Zugriff jedes Mitarbeiters auf die Informationen, die ihn tatsächlich betreffen.',
    },
    comparison: [
      { before: 'Eine Datei pro Baustelle, kein Gesamtüberblick', after: 'Alle Baustellen zentralisiert' },
      { before: 'Subunternehmer aus dem Gedächtnis verwaltet', after: 'Subunternehmer-Verzeichnis mit Nachweisen' },
      { before: 'Rentabilität erst am Ende der Baustelle bekannt', after: 'Rentabilität laufend verfolgt, Baustelle für Baustelle' },
      { before: 'Zugriff auf Daten unkontrolliert', after: 'Individuelle Team-Rollen' },
      { before: 'Dokumente über mehrere Tools verstreut', after: 'Digitaler Ordner pro Baustelle' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Generalunternehmen, das mehrere Baustellen parallel führt?',
        answer: 'Ja, genau das ist der Anwendungsfall der Mehrbaustellen-Planung und der zentralisierten Projektübersicht.',
      },
      {
        question: 'Kann man Subunternehmer und ihre Versicherungsnachweise nachverfolgen?',
        answer: 'Ja, ein wiederverwendbares Subunternehmer-Verzeichnis hält Einsatzstatus und Nachweise pro Baustelle aktuell.',
      },
      {
        question: 'Ermöglicht Cantia den Vergleich der Rentabilität mehrerer Baustellen?',
        answer: 'Ja, jede Baustelle zeigt ihre eigene Marge (Offertbetrag vs. effektive Kosten), sodass sich mehrere Projekte miteinander vergleichen lassen.',
      },
      {
        question: 'Kann man den Zugriff bestimmter Mitarbeiter auf bestimmte Informationen einschränken?',
        answer: 'Ja, individuelle Rollen erlauben es, genau festzulegen, wer Zugriff auf Finanzen, Aufmass, Planung oder Dokumente hat.',
      },
      {
        question: 'Lässt sich Cantia mit Bexio für die Buchhaltung verbinden?',
        answer: 'Ja, die native Integration synchronisiert Kunden, Rechnungen und Zahlungen zwischen Cantia und Bexio, ab dem Team-Plan.',
      },
    ],
    relatedBlogSlugs: ['gerer-plusieurs-chantiers-en-parallele-methode'],
    relatedTrades: ['macon', 'electricien'],
  },

  paysagiste: {
    slug: 'paysagiste',
    tradeName: 'Landschaftsgärtner',
    seo: {
      title: 'Verwaltungssoftware für Garten- und Landschaftsbauunternehmen in der Schweiz | Cantia',
      description:
        'Verwalten Sie mobile Teams, Gestaltungsbaustellen und Unterhaltsverträge mit Cantia, der Verwaltungssoftware für Garten- und Landschaftsbauunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Landschaftsgärtner',
      title: 'Baustellen, Unterhalt und Teams: Ihre gesamte Planung an einem Ort',
      subtitle:
        'Cantia hilft Garten- und Landschaftsbauunternehmen, ihre mobilen Teams, Gestaltungsbaustellen und wiederkehrenden Unterhaltsverträge zu organisieren.',
    },
    painPoints: [
      {
        problem: 'Viele kleine Baustellen und Unterhaltseinsätze müssen in die Woche eingeplant werden',
        consequence: 'Die Planung wird schnell schwer aktuell zu halten, mit schlecht verteilten Teams auf den Einsatzorten.',
        response: 'Eine zentrale Planung pro Team und Tag, in Sekunden anpassbar.',
      },
      {
        problem: 'Die Teams arbeiten gleichzeitig auf mehreren Standorten',
        consequence: 'Zu koordinieren, wer wohin geht und mit welchem Material, wird für den Chef zur ständigen mentalen Belastung.',
        response: 'Jede Baustelle bleibt vom Terrain aus über das Mobiltelefon erreichbar, egal wo sich das Team befindet.',
      },
      {
        problem: 'Wiederkehrender Unterhalt lässt sich von einem Besuch zum nächsten schlecht nachverfolgen',
        consequence: 'Ein Einsatz kann vergessen oder mangels klarer Spur falsch verrechnet werden.',
        response: 'Jeder Unterhaltseinsatz ist mit seiner Baustelle verknüpft, bereit zur Übernahme in die Rechnungsstellung.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planung mobiler Teams', text: 'Organisieren Sie mehrere Teams auf mehreren Standorten, laufend anpassbar.' },
      { icon: 'mic', title: 'Offerten für Baustellen und Unterhalt', text: 'Kalkulieren Sie eine Gestaltung oder einen Unterhaltsvertrag direkt aus Ihrem Katalog.' },
      { icon: 'image', title: 'Fotos vorher/nachher', text: 'Werten Sie eine abgeschlossene Gestaltung auf oder dokumentieren Sie einen Unterhaltseinsatz.' },
      { icon: 'clock', title: 'Stundenerfassung', text: 'Die pro Einsatz aufgewendete Zeit, der richtigen Baustelle zugeordnet.' },
      { icon: 'credit-card', title: 'Rechnungsstellung ab der Offerte', text: 'Jeder Einsatz wird verrechnet, ohne auf das Saisonende zu warten.' },
      { icon: 'list', title: 'Leistungskatalog', text: 'Ihre wiederkehrenden Leistungen (Mähen, Schneiden, Unterhalt) bereits kalkuliert.' },
    ],
    scenario: {
      title: 'Beispiel: eine Saison mit Gestaltungsbaustellen und Unterhaltsverträgen',
      text: 'Die Wochenplanung verteilt die Teams auf mehrere Standorte. Jeder Unterhaltseinsatz wird dokumentiert und mit seiner Baustelle verknüpft. Eine grössere Gestaltung wird wie eine richtige Baustelle geführt, von der ersten Offerte über die Vorher/Nachher-Fotos bis zur Rechnungsstellung.',
    },
    comparison: [
      { before: 'Planung mobiler Teams auf Papier', after: 'Zentralisierte Planung, vor Ort abrufbar' },
      { before: 'Wiederkehrender Unterhalt schlecht nachverfolgt', after: 'Jeder Einsatz mit seiner Baustelle verknüpft' },
      { before: 'Gestaltungsfotos verstreut', after: 'Vorher/Nachher-Fotos nach Baustelle geordnet' },
      { before: 'Offerten bei jeder kleinen Baustelle neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
      { before: 'Rechnung am Saisonende verschickt', after: 'Rechnung nach jedem Einsatz erstellt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Garten- und Landschaftsbauunternehmen mit mehreren mobilen Teams?',
        answer: 'Ja, die zentralisierte Planung ermöglicht es, mehrere Teams auf mehreren Standorten zu organisieren, direkt vor Ort einsehbar.',
      },
      {
        question: 'Lassen sich sowohl Gestaltungsbaustellen als auch Unterhaltsverträge verwalten?',
        answer: 'Ja, beide leben im selben Tool: Eine Gestaltung wird wie eine klassische Baustelle geführt, der wiederkehrende Unterhalt wie eine Reihe von Einsätzen, die mit einer Baustelle verknüpft sind.',
      },
      {
        question: 'Ist die Planung vor Ort auf dem Mobiltelefon abrufbar?',
        answer: 'Ja, Cantia funktioniert auf Smartphone und Tablet, mit direktem Zugriff auf die Planung und die Baustellen des Tages.',
      },
      {
        question: 'Ermöglicht Cantia die rasche Verrechnung eines Unterhaltseinsatzes?',
        answer: 'Ja, jeder Einsatz kann direkt nach seiner Ausführung verrechnet werden, ohne auf das Saisonende zu warten.',
      },
      {
        question: 'Kann ich Vorher/Nachher-Fotos für eine Gestaltung hinzufügen?',
        answer: 'Ja, die Fotos werden automatisch nach Baustelle geordnet und eignen sich, um eine abgeschlossene Gestaltung aufzuwerten.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-paysagiste-jardinier-suisse'],
    relatedTrades: ['entreprise-generale', 'macon'],
  },

  couvreur: {
    slug: 'couvreur',
    tradeName: 'Dachdecker',
    seo: {
      title: 'Verwaltungssoftware für Dachdecker in der Schweiz | Cantia',
      description:
        'Dokumentieren und steuern Sie Ihre Dachbaustellen mit Cantia, der Verwaltungssoftware für Dachdeckerunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Dachdecker',
      title: 'Von der Dachbesichtigung bis zur Rechnung – behalten Sie alle Nachweise der Baustelle',
      subtitle:
        'Cantia hilft Dachdeckerunternehmen, ihre Diagnosen zu dokumentieren, unvorhergesehene Ereignisse auf der Baustelle zu verwalten und ohne Spurverlust zu fakturieren.',
    },
    painPoints: [
      {
        problem: 'Eine Dachdiagnose ohne klaren visuellen Nachweis',
        consequence: 'Schwer, den Umfang der Arbeiten gegenüber Kunde oder Versicherung zu belegen, sobald die Baustelle begonnen hat.',
        response: 'Machen Sie geolokalisierte Fotos während der Diagnose, direkt mit der betreffenden Baustelle verknüpft.',
      },
      {
        problem: 'Eine Entdeckung unter der Dacheindeckung verändert die ganze Baustelle',
        consequence: 'Ohne klare Dokumentation im Moment der Entdeckung ist der Mehraufwand beim Kunden schwer durchzusetzen.',
        response: 'Fügen Sie die Zusatzarbeit direkt der Baustelle hinzu, mit Foto, automatisch in die Rechnungsstellung übernommen.',
      },
      {
        problem: 'Sicherheit und Einsatznachweise müssen dokumentiert werden',
        consequence: 'Bei Streitfall oder Kontrolle erschwert das Fehlen einer schriftlichen Spur alles.',
        response: 'Jeder Schritt der Baustelle (Fotos, Bemerkungen, Dokumente) bleibt zentralisiert und automatisch datiert.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerte aus der Diagnose', text: 'Kalkulieren Sie eine Dachsanierung direkt im Anschluss an die Diagnosebesichtigung.' },
      { icon: 'image', title: 'Fotos vorher/während/nachher', text: 'Dokumentieren Sie jeden Schritt der Baustelle, automatisch geolokalisiert.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Eine unvorhergesehene Entdeckung unter der Dacheindeckung wird direkt hinzugefügt, mit Foto.' },
      { icon: 'calendar', title: 'Teamplanung', text: 'Organisieren Sie Ihre Teams auf mehreren Dachbaustellen.' },
      { icon: 'file-text', title: 'Baustellenrapporte', text: 'Notizen und Fotos werden zu einem versandbereiten Rapport.' },
      { icon: 'credit-card', title: 'Rechnungsstellung ab der Offerte', text: 'Nach Abschluss der Baustelle übernimmt die Rechnung alles, was tatsächlich ausgeführt wurde.' },
    ],
    scenario: {
      title: 'Beispiel: eine Dachsanierung nach Diagnose',
      text: 'Besichtigung und Diagnose werden direkt vor Ort fotografiert. Die Offerte wird erstellt, die Baustelle geplant. Eine unvorhergesehene Entdeckung (beschädigter Dachstuhl) wird als Zusatzarbeit mit Foto als Beleg hinzugefügt. Die Schlussrechnung übernimmt sämtliche tatsächlich ausgeführten Arbeiten.',
    },
    comparison: [
      { before: 'Dachdiagnose ohne schriftlichen Nachweis', after: 'Geolokalisierte Fotos mit der Baustelle verknüpft' },
      { before: 'Entdeckung unter der Dacheindeckung nicht dokumentiert', after: 'Zusatzarbeiten mit Foto hinzugefügt' },
      { before: 'Einsatznachweise verstreut', after: 'Zentralisierte, datierte Historie pro Baustelle' },
      { before: 'Offerte nach jeder Besichtigung neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
      { before: 'Rechnung im Nachhinein verschickt', after: 'Rechnung ab der Offerte erstellt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Dachdeckerunternehmen?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Baustellen und Rechnungsstellung für ein Dachdeckerunternehmen ab, das startet oder im kleinen Team arbeitet.',
      },
      {
        question: 'Kann ich eine Dachdiagnose mit Fotos dokumentieren?',
        answer: 'Ja, die während der Diagnose aufgenommenen Fotos werden automatisch geolokalisiert und mit der Baustelle verknüpft.',
      },
      {
        question: 'Wie füge ich eine unvorhergesehene Entdeckung während der Baustelle hinzu?',
        answer: 'Sie wird direkt bei der betreffenden Baustelle hinzugefügt, mit einer Bemerkung oder einem Foto, und folgt danach demselben Ablauf wie eine Offerte bis zur Rechnungsstellung.',
      },
      {
        question: 'Ermöglicht Cantia eine klare Nachvollziehbarkeit bei Streitfällen?',
        answer: 'Ja, jedes Foto, jede Bemerkung und jedes Dokument bleibt datiert und pro Baustelle zentralisiert, jederzeit einsehbar.',
      },
      {
        question: 'Kann ich Cantia mit Bexio nutzen?',
        answer: 'Ja, die native Integration synchronisiert Kunden, Rechnungen und Zahlungen zwischen Cantia und Bexio, ab dem Team-Plan.',
      },
    ],
    relatedBlogSlugs: ['gestion-chantier-devis-couvreur-toiture-suisse'],
    relatedTrades: ['charpentier', 'etancheur'],
  },

  chauffagiste: {
    slug: 'chauffagiste',
    tradeName: 'Heizungsinstallateure',
    seo: {
      title: 'Verwaltungssoftware für Heizungsinstallateure in der Schweiz | Cantia',
      description:
        'Verfolgen Sie Installationen, Einsätze und Teams mit Cantia, der Verwaltungssoftware für Heizungsunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Heizungsinstallateure',
      title: 'Installation, Notdienst oder Unterhalt: jeder Einsatz bleibt nachvollziehbar',
      subtitle:
        'Cantia hilft Heizungsunternehmen, Unterhalt und Notfalleinsätze zu organisieren, verwendetes Material nachzuverfolgen und rasch zu fakturieren.',
    },
    painPoints: [
      {
        problem: 'Wiederkehrende Unterhaltstermine und punktuelle Notdienst-Einsätze vermischen sich in der Planung',
        consequence: 'Ein jährlicher Unterhaltstermin kann inmitten der Notfälle vergessen werden.',
        response: 'Eine zentrale Planung, die geplante Einsätze und Notfälle klar unterscheidet.',
      },
      {
        problem: 'Ausgetauschte Teile an einer Installation werden nicht immer notiert',
        consequence: 'Bei einer erneuten Störung ist nicht schnell ersichtlich, was bereits ersetzt wurde.',
        response: 'Jeder Einsatz wird mit dem verwendeten Material dokumentiert, verknüpft mit der Installation des Kunden.',
      },
      {
        problem: 'Ein abgeschlossener Einsatz wird nicht sofort verrechnet',
        consequence: 'Der administrative Aufwand häuft sich an und verzögert die Liquidität des Unternehmens.',
        response: 'Fakturieren Sie direkt aus dem Einsatz, mit einer versandbereiten Schweizer QR-Rechnung.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planung Unterhalt + Notdienst', text: 'Unterscheiden Sie geplante Einsätze und Notfälle in einer einzigen Planung.' },
      { icon: 'users', title: 'Historie pro Installation', text: 'Finden Sie schnell, was an jeder Kundeninstallation gemacht und ausgetauscht wurde.' },
      { icon: 'mic', title: 'Schnelle Offerten', text: 'Kalkulieren Sie einen Einsatz oder Ersatz direkt aus Ihrem Katalog.' },
      { icon: 'credit-card', title: 'Sofortige Rechnungsstellung', text: 'QR-Rechnung direkt aus dem Einsatz erstellt.' },
      { icon: 'file-text', title: 'Einsatzrapporte', text: 'Dokumentieren Sie jeden Einsatz mit Fotos und Bemerkungen.' },
      { icon: 'clock', title: 'Stunden pro Einsatz', text: 'Verfolgen Sie die tatsächlich für jede Installation aufgewendete Zeit.' },
    ],
    scenario: {
      title: 'Beispiel: eine Saison mit Heizkesselkontrollen und punktuellen Notdienst-Einsätzen',
      text: 'Die Planung der jährlichen Kontrollen wird im Voraus organisiert. Ein Heizungsnotfall kommt im Laufe der Woche dazu und wird in Sekunden neu eingeplant. Jeder Einsatz wird mit dem verwendeten Material dokumentiert, und die Rechnung geht direkt nach Abschluss des Einsatzes raus.',
    },
    comparison: [
      { before: 'Unterhalt und Notdienst ohne Unterscheidung vermischt', after: 'Planung, die beides unterscheidet' },
      { before: 'Ausgetauschte Teile nicht notiert', after: 'Verwendetes Material pro Einsatz dokumentiert' },
      { before: 'Rechnung im Nachhinein verschickt', after: 'Rechnung ab dem Einsatz erstellt' },
      { before: 'Installationshistorie aus dem Gedächtnis', after: 'Zentralisierte Historie pro Kunde' },
      { before: 'Stunden pro Einsatz nicht erfasst', after: 'Stunden jedem Einsatz zugeordnet' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Heizungsunternehmen mit mehreren Technikern?',
        answer: 'Ja, die Teamplanung und individuelle Rollen ermöglichen es, mehrere Techniker bei unterschiedlichen Einsätzen zu koordinieren.',
      },
      {
        question: 'Lassen sich geplanter Unterhalt und dringende Notdienst-Einsätze in der Planung unterscheiden?',
        answer: 'Ja, beide leben in derselben Planung, die sich rasch umorganisieren lässt, wenn ein Notfall dazukommt.',
      },
      {
        question: 'Kann ich die bei einem Einsatz ausgetauschten Teile dokumentieren?',
        answer: 'Ja, jeder Einsatz behält eine Bemerkung zum verwendeten Material, verknüpft mit der Installation des Kunden.',
      },
      {
        question: 'Ermöglicht Cantia eine rasche Rechnungsstellung nach einem Notdienst-Einsatz?',
        answer: 'Ja, eine Rechnung mit Schweizer QR-Rechnung kann direkt aus dem Einsatz erstellt werden.',
      },
      {
        question: 'Kann ich Cantia mit Bexio nutzen?',
        answer: 'Ja, die native Integration synchronisiert Kunden, Rechnungen und Zahlungen zwischen Cantia und Bexio, ab dem Team-Plan.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-chauffagiste-cvc-suisse'],
    relatedTrades: ['electricien', 'plombier'],
  },

  carreleur: {
    slug: 'carreleur',
    tradeName: 'Plattenleger',
    seo: {
      title: 'Verwaltungssoftware für Plattenleger in der Schweiz | Cantia',
      description:
        'Verfolgen Sie Flächen, Material und Verlegezeiten mit Cantia, der Verwaltungssoftware für Plattenlegerunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Plattenleger',
      title: 'Jeder Quadratmeter zählt. Ihre Stunden auch.',
      subtitle:
        'Cantia hilft Plattenlegerunternehmen, ihre Flächen schnell zu kalkulieren und zu wissen, was eine Verlege-Baustelle tatsächlich einbringt.',
    },
    painPoints: [
      {
        problem: 'Flächen werden bei jeder Offerte von Hand neu berechnet',
        consequence: 'Zeitverlust und Fehlerrisiko bei Berechnungen, die von Baustelle zu Baustelle doch immer wieder gleich sind.',
        response: 'Das Aufmass ist in die Offerte integriert, mit automatischer Berechnung pro Raum oder Zone.',
      },
      {
        problem: 'Eine Plattenvariante wird während der Baustelle gewünscht',
        consequence: 'Schwer, sie vor Ort schnell zu kalkulieren und genehmigen zu lassen.',
        response: 'Passen Sie die Offerte direkt aus dem Katalog an, die Zusatzarbeiten separat nachverfolgt.',
      },
      {
        problem: 'Die tatsächliche Verlegezeit wird nie mit der Offerte verglichen',
        consequence: 'Unmöglich zu wissen, ob eine Baustelle wirklich rentabel war, selbst wenn die Offerte gut verkauft wurde.',
        response: 'Ordnen Sie die Stunden der Baustelle zu und vergleichen Sie sie mit dem offerierten Betrag.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerte mit Flächenaufmass', text: 'Kalkulieren Sie schnell anhand der vor Ort gemessenen Flächen.' },
      { icon: 'list', title: 'Materialkatalog', text: 'Ihre gängigen Leistungen und Materialien gespeichert und wiederverwendbar.' },
      { icon: 'clock', title: 'Verfolgung der Verlegestunden', text: 'Vergleichen Sie die geplante mit der tatsächlich aufgewendeten Zeit, Baustelle für Baustelle.' },
      { icon: 'image', title: 'Fotos vorher/nachher', text: 'Behalten Sie einen visuellen Nachweis jeder abgeschlossenen Baustelle.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Eine während der Baustelle gewünschte Variante wird direkt hinzugefügt.' },
      { icon: 'credit-card', title: 'Rechnungsstellung ab der Offerte', text: 'Die Rechnung übernimmt automatisch die bestätigten Leistungen.' },
    ],
    scenario: {
      title: 'Beispiel: eine Plattenverlegung mit Variante während der Baustelle',
      text: 'Das Flächenaufmass fliesst in eine mit dem Katalog erstellte Offerte ein. Die Baustelle wird geplant. Der Kunde wechselt für einen Raum während der Arbeiten die Platten, angepasst als Zusatzarbeit. Die Schlussrechnung übernimmt sämtliche tatsächlich verlegten Leistungen.',
    },
    comparison: [
      { before: 'Flächen von Hand neu berechnet', after: 'Aufmass in die Offerte integriert' },
      { before: 'Plattenvariante vor Ort schwer zu kalkulieren', after: 'Schnelle Anpassung aus dem Katalog' },
      { before: 'Verlegezeit nie mit der Offerte verglichen', after: 'Stunden erfasst und mit dem Offertbetrag verglichen' },
      { before: 'Verlegefotos verstreut', after: 'Fotos nach Baustelle geordnet' },
      { before: 'Offerte bei jeder neuen Baustelle neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen selbstständigen Plattenleger oder ein kleines Team?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Katalog und Rechnungsstellung für einen Plattenleger ab, der allein oder im kleinen Team arbeitet.',
      },
      {
        question: 'Kann ich ein Flächenaufmass direkt in die Offerte integrieren?',
        answer: 'Ja, das Aufmass fliesst direkt in die Offerte ein, mit automatischer Berechnung pro Raum oder Zone.',
      },
      {
        question: 'Wie handhabe ich eine während der Baustelle gewünschte Plattenvariante?',
        answer: 'Sie wird direkt in der Offerte aus Katalog und Aufmass hinzugefügt, ohne von vorn zu beginnen.',
      },
      {
        question: 'Ermöglicht Cantia den Vergleich der tatsächlichen Verlegezeit mit der Offerte?',
        answer: 'Ja, die pro Baustelle erfassten Stunden werden mit dem offerierten Betrag verglichen.',
      },
      {
        question: 'Kann ich für jede Baustelle Vorher/Nachher-Fotos hinzufügen?',
        answer: 'Ja, die Fotos werden automatisch nach Baustelle geordnet.',
      },
    ],
    relatedBlogSlugs: ['devis-carreleur-facturation-au-m2-suisse'],
    relatedTrades: ['peintre', 'platrier'],
  },

  platrier: {
    slug: 'platrier',
    tradeName: 'Gipser',
    seo: {
      title: 'Verwaltungssoftware für Gipser in der Schweiz | Cantia',
      description:
        'Verfolgen Sie Aufmasse, Leistungen und Stunden pro Baustelle mit Cantia, der Verwaltungssoftware für Gipserunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Gipser',
      title: 'Vom Aufmass bis zur Rechnung – behalten Sie die Kontrolle über Ihre Arbeiten',
      subtitle:
        'Cantia hilft Gipserunternehmen, ihre Aufmasse zu kalkulieren, Änderungen auf der Baustelle nachzuverfolgen und ihre Teams zu koordinieren.',
    },
    painPoints: [
      {
        problem: 'Die Aufmasse für Trennwände und abgehängte Decken werden bei jeder Offerte neu berechnet',
        consequence: 'Zeitverlust bei Berechnungen, die von Baustelle zu Baustelle doch wiederkehrend sind.',
        response: 'Das Aufmass ist in die Offerte integriert, mit einem wiederverwendbaren Leistungskatalog.',
      },
      {
        problem: 'Eine Änderung der Trennwände wird während der Baustelle entschieden',
        consequence: 'Der Mehraufwand ist danach ohne klare Spur schwer zu genehmigen und zu verrechnen.',
        response: 'Die Zusatzarbeit wird direkt der Baustelle hinzugefügt und in die Rechnung übernommen.',
      },
      {
        problem: 'Mehrere Baustellen parallel, in Koordination mit anderen Gewerken',
        consequence: 'Ohne gemeinsame Planung ist schwer zu wissen, wer wann im Einsatz ist.',
        response: 'Eine zentralisierte Planung, sichtbar für das gesamte Team und die Beteiligten der Baustelle.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerte mit Aufmass', text: 'Kalkulieren Sie Trennwände und abgehängte Decken aus einem wiederverwendbaren Leistungskatalog.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Eine Änderung der Trennwände wird direkt der Baustelle hinzugefügt.' },
      { icon: 'clock', title: 'Stundenerfassung', text: 'Vergleichen Sie die geplante mit der tatsächlich aufgewendeten Zeit, pro Baustelle.' },
      { icon: 'calendar', title: 'Planung für mehrere Baustellen', text: 'Koordinieren Sie Ihre Einsätze mit den anderen Gewerken.' },
      { icon: 'image', title: 'Baustellenfotos', text: 'Dokumentieren Sie den Fortschritt Ihrer Arbeiten.' },
      { icon: 'credit-card', title: 'Rechnungsstellung ab der Offerte', text: 'Die Rechnung übernimmt automatisch die ausgeführten Leistungen.' },
    ],
    scenario: {
      title: 'Beispiel: eine Trennwand-Baustelle mit Änderung während der Arbeiten',
      text: 'Das erste Aufmass fliesst in die Offerte ein. Die Baustelle wird in Koordination mit den anderen Gewerken geplant. Eine während der Arbeiten gewünschte Änderung der Trennwände wird als Zusatzarbeit hinzugefügt. Die Schlussrechnung übernimmt sämtliche ausgeführten Leistungen.',
    },
    comparison: [
      { before: 'Aufmasse bei jeder Offerte neu berechnet', after: 'Aufmass integriert und wiederverwendbarer Katalog' },
      { before: 'Änderung der Trennwände nicht dokumentiert', after: 'Zusatzarbeiten der Baustelle hinzugefügt' },
      { before: 'Koordination mit anderen Gewerken per Telefon', after: 'Geteilte, zentralisierte Planung' },
      { before: 'Stunden pro Baustelle nicht erfasst', after: 'Stunden jeder Baustelle zugeordnet' },
      { before: 'Rechnung im Nachhinein zusammengestellt', after: 'Rechnung ab der Offerte erstellt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Gipser- oder Trockenbauunternehmen?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Baustellen und Rechnungsstellung für ein Unternehmen ab, das startet oder im kleinen Team arbeitet.',
      },
      {
        question: 'Kann ich ein Aufmass für Trennwände oder abgehängte Decken in die Offerte integrieren?',
        answer: 'Ja, das Aufmass fliesst direkt in die Offerte ein, mit einem wiederverwendbaren Leistungskatalog.',
      },
      {
        question: 'Wie füge ich eine während der Baustelle beschlossene Änderung hinzu?',
        answer: 'Sie wird direkt bei der betreffenden Baustelle hinzugefügt, mit einer Bemerkung, die in die Rechnungsstellung übernommen wird.',
      },
      {
        question: 'Ermöglicht Cantia die Koordination meiner Planung mit anderen Gewerken?',
        answer: 'Ja, die Planung ist geteilt und zentralisiert, sichtbar für das gesamte Team der Baustelle.',
      },
      {
        question: 'Kann ich meine Verlegestunden pro Baustelle nachverfolgen?',
        answer: 'Ja, jede erfasste Stunde wird einer bestimmten Baustelle zugeordnet.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['carreleur', 'menuisier'],
  },
  'genie-civil': {
    slug: 'genie-civil',
    tradeName: 'Tiefbauunternehmen',
    seo: {
      title: 'Verwaltungssoftware für Tiefbauunternehmen | Cantia',
      description:
        'Steuern Sie mehrere Teams und Baustellen mit echter finanzieller Übersicht – mit Cantia, der Verwaltungssoftware für den Tiefbau in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für den Tiefbau',
      title: 'Ihre Teams auf der Baustelle. Ihre Zahlen im Griff.',
      subtitle:
        'Cantia hilft Tiefbauunternehmen, mehrere Teams und Baustellen zu koordinieren und dabei Ausgaben und Rentabilität laufend im Blick zu behalten.',
    },
    painPoints: [
      {
        problem: 'Mehrere Teams auf mehreren grossen Baustellen',
        consequence: 'Ohne zentrale Übersicht über alle Baustellen wird die Koordination schnell unübersichtlich.',
        response: 'Eine zentrale Planung für mehrere Baustellen und Teams, einsehbar für die ganze Organisation.',
      },
      {
        problem: 'Baustellenausgaben (Material, Maschinenmiete, Subunternehmer) sind in Echtzeit schwer nachzuverfolgen',
        consequence: 'Die tatsächliche Rentabilität zeigt sich erst im Nachhinein – manchmal zu spät, um noch zu reagieren.',
        response: 'Ordnen Sie Ausgaben der jeweiligen Baustelle zu und vergleichen Sie sie laufend mit der Offerte.',
      },
      {
        problem: 'Baustellenrapporte und Fotobelege sind auf mehrere Beteiligte verstreut',
        consequence: 'Bei Streitfällen oder der Nachverfolgung einer Baustelle lässt sich die Information nur schwer rekonstruieren.',
        response: 'Jede Baustelle bündelt ihre Rapporte, Fotos und Dokumente – zugänglich für das ganze Team.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planung für mehrere Teams', text: 'Koordinieren Sie mehrere Teams auf mehreren Baustellen gleichzeitig.' },
      { icon: 'dollar-sign', title: 'Ausgabenübersicht', text: 'Material, Maschinen und Subunternehmer der richtigen Baustelle zugeordnet.' },
      { icon: 'trending-up', title: 'Rentabilität in Echtzeit', text: 'Vergleichen Sie Offerte und effektive Kosten laufend, Baustelle für Baustelle.' },
      { icon: 'file-text', title: 'Baustellenrapporte', text: 'Fotos und Notizen werden zu einem versandbereiten Rapport.' },
      { icon: 'folder', title: 'Zentrale Dokumente', text: 'Pläne, Verträge und Bewilligungen nach Baustelle abgelegt.' },
      { icon: 'clock', title: 'Stunden pro Baustelle', text: 'Erfassen Sie den Arbeitsaufwand jedes Teams, Baustelle für Baustelle.' },
    ],
    scenario: {
      title: 'Beispiel: eine Tiefbaustelle mit mehreren Teams und Subunternehmern',
      text: 'Die Planung koordiniert interne Teams und Subunternehmer auf derselben Baustelle. Ausgaben und Stunden werden tagesaktuell erfasst. Die Rentabilität bleibt laufend sichtbar, und Rapporte wie Fotos werden für die gesamte Baustelle zentral gebündelt.',
    },
    comparison: [
      { before: 'Mehrere Teams, keine zentrale Übersicht', after: 'Zentrale Planung für mehrere Teams' },
      { before: 'Ausgaben erst im Nachhinein erfasst', after: 'Ausgaben laufend der Baustelle zugeordnet' },
      { before: 'Rentabilität erst am Ende der Baustelle bekannt', after: 'Rentabilität in Echtzeit verfolgt' },
      { before: 'Rapporte und Fotos auf Beteiligte verstreut', after: 'Alles zentral nach Baustelle gebündelt' },
      { before: 'Dokumente auf mehrere Tools verteilt', after: 'Digitaler Ordner pro Baustelle' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Tiefbauunternehmen mit mehreren grossen Baustellen?',
        answer: 'Ja, die Planung für mehrere Baustellen und die Rentabilitätsübersicht pro Baustelle sind genau für diesen Anwendungsfall konzipiert.',
      },
      {
        question: 'Lassen sich Baustellenausgaben (Material, Maschinen, Subunternehmer) in Echtzeit verfolgen?',
        answer: 'Ja, jede Ausgabe wird der betreffenden Baustelle zugeordnet und laufend mit dem Offertbetrag verglichen.',
      },
      {
        question: 'Kann Cantia die Rentabilität mehrerer Baustellen parallel vergleichen?',
        answer: 'Ja, jede Baustelle zeigt ihre eigene Marge an, die sich projektübergreifend vergleichen lässt.',
      },
      {
        question: 'Lassen sich Rapporte und Fotos mehrerer Teams auf derselben Baustelle zentral bündeln?',
        answer: 'Ja, alles bleibt datiert und nach Baustelle abgelegt, zugänglich für das ganze Team.',
      },
      {
        question: 'Lässt sich Cantia für die Buchhaltung mit Bexio verbinden?',
        answer: 'Ja, die native Integration synchronisiert Kunden, Rechnungen und Zahlungen zwischen Cantia und Bexio, ab dem Plan Team.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['entreprise-generale', 'terrassier'],
  },

  terrassier: {
    slug: 'terrassier',
    tradeName: 'Erdbewegungsunternehmen',
    seo: {
      title: 'Verwaltungssoftware für Erdbewegungsunternehmen | Cantia',
      description:
        'Behalten Sie Maschinen, Teams, Stunden und Zusatzarbeiten im Blick – mit Cantia, der Verwaltungssoftware für Erdbewegungsunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Erdbewegungsunternehmen',
      title: 'Wissen Sie, was jede Baustelle kostet – bevor sie fertig ist',
      subtitle:
        'Cantia hilft Erdbewegungsunternehmen, die effektiven Kosten von Maschinen, Teams und unvorhergesehenen Bodenverhältnissen baustellengenau zu verfolgen.',
    },
    painPoints: [
      {
        problem: 'Die effektiven Kosten für Maschinen und Treibstoff werden nicht präzise pro Baustelle erfasst',
        consequence: 'Eine Erdbewegungsbaustelle kann auf dem Papier rentabel wirken und in Wirklichkeit doch defizitär sein.',
        response: 'Ordnen Sie Maschinen- und Treibstoffkosten der Baustelle zu und vergleichen Sie sie mit der Offerte.',
      },
      {
        problem: 'Unvorhergesehene Bodenverhältnisse (Fels, unterirdische Leitungen) verändern den Umfang der Baustelle',
        consequence: 'Ohne klare Dokumentation lässt sich der Mehraufwand gegenüber dem Kunden nur schwer begründen.',
        response: 'Erfassen Sie die Zusatzarbeit direkt vor Ort mit einem Foto – sie fliesst automatisch in die Rechnung ein.',
      },
      {
        problem: 'Die Stunden mehrerer Mitarbeiter und Maschinen lassen sich schwer auf die einzelnen Baustellen aufteilen',
        consequence: 'So lässt sich nicht genau feststellen, was eine Baustelle an Arbeitsaufwand tatsächlich gekostet hat.',
        response: 'Erfassen Sie die Stunden pro Mitarbeiter direkt auf der Baustelle.',
      },
    ],
    usages: [
      { icon: 'dollar-sign', title: 'Ausgabenübersicht', text: 'Maschinen und Treibstoff der richtigen Baustelle zugeordnet.' },
      { icon: 'clock', title: 'Stunden pro Mitarbeiter', text: 'Jede Person, jede Baustelle, jede Stunde erfasst.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Unvorhergesehene Bodenverhältnisse werden direkt mit Foto erfasst.' },
      { icon: 'trending-up', title: 'Rentabilität in Echtzeit', text: 'Vergleichen Sie Offerte und effektive Kosten während der Baustelle, nicht erst danach.' },
      { icon: 'image', title: 'Fotos vorher/nachher', text: 'Dokumentieren Sie den Zustand des Geländes vor und nach dem Aushub.' },
      { icon: 'credit-card', title: 'Offerten und Rechnungen', text: 'Von der ersten Offerte bis zur Schlussrechnung, ohne erneute Erfassung.' },
    ],
    scenario: {
      title: 'Beispiel: eine Erdbewegungsbaustelle mit unvorhergesehenen Bodenverhältnissen',
      text: 'Die ursprüngliche Offerte basiert auf dem Aufmass. Unerwarteter Fels erschwert den Aushub und verursacht zusätzliche Maschinenstunden, die als Zusatzarbeit mit Foto dokumentiert werden. Die Rentabilität der Baustelle bleibt trotz des Zwischenfalls durchgehend im Blick.',
    },
    comparison: [
      { before: 'Maschinen- und Treibstoffkosten nicht pro Baustelle erfasst', after: 'Ausgaben der Baustelle zugeordnet' },
      { before: 'Unvorhergesehene Bodenverhältnisse undokumentiert', after: 'Zusatzarbeiten mit Foto erfasst' },
      { before: 'Stunden mehrerer Mitarbeiter schwer aufzuteilen', after: 'Stunden Baustelle und Person zugeordnet' },
      { before: 'Rentabilität erst am Ende bekannt', after: 'Rentabilität in Echtzeit verfolgt' },
      { before: 'Fotos der Erdbewegung verstreut', after: 'Fotos nach Baustelle abgelegt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Erdbewegungsunternehmen?',
        answer: 'Ja, der Plan Essentiel deckt Offerten, Baustellen und Rechnungsstellung ab – ideal für ein Unternehmen, das startet oder in kleinem Team arbeitet.',
      },
      {
        question: 'Lassen sich Maschinen- und Treibstoffkosten pro Baustelle erfassen?',
        answer: 'Ja, jede Ausgabe wird der betreffenden Baustelle zugeordnet und mit dem Offertbetrag verglichen.',
      },
      {
        question: 'Wie dokumentiert man unvorhergesehene Bodenverhältnisse, die während der Baustelle entdeckt werden?',
        answer: 'Sie werden direkt mit einem Foto auf der Baustelle erfasst und durchlaufen anschliessend denselben Ablauf wie eine Offerte bis zur Rechnungsstellung.',
      },
      {
        question: 'Zeigt Cantia die Rentabilität einer Baustelle schon vor deren Abschluss?',
        answer: 'Ja, der Vergleich zwischen Offertbetrag und effektiven Kosten steht laufend zur Verfügung.',
      },
      {
        question: 'Kann ich die Stunden mehrerer Mitarbeiter pro Baustelle erfassen?',
        answer: 'Ja, jede erfasste Stunde wird einer Baustelle und der betreffenden Person zugeordnet.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['genie-civil', 'entreprise-renovation'],
  },

  'entreprise-renovation': {
    slug: 'entreprise-renovation',
    tradeName: 'Renovationsunternehmen',
    seo: {
      title: 'Verwaltungssoftware für Renovationsunternehmen | Cantia',
      description:
        'Verwalten Sie Ihre Renovationsbaustellen inklusive Überraschungen – mit Cantia, der Verwaltungssoftware für Bauunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für die Renovation',
      title: 'Bei Renovationen sind Überraschungen normal. Vergessene Rechnungspositionen sollten es nicht sein.',
      subtitle:
        'Cantia hilft Renovationsunternehmen, jede kurzfristige Änderung bis zur Schlussrechnung lückenlos nachzuverfolgen.',
    },
    painPoints: [
      {
        problem: 'Der Kunde ändert seine Meinung während der Baustelle',
        consequence: 'Eine mündliche, nicht dokumentierte Änderung bleibt oft unverrechnet.',
        response: 'Jede Änderung wird als Zusatzarbeit erfasst, beziffert und der Baustelle zugeordnet.',
      },
      {
        problem: 'Eine Überraschung hinter einer Wand verändert den Umfang der Arbeiten',
        consequence: 'Ohne visuellen Beleg zum Zeitpunkt der Entdeckung lässt sich der Mehraufwand nur schwer begründen.',
        response: 'Ein vor Ort aufgenommenes und der Baustelle zugeordnetes Foto begleitet jede Zusatzarbeit.',
      },
      {
        problem: 'Mehrere Gewerke sind im Einsatz, die Termine ändern sich laufend',
        consequence: 'Nach wenigen Wochen entspricht die ursprüngliche Planung nicht mehr der Realität auf der Baustelle.',
        response: 'Die Planung wird laufend aktualisiert und ist für das ganze Team und die Subunternehmer sichtbar.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Renovationsofferten', text: 'Erstellen Sie die Offerte direkt aus dem bei der Begehung erfassten Aufmass.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Überraschungen und Kundenänderungen dokumentiert und verrechnet.' },
      { icon: 'image', title: 'Fotos vorher/während/nachher', text: 'Jede Entdeckung und jede Etappe bleibt nachvollziehbar dokumentiert.' },
      { icon: 'calendar', title: 'Flexible Planung', text: 'Passen Sie die Planung einfach an, wenn sich Termine ändern.' },
      { icon: 'users', title: 'Koordination der Subunternehmer', text: 'Behalten Sie mehrere Gewerke auf derselben Baustelle im Blick.' },
      { icon: 'credit-card', title: 'Etappenweise Rechnungsstellung', text: 'Stellen Sie im Verlauf der Baustelle Rechnung, ohne bis zum Schluss zu warten.' },
    ],
    scenario: {
      title: 'Beispiel: eine Wohnungsrenovation mit mehreren Überraschungen',
      text: 'Die ursprüngliche Offerte basiert auf der Begehung. Die Baustelle startet mit mehreren Gewerken. Eine Überraschung hinter einer Wand und anschliessend eine Meinungsänderung des Kunden werden als dokumentierte Zusatzarbeiten erfasst. Die Planung wird laufend angepasst, und die Schlussrechnung berücksichtigt sämtliche tatsächlich ausgeführten Arbeiten.',
    },
    comparison: [
      { before: 'Meinungsänderung des Kunden nicht dokumentiert', after: 'Zusatzarbeit beziffert und erfasst' },
      { before: 'Überraschung hinter einer Wand ohne Beleg', after: 'Foto zum Zeitpunkt der Entdeckung mit der Baustelle verknüpft' },
      { before: 'Starre Planung, die nicht mehr der Realität entspricht', after: 'Laufend angepasste Planung' },
      { before: 'Mehrere Gewerke per Telefonanruf koordiniert', after: 'Zentrale und geteilte Koordination' },
      { before: 'Rechnung am Ende der Baustelle aus dem Gedächtnis rekonstruiert', after: 'Rechnung, die jede dokumentierte Zusatzarbeit berücksichtigt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein auf Renovationen spezialisiertes Unternehmen?',
        answer: 'Ja, die Erfassung von Zusatzarbeiten und die flexible Planung sind genau auf die häufigen Überraschungen bei Renovationen ausgerichtet.',
      },
      {
        question: 'Wie dokumentiert man eine Meinungsänderung des Kunden während der Baustelle?',
        answer: 'Sie wird als bezifferte Zusatzarbeit mit einer Anmerkung erfasst und fliesst in die Rechnungsstellung ein.',
      },
      {
        question: 'Kann ich eine Überraschung hinter einer Wand mit einem Foto dokumentieren?',
        answer: 'Ja, das Foto wird direkt zum Zeitpunkt der Entdeckung mit der Baustelle verknüpft.',
      },
      {
        question: 'Lässt sich mit Cantia die Planung anpassen, wenn sich Termine häufig ändern?',
        answer: 'Ja, die Planung wird laufend aktualisiert und bleibt für das ganze Team und die Subunternehmer sichtbar.',
      },
      {
        question: 'Wie koordiniert man mehrere Gewerke auf derselben Renovationsbaustelle?',
        answer: 'Die Baustelle bündelt Dokumente, Planung und Subunternehmer zentral – einsehbar für alle Beteiligten.',
      },
    ],
    relatedBlogSlugs: ['calculer-prix-devis-renovation-suisse'],
    relatedTrades: ['entreprise-generale', 'macon'],
  },

  serrurier: {
    slug: 'serrurier',
    tradeName: 'Schlosser',
    seo: {
      title: 'Verwaltungssoftware für Schlosser in der Schweiz | Cantia',
      description:
        'Behalten Sie Fertigung, Montage und Änderungen im Blick – mit Cantia, der Verwaltungssoftware für Schlossereien und den Metallbau.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Schlosser',
      title: 'Werkstatt, Baustelle, Montage: jede Information bleibt am Projekt',
      subtitle:
        'Cantia hilft Schlossereien und Metallbaubetrieben, ihre Aufträge vom Aufmass bis zur Montage lückenlos zu verfolgen.',
    },
    painPoints: [
      {
        problem: 'Aufmass in der Werkstatt und Montage auf der Baustelle liegen manchmal Wochen auseinander',
        consequence: 'Ohne Verknüpfung gehen zwischen den beiden Etappen Informationen verloren.',
        response: 'Die Baustelle bündelt Masse und Anmerkungen, die vom Anfang bis zum Ende mit dem Projekt verknüpft bleiben.',
      },
      {
        problem: 'Eine Änderung wird nach der Fertigung verlangt',
        consequence: 'Fehler- oder kostspieliges Nacharbeitsrisiko, wenn die Information nicht rechtzeitig in der Werkstatt ankommt.',
        response: 'Die Änderung wird direkt auf der Baustelle erfasst und ist für die Werkstatt schon vor der Montage sichtbar.',
      },
      {
        problem: 'Der Status eines Auftrags (Aufmass, Fertigung, Montage) ist nicht immer klar',
        consequence: 'Der Chef muss angefragt werden, um den Stand jedes Projekts zu erfahren.',
        response: 'Status und Planung werden zwischen Werkstatt und Montageteam geteilt.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerten aus Massaufnahme', text: 'Erstellen Sie die Offerte direkt aus den vor Ort genommenen Massen.' },
      { icon: 'file-text', title: 'Auftragsverfolgung', text: 'Aufmass, Fertigung und Montage in derselben Baustelle verfolgt.' },
      { icon: 'calendar', title: 'Planung Werkstatt und Montage', text: 'Koordinieren Sie Fertigung und Montage ohne zusätzliche Telefonate.' },
      { icon: 'image', title: 'Fotos von Fertigung und Montage', text: 'Dokumentieren Sie jede Etappe, von der Werkstatt bis zur Baustelle.' },
      { icon: 'plus-circle', title: 'Änderungen', text: 'Eine kurzfristige Anfrage wird direkt im Projekt erfasst.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt den bestätigten Auftrag, ohne erneute Erfassung.' },
    ],
    scenario: {
      title: 'Beispiel: ein Auftrag für ein Metallgeländer, vom Aufmass bis zur Montage',
      text: 'Das vor Ort genommene Aufmass fliesst in die Offerte ein. Die Fertigung wird in der Werkstatt verfolgt. Eine vom Kunden gewünschte Änderung der Oberfläche wird direkt auf der Baustelle erfasst. Die Montage wird geplant und mit Fotos dokumentiert, und die Rechnung wird anschliessend aus der ursprünglichen Offerte erstellt.',
    },
    comparison: [
      { before: 'Aufmass und Fertigung getrennt verfolgt', after: 'Zentrale Baustelle von Anfang bis Ende' },
      { before: 'Änderung nach der Fertigung schlecht kommuniziert', after: 'Änderung direkt auf der Baustelle erfasst' },
      { before: 'Auftragsstatus nur dem Chef bekannt', after: 'Status zwischen Werkstatt und Montage geteilt' },
      { before: 'Fotos von Fertigung und Montage verstreut', after: 'Fotos nach Baustelle abgelegt' },
      { before: 'Offerte bei jedem neuen Auftrag neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für eine Schlosserei oder einen Metallbaubetrieb?',
        answer: 'Ja, die Auftragsverfolgung vom Aufmass bis zur Montage ist genau auf diesen mehrstufigen Ablauf zugeschnitten.',
      },
      {
        question: 'Wie verfolgt man einen Auftrag von der Massaufnahme bis zur Montage?',
        answer: 'Die Baustelle bündelt Masse, Fertigungsstatus und Montageplanung an einem Ort.',
      },
      {
        question: 'Was passiert, wenn der Kunde eine Änderung nach der Fertigung wünscht?',
        answer: 'Sie wird direkt auf der Baustelle erfasst und ist für die Werkstatt schon vor der Montage sichtbar.',
      },
      {
        question: 'Lassen sich Werkstatt und Montageteam mit Cantia koordinieren?',
        answer: 'Ja, der Status jedes Auftrags wird zwischen beiden geteilt.',
      },
      {
        question: 'Lassen sich mit Cantia Offerten mit massgeschneiderten Leistungen erstellen?',
        answer: 'Ja, ein wiederverwendbarer Katalog beschleunigt die Kalkulation und lässt gleichzeitig Raum für individuelle Positionen.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-serrurier-metallier-suisse'],
    relatedTrades: ['menuisier', 'construction-bois'],
  },

  ferblantier: {
    slug: 'ferblantier',
    tradeName: 'Spengler',
    seo: {
      title: 'Verwaltungssoftware für Spengler in der Schweiz | Cantia',
      description:
        'Verwalten Sie Offerten, Masse und einzelne Einsätze – mit Cantia, der Verwaltungssoftware für Spenglereien in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Spengler',
      title: 'Ihre Masse, Arbeiten und Rechnungen an einem Ort',
      subtitle:
        'Cantia hilft Spenglereien, ihre oft punktuellen Einsätze zu verfolgen, ohne dass unterwegs ein einziges Mass verloren geht.',
    },
    painPoints: [
      {
        problem: 'Spenglereinsätze sind oft punktuell und mit anderen Gewerken verknüpft',
        consequence: 'Ohne zentrales Hilfsmittel ist es schwierig, bei jedem Einsatz den Überblick zu behalten.',
        response: 'Jeder Einsatz wird zu einer Baustelle mit eigenen Massen und Dokumenten.',
      },
      {
        problem: 'Vor Ort genommene Masse (Dachrinnen, Kastenrinnen, Verkleidungen) müssen bis zur Rechnungsstellung präzise bleiben',
        consequence: 'Ein von Hand notiertes Mass kann verloren gehen oder später falsch übernommen werden.',
        response: 'Masse und Anmerkungen sind direkt mit der Baustelle verknüpft und jederzeit einsehbar.',
      },
      {
        problem: 'Ein abgeschlossener Einsatz wird nicht rasch verrechnet',
        consequence: 'Der administrative Aufwand häuft sich zwischen mehreren kleinen Baustellen an.',
        response: 'Die Rechnung wird direkt nach Abschluss des Einsatzes aus der Offerte generiert.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerten aus Massaufnahme', text: 'Erstellen Sie die Offerte direkt aus den vor Ort genommenen Massen.' },
      { icon: 'file-text', title: 'Einsatzverfolgung', text: 'Jeder Einsatz wird zu einer nachverfolgten Baustelle.' },
      { icon: 'image', title: 'Fotos vorher/nachher', text: 'Dokumentieren Sie jeden Einsatz, auch punktuelle.' },
      { icon: 'users', title: 'Koordination', text: 'Arbeiten Sie im Verbund mit anderen Gewerken (Dach, Fassade).' },
      { icon: 'credit-card', title: 'Schnelle Rechnungsstellung', text: 'Stellen Sie direkt nach Abschluss des Einsatzes Rechnung.' },
      { icon: 'list', title: 'Leistungskatalog', text: 'Ihre gängigen Leistungen gespeichert und wiederverwendbar.' },
    ],
    scenario: {
      title: 'Beispiel: eine Dachrinnensanierung nach einer Dachdiagnose',
      text: 'Die Masse werden vor Ort genommen. Die Offerte wird mit dem Leistungskatalog erstellt. Der Einsatz wird mit Fotos dokumentiert. Die Rechnung wird direkt nach Abschluss der Arbeiten generiert.',
    },
    comparison: [
      { before: 'Masse von Hand notiert', after: 'Masse direkt mit der Baustelle verknüpft' },
      { before: 'Punktuelle Einsätze schlecht zentralisiert', after: 'Jeder Einsatz wird zu einer nachverfolgten Baustelle' },
      { before: 'Rechnung erst im Nachhinein versendet', after: 'Rechnung aus der Offerte generiert' },
      { before: 'Koordination mit anderen Gewerken per Telefon', after: 'Geteilte und einsehbare Baustelle' },
      { before: 'Einsatzfotos verstreut', after: 'Fotos nach Baustelle abgelegt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für eine Spenglerei?',
        answer: 'Ja, der Plan Essentiel deckt Offerten, Einsätze und Rechnungsstellung ab – ideal für ein Unternehmen, das startet oder in kleinem Team arbeitet.',
      },
      {
        question: 'Kann ich vor Ort genommene, präzise Masse erfassen?',
        answer: 'Ja, Masse und Anmerkungen bleiben direkt mit der Baustelle verknüpft.',
      },
      {
        question: 'Wie koordiniert man einen Einsatz mit anderen Gewerken (Dach, Fassade)?',
        answer: 'Die Baustelle bleibt für alle beteiligten Gewerke geteilt und einsehbar.',
      },
      {
        question: 'Lässt sich mit Cantia ein kleiner Einsatz rasch verrechnen?',
        answer: 'Ja, eine Rechnung kann direkt nach Abschluss des Einsatzes aus der Offerte generiert werden.',
      },
      {
        question: 'Kann ich zu jedem Einsatz Vorher-/Nachher-Fotos hinzufügen?',
        answer: 'Ja, die Fotos werden automatisch nach Baustelle abgelegt.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'etancheur'],
  },

  facadier: {
    slug: 'facadier',
    tradeName: 'Fassadenbauer',
    seo: {
      title: 'Verwaltungssoftware für Fassadenbauer in der Schweiz | Cantia',
      description:
        'Behalten Sie Flächen, Varianten und Baufortschritt im Blick – mit Cantia, der Verwaltungssoftware für Fassadenbaubetriebe in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Fassadenbauer',
      title: 'Behalten Sie bei jeder Fassade den Überblick, von der Offerte bis zur Abnahme',
      subtitle:
        'Cantia hilft Fassadenbaubetrieben, ihre Flächen zu kalkulieren, Farbtonvarianten zu verwalten und den Baufortschritt zu teilen.',
    },
    painPoints: [
      {
        problem: 'Fassadenflächen werden bei jeder Offerte neu berechnet',
        consequence: 'Zeitverlust durch sich wiederholende Aufmasse von Baustelle zu Baustelle.',
        response: 'Das Fassadenaufmass ist in die Offerte integriert, mit einem wiederverwendbaren Leistungskatalog.',
      },
      {
        problem: 'Eine Farbton- oder Oberflächenvariante wird während der Baustelle entschieden',
        consequence: 'Schwierig, sie vor Ort rasch zu kalkulieren und bestätigen zu lassen.',
        response: 'Passen Sie die Offerte direkt an, die Zusatzarbeiten werden separat nachverfolgt.',
      },
      {
        problem: 'Der Fortschritt einer Fassadenbaustelle lässt sich dem Kunden nur schwer vermitteln',
        consequence: 'Der Kunde beunruhigt sich oder fragt nach, wenn er keinen klaren Einblick in die Baustelle hat.',
        response: 'Fortschrittsfotos, die mit der Baustelle verknüpft und jederzeit einsehbar sind.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerten mit Fassadenaufmass', text: 'Kalkulieren Sie rasch auf Basis der gemessenen Flächen.' },
      { icon: 'list', title: 'Farbtonkatalog', text: 'Ihre gängigen Leistungen und Farbtöne gespeichert.' },
      { icon: 'image', title: 'Fortschrittsfotos', text: 'Teilen Sie den Baustellenstand bei jeder Etappe.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Eine während der Baustelle entschiedene Variante wird direkt erfasst.' },
      { icon: 'calendar', title: 'Teamplanung', text: 'Organisieren Sie Ihre Teams auf mehreren Fassadenbaustellen.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt die tatsächlich erbrachten Leistungen.' },
    ],
    scenario: {
      title: 'Beispiel: eine Fassadenrenovation mit Farbtonvariante',
      text: 'Das ursprüngliche Aufmass fliesst in die Offerte ein. Die Baustelle wird mit regelmässigen Fortschrittsfotos geplant. Eine während der Arbeiten gewünschte Farbtonvariante wird als Zusatzarbeit erfasst. Die Schlussrechnung berücksichtigt das Gesamte.',
    },
    comparison: [
      { before: 'Fassadenflächen bei jeder Offerte neu berechnet', after: 'Integriertes Aufmass und wiederverwendbarer Katalog' },
      { before: 'Farbtonvariante vor Ort schwer zu kalkulieren', after: 'Rasche Anpassung aus dem Katalog' },
      { before: 'Baufortschritt für den Kunden wenig sichtbar', after: 'Fortschrittsfotos mit der Baustelle verknüpft' },
      { before: 'Offerte bei jeder neuen Baustelle neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
      { before: 'Rechnung am Ende der Baustelle rekonstruiert', after: 'Rechnung aus der Offerte generiert' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen Fassadenbaubetrieb?',
        answer: 'Ja, der Plan Essentiel deckt Offerten, Baustellen und Rechnungsstellung ab – ideal für ein Unternehmen, das startet oder in kleinem Team arbeitet.',
      },
      {
        question: 'Kann ich ein Fassadenaufmass direkt in die Offerte integrieren?',
        answer: 'Ja, das Aufmass fliesst direkt in die Offerte ein, mit einem wiederverwendbaren Leistungskatalog.',
      },
      {
        question: 'Wie verwaltet man eine während der Baustelle gewünschte Farbton- oder Oberflächenvariante?',
        answer: 'Sie wird direkt in der Offerte erfasst, die Zusatzarbeiten werden separat nachverfolgt.',
      },
      {
        question: 'Lässt sich mit Cantia der Baufortschritt mit dem Kunden teilen?',
        answer: 'Ja, die Fortschrittsfotos bleiben mit der Baustelle verknüpft und sind jederzeit einsehbar.',
      },
      {
        question: 'Kann ich zu jeder Bauetappe Fotos hinzufügen?',
        answer: 'Ja, automatisch nach Baustelle abgelegt.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-facadier-isolation-suisse'],
    relatedTrades: ['peintre', 'etancheur'],
  },
  etancheur: {
    slug: 'etancheur',
    tradeName: 'Abdichter',
    seo: {
      title: 'Verwaltungssoftware für Abdichter in der Schweiz | Cantia',
      description:
        'Dokumentieren Sie Ihre Einsätze präzise mit Cantia, der Verwaltungssoftware für Abdichtungsunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Abdichter',
      title: 'Fotos, Rapporte und Nachverfolgung: Behalten Sie jeden Einsatz klar im Blick',
      subtitle:
        'Cantia hilft Abdichtungsunternehmen, jede bearbeitete Zone präzise zu dokumentieren und ihre Rapporte automatisch zu erstellen.',
    },
    painPoints: [
      {
        problem: 'Die bei einem Einsatz bearbeiteten Zonen müssen präzise dokumentiert werden',
        consequence: 'Ohne klaren Nachweis wird eine Garantie oder ein Streitfall schwer zu klären.',
        response: 'Georeferenzierte Fotos, Zone für Zone mit der Baustelle verknüpft.',
      },
      {
        problem: 'Ein nachträglich entdeckter Mangel muss dem ursprünglichen Einsatz zugeordnet werden können',
        consequence: 'Ohne klare Historie lässt sich nicht schnell feststellen, was wo gemacht wurde.',
        response: 'Jede Baustelle behält ihre vollständige Historie (Fotos, Bemerkungen, Dokumente).',
      },
      {
        problem: 'Einsatzrapporte kosten abends Zeit beim Schreiben',
        consequence: 'Der Verwaltungsaufwand summiert sich nach einem bereits vollen Arbeitstag.',
        response: 'Der Rapport wird automatisch aus den vor Ort aufgenommenen Fotos und Notizen erstellt.',
      },
    ],
    usages: [
      { icon: 'image', title: 'Fotos je bearbeiteter Zone', text: 'Automatisch georeferenziert, Zone für Zone.' },
      { icon: 'file-text', title: 'Automatische Rapporte', text: 'Erstellt aus den Fotos und Notizen der Baustelle.' },
      { icon: 'mic', title: 'Offerten für Abdichtungsarbeiten', text: 'Kalkulieren Sie schnell aus Ihrem Leistungskatalog.' },
      { icon: 'folder', title: 'Vollständige Historie', text: 'Finden Sie jederzeit alles wieder, was auf einer Baustelle gemacht wurde.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Ein während des Einsatzes entdeckter Mangel wird direkt hinzugefügt.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt die effektiv erbrachten Leistungen.' },
    ],
    scenario: {
      title: 'Beispiel: ein Abdichtungseinsatz auf einer Dachterrasse',
      text: 'Die Diagnose wird fotografisch festgehalten. Die Offerte wird erstellt. Der Einsatz wird Zone für Zone mit georeferenzierten Fotos dokumentiert. Der Rapport wird automatisch erstellt, und die Rechnung übernimmt die ursprüngliche Offerte.',
    },
    comparison: [
      { before: 'Bearbeitete Zonen nicht präzise dokumentiert', after: 'Georeferenzierte Fotos je Zone' },
      { before: 'Nachträglicher Mangel schwer dem Einsatz zuzuordnen', after: 'Vollständige Historie je Baustelle' },
      { before: 'Einsatzrapport abends geschrieben', after: 'Rapport aus Fotos und Notizen erstellt' },
      { before: 'Offerte bei jedem Einsatz neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
      { before: 'Rechnung nachträglich verschickt', after: 'Rechnung aus der Offerte erstellt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Abdichtungsunternehmen?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Einsätze und Rechnungsstellung für ein Unternehmen ab, das startet oder in einem kleinen Team arbeitet.',
      },
      {
        question: 'Kann ich die Fotos jeder bearbeiteten Zone georeferenzieren?',
        answer: 'Ja, jedes Foto wird automatisch georeferenziert und mit der Baustelle verknüpft.',
      },
      {
        question: 'Wie finde ich die Historie eines Einsatzes bei einem nachträglich entdeckten Mangel?',
        answer: 'Jede Baustelle behält ihre vollständige Historie (Fotos, Bemerkungen, Dokumente), jederzeit einsehbar.',
      },
      {
        question: 'Ermöglicht Cantia die automatische Erstellung eines Einsatzrapports?',
        answer: 'Ja, der Rapport wird aus den vor Ort aufgenommenen Fotos und Notizen erstellt.',
      },
      {
        question: 'Kann ich während des Einsatzes entdeckte Zusatzarbeiten hinzufügen?',
        answer: 'Ja, sie werden direkt der Baustelle hinzugefügt und in der Rechnungsstellung berücksichtigt.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'facadier'],
  },

  'construction-bois': {
    slug: 'construction-bois',
    tradeName: 'Holzbauunternehmen',
    seo: {
      title: 'Verwaltungssoftware für Holzbauunternehmen in der Schweiz | Cantia',
      description:
        'Koordinieren Sie Planung, Fertigung und Montage mit Cantia, der Verwaltungssoftware für Holzbauunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Holzbauunternehmen',
      title: 'Vom Planungsbüro bis zur Montage: jede Projektphase bleibt verbunden',
      subtitle:
        'Cantia hilft Holzbauunternehmen, ihre Projekte von der Planung bis zur Montage zu verfolgen, ohne dass unterwegs Informationen verloren gehen.',
    },
    painPoints: [
      {
        problem: 'Ein Holzbauprojekt durchläuft mehrere Etappen über mehrere Wochen',
        consequence: 'Die Informationen verteilen sich zwischen den Etappen, wenn nichts sie verbindet.',
        response: 'Eine zentrale Baustelle, vom Planungsbüro bis zur endgültigen Montage.',
      },
      {
        problem: 'Eine Änderung wird nach der Fertigung in der Werkstatt beschlossen',
        consequence: 'Risiko eines Montagefehlers, wenn die Information nicht rechtzeitig auf der Baustelle ankommt.',
        response: 'Die Änderung wird direkt der Baustelle hinzugefügt, sichtbar für das gesamte Team.',
      },
      {
        problem: 'Der Fortschritt einer mehrwöchigen Baustelle ist schwer zu kommunizieren',
        consequence: 'Kunde und Team verlieren beide den Überblick über das Projekt.',
        response: 'Fortschrittsfotos und -rapporte, die mit der Baustelle verknüpft sind und jederzeit einsehbar bleiben.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerte direkt aus der Planung', text: 'Kalkulieren Sie Ihr Projekt direkt nach dem Planungsbüro.' },
      { icon: 'file-text', title: 'Projektverfolgung', text: 'Planung, Fertigung und Montage in derselben Baustelle verfolgt.' },
      { icon: 'calendar', title: 'Werkstatt- und Baustellenplanung', text: 'Koordinieren Sie Fertigung und Montage ohne Zwischenanruf.' },
      { icon: 'image', title: 'Fortschrittsfotos', text: 'Teilen Sie den Projektstand bei jeder Etappe.' },
      { icon: 'plus-circle', title: 'Änderungen', text: 'Eine Anfrage in letzter Minute wird direkt der Baustelle hinzugefügt.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt die ursprüngliche Offerte, ohne erneute Erfassung.' },
    ],
    scenario: {
      title: 'Beispiel: ein Anbau in Holzrahmenbauweise, von der Planung bis zur Montage',
      text: 'Die Offerte wird nach der Planung erstellt. Die Fertigung wird in der Werkstatt verfolgt. Die Montage wird geplant und fotografisch dokumentiert. Eine Änderung in letzter Minute wird direkt der Baustelle hinzugefügt, und die Rechnung wird aus der ursprünglichen Offerte erstellt.',
    },
    comparison: [
      { before: 'Planung, Fertigung und Montage getrennt verfolgt', after: 'Zentrale Baustelle von Anfang bis Ende' },
      { before: 'Änderung nach der Fertigung schlecht kommuniziert', after: 'Änderung direkt der Baustelle hinzugefügt' },
      { before: 'Projektfortschritt kaum sichtbar', after: 'Fortschrittsfotos und -rapporte mit der Baustelle verknüpft' },
      { before: 'Offerte bei jedem neuen Projekt neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
      { before: 'Rechnung am Projektende rekonstruiert', after: 'Rechnung aus der Offerte erstellt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Holzbauunternehmen?',
        answer: 'Ja, die mehrstufige Projektverfolgung (Planung, Fertigung, Montage) entspricht genau dieser Arbeitsweise.',
      },
      {
        question: 'Wie verfolge ich ein Projekt von der Planung bis zur Montage?',
        answer: 'Die Baustelle zentralisiert jede Etappe mit ihren Dokumenten und ihrem Status an einem Ort.',
      },
      {
        question: 'Was passiert, wenn nach der Fertigung eine Änderung beschlossen wird?',
        answer: 'Sie wird direkt der Baustelle hinzugefügt, sichtbar für das gesamte Team vor der Montage.',
      },
      {
        question: 'Ermöglicht Cantia, den Fortschritt einer Baustelle mit dem Kunden zu teilen?',
        answer: 'Ja, die Fortschrittsfotos und -rapporte bleiben mit der Baustelle verknüpft.',
      },
      {
        question: 'Kann ich Werkstatt und Montageteam mit Cantia koordinieren?',
        answer: 'Ja, die Planung wird zwischen beiden geteilt.',
      },
    ],
    relatedBlogSlugs: ['devis-charpente-bois-facturation-suisse'],
    relatedTrades: ['charpentier', 'menuisier'],
  },

  vitrier: {
    slug: 'vitrier',
    tradeName: 'Glaser',
    seo: {
      title: 'Verwaltungssoftware für Glaser in der Schweiz | Cantia',
      description:
        'Organisieren Sie Aufmass, Bestellungen, Montagen und Einsätze mit Cantia, der Verwaltungssoftware für Glasereibetriebe in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Glaser',
      title: 'Vom Aufmass bis zur Montage geht keine Information verloren',
      subtitle:
        'Cantia hilft Glasereibetrieben, ihre Aufmasse, Bestellungen und Einsätze zu verfolgen, von den geplanten bis zu den dringendsten.',
    },
    painPoints: [
      {
        problem: 'Ein präzises Aufmass muss bis zur Bestellung und Montage exakt bleiben',
        consequence: 'Ein handschriftlich notierter Messfehler kann bei der Nachbesserung teuer werden.',
        response: 'Die Masse bleiben direkt mit der Baustelle verknüpft, bei jeder Etappe einsehbar.',
      },
      {
        problem: 'Glasbestellungen haben teils mehrere Wochen Lieferzeit',
        consequence: 'Ohne klare Nachverfolgung ist schwer zu wissen, wo jede Bestellung steht.',
        response: 'Der Bestellstatus wird pro Baustelle verfolgt, sichtbar für das gesamte Team.',
      },
      {
        problem: 'Ein Reparatureinsatz (Glasbruch) muss schnell erledigt werden',
        consequence: 'Ohne Zentralisierung wird der Notfall unter Zeitdruck erledigt, mit dem Risiko, die Rechnungsstellung zu vergessen.',
        response: 'Der Einsatz wird direkt von der Baustelle aus erfasst und in Rechnung gestellt.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerte direkt aus dem Aufmass', text: 'Kalkulieren Sie direkt aus den vor Ort genommenen Massen.' },
      { icon: 'file-text', title: 'Bestellverfolgung', text: 'Bestellstatus pro Baustelle verfolgt, bis zur Montage.' },
      { icon: 'calendar', title: 'Montageplanung', text: 'Organisieren Sie Ihre Montagen sofort nach Eingang der Verglasung.' },
      { icon: 'zap', title: 'Dringende Einsätze', text: 'Ein Glasbruch schnell erfasst und in Rechnung gestellt.' },
      { icon: 'image', title: 'Vorher-/Nachher-Fotos', text: 'Dokumentieren Sie jeden Einsatz.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt die bestätigte Bestellung.' },
    ],
    scenario: {
      title: 'Beispiel: ein Glasersatz nach einem Glasbruch',
      text: 'Der Noteinsatz wird erfasst. Das Mass wird vor Ort genommen, die Offerte erstellt und die Bestellung verfolgt. Die Montage wird sofort nach Wareneingang geplant, und die Rechnung wird aus der Offerte erstellt.',
    },
    comparison: [
      { before: 'Masse handschriftlich notiert', after: 'Masse direkt mit der Baustelle verknüpft' },
      { before: 'Bestellstatus nur dem Chef bekannt', after: 'Status verfolgt und geteilt' },
      { before: 'Reparatur unter Zeitdruck erledigt', after: 'Einsatz direkt erfasst und in Rechnung gestellt' },
      { before: 'Vorher-/Nachher-Fotos verstreut', after: 'Fotos nach Baustelle sortiert' },
      { before: 'Offerte bei jedem Einsatz neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen Glasereibetrieb?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Einsätze und Rechnungsstellung für ein Unternehmen ab, das startet oder in einem kleinen Team arbeitet.',
      },
      {
        question: 'Kann ich vor Ort genommene, präzise Masse erfassen?',
        answer: 'Ja, die Masse bleiben direkt mit der Baustelle verknüpft.',
      },
      {
        question: 'Wie verfolge ich den Status einer Glasbestellung während der Lieferzeit?',
        answer: 'Der Bestellstatus wird pro Baustelle verfolgt und ist für das gesamte Team sichtbar.',
      },
      {
        question: 'Ermöglicht Cantia die Verwaltung eines dringenden Reparatureinsatzes?',
        answer: 'Ja, der Einsatz kann direkt von der Baustelle aus erfasst und in Rechnung gestellt werden.',
      },
      {
        question: 'Kann ich nach einem Glasersatz schnell fakturieren?',
        answer: 'Ja, eine Rechnung kann direkt nach Abschluss der Montage aus der Offerte erstellt werden.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['menuisier', 'serrurier'],
  },

  parqueteur: {
    slug: 'parqueteur',
    tradeName: 'Parkettleger',
    seo: {
      title: 'Verwaltungssoftware für Parkettleger in der Schweiz | Cantia',
      description:
        'Verfolgen Sie Flächen, Materialien, Teams und Verlegezeiten mit Cantia, der Verwaltungssoftware für Bodenlegebetriebe in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Parkettleger',
      title: 'Ihre Flächen sind berechnet. Ihre Margen sollten es auch sein.',
      subtitle:
        'Cantia hilft Bodenlegebetrieben, ihre Flächen schnell zu kalkulieren und zu wissen, was eine Verlegebaustelle wirklich einbringt.',
    },
    painPoints: [
      {
        problem: 'Die Bodenflächen werden bei jeder Offerte neu berechnet',
        consequence: 'Zeitverlust durch sich wiederholende Aufmasse von Baustelle zu Baustelle.',
        response: 'Das Flächenaufmass ist in die Offerte integriert, mit einem wiederverwendbaren Materialkatalog.',
      },
      {
        problem: 'Eine Material- oder Verlegevariante wird während der Baustelle verlangt',
        consequence: 'Schwer, das vor Ort schnell zu kalkulieren.',
        response: 'Passen Sie die Offerte direkt an, die Zusatzarbeiten werden separat verfolgt.',
      },
      {
        problem: 'Die tatsächliche Verlegezeit wird nie mit dem Offerierten verglichen',
        consequence: 'Unmöglich zu wissen, ob eine Verlegebaustelle wirklich rentabel war.',
        response: 'Erfassen Sie die Stunden auf der Baustelle, verglichen mit dem Offerierten.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Offerte mit Flächenaufmass', text: 'Kalkulieren Sie schnell anhand der gemessenen Flächen.' },
      { icon: 'list', title: 'Materialkatalog', text: 'Ihre üblichen Leistungen und Materialien gespeichert.' },
      { icon: 'clock', title: 'Verfolgung der Verlegestunden', text: 'Vergleichen Sie geplante mit tatsächlich aufgewendeter Zeit.' },
      { icon: 'image', title: 'Vorher-/Nachher-Fotos', text: 'Behalten Sie einen visuellen Nachweis jeder Baustelle.' },
      { icon: 'plus-circle', title: 'Zusatzarbeiten', text: 'Eine Materialvariante wird direkt hinzugefügt.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Die Rechnung übernimmt die bestätigten Leistungen.' },
    ],
    scenario: {
      title: 'Beispiel: eine Parkettverlegung mit Materialvariante',
      text: 'Das Flächenaufmass fliesst in eine mit dem Katalog erstellte Offerte ein. Eine während der Baustelle verlangte Materialvariante wird als Zusatzarbeit hinzugefügt. Die Verlegestunden werden erfasst, und die Schlussrechnung übernimmt alles.',
    },
    comparison: [
      { before: 'Flächen bei jeder Offerte neu berechnet', after: 'Aufmass in die Offerte integriert' },
      { before: 'Materialvariante vor Ort schwer zu kalkulieren', after: 'Schnelle Anpassung aus dem Katalog' },
      { before: 'Verlegezeit nie mit dem Offerierten verglichen', after: 'Stunden erfasst und mit dem Offerierten verglichen' },
      { before: 'Verlegefotos verstreut', after: 'Fotos nach Baustelle sortiert' },
      { before: 'Offerte bei jeder neuen Baustelle neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für einen selbstständigen Parkettleger oder ein kleines Team?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Katalog und Rechnungsstellung für ein Unternehmen ab, das allein oder in einem kleinen Team arbeitet.',
      },
      {
        question: 'Kann ich ein Flächenaufmass direkt in die Offerte integrieren?',
        answer: 'Ja, das Aufmass fliesst direkt in die Offerte ein.',
      },
      {
        question: 'Wie verwalte ich eine während der Baustelle verlangte Materialvariante?',
        answer: 'Sie wird direkt in der Offerte aus dem Katalog hinzugefügt.',
      },
      {
        question: 'Ermöglicht Cantia den Vergleich der tatsächlichen Verlegezeit mit der Offerte?',
        answer: 'Ja, die pro Baustelle erfassten Stunden werden mit dem offerierten Betrag verglichen.',
      },
      {
        question: 'Kann ich für jede Baustelle Vorher-/Nachher-Fotos hinzufügen?',
        answer: 'Ja, die Fotos werden automatisch nach Baustelle sortiert.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['carreleur', 'menuisier'],
  },

  echafaudeur: {
    slug: 'echafaudeur',
    tradeName: 'Gerüstbauer',
    seo: {
      title: 'Verwaltungssoftware für Gerüstbauer in der Schweiz | Cantia',
      description:
        'Organisieren Sie Auf- und Abbau sowie Teams mit Cantia, der Verwaltungssoftware für Gerüstbauunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für Gerüstbauer',
      title: 'Planen Sie Ihre Teams und behalten Sie jede Baustelle unter Kontrolle',
      subtitle:
        'Cantia hilft Gerüstbauunternehmen, Auf- und Abbau mit anderen Gewerken zu koordinieren, ohne Zeit- oder Mietverlust.',
    },
    painPoints: [
      {
        problem: 'Auf- und Abbau müssen präzise mit anderen Gewerken abgestimmt werden',
        consequence: 'Ein schlechtes Timing blockiert die nächste Baustelle oder bindet unnötig Material.',
        response: 'Eine zentrale Planung, abgestimmt mit den Terminen der anderen Beteiligten.',
      },
      {
        problem: 'Die tatsächliche Mietdauer eines Gerüsts überschreitet manchmal das Geplante',
        consequence: 'Ohne klare Nachverfolgung wird der Mietmehrbetrag nicht immer fakturiert.',
        response: 'Jede Baustelle verfolgt ihre tatsächlichen Auf- und Abbautermine, die in die Rechnungsstellung übernommen werden.',
      },
      {
        problem: 'Der Materialzustand und die Montagesicherheit müssen dokumentiert werden',
        consequence: 'Bei einer Kontrolle oder einem Streitfall erschwert das Fehlen von Nachweisen alles.',
        response: 'Fotos und Bemerkungen, die mit der Baustelle verknüpft und automatisch datiert werden.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Auf-/Abbauplanung', text: 'Abgestimmt mit den Terminen der anderen Gewerke.' },
      { icon: 'clock', title: 'Verfolgung der Mietdauer', text: 'Jede Baustelle verfolgt ihre tatsächlichen Termine.' },
      { icon: 'image', title: 'Sicherheitsfotos', text: 'Dokumentieren Sie den Materialzustand und die Montage.' },
      { icon: 'mic', title: 'Schnelle Offerten', text: 'Kalkulieren Sie aus Ihrem Leistungskatalog.' },
      { icon: 'users', title: 'Koordination', text: 'Arbeiten Sie im Austausch mit den anderen Beteiligten der Baustelle.' },
      { icon: 'credit-card', title: 'Rechnungsstellung aus der Offerte', text: 'Fakturieren Sie die tatsächlich genutzte Dauer.' },
    ],
    scenario: {
      title: 'Beispiel: ein Gerüst für eine Fassadenbaustelle',
      text: 'Der Aufbau wird in Abstimmung mit dem Fassadenunternehmen geplant. Die Mietdauer wird verfolgt, eine unvorhergesehene Verlängerung dokumentiert und fakturiert. Der Abbau wird direkt nach Abschluss der Arbeiten geplant.',
    },
    comparison: [
      { before: 'Auf-/Abbau per Telefonanruf koordiniert', after: 'Zentrale, geteilte Planung' },
      { before: 'Überschrittene Mietdauer nicht fakturiert', after: 'Tatsächliche Dauer verfolgt und fakturiert' },
      { before: 'Materialzustand nicht dokumentiert', after: 'Fotos und Bemerkungen mit der Baustelle verknüpft' },
      { before: 'Offerte bei jeder neuen Baustelle neu erstellt', after: 'Wiederverwendbarer Leistungskatalog' },
      { before: 'Rechnung nachträglich rekonstruiert', after: 'Rechnung aus der Offerte erstellt' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Gerüstbauunternehmen?',
        answer: 'Ja, der Essentiel-Plan deckt Offerten, Baustellen und Rechnungsstellung für ein Unternehmen ab, das startet oder in einem kleinen Team arbeitet.',
      },
      {
        question: 'Kann man Auf- und Abbau mit anderen Gewerken koordinieren?',
        answer: 'Ja, die Planung ist zentral und wird mit den Beteiligten der Baustelle geteilt.',
      },
      {
        question: 'Wie fakturiere ich eine unvorhergesehene Mietverlängerung?',
        answer: 'Die tatsächliche Auf-/Abbaudauer wird pro Baustelle verfolgt und in die Rechnungsstellung übernommen.',
      },
      {
        question: 'Ermöglicht Cantia die Dokumentation des Materialzustands und der Montagesicherheit?',
        answer: 'Ja, Fotos und Bemerkungen bleiben mit der Baustelle verknüpft und werden automatisch datiert.',
      },
      {
        question: 'Kann ich mehrere Gerüstbaustellen parallel verfolgen?',
        answer: 'Ja, die Planung zentralisiert alle Ihre aktiven Baustellen.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'facadier'],
  },

  demolition: {
    slug: 'demolition',
    tradeName: 'Abbruchunternehmen',
    seo: {
      title: 'Verwaltungssoftware für Abbruchunternehmen | Cantia',
      description:
        'Verfolgen Sie Maschinen, Stunden, Fotos und Ausgaben pro Baustelle mit Cantia, der Verwaltungssoftware für Abbruchunternehmen in der Schweiz.',
    },
    hero: {
      eyebrow: 'Unternehmensverwaltung für den Abbruch',
      title: 'Stunden, Maschinen, Fotos und Ausgaben pro Baustelle gebündelt',
      subtitle:
        'Cantia hilft Abbruchunternehmen, die tatsächlichen Kosten ihrer Baustellen zu verfolgen und jeden Zustandsbericht zu dokumentieren.',
    },
    painPoints: [
      {
        problem: 'Maschinen- und Entsorgungskosten werden nicht präzise pro Baustelle verfolgt',
        consequence: 'Die tatsächliche Rentabilität einer Abbruchbaustelle ist vor Abschluss schwer zu erkennen.',
        response: 'Erfassen Sie die Ausgaben auf der Baustelle, laufend mit dem Offerierten verglichen.',
      },
      {
        problem: 'Der Zustandsbericht vor dem Abbruch muss klar dokumentiert werden',
        consequence: 'Bei einem Streitfall mit einem Nachbarn oder einer Versicherung erschwert das Fehlen von Nachweisen alles.',
        response: 'Georeferenzierte Fotos vor, während und nach den Arbeiten, mit der Baustelle verknüpft.',
      },
      {
        problem: 'Team- und Maschinenstunden sind schwer auf mehrere Baustellen zu verteilen',
        consequence: 'Unmöglich, genau zu wissen, was eine Baustelle an Personal- und Maschinenkosten gekostet hat.',
        response: 'Erfassen Sie die Stunden auf der Baustelle, nach Person und nach Maschine.',
      },
    ],
    usages: [
      { icon: 'dollar-sign', title: 'Ausgabenverfolgung', text: 'Maschinen und Entsorgung der richtigen Baustelle zugeordnet.' },
      { icon: 'image', title: 'Fotos vorher/während/nachher', text: 'Dokumentieren Sie den Zustand bei jeder Etappe.' },
      { icon: 'clock', title: 'Stunden pro Baustelle', text: 'Team und Maschinen verfolgt, Baustelle für Baustelle.' },
      { icon: 'trending-up', title: 'Rentabilität in Echtzeit', text: 'Vergleichen Sie Offeriertes und tatsächliche Kosten laufend.' },
      { icon: 'mic', title: 'Offerten und Rechnungen', text: 'Von der ursprünglichen Offerte bis zur Schlussrechnung.' },
      { icon: 'folder', title: 'Dokumente und Bewilligungen', text: 'Zentralisiert pro Baustelle.' },
    ],
    scenario: {
      title: 'Beispiel: ein Abbruch mit dokumentiertem Zustandsbericht',
      text: 'Der Zustandsbericht wird vor den Arbeiten fotografisch festgehalten. Die Offerte wird erstellt. Die Baustelle wird mit erfassten Stunden und Maschinenkosten verfolgt. Fotos zum Bauabschluss vervollständigen das Dossier, und die Schlussrechnung übernimmt alles.',
    },
    comparison: [
      { before: 'Maschinen- und Entsorgungskosten nicht verfolgt', after: 'Ausgaben der Baustelle zugeordnet' },
      { before: 'Zustandsbericht nicht dokumentiert', after: 'Georeferenzierte Fotos vorher/während/nachher' },
      { before: 'Team- und Maschinenstunden schwer zu verteilen', after: 'Stunden der Baustelle zugeordnet' },
      { before: 'Rentabilität erst am Ende der Baustelle bekannt', after: 'Rentabilität laufend verfolgt' },
      { before: 'Dokumente und Bewilligungen verstreut', after: 'Zentralisiert pro Baustelle' },
    ],
    faq: [
      {
        question: 'Eignet sich Cantia für ein Abbruchunternehmen?',
        answer: 'Ja, die Verfolgung der Maschinenkosten und die Rentabilität pro Baustelle entsprechen genau dieser Arbeitsweise.',
      },
      {
        question: 'Kann man die Kosten für Maschinen und Entsorgung pro Baustelle verfolgen?',
        answer: 'Ja, jede Ausgabe wird der betreffenden Baustelle zugeordnet und mit dem offerierten Betrag verglichen.',
      },
      {
        question: 'Wie dokumentiere ich einen Zustandsbericht vor dem Abbruch?',
        answer: 'Georeferenzierte Fotos können vor, während und nach den Arbeiten aufgenommen und mit der Baustelle verknüpft werden.',
      },
      {
        question: 'Ermöglicht Cantia, die Rentabilität einer Baustelle vor deren Abschluss zu kennen?',
        answer: 'Ja, der Vergleich zwischen offeriertem Betrag und tatsächlichen Kosten ist laufend verfügbar.',
      },
      {
        question: 'Kann ich Team- und Maschinenstunden pro Baustelle verfolgen?',
        answer: 'Ja, jede erfasste Stunde wird einer Baustelle sowie der betreffenden Person oder Maschine zugeordnet.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['terrassier', 'genie-civil'],
  },
};
