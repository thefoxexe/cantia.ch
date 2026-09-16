import type { AdminTutorialChapter } from './types';

// Distinct from AdminTutorialChapter.public_description (the short line
// shown under the title on /aide/videos while waiting for/after the video):
// this is the full copy-pasteable YouTube description, generated from the
// same talking_points script so it never drifts out of sync as chapters get
// edited — one source of truth instead of two descriptions to keep in sync
// by hand across 30+ videos.
//
// "Suisse"/"bâtiment suisse" appears early and repeatedly on purpose —
// YouTube's search and recommendation surfacing weighs the description
// text (especially the first ~150 characters shown before "plus"), and
// that's exactly the term Cantia wants to rank on. The bullet claims below
// are all things already true and stated elsewhere in the app (Zurich
// hosting — see confidentialite screen; Swiss QR-bill; the 14-day trial
// terms) — nothing asserted here that isn't already accurate today.

const AREA_HASHTAG: Record<string, string> = {
  'Démarrage': '#PriseEnMain',
  'Devis': '#Devis',
  'Facturation': '#Facturation',
  'Chantiers': '#GestionDeChantier',
  'Équipe & RH': '#RH',
  'Pilotage': '#Pilotage',
  'Paramètres': '#Parametres',
  'Migration': '#Migration',
};

function hashtagForArea(area: string): string {
  return AREA_HASHTAG[area] ?? `#${area.replace(/[^a-zA-Z0-9]/g, '')}`;
}

// Hand-written, not generated: a title assembled from a "{area} + Cantia +
// Suisse" formula reads as exactly that — a formula. Nobody searches
// YouTube for "Tour du tableau de bord — logiciel de gestion de chantier
// suisse | Cantia"; a prospect who'd actually find a Cantia video through
// search is looking for the specific thing it shows ("créer un devis à la
// voix"), so the title says that, plainly, the way a person would title it.
// A few early chapters (create an account, the dashboard tour) have close
// to zero organic search value — nobody looks that up, they land on it
// from inside the app or the channel — so those stay as plain as the
// internal title already is, no hook needed.
const TITLE_OVERRIDES: Record<string, string> = {
  'Créer son compte et démarrer sur Cantia': 'Créer son compte et démarrer sur Cantia',
  'Tour du tableau de bord': 'Le tableau de bord Cantia en 2 minutes',
  'Créer un devis à la voix': 'Créer un devis en 2 secondes, à la voix',
  'Trames de devis réutilisables': 'Des trames de devis pour ne plus repartir de zéro',
  'Envoyer un devis et suivre la signature': 'Envoyer un devis et suivre la signature en direct',
  'Transformer un devis accepté en facture': 'Transformer un devis accepté en facture, automatiquement',
  'Créer une facture et la QR-facture suisse': 'Créer une facture avec QR-facture suisse automatique',
  'Facturer un acompte': 'Facturer un acompte avant de démarrer un chantier',
  'Suivre les paiements et relancer un impayé': 'Suivre ses paiements et relancer un impayé en un clic',
  'Import de relevé bancaire': 'Importer un relevé bancaire et rapprocher ses factures',
  "Créer un chantier et son fil d'actualité": "Créer un chantier et son fil d'actualité",
  'Photos et documents de chantier': 'Photos et documents de chantier, géolocalisés',
  'Rapport de chantier généré par IA': 'Le rapport de chantier généré automatiquement',
  'Métré poste par poste': 'Le métré poste par poste, lié à votre devis',
  'Sous-traitants sur un chantier': 'Suivre ses sous-traitants sur un chantier',
  'Rentabilité par chantier': 'La rentabilité de chantier, en temps réel',
  'Travaux supplémentaires (TS)': 'Travaux supplémentaires : devis, signature et facturation',
  'Signature en direct sur tablette (travaux supplémentaires)': 'Signer un travail supplémentaire en direct sur tablette',
  "Planning d'équipe": "Le planning d'équipe, chantier par chantier",
  'RH : heures et salaires': 'Heures et salaires : du pointage à la fiche de paie',
  'Gérer les membres et les rôles': 'Gérer les membres de son équipe et leurs rôles',
  'Trésorerie prévisionnelle': 'La trésorerie prévisionnelle à 90 jours',
  'Clients : historique centralisé': "L'historique client centralisé, devis et factures compris",
  'Le portail client, côté client': 'Le portail client, côté client',
  "Paramètres de l'organisation": 'Les paramètres de votre entreprise sur Cantia',
  'Intégration Bexio': "L'intégration Bexio, synchronisée automatiquement",
  'Dictée vocale partout dans l\'app': 'La dictée vocale, partout dans Cantia',
  "Dépenses : suivi des sorties d'argent": 'Suivre ses dépenses, chantier par chantier',
  'Comptabilité : bilan et compte de résultat': 'Bilan et compte de résultat, générés automatiquement',
  'Situations de chantier (facturation progressive)': 'Facturer un chantier par étapes, avec les situations',
  'Décompte TVA': 'Le décompte TVA suisse, prêt en quelques clics',
  'Importer ses données depuis un ancien logiciel': 'Importer ses données depuis un ancien logiciel',
  "Tâches : la liste à faire de l'équipe": "La liste de tâches, pour toute l'équipe",
  'Répertoire des sous-traitants': 'Le répertoire de ses sous-traitants',
};

// The copy-pasteable YouTube title — distinct from AdminTutorialChapter.title,
// which stays the short internal/shooting-plan name. A chapter added later
// without an entry here falls back to its own title verbatim, never to a
// generated formula — plain and a little under-optimized beats another
// robotic one.
export function buildYoutubeTitle(chapter: Pick<AdminTutorialChapter, 'title' | 'feature_area'>): string {
  return TITLE_OVERRIDES[chapter.title] ?? chapter.title;
}

function lowerFirst(s: string): string {
  return s.length ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

// talking_points is written as a filming script — imperative director
// notes ("Montrer X.", "Rappeler que Y.", "Bon moment pour Z.") meant for
// whoever's behind the camera. A viewer-facing YouTube description reading
// "Montrer l'envoi du devis..." sounds like a leaked shot list, not a
// description — so each line gets its directing verb stripped and its
// first letter re-capitalized, turning it into a plain descriptive bullet
// ("L'envoi du devis...") instead of an instruction.
const SCRIPT_PREFIXES: RegExp[] = [
  /^Montrer que /i,
  /^Montrer comment /i,
  /^Montrer /i,
  /^Insister sur le fait que /i,
  /^Insister sur /i,
  /^Insister\s*:\s*/i,
  /^Rappeler que /i,
  /^Rappeler qui /i,
  /^Rappeler /i,
  /^Bien préciser\s*:\s*/i,
  /^Préciser que /i,
  /^Préciser /i,
  /^Bon moment pour /i,
  /^Bon exemple pour /i,
  /^Bon chapitre de clôture\s*:\s*/i,
  /^Comparer /i,
  /^Se mettre à la place du client\s*:\s*/i,
  /^Sur (un|une) [^,]+, montrer /i,
];

function humanizeTalkingPoint(line: string): string {
  let s = line;
  // Two passes: a few lines stack a framing clause in front of a second
  // director verb ("Se mettre à la place du client : montrer ...") — one
  // pass only strips the outer one and leaves "montrer" behind.
  for (let pass = 0; pass < 2; pass++) {
    for (const prefix of SCRIPT_PREFIXES) {
      if (prefix.test(s)) {
        s = s.replace(prefix, '');
        break;
      }
    }
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildYoutubeDescription(chapter: Pick<AdminTutorialChapter, 'title' | 'feature_area' | 'talking_points'>): string {
  const points = chapter.talking_points
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map(humanizeTalkingPoint);

  const bullets = points.map((p) => `• ${p}`).join('\n');
  const areaTag = hashtagForArea(chapter.feature_area);
  const youtubeTitle = buildYoutubeTitle(chapter);

  return `${youtubeTitle} — Tutoriel Cantia 🇨🇭, le logiciel de gestion de chantier suisse

Cantia est le logiciel de gestion de chantier pensé et développé pour les artisans et entreprises du bâtiment en Suisse. Dans cette vidéo, on vous montre comment ${lowerFirst(chapter.title)}.

Ce que vous allez voir :
${bullets}

Pourquoi Cantia :
• Devis et factures avec QR-facture suisse générée automatiquement
• Chantiers, équipe et RH au même endroit, avec dictée vocale partout où vous écrivez
• Données hébergées 100% en Suisse (Zurich)
• Essai gratuit de 14 jours, résiliable à tout moment, sans engagement

Essayez Cantia gratuitement pendant 14 jours (carte bancaire requise à l'inscription, débitée seulement après l'essai, résiliable à tout moment sans frais) :
https://cantia.ch

#Cantia #Suisse #BâtimentSuisse #ArtisanSuisse #ConstructionSuisse ${areaTag}`;
}
