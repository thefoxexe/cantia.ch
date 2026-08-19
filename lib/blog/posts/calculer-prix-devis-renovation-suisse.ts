import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-devis-renovation-suisse',
  question: 'Comment calculer le prix d’un devis de rénovation en Suisse ?',
  title: 'Comment calculer le prix d’un devis de rénovation en Suisse',
  description:
    'Méthode concrète pour chiffrer un devis de rénovation en Suisse : coût horaire réel, matériel, marge, TVA 8,1 % — avec un exemple chiffré complet.',
  excerpt:
    'Le tarif horaire copié sur un concurrent est la première cause de chantiers qui « tournent » sans jamais enrichir personne. Voici comment le calculer vraiment.',
  category: 'Devis & facturation',
  keywords: ['devis', 'prix', 'rénovation', 'coût horaire', 'marge', 'tva', 'chiffrage'],
  publishedAt: '2026-01-12',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Un devis qui bat la concurrence de dix francs de l’heure n’est presque jamais un devis malin — c’est souvent un devis qui n’a jamais été calculé. Le tarif horaire recopié sur un concurrent, ou sorti d’une intuition un lundi matin, est la première raison pour laquelle un chantier « qui tourne » ne finit jamais par enrichir personne.',
    },
    { type: 'h2', text: '1. Le coût horaire réel n’a rien à voir avec le salaire net' },
    {
      type: 'p',
      text: 'Un collaborateur payé CHF 32/h brut ne coûte pas CHF 32/h à l’entreprise. Il faut ajouter les charges sociales employeur (AVS/AI/APG, AC, LPP, LAA — comptez 15 à 20 % du brut selon la caisse et la branche), le 13e salaire et les vacances proratisés, l’outillage et l’habillement, et surtout le temps qui ne se facture jamais : trajets, devis, coordination, administratif. Sur une semaine réelle, ce temps mort avoisine souvent un jour plein sur cinq. Résultat : une entreprise qui paie CHF 32/h de brut porte un coût horaire réel proche de CHF 55 à 65/h une fois tout inclus — et c’est ce chiffre-là qu’il faut mettre dans le devis, pas le salaire.',
    },
    {
      type: 'callout',
      title: 'Le test en trente secondes',
      text: 'Prenez votre tarif horaire facturé, retirez 20 % de charges, puis encore le temps non facturable de la semaine (souvent un bon tiers du temps réel). Si ce qui reste ne couvre pas confortablement votre structure, vous ne perdez pas de l’argent tous les jours — mais un seul mauvais mois suffit à effacer la marge de l’année.',
    },
    { type: 'h2', text: '2. Le matériel : chiffrer au prix payé, jamais au prix rêvé' },
    {
      type: 'p',
      text: 'Un prix fournisseur vu en janvier n’est garanti pour personne en juin. Sur un chantier de rénovation qui s’étale sur plusieurs mois, deux options seulement : obtenir une offre ferme du fournisseur pour toute la durée, ou intégrer une marge de sécurité de 3 à 8 % — plus haute sur le bois, le métal et les isolants, dont les prix bougent le plus.',
    },
    { type: 'h2', text: '3. La marge : ce qui sépare un devis honnête d’un devis suicidaire' },
    {
      type: 'list',
      items: [
        'Frais fixes de structure (local, véhicules, assurances, comptabilité) — comptez 10 à 15 %',
        'Bénéfice net visé — 5 à 12 % selon le métier',
        'Provision imprévus — 5 à 10 %, et en rénovation ce n’est jamais du luxe',
      ],
    },
    {
      type: 'p',
      text: 'En rénovation, l’imprévu n’est pas l’exception, c’est la norme : mur porteur découvert derrière un doublage, installation électrique hors normes, humidité qui remonte d’un vide sanitaire personne n’avait ouvert depuis vingt ans. Un devis qui ne provisionne rien pour ça se transforme systématiquement en avenant pénible à négocier une fois le chantier ouvert — au moment où le rapport de force a basculé du côté du client.',
    },
    { type: 'h2', text: '4. La TVA, sur le bon montant' },
    {
      type: 'p',
      text: 'Le taux normal suisse est 8,1 % depuis le 1er janvier 2024, appliqué sur le total HT (main-d’œuvre + matériel + marge) — pas ligne par ligne avec des arrondis qui dérivent sur une longue liste de positions. C’est exactement le genre d’erreur invisible que produit un tableur mal conçu.',
    },
    { type: 'h2', text: '5. Un exemple qui tient debout : pose de fenêtres triple vitrage' },
    {
      type: 'table',
      headers: ['Poste', 'Détail', 'Montant CHF'],
      rows: [
        ['Main-d’œuvre', '16h × CHF 65/h (coût réel)', '1’040.00'],
        ['Matériel', '6 fenêtres triple vitrage + pose', '4’300.00'],
        ['Marge (frais fixes + bénéfice)', '18 % sur sous-total', '961.20'],
        ['Total HT', '', '6’301.20'],
        ['TVA 8,1 %', '', '510.40'],
        ['Total TTC', '', '6’811.60'],
      ],
    },
    {
      type: 'cta',
      title: 'Le calcul se fait tout seul, pas la marge',
      text: 'Sur Cantia, la TVA, les totaux et le catalogue de prix se calculent automatiquement à chaque ligne — le seul chiffre que vous gardez à choisir, c’est votre marge.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle marge appliquer sur un devis de rénovation en Suisse ?',
      answer:
        'En général entre 20 et 35 % au total (frais fixes + bénéfice + provision imprévus), à ajuster selon le corps de métier et le niveau d’incertitude du chantier existant.',
    },
    {
      question: 'Faut-il inclure les imprévus dans le prix du devis ou les facturer à part ?',
      answer:
        'Les deux approches existent : soit une provision intégrée au prix ferme, soit une clause explicite prévoyant une facturation complémentaire sur devis supplémentaire en cas de découverte imprévue — à condition que cette clause figure clairement sur le devis initial.',
    },
    {
      question: 'La TVA se calcule sur le prix HT ou TTC du devis ?',
      answer:
        'Toujours sur le montant hors taxe (HT). Le taux normal est de 8,1 % depuis 2024 pour la plupart des prestations du bâtiment.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'norme-sia-118-devis-obligatoire',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
