import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'indemnites-kilometriques-2026-nouveau-taux',
  question: 'Quel taux d’indemnité kilométrique appliquer à ses employés en 2026 ?',
  title: 'Indemnités kilométriques 2026 : le taux qui vient de changer',
  description:
    'Au 1er janvier 2026, l’Administration fédérale des contributions relève le taux forfaitaire de CHF 0,70 à CHF 0,75/km, et introduit une nouvelle obligation de déclaration sur le certificat de salaire.',
  excerpt:
    'CHF 0,70 par kilomètre, c’est fini. Le nouveau guide du certificat de salaire fixe CHF 0,75 depuis le 1er janvier 2026. Il ajoute aussi une case à cocher que personne ne connaît encore.',
  category: 'RH & salaires',
  keywords: ['indemnité kilométrique', 'frais professionnels', 'certificat de salaire', 'véhicule privé', 'afc'],
  publishedAt: '2026-03-30',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'CHF 0,70 par kilomètre : le chiffre que presque toutes les entreprises suisses avaient en tête pour indemniser un employé utilisant son véhicule privé. Depuis le 1er janvier 2026, ce n’est plus le bon chiffre : l’Administration fédérale des contributions l’a relevé à CHF 0,75/km dans son guide mis à jour pour l’établissement du certificat de salaire.',
    },
    { type: 'h2', text: 'Ce que ce taux couvre réellement' },
    {
      type: 'p',
      text: 'C’est un taux forfaitaire, censé couvrir l’ensemble des frais liés à l’usage professionnel d’un véhicule privé (carburant, usure, assurance, amortissement), sans que l’employé doive justifier chaque poste séparément. Une entreprise reste libre de fixer un taux différent par contrat ou convention interne, mais CHF 0,75/km sert de référence par défaut pour l’administration fiscale.',
    },
    {
      type: 'callout',
      title: 'La nouveauté qui compte plus que le montant lui-même',
      text: 'Une indemnité forfaitaire pour l’usage d’un véhicule privé doit désormais être expressément signalée sur le certificat de salaire, par une croix à la lettre F (une obligation déclarative qui n’existait pas sous cette forme auparavant). Ne pas la cocher n’efface pas l’indemnité, mais expose à une correction lors d’un contrôle fiscal.',
    },
    { type: 'h2', text: 'Ce que ça change concrètement pour une entreprise du bâtiment' },
    {
      type: 'list',
      items: [
        'Les indemnités kilométriques versées après le 1er janvier 2026 doivent utiliser le nouveau taux de référence pour rester alignées avec le guide AFC',
        'Le certificat de salaire de fin d’année doit refléter la nouvelle case cochée pour tout employé recevant ce type d’indemnité',
        'Un taux différent, fixé contractuellement, reste possible. Un écart significatif avec le taux de référence peut toutefois attirer l’attention lors d’un contrôle',
      ],
    },
    {
      type: 'p',
      text: 'Pour une équipe qui se déplace beaucoup de chantier en chantier, la différence entre CHF 0,70 et CHF 0,75 par kilomètre n’est pas cosmétique sur l’année : pour 15’000 km parcourus, ça représente CHF 750 de plus à verser, ou à défaut de mise à jour, CHF 750 en dessous du barème de référence.',
    },
    {
      type: 'cta',
      title: 'Le taux kilométrique, configurable par organisation',
      text: 'Cantia permet de définir un taux d’indemnité kilométrique propre à votre entreprise, appliqué automatiquement aux notes de frais de l’équipe.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Quel est le nouveau taux d’indemnité kilométrique en Suisse en 2026 ?',
      answer:
        'CHF 0,75 par kilomètre depuis le 1er janvier 2026, contre CHF 0,70 auparavant, selon le guide mis à jour de l’Administration fédérale des contributions pour l’établissement du certificat de salaire.',
    },
    {
      question: 'Une entreprise doit-elle obligatoirement appliquer ce taux ?',
      answer:
        'Non, elle reste libre de fixer un taux différent par contrat ou convention interne : CHF 0,75/km sert de référence par défaut pour l’administration fiscale, pas de plancher légal obligatoire.',
    },
    {
      question: 'Qu’est-ce qui doit désormais figurer sur le certificat de salaire ?',
      answer:
        'Une croix à la lettre F, signalant explicitement qu’une indemnité forfaitaire pour l’usage d’un véhicule privé à des fins professionnelles a été versée à l’employé durant l’année.',
    },
  ],
  relatedSlugs: [
    'heures-supplementaires-batiment-majoration-25',
    'salaire-minimum-cct-construction-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
  ],
};
