// cantia.ch/black-friday (and /de, /it): the first Black Friday of Cantia.
// Lifetime prices on the three public plans, only through this page and
// only until Monday 30 November 2026 at midnight, Zurich time. The prices
// and the dates live in the price_offers table (migration
// 20261126120000_black_friday_2026.sql); stripe-checkout checks them again.

import type { SiteLocale } from './copy';
import type { PlanId } from './pricing';

export const BF_CODE = 'BF2026';
// Monday 30 November 2026, 24:00 in Zurich (CET, UTC+1).
export const BF_ENDS_AT = Date.UTC(2026, 10, 30, 23, 0, 0);
export const BF_PRICES: Record<PlanId, { monthly: number; yearly: number }> = {
  solo: { monthly: 25, yearly: 240 },
  equipe: { monthly: 45, yearly: 432 },
  pro: { monthly: 59, yearly: 566.4 },
};

export interface BlackFridayCopy {
  seoTitle: string;
  seoDescription: string;
  ribbon: string;
  eyebrow: string;
  h1Plain: string;
  h1Accent: string;
  lead: string;
  cta: string;
  reassurance: string[];
  endsLabel: string;
  units: [string, string, string, string];
  monthly: string;
  yearly: string;
  yearlyExtra: string;
  perMonth: string;
  billedMonthly: string;
  billedYearly: (amount: string) => string;
  instead: (amount: string) => string;
  lifetime: string;
  bestDeal: string;
  planCta: (name: string) => string;
  savePerYear: (amount: string) => string;
  pricesEyebrow: string;
  pricesPlain: string;
  pricesAccent: string;
  whyEyebrow: string;
  whyPlain: string;
  whyAccent: string;
  why: { title: string; text: string }[];
  includedEyebrow: string;
  includedTitle: string;
  included: string[];
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faqEyebrow: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalText: string;
  endedEyebrow: string;
  endedTitle: string;
  endedText: string;
  endedCta: string;
}

const fr: BlackFridayCopy = {
  seoTitle: 'Black Friday Cantia : jusqu’à -54 % à vie | Cantia',
  seoDescription: 'Le premier Black Friday de Cantia : jusqu’à -54 % sur tous les plans, prix bloqué à vie. Jusqu’au lundi 30 novembre à minuit seulement.',
  ribbon: 'Black Friday · Jusqu’à -54 % à vie · Fin lundi à minuit',
  eyebrow: 'Black Friday · 27 – 30 novembre',
  h1Plain: 'Le premier Black Friday de Cantia.',
  h1Accent: 'Vos prix bloqués à vie.',
  lead: 'Jusqu’à -54 % sur tous les plans, et pas seulement cette année : le prix que vous prenez ce week-end reste le vôtre, chaque mois, tant que votre abonnement est actif. C’est la meilleure offre que Cantia fera jamais.',
  cta: 'Je bloque mon prix',
  reassurance: ['14 jours d’essai', 'Résiliable à tout moment', 'Sans engagement'],
  endsLabel: 'L’offre se termine lundi 30 novembre à minuit',
  units: ['jours', 'heures', 'min', 'sec'],
  monthly: 'Mensuel',
  yearly: 'Annuel',
  yearlyExtra: '-20 % en plus',
  perMonth: '/ mois',
  billedMonthly: 'Facturé chaque mois',
  billedYearly: (a) => `Facturé CHF ${a} par an`,
  instead: () => 'au lieu de ',
  lifetime: 'Prix bloqué à vie',
  bestDeal: 'La meilleure affaire',
  planCta: (n) => `Prendre ${n} à ce prix`,
  savePerYear: (a) => `CHF ${a} économisés chaque année`,
  pricesEyebrow: 'Les prix Black Friday',
  pricesPlain: 'Tous les plans.',
  pricesAccent: 'Beaucoup moins chers.',
  whyEyebrow: 'Pourquoi à vie ?',
  whyPlain: 'Une seule fois.',
  whyAccent: 'Jamais aussi bas.',
  why: [
    { title: 'Le premier, et le meilleur', text: 'C’est le tout premier Black Friday de Cantia. Nous ne referons pas une remise aussi forte : les prochaines offres seront moins généreuses que celle-ci.' },
    { title: 'Votre prix ne bouge plus', text: 'Le prix est fixé sur votre abonnement. Il se renouvelle chaque mois ou chaque année au même montant, même quand nos tarifs augmenteront.' },
    { title: 'Aucun risque', text: 'Nouveau compte : 14 jours d’essai, rien n’est débité avant la fin. Si Cantia ne vous convient pas, vous résiliez en deux clics.' },
  ],
  includedEyebrow: 'Ce que vous obtenez',
  includedTitle: 'Tout Cantia, au prix du Black Friday.',
  included: [
    'Devis et factures QR illimités',
    'Rapports de chantier, photos et dictée vocale',
    'Soumissions, métrés et post-calcul',
    'Planning des équipes et des chantiers',
    'Heures, frais et fiches de salaire',
    'Comptabilité, TVA et trésorerie',
    'Application mobile iPhone et Android',
    'En français, en allemand et en italien',
  ],
  stepsEyebrow: 'Comment ça marche',
  stepsTitle: 'Trois minutes, et votre prix est à vous.',
  steps: [
    { title: 'Choisissez votre plan', text: 'Sur cette page, avant lundi minuit. Le prix Black Friday n’existe que depuis ici.' },
    { title: 'Créez votre compte', text: 'Nom, e-mail, mot de passe : deux minutes. Le prix vous suit jusqu’au paiement.' },
    { title: 'C’est bloqué à vie', text: 'Le prix Black Friday est appliqué à votre abonnement et ne change plus.' },
  ],
  faqEyebrow: 'Questions fréquentes',
  faqTitle: 'Avant de bloquer votre prix.',
  faq: [
    { q: 'C’est vraiment à vie ?', a: 'Oui. Le prix est fixé sur votre abonnement : il se renouvelle au même montant, chaque mois ou chaque année, tant que l’abonnement reste actif. Si vous résiliez, le prix Black Friday est perdu.' },
    { q: 'Que se passe-t-il après lundi minuit ?', a: 'L’offre s’arrête lundi 30 novembre à minuit, heure suisse. Après, seuls les tarifs habituels sont disponibles, dès CHF 39.– par mois. Il ne sera plus possible d’obtenir ces prix.' },
    { q: 'Ai-je droit à l’essai gratuit ?', a: 'Oui, si c’est votre premier abonnement : 14 jours d’essai, rien n’est débité avant la fin. Le prix Black Friday est bloqué dès l’inscription, même si vous ne payez qu’après l’essai.' },
    { q: 'Puis-je changer de plan plus tard ?', a: 'Oui, mais le prix Black Friday est lié au plan choisi ce week-end. Si vous changez de plan, c’est le tarif habituel du nouveau plan qui s’applique. Prenez donc le plan qui vous suivra quand l’entreprise grandit.' },
    { q: 'Je suis déjà client. Et moi ?', a: 'Votre abonnement reste tel quel. Si vous payez au mois et souhaitez passer à l’annuel au prix Black Friday, écrivez-nous avant lundi minuit et nous le faisons pour vous.' },
    { q: 'La TVA est-elle en plus ?', a: 'Non. Le prix affiché est le montant facturé.' },
  ],
  finalTitle: 'Lundi à minuit, c’est fini.',
  finalText: 'Après, ces prix ne reviendront pas. Bloquez le vôtre maintenant : l’essai est gratuit et vous pouvez résilier à tout moment.',
  endedEyebrow: 'Black Friday 2026',
  endedTitle: 'L’offre Black Friday est terminée.',
  endedText: 'Merci aux entreprises qui en ont profité. Les tarifs habituels restent disponibles, avec 14 jours d’essai.',
  endedCta: 'Voir les tarifs',
};

const de: BlackFridayCopy = {
  seoTitle: 'Black Friday Cantia: bis zu -54 % lebenslang | Cantia',
  seoDescription: 'Der erste Black Friday von Cantia: bis zu -54 % auf alle Pläne, Preis lebenslang garantiert. Nur bis Montag, 30. November, Mitternacht.',
  ribbon: 'Black Friday · Bis zu -54 % lebenslang · Ende Montag um Mitternacht',
  eyebrow: 'Black Friday · 27. – 30. November',
  h1Plain: 'Der erste Black Friday von Cantia.',
  h1Accent: 'Ihr Preis, lebenslang.',
  lead: 'Bis zu -54 % auf alle Pläne, und nicht nur dieses Jahr: Der Preis, den Sie an diesem Wochenende wählen, bleibt Ihrer, solange Ihr Abo aktiv ist. Ein besseres Angebot wird Cantia nie machen.',
  cta: 'Preis jetzt sichern',
  reassurance: ['14 Tage testen', 'Jederzeit kündbar', 'Ohne Bindung'],
  endsLabel: 'Das Angebot endet am Montag, 30. November, um Mitternacht',
  units: ['Tage', 'Std.', 'Min.', 'Sek.'],
  monthly: 'Monatlich',
  yearly: 'Jährlich',
  yearlyExtra: 'zusätzlich -20 %',
  perMonth: '/ Monat',
  billedMonthly: 'Monatlich verrechnet',
  billedYearly: (a) => `CHF ${a} pro Jahr verrechnet`,
  instead: () => 'statt ',
  lifetime: 'Preis lebenslang garantiert',
  bestDeal: 'Das beste Angebot',
  planCta: (n) => `${n} zu diesem Preis`,
  savePerYear: (a) => `CHF ${a} gespart, jedes Jahr`,
  pricesEyebrow: 'Die Black-Friday-Preise',
  pricesPlain: 'Alle Pläne.',
  pricesAccent: 'Viel günstiger.',
  whyEyebrow: 'Warum lebenslang?',
  whyPlain: 'Nur einmal.',
  whyAccent: 'Nie wieder so tief.',
  why: [
    { title: 'Der erste und der beste', text: 'Es ist der allererste Black Friday von Cantia. Einen so hohen Rabatt geben wir nicht wieder: Spätere Angebote werden weniger grosszügig sein.' },
    { title: 'Ihr Preis bleibt', text: 'Der Preis ist an Ihr Abo gebunden. Er verlängert sich jeden Monat oder jedes Jahr zum gleichen Betrag, auch wenn unsere Tarife steigen.' },
    { title: 'Kein Risiko', text: 'Neues Konto: 14 Tage testen, vorher wird nichts belastet. Passt Cantia nicht, kündigen Sie mit zwei Klicks.' },
  ],
  includedEyebrow: 'Das erhalten Sie',
  includedTitle: 'Ganz Cantia, zum Black-Friday-Preis.',
  included: [
    'Unbegrenzt Offerten und QR-Rechnungen',
    'Baustellenrapporte, Fotos und Sprachdiktat',
    'Ausschreibungen, Ausmass und Nachkalkulation',
    'Einsatzplanung für Teams und Baustellen',
    'Stunden, Spesen und Lohnabrechnungen',
    'Buchhaltung, MWST und Liquidität',
    'Mobile App für iPhone und Android',
    'Auf Deutsch, Französisch und Italienisch',
  ],
  stepsEyebrow: 'So funktioniert es',
  stepsTitle: 'Drei Minuten, und der Preis gehört Ihnen.',
  steps: [
    { title: 'Plan wählen', text: 'Auf dieser Seite, vor Montag Mitternacht. Den Black-Friday-Preis gibt es nur hier.' },
    { title: 'Konto erstellen', text: 'Name, E-Mail, Passwort: zwei Minuten. Der Preis begleitet Sie bis zur Zahlung.' },
    { title: 'Lebenslang gesichert', text: 'Der Black-Friday-Preis gilt für Ihr Abo und ändert sich nicht mehr.' },
  ],
  faqEyebrow: 'Häufige Fragen',
  faqTitle: 'Bevor Sie Ihren Preis sichern.',
  faq: [
    { q: 'Gilt das wirklich lebenslang?', a: 'Ja. Der Preis ist an Ihr Abo gebunden: Er verlängert sich zum gleichen Betrag, monatlich oder jährlich, solange das Abo aktiv ist. Wenn Sie kündigen, verfällt der Black-Friday-Preis.' },
    { q: 'Was passiert nach Montag Mitternacht?', a: 'Das Angebot endet am Montag, 30. November, um Mitternacht Schweizer Zeit. Danach gelten nur noch die normalen Tarife ab CHF 39.– pro Monat. Diese Preise gibt es dann nicht mehr.' },
    { q: 'Kann ich gratis testen?', a: 'Ja, wenn es Ihr erstes Abo ist: 14 Tage, vorher wird nichts belastet. Der Black-Friday-Preis ist ab der Anmeldung gesichert, auch wenn Sie erst nach der Testphase zahlen.' },
    { q: 'Kann ich später den Plan wechseln?', a: 'Ja, aber der Black-Friday-Preis gilt für den Plan, den Sie an diesem Wochenende wählen. Bei einem Wechsel gilt der normale Tarif des neuen Plans. Wählen Sie also den Plan, der mit Ihrem Unternehmen mitwächst.' },
    { q: 'Ich bin schon Kunde. Und ich?', a: 'Ihr Abo bleibt, wie es ist. Zahlen Sie monatlich und möchten zum Jahresabo mit Black-Friday-Preis wechseln, schreiben Sie uns vor Montag Mitternacht und wir erledigen das für Sie.' },
    { q: 'Kommt die MWST dazu?', a: 'Nein. Der angezeigte Preis ist der verrechnete Betrag.' },
  ],
  finalTitle: 'Montag um Mitternacht ist Schluss.',
  finalText: 'Danach kommen diese Preise nicht wieder. Sichern Sie Ihren jetzt: Die Testphase ist gratis und Sie können jederzeit kündigen.',
  endedEyebrow: 'Black Friday 2026',
  endedTitle: 'Das Black-Friday-Angebot ist beendet.',
  endedText: 'Danke an alle Unternehmen, die mitgemacht haben. Die normalen Tarife sind weiterhin verfügbar, mit 14 Tagen Testphase.',
  endedCta: 'Zu den Tarifen',
};

const it: BlackFridayCopy = {
  seoTitle: 'Black Friday Cantia: fino a -54 % a vita | Cantia',
  seoDescription: 'Il primo Black Friday di Cantia: fino a -54 % su tutti i piani, prezzo bloccato a vita. Solo fino a lunedì 30 novembre a mezzanotte.',
  ribbon: 'Black Friday · Fino a -54 % a vita · Fine lunedì a mezzanotte',
  eyebrow: 'Black Friday · 27 – 30 novembre',
  h1Plain: 'Il primo Black Friday di Cantia.',
  h1Accent: 'Il vostro prezzo, a vita.',
  lead: 'Fino a -54 % su tutti i piani, e non solo quest’anno: il prezzo che scegliete questo fine settimana resta vostro finché l’abbonamento è attivo. È la migliore offerta che Cantia farà mai.',
  cta: 'Blocco il mio prezzo',
  reassurance: ['14 giorni di prova', 'Disdicibile in qualsiasi momento', 'Senza vincoli'],
  endsLabel: 'L’offerta termina lunedì 30 novembre a mezzanotte',
  units: ['giorni', 'ore', 'min', 'sec'],
  monthly: 'Mensile',
  yearly: 'Annuale',
  yearlyExtra: '-20 % in più',
  perMonth: '/ mese',
  billedMonthly: 'Fatturato ogni mese',
  billedYearly: (a) => `Fatturato CHF ${a} all’anno`,
  instead: () => 'invece di ',
  lifetime: 'Prezzo bloccato a vita',
  bestDeal: 'L’affare migliore',
  planCta: (n) => `${n} a questo prezzo`,
  savePerYear: (a) => `CHF ${a} risparmiati ogni anno`,
  pricesEyebrow: 'I prezzi Black Friday',
  pricesPlain: 'Tutti i piani.',
  pricesAccent: 'Molto meno cari.',
  whyEyebrow: 'Perché a vita?',
  whyPlain: 'Una sola volta.',
  whyAccent: 'Mai così basso.',
  why: [
    { title: 'Il primo, e il migliore', text: 'È il primissimo Black Friday di Cantia. Non rifaremo uno sconto così forte: le prossime offerte saranno meno generose.' },
    { title: 'Il prezzo non cambia più', text: 'Il prezzo è legato al vostro abbonamento. Si rinnova ogni mese o ogni anno allo stesso importo, anche quando le nostre tariffe aumenteranno.' },
    { title: 'Nessun rischio', text: 'Nuovo account: 14 giorni di prova, nulla viene addebitato prima della fine. Se Cantia non fa per voi, disdite in due clic.' },
  ],
  includedEyebrow: 'Cosa ottenete',
  includedTitle: 'Tutto Cantia, al prezzo del Black Friday.',
  included: [
    'Preventivi e fatture QR illimitati',
    'Rapporti di cantiere, foto e dettatura vocale',
    'Capitolati, misurazioni e consuntivo',
    'Pianificazione di squadre e cantieri',
    'Ore, spese e buste paga',
    'Contabilità, IVA e tesoreria',
    'App mobile per iPhone e Android',
    'In italiano, francese e tedesco',
  ],
  stepsEyebrow: 'Come funziona',
  stepsTitle: 'Tre minuti, e il prezzo è vostro.',
  steps: [
    { title: 'Scegliete il piano', text: 'Da questa pagina, prima di lunedì a mezzanotte. Il prezzo Black Friday esiste solo qui.' },
    { title: 'Create l’account', text: 'Nome, e-mail, password: due minuti. Il prezzo vi segue fino al pagamento.' },
    { title: 'Bloccato a vita', text: 'Il prezzo Black Friday viene applicato all’abbonamento e non cambia più.' },
  ],
  faqEyebrow: 'Domande frequenti',
  faqTitle: 'Prima di bloccare il prezzo.',
  faq: [
    { q: 'È davvero a vita?', a: 'Sì. Il prezzo è legato all’abbonamento: si rinnova allo stesso importo, ogni mese o ogni anno, finché l’abbonamento resta attivo. Se disdite, il prezzo Black Friday va perso.' },
    { q: 'Cosa succede dopo lunedì a mezzanotte?', a: 'L’offerta termina lunedì 30 novembre a mezzanotte, ora svizzera. Dopo restano solo le tariffe abituali, da CHF 39.– al mese. Questi prezzi non saranno più disponibili.' },
    { q: 'Ho diritto alla prova gratuita?', a: 'Sì, se è il vostro primo abbonamento: 14 giorni, nulla viene addebitato prima della fine. Il prezzo Black Friday è bloccato dall’iscrizione, anche se pagate solo dopo la prova.' },
    { q: 'Posso cambiare piano in seguito?', a: 'Sì, ma il prezzo Black Friday è legato al piano scelto questo fine settimana. Cambiando piano si applica la tariffa abituale del nuovo piano. Scegliete quindi il piano che crescerà con la vostra impresa.' },
    { q: 'Sono già cliente. E io?', a: 'Il vostro abbonamento resta com’è. Se pagate al mese e volete passare all’annuale al prezzo Black Friday, scriveteci prima di lunedì a mezzanotte e lo facciamo noi.' },
    { q: 'L’IVA è in più?', a: 'No. Il prezzo indicato è l’importo fatturato.' },
  ],
  finalTitle: 'Lunedì a mezzanotte è finita.',
  finalText: 'Dopo, questi prezzi non torneranno. Bloccate il vostro ora: la prova è gratuita e potete disdire in qualsiasi momento.',
  endedEyebrow: 'Black Friday 2026',
  endedTitle: 'L’offerta Black Friday è terminata.',
  endedText: 'Grazie alle imprese che ne hanno approfittato. Le tariffe abituali restano disponibili, con 14 giorni di prova.',
  endedCta: 'Vedere le tariffe',
};

export const BLACK_FRIDAY_COPY: Record<SiteLocale, BlackFridayCopy> = { fr, de, it };
