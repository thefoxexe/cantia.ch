import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'whatsapp-gestion-equipe-chantier-limites',
  question: 'Pourquoi WhatsApp craque pour gérer une équipe de chantier au-delà de quelques personnes ?',
  title: 'WhatsApp pour gérer une équipe de chantier : pourquoi ça craque après 5 personnes',
  description:
    'WhatsApp fonctionne très bien pour deux ou trois personnes. Au-delà, l’information se noie dans le défilement des messages : voici pourquoi, et ce qui prend le relais.',
  excerpt:
    'WhatsApp est un excellent outil de discussion. Ce n’est pas un outil de gestion. Et la différence devient brutale dès que l’équipe dépasse cinq personnes.',
  category: 'Comparatifs & outils',
  keywords: ['whatsapp chantier', 'gestion équipe', 'communication chantier', 'outil chantier', 'organisation bâtiment'],
  publishedAt: '2026-04-13',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un groupe WhatsApp pour l’équipe fonctionne remarquablement bien au début (rapide, familier, tout le monde l’a déjà installé). Puis l’équipe grandit, les chantiers se multiplient, et le même outil qui semblait suffire devient le principal point de friction de l’organisation.',
    },
    { type: 'h2', text: 'Ce que WhatsApp fait très bien' },
    {
      type: 'p',
      text: 'Envoyer une photo rapide, poser une question urgente, prévenir d’un retard : pour ce genre d’échange ponctuel, rien ne bat WhatsApp en rapidité. Le problème n’apparaît jamais sur un message isolé. Il apparaît sur l’accumulation.',
    },
    { type: 'h2', text: 'Où ça craque concrètement' },
    {
      type: 'list',
      items: [
        'Une information importante envoyée un mardi se noie sous cinquante messages avant le jeudi, si bien que personne ne la retrouve sans faire défiler tout l’historique',
        'Aucun lien structurel entre un message et le chantier qu’il concerne : impossible de filtrer « tout ce qui touche ce chantier précis »',
        'Une photo envoyée dans le groupe n’est géolocalisée ni horodatée de façon exploitable pour un rapport ou un litige ultérieur',
        'Le planning de qui va où reste dans la tête de celui qui l’a décidé, pas visible par toute l’équipe en même temps',
        'Aucune trace propre pour la facturation, la rentabilité ou l’historique client : tout reste dans une conversation, pas dans un système',
      ],
    },
    {
      type: 'callout',
      title: 'Le seuil n’est pas magique, mais il existe',
      text: 'Il n’y a pas de règle stricte à cinq personnes, mais le schéma se répète : au-delà d’une petite équipe et d’un ou deux chantiers, le volume de messages dépasse ce qu’une conversation linéaire peut absorber sans perte d’information. Le symptôme le plus clair : quelqu’un qui redemande une information déjà donnée, simplement parce qu’elle a disparu dans le flux.',
    },
    { type: 'h2', text: 'Ce qui prend le relais sans tout changer d’un coup' },
    {
      type: 'p',
      text: 'La transition la plus douce n’oppose pas « WhatsApp » à « un logiciel ». Elle garde WhatsApp pour l’urgence ponctuelle et déplace tout ce qui doit rester retrouvable (planning, photos de chantier, décisions, suivi client) vers un outil structuré par chantier. Le message rapide reste rapide ; ce qui doit survivre dans le temps arrête de dépendre d’un défilement de conversation.',
    },
    {
      type: 'cta',
      title: 'Un fil d’actualité par chantier, pas un seul grand groupe',
      text: 'Cantia organise les échanges, photos et notes par chantier (retrouvables des mois plus tard), sans faire défiler une conversation entière pour retomber sur l’information qu’on cherche.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'WhatsApp suffit-il pour gérer une petite équipe de chantier ?',
      answer:
        'Pour deux ou trois personnes et un chantier à la fois, oui : la limite apparaît quand l’équipe et le nombre de chantiers grandissent, et que l’information se noie dans le volume de messages.',
    },
    {
      question: 'Quel est le principal problème de WhatsApp pour gérer plusieurs chantiers ?',
      answer:
        'L’absence de structure : aucun lien entre un message et le chantier concerné, ce qui rend impossible de retrouver ou filtrer l’information plus tard.',
    },
    {
      question: 'Faut-il abandonner WhatsApp complètement pour un outil de gestion de chantier ?',
      answer:
        'Pas forcément. WhatsApp reste efficace pour l’urgence ponctuelle, mais la transition la plus efficace déplace surtout ce qui doit rester retrouvable (planning, photos, historique) vers un outil structuré par chantier.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'bexio-vs-cantia-logiciel-batiment',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
