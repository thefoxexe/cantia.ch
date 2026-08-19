import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturer-acompte-suisse-securiser-solde',
  question: 'Comment facturer un acompte en Suisse sans se retrouver à courir après le solde ?',
  title: 'Facturer un acompte sans finir à courir après le solde',
  description:
    'Un acompte mal structuré protège rarement l’entreprise. Voici comment répartir les paiements sur un chantier pour ne jamais avancer plus que ce qui est déjà couvert.',
  excerpt:
    'Un acompte de 30 % au démarrage donne un faux sentiment de sécurité si le reste du paiement n’est découpé qu’en deux étapes. L’argent qui manque, c’est presque toujours celui du milieu.',
  category: 'Devis & facturation',
  keywords: ['acompte', 'échéancier paiement', 'facture chantier', 'sécuriser paiement', 'solde final'],
  publishedAt: '2026-02-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier à CHF 25’000 avec un acompte de 30 % au départ semble prudent. Il ne l’est pas si tout le reste tombe sur une seule facture finale : entre l’acompte et le solde, l’entreprise a déjà payé le matériel, les heures, parfois un sous-traitant — sur ses fonds propres, en attendant un virement qui peut traîner.',
    },
    { type: 'h2', text: 'Le vrai problème n’est pas l’acompte, c’est le milieu du chantier' },
    {
      type: 'p',
      text: 'Un acompte de démarrage protège la décision de commencer. Il ne protège rien de ce qui s’engage ensuite. Sur un chantier de plusieurs semaines, le point de bascule financier n’est pas au début ni à la fin — c’est au moment où le matériel est acheté et les heures facturées avant que le client n’ait revu un centime depuis l’acompte.',
    },
    {
      type: 'list',
      items: [
        'Un acompte à la signature (souvent 20 à 30 %) qui couvre au minimum le matériel spécifique déjà engagé',
        'Une ou plusieurs factures intermédiaires calées sur des étapes visibles du chantier (fin de gros œuvre, pose des menuiseries, etc.) — pas sur des dates arbitraires',
        'Un solde final limité, idéalement sous 20 à 30 % du total, réglé à la réception',
      ],
    },
    {
      type: 'callout',
      title: 'La règle simple qui évite le piège',
      text: 'À aucun moment du chantier l’entreprise ne devrait avoir avancé plus que ce qui a déjà été facturé et encaissé. Si un poste matériel important arrive avant la prochaine échéance de paiement, l’échéancier est mal découpé — pas le client de mauvaise foi.',
    },
    { type: 'h2', text: 'Ce qui rend un acompte vraiment exécutoire' },
    {
      type: 'p',
      text: 'L’échéancier de paiement doit figurer sur le devis signé, pas être négocié à l’oral une fois le chantier lancé — un accord verbal sur « je vous paierai au fur et à mesure » ne protège rien juridiquement et se transforme régulièrement en malentendu de bonne foi des deux côtés.',
    },
    {
      type: 'cta',
      title: 'Des factures d’acompte qui se déduisent automatiquement',
      text: 'Cantia permet de facturer un pourcentage du devis en acompte, puis déduit ce montant de la facture finale sans ressaisie — l’échéancier reste visible du premier au dernier paiement.',
      buttonLabel: 'Voir le module Facturation',
    },
  ],
  faq: [
    {
      question: 'Quel pourcentage d’acompte demander sur un chantier en Suisse ?',
      answer:
        'Il n’existe pas de règle légale fixe — 20 à 30 % à la signature est courant, mais le point important est que l’échéancier complet couvre les dépenses engagées à chaque étape, pas seulement le démarrage.',
    },
    {
      question: 'Un acompte est-il remboursable si le client annule le chantier ?',
      answer:
        'Cela dépend des conditions figurant sur le devis signé — en l’absence de clause claire, un litige sur ce point se résout au cas par cas, ce qui justifie de toujours écrire une clause d’annulation explicite.',
    },
    {
      question: 'Peut-on facturer plusieurs acomptes intermédiaires sur un même chantier ?',
      answer:
        'Oui, et c’est recommandé sur les chantiers de plusieurs semaines : caler les factures intermédiaires sur des étapes visibles évite d’avancer trop de trésorerie avant le prochain encaissement.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'relancer-client-facture-impayee-sans-perdre-client',
    'calculer-prix-devis-renovation-suisse',
  ],
};
