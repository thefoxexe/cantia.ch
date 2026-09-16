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

  return `${chapter.title} — Tutoriel Cantia 🇨🇭, le logiciel de gestion de chantier suisse

Cantia est le logiciel de gestion de chantier pensé et développé pour les artisans et entreprises du bâtiment en Suisse. Dans cette vidéo, on vous montre comment ${lowerFirst(chapter.title)}.

Ce que vous allez voir :
${bullets}

Pourquoi Cantia :
• Devis et factures avec QR-facture suisse générée automatiquement
• Chantiers, équipe et RH au même endroit, avec dictée vocale partout où vous écrivez
• Données hébergées 100% en Suisse (Zurich)
• Essai gratuit de 14 jours, résiliable à tout moment, sans engagement

Essayez Cantia gratuitement pendant 14 jours, sans carte bancaire à saisir :
https://cantia.ch

#Cantia #Suisse #BâtimentSuisse #ArtisanSuisse #ConstructionSuisse ${areaTag}`;
}
