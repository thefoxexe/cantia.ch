import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-devis-renovation-suisse',
  question: 'Comment calculer le prix d’un devis de rénovation en Suisse ?',
  title: 'Comment calculer le prix d’un devis de rénovation en Suisse',
  description:
    'Méthode concrète pour chiffrer un devis de rénovation en Suisse : coût horaire réel, matériel, marge, TVA 8,1 % — avec un exemple chiffré complet.',
  excerpt:
    'Le coût horaire affiché sur un devis n’est presque jamais le vrai coût horaire de l’entreprise. Voici comment le calculer correctement, poste par poste.',
  category: 'Devis & facturation',
  keywords: ['devis', 'prix', 'rénovation', 'coût horaire', 'marge', 'tva', 'chiffrage'],
  publishedAt: '2026-01-12',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'La question revient dans presque toutes les discussions d’artisans : "je facture combien de l’heure ?" La réponse naït rarement d’un chiffre rond choisi au hasard — elle se calcule, et le calcul change tout selon qu’on l’a fait sérieusement ou pas.',
    },
    { type: 'h2', text: '1. Partir du vrai coût horaire, pas du salaire net' },
    {
      type: 'p',
      text: 'Le coût horaire d’un collaborateur ne se limite pas à son salaire brut divisé par ses heures. Il faut ajouter les charges sociales employeur (AVS/AI/APG, AC, LPP, LAA — comptez environ 15 à 20 % du brut selon la caisse et la branche), les 13e salaire et vacances proratisés, l’habillement, l’outillage, et le temps non facturé (trajets, devis, administratif). Une entreprise du bâtiment qui paie CHF 32/h de salaire brut a souvent un coût horaire réel proche de CHF 55–65/h une fois tout inclus.',
    },
    {
      type: 'callout',
      title: 'Le piège du "prix rond"',
      text: 'Beaucoup d’artisans indépendants fixent leur tarif horaire en copiant un concurrent ou un chiffre entendu au café. Sans calcul du coût horaire réel, une partie des devis part sous le prix de revient — le chantier "tourne" mais ne paie jamais la structure.',
    },
    { type: 'h2', text: '2. Chiffrer le matériel au prix réel, pas au catalogue' },
    {
      type: 'p',
      text: 'Un prix fournisseur affiché en janvier n’est pas garanti en juin. Sur un devis de rénovation, mieux vaut soit obtenir une offre ferme du fournisseur pour la durée du chantier, soit intégrer une marge de sécurité de 3 à 8 % sur le poste matériel — plus le poste est volatile (bois, métal, isolants), plus la marge doit être haute.',
    },
    { type: 'h2', text: '3. Ajouter une marge qui couvre vraiment les risques' },
    {
      type: 'list',
      items: [
        'Marge de base (frais fixes : local, véhicules, assurances, comptabilité) — typiquement 10 à 15 %',
        'Marge bénéficiaire nette visée — 5 à 12 % selon le corps de métier',
        'Provision imprévus chantier (surtout en rénovation, où l’existant réserve des surprises) — 5 à 10 %',
      ],
    },
    {
      type: 'p',
      text: 'En rénovation particulièrement, l’imprévu n’est pas une exception mais la norme : mur porteur découvert derrière un doublage, installation électrique non conforme, humidité cachée. Un devis qui ne provisionne rien pour ça se transforme systématiquement en avenant pénible à négocier avec le client.',
    },
    { type: 'h2', text: '4. Appliquer la TVA correctement' },
    {
      type: 'p',
      text: 'Le taux normal suisse est de 8,1 % depuis le 1er janvier 2024. Il s’applique sur le montant HT du devis (main-d’œuvre + matériel + marge), pas sur chaque ligne séparément si des taux différents se mélangent — vérifiez toujours que le logiciel utilisé calcule la TVA sur le bon total et pas ligne par ligne avec arrondis qui dérivent sur de longues listes de positions.',
    },
    { type: 'h2', text: '5. Exemple chiffré : pose de fenêtres triple vitrage' },
    {
      type: 'table',
      headers: ['Poste', 'Détail', 'Montant CHF'],
      rows: [
        ['Main-d’œuvre', '16h × CHF 65/h (coût réel)', '1’040.00'],
        ['Matériel', '6 fenêtres triple vitrage + pose', '4’300.00'],
        ['Marge (frais fixes + bénéfice)', '18 % sur sous-total', '961.20'],
        ['Total HT', '', '6’301.20'],
        ['TVA 8,1 %', '', '510.40'],
        ['Total TTC', '', '6’811.60'],
      ],
    },
    {
      type: 'p',
      text: 'Ce calcul demande de la rigueur ligne par ligne — c’est exactement là qu’un tableur montre ses limites : une formule cassée, un taux de TVA oublié sur une nouvelle ligne, et le devis part faux sans que personne ne le remarque avant l’envoi.',
    },
    {
      type: 'cta',
      title: 'Le calcul se fait tout seul',
      text: 'Sur Cantia, vous entrez la description, la quantité et le prix unitaire : la TVA, les totaux et la marge se recalculent automatiquement à chaque ligne ajoutée. Le catalogue de prix retient vos tarifs habituels pour ne plus jamais les retaper.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle marge appliquer sur un devis de rénovation en Suisse ?',
      answer:
        'En général entre 20 et 35 % au total (frais fixes + bénéfice + provision imprévus), à ajuster selon le corps de métier et le niveau d’incertitude du chantier existant.',
    },
    {
      question: 'Faut-il inclure les imprévus dans le prix du devis ou les facturer à part ?',
      answer:
        'Les deux approches existent : soit une provision intégrée au prix ferme, soit une clause explicite prévoyant une facturation complémentaire sur devis supplémentaire en cas de découverte imprévue — à condition que cette clause figure clairement sur le devis initial.',
    },
    {
      question: 'La TVA se calcule sur le prix HT ou TTC du devis ?',
      answer:
        'Toujours sur le montant hors taxe (HT). Le taux normal est de 8,1 % depuis 2024 pour la plupart des prestations du bâtiment.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'norme-sia-118-devis-obligatoire',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
