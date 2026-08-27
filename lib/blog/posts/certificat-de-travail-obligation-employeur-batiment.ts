import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'certificat-de-travail-obligation-employeur-batiment',
  question: 'Un employeur du bâtiment est-il obligé de délivrer un certificat de travail, et que doit-il contenir ?',
  title: 'Certificat de travail dans le bâtiment : une obligation, pas une faveur',
  description:
    'Un employé quittant l’entreprise a le droit d’exiger un certificat de travail à tout moment — le refuser ou le bâcler expose l’employeur à un litige, même longtemps après le départ.',
  excerpt:
    'Beaucoup de petites entreprises traitent le certificat de travail comme une formalité de dernière minute. C’est un droit de l’employé, encadré par des règles précises sur ce qu’il peut et ne peut pas contenir.',
  category: 'RH & salaires',
  keywords: ['certificat de travail obligation', 'certificat de travail employé bâtiment', 'attestation de travail Suisse', 'droit employé certificat', 'fin contrat travail bâtiment'],
  publishedAt: '2026-06-26',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'L’art. 330a du Code des obligations donne à tout employé, sans exception, le droit d’exiger de son employeur un certificat de travail — que le départ soit une démission, un licenciement, ou une fin de contrat à durée déterminée. Ce droit existe à tout moment, y compris des années après le départ effectif de l’entreprise.',
    },
    { type: 'h2', text: 'Deux formes possibles' },
    {
      type: 'list',
      items: [
        'Le certificat complet : nature et durée des rapports de travail, qualité du travail et de la conduite — c’est la forme par défaut si l’employé ne précise pas',
        'L’attestation de travail simple : uniquement la nature et la durée de l’emploi, sans appréciation — l’employé peut la demander explicitement à la place du certificat complet',
      ],
    },
    { type: 'h2', text: 'Ce que le certificat ne doit jamais contenir' },
    {
      type: 'list',
      items: [
        'Des formulations codées ou ambiguës destinées à nuire discrètement à l’employé (une pratique reconnue et sanctionnée par la jurisprudence)',
        'Des jugements de valeur non objectivement fondés sur des faits vérifiables',
        'Une mention de maladie, grossesse ou tout élément sans lien direct avec la prestation de travail elle-même',
      ],
    },
    {
      type: 'callout',
      title: 'Un certificat de travail rédigé à la va-vite se retourne souvent contre l’entreprise',
      text: 'Un employé qui estime son certificat inexact ou trop vague peut en demander la rectification, voire saisir le tribunal — mieux vaut le rédiger avec soin dès la première fois que de devoir le refaire sous contrainte.',
    },
    { type: 'h2', text: 'Comment simplifier sa rédaction' },
    {
      type: 'p',
      text: 'Un certificat de travail bien fondé s’appuie sur des faits concrets et documentés : les chantiers réalisés, les responsabilités tenues, les compétences démontrées au fil du temps — plus l’activité de l’employé a été suivie et tracée pendant son emploi, plus la rédaction devient rapide et objective.',
    },
    {
      type: 'cta',
      title: 'Un historique d’activité par employé, prêt quand il le faut',
      text: 'Le module RH de Cantia garde une trace des affectations et de l’activité de chaque membre de l’équipe — une base concrète pour rédiger un certificat de travail juste et rapide.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un employeur peut-il refuser de délivrer un certificat de travail ?',
      answer:
        'Non, c’est un droit de l’employé prévu par l’art. 330a CO, exigible à tout moment, y compris longtemps après la fin des rapports de travail.',
    },
    {
      question: 'Quelle est la différence entre un certificat complet et une attestation de travail ?',
      answer:
        'Le certificat complet inclut une appréciation de la qualité du travail et de la conduite, tandis que l’attestation simple ne mentionne que la nature et la durée de l’emploi, à la demande de l’employé.',
    },
    {
      question: 'Peut-on mentionner une maladie dans un certificat de travail ?',
      answer:
        'Non, sauf lien direct avec la prestation de travail elle-même — mentionner une maladie ou une grossesse sans pertinence directe n’est pas autorisé.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'demission-employe-batiment-preavis-a-respecter',
    'apprenti-batiment-salaire-obligations-employeur',
  ],
};
