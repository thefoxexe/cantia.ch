import type { AdminTutorialChapter } from './types';

// Distinct from AdminTutorialChapter.public_description (the short line
// shown under the title on /aide/videos while waiting for/after the video):
// this is the full copy-pasteable YouTube description, generated from the
// same talking_points script so it never drifts out of sync as chapters get
// edited — one source of truth instead of two descriptions to keep in sync
// by hand across 30+ videos.

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

export function buildYoutubeDescription(chapter: Pick<AdminTutorialChapter, 'title' | 'feature_area' | 'talking_points'>): string {
  const points = chapter.talking_points
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = points.map((p) => `• ${p}`).join('\n');
  const areaTag = hashtagForArea(chapter.feature_area);

  return `${chapter.title} — Tutoriel Cantia

Dans cette vidéo, on vous montre comment ${lowerFirst(chapter.title)} avec Cantia.

Ce que vous allez voir :
${bullets}

Cantia est le logiciel de gestion de chantier pensé pour les artisans et entreprises du bâtiment en Suisse : devis, factures, chantiers, équipe et RH au même endroit, avec de la dictée vocale partout où vous écrivez.

Essayez gratuitement pendant 14 jours, sans carte bancaire à saisir :
https://cantia.ch

#Cantia #BTP #Bâtiment #ConstructionSuisse #LogicielChantier ${areaTag}`;
}
