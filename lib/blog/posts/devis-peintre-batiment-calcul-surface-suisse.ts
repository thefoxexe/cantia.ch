import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-peintre-batiment-calcul-surface-suisse',
  question: 'Comment calculer correctement les surfaces et le prix d’un devis de peinture en bâtiment ?',
  title: 'Devis de peinture en bâtiment : bien calculer la surface pour ne pas sous-chiffrer',
  description:
    'Une surface mal calculée (déductions oubliées, nombre de couches sous-estimé, préparation du support négligée) est la première cause de perte de marge chez les peintres en bâtiment.',
  excerpt:
    'Le prix au m² est simple à annoncer, mais tout se joue dans le calcul de la surface réelle. C’est précisément là que la plupart des devis de peinture perdent de la marge sans que personne ne s’en aperçoive.',
  category: 'Métiers du bâtiment',
  keywords: ['devis peintre bâtiment', 'calcul surface peinture', 'prix peinture au m2 Suisse', 'facturation peintre indépendant', 'préparation support peinture devis'],
  publishedAt: '2026-09-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un prix au m² annoncé au client cache une hypothèse implicite : une couche standard, sur un support déjà prêt, sans déduction particulière. En pratique, presque aucun chantier ne correspond exactement à cette hypothèse, ce qui explique l’écart fréquent entre le devis signé et le temps réellement passé.',
    },
    { type: 'h2', text: 'Trois erreurs de calcul qui rongent la marge' },
    {
      type: 'list',
      items: [
        'Ne pas déduire les ouvertures (portes, fenêtres) alors qu’elles réduisent la surface réelle à peindre, tout en rallongeant le temps de finition aux bords',
        'Compter une seule couche alors que le changement de teinte ou un support poreux en exige souvent deux',
        'Oublier le temps de préparation du support (rebouchage, ponçage, protection du mobilier) qui peut représenter autant de temps que l’application elle-même',
      ],
    },
    {
      type: 'stat',
      value: '30-40 %',
      label: 'part du temps total d’un chantier de peinture consacrée à la préparation du support plutôt qu’à l’application de peinture',
    },
    { type: 'h2', text: 'Un prix au m², mais jamais un prix unique pour tout' },
    {
      type: 'p',
      text: 'Un mur lisse fraîchement plâtré et un plafond ancien avec fissures n’ont rien à voir en temps de préparation, même s’ils font la même surface. Structurer le devis avec plusieurs tarifs au m² selon l’état du support (neuf, bon état, à réparer) protège la marge sans complexifier inutilement le devis pour le client.',
    },
    {
      type: 'callout',
      title: 'La protection du chantier n’est pas gratuite',
      text: 'Bâcher les sols, protéger le mobilier, poser du ruban de masquage : ce temps de protection est réel et doit apparaître quelque part dans le prix, soit intégré au taux horaire, soit en poste séparé sur les chantiers occupés.',
    },
    {
      type: 'cta',
      title: 'Un catalogue de prix qui distingue déjà vos différents tarifs au m²',
      text: 'Cantia garde vos différents tarifs (support neuf, à réparer, nombre de couches) en mémoire, pour composer un devis juste en quelques minutes au lieu de recalculer chaque surface à la main.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il déduire les portes et fenêtres du calcul de surface peinture ?',
      answer:
        'Oui pour la surface facturée, mais le temps de finition aux bords des ouvertures reste réel, ce qui justifie un tarif qui tient compte du nombre d’ouvertures, pas seulement de la surface nette.',
    },
    {
      question: 'Comment facturer une deuxième couche de peinture nécessaire mais non prévue ?',
      answer:
        'Le mieux est de l’anticiper dans le devis initial selon le type de support et de changement de teinte prévu, plutôt que de la découvrir sur chantier et devoir la négocier après coup.',
    },
    {
      question: 'Le temps de protection du chantier doit-il être facturé séparément ?',
      answer:
        'Ce n’est pas obligatoire, mais c’est recommandé sur les chantiers occupés ou avec du mobilier à protéger. Ce temps est réel et souvent sous-estimé s’il reste noyé dans le prix au m².',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'checklist-cloture-chantier-avant-facturation',
    'devis-facture-facadier-isolation-suisse',
  ],
};
