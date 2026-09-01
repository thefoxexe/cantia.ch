import { Feather } from '@expo/vector-icons';

type IconName = keyof typeof Feather.glyphMap;

export interface TradePainPoint {
  problem: string;
  consequence: string;
  response: string;
}

export interface TradeUsage {
  icon: IconName;
  title: string;
  text: string;
}

export interface TradeComparisonRow {
  before: string;
  after: string;
}

export interface TradeFaqItem {
  question: string;
  answer: string;
}

export interface TradeLandingPage {
  slug: string;
  tradeName: string;
  seo: { title: string; description: string };
  hero: { eyebrow: string; title: string; subtitle: string };
  painPoints: TradePainPoint[];
  usages: TradeUsage[];
  scenario: { title: string; text: string };
  comparison: TradeComparisonRow[];
  faq: TradeFaqItem[];
  relatedBlogSlugs?: string[];
  relatedTrades?: string[];
}

// Lot 1 — the eight trades with the strongest commercial fit, per the
// phase-2 brief's own priority order. Each page's pain points, usages,
// scenario and FAQ are written for that specific trade's real workflow,
// not a word-swap of a generic template — a charpentier's problem with
// montage hours isn't a maçon's problem with heures either, even though
// both eventually route to the same "heures rattachées au chantier"
// feature. Lot 2/3 trades come later, once these are live and validated.
export const TRADE_PAGES: Record<string, TradeLandingPage> = {
  charpentier: {
    slug: 'charpentier',
    tradeName: 'charpentier',
    seo: {
      title: 'Logiciel de gestion pour charpentiers en Suisse | Cantia',
      description:
        'Gérez vos devis, chantiers, équipes, heures et factures avec Cantia, le logiciel de gestion conçu pour les entreprises de charpente en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour charpentiers',
      title: 'Le logiciel qui relie vos devis, votre atelier et vos chantiers',
      subtitle:
        'Cantia aide les entreprises de charpente à gérer leurs devis, leurs équipes, les heures de montage, les photos de chantier et la facturation depuis un seul outil.',
    },
    painPoints: [
      {
        problem: 'Le devis attend souvent la fin de journée',
        consequence: 'Le temps de remettre au propre les prestations et les prix le soir, le client a parfois déjà une autre offre en main.',
        response: 'Préparez votre offre directement depuis le chantier, avec un catalogue de prestations de charpente déjà chiffrées.',
      },
      {
        problem: 'L\'atelier et le chantier ne travaillent pas toujours avec la même information',
        consequence: 'Plans, photos et modifications restent parfois bloqués d\'un côté, ce qui déclenche des appels et fait perdre du temps aux deux équipes.',
        response: 'Chaque chantier centralise ses photos, remarques et documents, consultables par toute l\'équipe en temps réel.',
      },
      {
        problem: 'Les heures de montage peuvent rapidement manger la marge',
        consequence: 'Le dépassement ne se voit souvent qu\'à la facturation, une fois le chantier terminé.',
        response: 'Rattachez les heures au chantier et comparez en direct ce qui était prévu à ce qui a réellement été nécessaire.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis rapides depuis les métrés', text: 'Chiffrez une charpente à partir de vos métrés, avec vos prestations et prix déjà en mémoire.' },
      { icon: 'clock', title: 'Suivi des heures de montage', text: 'Chaque heure d\'équipe rattachée au bon chantier, comparée au devisé en temps réel.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Documentez chaque étape du montage, consultable depuis l\'atelier comme depuis le chantier.' },
      { icon: 'calendar', title: 'Planning atelier + chantier', text: 'Coordonnez la préparation en atelier et la pose sur le terrain dans un seul planning.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Une adaptation demandée sur place s\'ajoute directement au chantier, avec photo et remarque.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'Le chantier terminé, la facture se génère à partir du devis, sans ressaisie.' },
    ],
    scenario: {
      title: 'Exemple : rénovation d\'une charpente existante',
      text: 'Après la visite, vous créez le client et préparez l\'offre. Une fois le chantier accepté, vous planifiez l\'équipe. Les photos et remarques restent liées au projet. Si le client demande une intervention supplémentaire, elle est enregistrée directement. À la fin, les informations nécessaires sont déjà disponibles pour préparer la facture.',
    },
    comparison: [
      { before: 'Devis retapé le soir sur un coin de table', after: 'Devis préparé directement depuis le chantier' },
      { before: 'Plans et photos dispersés entre atelier et chantier', after: 'Tout centralisé par chantier' },
      { before: 'Heures de montage non suivies', after: 'Heures rattachées à chaque chantier' },
      { before: 'Modifications en cours de travaux oubliées', after: 'Travaux supplémentaires ajoutés en direct' },
      { before: 'Facture envoyée plusieurs jours après le montage', after: 'Facture générée depuis le devis' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une petite entreprise de charpente ?',
        answer: 'Oui. Le plan Essentiel couvre devis, chantiers et facturation pour une entreprise qui démarre ou travaille en petite équipe, sans les modules RH/planning qui ne servent qu\'à partir de plusieurs collaborateurs.',
      },
      {
        question: 'Puis-je suivre les heures de mes monteurs par chantier ?',
        answer: 'Oui, chaque heure saisie est rattachée à un chantier précis, ce qui permet de comparer le temps prévu au temps réellement passé sur le montage.',
      },
      {
        question: 'Peut-on ajouter des photos depuis le chantier ?',
        answer: 'Oui, directement depuis le téléphone ou la tablette sur place. Elles sont automatiquement classées par chantier et peuvent être géolocalisées.',
      },
      {
        question: 'Cantia permet-il de faire des devis pour des travaux de charpente ?',
        answer: 'Oui, avec un catalogue de prestations réutilisable (bois, assemblages, couverture associée) et un calcul automatique de la TVA et des totaux.',
      },
      {
        question: 'Puis-je utiliser Cantia avec Bexio ?',
        answer: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio, dès le plan Équipe.',
      },
    ],
    relatedTrades: ['menuisier', 'macon'],
  },

  macon: {
    slug: 'macon',
    tradeName: 'maçon',
    seo: {
      title: 'Logiciel de gestion pour entreprises de maçonnerie en Suisse | Cantia',
      description:
        'Suivez vos équipes, vos heures et la rentabilité réelle de vos chantiers avec Cantia, le logiciel de gestion conçu pour les entreprises de maçonnerie en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour maçons',
      title: 'Moins de papier. Plus de visibilité sur vos chantiers.',
      subtitle:
        'Cantia aide les entreprises de maçonnerie à suivre leurs équipes, leurs heures, leurs travaux supplémentaires et la rentabilité réelle de chaque chantier.',
    },
    painPoints: [
      {
        problem: 'Les heures et les rapports de chantier vivent sur papier',
        consequence: 'L\'information se perd ou doit être ressaisie plus tard, souvent de mémoire, plusieurs jours après.',
        response: 'Saisissez heures et rapports directement depuis le chantier, avec photos et remarques classées automatiquement.',
      },
      {
        problem: 'Un travail supplémentaire décidé en pleine coulée finit dans un coin de tête',
        consequence: 'Sans trace écrite au bon endroit, ce travail n\'est parfois jamais facturé.',
        response: 'Ajoutez le travail supplémentaire directement au chantier concerné, avec une photo si besoin, repris automatiquement dans la facturation.',
      },
      {
        problem: 'Plusieurs chantiers en parallèle, une rentabilité connue trop tard',
        consequence: 'Un chantier peut déraper sur les matériaux ou les heures sans que personne ne le remarque avant la fin.',
        response: 'Comparez en direct heures, matériaux et montant facturé pour repérer une dérive avant la fin du chantier.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Rapports de chantier avec photos', text: 'Notes et photos du jour deviennent un rapport prêt à envoyer, par chantier.' },
      { icon: 'clock', title: 'Suivi des heures d\'équipe', text: 'Chaque ouvrier, chaque chantier, chaque heure, comparée au devisé.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Un imprévu de chantier s\'ajoute directement, sans repasser par un carnet.' },
      { icon: 'trending-up', title: 'Rentabilité par chantier', text: 'Devisé, coût réel et marge visibles chantier par chantier, pas seulement en fin de mois.' },
      { icon: 'calendar', title: 'Planning multi-chantiers', text: 'Organisez plusieurs équipes sur plusieurs chantiers sans conflit de ressources.' },
      { icon: 'credit-card', title: 'Devis et factures', text: 'Du devis de gros œuvre à la facture finale, sans ressaisie.' },
    ],
    scenario: {
      title: 'Exemple : un chantier de gros œuvre, du terrassement à la réception',
      text: 'L\'équipe est affectée au chantier depuis le planning. Heures et matériaux sont suivis au jour le jour. Un renfort de fondation imprévu est ajouté en travaux supplémentaires, avec une photo à l\'appui. La rentabilité du chantier reste visible tout du long, pas seulement une fois la facture envoyée.',
    },
    comparison: [
      { before: 'Heures notées sur papier', after: 'Heures rattachées au chantier' },
      { before: 'Rapport de chantier reconstitué de mémoire', after: 'Rapport généré depuis les photos et notes du jour' },
      { before: 'Travaux supplémentaires oubliés', after: 'Travaux ajoutés et facturés' },
      { before: 'Rentabilité connue à la fin seulement', after: 'Rentabilité suivie en direct' },
      { before: 'Un carnet par chantier', after: 'Un planning centralisé pour tous les chantiers' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de maçonnerie avec plusieurs équipes ?',
        answer: 'Oui, le planning et les rôles d\'équipe permettent de coordonner plusieurs équipes sur plusieurs chantiers, avec un accès adapté à chacune.',
      },
      {
        question: 'Peut-on suivre les heures par chantier et par ouvrier ?',
        answer: 'Oui, chaque heure saisie est rattachée à un chantier et à la personne concernée, ce qui alimente directement la rentabilité du chantier.',
      },
      {
        question: 'Comment ajouter un travail supplémentaire découvert en cours de chantier ?',
        answer: 'Il s\'ajoute directement depuis le chantier, avec une remarque ou une photo, puis suit le même circuit qu\'un devis jusqu\'à la facturation.',
      },
      {
        question: 'Cantia permet-il de voir la rentabilité d\'un chantier avant sa fin ?',
        answer: 'Oui, la comparaison entre montant devisé et coût réel (heures, matériaux) est disponible en continu, pas seulement au bilan final.',
      },
      {
        question: 'Puis-je gérer plusieurs chantiers de maçonnerie en parallèle ?',
        answer: 'Oui, le planning centralise tous vos chantiers actifs et évite les conflits de ressources entre équipes.',
      },
    ],
    relatedBlogSlugs: ['calculer-prix-de-revient-chantier-batiment'],
    relatedTrades: ['charpentier', 'entreprise-generale'],
  },

  electricien: {
    slug: 'electricien',
    tradeName: 'électricien',
    seo: {
      title: 'Logiciel de gestion pour entreprises d\'électricité en Suisse | Cantia',
      description:
        'Gérez dépannages, chantiers, planning et facturation avec Cantia, le logiciel de gestion conçu pour les entreprises d\'électricité en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour électriciens',
      title: 'Gérez vos dépannages et vos chantiers électriques dans le même outil',
      subtitle:
        'Planning, clients, devis, heures, rapports et factures : Cantia rassemble l\'activité de votre entreprise d\'électricité sans multiplier les applications.',
    },
    painPoints: [
      {
        problem: 'Une urgence bouscule tout le planning de la journée',
        consequence: 'Sans vue partagée, réorganiser les techniciens se fait par une série d\'appels, avec le risque d\'oublier un rendez-vous prévu.',
        response: 'Un planning central, visible par toute l\'équipe, permet de réaffecter une intervention en quelques secondes.',
      },
      {
        problem: 'Un technicien arrive sur place sans l\'historique du client',
        consequence: 'Il découvre l\'installation sur place, sans savoir ce qui a déjà été fait ou facturé.',
        response: 'L\'historique client (devis, factures, interventions précédentes) est accessible depuis le terrain, avant même de sonner.',
      },
      {
        problem: 'Une petite intervention n\'est pas facturée tout de suite',
        consequence: 'Elle finit oubliée dans la pile administrative, et l\'argent correspondant ne rentre jamais.',
        response: 'Facturez directement depuis l\'intervention, avec QR-facture suisse prête à envoyer le jour même.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planning d\'équipe et interventions', text: 'Dépannages urgents et chantiers planifiés dans le même planning, réorganisable en temps réel.' },
      { icon: 'users', title: 'Fiche client avec historique', text: 'Chaque intervention, devis et facture d\'un client reste accessible depuis le terrain.' },
      { icon: 'mic', title: 'Devis rapides', text: 'Chiffrez une intervention ou un petit chantier électrique depuis votre catalogue de prestations.' },
      { icon: 'file-text', title: 'Rapports avec photos', text: 'Documentez une installation ou un dépannage avec photos et remarques, classées par intervention.' },
      { icon: 'clock', title: 'Heures par intervention', text: 'Suivez le temps réellement passé sur chaque dépannage ou chantier.' },
      { icon: 'credit-card', title: 'Facturation QR immédiate', text: 'Facture QR-suisse générée depuis l\'intervention, sans repasser par le bureau.' },
    ],
    scenario: {
      title: 'Exemple : une journée avec plusieurs interventions, du dépannage au chantier planifié',
      text: 'La journée commence avec un planning déjà organisé. Une urgence s\'ajoute en cours de matinée et vient réorganiser l\'équipe. Chaque intervention est documentée (photos, heures), et la facture du dernier dépannage part le soir même, directement depuis le terrain.',
    },
    comparison: [
      { before: 'Planning dans la tête du patron', after: 'Planning partagé par toute l\'équipe' },
      { before: 'Technicien sans historique client', after: 'Historique client accessible sur le terrain' },
      { before: 'Facture envoyée plusieurs jours après', after: 'Facture créée depuis l\'intervention' },
      { before: 'Photos d\'intervention dispersées', after: 'Photos classées par intervention' },
      { before: 'Heures non rattachées à une intervention précise', after: 'Heures suivies intervention par intervention' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise d\'électricité avec plusieurs techniciens ?',
        answer: 'Oui, le planning d\'équipe et les rôles personnalisés permettent de coordonner plusieurs techniciens sur des interventions différentes.',
      },
      {
        question: 'Peut-on gérer à la fois des dépannages urgents et des chantiers planifiés ?',
        answer: 'Oui, les deux vivent dans le même planning, réorganisable rapidement quand une urgence s\'ajoute en cours de journée.',
      },
      {
        question: 'Un technicien peut-il voir l\'historique d\'un client depuis le terrain ?',
        answer: 'Oui, la fiche client (devis, factures, interventions précédentes) est accessible depuis le téléphone ou la tablette, avant l\'intervention.',
      },
      {
        question: 'Cantia permet-il de facturer rapidement une petite intervention ?',
        answer: 'Oui, une facture avec QR-facture suisse peut être générée directement depuis l\'intervention, sans repasser par le bureau.',
      },
      {
        question: 'Puis-je utiliser Cantia avec Bexio pour ma comptabilité ?',
        answer: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio, dès le plan Équipe.',
      },
    ],
    relatedBlogSlugs: ['gestion-chantier-facturation-electricien-suisse'],
    relatedTrades: ['plombier', 'entreprise-generale'],
  },

  plombier: {
    slug: 'plombier',
    tradeName: 'plombier',
    seo: {
      title: 'Logiciel de gestion pour plombiers et installateurs sanitaires en Suisse | Cantia',
      description:
        'Centralisez interventions, chantiers et facturation avec Cantia, le logiciel de gestion conçu pour les entreprises de plomberie et sanitaire en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour plombiers',
      title: 'Vos interventions ne devraient pas finir sur des bouts de papier',
      subtitle:
        'Cantia centralise vos dépannages, vos chantiers sanitaires et votre facturation, du premier appel client jusqu\'au paiement.',
    },
    painPoints: [
      {
        problem: 'Un dépannage urgent est noté sur un bout de papier',
        consequence: 'Entre le déplacement et l\'intervention suivante, l\'information (client, matériel utilisé, temps passé) se perd avant d\'arriver à la facturation.',
        response: 'Enregistrez chaque intervention directement, avec client, matériel utilisé et heures, dès la fin du chantier.',
      },
      {
        problem: 'Le suivi client se fait de mémoire',
        consequence: 'Difficile de se souvenir qui a été appelé, pour quoi, et si la facture précédente a bien été payée.',
        response: 'Un historique client centralisé (devis, factures, interventions) évite les oublis de suivi et de relance.',
      },
      {
        problem: 'La facture d\'un dépannage traîne plusieurs jours',
        consequence: 'Pendant ce temps, l\'argent correspondant ne rentre pas dans la trésorerie.',
        response: 'Générez la facture QR-suisse directement depuis l\'intervention, sur place ou juste après.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis et interventions rapides', text: 'Chiffrez un dépannage ou un petit chantier sanitaire en quelques minutes.' },
      { icon: 'users', title: 'Suivi client centralisé', text: 'Historique complet des devis, factures et interventions par client.' },
      { icon: 'credit-card', title: 'Facturation immédiate', text: 'Facture avec QR-facture suisse générée sur place, prête à envoyer.' },
      { icon: 'clock', title: 'Heures et déplacements', text: 'Chaque intervention documentée avec le temps réellement passé.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Une fuite, une installation, une réparation : la preuve reste avec le chantier.' },
      { icon: 'calendar', title: 'Planning des techniciens', text: 'Organisez les interventions de la journée et réagissez vite à une urgence.' },
    ],
    scenario: {
      title: 'Exemple : un dépannage qui devient un petit chantier',
      text: 'Un client appelle pour une fuite. L\'intervention est enregistrée, une photo de la fuite est prise sur place. En discutant, un devis complémentaire est préparé pour une réparation plus large. Une fois acceptée, la facture du premier dépannage part déjà, sans attendre la fin du second chantier.',
    },
    comparison: [
      { before: 'Dépannage noté sur un bout de papier', after: 'Intervention enregistrée directement, avec client et matériel' },
      { before: 'Suivi client par mémoire', after: 'Historique client centralisé' },
      { before: 'Facture envoyée plusieurs jours après', after: 'Facture créée sur place, QR-facture suisse' },
      { before: 'Photos avant/après perdues dans la galerie du téléphone', after: 'Photos classées par intervention' },
      { before: 'Heures de déplacement non comptées', after: 'Heures et déplacements suivis par intervention' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une petite entreprise de sanitaire ou de plomberie ?',
        answer: 'Oui, le plan Essentiel couvre devis, interventions et facturation pour un plombier qui travaille seul ou en petite équipe.',
      },
      {
        question: 'Peut-on facturer un dépannage directement depuis le terrain ?',
        answer: 'Oui, une facture avec QR-facture suisse peut être générée sur place, dès la fin de l\'intervention.',
      },
      {
        question: 'Cantia gère-t-il la QR-facture suisse pour mes factures ?',
        answer: 'Oui, chaque facture inclut le bulletin QR suisse conforme, sur tous les plans.',
      },
      {
        question: 'Puis-je retrouver l\'historique d\'un client rapidement avant une intervention ?',
        answer: 'Oui, la fiche client centralise devis, factures et interventions précédentes, accessible depuis le téléphone.',
      },
      {
        question: 'Cantia fonctionne-t-il aussi bien pour les urgences que pour les chantiers planifiés ?',
        answer: 'Oui, dépannages et chantiers vivent dans le même planning, réorganisable rapidement en cas d\'urgence.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-plombier-sanitaire-suisse'],
    relatedTrades: ['electricien', 'entreprise-generale'],
  },

  peintre: {
    slug: 'peintre',
    tradeName: 'peintre',
    seo: {
      title: 'Logiciel de gestion pour entreprises de peinture en Suisse | Cantia',
      description:
        'Préparez vos devis de peinture plus vite et suivez vos surfaces, équipes et travaux supplémentaires avec Cantia, le logiciel de gestion conçu pour la Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour peintres',
      title: 'Faites vos devis de peinture plus vite et suivez réellement vos heures',
      subtitle:
        'Vous savez combien de mètres carrés vous avez facturés. Cantia vous aide aussi à savoir combien d\'heures ils vous ont réellement coûté.',
    },
    painPoints: [
      {
        problem: 'Un devis presque identique au précédent est refait de zéro',
        consequence: 'Du temps perdu à retaper des prestations pourtant très similaires d\'un chantier à l\'autre.',
        response: 'Un catalogue de prestations de peinture réutilisable accélère chaque nouveau devis.',
      },
      {
        problem: 'Le client demande une variante de finition pendant la visite',
        consequence: 'Difficile de chiffrer l\'option sur place sans tout recalculer plus tard.',
        response: 'Ajustez le devis directement depuis le métré et le catalogue, sans repartir de zéro.',
      },
      {
        problem: 'Les heures réelles ne sont jamais comparées aux mètres carrés facturés',
        consequence: 'La marge réelle d\'un chantier reste invisible, même quand le devis a été bien vendu.',
        response: 'Rattachez les heures au chantier et comparez-les au devisé pour savoir ce qu\'un m² vous coûte vraiment.',
      },
    ],
    usages: [
      { icon: 'list', title: 'Catalogue de prestations', text: 'Vos prestations de peinture (surfaces, finitions) mémorisées et réutilisables.' },
      { icon: 'mic', title: 'Devis avec métré de surfaces', text: 'Chiffrez rapidement à partir des surfaces mesurées sur place.' },
      { icon: 'clock', title: 'Suivi des heures par chantier', text: 'Comparez le temps prévu au temps réellement passé, chantier par chantier.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Gardez une preuve visuelle de chaque chantier, utile en cas de litige.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Une variante ou une retouche demandée en cours de chantier s\'ajoute directement.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend automatiquement les prestations validées.' },
    ],
    scenario: {
      title: 'Exemple : un devis peinture avec variantes de finition',
      text: 'Après la visite et le métré des surfaces, un devis avec plusieurs finitions possibles est préparé. Le chantier accepté est planifié, les heures de l\'équipe sont suivies au jour le jour. Le client demande une retouche en cours de travaux : elle est ajoutée en travaux supplémentaires, puis reprise dans la facture finale.',
    },
    comparison: [
      { before: 'Devis refait de zéro à chaque fois', after: 'Catalogue de prestations réutilisable' },
      { before: 'Surfaces recalculées à la main', after: 'Métré intégré au devis' },
      { before: 'Heures jamais comparées aux m² facturés', after: 'Heures suivies et comparées au devisé' },
      { before: 'Variante de finition difficile à chiffrer sur place', after: 'Ajustement rapide depuis le catalogue' },
      { before: 'Retouche oubliée de la facture', after: 'Travaux supplémentaires ajoutés au chantier' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de peinture indépendante ?',
        answer: 'Oui, le plan Essentiel couvre devis, catalogue et facturation pour un peintre qui travaille seul, sans les modules d\'équipe superflus.',
      },
      {
        question: 'Puis-je créer un catalogue de mes prestations de peinture habituelles ?',
        answer: 'Oui, chaque prestation chiffrée dans un devis vient enrichir votre catalogue, réutilisable au chantier suivant.',
      },
      {
        question: 'Comment gérer une variante de finition demandée par le client ?',
        answer: 'Elle s\'ajoute ou se modifie directement dans le devis à partir du catalogue et du métré, sans repartir de zéro.',
      },
      {
        question: 'Cantia permet-il de suivre les heures réelles par rapport au devis ?',
        answer: 'Oui, les heures saisies par chantier sont comparées au montant devisé pour évaluer la rentabilité réelle.',
      },
      {
        question: 'Peut-on ajouter des photos avant/après pour chaque chantier ?',
        answer: 'Oui, les photos sont classées automatiquement par chantier et consultables à tout moment.',
      },
    ],
    relatedBlogSlugs: ['devis-peintre-batiment-calcul-surface-suisse'],
    relatedTrades: ['menuisier', 'entreprise-generale'],
  },

  menuisier: {
    slug: 'menuisier',
    tradeName: 'menuisier',
    seo: {
      title: 'Logiciel de gestion pour entreprises de menuiserie en Suisse | Cantia',
      description:
        'Suivez chaque commande, de l\'atelier à la pose, avec Cantia, le logiciel de gestion conçu pour les entreprises de menuiserie en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour menuisiers',
      title: 'De l\'atelier à la pose, gardez chaque projet sous contrôle',
      subtitle:
        'Cantia aide les entreprises de menuiserie à suivre leurs commandes sur mesure, leurs mesures, leur planning atelier/pose et leur facturation.',
    },
    painPoints: [
      {
        problem: 'De nombreuses petites commandes tournent en parallèle',
        consequence: 'Mesures, choix du client et délais finissent dispersés entre carnets, mails et mémoire.',
        response: 'Chaque commande a son propre chantier, avec toutes les informations centralisées au même endroit.',
      },
      {
        problem: 'Le client modifie sa demande après la prise de mesure',
        consequence: 'Sans trace claire, le risque d\'une erreur de fabrication ou de pose augmente.',
        response: 'La modification est ajoutée directement au chantier concerné, visible par l\'atelier et l\'équipe de pose.',
      },
      {
        problem: 'Personne ne sait précisément où en est une commande',
        consequence: 'Le patron doit être le point de passage obligé entre atelier et pose pour connaître un statut.',
        response: 'Statut et planning sont partagés entre atelier et équipe de pose, sans intermédiaire obligé.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis sur mesure', text: 'Chiffrez une commande personnalisée depuis votre catalogue de prestations.' },
      { icon: 'file-text', title: 'Suivi des commandes par chantier', text: 'Mesures, choix client et délais centralisés par projet.' },
      { icon: 'calendar', title: 'Planning atelier et pose', text: 'Coordonnez la fabrication et la pose sans appel intermédiaire.' },
      { icon: 'image', title: 'Photos de fabrication et pose', text: 'Documentez chaque étape, de l\'atelier jusqu\'à l\'installation.' },
      { icon: 'plus-circle', title: 'Modifications client', text: 'Une demande de dernière minute s\'ajoute directement au projet concerné.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend la commande validée, sans ressaisie.' },
    ],
    scenario: {
      title: 'Exemple : une commande de mobilier sur mesure, de la prise de mesure à la pose',
      text: 'La prise de mesure chez le client alimente un devis personnalisé. La commande est suivie en atelier ; une modification demandée par le client est ajoutée directement au chantier. La pose est planifiée et documentée en photos, puis la facture est générée depuis le devis initial.',
    },
    comparison: [
      { before: 'Mesures notées sur un carnet', after: 'Mesures et remarques liées au chantier' },
      { before: 'Modification client perdue entre atelier et pose', after: 'Modification ajoutée directement au chantier concerné' },
      { before: 'Statut de commande connu seulement du patron', after: 'Statut visible par toute l\'équipe' },
      { before: 'Photos de fabrication et de pose dispersées', after: 'Photos classées par chantier' },
      { before: 'Devis personnalisé refait de zéro', after: 'Catalogue de prestations réutilisable' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à un menuisier qui travaille sur commandes personnalisées ?',
        answer: 'Oui, chaque commande devient un chantier avec ses propres mesures, documents et statut, quel que soit son degré de personnalisation.',
      },
      {
        question: 'Comment suivre une modification demandée par le client après la prise de mesure ?',
        answer: 'Elle s\'ajoute directement au chantier concerné, avec une remarque, visible par l\'atelier comme par l\'équipe de pose.',
      },
      {
        question: 'Peut-on coordonner atelier et équipe de pose avec Cantia ?',
        answer: 'Oui, le planning et le statut de chaque commande sont partagés, sans avoir à passer par un appel intermédiaire.',
      },
      {
        question: 'Cantia permet-il de faire des devis avec des prestations sur mesure ?',
        answer: 'Oui, un catalogue de prestations réutilisable accélère le chiffrage tout en laissant la place à des lignes spécifiques par commande.',
      },
      {
        question: 'Puis-je ajouter des photos de fabrication et de pose par projet ?',
        answer: 'Oui, les photos sont classées automatiquement par chantier, de l\'atelier jusqu\'à l\'installation finale.',
      },
    ],
    relatedBlogSlugs: ['devis-menuisier-sur-mesure-facturation-suisse'],
    relatedTrades: ['charpentier', 'peintre'],
  },

  'entreprise-generale': {
    slug: 'entreprise-generale',
    tradeName: 'entreprise générale',
    seo: {
      title: 'Logiciel de gestion pour entreprises générales du bâtiment en Suisse | Cantia',
      description:
        'Centralisez plusieurs chantiers, sous-traitants et budgets avec Cantia, le logiciel de gestion conçu pour les entreprises générales du bâtiment en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour entreprises générales',
      title: 'Une vue claire sur tous vos chantiers, sans multiplier les fichiers',
      subtitle:
        'Cantia centralise vos chantiers, vos sous-traitants, vos documents et la rentabilité de chaque projet dans un seul outil.',
    },
    painPoints: [
      {
        problem: 'Plusieurs chantiers tournent en parallèle, chacun avec ses propres fichiers',
        consequence: 'Impossible d\'avoir une vue d\'ensemble sans reconstituer l\'information chantier par chantier.',
        response: 'Tous vos chantiers sont centralisés dans un seul outil, consultables au même endroit.',
      },
      {
        problem: 'De nombreux sous-traitants à coordonner sur différents chantiers',
        consequence: 'Statuts d\'intervention et attestations d\'assurance se perdent facilement d\'un chantier à l\'autre.',
        response: 'Un répertoire de sous-traitants réutilisable, avec statut et attestations par chantier.',
      },
      {
        problem: 'La rentabilité réelle d\'un chantier n\'est connue qu\'en fin de projet',
        consequence: 'Une dérive de budget ou de délai est découverte trop tard pour être corrigée.',
        response: 'Comparez montant devisé et coût réel en continu, chantier par chantier, pas seulement au bilan final.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planning multi-chantiers', text: 'Organisez plusieurs équipes et sous-traitants sur plusieurs chantiers actifs.' },
      { icon: 'users', title: 'Coordination des sous-traitants', text: 'Répertoire réutilisable, avec attestations d\'assurance stockées et datées.' },
      { icon: 'folder', title: 'Documents par chantier', text: 'Plans, soumissions et contrats classés dans un classeur numérique par projet.' },
      { icon: 'trending-up', title: 'Rentabilité par chantier', text: 'Devisé, coût réel et marge visibles pour chaque projet en cours.' },
      { icon: 'shield', title: 'Rôles d\'équipe personnalisés', text: 'Décidez précisément qui voit quoi selon la fonction de chacun.' },
      { icon: 'credit-card', title: 'Facturation et trésorerie', text: 'Suivez ce qui est facturé, encaissé et à venir, tous chantiers confondus.' },
    ],
    scenario: {
      title: 'Exemple : plusieurs chantiers menés en parallèle, avec sous-traitants',
      text: 'Chaque chantier dispose de son propre espace (documents, planning, sous-traitants). La rentabilité de chacun reste visible en direct, et les rôles d\'équipe limitent l\'accès de chaque collaborateur aux informations qui le concernent réellement.',
    },
    comparison: [
      { before: 'Un fichier par chantier, aucune vue d\'ensemble', after: 'Tous les chantiers centralisés' },
      { before: 'Sous-traitants suivis de mémoire', after: 'Répertoire de sous-traitants avec attestations' },
      { before: 'Rentabilité connue en fin de chantier', after: 'Rentabilité suivie en direct, chantier par chantier' },
      { before: 'Accès aux données non contrôlé', after: 'Rôles d\'équipe personnalisés' },
      { before: 'Documents dispersés entre plusieurs outils', after: 'Classeur numérique par chantier' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise générale qui gère plusieurs chantiers en parallèle ?',
        answer: 'Oui, c\'est exactement le cas d\'usage visé par le planning multi-chantiers et la vue centralisée par projet.',
      },
      {
        question: 'Peut-on suivre les sous-traitants et leurs attestations d\'assurance ?',
        answer: 'Oui, un répertoire de sous-traitants réutilisable garde le statut d\'intervention et les attestations à jour, par chantier.',
      },
      {
        question: 'Cantia permet-il de comparer la rentabilité de plusieurs chantiers ?',
        answer: 'Oui, chaque chantier affiche sa propre marge (devisé vs coût réel), ce qui permet de comparer plusieurs projets entre eux.',
      },
      {
        question: 'Peut-on limiter l\'accès de certains employés à certaines informations ?',
        answer: 'Oui, des rôles personnalisés permettent de cocher précisément qui accède aux finances, au métré, au planning ou aux documents.',
      },
      {
        question: 'Cantia s\'intègre-t-il avec Bexio pour la comptabilité ?',
        answer: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio, dès le plan Équipe.',
      },
    ],
    relatedBlogSlugs: ['gerer-plusieurs-chantiers-en-parallele-methode'],
    relatedTrades: ['macon', 'electricien'],
  },

  paysagiste: {
    slug: 'paysagiste',
    tradeName: 'paysagiste',
    seo: {
      title: 'Logiciel de gestion pour entreprises de paysagisme en Suisse | Cantia',
      description:
        'Gérez équipes mobiles, chantiers d\'aménagement et contrats d\'entretien avec Cantia, le logiciel de gestion conçu pour les entreprises de paysagisme en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour paysagistes',
      title: 'Chantiers, entretien et équipes : tout votre planning au même endroit',
      subtitle:
        'Cantia aide les entreprises de paysagisme à organiser leurs équipes mobiles, leurs chantiers d\'aménagement et leurs contrats d\'entretien récurrent.',
    },
    painPoints: [
      {
        problem: 'De nombreux petits chantiers et interventions d\'entretien à caser dans la semaine',
        consequence: 'Le planning devient vite difficile à tenir à jour, avec des équipes mal réparties sur les sites.',
        response: 'Un planning central par équipe et par jour, ajustable en quelques secondes.',
      },
      {
        problem: 'Les équipes travaillent sur plusieurs sites en même temps',
        consequence: 'Coordonner qui va où, et avec quel matériel, devient une charge mentale constante pour le patron.',
        response: 'Chaque chantier reste accessible depuis le terrain, sur mobile, où que soit l\'équipe.',
      },
      {
        problem: 'L\'entretien récurrent se suit mal d\'une visite à l\'autre',
        consequence: 'Une intervention peut être oubliée, ou mal facturée faute de trace claire.',
        response: 'Chaque intervention d\'entretien est liée à son chantier, prête à être reprise dans la facturation.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planning d\'équipes mobiles', text: 'Organisez plusieurs équipes sur plusieurs sites, ajustable en direct.' },
      { icon: 'mic', title: 'Devis chantiers et entretien', text: 'Chiffrez un aménagement ou un contrat d\'entretien depuis votre catalogue.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Valorisez un aménagement terminé ou documentez une intervention d\'entretien.' },
      { icon: 'clock', title: 'Suivi des heures', text: 'Le temps passé par intervention, rattaché au bon chantier.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'Chaque intervention facturée sans attendre la fin de saison.' },
      { icon: 'list', title: 'Catalogue de prestations', text: 'Vos prestations récurrentes (tonte, taille, entretien) déjà chiffrées.' },
    ],
    scenario: {
      title: 'Exemple : une saison avec chantiers d\'aménagement et contrats d\'entretien',
      text: 'Le planning hebdomadaire répartit les équipes sur plusieurs sites. Chaque intervention d\'entretien est documentée et liée à son chantier. Un aménagement plus important est suivi comme un vrai chantier, du devis initial aux photos avant/après, jusqu\'à la facturation.',
    },
    comparison: [
      { before: 'Planning d\'équipes mobiles sur papier', after: 'Planning centralisé, accessible sur le terrain' },
      { before: 'Entretien récurrent mal suivi', after: 'Chaque intervention liée à son chantier' },
      { before: 'Photos d\'aménagement dispersées', after: 'Photos avant/après classées par chantier' },
      { before: 'Devis refaits à chaque petit chantier', after: 'Catalogue de prestations réutilisable' },
      { before: 'Facture envoyée en fin de saison', after: 'Facture créée après chaque intervention' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de paysagisme avec plusieurs équipes mobiles ?',
        answer: 'Oui, le planning centralisé permet d\'organiser plusieurs équipes sur plusieurs sites, consultable directement sur le terrain.',
      },
      {
        question: 'Peut-on gérer à la fois des chantiers d\'aménagement et des contrats d\'entretien ?',
        answer: 'Oui, les deux vivent dans le même outil : un aménagement se suit comme un chantier classique, l\'entretien récurrent comme une série d\'interventions liées à un chantier.',
      },
      {
        question: 'Le planning est-il consultable depuis le terrain, sur mobile ?',
        answer: 'Oui, Cantia fonctionne sur téléphone et tablette, avec un accès direct au planning et aux chantiers du jour.',
      },
      {
        question: 'Cantia permet-il de facturer rapidement une intervention d\'entretien ?',
        answer: 'Oui, chaque intervention peut être facturée dès sa réalisation, sans attendre la fin de la saison.',
      },
      {
        question: 'Puis-je ajouter des photos avant/après pour un aménagement ?',
        answer: 'Oui, les photos sont classées automatiquement par chantier et utiles pour valoriser un aménagement terminé.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-paysagiste-jardinier-suisse'],
    relatedTrades: ['entreprise-generale', 'macon'],
  },
};

export const TRADE_PAGE_SLUGS = Object.keys(TRADE_PAGES);

// tradeName + "s" only pluralizes correctly for single-word trades
// ("charpentier" -> "charpentiers"). "entreprise générale" needs both
// words inflected ("entreprises générales"), so this special-cases the
// one multi-word trade in the set rather than mangling it.
export function pluralTradeName(tradeName: string): string {
  if (tradeName === 'entreprise générale') return 'Entreprises générales';
  return tradeName.charAt(0).toUpperCase() + tradeName.slice(1) + 's';
}
