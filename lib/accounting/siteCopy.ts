import { useAccCopy } from './locale';
import type { AccLocale } from './copy';

// Every string of the accounting.cantia.ch landing
// (components/accounting/AccountingLanding.tsx and its product mockups in
// components/accounting/landing/). The mockups show example data, labelled as
// such; the figures inside each mockup add up.

type Chapter = {
  key: ChapterKey;
  eyebrow: string;
  title: string;
  text: string;
  bullets: string[];
};
export type ChapterKey = 'entry' | 'reports' | 'vat' | 'closing' | 'portal' | 'firm';

const fr = {
  meta: {
    title: 'Cantia Accounting · Le logiciel des fiduciaires suisses',
    description:
      'Logiciel gratuit pour fiduciaires en Suisse : comptabilité de tous vos mandants (saisie avec TVA, import Banana, Abacus, Winbiz), décompte TVA de l’AFC avec fichier eCH-0217, bouclement, comptes annuels N / N-1, pièces et signatures par lien privé, travaux, échéances, temps et honoraires. Hébergé en Suisse.',
  },
  hero: {
    eyebrow: 'Logiciel pour fiduciaires · Suisse',
    title: 'Toute la comptabilité de vos mandants. Un seul cabinet.',
    text: 'Saisie, TVA de l’AFC, bouclement, pièces, signatures, échéances et honoraires : tout le travail de votre fiduciaire, pour chaque mandant, qu’il utilise Cantia ou un autre logiciel.',
    cta: 'Créer mon espace gratuitement',
    secondary: 'Voir les fonctions',
    points: ['Gratuit, sans limite de mandants', 'Hébergé en Suisse', 'Français, allemand, italien'],
  },
  formats: {
    label: 'Travaille avec vos formats',
    items: ['Banana', 'Abacus', 'Winbiz', 'Excel / CSV', 'eCH-0217 · Portail AFC', 'Plan comptable PME suisse', 'Bexio (clients Cantia)'],
  },
  shell: {
    firm: 'Rossier & Associés',
    user: 'Claire Rossier',
    nav: ['Vue d’ensemble', 'Mandants', 'Travaux', 'Demandes', 'Échéances', 'Signatures', 'Temps', 'Documents', 'Équipe'],
    example: 'Exemple',
    client: 'Menuiserie Bonvin Sàrl',
    clientMeta: '1950 Sion · IDE CHE-109.482.731 · TVA effective, trimestrielle',
    tabs: ['Aperçu', 'Comptabilité', 'Travaux', 'Demandes', 'Échéances', 'Signatures', 'Temps'],
  },
  overview: {
    hello: 'Bonjour Claire',
    date: 'Lundi 13 octobre 2026',
    kpis: [
      ['Mandants actifs', '38'],
      ['Réponses à vérifier', '5'],
      ['Échéances à 30 jours', '14'],
      ['Demandes ouvertes', '9'],
    ] as [string, string][],
    todoTitle: 'À traiter',
    todo: [
      ['Menuiserie Bonvin', 'a répondu : relevés bancaires T3', 'answered'],
      ['Garage du Rhône', 'TVA T3 : délai dans 47 j', 'soon'],
      ['Atelier Crettaz', 'n’a pas encore envoyé : inventaire au 31.12', 'late'],
      ['Studio Lumen', 'a signé les comptes annuels 2025', 'done'],
    ] as [string, string, 'answered' | 'soon' | 'late' | 'done'][],
    deadlinesTitle: 'Prochaines échéances',
    deadlines: [
      ['31.10', 'Acompte AVS · Q4', 'Boulangerie Favre'],
      ['29.11', 'Décompte TVA · T3', '12 mandants'],
      ['31.12', 'Bouclement 2026', '38 mandants'],
    ] as [string, string, string][],
  },
  realFiles: {
    eyebrow: 'Vos logiciels, vos formats',
    title: 'Avec quoi ça fonctionne, et ce qui sort vraiment',
    text: 'Reprenez la comptabilité d’un mandant depuis son ancien logiciel, rendez-lui ses écritures dans son format, déposez la TVA sur le portail de l’AFC. Les fichiers ci-contre ne sont pas des images : cette page les calcule à l’instant avec le code d’export de Cantia.',
    software: [
      { id: 'banana', name: 'Banana', what: 'Import et export des écritures, du plan comptable et des soldes', file: 'Texte séparé par tabulations (.txt)' },
      { id: 'abacus', name: 'Abacus', what: 'Import et export des écritures et des soldes', file: 'CSV point-virgule, dates suisses' },
      { id: 'winbiz', name: 'Winbiz', what: 'Import et export des écritures et des soldes', file: 'CSV point-virgule, dates suisses' },
      { id: 'csv', name: 'Excel / CSV', what: 'Tout journal à colonnes : débit, crédit, montant', file: '.xlsx, .csv, .txt' },
      { id: 'afc', name: 'Portail AFC', what: 'Décompte TVA pro, méthode effective', file: 'XML eCH-0217 v2.0.0' },
      { id: 'bexio', name: 'Bexio', what: 'Synchronisation pour les mandants qui utilisent Cantia', file: 'Connexion directe' },
    ],
    vatRule: 'Comme dans ces logiciels, une facture avec TVA tient sur une ligne : montant TTC et code TVA (V81, M81, I81…). À l’import, Cantia passe la TVA au 2200, 1170 ou 1171.',
    tabs: { banana: 'Banana', abacus: 'Abacus', winbiz: 'Winbiz', xml: 'TVA · eCH-0217', form: 'TVA · formulaire' },
    note: 'Mandant d’exemple : Menuiserie Bonvin Sàrl, 12 écritures, exercice 2025 bouclé, 3e trimestre 2026 déposé. Ces écritures ont été passées sur la vraie base de Cantia lors d’un test.',
    windowTitle: 'Exporter les écritures',
    xmlTitle: 'Contenu du fichier',
    xmlExcerpt: 'Extrait du fichier',
    xmlKeys: { uid: 'N° IDE', period: 'Période', kind: 'Type', kindValue: 'Décompte initial', turnover: 'Chiffre d’affaires (200)', due: 'TVA due', input: 'Impôt préalable', payable: 'Montant à payer (500)' },
    formCols: { figure: 'Chiffre', label: 'Libellé', amount: 'CHF' },
    more: '+ {n} autres lignes dans le fichier',
    download: 'Télécharger ce fichier',
    lines: '{n} lignes',
  },
  chaptersIntro: {
    eyebrow: 'Fonctions',
    title: 'Le travail d’une fiduciaire, de la pièce aux comptes annuels',
    text: 'Six espaces qui se suivent comme votre année : vous saisissez, vous contrôlez, vous déclarez, vous bouclez, le client signe, et le cabinet garde la vue d’ensemble.',
  },
  chapters: [
    {
      key: 'entry',
      eyebrow: 'Saisie et import',
      title: 'Une écriture à la seconde, la TVA séparée toute seule',
      text: 'Débit, crédit, montant TTC : Cantia sépare la TVA au bon taux et prépare la pièce suivante. Pour un nouveau mandant, reprenez toute sa comptabilité depuis son ancien logiciel.',
      bullets: [
        'Plan comptable PME suisse en français, allemand ou italien, ou celui du client importé',
        'Taux 8,1 %, 2,6 % et 3,8 %, comptes proposés pendant la frappe',
        'Import des écritures, du plan comptable et des soldes depuis Banana, Abacus, Winbiz ou Excel',
        'Aperçu avant import : une écriture déséquilibrée est signalée à la ligne près',
      ],
    },
    {
      key: 'reports',
      eyebrow: 'Journal et états financiers',
      title: 'Journal, grand livre, balance, bilan et résultat avec l’exercice précédent',
      text: 'Chaque état se calcule à partir des écritures, à la date que vous choisissez. Les comptes annuels sortent avec la colonne N-1, prêts à imprimer.',
      bullets: [
        'Recherche par libellé, numéro de pièce, compte ou montant',
        'Modifications et extournes tracées : rien n’est jamais effacé',
        'Périodes verrouillées après dépôt de la TVA ou bouclement',
        'Indicateurs : EBITDA, EBIT, liquidités, quick ratio, fonds propres',
      ],
    },
    {
      key: 'vat',
      eyebrow: 'TVA de l’AFC',
      title: 'Le décompte TVA rempli chiffre par chiffre, et le fichier pour le portail de l’AFC',
      text: 'Cantia remplit le formulaire de l’AFC à partir des codes TVA des écritures, le contrôle contre les comptes 2200, 1170 et 1171, et produit le fichier eCH-0217 à téléverser.',
      bullets: [
        'Méthode effective ou taux de la dette fiscale nette (vos taux AFC), trimestrielle ou semestrielle',
        'Chiffres 200 à 500, avec les chiffres manuels à compléter',
        'Fichier eCH-0217 v2.0.0 (méthode effective) et formulaire en CSV',
        'Au dépôt : écriture de décompte passée, échéance cochée, période verrouillée',
      ],
    },
    {
      key: 'closing',
      eyebrow: 'Bouclement',
      title: 'Les contrôles, puis l’exercice bouclé en un clic',
      text: 'Avant de boucler, Cantia vérifie ce qui manque. Le résultat passe au 2979, se reporte au 2970 le premier jour de l’exercice suivant, et l’exercice se verrouille.',
      bullets: [
        'Brouillons, décomptes TVA de l’exercice, comptes TVA soldés, compte 9100 et exercice précédent',
        'Écriture de résultat et report passés automatiquement',
        'Comptes annuels en PDF avec l’exercice précédent',
        'Un exercice se rouvre si besoin : rien n’est effacé',
      ],
    },
    {
      key: 'portal',
      eyebrow: 'Lien privé du client',
      title: 'Le client envoie ses pièces et signe depuis son téléphone',
      text: 'Chaque mandant reçoit un lien privé à vos couleurs. Il répond à vos demandes avec ses fichiers et signe ses comptes, sans créer de compte ni installer d’application.',
      bullets: [
        'Demandes de pièces avec date limite, rappel en un clic',
        'Dépôt de relevés, factures et justificatifs en PDF ou en photo',
        'Signature électronique simple avec preuve : nom, date, adresse IP, empreinte du document',
        'Clients sur Cantia : vous leur proposez une écriture, ils l’acceptent en un clic',
      ],
    },
    {
      key: 'firm',
      eyebrow: 'Pilotage du cabinet',
      title: 'Qui fait quoi, pour quel mandant, et ce qui reste à facturer',
      text: 'Vos modèles de travaux s’appliquent à chaque dossier et se répartissent dans l’équipe. Les échéances se calculent pour chaque mandant, le temps se saisit au tarif du client.',
      bullets: [
        'Modèles d’étapes : bouclement, TVA, salaires, déclaration d’impôt',
        'Échéances de chaque dossier : TVA, AVS, certificats de salaire, impôts, bouclement',
        'Temps par collaborateur et par mandant, honoraires à facturer',
        'Portefeuille : chiffres clés de tous vos mandants sur une page',
      ],
    },
  ] as Chapter[],
  mocks: {
    entry: {
      title: 'Nouvelle écriture',
      fields: [
        ['Date', '05.07.2026'],
        ['Pièce', 'F212'],
        ['Libellé', 'Facture 212 · Cuisine Dupuis'],
      ] as [string, string][],
      debit: ['Débit', '1100 Débiteurs'],
      credit: ['Crédit', '3400 Prestations de services'],
      amount: ['Montant TTC', '12’972.00'],
      vat: ['Code TVA', 'Taux normal 8,1 %'],
      splitTitle: 'Écriture comptabilisée',
      split: [
        ['1100', 'Débiteurs', '12’972.00', ''],
        ['3400', 'Prestations de services', '', '12’000.00'],
        ['2200', 'TVA due', '', '972.00'],
      ] as [string, string, string, string][],
      save: 'Enregistrer · pièce suivante',
      importLine: 'Repris de Banana : 1’284 écritures, plan comptable et soldes · 0 erreur',
    },
    reports: {
      views: ['Journal', 'Grand livre', 'Balance', 'Bilan', 'Résultat'],
      title: 'Compte de résultat',
      cols: ['', '2026', '2025'],
      rows: [
        ['Produits d’exploitation', '1’284’500', '1’176’200', ''],
        ['Charges de matériel', '−412’300', '−398’100', ''],
        ['Charges de personnel', '−538’900', '−502’400', ''],
        ['Autres charges d’exploitation', '−164’200', '−151’900', ''],
        ['EBITDA', '169’100', '123’800', 'sub'],
        ['Amortissements', '−38’000', '−35’500', ''],
        ['Résultat d’exploitation (EBIT)', '131’100', '88’300', 'total'],
      ] as [string, string, string, '' | 'sub' | 'total'][],
      kpis: [
        ['Marge EBITDA', '13,2 %'],
        ['Quick ratio', '1,48'],
        ['Fonds propres', '41 %'],
      ] as [string, string][],
    },
    vat: {
      title: 'Décompte TVA · 3e trimestre 2026',
      quarters: [
        ['T1', 'Déposé', 'done'],
        ['T2', 'Déposé', 'done'],
        ['T3', 'À déposer', 'todo'],
        ['T4', 'En cours', 'idle'],
      ] as [string, string, 'done' | 'todo' | 'idle'][],
      cols: ['Ch.', 'Désignation', 'CHF'],
      rows: [
        ['200', 'Total des contre-prestations', '12’000.00'],
        ['299', 'Chiffre d’affaires imposable', '12’000.00'],
        ['303', 'Taux normal 8,1 %', '972.00'],
        ['400', 'Impôt préalable, matériel et prestations', '243.00'],
        ['405', 'Impôt préalable, investissements', '162.00'],
      ] as [string, string, string][],
      total: ['500', 'Montant à payer à l’AFC', '567.00'],
      due: 'Délai 29.11.2026',
      checks: ['TVA due comptabilisée (2200) concordante', 'Impôt préalable (1170 / 1171) concordant'],
      xml: 'Fichier eCH-0217',
      file: 'Déposer le décompte',
    },
    closing: {
      title: 'Exercice 2026',
      status: 'À boucler',
      entries: '1’312 écritures',
      checksTitle: 'Contrôles avant bouclement',
      checks: [
        'Aucun brouillon dans l’exercice',
        'Décomptes TVA de l’exercice déposés : 4 / 4',
        'Comptes TVA soldés au 31.12.2026 (2200, 1170, 1171)',
        'Compte 9100 (bilan d’ouverture) soldé',
        'Exercice précédent bouclé',
      ],
      result: ['Résultat de l’exercice', 'CHF 96’840.00'],
      moves: [
        ['31.12.2026', 'Résultat → 2979'],
        ['01.01.2027', 'Report → 2970'],
      ] as [string, string][],
      close: 'Boucler l’exercice 2026',
      pdf: 'Comptes annuels N / N-1 (PDF)',
    },
    portal: {
      firm: 'Rossier & Associés',
      hello: 'Bonjour Menuiserie Bonvin',
      requestsTitle: 'Demandé par votre fiduciaire',
      requests: [
        ['Relevés bancaires juillet à septembre', 'Pour le 15.10', 'open'],
        ['Contrat de leasing du véhicule', 'Envoyé le 02.10', 'sent'],
      ] as [string, string, 'open' | 'sent'][],
      upload: 'Déposer des fichiers',
      signTitle: 'À signer',
      signDoc: 'Comptes annuels 2025',
      signHint: 'Signez ici',
      sign: 'Signer le document',
      proof: 'Nom, date, adresse IP et empreinte du document conservés',
    },
    firm: {
      workTitle: 'Travaux · Bouclement 2025',
      cols: ['Mandant', 'Responsable', 'Avancement'],
      work: [
        ['Menuiserie Bonvin', 'CR', 9, 9],
        ['Garage du Rhône', 'ML', 6, 9],
        ['Atelier Crettaz', 'CR', 3, 9],
        ['Studio Lumen', 'JP', 8, 9],
      ] as [string, string, number, number][],
      timeTitle: 'Temps · octobre',
      time: [
        ['Saisies', '46 h 30'],
        ['Honoraires', 'CHF 7’440.00'],
        ['À facturer', 'CHF 5’120.00'],
      ] as [string, string][],
      deadlinesTitle: 'Échéances',
      deadlines: [
        ['29.11', 'TVA T3', 'Garage du Rhône', 'soon'],
        ['31.01', 'Certificats de salaire', 'Atelier Crettaz', 'idle'],
        ['30.05', 'TVA T1 · déposé', 'Studio Lumen', 'done'],
      ] as [string, string, string, 'soon' | 'idle' | 'done'][],
    },
  },
  kinds: {
    eyebrow: 'Tous vos mandants',
    title: 'Sur Cantia ou sur un autre logiciel, le même dossier',
    cantia: {
      label: 'Mandant sur Cantia',
      title: 'Ses données arrivent seules',
      items: [
        'Factures, paiements, écritures et justificatifs à jour, sans envoi par e-mail',
        'Il choisit ce que vous voyez et retire l’accès quand il veut',
        'Vous proposez une écriture, il l’accepte en un clic',
        'Indicateurs calculés sur sa comptabilité',
      ],
    },
    external: {
      label: 'Mandant sur un autre logiciel',
      title: 'Vous tenez ses livres dans Cantia',
      items: [
        'Reprise des écritures et des soldes depuis Banana, Abacus, Winbiz ou Excel',
        'Un lien privé pour déposer ses pièces et signer, sans compte',
        'Décompte TVA, bouclement et comptes annuels prêts à signer',
        'Export dans son logiciel s’il garde son outil',
      ],
    },
  },
  calendar: {
    eyebrow: 'Échéances',
    title: 'L’année de chaque mandant, calculée d’avance',
    text: 'Selon sa méthode TVA, sa périodicité et ses salariés, Cantia pose les échéances de chaque dossier. Vous voyez ce qui vient, pour qui, et ce qui est déjà fait.',
    months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    events: [
      [0, 'Salaires AVS et certificats de salaire'],
      [2, 'TVA T4 de l’année précédente'],
      [4, 'TVA T1'],
      [7, 'TVA T2'],
      [10, 'TVA T3'],
      [11, 'Bouclement de l’exercice'],
    ] as [number, string][],
    note: 'Exemple : mandant à la méthode effective, décompte trimestriel. Délais de dépôt de l’AFC : 60 jours après la fin de la période.',
  },
  included: {
    eyebrow: 'Inclus',
    title: 'Tout ce que contient votre espace',
    groups: [
      {
        title: 'Comptabilité',
        items: [
          'Plan comptable PME suisse FR / DE / IT',
          'Saisie avec séparation de la TVA',
          'Écritures multiples et extournes',
          'Journal, grand livre, balance',
          'Bilan et résultat avec N-1',
          'Soldes d’ouverture',
          'Verrouillage des périodes',
          'Import Banana, Abacus, Winbiz, Excel',
          'Export Banana, Abacus, Winbiz, CSV',
        ],
      },
      {
        title: 'TVA et clôture',
        items: [
          'Formulaire AFC chiffre par chiffre',
          'Méthode effective et TDFN',
          'Contrôle contre 2200, 1170, 1171',
          'Fichier eCH-0217 pour le portail AFC',
          'Écriture de décompte automatique',
          'Contrôles avant bouclement',
          'Résultat au 2979, report au 2970',
          'Comptes annuels PDF',
          'Réouverture d’un exercice',
        ],
      },
      {
        title: 'Avec vos mandants',
        items: [
          'Lien privé à vos couleurs',
          'Demandes de pièces avec délai',
          'Dépôt de fichiers sans compte',
          'Signature électronique simple',
          'Accès aux données des clients Cantia',
          'Écritures proposées au client',
          'Accès révocable par le client',
          'Notes internes par dossier',
        ],
      },
      {
        title: 'Le cabinet',
        items: [
          'Collaborateurs illimités',
          'Modèles de travaux et checklists',
          'Échéances par mandant',
          'Temps et honoraires',
          'Indicateurs et portefeuille',
          'Documents classés par mandant',
          'Profil dans l’annuaire des fiduciaires',
          'Programme Cantia Partners',
        ],
      },
    ],
  },
  security: {
    eyebrow: 'Confiance',
    title: 'Les données de vos mandants restent sous contrôle',
    items: [
      {
        icon: 'map-pin',
        title: 'Hébergé en Suisse',
        text: 'Base de données à Zurich. Conçu et exploité en Suisse.',
      },
      {
        icon: 'user-check',
        title: 'Accès donné par le client',
        text: 'Aucun accès aux données d’un client Cantia sans son accord. Il choisit ce que vous voyez.',
      },
      {
        icon: 'x-octagon',
        title: 'Révocable à tout moment',
        text: 'Le client retire l’accès quand il veut, avec effet immédiat.',
      },
      {
        icon: 'list',
        title: 'Tout est journalisé',
        text: 'Chaque accès et chaque modification est enregistré, avec l’auteur et la date.',
      },
      {
        icon: 'lock',
        title: 'Rien n’est effacé',
        text: 'Modifications et extournes tracées, périodes et exercices verrouillés.',
      },
      {
        icon: 'pen-tool',
        title: 'Signatures avec preuve',
        text: 'Nom, signature, date, adresse IP et empreinte du document conservés.',
      },
    ],
  },
  pricing: {
    eyebrow: 'Tarif',
    title: 'Gratuit pour les fiduciaires',
    price: 'CHF 0',
    per: 'par mois, sans limite',
    text: 'L’espace fiduciaire est gratuit, avec tous vos collaborateurs et tous vos mandants. Vos clients sur Cantia paient leur abonnement habituel ; les autres n’ont rien à payer pour vous envoyer leurs pièces.',
    items: ['Mandants et collaborateurs illimités', 'Toutes les fonctions incluses', 'Sans carte bancaire, sans engagement'],
    cta: 'Créer mon espace gratuitement',
  },
  steps: {
    title: 'En place en une matinée',
    items: [
      {
        title: 'Créez votre espace',
        text: 'Deux minutes. Invitez vos collaborateurs, ajoutez votre logo et votre couleur.',
      },
      {
        title: 'Ajoutez vos mandants',
        text: 'Un client sur Cantia reçoit une demande d’accès. Pour les autres, créez la fiche et reprenez leur comptabilité.',
      },
      {
        title: 'Travaillez',
        text: 'Saisie, TVA, bouclement, pièces, signatures, temps : tout le dossier au même endroit.',
      },
    ],
  },
  partner: {
    eyebrow: 'Cantia Partners',
    title: 'Recommandez Cantia à vos mandants',
    text: 'Activez Cantia Partners depuis votre espace : quand un mandant que vous invitez devient client payant, vous touchez une commission. Même compte, sans formalité.',
    cta: 'Découvrir Cantia Partners',
  },
  faq: {
    title: 'Questions fréquentes',
    items: [
      {
        q: 'Combien ça coûte ?',
        a: 'Rien. L’espace fiduciaire est gratuit, sans limite de mandants ni de collaborateurs. Vos clients sur Cantia paient leur abonnement habituel.',
      },
      {
        q: 'Mes clients doivent-ils utiliser Cantia ?',
        a: 'Non. Un client sur Cantia vous ouvre ses données, qui arrivent seules. Pour les autres, vous tenez leur comptabilité dans Cantia (saisie ou import depuis Banana, Abacus, Winbiz, Excel) et ils vous envoient leurs pièces par un lien privé, sans compte.',
      },
      {
        q: 'Puis-je reprendre la comptabilité d’un nouveau mandant ?',
        a: 'Oui. Importez les écritures, le plan comptable et les soldes d’ouverture depuis Banana, Abacus, Winbiz ou un fichier Excel. Un aperçu montre chaque ligne avant l’import et signale les écritures déséquilibrées.',
      },
      {
        q: 'Le décompte TVA part-il directement à l’AFC ?',
        a: 'Cantia remplit le formulaire chiffre par chiffre et prépare le fichier eCH-0217 v2.0.0 que vous téléversez dans « Décompte TVA pro » sur le portail de l’AFC (méthode effective ; en TDFN, vous reportez les chiffres). Le dépôt dans Cantia passe l’écriture de décompte, coche l’échéance et peut verrouiller la période.',
      },
      {
        q: 'Quelles méthodes TVA sont prises en charge ?',
        a: 'La méthode effective, avec les taux 8,1 %, 2,6 % et 3,8 % (et 7,7 %, 2,5 %, 3,7 % pour les périodes avant 2024), en décompte trimestriel. La méthode des taux de la dette fiscale nette, en décompte semestriel, avec les deux taux que l’AFC a accordés au mandant.',
      },
      {
        q: 'Puis-je modifier les données d’un client Cantia ?',
        a: 'Non, l’accès est en lecture seule. Vous lui proposez des écritures, il les accepte. Pour un mandant hors Cantia, vous tenez ses livres avec un historique complet : rien n’est effacé et les périodes se verrouillent.',
      },
      {
        q: 'La signature des documents est-elle valable ?',
        a: 'C’est une signature électronique simple : nom, signature tracée à l’écran, date, adresse IP et empreinte du document sont conservés. Elle convient pour approuver des comptes ou une lettre de mission, pas là où la loi exige une signature qualifiée.',
      },
      {
        q: 'Où sont hébergées les données ?',
        a: 'En Suisse : la base de données est à Zurich. Chaque accès et chaque modification est journalisé.',
      },
      {
        q: 'Et si un client garde Banana, Abacus ou Winbiz ?',
        a: 'Vous exportez ses écritures et ses soldes dans le format de son logiciel. Pour les clients sur Cantia, la synchronisation avec Bexio reste disponible.',
      },
      {
        q: 'J’ai déjà un compte Cantia.',
        a: 'Connectez-vous avec les mêmes identifiants : l’espace fiduciaire s’ajoute à votre compte.',
      },
    ],
  },
  final: {
    title: 'Votre cabinet, tous vos mandants, un seul espace.',
    text: 'Gratuit pour les fiduciaires. Prêt en deux minutes.',
    cta: 'Créer mon espace gratuitement',
    secondary: 'Se connecter',
  },
};

type Copy = typeof fr;

const de: Copy = {
  meta: {
    title: 'Cantia Accounting · Die Software für Schweizer Treuhänder',
    description:
      'Kostenlose Software für Treuhänder in der Schweiz: Buchhaltung aller Mandanten (Erfassung mit MWST, Import aus Banana, Abacus, Winbiz), MWST-Abrechnung der ESTV mit eCH-0217-Datei, Abschluss, Jahresrechnung mit Vorjahr, Belege und Unterschriften per privatem Link, Arbeiten, Fristen, Zeit und Honorare. In der Schweiz gehostet.',
  },
  hero: {
    eyebrow: 'Software für Treuhänder · Schweiz',
    title: 'Die ganze Buchhaltung Ihrer Mandanten. Eine Treuhand.',
    text: 'Erfassung, MWST der ESTV, Abschluss, Belege, Unterschriften, Fristen und Honorare: die ganze Arbeit Ihrer Treuhand, für jeden Mandanten, ob er Cantia nutzt oder eine andere Software.',
    cta: 'Kostenlos Bereich erstellen',
    secondary: 'Funktionen ansehen',
    points: ['Kostenlos, beliebig viele Mandanten', 'In der Schweiz gehostet', 'Deutsch, Französisch, Italienisch'],
  },
  formats: {
    label: 'Arbeitet mit Ihren Formaten',
    items: ['Banana', 'Abacus', 'Winbiz', 'Excel / CSV', 'eCH-0217 · ESTV-Portal', 'Schweizer KMU-Kontenrahmen', 'Bexio (Cantia-Kunden)'],
  },
  shell: {
    firm: 'Rossier & Partner',
    user: 'Claire Rossier',
    nav: ['Übersicht', 'Mandanten', 'Arbeiten', 'Anfragen', 'Fristen', 'Unterschriften', 'Zeit', 'Dokumente', 'Team'],
    example: 'Beispiel',
    client: 'Schreinerei Bonvin GmbH',
    clientMeta: '3900 Brig · UID CHE-109.482.731 · MWST effektiv, vierteljährlich',
    tabs: ['Übersicht', 'Buchhaltung', 'Arbeiten', 'Anfragen', 'Fristen', 'Unterschriften', 'Zeit'],
  },
  overview: {
    hello: 'Guten Tag, Claire',
    date: 'Montag, 13. Oktober 2026',
    kpis: [
      ['Aktive Mandanten', '38'],
      ['Antworten zu prüfen', '5'],
      ['Fristen in 30 Tagen', '14'],
      ['Offene Anfragen', '9'],
    ],
    todoTitle: 'Zu erledigen',
    todo: [
      ['Schreinerei Bonvin', 'hat geantwortet: Bankauszüge Q3', 'answered'],
      ['Garage Rhone', 'MWST Q3: Frist in 47 Tagen', 'soon'],
      ['Atelier Crettaz', 'hat noch nicht gesendet: Inventar per 31.12.', 'late'],
      ['Studio Lumen', 'hat die Jahresrechnung 2025 unterzeichnet', 'done'],
    ],
    deadlinesTitle: 'Nächste Fristen',
    deadlines: [
      ['31.10.', 'AHV-Akonto · Q4', 'Bäckerei Favre'],
      ['29.11.', 'MWST-Abrechnung · Q3', '12 Mandanten'],
      ['31.12.', 'Abschluss 2026', '38 Mandanten'],
    ],
  },
  realFiles: {
    eyebrow: 'Ihre Software, Ihre Formate',
    title: 'Womit es funktioniert, und was wirklich herauskommt',
    text: 'Übernehmen Sie die Buchhaltung eines Mandanten aus seiner bisherigen Software, geben Sie ihm seine Buchungen in seinem Format zurück, reichen Sie die MWST im ESTV-Portal ein. Die Dateien nebenan sind keine Bilder: Diese Seite berechnet sie in diesem Moment mit dem Exportcode von Cantia.',
    software: [
      { id: 'banana', name: 'Banana', what: 'Import und Export von Buchungen, Kontenplan und Saldi', file: 'Tabulatorgetrennter Text (.txt)' },
      { id: 'abacus', name: 'Abacus', what: 'Import und Export von Buchungen und Saldi', file: 'CSV mit Semikolon, Schweizer Datum' },
      { id: 'winbiz', name: 'Winbiz', what: 'Import und Export von Buchungen und Saldi', file: 'CSV mit Semikolon, Schweizer Datum' },
      { id: 'csv', name: 'Excel / CSV', what: 'Jedes Journal mit Spalten: Soll, Haben, Betrag', file: '.xlsx, .csv, .txt' },
      { id: 'afc', name: 'ESTV-Portal', what: 'MWST abrechnen pro, effektive Methode', file: 'XML eCH-0217 v2.0.0' },
      { id: 'bexio', name: 'Bexio', what: 'Synchronisation für Mandanten, die Cantia nutzen', file: 'Direkte Verbindung' },
    ],
    vatRule: 'Wie in diesen Programmen steht eine Rechnung mit MWST auf einer Zeile: Bruttobetrag und MWST-Code (V81, M81, I81…). Beim Import bucht Cantia die MWST auf 2200, 1170 oder 1171.',
    tabs: { banana: 'Banana', abacus: 'Abacus', winbiz: 'Winbiz', xml: 'MWST · eCH-0217', form: 'MWST · Formular' },
    note: 'Beispielmandant: Menuiserie Bonvin Sàrl, 12 Buchungen, Geschäftsjahr 2025 abgeschlossen, 3. Quartal 2026 eingereicht. Diese Buchungen wurden bei einem Test in der echten Datenbank von Cantia erfasst.',
    windowTitle: 'Buchungen exportieren',
    xmlTitle: 'Inhalt der Datei',
    xmlExcerpt: 'Auszug aus der Datei',
    xmlKeys: { uid: 'UID-Nummer', period: 'Periode', kind: 'Art', kindValue: 'Ersteinreichung', turnover: 'Umsatz (200)', due: 'Geschuldete MWST', input: 'Vorsteuer', payable: 'Zu bezahlender Betrag (500)' },
    formCols: { figure: 'Ziffer', label: 'Bezeichnung', amount: 'CHF' },
    more: '+ {n} weitere Zeilen in der Datei',
    download: 'Datei herunterladen',
    lines: '{n} Zeilen',
  },
  chaptersIntro: {
    eyebrow: 'Funktionen',
    title: 'Die Arbeit einer Treuhand, vom Beleg bis zur Jahresrechnung',
    text: 'Sechs Bereiche, die Ihrem Jahr folgen: Sie erfassen, prüfen, deklarieren und schliessen ab, der Kunde unterzeichnet, und die Treuhand behält den Überblick.',
  },
  chapters: [
    {
      key: 'entry',
      eyebrow: 'Erfassung und Import',
      title: 'Eine Buchung pro Sekunde, die MWST wird selbst ausgeschieden',
      text: 'Soll, Haben, Bruttobetrag: Cantia scheidet die MWST zum richtigen Satz aus und bereitet den nächsten Beleg vor. Für einen neuen Mandanten übernehmen Sie die ganze Buchhaltung aus seiner bisherigen Software.',
      bullets: [
        'Schweizer KMU-Kontenrahmen auf Deutsch, Französisch oder Italienisch, oder der importierte des Kunden',
        'Sätze 8,1 %, 2,6 % und 3,8 %, Konten werden beim Tippen vorgeschlagen',
        'Import von Buchungen, Kontenplan und Saldi aus Banana, Abacus, Winbiz oder Excel',
        'Vorschau vor dem Import: unausgeglichene Buchungen zeilengenau gemeldet',
      ],
    },
    {
      key: 'reports',
      eyebrow: 'Journal und Abschlüsse',
      title: 'Journal, Hauptbuch, Saldobilanz, Bilanz und Erfolgsrechnung mit Vorjahr',
      text: 'Jede Auswertung wird aus den Buchungen berechnet, per gewähltem Datum. Die Jahresrechnung kommt mit Vorjahresspalte, druckbereit.',
      bullets: [
        'Suche nach Text, Belegnummer, Konto oder Betrag',
        'Änderungen und Stornos nachvollziehbar: Nichts wird je gelöscht',
        'Perioden nach MWST-Abrechnung oder Abschluss gesperrt',
        'Kennzahlen: EBITDA, EBIT, Liquidität, Quick Ratio, Eigenkapital',
      ],
    },
    {
      key: 'vat',
      eyebrow: 'MWST der ESTV',
      title: 'Die MWST-Abrechnung Ziffer für Ziffer, und die Datei für das ESTV-Portal',
      text: 'Cantia füllt das Formular der ESTV aus den MWST-Codes der Buchungen, prüft es gegen die Konten 2200, 1170 und 1171 und erstellt die eCH-0217-Datei zum Hochladen.',
      bullets: [
        'Effektive Methode oder Saldosteuersätze (Ihre ESTV-Sätze), vierteljährlich oder halbjährlich',
        'Ziffern 200 bis 500, manuelle Ziffern zum Ergänzen',
        'eCH-0217-Datei v2.0.0 (effektive Methode) und Formular als CSV',
        'Bei der Einreichung: Abrechnungsbuchung verbucht, Frist abgehakt, Periode gesperrt',
      ],
    },
    {
      key: 'closing',
      eyebrow: 'Jahresabschluss',
      title: 'Die Kontrollen, dann das Jahr mit einem Klick abgeschlossen',
      text: 'Vor dem Abschluss prüft Cantia, was fehlt. Das Ergebnis geht auf 2979, wird am ersten Tag des Folgejahres auf 2970 vorgetragen, und das Jahr wird gesperrt.',
      bullets: [
        'Entwürfe, MWST-Abrechnungen des Jahres, ausgeglichene MWST-Konten, Konto 9100 und Vorjahr',
        'Ergebnis- und Vortragsbuchung automatisch verbucht',
        'Jahresrechnung als PDF mit Vorjahr',
        'Ein Jahr lässt sich wieder öffnen: Nichts wird gelöscht',
      ],
    },
    {
      key: 'portal',
      eyebrow: 'Privater Link des Kunden',
      title: 'Der Kunde sendet Belege und unterzeichnet vom Handy aus',
      text: 'Jeder Mandant erhält einen privaten Link in Ihren Farben. Er beantwortet Ihre Anfragen mit seinen Dateien und unterzeichnet die Jahresrechnung, ohne Konto und ohne App.',
      bullets: [
        'Beleganfragen mit Frist, Erinnerung mit einem Klick',
        'Upload von Auszügen, Rechnungen und Belegen als PDF oder Foto',
        'Einfache elektronische Unterschrift mit Nachweis: Name, Datum, IP-Adresse, Fingerabdruck des Dokuments',
        'Kunden auf Cantia: Sie schlagen eine Buchung vor, sie nehmen sie mit einem Klick an',
      ],
    },
    {
      key: 'firm',
      eyebrow: 'Führung der Treuhand',
      title: 'Wer macht was für welchen Mandanten, und was noch zu fakturieren ist',
      text: 'Ihre Arbeitsvorlagen gelten für jedes Dossier und werden im Team verteilt. Die Fristen werden pro Mandant berechnet, die Zeit zum Kundentarif erfasst.',
      bullets: [
        'Vorlagen mit Schritten: Abschluss, MWST, Löhne, Steuererklärung',
        'Fristen jedes Dossiers: MWST, AHV, Lohnausweise, Steuern, Abschluss',
        'Zeit pro Mitarbeitenden und Mandant, offene Honorare',
        'Portfolio: Kennzahlen aller Mandanten auf einer Seite',
      ],
    },
  ],
  mocks: {
    entry: {
      title: 'Neue Buchung',
      fields: [
        ['Datum', '05.07.2026'],
        ['Beleg', 'F212'],
        ['Text', 'Rechnung 212 · Küche Dupuis'],
      ],
      debit: ['Soll', '1100 Debitoren'],
      credit: ['Haben', '3400 Dienstleistungserlöse'],
      amount: ['Bruttobetrag', '12’972.00'],
      vat: ['MWST-Code', 'Normalsatz 8,1 %'],
      splitTitle: 'Verbuchte Buchung',
      split: [
        ['1100', 'Debitoren', '12’972.00', ''],
        ['3400', 'Dienstleistungserlöse', '', '12’000.00'],
        ['2200', 'Geschuldete MWST', '', '972.00'],
      ],
      save: 'Speichern · nächster Beleg',
      importLine: 'Aus Banana übernommen: 1’284 Buchungen, Kontenplan und Saldi · 0 Fehler',
    },
    reports: {
      views: ['Journal', 'Hauptbuch', 'Saldobilanz', 'Bilanz', 'Erfolgsrechnung'],
      title: 'Erfolgsrechnung',
      cols: ['', '2026', '2025'],
      rows: [
        ['Betriebsertrag', '1’284’500', '1’176’200', ''],
        ['Materialaufwand', '−412’300', '−398’100', ''],
        ['Personalaufwand', '−538’900', '−502’400', ''],
        ['Übriger Betriebsaufwand', '−164’200', '−151’900', ''],
        ['EBITDA', '169’100', '123’800', 'sub'],
        ['Abschreibungen', '−38’000', '−35’500', ''],
        ['Betriebsergebnis (EBIT)', '131’100', '88’300', 'total'],
      ],
      kpis: [
        ['EBITDA-Marge', '13,2 %'],
        ['Quick Ratio', '1,48'],
        ['Eigenkapital', '41 %'],
      ],
    },
    vat: {
      title: 'MWST-Abrechnung · 3. Quartal 2026',
      quarters: [
        ['Q1', 'Eingereicht', 'done'],
        ['Q2', 'Eingereicht', 'done'],
        ['Q3', 'Einzureichen', 'todo'],
        ['Q4', 'Laufend', 'idle'],
      ],
      cols: ['Ziff.', 'Bezeichnung', 'CHF'],
      rows: [
        ['200', 'Total der vereinbarten Entgelte', '12’000.00'],
        ['299', 'Steuerbarer Gesamtumsatz', '12’000.00'],
        ['303', 'Normalsatz 8,1 %', '972.00'],
        ['400', 'Vorsteuer Material und Dienstleistungen', '243.00'],
        ['405', 'Vorsteuer Investitionen', '162.00'],
      ],
      total: ['500', 'An die ESTV zu bezahlen', '567.00'],
      due: 'Frist 29.11.2026',
      checks: ['Verbuchte geschuldete MWST (2200) stimmt überein', 'Vorsteuer (1170 / 1171) stimmt überein'],
      xml: 'eCH-0217-Datei',
      file: 'Abrechnung einreichen',
    },
    closing: {
      title: 'Geschäftsjahr 2026',
      status: 'Abzuschliessen',
      entries: '1’312 Buchungen',
      checksTitle: 'Kontrollen vor dem Abschluss',
      checks: [
        'Keine Entwürfe im Geschäftsjahr',
        'MWST-Abrechnungen des Jahres eingereicht: 4 / 4',
        'MWST-Konten per 31.12.2026 ausgeglichen (2200, 1170, 1171)',
        'Konto 9100 (Eröffnungsbilanz) ausgeglichen',
        'Vorjahr abgeschlossen',
      ],
      result: ['Jahresergebnis', 'CHF 96’840.00'],
      moves: [
        ['31.12.2026', 'Ergebnis → 2979'],
        ['01.01.2027', 'Vortrag → 2970'],
      ],
      close: 'Geschäftsjahr 2026 abschliessen',
      pdf: 'Jahresrechnung mit Vorjahr (PDF)',
    },
    portal: {
      firm: 'Rossier & Partner',
      hello: 'Guten Tag, Schreinerei Bonvin',
      requestsTitle: 'Von Ihrer Treuhand angefragt',
      requests: [
        ['Bankauszüge Juli bis September', 'Bis 15.10.', 'open'],
        ['Leasingvertrag des Fahrzeugs', 'Gesendet am 02.10.', 'sent'],
      ],
      upload: 'Dateien hochladen',
      signTitle: 'Zu unterzeichnen',
      signDoc: 'Jahresrechnung 2025',
      signHint: 'Hier unterschreiben',
      sign: 'Dokument unterzeichnen',
      proof: 'Name, Datum, IP-Adresse und Fingerabdruck des Dokuments gespeichert',
    },
    firm: {
      workTitle: 'Arbeiten · Abschluss 2025',
      cols: ['Mandant', 'Verantwortlich', 'Stand'],
      work: [
        ['Schreinerei Bonvin', 'CR', 9, 9],
        ['Garage Rhone', 'ML', 6, 9],
        ['Atelier Crettaz', 'CR', 3, 9],
        ['Studio Lumen', 'JP', 8, 9],
      ],
      timeTitle: 'Zeit · Oktober',
      time: [
        ['Erfasst', '46 h 30'],
        ['Honorare', 'CHF 7’440.00'],
        ['Zu fakturieren', 'CHF 5’120.00'],
      ],
      deadlinesTitle: 'Fristen',
      deadlines: [
        ['29.11.', 'MWST Q3', 'Garage Rhone', 'soon'],
        ['31.01.', 'Lohnausweise', 'Atelier Crettaz', 'idle'],
        ['30.05.', 'MWST Q1 · eingereicht', 'Studio Lumen', 'done'],
      ],
    },
  },
  kinds: {
    eyebrow: 'Alle Ihre Mandanten',
    title: 'Auf Cantia oder mit anderer Software, dasselbe Dossier',
    cantia: {
      label: 'Mandant auf Cantia',
      title: 'Seine Daten kommen von selbst',
      items: [
        'Aktuelle Rechnungen, Zahlungen, Buchungen und Belege, ohne Versand per E-Mail',
        'Er wählt, was Sie sehen, und widerruft den Zugriff jederzeit',
        'Sie schlagen eine Buchung vor, er nimmt sie mit einem Klick an',
        'Kennzahlen aus seiner Buchhaltung',
      ],
    },
    external: {
      label: 'Mandant mit anderer Software',
      title: 'Sie führen seine Bücher in Cantia',
      items: [
        'Übernahme von Buchungen und Saldi aus Banana, Abacus, Winbiz oder Excel',
        'Ein privater Link für Belege und Unterschriften, ohne Konto',
        'MWST-Abrechnung, Abschluss und Jahresrechnung bereit zur Unterschrift',
        'Export in seine Software, wenn er sein Tool behält',
      ],
    },
  },
  calendar: {
    eyebrow: 'Fristen',
    title: 'Das Jahr jedes Mandanten, im Voraus berechnet',
    text: 'Je nach MWST-Methode, Periodizität und Angestellten setzt Cantia die Fristen jedes Dossiers. Sie sehen, was kommt, für wen, und was schon erledigt ist.',
    months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    events: [
      [0, 'AHV-Lohnmeldung und Lohnausweise'],
      [2, 'MWST Q4 des Vorjahres'],
      [4, 'MWST Q1'],
      [7, 'MWST Q2'],
      [10, 'MWST Q3'],
      [11, 'Abschluss des Geschäftsjahres'],
    ],
    note: 'Beispiel: Mandant mit effektiver Methode, vierteljährliche Abrechnung. Einreichefrist der ESTV: 60 Tage nach Ende der Periode.',
  },
  included: {
    eyebrow: 'Inbegriffen',
    title: 'Alles, was Ihr Bereich enthält',
    groups: [
      {
        title: 'Buchhaltung',
        items: [
          'KMU-Kontenrahmen DE / FR / IT',
          'Erfassung mit MWST-Ausscheidung',
          'Sammelbuchungen und Stornos',
          'Journal, Hauptbuch, Saldobilanz',
          'Bilanz und Erfolgsrechnung mit Vorjahr',
          'Eröffnungssaldi',
          'Periodensperre',
          'Import Banana, Abacus, Winbiz, Excel',
          'Export Banana, Abacus, Winbiz, CSV',
        ],
      },
      {
        title: 'MWST und Abschluss',
        items: [
          'ESTV-Formular Ziffer für Ziffer',
          'Effektive Methode und Saldosteuersatz',
          'Abgleich mit 2200, 1170, 1171',
          'eCH-0217-Datei für das ESTV-Portal',
          'Automatische Abrechnungsbuchung',
          'Kontrollen vor dem Abschluss',
          'Ergebnis auf 2979, Vortrag auf 2970',
          'Jahresrechnung als PDF',
          'Wiedereröffnung eines Jahres',
        ],
      },
      {
        title: 'Mit Ihren Mandanten',
        items: [
          'Privater Link in Ihren Farben',
          'Beleganfragen mit Frist',
          'Upload ohne Konto',
          'Einfache elektronische Unterschrift',
          'Zugriff auf Daten von Cantia-Kunden',
          'Buchungsvorschläge an den Kunden',
          'Vom Kunden widerrufbarer Zugriff',
          'Interne Notizen pro Dossier',
        ],
      },
      {
        title: 'Die Treuhand',
        items: [
          'Beliebig viele Mitarbeitende',
          'Arbeitsvorlagen und Checklisten',
          'Fristen pro Mandant',
          'Zeit und Honorare',
          'Kennzahlen und Portfolio',
          'Dokumente pro Mandant geordnet',
          'Profil im Treuhandverzeichnis',
          'Programm Cantia Partners',
        ],
      },
    ],
  },
  security: {
    eyebrow: 'Vertrauen',
    title: 'Die Daten Ihrer Mandanten bleiben unter Kontrolle',
    items: [
      {
        icon: 'map-pin',
        title: 'In der Schweiz gehostet',
        text: 'Datenbank in Zürich. In der Schweiz entwickelt und betrieben.',
      },
      {
        icon: 'user-check',
        title: 'Zugriff durch den Kunden erteilt',
        text: 'Kein Zugriff auf Daten eines Cantia-Kunden ohne seine Zustimmung. Er wählt, was Sie sehen.',
      },
      {
        icon: 'x-octagon',
        title: 'Jederzeit widerrufbar',
        text: 'Der Kunde entzieht den Zugriff, wann er will, mit sofortiger Wirkung.',
      },
      {
        icon: 'list',
        title: 'Alles protokolliert',
        text: 'Jeder Zugriff und jede Änderung wird mit Urheber und Datum gespeichert.',
      },
      {
        icon: 'lock',
        title: 'Nichts wird gelöscht',
        text: 'Änderungen und Stornos nachvollziehbar, Perioden und Jahre gesperrt.',
      },
      {
        icon: 'pen-tool',
        title: 'Unterschriften mit Nachweis',
        text: 'Name, Unterschrift, Datum, IP-Adresse und Fingerabdruck des Dokuments gespeichert.',
      },
    ],
  },
  pricing: {
    eyebrow: 'Preis',
    title: 'Kostenlos für Treuhänder',
    price: 'CHF 0',
    per: 'pro Monat, ohne Limit',
    text: 'Der Treuhandbereich ist kostenlos, mit allen Mitarbeitenden und allen Mandanten. Ihre Kunden auf Cantia zahlen ihr übliches Abonnement; die anderen zahlen nichts, um Ihnen ihre Belege zu senden.',
    items: ['Beliebig viele Mandanten und Mitarbeitende', 'Alle Funktionen inbegriffen', 'Ohne Kreditkarte, ohne Verpflichtung'],
    cta: 'Kostenlos Bereich erstellen',
  },
  steps: {
    title: 'An einem Vormittag eingerichtet',
    items: [
      {
        title: 'Bereich erstellen',
        text: 'Zwei Minuten. Laden Sie Ihre Mitarbeitenden ein, fügen Sie Logo und Farbe hinzu.',
      },
      {
        title: 'Mandanten hinzufügen',
        text: 'Ein Cantia-Kunde erhält eine Zugriffsanfrage. Für die anderen erstellen Sie das Dossier und übernehmen die Buchhaltung.',
      },
      {
        title: 'Arbeiten',
        text: 'Erfassung, MWST, Abschluss, Belege, Unterschriften, Zeit: das ganze Dossier an einem Ort.',
      },
    ],
  },
  partner: {
    eyebrow: 'Cantia Partners',
    title: 'Empfehlen Sie Cantia Ihren Mandanten',
    text: 'Aktivieren Sie Cantia Partners in Ihrem Bereich: Wird ein eingeladener Mandant zahlender Kunde, erhalten Sie eine Provision. Dasselbe Konto, ohne Formalitäten.',
    cta: 'Cantia Partners entdecken',
  },
  faq: {
    title: 'Häufige Fragen',
    items: [
      {
        q: 'Was kostet es?',
        a: 'Nichts. Der Treuhandbereich ist kostenlos, ohne Limit bei Mandanten und Mitarbeitenden. Ihre Kunden auf Cantia zahlen ihr übliches Abonnement.',
      },
      {
        q: 'Müssen meine Kunden Cantia nutzen?',
        a: 'Nein. Ein Kunde auf Cantia öffnet Ihnen seine Daten, die von selbst kommen. Für die anderen führen Sie die Buchhaltung in Cantia (Erfassung oder Import aus Banana, Abacus, Winbiz, Excel), und sie senden Ihre Belege über einen privaten Link, ohne Konto.',
      },
      {
        q: 'Kann ich die Buchhaltung eines neuen Mandanten übernehmen?',
        a: 'Ja. Importieren Sie Buchungen, Kontenplan und Eröffnungssaldi aus Banana, Abacus, Winbiz oder einer Excel-Datei. Eine Vorschau zeigt jede Zeile vor dem Import und meldet unausgeglichene Buchungen.',
      },
      {
        q: 'Geht die MWST-Abrechnung direkt an die ESTV?',
        a: 'Cantia füllt das Formular Ziffer für Ziffer und erstellt die eCH-0217-Datei v2.0.0, die Sie in «MWST abrechnen pro» im ESTV-Portal hochladen (effektive Methode; bei Saldosteuersätzen übertragen Sie die Ziffern). Die Einreichung in Cantia verbucht die Abrechnungsbuchung, hakt die Frist ab und kann die Periode sperren.',
      },
      {
        q: 'Welche MWST-Methoden werden unterstützt?',
        a: 'Die effektive Methode mit den Sätzen 8,1 %, 2,6 % und 3,8 % (sowie 7,7 %, 2,5 %, 3,7 % für Perioden vor 2024), vierteljährlich. Die Saldosteuersatzmethode, halbjährlich, mit den zwei Sätzen, die die ESTV dem Mandanten bewilligt hat.',
      },
      {
        q: 'Kann ich Daten eines Cantia-Kunden ändern?',
        a: 'Nein, der Zugriff ist schreibgeschützt. Sie schlagen Buchungen vor, er nimmt sie an. Für Mandanten ausserhalb von Cantia führen Sie die Bücher mit vollständigem Verlauf: Nichts wird gelöscht und Perioden werden gesperrt.',
      },
      {
        q: 'Ist die Unterschrift gültig?',
        a: 'Es ist eine einfache elektronische Unterschrift: Name, am Bildschirm gezeichnete Unterschrift, Datum, IP-Adresse und Fingerabdruck des Dokuments werden gespeichert. Sie eignet sich zur Genehmigung einer Jahresrechnung oder eines Mandatsvertrags, nicht wo das Gesetz eine qualifizierte Unterschrift verlangt.',
      },
      {
        q: 'Wo werden die Daten gehostet?',
        a: 'In der Schweiz: Die Datenbank liegt in Zürich. Jeder Zugriff und jede Änderung wird protokolliert.',
      },
      {
        q: 'Und wenn ein Kunde Banana, Abacus oder Winbiz behält?',
        a: 'Sie exportieren seine Buchungen und Saldi im Format seiner Software. Für Kunden auf Cantia bleibt die Synchronisation mit Bexio verfügbar.',
      },
      {
        q: 'Ich habe schon ein Cantia-Konto.',
        a: 'Melden Sie sich mit denselben Zugangsdaten an: Der Treuhandbereich wird Ihrem Konto hinzugefügt.',
      },
    ],
  },
  final: {
    title: 'Ihre Treuhand, alle Mandanten, ein Bereich.',
    text: 'Kostenlos für Treuhänder. In zwei Minuten bereit.',
    cta: 'Kostenlos Bereich erstellen',
    secondary: 'Anmelden',
  },
};

const it: Copy = {
  meta: {
    title: 'Cantia Accounting · Il software dei fiduciari svizzeri',
    description:
      'Software gratuito per fiduciari in Svizzera: contabilità di tutti i mandanti (registrazione con IVA, importazione da Banana, Abacus, Winbiz), rendiconto IVA dell’AFC con file eCH-0217, chiusura, conti annuali con l’anno precedente, documenti e firme con link privato, lavori, scadenze, tempo e onorari. Ospitato in Svizzera.',
  },
  hero: {
    eyebrow: 'Software per fiduciari · Svizzera',
    title: 'Tutta la contabilità dei suoi mandanti. Un solo studio.',
    text: 'Registrazioni, IVA dell’AFC, chiusura, documenti, firme, scadenze e onorari: tutto il lavoro della sua fiduciaria, per ogni mandante, che usi Cantia o un altro software.',
    cta: 'Crea il mio spazio gratis',
    secondary: 'Vedere le funzioni',
    points: ['Gratuito, mandanti illimitati', 'Ospitato in Svizzera', 'Italiano, francese, tedesco'],
  },
  formats: {
    label: 'Lavora con i suoi formati',
    items: ['Banana', 'Abacus', 'Winbiz', 'Excel / CSV', 'eCH-0217 · Portale AFC', 'Piano contabile PMI svizzero', 'Bexio (clienti Cantia)'],
  },
  shell: {
    firm: 'Rossier & Associati',
    user: 'Claire Rossier',
    nav: ['Panoramica', 'Mandanti', 'Lavori', 'Richieste', 'Scadenze', 'Firme', 'Tempo', 'Documenti', 'Team'],
    example: 'Esempio',
    client: 'Falegnameria Bonvin Sagl',
    clientMeta: '6500 Bellinzona · IDI CHE-109.482.731 · IVA effettiva, trimestrale',
    tabs: ['Panoramica', 'Contabilità', 'Lavori', 'Richieste', 'Scadenze', 'Firme', 'Tempo'],
  },
  overview: {
    hello: 'Buongiorno Claire',
    date: 'Lunedì 13 ottobre 2026',
    kpis: [
      ['Mandanti attivi', '38'],
      ['Risposte da verificare', '5'],
      ['Scadenze a 30 giorni', '14'],
      ['Richieste aperte', '9'],
    ],
    todoTitle: 'Da trattare',
    todo: [
      ['Falegnameria Bonvin', 'ha risposto: estratti bancari T3', 'answered'],
      ['Garage del Rodano', 'IVA T3: scadenza tra 47 g', 'soon'],
      ['Atelier Crettaz', 'non ha ancora inviato: inventario al 31.12', 'late'],
      ['Studio Lumen', 'ha firmato i conti annuali 2025', 'done'],
    ],
    deadlinesTitle: 'Prossime scadenze',
    deadlines: [
      ['31.10', 'Acconto AVS · T4', 'Panetteria Favre'],
      ['29.11', 'Rendiconto IVA · T3', '12 mandanti'],
      ['31.12', 'Chiusura 2026', '38 mandanti'],
    ],
  },
  realFiles: {
    eyebrow: 'I vostri software, i vostri formati',
    title: 'Con che cosa funziona, e che cosa esce davvero',
    text: 'Riprenda la contabilità di un mandante dal suo vecchio software, gli restituisca le registrazioni nel suo formato, depositi l’IVA sul portale dell’AFC. I file qui accanto non sono immagini: questa pagina li calcola in questo momento con il codice di esportazione di Cantia.',
    software: [
      { id: 'banana', name: 'Banana', what: 'Importazione ed esportazione di registrazioni, piano dei conti e saldi', file: 'Testo separato da tabulazioni (.txt)' },
      { id: 'abacus', name: 'Abacus', what: 'Importazione ed esportazione di registrazioni e saldi', file: 'CSV con punto e virgola, date svizzere' },
      { id: 'winbiz', name: 'Winbiz', what: 'Importazione ed esportazione di registrazioni e saldi', file: 'CSV con punto e virgola, date svizzere' },
      { id: 'csv', name: 'Excel / CSV', what: 'Qualsiasi giornale a colonne: dare, avere, importo', file: '.xlsx, .csv, .txt' },
      { id: 'afc', name: 'Portale AFC', what: 'Rendiconto IVA pro, metodo effettivo', file: 'XML eCH-0217 v2.0.0' },
      { id: 'bexio', name: 'Bexio', what: 'Sincronizzazione per i mandanti che usano Cantia', file: 'Collegamento diretto' },
    ],
    vatRule: 'Come in questi programmi, una fattura con IVA sta su una riga: importo IVA inclusa e codice IVA (V81, M81, I81…). All’importazione Cantia registra l’IVA su 2200, 1170 o 1171.',
    tabs: { banana: 'Banana', abacus: 'Abacus', winbiz: 'Winbiz', xml: 'IVA · eCH-0217', form: 'IVA · modulo' },
    note: 'Mandante d’esempio: Menuiserie Bonvin Sàrl, 12 registrazioni, esercizio 2025 chiuso, 3° trimestre 2026 depositato. Queste registrazioni sono state passate sulla vera banca dati di Cantia durante un test.',
    windowTitle: 'Esportare le registrazioni',
    xmlTitle: 'Contenuto del file',
    xmlExcerpt: 'Estratto del file',
    xmlKeys: { uid: 'N. IDI', period: 'Periodo', kind: 'Tipo', kindValue: 'Rendiconto iniziale', turnover: 'Cifra d’affari (200)', due: 'IVA dovuta', input: 'Imposta precedente', payable: 'Importo da pagare (500)' },
    formCols: { figure: 'Cifra', label: 'Descrizione', amount: 'CHF' },
    more: '+ altre {n} righe nel file',
    download: 'Scaricare il file',
    lines: '{n} righe',
  },
  chaptersIntro: {
    eyebrow: 'Funzioni',
    title: 'Il lavoro di una fiduciaria, dal giustificativo ai conti annuali',
    text: 'Sei spazi che seguono il suo anno: registra, controlla, dichiara, chiude, il cliente firma e lo studio mantiene la visione d’insieme.',
  },
  chapters: [
    {
      key: 'entry',
      eyebrow: 'Registrazione e importazione',
      title: 'Una registrazione al secondo, l’IVA separata da sola',
      text: 'Dare, avere, importo lordo: Cantia separa l’IVA all’aliquota giusta e prepara il giustificativo successivo. Per un nuovo mandante riprende tutta la contabilità dal suo vecchio software.',
      bullets: [
        'Piano contabile PMI svizzero in italiano, francese o tedesco, o quello del cliente importato',
        'Aliquote 8,1 %, 2,6 % e 3,8 %, conti proposti durante la digitazione',
        'Importazione di registrazioni, piano contabile e saldi da Banana, Abacus, Winbiz o Excel',
        'Anteprima prima dell’importazione: una registrazione non bilanciata è segnalata alla riga',
      ],
    },
    {
      key: 'reports',
      eyebrow: 'Giornale e rendiconti',
      title: 'Giornale, libro mastro, bilancio di verifica, bilancio e conto economico con l’anno precedente',
      text: 'Ogni rendiconto si calcola dalle registrazioni, alla data scelta. I conti annuali escono con la colonna dell’anno precedente, pronti da stampare.',
      bullets: [
        'Ricerca per testo, numero di giustificativo, conto o importo',
        'Modifiche e storni tracciati: nulla viene mai cancellato',
        'Periodi bloccati dopo il deposito dell’IVA o la chiusura',
        'Indicatori: EBITDA, EBIT, liquidità, quick ratio, capitale proprio',
      ],
    },
    {
      key: 'vat',
      eyebrow: 'IVA dell’AFC',
      title: 'Il rendiconto IVA compilato cifra per cifra, e il file per il portale dell’AFC',
      text: 'Cantia compila il modulo dell’AFC dai codici IVA delle registrazioni, lo controlla con i conti 2200, 1170 e 1171 e produce il file eCH-0217 da caricare.',
      bullets: [
        'Metodo effettivo o aliquote saldo (le sue aliquote AFC), trimestrale o semestrale',
        'Cifre da 200 a 500, con le cifre manuali da completare',
        'File eCH-0217 v2.0.0 (metodo effettivo) e modulo in CSV',
        'Al deposito: registrazione di rendiconto, scadenza spuntata, periodo bloccato',
      ],
    },
    {
      key: 'closing',
      eyebrow: 'Chiusura annuale',
      title: 'I controlli, poi l’esercizio chiuso con un clic',
      text: 'Prima della chiusura Cantia verifica cosa manca. Il risultato va al 2979, si riporta al 2970 il primo giorno dell’esercizio successivo e l’esercizio si blocca.',
      bullets: [
        'Bozze, rendiconti IVA dell’esercizio, conti IVA saldati, conto 9100 ed esercizio precedente',
        'Registrazione del risultato e del riporto automatiche',
        'Conti annuali in PDF con l’esercizio precedente',
        'Un esercizio si riapre se serve: nulla viene cancellato',
      ],
    },
    {
      key: 'portal',
      eyebrow: 'Link privato del cliente',
      title: 'Il cliente invia i documenti e firma dal telefono',
      text: 'Ogni mandante riceve un link privato con i suoi colori. Risponde alle sue richieste con i file e firma i conti, senza creare un account né installare un’app.',
      bullets: [
        'Richieste di documenti con scadenza, promemoria con un clic',
        'Caricamento di estratti, fatture e giustificativi in PDF o foto',
        'Firma elettronica semplice con prova: nome, data, indirizzo IP, impronta del documento',
        'Clienti su Cantia: lei propone una registrazione, loro la accettano con un clic',
      ],
    },
    {
      key: 'firm',
      eyebrow: 'Gestione dello studio',
      title: 'Chi fa cosa, per quale mandante, e cosa resta da fatturare',
      text: 'I suoi modelli di lavoro si applicano a ogni dossier e si ripartiscono nel team. Le scadenze si calcolano per ogni mandante, il tempo si registra alla tariffa del cliente.',
      bullets: [
        'Modelli con tappe: chiusura, IVA, salari, dichiarazione d’imposta',
        'Scadenze di ogni dossier: IVA, AVS, certificati di salario, imposte, chiusura',
        'Tempo per collaboratore e per mandante, onorari da fatturare',
        'Portafoglio: cifre chiave di tutti i mandanti su una pagina',
      ],
    },
  ],
  mocks: {
    entry: {
      title: 'Nuova registrazione',
      fields: [
        ['Data', '05.07.2026'],
        ['Giustificativo', 'F212'],
        ['Testo', 'Fattura 212 · Cucina Dupuis'],
      ],
      debit: ['Dare', '1100 Debitori'],
      credit: ['Avere', '3400 Ricavi da prestazioni'],
      amount: ['Importo lordo', '12’972.00'],
      vat: ['Codice IVA', 'Aliquota normale 8,1 %'],
      splitTitle: 'Registrazione contabilizzata',
      split: [
        ['1100', 'Debitori', '12’972.00', ''],
        ['3400', 'Ricavi da prestazioni', '', '12’000.00'],
        ['2200', 'IVA dovuta', '', '972.00'],
      ],
      save: 'Salva · giustificativo successivo',
      importLine: 'Ripreso da Banana: 1’284 registrazioni, piano contabile e saldi · 0 errori',
    },
    reports: {
      views: ['Giornale', 'Mastro', 'Verifica', 'Bilancio', 'Conto economico'],
      title: 'Conto economico',
      cols: ['', '2026', '2025'],
      rows: [
        ['Ricavi d’esercizio', '1’284’500', '1’176’200', ''],
        ['Costi del materiale', '−412’300', '−398’100', ''],
        ['Costi del personale', '−538’900', '−502’400', ''],
        ['Altri costi d’esercizio', '−164’200', '−151’900', ''],
        ['EBITDA', '169’100', '123’800', 'sub'],
        ['Ammortamenti', '−38’000', '−35’500', ''],
        ['Risultato d’esercizio (EBIT)', '131’100', '88’300', 'total'],
      ],
      kpis: [
        ['Margine EBITDA', '13,2 %'],
        ['Quick ratio', '1,48'],
        ['Capitale proprio', '41 %'],
      ],
    },
    vat: {
      title: 'Rendiconto IVA · 3° trimestre 2026',
      quarters: [
        ['T1', 'Depositato', 'done'],
        ['T2', 'Depositato', 'done'],
        ['T3', 'Da depositare', 'todo'],
        ['T4', 'In corso', 'idle'],
      ],
      cols: ['Cifra', 'Designazione', 'CHF'],
      rows: [
        ['200', 'Totale delle controprestazioni', '12’000.00'],
        ['299', 'Cifra d’affari imponibile', '12’000.00'],
        ['303', 'Aliquota normale 8,1 %', '972.00'],
        ['400', 'Imposta precedente su materiale e prestazioni', '243.00'],
        ['405', 'Imposta precedente su investimenti', '162.00'],
      ],
      total: ['500', 'Importo da pagare all’AFC', '567.00'],
      due: 'Termine 29.11.2026',
      checks: ['IVA dovuta contabilizzata (2200) concordante', 'Imposta precedente (1170 / 1171) concordante'],
      xml: 'File eCH-0217',
      file: 'Depositare il rendiconto',
    },
    closing: {
      title: 'Esercizio 2026',
      status: 'Da chiudere',
      entries: '1’312 registrazioni',
      checksTitle: 'Controlli prima della chiusura',
      checks: [
        'Nessuna bozza nell’esercizio',
        'Rendiconti IVA dell’esercizio depositati: 4 / 4',
        'Conti IVA saldati al 31.12.2026 (2200, 1170, 1171)',
        'Conto 9100 (bilancio d’apertura) saldato',
        'Esercizio precedente chiuso',
      ],
      result: ['Risultato dell’esercizio', 'CHF 96’840.00'],
      moves: [
        ['31.12.2026', 'Risultato → 2979'],
        ['01.01.2027', 'Riporto → 2970'],
      ],
      close: 'Chiudere l’esercizio 2026',
      pdf: 'Conti annuali con anno precedente (PDF)',
    },
    portal: {
      firm: 'Rossier & Associati',
      hello: 'Buongiorno Falegnameria Bonvin',
      requestsTitle: 'Richiesto dalla sua fiduciaria',
      requests: [
        ['Estratti bancari da luglio a settembre', 'Entro il 15.10', 'open'],
        ['Contratto di leasing del veicolo', 'Inviato il 02.10', 'sent'],
      ],
      upload: 'Caricare file',
      signTitle: 'Da firmare',
      signDoc: 'Conti annuali 2025',
      signHint: 'Firmi qui',
      sign: 'Firmare il documento',
      proof: 'Nome, data, indirizzo IP e impronta del documento conservati',
    },
    firm: {
      workTitle: 'Lavori · Chiusura 2025',
      cols: ['Mandante', 'Responsabile', 'Avanzamento'],
      work: [
        ['Falegnameria Bonvin', 'CR', 9, 9],
        ['Garage del Rodano', 'ML', 6, 9],
        ['Atelier Crettaz', 'CR', 3, 9],
        ['Studio Lumen', 'JP', 8, 9],
      ],
      timeTitle: 'Tempo · ottobre',
      time: [
        ['Registrato', '46 h 30'],
        ['Onorari', 'CHF 7’440.00'],
        ['Da fatturare', 'CHF 5’120.00'],
      ],
      deadlinesTitle: 'Scadenze',
      deadlines: [
        ['29.11', 'IVA T3', 'Garage del Rodano', 'soon'],
        ['31.01', 'Certificati di salario', 'Atelier Crettaz', 'idle'],
        ['30.05', 'IVA T1 · depositato', 'Studio Lumen', 'done'],
      ],
    },
  },
  kinds: {
    eyebrow: 'Tutti i suoi mandanti',
    title: 'Su Cantia o con un altro software, lo stesso dossier',
    cantia: {
      label: 'Mandante su Cantia',
      title: 'I suoi dati arrivano da soli',
      items: [
        'Fatture, pagamenti, registrazioni e giustificativi aggiornati, senza invii per e-mail',
        'Sceglie cosa vede lei e revoca l’accesso quando vuole',
        'Lei propone una registrazione, lui la accetta con un clic',
        'Indicatori calcolati sulla sua contabilità',
      ],
    },
    external: {
      label: 'Mandante con un altro software',
      title: 'Lei tiene i suoi libri in Cantia',
      items: [
        'Ripresa di registrazioni e saldi da Banana, Abacus, Winbiz o Excel',
        'Un link privato per depositare documenti e firmare, senza account',
        'Rendiconto IVA, chiusura e conti annuali pronti da firmare',
        'Esportazione nel suo software se tiene il suo strumento',
      ],
    },
  },
  calendar: {
    eyebrow: 'Scadenze',
    title: 'L’anno di ogni mandante, calcolato in anticipo',
    text: 'Secondo il metodo IVA, la periodicità e i dipendenti, Cantia fissa le scadenze di ogni dossier. Vede cosa arriva, per chi, e cosa è già fatto.',
    months: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
    events: [
      [0, 'Salari AVS e certificati di salario'],
      [2, 'IVA T4 dell’anno precedente'],
      [4, 'IVA T1'],
      [7, 'IVA T2'],
      [10, 'IVA T3'],
      [11, 'Chiusura dell’esercizio'],
    ],
    note: 'Esempio: mandante con metodo effettivo, rendiconto trimestrale. Termine di deposito dell’AFC: 60 giorni dopo la fine del periodo.',
  },
  included: {
    eyebrow: 'Incluso',
    title: 'Tutto ciò che contiene il suo spazio',
    groups: [
      {
        title: 'Contabilità',
        items: [
          'Piano contabile PMI IT / FR / DE',
          'Registrazione con separazione dell’IVA',
          'Registrazioni multiple e storni',
          'Giornale, mastro, bilancio di verifica',
          'Bilancio e conto economico con anno precedente',
          'Saldi d’apertura',
          'Blocco dei periodi',
          'Importazione Banana, Abacus, Winbiz, Excel',
          'Esportazione Banana, Abacus, Winbiz, CSV',
        ],
      },
      {
        title: 'IVA e chiusura',
        items: [
          'Modulo AFC cifra per cifra',
          'Metodo effettivo e aliquote saldo',
          'Controllo con 2200, 1170, 1171',
          'File eCH-0217 per il portale AFC',
          'Registrazione di rendiconto automatica',
          'Controlli prima della chiusura',
          'Risultato al 2979, riporto al 2970',
          'Conti annuali in PDF',
          'Riapertura di un esercizio',
        ],
      },
      {
        title: 'Con i suoi mandanti',
        items: [
          'Link privato con i suoi colori',
          'Richieste di documenti con scadenza',
          'Caricamento senza account',
          'Firma elettronica semplice',
          'Accesso ai dati dei clienti Cantia',
          'Registrazioni proposte al cliente',
          'Accesso revocabile dal cliente',
          'Note interne per dossier',
        ],
      },
      {
        title: 'Lo studio',
        items: [
          'Collaboratori illimitati',
          'Modelli di lavoro e checklist',
          'Scadenze per mandante',
          'Tempo e onorari',
          'Indicatori e portafoglio',
          'Documenti ordinati per mandante',
          'Profilo nell’elenco delle fiduciarie',
          'Programma Cantia Partners',
        ],
      },
    ],
  },
  security: {
    eyebrow: 'Fiducia',
    title: 'I dati dei suoi mandanti restano sotto controllo',
    items: [
      {
        icon: 'map-pin',
        title: 'Ospitato in Svizzera',
        text: 'Banca dati a Zurigo. Sviluppato e gestito in Svizzera.',
      },
      {
        icon: 'user-check',
        title: 'Accesso dato dal cliente',
        text: 'Nessun accesso ai dati di un cliente Cantia senza il suo consenso. Sceglie lui cosa vede lei.',
      },
      {
        icon: 'x-octagon',
        title: 'Revocabile in ogni momento',
        text: 'Il cliente ritira l’accesso quando vuole, con effetto immediato.',
      },
      {
        icon: 'list',
        title: 'Tutto è registrato',
        text: 'Ogni accesso e ogni modifica è salvato con autore e data.',
      },
      {
        icon: 'lock',
        title: 'Nulla si cancella',
        text: 'Modifiche e storni tracciati, periodi ed esercizi bloccati.',
      },
      {
        icon: 'pen-tool',
        title: 'Firme con prova',
        text: 'Nome, firma, data, indirizzo IP e impronta del documento conservati.',
      },
    ],
  },
  pricing: {
    eyebrow: 'Prezzo',
    title: 'Gratuito per i fiduciari',
    price: 'CHF 0',
    per: 'al mese, senza limiti',
    text: 'Lo spazio fiduciario è gratuito, con tutti i collaboratori e tutti i mandanti. I suoi clienti su Cantia pagano il loro abbonamento abituale; gli altri non pagano nulla per inviarle i documenti.',
    items: ['Mandanti e collaboratori illimitati', 'Tutte le funzioni incluse', 'Senza carta di credito, senza impegno'],
    cta: 'Crea il mio spazio gratis',
  },
  steps: {
    title: 'Pronto in una mattinata',
    items: [
      {
        title: 'Crei il suo spazio',
        text: 'Due minuti. Inviti i collaboratori, aggiunga logo e colore.',
      },
      {
        title: 'Aggiunga i mandanti',
        text: 'Un cliente su Cantia riceve una richiesta d’accesso. Per gli altri crea la scheda e riprende la contabilità.',
      },
      {
        title: 'Lavori',
        text: 'Registrazioni, IVA, chiusura, documenti, firme, tempo: tutto il dossier nello stesso posto.',
      },
    ],
  },
  partner: {
    eyebrow: 'Cantia Partners',
    title: 'Raccomandi Cantia ai suoi mandanti',
    text: 'Attivi Cantia Partners dal suo spazio: quando un mandante che invita diventa cliente pagante, riceve una commissione. Stesso account, senza formalità.',
    cta: 'Scoprire Cantia Partners',
  },
  faq: {
    title: 'Domande frequenti',
    items: [
      {
        q: 'Quanto costa?',
        a: 'Niente. Lo spazio fiduciario è gratuito, senza limiti di mandanti né di collaboratori. I suoi clienti su Cantia pagano il loro abbonamento abituale.',
      },
      {
        q: 'I miei clienti devono usare Cantia?',
        a: 'No. Un cliente su Cantia le apre i suoi dati, che arrivano da soli. Per gli altri tiene la contabilità in Cantia (registrazione o importazione da Banana, Abacus, Winbiz, Excel) e le inviano i documenti tramite un link privato, senza account.',
      },
      {
        q: 'Posso riprendere la contabilità di un nuovo mandante?',
        a: 'Sì. Importi registrazioni, piano contabile e saldi d’apertura da Banana, Abacus, Winbiz o da un file Excel. Un’anteprima mostra ogni riga prima dell’importazione e segnala le registrazioni non bilanciate.',
      },
      {
        q: 'Il rendiconto IVA parte direttamente all’AFC?',
        a: 'Cantia compila il modulo cifra per cifra e prepara il file eCH-0217 v2.0.0 che lei carica in «Rendiconto IVA pro» sul portale dell’AFC (metodo effettivo; con le aliquote saldo riporta le cifre). Il deposito in Cantia registra il rendiconto, spunta la scadenza e può bloccare il periodo.',
      },
      {
        q: 'Quali metodi IVA sono supportati?',
        a: 'Il metodo effettivo con le aliquote 8,1 %, 2,6 % e 3,8 % (e 7,7 %, 2,5 %, 3,7 % per i periodi prima del 2024), trimestrale. Il metodo delle aliquote saldo, semestrale, con le due aliquote che l’AFC ha concesso al mandante.',
      },
      {
        q: 'Posso modificare i dati di un cliente Cantia?',
        a: 'No, l’accesso è in sola lettura. Lei propone registrazioni, il cliente le accetta. Per un mandante fuori da Cantia tiene i libri con una cronologia completa: nulla viene cancellato e i periodi si bloccano.',
      },
      {
        q: 'La firma dei documenti è valida?',
        a: 'È una firma elettronica semplice: nome, firma tracciata sullo schermo, data, indirizzo IP e impronta del documento sono conservati. È adatta per approvare conti o un mandato, non dove la legge richiede una firma qualificata.',
      },
      {
        q: 'Dove sono ospitati i dati?',
        a: 'In Svizzera: la banca dati è a Zurigo. Ogni accesso e ogni modifica è registrato.',
      },
      {
        q: 'E se un cliente tiene Banana, Abacus o Winbiz?',
        a: 'Esporta le sue registrazioni e i saldi nel formato del suo software. Per i clienti su Cantia la sincronizzazione con Bexio resta disponibile.',
      },
      {
        q: 'Ho già un account Cantia.',
        a: 'Acceda con le stesse credenziali: lo spazio fiduciario si aggiunge al suo account.',
      },
    ],
  },
  final: {
    title: 'Il suo studio, tutti i mandanti, un solo spazio.',
    text: 'Gratuito per i fiduciari. Pronto in due minuti.',
    cta: 'Crea il mio spazio gratis',
    secondary: 'Accedi',
  },
};

const COPY: Record<AccLocale, Copy> = { fr, de, it };

export function useSiteCopy() {
  const { locale } = useAccCopy();
  return { s: COPY[locale], locale };
}
