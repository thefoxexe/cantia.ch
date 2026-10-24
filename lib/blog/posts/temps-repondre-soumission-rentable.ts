import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'temps-repondre-soumission-rentable',
  question: 'Combien de temps passer sur une soumission, et quand dire non ?',
  title: 'Combien coûte une soumission à votre entreprise, et quand ne pas répondre',
  description:
    'Heures de chiffrage, taux de réussite, coût réel d’une offre gagnée : un calcul simple pour décider à quelles soumissions répondre et comment y passer moins de temps.',
  excerpt:
    'Si vous gagnez une soumission sur cinq et que chacune vous prend une soirée, chaque marché gagné vous a coûté cinq soirées. Le calcul mérite d’être fait.',
  category: 'Croissance & acquisition',
  keywords: ['temps chiffrage soumission', 'taux de réussite offres', 'répondre soumission rentable', 'coût d’une offre bâtiment'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Répondre à une soumission, c’est du travail non payé : lire le dossier, visiter parfois le site, chiffrer, contrôler, rendre. On le fait parce qu’il faut des chantiers. Mais peu d’entreprises calculent ce que leur coûte réellement un marché gagné.',
    },
    { type: 'h2', text: 'Le calcul' },
    {
      type: 'table',
      headers: ['Donnée', 'Exemple'],
      rows: [
        ['Heures par soumission (lecture, chiffrage, contrôle)', '6 h'],
        ['Coût horaire de la personne qui chiffre', 'CHF 90.–'],
        ['Coût d’une soumission', 'CHF 540.–'],
        ['Taux de réussite', '1 sur 5'],
        ['Coût de chiffrage par marché gagné', 'CHF 2 700.–'],
      ],
    },
    {
      type: 'p',
      text: 'Ces CHF 2 700.– doivent être couverts par la marge du chantier gagné. Sur un petit marché, ils peuvent la manger entièrement.',
    },
    { type: 'h2', text: 'Quand ne pas répondre' },
    {
      type: 'list',
      items: [
        'Le chantier dépasse votre capacité aux dates prévues : vous ne pourrez pas tenir le délai.',
        'Les conditions particulières (pénalités, garanties, délais de paiement) sont inacceptables pour votre trésorerie.',
        'Vous n’avez aucune chance réaliste : trop loin, mauvais métier, maître d’ouvrage qui choisit toujours le même.',
        'Le dossier arrive trop tard pour être chiffré sérieusement : une offre bâclée est pire qu’une absence.',
      ],
    },
    {
      type: 'callout',
      title: 'Dire non poliment garde la porte ouverte',
      text: 'Un court message à l’architecte (« pas de capacité sur cette période, consultez-nous pour la suite ») vaut mieux qu’un silence ou une offre volontairement chère.',
    },
    { type: 'h2', text: 'Réduire le temps par soumission' },
    {
      type: 'list',
      items: [
        'Tenir un catalogue de prix par numéro de position et le mettre à jour après chaque chantier.',
        'Ne plus recopier les positions : partir du document reçu.',
        'Faire calculer les montants, reports et totaux plutôt que les vérifier à la main.',
        'Garder un modèle de lettre d’accompagnement et la liste des annexes habituelles.',
      ],
    },
    {
      type: 'p',
      text: 'C’est le principe de la fonction « Remplir une soumission » de Cantia, en bêta : le PDF reçu est importé, vos prix sont proposés, vous ajustez et le PDF d’origine ressort rempli. 1 soumission d’essai avec Essentiel, 3 par mois avec Équipe, illimitée avec Entreprise.',
    },
    {
      type: 'cta',
      title: 'Divisez le temps passé sur vos soumissions',
      text: 'Importez le PDF reçu, chiffrez au clavier, renvoyez le document rempli.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'Quel est un bon taux de réussite sur les soumissions ?',
      answer: 'Il dépend du métier, de la région et du type de marché. L’important est de connaître le vôtre et de le suivre dans le temps, pour savoir où vous gagnez.',
    },
    {
      question: 'Peut-on facturer le chiffrage d’une soumission ?',
      answer: 'En règle générale non, la réponse à une soumission est gratuite. Une étude ou un projet demandé en plus peut faire l’objet d’un accord séparé, à convenir avant.',
    },
    {
      question: 'Comment savoir pourquoi on a perdu une soumission ?',
      answer: 'Demandez le résultat et, si possible, votre rang. Sur un marché public, l’adjudication est communiquée et peut être motivée ; sur un marché privé, un appel à l’architecte suffit souvent.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'calculer-prix-unitaire-soumission', 'chantier-complet-peut-etre-en-perte-taux-horaire'],
};
