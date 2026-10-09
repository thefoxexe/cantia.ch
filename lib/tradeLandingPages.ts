import { Feather } from '@expo/vector-icons';
import { TRADE_PAGES_DE } from './tradeLandingPagesDe';
import { TRADE_PAGES_IT } from './tradeLandingPagesIt';

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
  // A trade outside the building sector: the shared copy talks about
  // projects instead of chantiers, and /metiers lists it apart.
  general?: boolean;
}

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

  couvreur: {
    slug: 'couvreur',
    tradeName: 'couvreur',
    seo: {
      title: 'Logiciel de gestion pour couvreurs en Suisse | Cantia',
      description:
        'Documentez et pilotez vos chantiers de toiture avec Cantia, le logiciel de gestion conçu pour les entreprises de couverture en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour couvreurs',
      title: 'De la visite de toiture à la facture, gardez toutes les preuves du chantier',
      subtitle:
        'Cantia aide les entreprises de couverture à documenter leurs diagnostics, gérer les imprévus de chantier et facturer sans perdre de trace.',
    },
    painPoints: [
      {
        problem: 'Un diagnostic de toiture sans preuve visuelle claire',
        consequence: 'Difficile de justifier l\'étendue des travaux au client ou à l\'assurance une fois le chantier commencé.',
        response: 'Prenez des photos géolocalisées pendant le diagnostic, liées directement au chantier concerné.',
      },
      {
        problem: 'Une découverte sous la couverture change tout le chantier',
        consequence: 'Sans document clair au moment de la découverte, le surcoût est difficile à faire accepter par le client.',
        response: 'Ajoutez le travail supplémentaire directement au chantier, avec une photo, repris automatiquement dans la facturation.',
      },
      {
        problem: 'La sécurité et les preuves d\'intervention doivent être documentées',
        consequence: 'En cas de litige ou de contrôle, l\'absence de trace écrite complique tout.',
        response: 'Chaque étape du chantier (photos, remarques, documents) reste centralisée et datée automatiquement.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis depuis le diagnostic', text: 'Chiffrez une réfection de toiture directement après la visite de diagnostic.' },
      { icon: 'image', title: 'Photos avant/pendant/après', text: 'Documentez chaque étape du chantier, géolocalisées automatiquement.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Une découverte imprévue sous la couverture s\'ajoute directement, avec photo.' },
      { icon: 'calendar', title: 'Planning d\'équipe', text: 'Organisez vos équipes sur plusieurs chantiers de toiture.' },
      { icon: 'file-text', title: 'Rapports de chantier', text: 'Notes et photos deviennent un rapport prêt à envoyer.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'Le chantier terminé, la facture reprend tout ce qui a été réellement exécuté.' },
    ],
    scenario: {
      title: 'Exemple : une réfection de toiture après diagnostic',
      text: 'La visite et le diagnostic sont photographiés directement sur place. Le devis est préparé, le chantier planifié. Une découverte imprévue (charpente abîmée) est ajoutée en travaux supplémentaires avec une photo à l\'appui. La facture finale reprend l\'ensemble des travaux réellement exécutés.',
    },
    comparison: [
      { before: 'Diagnostic de toiture sans preuve écrite', after: 'Photos géolocalisées liées au chantier' },
      { before: 'Découverte sous la couverture non documentée', after: 'Travaux supplémentaires ajoutés avec photo' },
      { before: 'Preuves d\'intervention dispersées', after: 'Historique centralisé et daté par chantier' },
      { before: 'Devis refait après chaque visite', after: 'Catalogue de prestations réutilisable' },
      { before: 'Facture envoyée après coup', after: 'Facture générée depuis le devis' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de couverture ?',
        answer: 'Oui, le plan Essentiel couvre devis, chantiers et facturation pour une entreprise de couverture qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Puis-je documenter un diagnostic de toiture avec des photos ?',
        answer: 'Oui, les photos prises pendant le diagnostic sont géolocalisées automatiquement et liées au chantier.',
      },
      {
        question: 'Comment ajouter une découverte imprévue en cours de chantier ?',
        answer: 'Elle s\'ajoute directement au chantier concerné, avec une remarque ou une photo, puis suit le même circuit qu\'un devis jusqu\'à la facturation.',
      },
      {
        question: 'Cantia permet-il de garder une trace claire en cas de litige ?',
        answer: 'Oui, chaque photo, remarque et document reste daté et centralisé par chantier, consultable à tout moment.',
      },
      {
        question: 'Puis-je utiliser Cantia avec Bexio ?',
        answer: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio, dès le plan Équipe.',
      },
    ],
    relatedBlogSlugs: ['gestion-chantier-devis-couvreur-toiture-suisse'],
    relatedTrades: ['charpentier', 'etancheur'],
  },

  chauffagiste: {
    slug: 'chauffagiste',
    tradeName: 'chauffagiste',
    seo: {
      title: 'Logiciel de gestion pour chauffagistes en Suisse | Cantia',
      description:
        'Suivez installations, interventions et équipes avec Cantia, le logiciel de gestion conçu pour les entreprises de chauffage en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour chauffagistes',
      title: 'Installation, dépannage ou entretien : chaque intervention reste tracée',
      subtitle:
        'Cantia aide les entreprises de chauffage à organiser entretiens et dépannages, suivre le matériel utilisé et facturer rapidement.',
    },
    painPoints: [
      {
        problem: 'Entretiens récurrents et dépannages ponctuels se mélangent dans le planning',
        consequence: 'Un rendez-vous d\'entretien annuel peut être oublié au milieu des urgences.',
        response: 'Un planning central qui distingue clairement interventions planifiées et urgences.',
      },
      {
        problem: 'Les pièces changées sur une installation ne sont pas toujours notées',
        consequence: 'En cas de nouvelle panne, impossible de savoir rapidement ce qui a déjà été remplacé.',
        response: 'Chaque intervention est documentée avec le matériel utilisé, liée à l\'installation du client.',
      },
      {
        problem: 'Une intervention terminée n\'est pas facturée tout de suite',
        consequence: 'L\'administratif s\'accumule et retarde la trésorerie de l\'entreprise.',
        response: 'Facturez directement depuis l\'intervention, avec QR-facture suisse prête à envoyer.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planning entretien + dépannage', text: 'Distinguez interventions planifiées et urgences dans un seul planning.' },
      { icon: 'users', title: 'Historique par installation', text: 'Retrouvez ce qui a été fait et changé sur chaque installation client.' },
      { icon: 'mic', title: 'Devis rapides', text: 'Chiffrez une intervention ou un remplacement depuis votre catalogue.' },
      { icon: 'credit-card', title: 'Facturation immédiate', text: 'Facture QR-suisse générée directement depuis l\'intervention.' },
      { icon: 'file-text', title: 'Rapports d\'intervention', text: 'Documentez chaque passage avec photos et remarques.' },
      { icon: 'clock', title: 'Heures par intervention', text: 'Suivez le temps réellement passé sur chaque installation.' },
    ],
    scenario: {
      title: 'Exemple : une saison de contrôles chaudière avec dépannages ponctuels',
      text: 'Le planning des contrôles annuels est organisé à l\'avance. Une urgence de chauffage s\'ajoute en cours de semaine, réorganisée en quelques secondes. Chaque intervention est documentée avec le matériel utilisé, et la facture part dès la fin du passage.',
    },
    comparison: [
      { before: 'Entretiens et dépannages mélangés sans distinction', after: 'Planning qui distingue les deux' },
      { before: 'Pièces changées non notées', after: 'Matériel utilisé documenté par intervention' },
      { before: 'Facture envoyée après coup', after: 'Facture créée depuis l\'intervention' },
      { before: 'Historique d\'installation retenu de mémoire', after: 'Historique centralisé par client' },
      { before: 'Heures non suivies par intervention', after: 'Heures rattachées à chaque passage' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de chauffage avec plusieurs techniciens ?',
        answer: 'Oui, le planning d\'équipe et les rôles personnalisés permettent de coordonner plusieurs techniciens sur des interventions différentes.',
      },
      {
        question: 'Peut-on distinguer entretiens planifiés et dépannages urgents dans le planning ?',
        answer: 'Oui, les deux vivent dans le même planning, réorganisable rapidement quand une urgence s\'ajoute.',
      },
      {
        question: 'Puis-je documenter les pièces changées lors d\'une intervention ?',
        answer: 'Oui, chaque intervention garde une remarque sur le matériel utilisé, liée à l\'installation du client.',
      },
      {
        question: 'Cantia permet-il de facturer rapidement après un dépannage ?',
        answer: 'Oui, une facture avec QR-facture suisse peut être générée directement depuis l\'intervention.',
      },
      {
        question: 'Puis-je utiliser Cantia avec Bexio ?',
        answer: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio, dès le plan Équipe.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-chauffagiste-cvc-suisse'],
    relatedTrades: ['electricien', 'plombier'],
  },

  carreleur: {
    slug: 'carreleur',
    tradeName: 'carreleur',
    seo: {
      title: 'Logiciel de gestion pour carreleurs en Suisse | Cantia',
      description:
        'Suivez surfaces, matériaux et temps de pose avec Cantia, le logiciel de gestion conçu pour les entreprises de carrelage en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour carreleurs',
      title: 'Chaque mètre carré compte. Vos heures aussi.',
      subtitle:
        'Cantia aide les entreprises de carrelage à chiffrer leurs surfaces rapidement et à savoir ce qu\'un chantier de pose leur rapporte réellement.',
    },
    painPoints: [
      {
        problem: 'Les surfaces sont recalculées à la main à chaque devis',
        consequence: 'Perte de temps et risque d\'erreur sur des calculs pourtant répétitifs d\'un chantier à l\'autre.',
        response: 'Le métré est intégré au devis, avec un calcul automatique par pièce ou par zone.',
      },
      {
        problem: 'Une variante de carrelage est demandée en cours de chantier',
        consequence: 'Difficile à chiffrer et à faire valider rapidement sur place.',
        response: 'Ajustez le devis directement depuis le catalogue, les travaux supplémentaires suivis séparément.',
      },
      {
        problem: 'Le temps de pose réel n\'est jamais comparé au devis',
        consequence: 'Impossible de savoir si un chantier a vraiment été rentable, même quand le devis a été bien vendu.',
        response: 'Rattachez les heures au chantier et comparez-les au montant devisé.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis avec métré de surfaces', text: 'Chiffrez rapidement à partir des surfaces mesurées sur place.' },
      { icon: 'list', title: 'Catalogue de matériaux', text: 'Vos prestations et matériaux habituels mémorisés et réutilisables.' },
      { icon: 'clock', title: 'Suivi des heures de pose', text: 'Comparez le temps prévu au temps réellement passé, chantier par chantier.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Gardez une preuve visuelle de chaque chantier terminé.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Une variante demandée en cours de chantier s\'ajoute directement.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend automatiquement les prestations validées.' },
    ],
    scenario: {
      title: 'Exemple : une pose de carrelage avec variante en cours de chantier',
      text: 'Le métré des surfaces alimente un devis préparé avec le catalogue. Le chantier est planifié. Le client change de carrelage pour une pièce en cours de travaux, ajusté en travaux supplémentaires. La facture finale reprend l\'ensemble des prestations réellement posées.',
    },
    comparison: [
      { before: 'Surfaces recalculées à la main', after: 'Métré intégré au devis' },
      { before: 'Variante de carrelage difficile à chiffrer sur place', after: 'Ajustement rapide depuis le catalogue' },
      { before: 'Temps de pose jamais comparé au devis', after: 'Heures suivies et comparées au devisé' },
      { before: 'Photos de pose dispersées', after: 'Photos classées par chantier' },
      { before: 'Devis refait à chaque nouveau chantier', after: 'Catalogue de prestations réutilisable' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à un carreleur indépendant ou en petite équipe ?',
        answer: 'Oui, le plan Essentiel couvre devis, catalogue et facturation pour un carreleur qui travaille seul ou en petite équipe.',
      },
      {
        question: 'Puis-je intégrer un métré de surfaces directement dans le devis ?',
        answer: 'Oui, le métré alimente directement le devis, avec un calcul automatique par pièce ou par zone.',
      },
      {
        question: 'Comment gérer une variante de carrelage demandée en cours de chantier ?',
        answer: 'Elle s\'ajoute directement dans le devis à partir du catalogue et du métré, sans repartir de zéro.',
      },
      {
        question: 'Cantia permet-il de comparer le temps de pose réel au devis ?',
        answer: 'Oui, les heures saisies par chantier sont comparées au montant devisé.',
      },
      {
        question: 'Puis-je ajouter des photos avant/après pour chaque chantier ?',
        answer: 'Oui, les photos sont classées automatiquement par chantier.',
      },
    ],
    relatedBlogSlugs: ['devis-carreleur-facturation-au-m2-suisse'],
    relatedTrades: ['peintre', 'platrier'],
  },

  platrier: {
    slug: 'platrier',
    tradeName: 'plâtrier-plaquiste',
    seo: {
      title: 'Logiciel de gestion pour plâtriers-plaquistes en Suisse | Cantia',
      description:
        'Suivez métrés, prestations et heures par chantier avec Cantia, le logiciel de gestion conçu pour les entreprises de plâtrerie en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour plâtriers-plaquistes',
      title: 'Du métré à la facture, gardez la maîtrise de vos travaux',
      subtitle:
        'Cantia aide les entreprises de plâtrerie et cloisons sèches à chiffrer leurs métrés, suivre les modifications de chantier et coordonner leurs équipes.',
    },
    painPoints: [
      {
        problem: 'Les métrés de cloisons et faux-plafonds sont recalculés à chaque devis',
        consequence: 'Perte de temps sur des calculs répétitifs d\'un chantier à l\'autre.',
        response: 'Le métré est intégré au devis, avec un catalogue de prestations réutilisable.',
      },
      {
        problem: 'Une modification de cloisonnement est décidée en cours de chantier',
        consequence: 'Le surcoût est difficile à faire valider et à facturer ensuite sans trace claire.',
        response: 'Le travail supplémentaire s\'ajoute directement au chantier, repris dans la facture.',
      },
      {
        problem: 'Plusieurs chantiers en parallèle, en coordination avec d\'autres corps de métier',
        consequence: 'Difficile de savoir qui intervient quand sans planning partagé.',
        response: 'Un planning centralisé, visible par toute l\'équipe et les intervenants du chantier.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis avec métré', text: 'Chiffrez cloisons et faux-plafonds depuis un catalogue de prestations réutilisable.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Une modification de cloisonnement s\'ajoute directement au chantier.' },
      { icon: 'clock', title: 'Suivi des heures', text: 'Comparez le temps prévu au temps réellement passé, par chantier.' },
      { icon: 'calendar', title: 'Planning multi-chantiers', text: 'Coordonnez vos interventions avec les autres corps de métier.' },
      { icon: 'image', title: 'Photos de chantier', text: 'Documentez l\'avancement de vos travaux.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend automatiquement les prestations réalisées.' },
    ],
    scenario: {
      title: 'Exemple : un chantier de cloisons avec modification en cours de travaux',
      text: 'Le métré initial alimente le devis. Le chantier est planifié en coordination avec les autres corps de métier. Une modification de cloisonnement demandée en cours de travaux est ajoutée en travaux supplémentaires. La facture finale reprend l\'ensemble des prestations exécutées.',
    },
    comparison: [
      { before: 'Métrés recalculés à chaque devis', after: 'Métré intégré et catalogue réutilisable' },
      { before: 'Modification de cloisonnement non tracée', after: 'Travaux supplémentaires ajoutés au chantier' },
      { before: 'Coordination avec d\'autres corps de métier par appels', after: 'Planning partagé et centralisé' },
      { before: 'Heures non suivies par chantier', after: 'Heures rattachées à chaque chantier' },
      { before: 'Facture reconstituée après coup', after: 'Facture générée depuis le devis' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de plâtrerie ou de cloisons sèches ?',
        answer: 'Oui, le plan Essentiel couvre devis, chantiers et facturation pour une entreprise qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Puis-je intégrer un métré de cloisons ou de faux-plafonds au devis ?',
        answer: 'Oui, le métré alimente directement le devis, avec un catalogue de prestations réutilisable.',
      },
      {
        question: 'Comment ajouter une modification décidée en cours de chantier ?',
        answer: 'Elle s\'ajoute directement au chantier concerné, avec une remarque, reprise dans la facturation.',
      },
      {
        question: 'Cantia permet-il de coordonner mon planning avec d\'autres corps de métier ?',
        answer: 'Oui, le planning est partagé et centralisé, visible par toute l\'équipe du chantier.',
      },
      {
        question: 'Puis-je suivre mes heures de pose par chantier ?',
        answer: 'Oui, chaque heure saisie est rattachée à un chantier précis.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['carreleur', 'menuisier'],
  },

  'genie-civil': {
    slug: 'genie-civil',
    tradeName: 'génie civil',
    seo: {
      title: 'Logiciel de gestion pour entreprises de génie civil | Cantia',
      description:
        'Pilotez plusieurs équipes et chantiers avec une vraie vision financière, avec Cantia, le logiciel de gestion pour le génie civil en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour le génie civil',
      title: 'Vos équipes sur le terrain. Vos chiffres sous contrôle.',
      subtitle:
        'Cantia aide les entreprises de génie civil à coordonner plusieurs équipes et chantiers tout en suivant dépenses et rentabilité en direct.',
    },
    painPoints: [
      {
        problem: 'Plusieurs équipes sur plusieurs chantiers de grande ampleur',
        consequence: 'La coordination devient vite complexe sans vue centralisée sur l\'ensemble des chantiers.',
        response: 'Un planning multi-chantiers et multi-équipes centralisé, consultable par toute l\'organisation.',
      },
      {
        problem: 'Les dépenses de chantier (matériaux, location de machines, sous-traitance) sont difficiles à suivre en temps réel',
        consequence: 'La rentabilité réelle n\'est connue qu\'après coup, parfois trop tard pour réagir.',
        response: 'Rattachez les dépenses au chantier concerné et comparez-les au devisé en continu.',
      },
      {
        problem: 'Les rapports de chantier et les preuves photographiques sont dispersés entre plusieurs intervenants',
        consequence: 'En cas de litige ou de suivi de chantier, l\'information est difficile à reconstituer.',
        response: 'Chaque chantier centralise ses rapports, photos et documents, accessibles à toute l\'équipe.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planning multi-équipes', text: 'Coordonnez plusieurs équipes sur plusieurs chantiers en parallèle.' },
      { icon: 'dollar-sign', title: 'Suivi des dépenses', text: 'Matériaux, machines et sous-traitance rattachés au bon chantier.' },
      { icon: 'trending-up', title: 'Rentabilité en direct', text: 'Comparez devisé et coût réel chantier par chantier, en continu.' },
      { icon: 'file-text', title: 'Rapports de chantier', text: 'Photos et notes deviennent un rapport prêt à envoyer.' },
      { icon: 'folder', title: 'Documents centralisés', text: 'Plans, contrats et autorisations classés par chantier.' },
      { icon: 'clock', title: 'Heures par chantier', text: 'Suivez la main-d\'œuvre de chaque équipe, chantier par chantier.' },
    ],
    scenario: {
      title: 'Exemple : un chantier de génie civil avec plusieurs équipes et sous-traitants',
      text: 'Le planning coordonne équipes internes et sous-traitants sur le même chantier. Dépenses et heures sont suivies au jour le jour. La rentabilité reste visible en continu, et rapports comme photos sont centralisés pour l\'ensemble du chantier.',
    },
    comparison: [
      { before: 'Plusieurs équipes, aucune vue centralisée', after: 'Planning multi-équipes centralisé' },
      { before: 'Dépenses suivies après coup', after: 'Dépenses rattachées au chantier en continu' },
      { before: 'Rentabilité connue en fin de chantier', after: 'Rentabilité suivie en direct' },
      { before: 'Rapports et photos dispersés entre intervenants', after: 'Tout centralisé par chantier' },
      { before: 'Documents éparpillés entre plusieurs outils', after: 'Classeur numérique par chantier' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de génie civil gérant plusieurs chantiers de grande ampleur ?',
        answer: 'Oui, le planning multi-chantiers et le suivi de rentabilité par chantier sont pensés pour ce cas d\'usage.',
      },
      {
        question: 'Peut-on suivre les dépenses de chantier (matériaux, machines, sous-traitance) en temps réel ?',
        answer: 'Oui, chaque dépense est rattachée au chantier concerné et comparée au montant devisé en continu.',
      },
      {
        question: 'Cantia permet-il de comparer la rentabilité de plusieurs chantiers en parallèle ?',
        answer: 'Oui, chaque chantier affiche sa propre marge, comparable entre projets.',
      },
      {
        question: 'Peut-on centraliser rapports et photos de plusieurs équipes sur un même chantier ?',
        answer: 'Oui, tout reste classé et daté par chantier, accessible à toute l\'équipe.',
      },
      {
        question: 'Cantia s\'intègre-t-il avec Bexio pour la comptabilité ?',
        answer: 'Oui, l\'intégration native synchronise clients, factures et paiements entre Cantia et Bexio, dès le plan Équipe.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['entreprise-generale', 'terrassier'],
  },

  terrassier: {
    slug: 'terrassier',
    tradeName: 'terrassier',
    seo: {
      title: 'Logiciel de gestion pour entreprises de terrassement | Cantia',
      description:
        'Suivez machines, équipes, heures et travaux supplémentaires avec Cantia, le logiciel de gestion pour les entreprises de terrassement en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour terrassiers',
      title: 'Sachez ce que chaque chantier vous coûte avant qu\'il soit terminé',
      subtitle:
        'Cantia aide les entreprises de terrassement à suivre le coût réel de leurs machines, équipes et imprévus de terrain, chantier par chantier.',
    },
    painPoints: [
      {
        problem: 'Le coût réel des machines et du carburant n\'est pas suivi précisément par chantier',
        consequence: 'La rentabilité d\'un chantier de terrassement peut sembler bonne sur le papier et être mauvaise en réalité.',
        response: 'Rattachez les dépenses de machines et de carburant au chantier, comparées au devisé.',
      },
      {
        problem: 'Un imprévu de terrain (roche, réseau enterré) change l\'ampleur du chantier',
        consequence: 'Sans document clair, le surcoût est difficile à justifier au client.',
        response: 'Ajoutez le travail supplémentaire en direct avec une photo, repris dans la facturation.',
      },
      {
        problem: 'Les heures de plusieurs collaborateurs et machines sont difficiles à répartir par chantier',
        consequence: 'Impossible de savoir précisément ce qu\'a coûté un chantier en main-d\'œuvre.',
        response: 'Rattachez les heures au chantier, par collaborateur.',
      },
    ],
    usages: [
      { icon: 'dollar-sign', title: 'Suivi des dépenses', text: 'Machines et carburant rattachés au bon chantier.' },
      { icon: 'clock', title: 'Heures par collaborateur', text: 'Chaque personne, chaque chantier, chaque heure suivie.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Un imprévu de terrain s\'ajoute directement, avec photo.' },
      { icon: 'trending-up', title: 'Rentabilité en direct', text: 'Comparez devisé et coût réel pendant le chantier, pas après.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Documentez l\'état du terrain avant et après terrassement.' },
      { icon: 'credit-card', title: 'Devis et factures', text: 'Du devis initial à la facture finale, sans ressaisie.' },
    ],
    scenario: {
      title: 'Exemple : un chantier de terrassement avec imprévu de terrain',
      text: 'Le devis initial est basé sur le métré. Une roche imprévue complique le terrassement et ajoute des heures de machine, documentée en travaux supplémentaires avec photo. La rentabilité du chantier reste suivie tout du long, malgré l\'imprévu.',
    },
    comparison: [
      { before: 'Coût des machines et du carburant non suivi par chantier', after: 'Dépenses rattachées au chantier' },
      { before: 'Imprévu de terrain non documenté', after: 'Travaux supplémentaires ajoutés avec photo' },
      { before: 'Heures de plusieurs collaborateurs difficiles à répartir', after: 'Heures rattachées au chantier et à la personne' },
      { before: 'Rentabilité connue à la fin seulement', after: 'Rentabilité suivie en direct' },
      { before: 'Photos de terrassement dispersées', after: 'Photos classées par chantier' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de terrassement ?',
        answer: 'Oui, le plan Essentiel couvre devis, chantiers et facturation pour une entreprise qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Peut-on suivre le coût des machines et du carburant par chantier ?',
        answer: 'Oui, chaque dépense est rattachée au chantier concerné et comparée au montant devisé.',
      },
      {
        question: 'Comment documenter un imprévu de terrain découvert en cours de chantier ?',
        answer: 'Il s\'ajoute directement au chantier avec une photo, puis suit le même circuit qu\'un devis jusqu\'à la facturation.',
      },
      {
        question: 'Cantia permet-il de connaître la rentabilité d\'un chantier avant sa fin ?',
        answer: 'Oui, la comparaison entre montant devisé et coût réel est disponible en continu.',
      },
      {
        question: 'Puis-je suivre les heures de plusieurs collaborateurs par chantier ?',
        answer: 'Oui, chaque heure saisie est rattachée à un chantier et à la personne concernée.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['genie-civil', 'entreprise-renovation'],
  },

  'entreprise-renovation': {
    slug: 'entreprise-renovation',
    tradeName: 'entreprise de rénovation',
    seo: {
      title: 'Logiciel de gestion pour entreprises de rénovation | Cantia',
      description:
        'Gérez vos chantiers de rénovation, imprévus compris, avec Cantia, le logiciel de gestion pour les entreprises du bâtiment en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour la rénovation',
      title: 'En rénovation, les imprévus sont normaux. Les oublis de facturation ne devraient pas l\'être.',
      subtitle:
        'Cantia aide les entreprises de rénovation à tracer chaque changement de dernière minute, jusqu\'à la facture finale.',
    },
    painPoints: [
      {
        problem: 'Le client change d\'avis en cours de chantier',
        consequence: 'Une modification orale, sans trace, finit souvent non facturée.',
        response: 'Chaque modification s\'ajoute au chantier comme un travail supplémentaire, chiffré et tracé.',
      },
      {
        problem: 'Une surprise derrière un mur change l\'ampleur des travaux',
        consequence: 'Le surcoût est difficile à justifier sans preuve visuelle au moment de la découverte.',
        response: 'Une photo prise sur place, liée au chantier, accompagne chaque travail supplémentaire.',
      },
      {
        problem: 'Plusieurs corps de métier interviennent, les dates changent sans arrêt',
        consequence: 'Le planning initial ne reflète plus la réalité du chantier au bout de quelques semaines.',
        response: 'Le planning est mis à jour en continu, visible par toute l\'équipe et les sous-traitants.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis de rénovation', text: 'Chiffrez à partir du métré pris lors de la visite.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Imprévus et changements client documentés et facturés.' },
      { icon: 'image', title: 'Photos avant/pendant/après', text: 'Chaque découverte et chaque étape restent tracées.' },
      { icon: 'calendar', title: 'Planning ajustable', text: 'Réorganisez facilement quand les dates changent.' },
      { icon: 'users', title: 'Coordination des sous-traitants', text: 'Suivez plusieurs corps de métier sur le même chantier.' },
      { icon: 'credit-card', title: 'Facturation progressive', text: 'Facturez au fil du chantier, sans attendre la toute fin.' },
    ],
    scenario: {
      title: 'Exemple : une rénovation d\'appartement avec plusieurs imprévus',
      text: 'Le devis initial est basé sur la visite. Le chantier démarre avec plusieurs corps de métier. Une surprise derrière un mur, puis un changement d\'avis du client, s\'ajoutent en travaux supplémentaires documentés. Le planning est réajusté en continu, et la facture finale reprend l\'ensemble des travaux réellement exécutés.',
    },
    comparison: [
      { before: 'Changement d\'avis du client non tracé', after: 'Travail supplémentaire chiffré et enregistré' },
      { before: 'Surprise derrière un mur sans preuve', after: 'Photo liée au chantier au moment de la découverte' },
      { before: 'Planning figé qui ne reflète plus la réalité', after: 'Planning ajusté en continu' },
      { before: 'Plusieurs corps de métier coordonnés par appels', after: 'Coordination centralisée et partagée' },
      { before: 'Facture reconstituée de mémoire en fin de chantier', after: 'Facture qui reprend chaque travail supplémentaire documenté' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise spécialisée en rénovation ?',
        answer: 'Oui, le suivi des travaux supplémentaires et l\'ajustement de planning répondent directement aux imprévus fréquents en rénovation.',
      },
      {
        question: 'Comment tracer un changement d\'avis du client en cours de chantier ?',
        answer: 'Il s\'ajoute comme un travail supplémentaire chiffré, avec une remarque, repris dans la facturation.',
      },
      {
        question: 'Puis-je documenter une surprise découverte derrière un mur avec une photo ?',
        answer: 'Oui, la photo se lie directement au chantier au moment de la découverte.',
      },
      {
        question: 'Cantia permet-il d\'ajuster le planning quand les dates changent souvent ?',
        answer: 'Oui, le planning est mis à jour en continu et reste visible par toute l\'équipe et les sous-traitants.',
      },
      {
        question: 'Comment coordonner plusieurs corps de métier sur un même chantier de rénovation ?',
        answer: 'Le chantier centralise documents, planning et sous-traitants, consultables par tous les intervenants.',
      },
    ],
    relatedBlogSlugs: ['calculer-prix-devis-renovation-suisse'],
    relatedTrades: ['entreprise-generale', 'macon'],
  },

  serrurier: {
    slug: 'serrurier',
    tradeName: 'serrurier',
    seo: {
      title: 'Logiciel de gestion pour serruriers en Suisse | Cantia',
      description:
        'Suivez fabrication, pose et modifications avec Cantia, le logiciel de gestion pour les entreprises de serrurerie et construction métallique.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour serruriers',
      title: 'Atelier, chantier, pose : chaque information suit le projet',
      subtitle:
        'Cantia aide les entreprises de serrurerie et de construction métallique à suivre leurs commandes, de la mesure jusqu\'à la pose.',
    },
    painPoints: [
      {
        problem: 'Une prise de mesure en atelier et une pose sur chantier, parfois à des semaines d\'écart',
        consequence: 'Les informations se perdent entre les deux étapes si rien ne les relie.',
        response: 'Le chantier centralise mesures et remarques, liées au projet du début à la fin.',
      },
      {
        problem: 'Une modification est demandée après la fabrication',
        consequence: 'Risque d\'erreur ou de reprise coûteuse si l\'information n\'arrive pas à temps à l\'atelier.',
        response: 'La modification est ajoutée directement au chantier, visible par l\'atelier avant la pose.',
      },
      {
        problem: 'Le statut d\'une commande (mesure, fabrication, pose) n\'est pas toujours clair',
        consequence: 'Le patron doit être sollicité pour savoir où en est chaque projet.',
        response: 'Statut et planning sont partagés entre atelier et équipe de pose.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis depuis les mesures', text: 'Chiffrez directement à partir des mesures prises sur site.' },
      { icon: 'file-text', title: 'Suivi de commande', text: 'Mesure, fabrication et pose suivies dans le même chantier.' },
      { icon: 'calendar', title: 'Planning atelier et pose', text: 'Coordonnez fabrication et installation sans appel intermédiaire.' },
      { icon: 'image', title: 'Photos de fabrication et pose', text: 'Documentez chaque étape, de l\'atelier jusqu\'au chantier.' },
      { icon: 'plus-circle', title: 'Modifications', text: 'Une demande de dernière minute s\'ajoute directement au projet.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend la commande validée, sans ressaisie.' },
    ],
    scenario: {
      title: 'Exemple : une commande de garde-corps métallique, de la mesure à la pose',
      text: 'La mesure prise sur site alimente le devis. La fabrication est suivie en atelier. Une modification de finition demandée par le client est ajoutée directement au chantier. La pose est planifiée et documentée en photos, puis la facture est générée depuis le devis initial.',
    },
    comparison: [
      { before: 'Mesures et fabrication suivies séparément', after: 'Chantier centralisé du début à la fin' },
      { before: 'Modification après fabrication mal transmise', after: 'Modification ajoutée directement au chantier' },
      { before: 'Statut de commande connu seulement du patron', after: 'Statut partagé entre atelier et pose' },
      { before: 'Photos de fabrication et pose dispersées', after: 'Photos classées par chantier' },
      { before: 'Devis refait à chaque nouvelle commande', after: 'Catalogue de prestations réutilisable' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de serrurerie ou de construction métallique ?',
        answer: 'Oui, le suivi de commande de la mesure à la pose répond directement à ce fonctionnement en plusieurs étapes.',
      },
      {
        question: 'Comment suivre une commande de la prise de mesure jusqu\'à la pose ?',
        answer: 'Le chantier centralise mesures, statut de fabrication et planning de pose au même endroit.',
      },
      {
        question: 'Que se passe-t-il si le client demande une modification après la fabrication ?',
        answer: 'Elle s\'ajoute directement au chantier, visible par l\'atelier avant la pose.',
      },
      {
        question: 'Peut-on coordonner atelier et équipe de pose avec Cantia ?',
        answer: 'Oui, le statut de chaque commande est partagé entre les deux.',
      },
      {
        question: 'Cantia permet-il de faire des devis avec des prestations sur mesure ?',
        answer: 'Oui, un catalogue réutilisable accélère le chiffrage tout en laissant place à des lignes spécifiques.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-serrurier-metallier-suisse'],
    relatedTrades: ['menuisier', 'construction-bois'],
  },

  ferblantier: {
    slug: 'ferblantier',
    tradeName: 'ferblantier',
    seo: {
      title: 'Logiciel de gestion pour ferblantiers en Suisse | Cantia',
      description:
        'Gérez devis, mesures et interventions spécifiques avec Cantia, le logiciel de gestion pour les entreprises de ferblanterie en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour ferblantiers',
      title: 'Vos mesures, travaux et factures au même endroit',
      subtitle:
        'Cantia aide les entreprises de ferblanterie à suivre leurs interventions, souvent ponctuelles, sans perdre une seule mesure en route.',
    },
    painPoints: [
      {
        problem: 'Les interventions de ferblanterie sont souvent ponctuelles et liées à d\'autres corps de métier',
        consequence: 'Difficile de garder une vue claire de chaque intervention sans support centralisé.',
        response: 'Chaque intervention devient un chantier avec ses propres mesures et documents.',
      },
      {
        problem: 'Les mesures prises sur place (gouttières, chéneaux, habillages) doivent rester précises jusqu\'à la facturation',
        consequence: 'Une mesure notée à la main peut se perdre ou être mal reprise plus tard.',
        response: 'Mesures et remarques liées directement au chantier, consultables à tout moment.',
      },
      {
        problem: 'Une intervention terminée n\'est pas facturée rapidement',
        consequence: 'L\'administratif s\'accumule entre plusieurs petits chantiers.',
        response: 'Facturation générée depuis le devis, dès la fin de l\'intervention.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis depuis les mesures', text: 'Chiffrez directement à partir des mesures prises sur place.' },
      { icon: 'file-text', title: 'Suivi d\'intervention', text: 'Chaque intervention devient un chantier suivi.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Documentez chaque intervention, même ponctuelle.' },
      { icon: 'users', title: 'Coordination', text: 'Travaillez en lien avec d\'autres corps de métier (toiture, façade).' },
      { icon: 'credit-card', title: 'Facturation rapide', text: 'Facturez dès la fin de l\'intervention.' },
      { icon: 'list', title: 'Catalogue de prestations', text: 'Vos prestations habituelles mémorisées et réutilisables.' },
    ],
    scenario: {
      title: 'Exemple : une réfection de gouttières après un diagnostic de toiture',
      text: 'Les mesures sont prises sur place. Le devis est préparé avec le catalogue de prestations. L\'intervention est documentée en photos. La facture est générée dès la fin des travaux.',
    },
    comparison: [
      { before: 'Mesures notées à la main', after: 'Mesures liées directement au chantier' },
      { before: 'Interventions ponctuelles mal centralisées', after: 'Chaque intervention devient un chantier suivi' },
      { before: 'Facture envoyée après coup', after: 'Facture générée depuis le devis' },
      { before: 'Coordination avec d\'autres corps de métier par appels', after: 'Chantier partagé et consultable' },
      { before: 'Photos d\'intervention dispersées', after: 'Photos classées par chantier' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de ferblanterie ?',
        answer: 'Oui, le plan Essentiel couvre devis, interventions et facturation pour une entreprise qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Puis-je enregistrer des mesures précises prises sur place ?',
        answer: 'Oui, les mesures et remarques restent liées directement au chantier.',
      },
      {
        question: 'Comment coordonner une intervention avec d\'autres corps de métier (toiture, façade) ?',
        answer: 'Le chantier reste partagé et consultable par tous les intervenants concernés.',
      },
      {
        question: 'Cantia permet-il de facturer rapidement une petite intervention ?',
        answer: 'Oui, une facture peut être générée depuis le devis dès la fin de l\'intervention.',
      },
      {
        question: 'Puis-je ajouter des photos avant/après pour chaque intervention ?',
        answer: 'Oui, les photos sont classées automatiquement par chantier.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'etancheur'],
  },

  facadier: {
    slug: 'facadier',
    tradeName: 'façadier',
    seo: {
      title: 'Logiciel de gestion pour façadiers en Suisse | Cantia',
      description:
        'Suivez surfaces, variantes et avancement avec Cantia, le logiciel de gestion pour les entreprises de façade en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour façadiers',
      title: 'Gardez une vue claire de chaque façade, de l\'offre à la réception',
      subtitle:
        'Cantia aide les entreprises de façade à chiffrer leurs surfaces, gérer les variantes de teinte et partager l\'avancement du chantier.',
    },
    painPoints: [
      {
        problem: 'Les surfaces de façade sont recalculées à chaque devis',
        consequence: 'Perte de temps sur des métrés répétitifs d\'un chantier à l\'autre.',
        response: 'Le métré de façade est intégré au devis, avec un catalogue de prestations réutilisable.',
      },
      {
        problem: 'Une variante de teinte ou de finition est décidée en cours de chantier',
        consequence: 'Difficile à chiffrer et à faire valider rapidement sur place.',
        response: 'Ajustez le devis directement, les travaux supplémentaires suivis séparément.',
      },
      {
        problem: 'L\'avancement d\'un chantier de façade est difficile à communiquer au client',
        consequence: 'Le client s\'inquiète ou relance sans visibilité claire sur le chantier.',
        response: 'Des photos d\'avancement liées au chantier, consultables à tout moment.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis avec métré de façade', text: 'Chiffrez rapidement à partir des surfaces mesurées.' },
      { icon: 'list', title: 'Catalogue de teintes', text: 'Vos prestations et teintes habituelles mémorisées.' },
      { icon: 'image', title: 'Photos d\'avancement', text: 'Partagez l\'état du chantier à chaque étape.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Une variante décidée en cours de chantier s\'ajoute directement.' },
      { icon: 'calendar', title: 'Planning d\'équipe', text: 'Organisez vos équipes sur plusieurs chantiers de façade.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend les prestations réellement réalisées.' },
    ],
    scenario: {
      title: 'Exemple : une rénovation de façade avec variante de teinte',
      text: 'Le métré initial alimente le devis. Le chantier est planifié avec des photos d\'avancement régulières. Une variante de teinte demandée en cours de travaux est ajoutée en travaux supplémentaires. La facture finale reprend l\'ensemble.',
    },
    comparison: [
      { before: 'Surfaces de façade recalculées à chaque devis', after: 'Métré intégré et catalogue réutilisable' },
      { before: 'Variante de teinte difficile à chiffrer sur place', after: 'Ajustement rapide depuis le catalogue' },
      { before: 'Avancement du chantier peu visible pour le client', after: 'Photos d\'avancement liées au chantier' },
      { before: 'Devis refait à chaque nouveau chantier', after: 'Catalogue de prestations réutilisable' },
      { before: 'Facture reconstituée en fin de chantier', after: 'Facture générée depuis le devis' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de façade ?',
        answer: 'Oui, le plan Essentiel couvre devis, chantiers et facturation pour une entreprise qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Puis-je intégrer un métré de façade directement dans le devis ?',
        answer: 'Oui, le métré alimente directement le devis, avec un catalogue de prestations réutilisable.',
      },
      {
        question: 'Comment gérer une variante de teinte ou de finition demandée en cours de chantier ?',
        answer: 'Elle s\'ajoute directement dans le devis, les travaux supplémentaires suivis séparément.',
      },
      {
        question: 'Cantia permet-il de partager l\'avancement d\'un chantier avec le client ?',
        answer: 'Oui, les photos d\'avancement restent liées au chantier et consultables à tout moment.',
      },
      {
        question: 'Puis-je ajouter des photos à chaque étape du chantier ?',
        answer: 'Oui, classées automatiquement par chantier.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-facadier-isolation-suisse'],
    relatedTrades: ['peintre', 'etancheur'],
  },

  etancheur: {
    slug: 'etancheur',
    tradeName: 'étancheur',
    seo: {
      title: 'Logiciel de gestion pour étancheurs en Suisse | Cantia',
      description:
        'Documentez précisément vos interventions avec Cantia, le logiciel de gestion pour les entreprises d\'étanchéité en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour étancheurs',
      title: 'Photos, rapports et suivi : gardez une trace claire de chaque intervention',
      subtitle:
        'Cantia aide les entreprises d\'étanchéité à documenter précisément chaque zone traitée et à générer leurs rapports automatiquement.',
    },
    painPoints: [
      {
        problem: 'Les zones traitées lors d\'une intervention doivent être documentées précisément',
        consequence: 'Sans preuve claire, une garantie ou un litige devient difficile à traiter.',
        response: 'Des photos géolocalisées liées au chantier, zone par zone.',
      },
      {
        problem: 'Un défaut découvert après coup doit pouvoir être rattaché à l\'intervention d\'origine',
        consequence: 'Sans historique clair, impossible de savoir rapidement ce qui a été fait et où.',
        response: 'Chaque chantier garde son historique complet (photos, remarques, documents).',
      },
      {
        problem: 'Les rapports d\'intervention prennent du temps à rédiger le soir',
        consequence: 'Le temps administratif s\'accumule après une journée déjà chargée.',
        response: 'Le rapport se génère automatiquement depuis les photos et notes prises sur place.',
      },
    ],
    usages: [
      { icon: 'image', title: 'Photos par zone traitée', text: 'Géolocalisées automatiquement, zone par zone.' },
      { icon: 'file-text', title: 'Rapports automatiques', text: 'Générés depuis les photos et notes du chantier.' },
      { icon: 'mic', title: 'Devis d\'étanchéité', text: 'Chiffrez rapidement depuis votre catalogue de prestations.' },
      { icon: 'folder', title: 'Historique complet', text: 'Retrouvez tout ce qui a été fait sur un chantier, à tout moment.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Un défaut découvert en cours d\'intervention s\'ajoute directement.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend les prestations réellement réalisées.' },
    ],
    scenario: {
      title: 'Exemple : une intervention d\'étanchéité de toiture-terrasse',
      text: 'Le diagnostic est photographié. Le devis est préparé. L\'intervention est documentée zone par zone avec des photos géolocalisées. Le rapport se génère automatiquement, et la facture reprend le devis initial.',
    },
    comparison: [
      { before: 'Zones traitées non documentées précisément', after: 'Photos géolocalisées par zone' },
      { before: 'Défaut après coup difficile à rattacher à l\'intervention', after: 'Historique complet par chantier' },
      { before: 'Rapport d\'intervention rédigé le soir', after: 'Rapport généré depuis photos et notes' },
      { before: 'Devis refait à chaque intervention', after: 'Catalogue de prestations réutilisable' },
      { before: 'Facture envoyée après coup', after: 'Facture générée depuis le devis' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise d\'étanchéité ?',
        answer: 'Oui, le plan Essentiel couvre devis, interventions et facturation pour une entreprise qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Puis-je géolocaliser les photos de chaque zone traitée ?',
        answer: 'Oui, chaque photo est géolocalisée automatiquement et liée au chantier.',
      },
      {
        question: 'Comment retrouver l\'historique d\'une intervention en cas de défaut découvert après coup ?',
        answer: 'Chaque chantier garde son historique complet (photos, remarques, documents), consultable à tout moment.',
      },
      {
        question: 'Cantia permet-il de générer un rapport d\'intervention automatiquement ?',
        answer: 'Oui, le rapport se génère depuis les photos et notes prises sur place.',
      },
      {
        question: 'Puis-je ajouter des travaux supplémentaires découverts en cours d\'intervention ?',
        answer: 'Oui, ils s\'ajoutent directement au chantier, repris dans la facturation.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'facadier'],
  },

  'construction-bois': {
    slug: 'construction-bois',
    tradeName: 'construction bois',
    seo: {
      title: 'Logiciel de gestion pour la construction bois en Suisse | Cantia',
      description:
        'Coordonnez préparation, fabrication et pose avec Cantia, le logiciel de gestion pour les entreprises de construction bois en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour la construction bois',
      title: 'Du bureau d\'étude à la pose, gardez chaque étape du projet connectée',
      subtitle:
        'Cantia aide les entreprises de construction bois à suivre leurs projets de l\'étude jusqu\'à la pose, sans perdre d\'information en route.',
    },
    painPoints: [
      {
        problem: 'Un projet de construction bois passe par plusieurs étapes sur plusieurs semaines',
        consequence: 'L\'information se disperse entre chaque étape si rien ne les relie.',
        response: 'Un chantier centralisé, du bureau d\'étude jusqu\'à la pose finale.',
      },
      {
        problem: 'Une modification est décidée après la fabrication en atelier',
        consequence: 'Risque d\'erreur de pose si l\'information n\'arrive pas à temps sur le chantier.',
        response: 'La modification s\'ajoute directement au chantier, visible par toute l\'équipe.',
      },
      {
        problem: 'Le suivi d\'avancement d\'un chantier de plusieurs semaines est difficile à communiquer',
        consequence: 'Le client comme l\'équipe perdent la vue d\'ensemble du projet.',
        response: 'Photos et rapports d\'avancement liés au chantier, consultables à tout moment.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis depuis l\'étude', text: 'Chiffrez votre projet directement après le bureau d\'étude.' },
      { icon: 'file-text', title: 'Suivi de projet', text: 'Étude, fabrication et pose suivies dans le même chantier.' },
      { icon: 'calendar', title: 'Planning atelier et chantier', text: 'Coordonnez fabrication et pose sans appel intermédiaire.' },
      { icon: 'image', title: 'Photos d\'avancement', text: 'Partagez l\'état du projet à chaque étape.' },
      { icon: 'plus-circle', title: 'Modifications', text: 'Une demande de dernière minute s\'ajoute directement au chantier.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend le devis initial, sans ressaisie.' },
    ],
    scenario: {
      title: 'Exemple : une extension en ossature bois, de l\'étude à la pose',
      text: 'Le devis est préparé après l\'étude. La fabrication est suivie en atelier. La pose est planifiée et documentée en photos. Une modification de dernière minute est ajoutée directement au chantier, et la facture est générée depuis le devis initial.',
    },
    comparison: [
      { before: 'Étape d\'étude, fabrication et pose suivies séparément', after: 'Chantier centralisé du début à la fin' },
      { before: 'Modification après fabrication mal transmise', after: 'Modification ajoutée directement au chantier' },
      { before: 'Avancement du projet peu visible', after: 'Photos et rapports d\'avancement liés au chantier' },
      { before: 'Devis refait à chaque nouveau projet', after: 'Catalogue de prestations réutilisable' },
      { before: 'Facture reconstituée en fin de projet', after: 'Facture générée depuis le devis' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de construction bois ?',
        answer: 'Oui, le suivi de projet en plusieurs étapes (étude, fabrication, pose) répond directement à ce fonctionnement.',
      },
      {
        question: 'Comment suivre un projet de l\'étude jusqu\'à la pose ?',
        answer: 'Le chantier centralise chaque étape, avec ses documents et son statut, au même endroit.',
      },
      {
        question: 'Que se passe-t-il si une modification est décidée après la fabrication ?',
        answer: 'Elle s\'ajoute directement au chantier, visible par toute l\'équipe avant la pose.',
      },
      {
        question: 'Cantia permet-il de partager l\'avancement d\'un chantier avec le client ?',
        answer: 'Oui, les photos et rapports d\'avancement restent liés au chantier.',
      },
      {
        question: 'Puis-je coordonner atelier et équipe de pose avec Cantia ?',
        answer: 'Oui, le planning est partagé entre les deux.',
      },
    ],
    relatedBlogSlugs: ['devis-charpente-bois-facturation-suisse'],
    relatedTrades: ['charpentier', 'menuisier'],
  },

  vitrier: {
    slug: 'vitrier',
    tradeName: 'vitrier',
    seo: {
      title: 'Logiciel de gestion pour vitriers en Suisse | Cantia',
      description:
        'Organisez mesures, commandes, poses et interventions avec Cantia, le logiciel de gestion pour les entreprises de vitrerie en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour vitriers',
      title: 'De la prise de mesure à la pose, ne perdez aucune information',
      subtitle:
        'Cantia aide les entreprises de vitrerie à suivre leurs mesures, commandes et interventions, des plus planifiées aux plus urgentes.',
    },
    painPoints: [
      {
        problem: 'Une prise de mesure précise doit rester exacte jusqu\'à la commande et la pose',
        consequence: 'Une erreur de mesure notée à la main peut coûter cher en reprise.',
        response: 'Les mesures restent liées directement au chantier, consultables à chaque étape.',
      },
      {
        problem: 'Les commandes de vitrage prennent parfois plusieurs semaines de délai',
        consequence: 'Sans suivi clair, difficile de savoir où en est chaque commande.',
        response: 'Le statut de commande est suivi par chantier, visible par toute l\'équipe.',
      },
      {
        problem: 'Une intervention de dépannage (bris de glace) doit être traitée rapidement',
        consequence: 'Sans centralisation, l\'urgence se gère dans la précipitation, au risque d\'oublier la facturation.',
        response: 'L\'intervention est enregistrée et facturée directement depuis le chantier.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis depuis les mesures', text: 'Chiffrez directement à partir des mesures prises sur place.' },
      { icon: 'file-text', title: 'Suivi de commande', text: 'Statut de commande suivi par chantier, jusqu\'à la pose.' },
      { icon: 'calendar', title: 'Planning de pose', text: 'Organisez vos poses dès réception du vitrage.' },
      { icon: 'zap', title: 'Interventions urgentes', text: 'Un bris de glace enregistré et facturé rapidement.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Documentez chaque intervention.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend la commande validée.' },
    ],
    scenario: {
      title: 'Exemple : un remplacement de vitrage après un bris de glace',
      text: 'L\'intervention d\'urgence est enregistrée. La mesure est prise sur place, le devis préparé et la commande suivie. La pose est planifiée dès réception, et la facture est générée depuis le devis.',
    },
    comparison: [
      { before: 'Mesures notées à la main', after: 'Mesures liées directement au chantier' },
      { before: 'Statut de commande su seulement du patron', after: 'Statut suivi et partagé' },
      { before: 'Dépannage géré dans la précipitation', after: 'Intervention enregistrée et facturée directement' },
      { before: 'Photos avant/après dispersées', after: 'Photos classées par chantier' },
      { before: 'Devis refait à chaque intervention', after: 'Catalogue de prestations réutilisable' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de vitrerie ?',
        answer: 'Oui, le plan Essentiel couvre devis, interventions et facturation pour une entreprise qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Puis-je enregistrer des mesures précises prises sur place ?',
        answer: 'Oui, les mesures restent liées directement au chantier.',
      },
      {
        question: 'Comment suivre le statut d\'une commande de vitrage en cours de délai ?',
        answer: 'Le statut de commande est suivi par chantier et visible par toute l\'équipe.',
      },
      {
        question: 'Cantia permet-il de gérer une intervention de dépannage urgente ?',
        answer: 'Oui, l\'intervention peut être enregistrée et facturée directement depuis le chantier.',
      },
      {
        question: 'Puis-je facturer rapidement après un remplacement de vitrage ?',
        answer: 'Oui, une facture peut être générée depuis le devis dès la fin de la pose.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['menuisier', 'serrurier'],
  },

  parqueteur: {
    slug: 'parqueteur',
    tradeName: 'solier-parqueteur',
    seo: {
      title: 'Logiciel de gestion pour soliers-parqueteurs en Suisse | Cantia',
      description:
        'Suivez surfaces, matériaux, équipes et temps de pose avec Cantia, le logiciel de gestion pour les entreprises de pose de sols en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour soliers-parqueteurs',
      title: 'Vos surfaces sont calculées. Vos marges doivent l\'être aussi.',
      subtitle:
        'Cantia aide les entreprises de pose de sols à chiffrer leurs surfaces rapidement et à savoir ce qu\'un chantier de pose leur rapporte réellement.',
    },
    painPoints: [
      {
        problem: 'Les surfaces de sol sont recalculées à chaque devis',
        consequence: 'Perte de temps sur des métrés répétitifs d\'un chantier à l\'autre.',
        response: 'Le métré de surfaces est intégré au devis, avec un catalogue de matériaux réutilisable.',
      },
      {
        problem: 'Une variante de matériau ou de pose est demandée en cours de chantier',
        consequence: 'Difficile à chiffrer rapidement sur place.',
        response: 'Ajustez le devis directement, les travaux supplémentaires suivis séparément.',
      },
      {
        problem: 'Le temps de pose réel n\'est jamais comparé à ce qui a été devisé',
        consequence: 'Impossible de savoir si un chantier de pose a vraiment été rentable.',
        response: 'Rattachez les heures au chantier, comparées au devisé.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Devis avec métré de surfaces', text: 'Chiffrez rapidement à partir des surfaces mesurées.' },
      { icon: 'list', title: 'Catalogue de matériaux', text: 'Vos prestations et matériaux habituels mémorisés.' },
      { icon: 'clock', title: 'Suivi des heures de pose', text: 'Comparez le temps prévu au temps réellement passé.' },
      { icon: 'image', title: 'Photos avant/après', text: 'Gardez une preuve visuelle de chaque chantier.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Une variante de matériau s\'ajoute directement.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'La facture reprend les prestations validées.' },
    ],
    scenario: {
      title: 'Exemple : une pose de parquet avec variante de matériau',
      text: 'Le métré des surfaces alimente un devis préparé avec le catalogue. Une variante de matériau demandée en cours de chantier est ajoutée en travaux supplémentaires. Les heures de pose sont suivies, et la facture finale reprend l\'ensemble.',
    },
    comparison: [
      { before: 'Surfaces recalculées à chaque devis', after: 'Métré intégré au devis' },
      { before: 'Variante de matériau difficile à chiffrer sur place', after: 'Ajustement rapide depuis le catalogue' },
      { before: 'Temps de pose jamais comparé au devisé', after: 'Heures suivies et comparées au devisé' },
      { before: 'Photos de pose dispersées', after: 'Photos classées par chantier' },
      { before: 'Devis refait à chaque nouveau chantier', after: 'Catalogue de prestations réutilisable' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à un solier-parqueteur indépendant ou en petite équipe ?',
        answer: 'Oui, le plan Essentiel couvre devis, catalogue et facturation pour une entreprise qui travaille seule ou en petite équipe.',
      },
      {
        question: 'Puis-je intégrer un métré de surfaces directement dans le devis ?',
        answer: 'Oui, le métré alimente directement le devis.',
      },
      {
        question: 'Comment gérer une variante de matériau demandée en cours de chantier ?',
        answer: 'Elle s\'ajoute directement dans le devis à partir du catalogue.',
      },
      {
        question: 'Cantia permet-il de comparer le temps de pose réel au devis ?',
        answer: 'Oui, les heures saisies par chantier sont comparées au montant devisé.',
      },
      {
        question: 'Puis-je ajouter des photos avant/après pour chaque chantier ?',
        answer: 'Oui, les photos sont classées automatiquement par chantier.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['carreleur', 'menuisier'],
  },

  echafaudeur: {
    slug: 'echafaudeur',
    tradeName: 'échafaudeur',
    seo: {
      title: 'Logiciel de gestion pour échafaudeurs en Suisse | Cantia',
      description:
        'Organisez montage, démontage et équipes avec Cantia, le logiciel de gestion pour les entreprises d\'échafaudage en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour échafaudeurs',
      title: 'Planifiez vos équipes et gardez chaque chantier sous contrôle',
      subtitle:
        'Cantia aide les entreprises d\'échafaudage à coordonner montage et démontage avec les autres corps de métier, sans perdre de temps ni de location.',
    },
    painPoints: [
      {
        problem: 'Le montage et le démontage doivent être planifiés précisément avec d\'autres corps de métier',
        consequence: 'Un mauvais timing bloque le chantier suivant ou immobilise du matériel inutilement.',
        response: 'Un planning centralisé, coordonné avec les dates des autres intervenants.',
      },
      {
        problem: 'La durée réelle de location d\'un échafaudage dépasse parfois ce qui était prévu',
        consequence: 'Sans suivi clair, le surcoût de location n\'est pas toujours facturé.',
        response: 'Chaque chantier suit ses dates réelles de montage et démontage, reprises dans la facturation.',
      },
      {
        problem: 'L\'état du matériel et la sécurité du montage doivent être documentés',
        consequence: 'En cas de contrôle ou de litige, l\'absence de preuve complique tout.',
        response: 'Photos et remarques liées au chantier, datées automatiquement.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Planning montage/démontage', text: 'Coordonné avec les dates des autres corps de métier.' },
      { icon: 'clock', title: 'Suivi de durée de location', text: 'Chaque chantier suit ses dates réelles.' },
      { icon: 'image', title: 'Photos de sécurité', text: 'Documentez l\'état du matériel et le montage.' },
      { icon: 'mic', title: 'Devis rapides', text: 'Chiffrez depuis votre catalogue de prestations.' },
      { icon: 'users', title: 'Coordination', text: 'Travaillez en lien avec les autres intervenants du chantier.' },
      { icon: 'credit-card', title: 'Facturation depuis le devis', text: 'Facturez la durée réellement utilisée.' },
    ],
    scenario: {
      title: 'Exemple : un échafaudage pour un chantier de façade',
      text: 'Le montage est planifié en coordination avec l\'entreprise de façade. La durée de location est suivie, une prolongation imprévue documentée et facturée. Le démontage est planifié dès la fin des travaux.',
    },
    comparison: [
      { before: 'Montage/démontage coordonné par appels', after: 'Planning centralisé et partagé' },
      { before: 'Durée de location dépassée non facturée', after: 'Durée réelle suivie et facturée' },
      { before: 'État du matériel non documenté', after: 'Photos et remarques liées au chantier' },
      { before: 'Devis refait à chaque nouveau chantier', after: 'Catalogue de prestations réutilisable' },
      { before: 'Facture reconstituée après coup', after: 'Facture générée depuis le devis' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise d\'échafaudage ?',
        answer: 'Oui, le plan Essentiel couvre devis, chantiers et facturation pour une entreprise qui démarre ou travaille en petite équipe.',
      },
      {
        question: 'Peut-on coordonner le montage et démontage avec d\'autres corps de métier ?',
        answer: 'Oui, le planning est centralisé et partagé avec les intervenants du chantier.',
      },
      {
        question: 'Comment facturer une prolongation de location imprévue ?',
        answer: 'La durée réelle de montage/démontage est suivie par chantier et reprise dans la facturation.',
      },
      {
        question: 'Cantia permet-il de documenter l\'état du matériel et la sécurité du montage ?',
        answer: 'Oui, photos et remarques restent liées au chantier et datées automatiquement.',
      },
      {
        question: 'Puis-je suivre plusieurs chantiers d\'échafaudage en parallèle ?',
        answer: 'Oui, le planning centralise tous vos chantiers actifs.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'facadier'],
  },

  demolition: {
    slug: 'demolition',
    tradeName: 'entreprise de démolition',
    seo: {
      title: 'Logiciel de gestion pour entreprises de démolition | Cantia',
      description:
        'Suivez machines, heures, photos et dépenses par chantier avec Cantia, le logiciel de gestion pour les entreprises de démolition en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d\'entreprise pour la démolition',
      title: 'Heures, machines, photos et dépenses réunies par chantier',
      subtitle:
        'Cantia aide les entreprises de démolition à suivre le coût réel de leurs chantiers et à documenter chaque état des lieux.',
    },
    painPoints: [
      {
        problem: 'Les dépenses de machines et d\'évacuation ne sont pas suivies précisément par chantier',
        consequence: 'La rentabilité réelle d\'un chantier de démolition est difficile à connaître avant la fin.',
        response: 'Rattachez les dépenses au chantier, comparées au devisé en continu.',
      },
      {
        problem: 'L\'état des lieux avant démolition doit être documenté clairement',
        consequence: 'En cas de litige avec un voisin ou une assurance, l\'absence de preuve complique tout.',
        response: 'Des photos géolocalisées avant, pendant et après, liées au chantier.',
      },
      {
        problem: 'Les heures d\'équipe et de machines sont difficiles à répartir entre plusieurs chantiers',
        consequence: 'Impossible de savoir précisément ce qu\'a coûté un chantier en main-d\'œuvre et en machines.',
        response: 'Rattachez les heures au chantier, par personne et par machine.',
      },
    ],
    usages: [
      { icon: 'dollar-sign', title: 'Suivi des dépenses', text: 'Machines et évacuation rattachées au bon chantier.' },
      { icon: 'image', title: 'Photos avant/pendant/après', text: 'Documentez l\'état des lieux à chaque étape.' },
      { icon: 'clock', title: 'Heures par chantier', text: 'Équipe et machines suivies, chantier par chantier.' },
      { icon: 'trending-up', title: 'Rentabilité en direct', text: 'Comparez devisé et coût réel en continu.' },
      { icon: 'mic', title: 'Devis et factures', text: 'Du devis initial à la facture finale.' },
      { icon: 'folder', title: 'Documents et autorisations', text: 'Centralisés par chantier.' },
    ],
    scenario: {
      title: 'Exemple : une démolition avec état des lieux documenté',
      text: 'L\'état des lieux est photographié avant travaux. Le devis est préparé. Le chantier est suivi avec heures et dépenses de machines rattachées. Des photos de fin de chantier complètent le dossier, et la facture finale reprend l\'ensemble.',
    },
    comparison: [
      { before: 'Dépenses de machines et d\'évacuation non suivies', after: 'Dépenses rattachées au chantier' },
      { before: 'État des lieux non documenté', after: 'Photos géolocalisées avant/pendant/après' },
      { before: 'Heures d\'équipe et de machines difficiles à répartir', after: 'Heures rattachées au chantier' },
      { before: 'Rentabilité connue en fin de chantier', after: 'Rentabilité suivie en direct' },
      { before: 'Documents et autorisations dispersés', after: 'Centralisés par chantier' },
    ],
    faq: [
      {
        question: 'Cantia convient-il à une entreprise de démolition ?',
        answer: 'Oui, le suivi des dépenses de machines et la rentabilité par chantier répondent directement à ce fonctionnement.',
      },
      {
        question: 'Peut-on suivre le coût des machines et de l\'évacuation par chantier ?',
        answer: 'Oui, chaque dépense est rattachée au chantier concerné et comparée au montant devisé.',
      },
      {
        question: 'Comment documenter un état des lieux avant démolition ?',
        answer: 'Des photos géolocalisées peuvent être prises avant, pendant et après les travaux, liées au chantier.',
      },
      {
        question: 'Cantia permet-il de connaître la rentabilité d\'un chantier avant sa fin ?',
        answer: 'Oui, la comparaison entre montant devisé et coût réel est disponible en continu.',
      },
      {
        question: 'Puis-je suivre les heures d\'équipe et de machines par chantier ?',
        answer: 'Oui, chaque heure saisie est rattachée à un chantier et à la personne ou la machine concernée.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['terrassier', 'genie-civil'],
  },

  // ——— Beyond the building trades (general: true): same tools, minus the
  // site-only ones (soumissions, construction schedule), in the company's own
  // words (projet, mandat, dossier).
  'entreprise-nettoyage': {
    slug: 'entreprise-nettoyage',
    tradeName: 'entreprise de nettoyage',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour entreprises de nettoyage en Suisse | Cantia',
      description:
        'Devis d’entretien, planning des équipes, heures par client, rapports avec photos et factures QR : Cantia simplifie la gestion des entreprises de nettoyage en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour le nettoyage',
      title: 'Vos contrats, vos équipes et vos factures, enfin au même endroit',
      subtitle:
        'Cantia aide les entreprises de nettoyage à chiffrer leurs contrats d’entretien, planifier les équipes, suivre les heures par client et facturer chaque mois sans ressaisie.',
    },
    painPoints: [
      {
        problem: 'Le planning des équipes change tous les jours',
        consequence: 'Absences, remplacements et nettoyages de fin de bail se règlent par messages, et quelqu’un finit par ne pas savoir où aller.',
        response: 'Un planning d’équipe partagé : chacun voit sur son téléphone où il travaille aujourd’hui et pour quel client.',
      },
      {
        problem: 'Les heures réelles dépassent souvent le contrat',
        consequence: 'Un client demande toujours un peu plus ; sans suivi par client, la marge du contrat fond sans que personne le voie.',
        response: 'Les heures sont saisies par client et comparées au montant prévu, mois après mois.',
      },
      {
        problem: 'Un client conteste le travail fait',
        consequence: 'Sans trace écrite, c’est votre parole contre la sienne, et souvent un geste commercial à la clé.',
        response: 'Un rapport avec photos datées à la fin du passage, envoyé au client en PDF.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Devis d’entretien au mois ou au passage', text: 'Vos prestations et prix en catalogue : surface, fréquence, vitres, remise en état, avec la TVA calculée.' },
      { icon: 'calendar', title: 'Planning des équipes', text: 'Qui va chez quel client, et quand, visible par toute l’équipe sur téléphone.' },
      { icon: 'clock', title: 'Heures par client', text: 'Chaque heure est rattachée au bon client, pour voir la rentabilité réelle de chaque contrat.' },
      { icon: 'camera', title: 'Rapports avec photos', text: 'Fin de chantier, état des lieux, remise en état : un rapport clair, photos à l’appui.' },
      { icon: 'credit-card', title: 'Factures QR et relances', text: 'La facture se prépare depuis le devis, avec le bulletin QR suisse ; les relances partent automatiquement.' },
      { icon: 'users', title: 'Salaires des employés', text: 'Les heures saisies donnent la fiche de salaire, avec les déductions suisses, puis le certificat de salaire.' },
    ],
    scenario: {
      title: 'Exemple : un contrat d’entretien de bureaux',
      text: 'Après la visite, vous préparez le devis à partir de votre catalogue : surface, deux passages par semaine, vitres chaque trimestre. Le client signe en ligne. Les passages entrent au planning de l’équipe, les heures sont saisies sur place, et chaque fin de mois la facture se prépare sans rien retaper.',
    },
    comparison: [
      { before: 'Planning sur un tableau ou dans un groupe de messages', after: 'Planning partagé, visible sur chaque téléphone' },
      { before: 'Heures notées sur papier, recopiées pour les salaires', after: 'Heures par client, reprises dans les fiches de salaire' },
      { before: 'Aucune preuve en cas de contestation', after: 'Rapport avec photos datées' },
      { before: 'Factures préparées à la main en fin de mois', after: 'Factures QR préparées depuis le devis' },
      { before: 'Impayés suivis de mémoire', after: 'Relances automatiques' },
    ],
    faq: [
      { question: 'Cantia convient-il à une petite entreprise de nettoyage ?', answer: 'Oui. Vous commencez avec les devis, les clients et les factures, puis vous ajoutez le planning d’équipe et les salaires quand vous engagez.' },
      { question: 'Puis-je parler de « projets » ou de « mandats » plutôt que de « chantiers » ?', answer: 'Oui. Vous choisissez le terme de votre entreprise (chantier, projet, mandat ou dossier) et il est utilisé partout, y compris sur vos devis et factures.' },
      { question: 'Mes employés peuvent-ils saisir leurs heures depuis leur téléphone ?', answer: 'Oui, chacun saisit ses heures sur le client du jour ; elles servent ensuite au suivi de la rentabilité et aux fiches de salaire.' },
      { question: 'Cantia gère-t-il la QR-facture suisse ?', answer: 'Oui, chaque facture inclut le bulletin QR suisse avec votre IBAN et la référence de paiement.' },
      { question: 'Puis-je envoyer un rapport de passage avec photos au client ?', answer: 'Oui, les photos prises sur place sont classées par client et le rapport s’envoie en PDF.' },
    ],
    relatedBlogSlugs: ['prix-contrat-nettoyage-bureaux-suisse-calcul'],
    relatedTrades: ['conciergerie', 'demenageur'],
  },

  conciergerie: {
    slug: 'conciergerie',
    tradeName: 'conciergerie',
    general: true,
    seo: {
      title: 'Logiciel pour conciergeries et facility management en Suisse | Cantia',
      description:
        'Interventions, régies, rapports avec photos, heures par immeuble et factures QR : Cantia aide les conciergeries et entreprises de facility management en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour la conciergerie',
      title: 'Chaque immeuble, chaque intervention, chaque heure, sans papier',
      subtitle:
        'Cantia aide les conciergeries et entreprises de facility management à suivre leurs immeubles, documenter leurs interventions et facturer les régies aux gérances.',
    },
    painPoints: [
      {
        problem: 'La gérance demande ce qui a été fait, et quand',
        consequence: 'Les bons d’intervention papier se perdent et il faut tout reconstituer au moment de facturer.',
        response: 'Chaque intervention est enregistrée sur l’immeuble, avec photos, heures et remarque.',
      },
      {
        problem: 'Les petites régies ne sont jamais facturées',
        consequence: 'Un remplacement d’ampoule ici, un débouchage là : additionnés, ce sont des centaines de francs perdus chaque mois.',
        response: 'Les travaux supplémentaires s’ajoutent sur place et se retrouvent dans la facture du mois.',
      },
      {
        problem: 'Les informations sont dispersées',
        consequence: 'Codes, contacts des locataires, contrats d’entretien : tout est dans des classeurs ou dans la tête d’une seule personne.',
        response: 'Un dossier par immeuble, avec ses documents, ses contacts et son historique.',
      },
    ],
    usages: [
      { icon: 'home', title: 'Un dossier par immeuble', text: 'Documents, photos, contacts et historique des interventions au même endroit.' },
      { icon: 'plus-circle', title: 'Régies et suppléments', text: 'Une intervention imprévue s’ajoute sur place, avec photo, et peut être signée.' },
      { icon: 'camera', title: 'Rapports pour la gérance', text: 'Un rapport clair avec photos datées, envoyé en PDF.' },
      { icon: 'calendar', title: 'Tournées planifiées', text: 'Le planning de l’équipe, immeuble par immeuble, visible sur téléphone.' },
      { icon: 'clock', title: 'Heures par immeuble', text: 'Le temps passé sur chaque immeuble, pour savoir lesquels sont rentables.' },
      { icon: 'credit-card', title: 'Factures QR aux gérances', text: 'Factures avec bulletin QR et relances automatiques des factures en retard.' },
    ],
    scenario: {
      title: 'Exemple : une fuite signalée un vendredi soir',
      text: 'La gérance appelle. Votre collaborateur ouvre le dossier de l’immeuble sur son téléphone, retrouve le code d’accès, intervient, prend deux photos et note ses heures. Le supplément est ajouté sur place. Lundi, la gérance reçoit le rapport, et l’intervention figure dans la facture du mois.',
    },
    comparison: [
      { before: 'Bons d’intervention papier', after: 'Interventions enregistrées sur l’immeuble' },
      { before: 'Régies oubliées en fin de mois', after: 'Suppléments ajoutés sur place' },
      { before: 'Photos dans le téléphone de chacun', after: 'Photos classées par immeuble' },
      { before: 'Heures difficiles à répartir', after: 'Heures par immeuble' },
      { before: 'Rapports rédigés le soir', after: 'Rapport PDF prêt à envoyer' },
    ],
    faq: [
      { question: 'Cantia convient-il à une conciergerie indépendante ?', answer: 'Oui. Vous pouvez commencer seul avec les dossiers d’immeubles, les rapports et les factures, puis inviter votre équipe.' },
      { question: 'Puis-je appeler mes immeubles « dossiers » ou « mandats » ?', answer: 'Oui, vous choisissez le terme utilisé dans toute l’application et sur vos documents.' },
      { question: 'Le client peut-il signer une intervention supplémentaire ?', answer: 'Oui, sur votre téléphone ou depuis le lien reçu par e-mail ; la signature figure sur le PDF.' },
      { question: 'Puis-je facturer une gérance pour plusieurs immeubles ?', answer: 'Oui, la gérance est un client avec ses immeubles, et chaque facture précise l’immeuble concerné.' },
      { question: 'Les photos sont-elles datées ?', answer: 'Oui, elles sont datées et peuvent être géolocalisées, ce qui sert de preuve en cas de contestation.' },
    ],
    relatedBlogSlugs: ['facturer-petites-interventions-gerance-conciergerie'],
    relatedTrades: ['entreprise-nettoyage', 'paysagiste'],
  },

  garagiste: {
    slug: 'garagiste',
    tradeName: 'garagiste',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour garages et carrosseries en Suisse | Cantia',
      description:
        'Devis de réparation, ordres de travail, heures d’atelier, photos des dégâts et factures QR : Cantia simplifie la gestion des garages et carrosseries en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour garages',
      title: 'Du devis de réparation à la facture, sans repasser par le bureau',
      subtitle:
        'Cantia aide les garages et carrosseries à chiffrer les réparations, suivre les heures d’atelier par véhicule, documenter les dégâts en photos et facturer avec la QR-facture.',
    },
    painPoints: [
      {
        problem: 'Le client veut un prix avant de laisser sa voiture',
        consequence: 'Le devis attend le soir, le client compare ailleurs ou s’impatiente.',
        response: 'Un devis préparé en quelques minutes à partir de vos prestations et pièces habituelles, signé en ligne.',
      },
      {
        problem: 'En cours de réparation, on découvre autre chose',
        consequence: 'Le client découvre le supplément sur la facture et le conteste.',
        response: 'Le supplément est ajouté avec photo et accepté par le client avant de continuer.',
      },
      {
        problem: 'Les heures d’atelier ne collent pas avec la facture',
        consequence: 'Le temps réellement passé n’est pas suivi, la marge par réparation reste une estimation.',
        response: 'Les heures des mécaniciens sont rattachées au véhicule et comparées au devis.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Devis de réparation', text: 'Main-d’œuvre, pièces et forfaits en catalogue, TVA calculée, signature en ligne.' },
      { icon: 'camera', title: 'Photos des dégâts', text: 'Avant, pendant, après : les photos restent liées au véhicule, utiles pour l’assurance.' },
      { icon: 'plus-circle', title: 'Travaux supplémentaires', text: 'Un supplément découvert en cours de route, accepté par le client avant d’être fait.' },
      { icon: 'clock', title: 'Heures d’atelier', text: 'Chaque heure de mécanicien rattachée au bon véhicule.' },
      { icon: 'calendar', title: 'Planning de l’atelier', text: 'Qui travaille sur quoi, jour après jour, visible par toute l’équipe.' },
      { icon: 'credit-card', title: 'Factures QR', text: 'La facture se prépare depuis le devis, avec le bulletin QR suisse et les relances.' },
    ],
    scenario: {
      title: 'Exemple : une réparation après un accrochage',
      text: 'Le client dépose sa voiture. Vous ouvrez un dossier, prenez les photos des dégâts et préparez le devis depuis votre catalogue. En démontant, le mécanicien découvre un support cassé : le supplément part au client avec une photo, il l’accepte sur son téléphone. À la restitution, la facture QR est prête.',
    },
    comparison: [
      { before: 'Devis rédigé le soir', after: 'Devis préparé en quelques minutes' },
      { before: 'Suppléments découverts sur la facture', after: 'Suppléments acceptés avant d’être faits' },
      { before: 'Photos éparpillées', after: 'Photos classées par véhicule' },
      { before: 'Heures d’atelier estimées', after: 'Heures rattachées à chaque réparation' },
      { before: 'Relances faites à la main', after: 'Relances automatiques' },
    ],
    faq: [
      { question: 'Cantia remplace-t-il un logiciel de garage spécialisé ?', answer: 'Cantia couvre la gestion : devis, suppléments, heures, photos, factures, salaires et comptabilité. Il ne gère pas les catalogues de pièces des constructeurs ni les diagnostics.' },
      { question: 'Puis-je suivre chaque véhicule séparément ?', answer: 'Oui, chaque véhicule ou réparation est un dossier avec ses photos, documents, heures et documents commerciaux.' },
      { question: 'Le client peut-il accepter un supplément à distance ?', answer: 'Oui, il reçoit un lien par e-mail et signe en ligne ; la signature figure sur le PDF.' },
      { question: 'Cantia gère-t-il la QR-facture suisse ?', answer: 'Oui, chaque facture inclut le bulletin QR suisse.' },
      { question: 'Puis-je faire les salaires de mes mécaniciens ?', answer: 'Oui, avec les déductions suisses, les fiches de salaire mensuelles et le certificat de salaire annuel.' },
    ],
    relatedBlogSlugs: ['devis-reparation-garage-supplement-accord-client'],
    relatedTrades: ['demenageur', 'informaticien'],
  },

  demenageur: {
    slug: 'demenageur',
    tradeName: 'déménageur',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour entreprises de déménagement en Suisse | Cantia',
      description:
        'Devis de déménagement, planning des équipes et des véhicules, état des lieux en photos, heures et factures QR : Cantia simplifie la gestion des déménageurs en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour déménageurs',
      title: 'Des devis envoyés le jour de la visite, des équipes qui savent où aller',
      subtitle:
        'Cantia aide les entreprises de déménagement à chiffrer rapidement, planifier les équipes, documenter l’état des biens en photos et facturer sans retard.',
    },
    painPoints: [
      {
        problem: 'Le client demande trois devis',
        consequence: 'Celui qui répond le premier, avec un document clair, a souvent le contrat.',
        response: 'Le devis se prépare juste après la visite, avec vos forfaits et prix habituels, et se signe en ligne.',
      },
      {
        problem: 'Un meuble abîmé, et c’est la discussion',
        consequence: 'Sans photo de l’état avant le transport, difficile de savoir ce qui s’est passé.',
        response: 'Photos datées au chargement et à la livraison, classées sur le déménagement.',
      },
      {
        problem: 'Les heures dépassent le forfait',
        consequence: 'Accès difficile, ascenseur en panne : le surplus n’est pas facturé faute de trace.',
        response: 'Les heures réelles sont saisies et le supplément s’ajoute sur place, accepté par le client.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Devis rapides', text: 'Forfaits, heures, emballage, garde-meuble : vos prix en catalogue, TVA calculée.' },
      { icon: 'calendar', title: 'Planning des équipes', text: 'Qui part avec quel camion, à quelle adresse, visible sur chaque téléphone.' },
      { icon: 'camera', title: 'État des biens en photos', text: 'Avant le chargement et à la livraison, datées et classées.' },
      { icon: 'plus-circle', title: 'Suppléments sur place', text: 'Heures en plus, montée à la main : ajoutées et acceptées sur place.' },
      { icon: 'clock', title: 'Heures par déménagement', text: 'Le temps réel de chaque équipe, comparé à ce qui était prévu.' },
      { icon: 'credit-card', title: 'Acomptes et factures QR', text: 'Facture d’acompte à la réservation, solde avec bulletin QR, relances automatiques.' },
    ],
    scenario: {
      title: 'Exemple : un déménagement de Lausanne à Fribourg',
      text: 'Après la visite, le devis part le soir même. Le client signe, vous envoyez une facture d’acompte. Le jour J, l’équipe voit l’adresse et l’horaire sur son téléphone, photographie les meubles fragiles au chargement, note deux heures de plus à cause d’un accès difficile. Le solde est facturé le lendemain.',
    },
    comparison: [
      { before: 'Devis envoyé plusieurs jours après la visite', after: 'Devis envoyé le jour même' },
      { before: 'Planning sur un tableau au dépôt', after: 'Planning sur chaque téléphone' },
      { before: 'Litiges sans preuve', after: 'Photos datées avant et après' },
      { before: 'Heures en plus jamais facturées', after: 'Suppléments acceptés sur place' },
      { before: 'Acomptes suivis dans un carnet', after: 'Factures d’acompte et de solde' },
    ],
    faq: [
      { question: 'Cantia convient-il à une petite entreprise de déménagement ?', answer: 'Oui, vous pouvez commencer avec les devis et les factures, puis ajouter le planning et les salaires.' },
      { question: 'Puis-je demander un acompte ?', answer: 'Oui, une facture d’acompte peut être émise avant le déménagement, et le solde en tient compte.' },
      { question: 'Mes équipes voient-elles leur planning sur téléphone ?', answer: 'Oui, chacun voit ses missions du jour, avec l’adresse et les informations utiles.' },
      { question: 'Les photos peuvent-elles servir en cas de litige ?', answer: 'Oui, elles sont datées et peuvent être géolocalisées.' },
      { question: 'Cantia gère-t-il la QR-facture suisse ?', answer: 'Oui, sur toutes les factures.' },
    ],
    relatedBlogSlugs: ['acompte-demenagement-suisse-montant-facture'],
    relatedTrades: ['entreprise-nettoyage', 'garagiste'],
  },

  informaticien: {
    slug: 'informaticien',
    tradeName: 'informaticien',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour informaticiens et PME IT en Suisse | Cantia',
      description:
        'Offres, heures par mandat, interventions, contrats de support et factures QR : Cantia aide les informaticiens indépendants et les PME IT en Suisse à facturer chaque heure.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour l’informatique',
      title: 'Chaque heure de support finit sur une facture',
      subtitle:
        'Cantia aide les informaticiens indépendants et les petites entreprises IT à préparer leurs offres, suivre le temps par mandat, documenter les interventions et facturer sans oubli.',
    },
    painPoints: [
      {
        problem: 'Les petites interventions ne sont pas notées',
        consequence: 'Un appel de vingt minutes, une mise à jour à distance : à la fin du mois, une partie du temps n’est jamais facturée.',
        response: 'Le temps se saisit en quelques secondes sur le mandat du client, depuis l’ordinateur ou le téléphone.',
      },
      {
        problem: 'Un projet dépasse le budget sans prévenir',
        consequence: 'On s’en rend compte en préparant la facture, trop tard pour en parler au client.',
        response: 'Les heures sont comparées au montant de l’offre, mandat par mandat.',
      },
      {
        problem: 'Les factures partent en retard',
        consequence: 'La facturation se fait le week-end, et la trésorerie en souffre.',
        response: 'La facture se prépare depuis l’offre et les heures, avec la QR-facture et les relances automatiques.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Offres claires', text: 'Prestations, licences et forfaits en catalogue, signature électronique du client.' },
      { icon: 'clock', title: 'Heures par mandat', text: 'Chaque intervention rattachée au bon client et au bon mandat.' },
      { icon: 'bar-chart-2', title: 'Rentabilité par projet', text: 'Offert contre réalisé, pour savoir quels projets rapportent vraiment.' },
      { icon: 'mic', title: 'Notes dictées', text: 'Dictez votre compte rendu d’intervention ; il est transcrit et rangé sur le mandat.' },
      { icon: 'credit-card', title: 'Factures QR et relances', text: 'Facturation depuis l’offre, bulletin QR suisse, relances automatiques.' },
      { icon: 'pie-chart', title: 'Trésorerie et TVA', text: 'Les encaissements à venir, la TVA du trimestre et la comptabilité au même endroit.' },
    ],
    scenario: {
      title: 'Exemple : la migration d’une PME vers de nouveaux postes',
      text: 'Vous envoyez l’offre, le client la signe en ligne. Pendant le projet, chaque technicien saisit son temps sur le mandat. Un poste supplémentaire est demandé : il s’ajoute au mandat et le client l’accepte. À la fin, la facture reprend l’offre et le supplément, avec le bulletin QR.',
    },
    comparison: [
      { before: 'Temps noté dans un tableur', after: 'Heures saisies sur le mandat' },
      { before: 'Petites interventions oubliées', after: 'Chaque intervention facturée' },
      { before: 'Dépassement découvert à la facturation', after: 'Offert contre réalisé suivi en continu' },
      { before: 'Factures préparées le week-end', after: 'Factures préparées depuis l’offre' },
      { before: 'Relances au cas par cas', after: 'Relances automatiques' },
    ],
    faq: [
      { question: 'Cantia convient-il à un informaticien indépendant ?', answer: 'Oui. Offres, heures, factures QR et relances suffisent pour démarrer seul.' },
      { question: 'Puis-je parler de « mandats » plutôt que de « chantiers » ?', answer: 'Oui, vous choisissez le terme utilisé dans l’application et sur vos documents.' },
      { question: 'Cantia sert-il de système de tickets ?', answer: 'Non. Cantia gère vos offres, votre temps, vos factures et votre administration ; il ne remplace pas un outil de tickets ou de supervision.' },
      { question: 'Puis-je utiliser Cantia avec Bexio ?', answer: 'Oui, l’intégration synchronise clients, factures et paiements, selon votre formule.' },
      { question: 'Cantia gère-t-il la TVA ?', answer: 'Oui, si vous êtes assujetti, la TVA est calculée sur vos documents et le décompte trimestriel est préparé.' },
    ],
    relatedBlogSlugs: ['facturer-support-informatique-temps-passe'],
    relatedTrades: ['graphiste', 'consultant'],
  },

  graphiste: {
    slug: 'graphiste',
    tradeName: 'graphiste',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour graphistes et agences de communication | Cantia',
      description:
        'Offres, suivi du temps par projet, allers-retours facturables, factures QR et relances : Cantia aide les graphistes et agences de communication en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour graphistes et agences',
      title: 'Le temps passé sur chaque projet, enfin visible',
      subtitle:
        'Cantia aide les graphistes indépendants et les agences à chiffrer leurs projets, suivre le temps passé, facturer les demandes en plus et encaisser sans courir après les clients.',
    },
    painPoints: [
      {
        problem: 'Les corrections n’en finissent pas',
        consequence: 'Le troisième aller-retour était prévu, le septième non, et il n’est presque jamais facturé.',
        response: 'Les demandes hors offre s’ajoutent au projet et le client les accepte avant que vous les fassiez.',
      },
      {
        problem: 'On ne sait pas quels clients sont rentables',
        consequence: 'Certains projets prennent le double du temps prévu, sans que personne le mesure.',
        response: 'Le temps est saisi par projet et comparé à l’offre.',
      },
      {
        problem: 'L’administratif mange les journées',
        consequence: 'Offres, factures et relances se font le soir, au lieu de créer.',
        response: 'Offres depuis un catalogue, factures depuis l’offre, relances automatiques.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Offres par projet', text: 'Logo, site, campagne : vos prestations en catalogue, signature en ligne.' },
      { icon: 'clock', title: 'Temps par projet', text: 'Chaque heure rattachée au bon client, pour voir la rentabilité réelle.' },
      { icon: 'plus-circle', title: 'Demandes en plus', text: 'Une demande hors offre devient un supplément accepté par le client.' },
      { icon: 'folder', title: 'Fichiers du projet', text: 'Briefs, maquettes et livrables classés par projet.' },
      { icon: 'credit-card', title: 'Acomptes et factures QR', text: 'Acompte au démarrage, solde à la livraison, relances automatiques.' },
      { icon: 'pie-chart', title: 'Trésorerie', text: 'Ce qui doit rentrer et quand, pour éviter les mauvaises surprises.' },
    ],
    scenario: {
      title: 'Exemple : une nouvelle identité visuelle',
      text: 'L’offre prévoit trois pistes et deux allers-retours. Le client la signe, vous facturez un acompte. Au quatrième aller-retour, le supplément part au client, qui l’accepte. Le temps passé est suivi sur le projet. À la livraison, la facture de solde reprend l’offre et le supplément.',
    },
    comparison: [
      { before: 'Corrections illimitées de fait', after: 'Suppléments acceptés avant d’être faits' },
      { before: 'Temps estimé après coup', after: 'Temps saisi par projet' },
      { before: 'Offres refaites à chaque fois', after: 'Offres depuis votre catalogue' },
      { before: 'Acomptes oubliés', after: 'Facture d’acompte au démarrage' },
      { before: 'Relances gênantes à écrire', after: 'Relances automatiques' },
    ],
    faq: [
      { question: 'Cantia convient-il à un graphiste indépendant ?', answer: 'Oui, les offres, le temps et les factures suffisent pour démarrer seul.' },
      { question: 'Puis-je appeler mes dossiers « projets » ?', answer: 'Oui, vous choisissez le terme utilisé partout, y compris sur vos documents.' },
      { question: 'Mes offres et factures peuvent-elles être à mes couleurs ?', answer: 'Oui, avec votre logo et la couleur de votre marque, selon votre formule.' },
      { question: 'Puis-je demander un acompte ?', answer: 'Oui, la facture d’acompte est déduite de la facture de solde.' },
      { question: 'Le client peut-il signer l’offre en ligne ?', answer: 'Oui, depuis le lien reçu par e-mail ; la signature figure sur le PDF.' },
    ],
    relatedBlogSlugs: ['corrections-incluses-offre-graphiste-droits'],
    relatedTrades: ['photographe', 'informaticien'],
  },

  photographe: {
    slug: 'photographe',
    tradeName: 'photographe',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour photographes et vidéastes en Suisse | Cantia',
      description:
        'Offres, réservations, acomptes, planning des tournages et factures QR : Cantia aide les photographes, vidéastes et télépilotes de drone en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour photographes et vidéastes',
      title: 'Plus de temps derrière l’objectif, moins derrière l’administratif',
      subtitle:
        'Cantia aide les photographes, vidéastes et télépilotes de drone à envoyer leurs offres, bloquer les dates avec un acompte et facturer sans y passer leurs soirées.',
    },
    painPoints: [
      {
        problem: 'Une date réservée, puis annulée',
        consequence: 'Sans acompte ni offre signée, la journée bloquée est perdue.',
        response: 'L’offre se signe en ligne et une facture d’acompte part aussitôt.',
      },
      {
        problem: 'Le temps de post-production n’est jamais compté',
        consequence: 'La journée de prise de vue est facturée, les deux jours de retouche beaucoup moins.',
        response: 'Le temps de préparation, de prise de vue et de post-production est saisi par projet.',
      },
      {
        problem: 'Les factures attendent la livraison',
        consequence: 'Entre la livraison et la facture, des semaines passent.',
        response: 'La facture de solde se prépare depuis l’offre, avec la QR-facture et les relances.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Offres et forfaits', text: 'Reportages, mariages, tournages, vols de drone : vos forfaits en catalogue.' },
      { icon: 'calendar', title: 'Planning des tournages', text: 'Vos dates et celles de vos assistants, synchronisables avec Google Agenda.' },
      { icon: 'credit-card', title: 'Acomptes', text: 'Une facture d’acompte à la signature, déduite du solde.' },
      { icon: 'clock', title: 'Temps par projet', text: 'Préparation, prise de vue, post-production : tout est compté.' },
      { icon: 'folder', title: 'Documents du projet', text: 'Briefs, autorisations et contrats classés par projet.' },
      { icon: 'bell', title: 'Relances automatiques', text: 'Les factures en retard sont relancées sans que vous ayez à écrire.' },
    ],
    scenario: {
      title: 'Exemple : un reportage d’entreprise',
      text: 'Vous envoyez l’offre : une journée de prise de vue et une sélection retouchée. Le client signe, l’acompte part. La date entre dans votre planning. Après le tournage, vous saisissez le temps de post-production sur le projet. À la livraison, la facture de solde est prête.',
    },
    comparison: [
      { before: 'Dates réservées sans engagement', after: 'Offre signée et acompte' },
      { before: 'Post-production non comptée', after: 'Temps saisi par projet' },
      { before: 'Factures envoyées des semaines après', after: 'Facture prête à la livraison' },
      { before: 'Agenda et devis séparés', after: 'Planning lié aux projets' },
      { before: 'Relances au cas par cas', after: 'Relances automatiques' },
    ],
    faq: [
      { question: 'Cantia convient-il à un photographe indépendant ?', answer: 'Oui, offres, acomptes et factures suffisent pour démarrer seul.' },
      { question: 'Puis-je synchroniser mon planning avec Google Agenda ?', answer: 'Oui, la synchronisation fonctionne dans les deux sens, pour chaque utilisateur.' },
      { question: 'Puis-je demander un acompte à la réservation ?', answer: 'Oui, la facture d’acompte est ensuite déduite du solde.' },
      { question: 'Cantia stocke-t-il mes photos haute résolution pour la livraison ?', answer: 'Cantia classe les documents et photos de travail par projet. Pour livrer de gros volumes au client, gardez votre plateforme de livraison habituelle.' },
      { question: 'Cantia gère-t-il la QR-facture suisse ?', answer: 'Oui, sur toutes les factures.' },
    ],
    relatedBlogSlugs: ['annulation-reservation-photographe-acompte-arrhes'],
    relatedTrades: ['graphiste', 'traiteur'],
  },

  traiteur: {
    slug: 'traiteur',
    tradeName: 'traiteur',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour traiteurs et événementiel en Suisse | Cantia',
      description:
        'Offres par événement, acomptes, planning du personnel, heures, salaires et factures QR : Cantia simplifie la gestion des traiteurs et entreprises événementielles en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour traiteurs et événementiel',
      title: 'Chaque événement chiffré, staffé et facturé',
      subtitle:
        'Cantia aide les traiteurs et entreprises événementielles à envoyer des offres claires, encaisser les acomptes, planifier le personnel et facturer le solde sans oubli.',
    },
    painPoints: [
      {
        problem: 'Le nombre d’invités change jusqu’à la veille',
        consequence: 'Les modifications se perdent entre e-mails et appels, et la facture ne correspond plus.',
        response: 'Chaque changement s’ajoute à l’événement et le client l’accepte en ligne.',
      },
      {
        problem: 'Le personnel extra est difficile à suivre',
        consequence: 'Heures de service, montage, démontage : les salaires se calculent à la main.',
        response: 'Le planning du personnel et les heures saisies donnent les fiches de salaire.',
      },
      {
        problem: 'Les acomptes ne sont pas toujours demandés',
        consequence: 'Une annulation tardive coûte la marchandise déjà commandée.',
        response: 'Une facture d’acompte part dès la signature de l’offre.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Offres par événement', text: 'Menus, boissons, service et location en catalogue, au couvert ou au forfait.' },
      { icon: 'plus-circle', title: 'Modifications acceptées', text: 'Invités en plus, option ajoutée : le client accepte avant l’événement.' },
      { icon: 'calendar', title: 'Planning du personnel', text: 'Qui travaille à quel événement, visible sur téléphone.' },
      { icon: 'clock', title: 'Heures et salaires', text: 'Les heures de service donnent les fiches de salaire, avec les déductions suisses.' },
      { icon: 'credit-card', title: 'Acomptes et soldes', text: 'Facture d’acompte, puis solde avec bulletin QR et relances.' },
      { icon: 'bar-chart-2', title: 'Rentabilité par événement', text: 'Marchandise, personnel et frais comparés au prix de l’offre.' },
    ],
    scenario: {
      title: 'Exemple : un apéritif de 150 personnes',
      text: 'L’offre part avec le menu et le service. Le client signe et paie l’acompte. Une semaine avant, il passe à 180 invités : la modification lui est envoyée, il l’accepte. Le personnel voit ses horaires sur téléphone et saisit ses heures. Le lendemain, le solde est facturé.',
    },
    comparison: [
      { before: 'Modifications perdues dans les e-mails', after: 'Modifications acceptées et jointes à l’événement' },
      { before: 'Personnel planifié par messages', after: 'Planning partagé' },
      { before: 'Heures recopiées pour les salaires', after: 'Heures reprises dans les fiches de salaire' },
      { before: 'Acomptes oubliés', after: 'Acompte dès la signature' },
      { before: 'Marge inconnue par événement', after: 'Rentabilité par événement' },
    ],
    faq: [
      { question: 'Cantia convient-il à un petit traiteur ?', answer: 'Oui, offres, acomptes et factures suffisent pour démarrer, le planning et les salaires viennent ensuite.' },
      { question: 'Puis-je faire les salaires du personnel extra ?', answer: 'Oui, à l’heure ou au mois, avec les déductions suisses et le certificat de salaire.' },
      { question: 'Le client peut-il accepter une modification en ligne ?', answer: 'Oui, depuis le lien reçu par e-mail ; sa signature figure sur le document.' },
      { question: 'Puis-je appeler mes événements « dossiers » ?', answer: 'Oui, vous choisissez le terme utilisé partout.' },
      { question: 'Cantia gère-t-il la QR-facture suisse ?', answer: 'Oui, sur toutes les factures.' },
    ],
    relatedBlogSlugs: ['salaire-personnel-extra-evenementiel-traiteur'],
    relatedTrades: ['photographe', 'entreprise-nettoyage'],
  },

  consultant: {
    slug: 'consultant',
    tradeName: 'consultant',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour consultants et petites sociétés de conseil | Cantia',
      description:
        'Offres, mandats, temps passé, notes dictées, factures QR, TVA et comptabilité : Cantia aide les consultants indépendants et sociétés de conseil en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour consultants',
      title: 'Vos mandats, votre temps et vos honoraires, sans tableur',
      subtitle:
        'Cantia aide les consultants et petites sociétés de conseil à préparer leurs offres, suivre le temps par mandat, facturer leurs honoraires et garder leur comptabilité à jour.',
    },
    painPoints: [
      {
        problem: 'Le temps est noté après coup',
        consequence: 'Une partie des heures passées n’est jamais facturée.',
        response: 'Le temps se saisit sur le mandat au fil de la journée, sur ordinateur ou téléphone.',
      },
      {
        problem: 'Le budget du mandat est dépassé sans prévenir',
        consequence: 'La discussion avec le client arrive trop tard.',
        response: 'Les heures sont comparées au budget de l’offre, mandat par mandat.',
      },
      {
        problem: 'Facturation et comptabilité prennent les vendredis',
        consequence: 'Le temps administratif ne se facture à personne.',
        response: 'Factures depuis l’offre et le temps, comptabilité et TVA alimentées automatiquement.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Offres et lettres de mission', text: 'Vos prestations en catalogue, signature électronique du client.' },
      { icon: 'clock', title: 'Temps par mandat', text: 'Chaque heure sur le bon mandat, pour facturer juste.' },
      { icon: 'mic', title: 'Notes dictées', text: 'Le compte rendu d’une séance dicté sur le téléphone, transcrit sur le mandat.' },
      { icon: 'credit-card', title: 'Honoraires et factures QR', text: 'Facture au forfait ou au temps passé, bulletin QR, relances automatiques.' },
      { icon: 'pie-chart', title: 'Comptabilité et TVA', text: 'Compte de résultat et décompte TVA alimentés par vos factures et dépenses.' },
      { icon: 'briefcase', title: 'Lien avec votre fiduciaire', text: 'Votre fiduciaire accède à vos chiffres en lecture, avec votre accord.' },
    ],
    scenario: {
      title: 'Exemple : un mandat d’accompagnement de six mois',
      text: 'L’offre fixe un budget en jours. Le client la signe en ligne. Chaque semaine, vous saisissez votre temps et dictez le compte rendu des séances. À mi-parcours, vous voyez que 60 % du budget est utilisé et en parlez au client. Chaque fin de mois, la facture se prépare depuis le temps saisi.',
    },
    comparison: [
      { before: 'Temps reconstitué en fin de mois', after: 'Temps saisi au fil de l’eau' },
      { before: 'Budget suivi de tête', after: 'Budget comparé au réalisé' },
      { before: 'Comptes rendus éparpillés', after: 'Notes dictées classées par mandat' },
      { before: 'Factures et comptabilité le vendredi', after: 'Factures et comptabilité alimentées automatiquement' },
      { before: 'Relances gênantes', after: 'Relances automatiques' },
    ],
    faq: [
      { question: 'Cantia convient-il à un consultant indépendant ?', answer: 'Oui, offres, temps, factures et comptabilité suffisent pour travailler seul.' },
      { question: 'Puis-je appeler mes projets « mandats » ?', answer: 'Oui, vous choisissez le terme utilisé dans l’application et sur vos documents.' },
      { question: 'Puis-je facturer au temps passé ?', answer: 'Oui, les heures saisies sur le mandat peuvent servir de base à la facture.' },
      { question: 'Ma fiduciaire peut-elle accéder à mes chiffres ?', answer: 'Oui, si vous l’autorisez, en lecture et avec un journal des accès.' },
      { question: 'Cantia prépare-t-il le décompte TVA ?', answer: 'Oui, pour les entreprises assujetties, à partir de vos factures et dépenses.' },
    ],
    relatedBlogSlugs: ['forfait-ou-temps-passe-consultant-suisse'],
    relatedTrades: ['informaticien', 'formateur'],
  },

  formateur: {
    slug: 'formateur',
    tradeName: 'formateur',
    general: true,
    seo: {
      title: 'Logiciel de gestion pour formateurs et écoles privées en Suisse | Cantia',
      description:
        'Offres de formation, planning des cours, heures des intervenants, salaires et factures QR : Cantia aide les formateurs indépendants et petites écoles en Suisse.',
    },
    hero: {
      eyebrow: 'Gestion d’entreprise pour formateurs',
      title: 'Des cours planifiés, des intervenants payés, des factures envoyées',
      subtitle:
        'Cantia aide les formateurs indépendants, auto-écoles et petites écoles privées à proposer leurs formations, planifier les cours, suivre les heures et facturer sans retard.',
    },
    painPoints: [
      {
        problem: 'Le planning des cours change souvent',
        consequence: 'Un remplacement mal communiqué, et une salle attend son formateur.',
        response: 'Le planning des intervenants est partagé et visible sur téléphone.',
      },
      {
        problem: 'Les heures des intervenants sont recopiées à la main',
        consequence: 'Erreurs de salaire et soirées passées sur des tableurs.',
        response: 'Les heures saisies donnent les fiches de salaire, avec les déductions suisses.',
      },
      {
        problem: 'Les factures aux entreprises tardent',
        consequence: 'La formation est donnée en mars, payée en juin.',
        response: 'La facture se prépare depuis l’offre dès la fin du cours, avec relances automatiques.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Offres de formation', text: 'Modules, journées et forfaits en catalogue, signature en ligne.' },
      { icon: 'calendar', title: 'Planning des cours', text: 'Qui donne quel cours, où et quand, synchronisable avec Google Agenda.' },
      { icon: 'clock', title: 'Heures des intervenants', text: 'Chaque heure rattachée à la bonne formation.' },
      { icon: 'users', title: 'Salaires', text: 'Fiches de salaire mensuelles et certificat de salaire annuel.' },
      { icon: 'credit-card', title: 'Factures QR', text: 'Aux entreprises comme aux particuliers, avec relances automatiques.' },
      { icon: 'folder', title: 'Supports et attestations', text: 'Supports de cours, listes et attestations classés par formation.' },
    ],
    scenario: {
      title: 'Exemple : une formation de trois jours en entreprise',
      text: 'L’offre part avec le programme. Le client signe. Les trois journées entrent au planning de l’intervenant, qui saisit ses heures. Le dernier jour, la facture se prépare depuis l’offre ; à la fin du mois, ses heures apparaissent sur sa fiche de salaire.',
    },
    comparison: [
      { before: 'Planning des cours par e-mail', after: 'Planning partagé' },
      { before: 'Heures recopiées pour les salaires', after: 'Heures reprises dans les fiches de salaire' },
      { before: 'Offres refaites à chaque fois', after: 'Offres depuis votre catalogue' },
      { before: 'Factures envoyées des semaines après', after: 'Facture prête à la fin du cours' },
      { before: 'Documents dispersés', after: 'Classés par formation' },
    ],
    faq: [
      { question: 'Cantia convient-il à un formateur indépendant ?', answer: 'Oui, offres, planning et factures suffisent pour démarrer seul.' },
      { question: 'Puis-je payer des intervenants à l’heure ?', answer: 'Oui, les salaires à l’heure sont calculés à partir des heures saisies, avec les déductions suisses.' },
      { question: 'Cantia gère-t-il les inscriptions en ligne des participants ?', answer: 'Non, Cantia gère vos offres, votre planning, vos heures et votre facturation, pas les inscriptions publiques.' },
      { question: 'Puis-je synchroniser le planning avec Google Agenda ?', answer: 'Oui, dans les deux sens, pour chaque utilisateur.' },
      { question: 'Cantia gère-t-il la QR-facture suisse ?', answer: 'Oui, sur toutes les factures.' },
    ],
    relatedBlogSlugs: ['formateur-independant-suisse-tva-facture'],
    relatedTrades: ['consultant', 'informaticien'],
  },
};

export const TRADE_PAGE_SLUGS = Object.keys(TRADE_PAGES);

export function getTradePage(slug: string, locale: string): TradeLandingPage | undefined {
  if (locale === 'de' && TRADE_PAGES_DE[slug]) return TRADE_PAGES_DE[slug];
  if (locale === 'it' && TRADE_PAGES_IT[slug]) return TRADE_PAGES_IT[slug];
  return TRADE_PAGES[slug];
}

const PLURAL_OVERRIDES: Record<string, string> = {
  'entreprise générale': 'Entreprises générales',
  'entreprise de rénovation': 'Entreprises de rénovation',
  'entreprise de démolition': 'Entreprises de démolition',
  'construction bois': 'Entreprises de construction bois',
  'génie civil': 'Entreprises de génie civil',
  'entreprise de nettoyage': 'Entreprises de nettoyage',
  conciergerie: 'Conciergeries & facility management',
  'déménageur': 'Déménageurs',
  informaticien: 'Informaticiens & PME IT',
  graphiste: 'Graphistes & agences',
  photographe: 'Photographes & vidéastes',
  traiteur: 'Traiteurs & événementiel',
  consultant: 'Consultants',
  formateur: 'Formateurs & écoles',
};

export function pluralTradeName(tradeName: string): string {
  if (PLURAL_OVERRIDES[tradeName]) return PLURAL_OVERRIDES[tradeName];
  return tradeName.charAt(0).toUpperCase() + tradeName.slice(1) + 's';
}
