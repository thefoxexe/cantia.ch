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
  'E-mails': '#Emails',
  'Chantiers': '#GestionDeChantier',
  'Équipe & RH': '#RH',
  'Clients': '#Clients',
  'Gestion': '#Comptabilite',
  'Outils': '#Outils',
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
  // Démarrage
  'Créer son compte et démarrer sur Cantia': 'Créer son compte Cantia et démarrer en 5 minutes',
  'Installer Cantia sur son téléphone': 'Installer Cantia sur son téléphone, iPhone ou Android',
  'Importer ses données depuis un ancien logiciel': 'Reprendre ses clients et ses devis depuis Excel ou un ancien logiciel',
  'Préparer ses devis et factures : logo, signature, numérotation': 'Des devis et factures à votre image : logo, signature, numérotation',
  // Devis
  'Créer un devis à la voix': 'Créer un devis à la voix, sur le chantier',
  'Le catalogue : réutiliser ses prix': 'Le catalogue : vos prix proposés tout seuls dans chaque devis',
  'Trames de devis réutilisables': 'Des trames de devis pour ne plus repartir de zéro',
  'Envoyer un devis et suivre la signature': 'Envoyer un devis et le faire signer en ligne',
  'Relances automatiques des devis': 'Relancer automatiquement un devis resté sans réponse',
  'Transformer un devis accepté en facture': 'Transformer un devis accepté en facture, sans rien ressaisir',
  'Remplir une soumission reçue (bêta)': 'Remplir une soumission reçue et renvoyer le PDF chiffré',
  // Facturation
  'Créer une facture et la QR-facture suisse': 'Créer une facture avec QR-facture suisse',
  'Facturer un acompte': 'Facturer un acompte avant de démarrer un chantier',
  'Situations de chantier (facturation progressive)': 'Facturer un chantier par étapes, avec les situations',
  'Suivre les paiements et relancer un impayé': 'Suivre ses paiements et relancer un impayé',
  'Import de relevé bancaire': 'Importer un relevé bancaire et pointer les factures payées',
  // E-mails
  'La boîte E-mails : réponses des clients et envois suivis': 'Tous vos e-mails clients au même endroit : envois suivis et réponses',
  // Chantiers
  "Créer un chantier et son fil d'actualité": "Créer un chantier et suivre son fil d'actualité",
  'Photos, plans et documents de chantier': 'Photos, plans et documents de chantier, rangés au même endroit',
  'Rapport de chantier généré par IA': 'Un rapport de chantier propre à partir de notes et de photos',
  'Planning de chantier (Gantt)': 'Le planning de chantier : phases, tâches et avancement',
  'Travaux supplémentaires (TS)': 'Travaux supplémentaires : chiffrer, faire signer, facturer',
  'Signature en direct sur tablette (travaux supplémentaires)': 'Faire signer un travail supplémentaire sur place, sur tablette',
  'Sous-traitants sur un chantier': 'Suivre ses sous-traitants sur un chantier',
  'Rentabilité par chantier': 'Savoir si un chantier gagne de l’argent : devisé contre coût réel',
  // Équipe & RH
  "Planning d'équipe": "Le planning d'équipe : qui est où, chaque jour",
  "Tâches : la liste à faire de l'équipe": "La liste de tâches de toute l'équipe",
  'Gérer les membres et les rôles': 'Inviter son équipe et choisir ce que chacun voit',
  'RH : heures et salaires': 'Des heures pointées à la fiche de salaire',
  'Absences et soldes de vacances': 'Demandes de congé et soldes de vacances de l’équipe',
  'Répertoire des sous-traitants': 'Le répertoire de ses sous-traitants',
  // Clients
  'Clients : historique centralisé': 'Toute l’histoire d’un client sur une seule fiche',
  'Le portail client, côté client': 'Ce que voit votre client : devis, factures et signature en ligne',
  // Gestion
  "Dépenses : suivi des sorties d'argent": 'Suivre ses dépenses et scanner ses tickets',
  'Trésorerie prévisionnelle': 'La trésorerie prévue sur 90 jours',
  'Comptabilité : bilan et compte de résultat': 'Bilan et compte de résultat, tenus automatiquement',
  'Décompte TVA': 'Préparer son décompte TVA suisse',
  "Bouclement de fin d'année": "Le bouclement de fin d'année, étape par étape",
  'Travailler avec sa fiduciaire': 'Travailler avec sa fiduciaire sans échanger de classeurs',
  // Outils
  "L'assistant vocal et la dictée partout dans l'app": "L'assistant vocal : parler à Cantia au lieu de taper",
  'Intégration Bexio': 'Relier Cantia à Bexio',
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

// The short line shown under a video's thumbnail on /aide/videos
// (AdminTutorialChapter.public_description) — auto-filled from the same
// talking_points script the moment a chapter's YouTube link gets published
// (see app/(admin)/tutoriels/index.tsx's save()), so nobody has to write it
// by hand for each of the 30+ chapters. An admin who does type something in
// the field is always kept — this only ever fills a blank one.
export function buildPublicVideoDescription(chapter: Pick<AdminTutorialChapter, 'title' | 'talking_points'>): string {
  const firstPoint = chapter.talking_points
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map(humanizeTalkingPoint)[0];
  const intro = `Comment ${lowerFirst(chapter.title)}, en vidéo.`;
  return firstPoint ? `${intro} ${firstPoint}` : intro;
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

  return `${youtubeTitle} | Tutoriel Cantia

Cantia est le logiciel suisse de gestion des artisans, des entreprises du bâtiment et des PME de services : devis, factures, projets, équipe et comptabilité au même endroit. Dans cette vidéo : ${lowerFirst(chapter.title)}.

Dans la vidéo :
${bullets}

Cantia, c'est aussi :
• Des factures avec QR-facture suisse
• La dictée et l'assistant vocal partout où vous écrivez
• Des données hébergées en Suisse (Zurich)
• En français, en allemand et en italien

Essayez Cantia pendant 14 jours, sans engagement et résiliable en ligne (carte demandée à l'inscription, débitée seulement après l'essai) :
https://cantia.ch

Toutes les vidéos : https://cantia.ch/aide/videos

#Cantia #Suisse #ArtisanSuisse #PME ${areaTag}`;
}
