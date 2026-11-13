// Meta descriptions rewritten to 140–155 characters (Google cuts longer ones
// and fills shorter ones with page text). They replace the description of the
// same path in ROUTES (scripts/seo-routes.mjs), including the routes that are
// generated from the trade and help data. Each one only restates what its page
// already says.
export const DESCRIPTION_OVERRIDES = {
  // ─── Français ─────────────────────────────────────────────────────────────
  tarifs:
    'Tarifs de Cantia, le logiciel suisse de gestion pour le bâtiment : devis et factures illimités sur chaque formule, sans engagement, 14 jours d’essai.',
  'outils/calcul-taux-horaire':
    'Calculez le taux horaire à facturer : salaires, 13e, charges sociales, frais généraux et marge. Calculateur gratuit pour les entreprises du bâtiment.',
  'calculateur-salaire':
    'Calculez le salaire net et le coût employeur en Suisse : AVS, AC, LPP selon l’âge, LAA, allocations et impôt à la source par canton. Montants 2026.',
  'solutions/dictee-vocale':
    'Dictez vos devis, vos rapports de chantier et vos messages d’équipe au lieu de les taper au clavier : le bouton dicter fonctionne partout dans Cantia.',
  'solutions/planning':
    'Un vrai calendrier d’équipe dans Cantia : chaque membre, chaque chantier, chaque jour. Fini les plannings sur papier ou dans des groupes WhatsApp.',
  'solutions/rh-salaires':
    'Vos employés pointent leurs heures par chantier et leurs frais ; la fiche de salaire de toute l’équipe se gère du brut au net, au même endroit.',
  'solutions/travaux-supplementaires':
    'Chaque extra demandé sur le chantier devient un document daté, signé en ligne par le client, puis transformé en facture. Plus d’extras oubliés.',
  'solutions/soumissions':
    'Importez la soumission de l’architecte, saisissez vos prix et renvoyez le PDF d’origine rempli : prix unitaires, montants, reports et totaux.',
  integrations:
    'Cantia se connecte à votre comptabilité Bexio : clients et articles importés, factures envoyées en un clic et statuts de paiement synchronisés.',
  'sur-mesure':
    'Un workflow, une automatisation ou une intégration propre à votre entreprise : Cantia les développe en plus des modules standards, pour vous seul.',
  facadier:
    'Surfaces, variantes et avancement de chaque chantier : Cantia est le logiciel de gestion des entreprises de façade en Suisse, du devis à la facture.',
  'entreprise-nettoyage':
    'Devis d’entretien, planning des équipes, heures par client, rapports photo et factures QR : le logiciel de gestion des entreprises de nettoyage.',
  demenageur:
    'Devis de déménagement, planning des équipes et des véhicules, état des lieux en photos et factures QR : Cantia simplifie la gestion des déménageurs.',
  informaticien:
    'Offres, heures par mandat, contrats de support et factures QR : Cantia aide les informaticiens indépendants et les PME IT à facturer chaque heure.',
  traiteur:
    'Offres par événement, acomptes, planning du personnel, salaires et factures QR : Cantia simplifie la gestion des traiteurs et des entreprises d’événements.',
  telechargement:
    'Cantia fonctionne dans le navigateur, sur ordinateur comme sur téléphone, sans rien installer. Les applications natives iOS et Android arrivent bientôt.',
  'mentions-legales':
    'Mentions légales de Cantia, logiciel suisse de gestion pour les entreprises du bâtiment : éditeur du site, hébergement, propriété intellectuelle, contact.',
  confidentialite:
    'Politique de confidentialité de Cantia : données collectées, sous-traitants, hébergement en Suisse, cookies, durée de conservation et vos droits.',
  'conditions-generales':
    'Conditions générales d’utilisation et de vente de Cantia : essai gratuit, abonnement et paiement, résiliation, disponibilité et droit applicable.',
  contact:
    'Une question, un problème ou une suggestion ? Écrivez à l’équipe Cantia par le formulaire ou à info@cantia.ch : réponse sous 24 heures ouvrées.',

  // ─── Deutsch ──────────────────────────────────────────────────────────────
  'de/solutions/dictee-vocale':
    'Diktieren Sie Offerten, Baustellenrapporte und Team-Nachrichten, statt sie zu tippen: Die Diktierfunktion steht Ihnen überall in Cantia zur Verfügung.',
  'de/solutions/planning':
    'Ein echter Team-Kalender in Cantia: jedes Mitglied, jede Baustelle, jeder Tag. Schluss mit Plänen auf Papier oder in WhatsApp-Gruppen im Handwerk.',
  'de/solutions/rentabilite':
    'Vergleichen Sie die angenommene Offerte mit den tatsächlichen Kosten für Material und Arbeitszeit und sehen Sie, ob jede Baustelle rentabel ist.',
  'de/solutions/rh-salaires':
    'Ihre Mitarbeitenden erfassen Stunden pro Baustelle und Spesen; die Lohnabrechnung des ganzen Teams verwalten Sie vom Brutto- bis zum Nettolohn.',
  'de/solutions/soumissions':
    'Leistungsverzeichnis des Architekten importieren, Preise eingeben und das ausgefüllte Original-PDF zurücksenden: Einheitspreise, Beträge, Totale.',
  'de/solutions/travaux-supplementaires':
    'Jede Zusatzleistung auf der Baustelle wird zum datierten Dokument, das der Kunde online unterzeichnet und das zur Rechnung wird. Nichts geht vergessen.',
  'de/integrations':
    'Cantia verbindet sich mit Ihrer Bexio-Buchhaltung: Kunden und Artikel importiert, Rechnungen mit einem Klick versendet, Zahlungsstatus synchronisiert.',
  'de/sur-mesure':
    'Ein Workflow, eine Automatisierung oder eine Integration nur für Ihr Unternehmen: Cantia entwickelt sie zusätzlich zu den Standardmodulen für Sie.',
  'de/peintre':
    'Maler-Offerten schneller erstellen und Flächen, Teams und Zusatzarbeiten im Blick behalten: mit Cantia, der Verwaltungssoftware für die Schweiz.',
  'de/paysagiste':
    'Mobile Teams, Gestaltungsbaustellen und Unterhaltsverträge im Griff: Cantia ist die Verwaltungssoftware für Garten- und Landschaftsbauer der Schweiz.',
  'de/etancheur':
    'Einsätze präzise dokumentieren, Offerten und QR-Rechnungen erstellen: Cantia ist die Verwaltungssoftware für Abdichtungsunternehmen in der Schweiz.',
  'de/entreprise-nettoyage':
    'Offerten für Unterhaltsreinigung, Einsatzplanung, Stunden pro Kunde, Fotorapporte und QR-Rechnungen: die Verwaltungssoftware für Reinigungsfirmen.',
  'de/conciergerie':
    'Einsätze, Regiearbeiten, Fotorapporte, Stunden pro Liegenschaft und QR-Rechnungen: Cantia unterstützt Hauswartungen und Facility-Management-Firmen.',
  'de/garagiste':
    'Reparaturofferten, Werkstattstunden, Schadenfotos, Zusatzarbeiten und QR-Rechnungen: Cantia vereinfacht die Verwaltung von Garagen und Carrosserien.',
  'de/informaticien':
    'Offerten, Stunden pro Mandat, Einsätze, Supportverträge und QR-Rechnungen: Cantia hilft selbständigen Informatikern und IT-KMU, jede Stunde zu verrechnen.',
  'de/graphiste':
    'Offerten, Zeiterfassung pro Projekt, verrechenbare Korrekturschlaufen, QR-Rechnungen und Mahnungen: Cantia für Grafiker und Kommunikationsagenturen.',
  'de/traiteur':
    'Offerten pro Anlass, Anzahlungen, Personalplanung, Löhne und QR-Rechnungen: Cantia vereinfacht die Verwaltung von Caterern und Eventfirmen der Schweiz.',
  'de/consultant':
    'Offerten, Mandate, Zeiterfassung, diktierte Notizen, QR-Rechnungen und MWST: Cantia unterstützt selbständige Berater und Beratungsfirmen der Schweiz.',
  'de/telechargement':
    'Cantia läuft im Browser, auf dem Computer wie auf dem Telefon, ohne Installation. Native Apps für iOS und Android sind in Vorbereitung und folgen bald.',
  'de/mentions-legales':
    'Impressum von Cantia, der Schweizer Verwaltungssoftware für Bauunternehmen: Herausgeber der Website, Hosting, geistiges Eigentum, Haftung und Kontakt.',
  'de/confidentialite':
    'Datenschutzerklärung von Cantia: erhobene Daten, Auftragsverarbeiter, Hosting in der Schweiz, Cookies, Aufbewahrungsdauer und Ihre Rechte im Überblick.',
  'de/conditions-generales':
    'Allgemeine Geschäftsbedingungen von Cantia: kostenlose Testphase, Abonnement und Zahlung, Kündigung, Verfügbarkeit des Dienstes und anwendbares Recht.',
  'de/calculateur-salaire':
    'Nettolohn und Arbeitgeberkosten in der Schweiz berechnen: AHV, ALV, BVG nach Alter, UVG, Familienzulagen und Quellensteuer nach Kanton. Werte 2026.',
  'de/contact':
    'Eine Frage, ein Problem oder ein Vorschlag? Schreiben Sie dem Cantia-Team über das Formular oder an info@cantia.ch: Antwort innert 24 Werkstunden.',

  // ─── Italiano ─────────────────────────────────────────────────────────────
  'it/solutions/facturation':
    'Ogni fattura Cantia contiene la fattura QR svizzera conforme, con IBAN, riferimento e importo già codificati: il cliente paga con una semplice scansione.',
  'it/solutions/dictee-vocale':
    'Detti preventivi, rapporti di cantiere e messaggi di squadra invece di digitarli: la dettatura vocale è disponibile in tutte le schermate di Cantia.',
  'it/solutions/planning':
    'Un vero calendario di squadra in Cantia: ogni membro, ogni cantiere, ogni giorno. Basta con i planning su carta o nei gruppi WhatsApp della squadra.',
  'it/solutions/rh-salaires':
    'I dipendenti registrano ore per cantiere e spese; la busta paga di tutta la squadra si gestisce dal lordo al netto, nello stesso posto, con Cantia.',
  'it/solutions/soumissions':
    'Importi il capitolato dell’architetto, inserisca i prezzi e rinvii il PDF originale compilato: prezzi unitari, importi, riporti e totali calcolati.',
  'it/solutions/travaux-supplementaires':
    'Ogni extra richiesto in cantiere diventa un documento datato, firmato online dal cliente e trasformato in fattura. Nessun extra dimenticato o contestato.',
  'it/integrations':
    'Cantia si collega alla Sua contabilità Bexio: clienti e articoli importati, fatture inviate con un clic e stati di pagamento sincronizzati in automatico.',
  'it/sur-mesure':
    'Un flusso di lavoro, un’automazione o un’integrazione solo per la Sua azienda: Cantia li sviluppa in aggiunta ai moduli standard, su misura per Lei.',
  'it/peintre':
    'Prepari i preventivi di pittura più in fretta e segua superfici, squadre e lavori supplementari con Cantia, il software pensato per la Svizzera.',
  'it/paysagiste':
    'Squadre mobili, cantieri di sistemazione e contratti di manutenzione sotto controllo con Cantia, il software di gestione per la paesaggistica in Svizzera.',
  'it/facadier':
    'Superfici, varianti e avanzamento di ogni cantiere: Cantia è il software di gestione per le imprese di facciate in Svizzera, dal preventivo alla fattura.',
  'it/vitrier':
    'Misure, ordini, posa e interventi organizzati con Cantia, il software di gestione per le vetrerie in Svizzera, con preventivi e fatture QR insieme.',
  'it/echafaudeur':
    'Montaggio, smontaggio e squadre organizzati con Cantia, il software di gestione per le imprese di ponteggi in Svizzera, dal preventivo alla fattura QR.',
  'it/entreprise-nettoyage':
    'Preventivi di manutenzione, pianificazione delle squadre, ore per cliente, rapporti con foto e fatture QR: il software per le imprese di pulizia svizzere.',
  'it/demenageur':
    'Preventivi di trasloco, pianificazione di squadre e veicoli, stato dei beni in foto e fatture QR: Cantia semplifica la gestione delle imprese di traslochi.',
  'it/telechargement':
    'Cantia funziona nel browser, su computer come su telefono, senza installare nulla. Le app native per iOS e Android sono in preparazione e arrivano presto.',
  'it/mentions-legales':
    'Note legali di Cantia, il software svizzero di gestione per le imprese edili: editore del sito, hosting, proprietà intellettuale, responsabilità, contatto.',
  'it/confidentialite':
    'Informativa sulla privacy di Cantia: dati raccolti, responsabili del trattamento, hosting in Svizzera, cookie, durata di conservazione e i Suoi diritti.',
  'it/conditions-generales':
    'Condizioni generali di utilizzo e di vendita di Cantia: prova gratuita, abbonamento e pagamento, disdetta, disponibilità e diritto applicabile.',
  'it/calculateur-salaire':
    'Calcoli il salario netto e il costo per il datore di lavoro in Svizzera: AVS, AD, LPP secondo l’età, LAINF, assegni familiari e imposta alla fonte. 2026.',
  'it/contact':
    'Una domanda, un problema o un suggerimento? Scriva al team Cantia tramite il modulo o all’indirizzo info@cantia.ch: risposta entro 24 ore lavorative.',
  // ─── Rewritten to 160 characters at most (November 2026) ──────────────────
  'blog/calculer-prix-unitaire-soumission':
    "Main-d’œuvre, matériaux, machines, frais généraux, risques et marge : construire un prix unitaire défendable pour chaque position d’une soumission.",
  'blog/rabais-escompte-tva-ordre-soumission':
    "Rabais et escompte ne sont pas la même chose, et l’ordre du calcul change le total. Exemple chiffré d’une soumission suisse, du brut au TTC.",
  'blog/comprendre-soumission-can-positions':
    "Numéros, chapitres, positions réservées, textes à compléter : comment lire une soumission établie selon le CAN pour chiffrer sans rien oublier.",
  'blog/bexio-vs-cantia-logiciel-batiment':
    "Bexio est une comptabilité généraliste suisse. Cantia est pensée pour le chantier : devis dicté, rentabilité par projet, QR-facture native.",
  'blog/suivre-rentabilite-chantier-sans-excel':
    "Un suivi de chantier sur Excel casse dès qu’une formule change ou qu’une ligne manque. Une méthode plus fiable pour suivre sa rentabilité.",
  'blog/garantie-travaux-construction-2-ou-5-ans':
    "La garantie légale d’un ouvrage immobilier est de 5 ans, pas 2. Depuis 2026, le délai pour signaler un défaut passe à 60 jours.",
  'blog/permis-construire-renovation-quand-necessaire':
    "Refaire une cuisine ou une salle de bains ne demande en principe pas de permis. Si la structure ou l’aspect extérieur change, cela dépend du canton.",
  'blog/contrat-entreprise-vs-mandat-artisan':
    "Le carreleur est sous contrat d’entreprise (obligation de résultat), l’architecte qui conseille souvent sous mandat (obligation de moyens).",
  'blog/salaire-minimum-cct-construction-suisse':
    "Le salaire minimum du gros œuvre est fixé par la Convention nationale de la construction, pas par la loi. Ce que change la CCT 2026-2031.",
  'blog/heures-supplementaires-batiment-majoration-25':
    "Nouvelle CCT de la construction : jusqu’à 100 h reportables, majoration de 25 % au-delà, seuil de 50 h trajets compris. Le calcul expliqué.",
  'blog/devis-oral-valeur-legale-suisse':
    "En droit suisse, un accord oral vaut contrat : le Code des obligations n’exige pas d’écrit. Le problème n’est pas la validité, c’est la preuve.",
  'blog/signature-electronique-devis-suisse-valeur-legale':
    "La signature électronique simple suffit pour accepter la quasi-totalité des devis du bâtiment. La signature qualifiée ne sert que dans des cas précis.",
  'blog/avenant-chantier-plus-value-moins-value':
    "Le client qui demande un changement en cours de chantier ne signe presque jamais d’avenant. Comment éviter que ce service devienne du travail gratuit.",
  'blog/hypotheque-legale-artisans-entrepreneurs-suisse':
    "L’hypothèque légale (art. 837 CC) garantit le paiement de vos travaux sur l’immeuble, à condition de l’inscrire au registre foncier dans les 4 mois.",
  'blog/reception-travaux-proces-verbal-chantier':
    "La réception des travaux lance le délai de garantie et fige les défauts constatés. Sans procès-verbal écrit, ce moment est impossible à prouver.",
  'blog/calculer-prix-horaire-reel-ouvrier-batiment':
    "Un devis chiffré sur le seul salaire brut sous-estime le vrai coût horaire. Charges sociales et temps non facturable doivent entrer dans le calcul.",
  'blog/meilleur-logiciel-devis-facture-batiment-suisse-2026':
    "QR-facture native, catalogue de prix, suivi par chantier, hors-ligne : les critères concrets pour choisir un logiciel de devis et factures du bâtiment.",
  'blog/degats-voisinage-chantier-qui-est-responsable':
    "Fissure chez le voisin, poussière sur une façade : la responsabilité n’est pas automatique et se prouve avec un état des lieux préalable.",
  'blog/calculer-prix-de-revient-chantier-batiment':
    "Le montant facturé n’est pas le prix de revient. Sans additionner main-d’œuvre réelle, matériaux et sous-traitance, impossible de juger la rentabilité.",
  'blog/trouver-clients-artisan-batiment-suisse':
    "Pas besoin de grosse campagne publicitaire : les canaux qui marchent pour un artisan du bâtiment en Suisse, du bouche-à-oreille au référencement local.",
  'blog/fixer-prix-artisan-sans-brader-concurrence-suisse':
    "Baisser ses prix pour rester compétitif fragilise l’entreprise. Construire un prix défendable et le justifier face à un client qui compare.",
  'blog/raison-individuelle-sarl-sa-quel-statut-batiment':
    "Raison individuelle, Sàrl ou SA dans le bâtiment : capital, responsabilité, coûts de création et le vrai critère de choix, avec un tableau.",
  'blog/cout-creation-entreprise-construction-suisse':
    "Inscription, assurances, outillage, trésorerie de départ : le budget réel pour lancer une entreprise du bâtiment en Suisse, et le poste souvent oublié.",
  'blog/immatriculer-entreprise-construction-registre-commerce':
    "Inscrire une entreprise du bâtiment au registre du commerce : quand c’est obligatoire, les étapes, les documents et les délais réels.",
  'blog/creer-entreprise-batiment-suisse-guide-complet':
    "Statut, immatriculation, budget, premiers outils, premiers clients et premier employé : le parcours complet pour créer une entreprise du bâtiment.",
  'blog/application-devis-mobile-artisan':
    "Faire son devis depuis le chantier change tout. Ce qu’il faut vérifier avant de choisir une application, et la différence avec un vrai outil de gestion.",
  'blog/calculer-acomptes-impots-independant-batiment':
    "Acomptes provisoires, estimation du revenu, première année sans historique : provisionner correctement ses impôts d’indépendant du bâtiment.",
  'blog/cantia-vs-klara':
    "Klara est une solution suisse solide de comptabilité et facturation pour petites entreprises. Cantia est pensée pour le chantier. Comparaison honnête.",
  'blog/chomage-intemperies-rht-batiment-suisse':
    "Chômage-intempéries dans le bâtiment : conditions, démarches auprès de la caisse de chômage, délai de carence et effet sur la trésorerie d’hiver.",
  'blog/clauses-oubliees-contrat-travail-batiment':
    "Mobilité entre chantiers, déplacements, heures supplémentaires, matériel de service : les clauses souvent oubliées d’un contrat de travail du bâtiment.",
  'blog/devis-facture-installateur-solaire-suisse':
    "Chiffrer et facturer comme installateur solaire en Suisse : poids du matériel, raccordement électrique, subventions et rétribution d’injection.",
  'blog/diagnostic-amiante-renovation-obligatoire-suisse':
    "Quels bâtiments présentent un risque d’amiante avant rénovation, pourquoi l’entreprise exécutante en répond, et la marche à suivre avant les travaux.",
  'blog/directive-suva-echafaudage-chantier-obligation':
    "Garde-corps, ancrages, contrôle avant mise en service, formation : ce que la directive SUVA exige pour un échafaudage de chantier en Suisse.",
  'blog/facturer-depannage-urgent-sans-devis':
    "Facturer une intervention d’urgence sans devis signé : forfait de déplacement, tarif horaire majoré, documentation et majorations courantes.",
  'blog/facturer-frais-deplacement-client-artisan':
    "Forfait kilométrique, trajet compté dans le tarif horaire ou gratuité dans un rayon : les pratiques courantes pour facturer le déplacement, en clair.",
  'blog/instagram-ou-facebook-artisan-batiment':
    "Facebook et Instagram ne touchent pas le même public. Lequel choisir selon sa clientèle, et pourquoi mieux vaut bien tenir un seul réseau.",
  'blog/norme-aeai-incendie-batiment-obligation':
    "Le rôle de l’AEAI dans la protection incendie et ce qu’il implique pour un artisan : matériaux classés, cloisons coupe-feu, issues de secours.",
  'blog/periode-essai-batiment-duree-legale':
    "Durée légale de la période d’essai selon le CO, prolongation possible, délai de congé raccourci et particularités de la CCT du bâtiment.",
  'blog/prix-isolation-facade-m2-suisse':
    "Fourchettes réalistes en CHF/m² pour isoler une façade en Suisse selon le système (crépi isolant, bardage ventilé), et les subventions cantonales.",
  'blog/prix-refection-toiture-suisse':
    "Fourchettes réalistes en CHF/m² pour refaire une toiture en Suisse selon le matériau (tuiles, ardoise, toit plat), et pourquoi la visite reste indispensable.",
  'blog/prix-renovation-cuisine-suisse':
    "Fourchettes réalistes pour rénover une cuisine en Suisse selon le standing (standard, milieu de gamme, sur mesure), avec le détail poste par poste.",
  'blog/prix-renovation-salle-de-bain-suisse-m2':
    "Fourchettes réalistes pour rénover une salle de bain en Suisse, standard ou haut de gamme : sanitaire, carrelage, plomberie, électricité, étanchéité.",
  'blog/relancer-client-devis-sans-reponse':
    "Un silence après un devis n’est pas un refus. Le calendrier de relance, le ton à adopter et les erreurs qui font perdre un chantier encore possible.",
  'blog/repondre-avis-negatif-google-artisan':
    "Un avis négatif fait mal, une mauvaise réponse fait pire. Le ton à adopter, quand passer en privé et ce qu’il ne faut jamais faire sur Google.",
  'blog/travailleur-detache-batiment-suisse-regles':
    "Détachement, annonce préalable, conditions de salaire et de travail suisses : les règles pour un travailleur détaché et les risques sur un chantier.",
  'blog/tva-methode-effective-ou-tdfn-batiment':
    "Méthode effective ou TDFN pour la TVA d’une entreprise du bâtiment : charge administrative, impôt préalable déductible et critères de choix.",
  'blog/vacances-construction-suisse-dates-canton':
    "Vacances de la construction en Suisse romande : pourquoi elles existent, comment les dates varient selon le canton et la CCT, et l’effet sur la trésorerie.",
  'blog/vacances-employe-batiment-cct-jours':
    "Vacances minimales selon le CO, jours en plus prévus par la CCT du secteur principal de la construction et calcul au prorata en année incomplète.",
  'metiers':
    "Chantier, dossier, mandat ou projet : Cantia parle comme votre métier, du bâtiment aux services, bureaux d’études, agences et événementiel en Suisse.",
  'metiers/batiment-artisanat':
    "Devis signés en ligne, soumissions, planning de chantier, rapports avec photos, heures et factures QR : le logiciel des entreprises du bâtiment.",
  'metiers/service-entretien':
    "Interventions, équipes, heures, rapports photo, devis et factures QR : Cantia pour le nettoyage, la conciergerie, l’entretien et le jardinage en Suisse.",
  'metiers/bureaux-etudes':
    "Mandats, offres d’honoraires, temps par collaborateur, documents, dépenses et factures QR : Cantia pour les bureaux d’études et d’architectes.",
  'metiers/agences-evenementiel':
    "Offres signées en ligne, projets, équipe, prestataires, acomptes et factures QR : Cantia pour agences, studios, photographes, traiteurs et événementiel.",
  'blog/action-garantie-sous-traitant-entrepreneur-general':
    "L’action en garantie entre sous-traitant et entrepreneur général en cas de défaut, et pourquoi une RC professionnelle propre est essentielle.",
  'blog/affacturage-factoring-entreprise-batiment-suisse':
    "Le fonctionnement de l’affacturage, ses avantages et ses limites pour une entreprise du bâtiment, et les cas où il vaut le coût de la commission.",
  'blog/bilan-carbone-chantier-construction-suisse':
    "Matériaux, transport, énergie et déchets : ce qui compose le bilan carbone d’un chantier suisse, un critère de plus en plus présent dans les appels d’offres.",
  'blog/cautionnement-bancaire-entreprise-generale-suisse':
    "Le cautionnement bancaire des gros chantiers et marchés publics : fonctionnement, coût, et pourquoi il touche surtout les entreprises générales.",
  'blog/chantier-copropriete-ppe-facturation-suisse':
    "Assemblée des copropriétaires, administrateur PPE, quotes-parts : comment se passent devis et facturation sur un chantier en propriété par étages.",
  'blog/chantier-propre-reduire-nuisances-voisinage':
    "Bruit, poussière, accès bloqués : les réflexes concrets pour limiter les nuisances d’un chantier et préserver la réputation de l’entreprise.",
  'blog/leasing-machines-vehicules-chantier-suisse':
    "Leasing ou achat pour les machines et véhicules de chantier : avantages, inconvénients et critères concrets pour trancher selon votre situation.",
  'blog/motiver-equipe-chantier-batiment-quotidien':
    "La motivation d’une équipe de chantier ne tient pas qu’au salaire : reconnaissance, attentes claires et organisation pèsent souvent plus au quotidien.",
  'blog/norme-minergie-batiment-explication':
    "Minergie n’est pas une loi mais un label suisse de basse consommation. Ce qu’il change concrètement pour un artisan qui travaille sur un bâtiment labellisé.",
  'blog/renovation-batiment-historique-protege-suisse':
    "Autorisations plus lourdes, matériaux imposés, délais allongés : ce qui change quand une rénovation touche un bâtiment historique ou protégé.",
  'blog/calcul-lpp-employe-taux-salaire-coordonne-2026':
    "Seuil d’entrée, déduction de coordination, taux de 7 à 18 % selon l’âge, part employeur : le calcul de la LPP pas à pas, avec des exemples 2026.",
  'a-propos':
    "Cantia, la suite suisse de gestion des entreprises qui travaillent par projets : pour qui, comment elle fonctionne et comment elle est née sur les chantiers.",
  'metiers/service-entretien/entreprise-nettoyage':
    "Contrats d’entretien, fins de bail, équipes sur plusieurs adresses, heures sur téléphone et factures QR : Cantia pour les entreprises de nettoyage.",
  'metiers/service-entretien/conciergerie':
    "Immeubles suivis pour les gérances, petites interventions, rapports avec photos et factures QR : Cantia pour la conciergerie et le facility management.",
  'metiers/service-entretien/garage':
    "Interventions, pièces et heures par client, devis validés avant les travaux, factures QR : Cantia pour les garages et l’entretien technique en Suisse.",
  'metiers/service-entretien/deneigement':
    "Interventions sur appel, heures par adresse, contrats saisonniers, factures groupées en fin de mois : Cantia pour le déneigement et les services saisonniers.",
  'metiers/bureaux-etudes/ingenieur-civil':
    "Mandats, heures par collaborateur et par type de travail, offres d’honoraires signées, acomptes et QR-factures : Cantia pour les ingénieurs civils.",
  'metiers/bureaux-etudes/architecte':
    "Mandats, heures par phase, offres signées, documents par mandat et factures d’acompte QR : Cantia pour les bureaux d’architectes en Suisse.",
  'metiers/bureaux-etudes/bureau-technique':
    "Études, plans et suivi d’exécution : mandats, heures, offres signées et factures QR. Cantia pour les bureaux techniques CVC, sanitaire et électricité.",
  'metiers/bureaux-etudes/consultant':
    "Mandats au forfait ou au temps passé, offres signées en ligne, heures par client, factures QR et relances : Cantia pour les consultants indépendants.",
  'metiers/bureaux-etudes/informaticien-formateur':
    "Projets clients, heures par mandat, support au temps passé, offres signées et factures QR : Cantia pour informaticiens et formateurs indépendants.",
  'metiers/agences-evenementiel/agence-communication':
    "Offres par projet signées en ligne, heures de l’équipe, acomptes, rentabilité et factures QR : Cantia pour les agences de communication en Suisse.",
  'metiers/agences-evenementiel/graphiste':
    "Offres avec corrections incluses, compléments signés, temps par projet, acomptes et factures QR : Cantia pour graphistes et studios créatifs.",
  'de/metiers':
    "Baustelle, Dossier, Mandat oder Projekt: Cantia spricht wie Ihre Branche, vom Bau über Service und Planungsbüros bis zu Agenturen und Events.",
  'de/metiers/batiment-artisanat':
    "Online unterschriebene Offerten, Ausschreibungen, Bauprogramm, Rapporte mit Fotos, Stunden und QR-Rechnungen: die Software für Baubetriebe.",
  'de/metiers/service-entretien':
    "Einsätze, Teams, Stunden, Fotorapporte, Offerten und QR-Rechnungen: Cantia für Reinigung, Hauswartung, Unterhalt und Gartenpflege in der Schweiz.",
  'de/metiers/bureaux-etudes':
    "Mandate, Honorarofferten, Zeit pro Mitarbeitende, Dokumente, Ausgaben und QR-Rechnungen: Cantia für Ingenieur-, Planungs- und Architekturbüros.",
  'de/metiers/agences-evenementiel':
    "Unterschriebene Offerten, Projekte, Team, Dienstleister, Akontos und QR-Rechnungen: Cantia für Agenturen, Studios, Fotografen, Caterer und Events.",
  'de/blog/arbeitsunfall-baustelle-suva-pflichten':
    "Fristgerechte Meldung, Lohnfortzahlung, Wiedereingliederung: die Pflichten des bei der SUVA versicherten Arbeitgebers nach einem Unfall auf der Baustelle.",
  'de/blog/betriebshaftpflicht-baugewerbe':
    "Kein Bundesgesetz schreibt die Betriebshaftpflicht jedem Handwerker vor, doch mehrere Kantone und Auftraggeber verlangen sie faktisch. Die Übersicht.",
  'de/blog/bexio-vs-cantia-logiciel-batiment':
    "Bexio ist eine generalistische Schweizer Buchhaltung. Cantia ist für die Baustelle gemacht: Offerte per Diktat, Rentabilität pro Projekt, QR-Rechnung.",
  'de/blog/calculer-13e-salaire-prorata-employe':
    "Wer im April anfängt, hat im Dezember keinen vollen 13. Monatslohn zugut. Die anteilige Berechnung nach gearbeiteten Monaten, mit Prämien und Absenzen.",
  'de/blog/calculer-heures-travail-ouvrier-minutes-decimales':
    "Von 8 bis 12.45 Uhr sind 4h45, nicht 4,45 Dezimalstunden (das wären 4h27). Warum diese Verwechslung auf der Lohnabrechnung teuer wird.",
  'de/blog/calculer-prix-de-revient-chantier-batiment':
    "Der fakturierte Betrag ist nicht der Selbstkostenpreis. Ohne Arbeitszeit, Material, Subunternehmer und Gemeinkosten bleibt die Rentabilität unklar.",
  'de/blog/calculer-prix-horaire-reel-ouvrier-batiment':
    "Eine Offerte auf Basis des Bruttolohns unterschätzt die wahren Stundenkosten. Sozialabgaben, bezahlte Absenzen und unproduktive Zeit gehören dazu.",
  'de/blog/calculer-prix-unitaire-soumission':
    "Arbeit, Material, Maschinen, Gemeinkosten, Risiken und Marge: so bauen Sie für jede Position eines Leistungsverzeichnisses einen soliden Einheitspreis.",
  'de/blog/combien-coute-logiciel-gestion-chantier-roi':
    "Der Abo-Preis ist nur ein Teil der Rechnung. So beurteilen Sie den tatsächlichen Nutzen einer Verwaltungssoftware für ein Bauunternehmen.",
  'de/blog/comprendre-soumission-can-positions':
    "Nummern, Kapitel, Eventualpositionen, Ergänzungstexte: wie man ein Leistungsverzeichnis nach NPK liest, um vollständig zu kalkulieren.",
  'de/blog/crm-baubranche-handwerker':
    "CRM klingt nach Verkaufsteams und Dashboards. Doch wer 30, 50 oder 100 Kunden betreut, hat dasselbe Gedächtnisproblem wie ein Verkäufer.",
  'de/blog/duree-validite-devis-non-signe-combien-temps':
    "Ohne Vermerk hat eine nicht unterzeichnete Offerte keine feste Gültigkeit, und das Unternehmen riskiert, einen alten Preis halten zu müssen.",
  'de/blog/excel-vs-logiciel-gestion-chantier-limites':
    "Excel genügt im Kleinen, bis zwei Personen gleichzeitig darin arbeiten oder eine vergessene Offerte mehr kostet als ein richtiges Tool.",
  'de/blog/facturation-heures-regie-batiment-comment-faire':
    "Arbeit nach Aufwand wird leichter angefochten als ein Festpreis, wenn Stunden, Personen und Aufgaben nicht nachvollziehbar belegt sind.",
  'de/blog/facturer-acompte-suisse-securiser-solde':
    "Eine schlecht aufgebaute Anzahlung schützt selten. So verteilen Sie die Zahlungen einer Baustelle, damit Sie nie mehr vorschiessen als gedeckt ist.",
  'de/blog/fixer-prix-artisan-sans-brader-concurrence-suisse':
    "Wer ständig die Preise senkt, schwächt sein Unternehmen. Wie Sie einen vertretbaren Preis aufbauen und ihn vor einem vergleichenden Kunden begründen.",
  'de/blog/garantie-travaux-construction-2-ou-5-ans':
    "Die gesetzliche Garantie für ein unbewegliches Werk beträgt 5 Jahre, nicht 2. Seit 2026 gilt für die Mängelrüge eine Frist von 60 Tagen.",
  'de/blog/heures-supplementaires-batiment-majoration-25':
    "Neuer GAV im Bau: bis zu 100 Stunden übertragbar, 25 % Zuschlag darüber hinaus, neue Wochenschwelle von 50 Stunden inklusive Arbeitsweg.",
  'de/blog/indemnites-kilometriques-2026-nouveau-taux':
    "Ab 1. Januar 2026 steigt der Kilometeransatz der ESTV von CHF 0.70 auf CHF 0.75, mit einer neuen Deklarationspflicht auf dem Lohnausweis.",
  'de/blog/licenciement-ouvrier-batiment-delai-conge-cct':
    "Die Kündigungsfrist eines Bauarbeiters hängt von Dienstjahren und GAV ab. Ein Fehler kann den Arbeitgeber teuer zu stehen kommen. So rechnen Sie richtig.",
  'de/blog/baustellensoftware-einzelunternehmer':
    "Die meisten Baustellen-Tools sind für Teams gedacht. Ein Einzelunternehmer hat andere, ebenso reale Bedürfnisse, und die rechtfertigen ein Tool.",
  'de/blog/logiciel-gestion-tout-en-un-petite-entreprise-suisse':
    "«Alles-in-einem» verspricht fast jeder Anbieter. Was der Begriff wirklich umfasst und wie Sie prüfen, ob ein Tool es tatsächlich ist.",
  'de/blog/meilleur-logiciel-devis-facture-batiment-suisse-2026':
    "QR-Rechnung, Preiskatalog, Auswertung pro Baustelle, offline nutzbar: die konkreten Kriterien für eine Offerten- und Rechnungssoftware im Bau.",
  'de/blog/mentions-obligatoires-facture-suisse-tva':
    "MWST-Nummer, Satz, Leistungsdatum, QR-Referenz: eine unvollständige Rechnung kann abgelehnt oder beanstandet werden. Die Liste zum Prüfen.",
  'de/blog/permis-construire-renovation-quand-necessaire':
    "Für eine neue Küche oder ein neues Bad braucht es meist keine Baubewilligung. Ändern sich Struktur, Fassade oder Nutzung, entscheidet der Kanton.",
  'de/blog/planning-chantier-eviter-conflits-ressources':
    "Derselbe Arbeiter oder dieselbe Maschine am selben Tag auf zwei Baustellen: ein Klassiker, wenn die Planung in Köpfen und getrennten Dateien lebt.",
  'de/blog/portfolio-photos-avant-apres-chantier-vente':
    "Die meisten Handwerker fotografieren ihre Baustellen nur zur Dokumentation. So wird daraus ein Portfolio, das neue Offerten gewinnen hilft.",
  'de/blog/betreibung-unbezahlte-rechnung-ablauf':
    "Betreibungsbegehren, Zahlungsbefehl, Rechtsvorschlag, Rechtsöffnung: wie eine Betreibung wegen einer unbezahlten Rechnung abläuft und wann sie sich lohnt.",
  'de/blog/verjaehrung-unbezahlte-rechnung-schweiz':
    "Eine vertragliche Forderung verjährt in der Schweiz grundsätzlich nach 10 Jahren, mit Unterbrechungsmöglichkeiten. Wer sie ignoriert, verliert sein Recht.",
  'de/blog/previsionnel-tresorerie-entreprise-batiment':
    "Für einen Liquiditätsengpass braucht es keinen Finanzplan: eine Planung auf 30, 60 und 90 Tage aus offenen Rechnungen und Kosten zeigt ihn früh.",
  'de/blog/qr-facture-obligatoire-2026':
    "Der ES/BESR existiert seit 2022 nicht mehr, die QR-Rechnung ist der einzige Standard. Seit Ende 2025 bedroht eine Formatänderung nicht konforme QR-Rechnungen.",
  'de/blog/rabais-escompte-tva-ordre-soumission':
    "Rabatt und Skonto sind nicht dasselbe, und die Reihenfolge verändert das Total. Ein Rechenbeispiel von der Bruttosumme bis zum Total inklusive MWST.",
  'de/blog/rediger-devis-qui-inspire-confiance-client':
    "Eine klare, präzise und gut gegliederte Offerte überzeugt so sehr wie ein guter Preis. Die Elemente, die bei Privatkunden den Unterschied machen.",
  'de/blog/remplir-soumission-pdf-architecte':
    "Der Architekt schickt ein 40-seitiges PDF und erwartet Ihre Preise darin. So kalkulieren Sie schnell, ohne Übertragsfehler, und geben es fristgerecht zurück.",
  'de/blog/retenue-de-garantie-chantier-consignation':
    "Manche Bauherren behalten 5 bis 10 % des Schlussbetrags zurück. Das gilt nicht automatisch: Es wird verhandelt, nicht widerspruchslos hingenommen.",
  'de/blog/sous-traitant-batiment-suisse-contrat-facturation':
    "Wer Subunternehmer beizieht, haftet gegenüber dem Kunden, prüft deren Versicherungen und verfolgt ihre Rechnungen pro Baustelle genau.",
  'de/blog/travail-au-noir-batiment-suisse-risques-controles':
    "Der Bau gehört zu den von der BGSA am meisten kontrollierten Branchen: über 14’000 Betriebskontrollen 2025, Sanktionen weit über die Busse hinaus.",
  'de/blog/trouver-clients-artisan-batiment-suisse':
    "Für volle Auftragsbücher braucht es keine grosse Werbekampagne. Die Kanäle, die für Bauhandwerker wirklich funktionieren, von Mundpropaganda bis lokal.",
  'de/blog/vacances-non-prises-fin-annee-batiment-cct':
    "Nicht bezogene Ferien werfen im Bau Fragen zu Liquidität und Arbeitsrecht auf. Die Regeln, die man vor einer Entscheidung kennen muss.",
  'de/blog/vitesse-reponse-devis-taux-conversion-batiment':
    "Wer mehrere Handwerker anfragt, wählt oft den, der zuerst antwortet. Wie Sie sich organisieren, um diese Kunden nicht mehr zu verlieren.",
  'de/a-propos':
    "Cantia, die Schweizer Verwaltungssoftware für Unternehmen, die in Projekten arbeiten: für wen, wie sie funktioniert und wie sie auf der Baustelle entstand.",
  'de/metiers/bureaux-etudes/consultant':
    "Mandate pauschal oder nach Aufwand, online unterschriebene Offerten, Stunden pro Kunde, QR-Rechnungen und Mahnungen: Cantia für selbstständige Berater.",
  'de/metiers/bureaux-etudes/informaticien-formateur':
    "Kundenprojekte, Stunden pro Mandat, Support nach Aufwand, unterschriebene Offerten und QR-Rechnungen: Cantia für Informatiker und Ausbildner.",
  'de/metiers/agences-evenementiel/agence-communication':
    "Unterschriebene Projektofferten, Teamstunden nach Art der Arbeit, Akontos, Rentabilität und QR-Rechnungen: Cantia für Kommunikationsagenturen.",
  'de/metiers/agences-evenementiel/graphiste':
    "Offerten mit inbegriffenen Korrekturen, unterschriebene Ergänzungen, Zeit pro Projekt, Akontos und QR-Rechnungen: Cantia für Grafiker und Studios.",
  'de/metiers/agences-evenementiel/traiteur':
    "Anlässe nach Gästezahl kalkuliert, unterschriebene Offerte, geplantes Team, verrechnete Extras und Personallöhne: Cantia für Caterer in der Schweiz.",
  'it/metiers':
    "Cantiere, dossier, mandato o progetto: Cantia parla come il suo mestiere, dall’edilizia ai servizi, agli studi tecnici, alle agenzie e agli eventi.",
  'it/metiers/agences-evenementiel':
    "Offerte firmate online, progetti, squadra, fornitori, acconti e fatture QR: Cantia per agenzie, studi creativi, fotografi, catering ed eventi.",
  'it/blog/etablir-certificat-salaire-lohnausweis-premier-employe':
    'Il primo certificato di salario: perché è obbligatorio ogni anno, cosa deve contenere, il modulo ufficiale, il termine e la differenza con la dichiarazione AVS.',
  'it/blog/accident-travail-chantier-obligations-employeur-suva':
    "Notifica nei termini, salario durante l’incapacità, ripresa del lavoro: gli obblighi del datore di lavoro edile assicurato presso la SUVA dopo un infortunio.",
  'it/blog/apprenti-batiment-salaire-obligations-employeur':
    "Formare un apprendista nell’edilizia: salario progressivo fissato dal CCL, vero accompagnamento formativo e obblighi verso il Cantone.",
  'it/blog/avenant-chantier-plus-value-moins-value':
    "Il cliente che chiede una modifica in corso d’opera non firma quasi mai una variante scritta. Ecco come evitare che diventi lavoro gratuito.",
  'it/blog/bexio-vs-cantia-logiciel-batiment':
    "Bexio è una contabilità generalista svizzera. Cantia è pensata per il cantiere: preventivo dettato, redditività per progetto, fattura QR nativa.",
  'it/blog/calculer-13e-salaire-prorata-employe':
    "Chi è assunto ad aprile non ha diritto a una tredicesima completa a dicembre. Il calcolo pro rata sui mesi lavorati, premi e assenze compresi.",
  'it/blog/calculer-heures-travail-ouvrier-minutes-decimales':
    "Dalle 8 alle 12:45 sono 4h45, non 4,45 ore decimali (che sarebbero 4h27). Perché questa confusione costa cara su una busta paga.",
  'it/blog/calculer-prix-de-revient-chantier-batiment':
    "L’importo fatturato non è il prezzo di costo. Senza manodopera reale, materiali, subappalto e spese generali non si sa se un cantiere rende.",
  'it/blog/calculer-prix-horaire-reel-ouvrier-batiment':
    "Un preventivo basato sul solo salario lordo sottostima il vero costo orario: contano anche oneri sociali, assenze pagate e tempo non fatturabile.",
  'it/blog/certificat-de-travail-obligation-employeur-batiment':
    "Chi lascia l’impresa può esigere un certificato di lavoro in ogni momento. Negarlo o redigerlo male espone il datore di lavoro a una controversia.",
  'it/blog/combien-coute-logiciel-gestion-chantier-roi':
    "Il prezzo dell’abbonamento è solo una parte del calcolo. Come valutare il ritorno reale di un software di gestione per un’impresa edile.",
  'it/blog/crm-artisan-batiment-pourquoi-utile':
    "CRM fa pensare a team commerciali e cruscotti complessi. Ma chi segue 30, 50 o 100 clienti ha lo stesso problema di memoria di un commerciale.",
  'it/blog/degats-voisinage-chantier-qui-est-responsable':
    "Una crepa dal vicino dopo uno scavo, polvere su una facciata: la responsabilità non è automatica e si dimostra con un sopralluogo preliminare.",
  'it/blog/demission-employe-batiment-preavis-a-respecter':
    "Il preavviso di dimissione segue le regole del licenziamento. Chi parte senza rispettarlo crea un vuoto organizzativo che l’impresa può far valere.",
  'it/blog/devis-gratuit-en-ligne-suisse-outil':
    "Generatori gratuiti, modelli Word, strumenti online: cosa permette davvero ogni opzione per fare un preventivo, e dove si blocca quando l’attività cresce.",
  'it/blog/duree-conservation-devis-factures-suisse':
    "Il Codice delle obbligazioni (art. 958f) impone 10 anni di conservazione per i documenti contabili, fatture comprese, dalla fine dell’esercizio.",
  'it/blog/duree-validite-devis-non-signe-combien-temps':
    "Senza menzione esplicita, un preventivo non firmato non ha una validità fissa, e l’impresa rischia di dover onorare un prezzo superato.",
  'it/blog/facturation-heures-regie-batiment-comment-faire':
    "Il lavoro fatturato a ore è più contestabile di un prezzo fisso, se il dettaglio di ore, persone e compiti non è davvero tracciabile.",
  'it/blog/garantie-travaux-construction-2-ou-5-ans':
    "La garanzia legale per un’opera immobiliare è di 5 anni, non 2. Dal 2026 il termine per segnalare un difetto è ridotto a 60 giorni.",
  'it/blog/heures-supplementaires-batiment-majoration-25':
    "Nuovo CCL dell’edilizia: fino a 100 ore riportabili, maggiorazione del 25 % oltre, nuova soglia settimanale di 50 ore spostamenti compresi.",
  'it/blog/hypotheque-legale-artisans-entrepreneurs-suisse':
    "L’ipoteca legale (art. 837 CC) garantisce il pagamento dei lavori sull’immobile stesso, ma va iscritta nel registro fondiario entro 4 mesi.",
  'it/blog/licenciement-ouvrier-batiment-delai-conge-cct':
    "Il termine di disdetta di un operaio edile dipende dall’anzianità e dal CCL. Un errore può costare caro al datore di lavoro. Ecco come calcolarlo.",
  'it/blog/logiciel-gestion-chantier-independant-seul':
    "Quasi tutti gli strumenti di gestione cantiere sono pensati per i team. Chi lavora da solo ha esigenze diverse, e sono quelle che giustificano lo strumento.",
  'it/blog/meilleur-logiciel-devis-facture-batiment-suisse-2026':
    "Fattura QR nativa, catalogo prezzi, controllo per cantiere, uso offline: i criteri concreti per scegliere un software di preventivi e fatture edile.",
  'it/blog/mentions-obligatoires-facture-suisse-tva':
    "Numero IVA, aliquota, data della prestazione, riferimento QR: una fattura incompleta può essere rifiutata o contestata. L’elenco da verificare.",
  'it/blog/poursuite-facture-impayee-procedure-suisse':
    "Domanda d’esecuzione, precetto, opposizione, rigetto: come funziona un’esecuzione per una fattura non pagata e quando diventa davvero utile.",
  'it/blog/prescription-facture-impayee-delai-10-ans':
    "In Svizzera un credito contrattuale si prescrive in linea di principio dopo 10 anni, salvo atti interruttivi. Ignorarlo può costare il diritto al pagamento.",
  'it/blog/quel-logiciel-choisir-demarrer-entreprise-construction':
    "Tra tanti strumenti, il metodo più semplice per scegliere: partire da ciò che serve davvero nei primi tre mesi, non dall’elenco delle funzioni.",
  'it/blog/rabais-escompte-tva-ordre-soumission':
    "Ribasso e sconto non sono la stessa cosa, e l’ordine del calcolo cambia il totale. Un esempio in cifre, dalla somma lorda al totale IVA inclusa.",
  'it/blog/reception-travaux-proces-verbal-chantier':
    "La consegna dei lavori avvia la garanzia, trasferisce i rischi e fissa i difetti constatati. Senza verbale scritto, è impossibile dimostrarla.",
  'it/blog/remplir-soumission-pdf-architecte':
    "L’architetto manda un PDF di 40 pagine e aspetta i vostri prezzi. Un metodo per calcolare in fretta, senza errori di riporto, e restituire il documento.",
  'it/blog/site-internet-artisan-batiment-utile':
    "Un sito non è indispensabile per trovare clienti, ma cambia ciò che succede dopo il primo contatto. Cosa deve contenere, senza budget spropositati.",
  'it/blog/sous-traitant-batiment-suisse-contrat-facturation':
    "Chi ricorre a un subappaltatore risponde verso il cliente, verifica le sue assicurazioni e segue con precisione le sue fatture per cantiere.",
  'it/blog/trouver-clients-artisan-batiment-suisse':
    "Per riempire l’agenda non serve una grande campagna pubblicitaria. I canali che funzionano per un artigiano edile, dal passaparola alla visibilità locale.",
  'it/metiers/service-entretien/deneigement':
    "Interventi su chiamata, ore per indirizzo, contratti stagionali e fatture raggruppate a fine mese: Cantia per lo sgombero neve in Svizzera.",
  'it/metiers/agences-evenementiel/traiteur':
    "Eventi calcolati sugli ospiti, offerta firmata, personale pianificato, extra fatturati e salari del personale: Cantia per il catering in Svizzera.",
};
