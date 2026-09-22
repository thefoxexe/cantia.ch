import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-ferblantier-suisse',
  question: 'Comment établir devis et factures en tant que ferblantier en Suisse ?',
  title: 'Devis et facturation pour un ferblantier en Suisse',
  description:
    'Comment chiffrer un devis et facturer en tant que ferblantier en Suisse : chiffrage au mètre linéaire, lien avec la couverture, coût de la sécurité en hauteur.',
  excerpt:
    'Gouttières, chéneaux, habillages métalliques : le ferblantier chiffre au mètre linéaire un travail presque toujours réalisé en hauteur. Voici ce qui doit figurer dans le devis.',
  category: 'Métiers du bâtiment',
  keywords: [
    'devis ferblantier suisse',
    'facturation gouttières prix',
    'prix chéneau mètre linéaire',
    'ferblanterie couverture devis',
  ],
  publishedAt: '2026-10-02',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le ferblantier travaille rarement seul sur un chantier : son activité est très souvent liée à la couverture, sur des interventions de gouttières, chéneaux, habillages métalliques ou étanchéité de toiture qui accompagnent un chantier de toiture plus large. Le devis doit refléter cette coordination, pas seulement le prix du métal posé.',
    },
    { type: 'h2', text: 'Le mètre linéaire, unité de référence pour beaucoup de prestations' },
    {
      type: 'table',
      headers: ['Prestation', 'Unité de chiffrage courante', 'Facteur qui fait varier le prix'],
      rows: [
        ['Gouttière', 'Prix au mètre linéaire', 'Matériau (zinc, cuivre, alu) et section'],
        ['Chéneau', 'Prix au mètre linéaire', 'Complexité du profil et accès'],
        ['Habillage de rive ou de cheminée', 'Prix au mètre linéaire ou forfait', 'Découpe sur mesure et hauteur d’intervention'],
        ['Étanchéité de toiture plate', 'Prix au m²', 'Type de membrane et état du support'],
      ],
    },
    { type: 'h2', text: 'Le travail en hauteur a un coût à part entière' },
    {
      type: 'p',
      text: 'Une intervention de ferblanterie se fait presque toujours en hauteur, ce qui implique un dispositif de sécurité (échafaudage, ligne de vie, harnais) dont le coût doit apparaître explicitement dans le devis, et pas être noyé dans le prix au mètre linéaire. Sur un petit chantier, le montage et démontage de la protection peut représenter une part significative du temps facturé, ce que les clients comprennent mal s’ils ne voient qu’une ligne de gouttière sur le devis.',
    },
    {
      type: 'callout',
      title: 'Séparer le prix du métal du prix de l’accès',
      text: 'Un devis qui distingue clairement le matériau, la pose et le dispositif de sécurité en hauteur est plus facile à faire accepter qu’un forfait global, surtout quand le client compare plusieurs devis de ferblantiers et se demande pourquoi les prix diffèrent autant.',
    },
    {
      type: 'cta',
      title: 'Du mètre linéaire à la facture finale',
      text: 'Cantia permet de chiffrer une ferblanterie poste par poste, avec un prix au mètre linéaire et une ligne sécurité séparée, puis de facturer en coordination avec le reste du chantier de toiture.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi le prix d’une gouttière varie-t-il autant selon le matériau ?',
      answer:
        'Le zinc, le cuivre et l’aluminium ont des coûts d’achat et de mise en œuvre différents, et le cuivre en particulier reste nettement plus cher que le zinc, ce qui doit se refléter clairement dans le devis.',
    },
    {
      question: 'Faut-il facturer séparément l’échafaudage ou la protection en hauteur ?',
      answer:
        'C’est recommandé : cela évite que le client ne compare que le prix au mètre linéaire entre plusieurs devis sans comprendre pourquoi l’un inclut un dispositif de sécurité plus complet que l’autre.',
    },
    {
      question: 'Le ferblantier doit-il coordonner son devis avec celui du couvreur ?',
      answer:
        'Dans la plupart des cas oui, car les deux interventions se déroulent sur le même échafaudage et souvent dans la même fenêtre de chantier, ce qui permet aussi de mutualiser certains coûts d’accès.',
    },
  ],
  relatedSlugs: [
    'gestion-chantier-devis-couvreur-toiture-suisse',
    'devis-facture-facadier-isolation-suisse',
    'checklist-cloture-chantier-avant-facturation',
  ],
  relatedTradeSlug: 'ferblantier',
};
