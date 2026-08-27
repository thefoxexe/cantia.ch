import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prescription-facture-impayee-delai-10-ans',
  question: 'Au bout de combien de temps une facture impayée devient-elle légalement irrécouvrable en Suisse ?',
  title: 'Prescription d’une facture impayée en Suisse : le délai qu’il ne faut jamais laisser filer',
  description:
    'Une créance contractuelle se prescrit en principe par 10 ans en Suisse — mais des actes interruptifs existent, et les ignorer peut faire perdre définitivement le droit de réclamer un paiement.',
  excerpt:
    'Dix ans paraît long — jusqu’à ce qu’une vieille facture oubliée dans un dossier se révèle totalement irrécupérable au moment où l’entreprise en a le plus besoin.',
  category: 'Devis & facturation',
  keywords: ['prescription facture impayée', 'délai prescription créance suisse', 'facture ancienne impayée', 'interruption prescription', 'créance construction délai'],
  publishedAt: '2026-06-12',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Une créance née d’un contrat (comme une facture de travaux impayée) se prescrit en principe par 10 ans en droit suisse, selon le régime général de l’art. 127 CO. Une fois ce délai écoulé sans action, le débiteur peut légalement refuser de payer en invoquant la prescription — la créance existe toujours moralement, mais devient juridiquement inexigible.',
    },
    { type: 'h2', text: 'Ce qui interrompt le délai (et le fait repartir à zéro)' },
    {
      type: 'list',
      items: [
        'Une poursuite engagée à l’office des poursuites',
        'Une reconnaissance de dette signée par le débiteur, même partielle',
        'Un acte judiciaire (assignation, demande en justice)',
        'Un simple rappel ou une relance amiable, en revanche, n’interrompt PAS la prescription — seule une action formelle le fait',
      ],
    },
    {
      type: 'callout',
      title: 'Une simple relance par e-mail ne suffit jamais à repousser le délai',
      text: 'C’est l’erreur la plus fréquente : croire qu’un rappel régulier « garde la créance vivante ». Seuls une poursuite, une reconnaissance de dette signée ou une action en justice interrompent réellement la prescription.',
    },
    { type: 'h2', text: 'Pourquoi ce délai ne doit jamais être pris à la légère' },
    {
      type: 'p',
      text: 'Dix ans semble une échéance lointaine — jusqu’à ce qu’une créance ancienne, oubliée dans les archives d’une petite entreprise, se révèle totalement irrécupérable au moment où elle serait utile. Un suivi centralisé de chaque facture, avec sa date d’émission et son statut de paiement, est le seul moyen fiable de repérer une créance qui approche de sa prescription avant qu’il ne soit trop tard pour agir.',
    },
    {
      type: 'cta',
      title: 'Aucune facture impayée oubliée dans un tiroir',
      text: 'Cantia garde un historique complet de chaque facture et son statut de paiement — de quoi repérer une créance ancienne avant qu’elle ne devienne irrécupérable.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Au bout de combien de temps une créance se prescrit-elle en Suisse ?',
      answer:
        'En principe 10 ans pour une créance contractuelle selon le régime général de l’art. 127 CO, sauf délais particuliers applicables à certains types de contrats.',
    },
    {
      question: 'Une relance amiable interrompt-elle la prescription ?',
      answer:
        'Non — seuls une poursuite, une reconnaissance de dette signée par le débiteur ou une action en justice interrompent réellement le délai de prescription.',
    },
    {
      question: 'Que se passe-t-il quand une créance est prescrite ?',
      answer:
        'Le débiteur peut légalement refuser de payer en invoquant la prescription devant un tribunal — la créance devient juridiquement inexigible, même si elle reste due moralement.',
    },
  ],
  relatedSlugs: [
    'poursuite-facture-impayee-procedure-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
