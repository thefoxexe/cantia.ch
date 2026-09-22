import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-installateur-solaire-suisse',
  question: 'Comment établir devis et factures en tant qu’installateur de panneaux solaires en Suisse ?',
  title: 'Devis et facturation pour un installateur de panneaux solaires en Suisse',
  description:
    'Comment chiffrer un devis et facturer en tant qu’installateur de panneaux solaires en Suisse : poids du matériel, raccordement électrique, subventions et rétribution d’injection.',
  excerpt:
    'Le solaire attire chaque année de nouveaux installateurs qui chiffrent leurs premiers devis sans référence. Voici la structure de prix qui évite les mauvaises surprises en fin de chantier.',
  category: 'Métiers du bâtiment',
  keywords: [
    'devis panneaux solaires suisse',
    'facturation installateur solaire',
    'prix installation photovoltaïque',
    'devis photovoltaïque suisse',
  ],
  publishedAt: '2026-10-02',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le secteur du solaire suisse a connu une croissance très rapide ces dernières années, et avec elle une vague de nouveaux installateurs qui chiffrent leurs premiers devis sans point de comparaison. Résultat fréquent : un devis qui oublie le raccordement ou sous-estime la main-d’œuvre spécialisée, et une marge qui fond au moment de facturer.',
    },
    { type: 'h2', text: 'Le matériel domine le devis, la main-d’œuvre le complexifie' },
    {
      type: 'p',
      text: 'Sur une installation photovoltaïque, le matériel (panneaux, onduleur, structure de fixation, câblage) représente en général la plus grosse part du prix. Mais la main-d’œuvre n’est pas un simple poste secondaire : la pose en toiture demande une main-d’œuvre technique qualifiée, souvent en hauteur, et le raccordement électrique au tableau nécessite fréquemment l’intervention d’un électricien qualifié, en interne ou en sous-traitance. Ce partenariat doit être chiffré et planifié dès le devis, pas ajouté après coup.',
    },
    { type: 'h2', text: 'Distinguer installation neuve, extension et remplacement' },
    {
      type: 'list',
      items: [
        'Installation neuve sur toiture existante : le poste le plus prévisible, une fois l’orientation et l’état de la charpente vérifiés',
        'Extension d’une installation existante : nécessite de vérifier la compatibilité de l’onduleur en place, sous peine de devoir le remplacer',
        'Remplacement de panneaux ou d’onduleur en fin de vie : souvent sous-évalué car le client compare au prix de l’installation initiale, des années plus tôt',
      ],
    },
    { type: 'h2', text: 'Subventions et rétribution d’injection : à mentionner, jamais à garantir' },
    {
      type: 'p',
      text: 'De nombreux clients demandent un devis en intégrant déjà une subvention ou une rétribution pour l’injection du courant produit sur le réseau. Ces montants varient selon le canton, le distributeur d’électricité local et l’évolution des programmes de soutien, et ne dépendent pas de l’installateur. La bonne pratique est de présenter le prix net de l’installation sur le devis, et de mentionner séparément que le client doit vérifier les conditions et montants exacts auprès de son canton et de son distributeur avant de signer.',
    },
    {
      type: 'callout',
      title: 'Le premier hiver révèle les devis mal chiffrés',
      text: 'Un installateur qui débute chiffre souvent sa marge sur la base du prix du matériel au moment du devis. Entre la commande et la pose, plusieurs semaines ou mois peuvent s’écouler, et le prix du matériel évolue. Sans marge de sécurité, la facture finale rogne le bénéfice.',
    },
    {
      type: 'cta',
      title: 'Du devis à la facture, sans ressaisie',
      text: 'Cantia permet de structurer un devis solaire poste par poste (matériel, pose, raccordement) et de le transformer en facture en un clic, une fois le chantier terminé.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il inclure le raccordement électrique dans le devis solaire ?',
      answer:
        'Oui, même si un électricien tiers l’effectue : le client doit voir le prix total de son installation fonctionnelle, raccordement compris, sans découvrir un poste supplémentaire après la pose.',
    },
    {
      question: 'Peut-on garantir un montant de subvention sur le devis ?',
      answer:
        'Non, ces montants dépendent du canton et du distributeur d’électricité local et peuvent changer. Le devis doit présenter le prix net et renvoyer le client vérifier les conditions exactes avant signature.',
    },
    {
      question: 'Comment se protéger d’une hausse du prix du matériel entre le devis et la pose ?',
      answer:
        'En limitant la durée de validité du devis, ou en ajoutant une clause de révision si la commande du matériel intervient plusieurs semaines après la signature, ce qui est fréquent sur ce marché en forte demande.',
    },
  ],
  relatedSlugs: [
    'devis-pompe-a-chaleur-chiffrage',
    'programme-batiments-subvention-renovation-suisse',
    'devis-facture-chauffagiste-cvc-suisse',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
};
