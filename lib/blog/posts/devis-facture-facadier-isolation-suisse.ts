import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-facadier-isolation-suisse',
  question: 'Comment chiffrer un devis de façade et d’isolation périphérique en tenant compte des aides cantonales ?',
  title: 'Façadier et isolation périphérique : chiffrer un devis qui tient compte des subventions',
  description:
    'Un devis d’isolation périphérique (CECB, Programme Bâtiments) implique souvent une demande de subvention en parallèle du chantier. Comment structurer devis et facturation sans bloquer le dossier du client.',
  excerpt:
    'L’isolation périphérique est l’un des rares chantiers du bâtiment où le prix du devis influence directement un dossier administratif parallèle — la subvention cantonale — et cette dépendance change la façon de facturer.',
  category: 'Métiers du bâtiment',
  keywords: ['devis façade isolation', 'facturation isolation périphérique Suisse', 'subvention Programme Bâtiments devis', 'prix isolation façade m2', 'CECB devis rénovation'],
  publishedAt: '2026-09-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Contrairement à la plupart des chantiers du bâtiment, un projet d’isolation périphérique s’accompagne souvent d’une demande de subvention cantonale (via le Programme Bâtiments) ou d’un certificat CECB. Le client attend fréquemment un devis conforme aux exigences du dossier avant même de le signer — ce qui change l’ordre habituel entre devis et engagement.',
    },
    { type: 'h2', text: 'Ce que le devis doit contenir pour rester compatible subvention' },
    {
      type: 'list',
      items: [
        'Épaisseur et valeur d’isolation (valeur U) clairement indiquées, pas seulement le type de matériau',
        'Surface de façade traitée détaillée, car les subventions sont souvent calculées au m²',
        'Distinction entre façade, socle et pourtour des fenêtres, qui peuvent avoir des exigences différentes',
        'Date de réalisation prévisionnelle, certains cantons imposant un délai entre l’octroi et la fin des travaux',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 400-1200',
      label: 'ordre de grandeur des aides cantonales par élément d’enveloppe assaini, très variable selon le canton et le type de bâtiment',
    },
    { type: 'h2', text: 'Ne pas faire dépendre sa trésorerie du calendrier de la subvention' },
    {
      type: 'p',
      text: 'Le versement d’une subvention peut prendre plusieurs mois après la fin des travaux. Facturer normalement le client selon l’avancement du chantier — sans attendre le versement cantonal pour émettre la facture — évite que la trésorerie de l’entreprise dépende du rythme administratif d’un tiers.',
    },
    {
      type: 'callout',
      title: 'Le devis doit rester valable pendant toute la durée du dossier de subvention',
      text: 'Un dossier de subvention peut prendre plusieurs semaines à être validé. Prévoir une durée de validité de devis suffisamment longue — ou une clause de révision claire si elle est dépassée — évite de devoir refaire un devis identique juste pour une question de délai administratif.',
    },
    {
      type: 'cta',
      title: 'Des devis détaillés, prêts à accompagner un dossier de subvention',
      text: 'Cantia permet de générer des devis clairs et détaillés par poste, avec toutes les surfaces et quantités nécessaires pour appuyer un dossier de subvention cantonale.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le devis d’isolation périphérique doit-il indiquer la valeur U du matériau ?',
      answer:
        'C’est fortement recommandé — les dossiers de subvention cantonaux (Programme Bâtiments) exigent généralement une valeur d’isolation précise, pas seulement une désignation commerciale du matériau.',
    },
    {
      question: 'Faut-il attendre le versement de la subvention avant de facturer le client ?',
      answer:
        'Non — il est préférable de facturer selon l’avancement normal du chantier, sans lier sa propre trésorerie au calendrier de versement, parfois long, de l’aide cantonale.',
    },
    {
      question: 'Un devis d’isolation périphérique doit-il avoir une durée de validité plus longue que la moyenne ?',
      answer:
        'C’est conseillé, car le montage d’un dossier de subvention peut prendre plusieurs semaines — une clause de révision claire évite de devoir refaire un devis identique pour un simple dépassement de délai.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'devis-charpente-bois-facturation-suisse',
    'permis-construire-renovation-quand-necessaire',
  ],
};
