import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'suivre-rentabilite-chantier-sans-excel',
  question: 'Comment suivre la rentabilité d’un chantier sans passer par Excel ?',
  title: 'Suivre la rentabilité d’un chantier sans tableur Excel',
  description:
    'Un tableau Excel de suivi de chantier casse dès qu’une formule change ou qu’un collaborateur oublie une ligne. Voici une méthode plus fiable pour savoir si un chantier est rentable en temps réel.',
  excerpt:
    'Le tableau Excel de suivi chantier tient rarement plus de quelques mois : une formule cassée, une ligne oubliée, et la rentabilité affichée ne veut plus rien dire.',
  category: 'Chantier & rentabilité',
  keywords: ['rentabilité chantier', 'excel', 'devisé vs réel', 'suivi de coûts', 'marge chantier'],
  publishedAt: '2026-02-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Presque toutes les entreprises du bâtiment ont, à un moment, tenu un fichier Excel de suivi de chantier. Et presque toutes ont fini par l’abandonner — pas par manque de discipline, mais parce que le format lui-même a des limites structurelles pour ce besoin précis.',
    },
    { type: 'h2', text: 'Pourquoi le tableur casse en pratique' },
    {
      type: 'list',
      items: [
        'Une formule modifiée par erreur sur une ligne se propage silencieusement — personne ne le remarque avant que le total final soit visiblement faux',
        'Le fichier vit sur un seul poste ou un drive partagé : deux personnes qui modifient en même temps écrasent le travail l’une de l’autre',
        'La saisie des heures, des factures fournisseurs et du matériel se fait a posteriori, souvent en fin de chantier — trop tard pour réagir à un dépassement',
        'Aucun lien automatique entre le devis initial et les coûts réels : tout se resaisit manuellement, avec le risque d’erreur que ça implique',
      ],
    },
    { type: 'h2', text: 'Ce que "rentabilité par chantier" veut vraiment dire' },
    {
      type: 'p',
      text: 'La rentabilité d’un chantier, ce n’est pas seulement "combien j’ai facturé" — c’est la comparaison entre ce qui a été devisé (montant vendu au client) et ce que le chantier a réellement coûté : heures de la main-d’œuvre au coût horaire réel, matériel effectivement acheté, sous-traitance facturée. Sans ce rapprochement précis, un chantier peut sembler rentable sur le papier alors qu’il a englouti trois fois plus d’heures que prévu.',
    },
    {
      type: 'callout',
      title: 'Le signal d’alerte le plus utile : en cours de chantier, pas après',
      text: 'Une rentabilité calculée seulement à la clôture du chantier arrive trop tard pour corriger le tir. L’intérêt réel est de voir, à mi-chantier, que les heures dépassent déjà le budget prévu — pour ajuster avant que la marge ne disparaisse complètement.',
    },
    { type: 'h2', text: 'Une méthode qui tient dans le temps' },
    {
      type: 'list',
      items: [
        'Chaque devis accepté devient la référence "budget" du chantier (heures et matériel prévus, prix de vente)',
        'Chaque heure travaillée par l’équipe et chaque achat matériel sont enregistrés directement sur le chantier, au fil de l’eau — pas reconstitués en fin de mois',
        'Les factures de sous-traitants liées au chantier viennent s’additionner automatiquement au coût réel',
        'Le solde (vendu moins coût réel) est visible en continu, pas seulement à la clôture',
      ],
    },
    {
      type: 'p',
      text: 'C’est exactement le genre de calcul qui devient fiable seulement quand il n’exige plus de ressaisie manuelle — chaque saisie (heure, facture, devis) alimente automatiquement le même chantier, sans étape de synchronisation entre plusieurs fichiers.',
    },
    {
      type: 'cta',
      title: 'La rentabilité, mise à jour toute seule',
      text: 'Le module Rentabilité de Cantia compare automatiquement le devisé et le réel, chantier par chantier, à partir des heures et des dépenses déjà enregistrées ailleurs dans l’app — sans ressaisie.',
      buttonLabel: 'Découvrir la rentabilité par chantier',
    },
  ],
  faq: [
    {
      question: 'Comment calculer la rentabilité réelle d’un chantier ?',
      answer:
        'En comparant le montant vendu au client (devis accepté) au coût réel du chantier : heures travaillées au coût horaire réel de l’entreprise, matériel effectivement acheté, et factures de sous-traitants liées au chantier.',
    },
    {
      question: 'Pourquoi un suivi Excel de chantier finit-il souvent abandonné ?',
      answer:
        'Parce qu’il repose sur une saisie manuelle a posteriori, fragile aux erreurs de formule, difficile à partager en équipe en temps réel, et sans lien automatique avec le devis initial ou les factures.',
    },
    {
      question: 'À quel moment du chantier faut-il suivre la rentabilité ?',
      answer:
        'Idéalement en continu, dès le démarrage — un suivi seulement fait à la clôture du chantier arrive trop tard pour corriger un dépassement d’heures ou de budget matériel en cours de route.',
    },
  ],
  relatedSlugs: [
    'bexio-vs-cantia-logiciel-batiment',
    'calculer-prix-devis-renovation-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
  ],
};
