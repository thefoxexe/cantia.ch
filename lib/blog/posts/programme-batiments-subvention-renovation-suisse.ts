import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'programme-batiments-subvention-renovation-suisse',
  question: 'Qu’est-ce que le Programme Bâtiments et comment ça concerne un artisan du bâtiment ?',
  title: 'Le Programme Bâtiments : ce qu’un artisan doit savoir pour ses clients',
  description:
    'Le Programme Bâtiments soutient la rénovation énergétique en Suisse : isolation, remplacement de chauffage fossile. Ce qu’un artisan doit savoir pour informer ses clients.',
  excerpt:
    'Vos clients vous en parlent régulièrement sans toujours bien le comprendre. Voici l’essentiel du Programme Bâtiments à connaître pour les orienter correctement, sans jouer les conseillers financiers.',
  category: 'Juridique & normes',
  keywords: [
    'programme bâtiments suisse',
    'subvention rénovation énergétique',
    'aide isolation suisse',
    'subvention remplacement chauffage',
  ],
  publishedAt: '2026-10-03',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le Programme Bâtiments (dasGebäudeprogramm en Suisse alémanique, il Programma Edifici au Tessin) est un dispositif commun à la Confédération et aux cantons, qui soutient financièrement la rénovation énergétique du parc immobilier suisse. Il est financé en partie par la taxe sur le CO2, et administré directement par les cantons, ce qui explique pourquoi ses conditions concrètes varient d’un canton à l’autre.',
    },
    { type: 'h2', text: 'Ce que le programme soutient, en général' },
    {
      type: 'list',
      items: [
        'L’isolation de l’enveloppe du bâtiment : toiture, façade, sols contre locaux non chauffés',
        'Le remplacement d’un chauffage à énergie fossile (mazout, gaz) par une solution renouvelable',
        'Certains assainissements globaux et rénovations énergétiques d’ensemble, selon les programmes cantonaux',
      ],
    },
    {
      type: 'p',
      text: 'Le montant du soutien et les conditions précises d’éligibilité varient selon le canton et le type de travaux concernés. Un artisan ne doit jamais annoncer un montant précis de subvention à un client sans que celui-ci l’ait vérifié directement sur le site du programme cantonal correspondant, car les barèmes évoluent et diffèrent d’un canton à l’autre.',
    },
    { type: 'h2', text: 'Le rôle de l’artisan face à ce type de demande' },
    {
      type: 'p',
      text: 'De nombreux clients demandent un devis en s’attendant déjà à une subvention, parfois sur la base d’informations approximatives glanées ailleurs. L’artisan n’a pas à se substituer à un conseiller en efficacité énergétique, mais peut utilement orienter le client vers le site cantonal du Programme Bâtiments et, selon les cantons, vers un conseil énergétique préalable, parfois lui-même requis pour certaines demandes de subvention. Présenter un devis clair, net de toute subvention, reste la meilleure pratique : le client demande ensuite le remboursement de son côté, une fois les travaux réalisés et le dossier déposé selon les règles cantonales.',
    },
    {
      type: 'callout',
      title: 'Le calendrier administratif peut décaler le chantier',
      text: 'Dans certains cantons, une demande de subvention doit être déposée et parfois validée avant le début des travaux pour rester éligible. Un artisan qui démarre un chantier sans que son client ait vérifié ce point peut lui faire perdre le droit à l’aide, ce qui vaut la peine d’être rappelé avant la signature du devis.',
    },
    {
      type: 'cta',
      title: 'Des devis clairs, indépendants des subventions',
      text: 'Cantia permet de présenter un devis net et transparent à vos clients, qu’ils fassent ensuite ou non une demande auprès du Programme Bâtiments de leur canton.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le Programme Bâtiments est-il le même dans tous les cantons ?',
      answer:
        'Le cadre général est commun à la Confédération et aux cantons, mais chaque canton administre son propre programme avec ses conditions et montants spécifiques. Il faut toujours vérifier les règles du canton concerné.',
    },
    {
      question: 'Un artisan peut-il garantir un montant de subvention à son client ?',
      answer:
        'Non, ce n’est pas son rôle et les montants exacts dépendent de critères cantonaux qui évoluent. Le client doit vérifier lui-même le montant exact sur le site du programme cantonal avant de compter dessus dans son budget.',
    },
    {
      question: 'Faut-il déposer la demande de subvention avant de commencer les travaux ?',
      answer:
        'Cela dépend du canton et du type de travaux : certains programmes exigent que la demande soit déposée, voire validée, avant le début du chantier. C’est un point à vérifier systématiquement avant de signer un devis.',
    },
  ],
  relatedSlugs: [
    'devis-pompe-a-chaleur-chiffrage',
    'devis-facture-installateur-solaire-suisse',
    'permis-construire-renovation-quand-necessaire',
    'devis-facture-facadier-isolation-suisse',
  ],
};
