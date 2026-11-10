// Texts of the sign-in, sign-up and password screens in the November 2026
// identity. Field labels, errors and Google/Microsoft buttons keep their
// existing translation keys (authLogin.*, authSignup.*…); only the framing
// lives here.

import type { AppLocale } from '../translations';

export type AuthProduct = 'cantia' | 'accounting' | 'partners';
type Story = { label: string; plain: string; accent: string; text: string };

export interface AuthCopy {
  back: string;
  privacy: string;
  privacyHref: string;
  help: string;
  helpHref: string;
  madeIn: string;
  show: string;
  hide: string;
  stories: Record<AuthProduct, Story>;
  login: { eyebrow: Record<AuthProduct, string>; title: string; text: Record<AuthProduct, string> };
  signup: { title: string; text: string; legalBefore: string; terms: string; legalMiddle: string; privacy: string; legalAfter: string; backToLogin: string };
  forgot: { title: string; text: string; submit: string; backToLogin: string };
  update: { title: string; text: string };
}

const fr: AuthCopy = {
  back: 'Retour au site',
  privacy: 'Confidentialité',
  privacyHref: 'https://cantia.ch/confidentialite',
  help: 'Besoin d’aide ?',
  helpHref: 'https://cantia.ch/aide',
  madeIn: 'Conçu en Suisse. Hébergé à Zurich.',
  show: 'Afficher',
  hide: 'Masquer',
  stories: {
    cantia: { label: 'Votre entreprise, dans le même espace', plain: 'La suite logique', accent: 'de vos projets.', text: 'Un devis accepté. Un projet qui avance. Une équipe qui se retrouve. Tout reste dans le même fil.' },
    accounting: { label: 'L’espace des fiduciaires', plain: 'Vos mandants.', accent: 'Le même fil.', text: 'La comptabilité, les pièces et les échéances de votre cabinet, dans un seul espace.' },
    partners: { label: 'Le programme partenaire', plain: 'Vos relations.', accent: 'Une suite à construire.', text: 'Vos recommandations, leur suivi et vos versements, au même endroit.' },
  },
  login: {
    eyebrow: { cantia: 'Votre espace Cantia', accounting: 'Cantia Accounting', partners: 'Cantia Partners' },
    title: 'Heureux de vous retrouver.',
    text: { cantia: 'Connectez-vous à votre espace Cantia.', accounting: 'Connectez-vous à l’espace de votre cabinet.', partners: 'Connectez-vous à votre espace partenaire.' },
  },
  signup: { title: 'La suite commence ici.', text: 'Créez votre compte, puis choisissez votre formule.', legalBefore: 'En créant un compte, vous acceptez les ', terms: 'conditions générales', legalMiddle: ' et prenez connaissance de la ', privacy: 'politique de confidentialité', legalAfter: '.', backToLogin: 'Revenir à la connexion' },
  forgot: { title: 'Retrouver votre accès.', text: 'Indiquez l’adresse e-mail associée à votre compte.', submit: 'Recevoir le lien de réinitialisation', backToLogin: 'Revenir à la connexion' },
  update: { title: 'Un nouveau mot de passe.', text: 'Choisissez le mot de passe de votre compte.' },
};

const de: AuthCopy = {
  back: 'Zurück zur Website',
  privacy: 'Datenschutz',
  privacyHref: 'https://cantia.ch/de/confidentialite',
  help: 'Brauchen Sie Hilfe?',
  helpHref: 'https://cantia.ch/de/aide',
  madeIn: 'In der Schweiz entwickelt. In Zürich gehostet.',
  show: 'Anzeigen',
  hide: 'Verbergen',
  stories: {
    cantia: { label: 'Ihr Unternehmen, an einem Ort', plain: 'Die logische Fortsetzung', accent: 'Ihrer Projekte.', text: 'Eine angenommene Offerte. Ein Projekt, das vorankommt. Ein Team, das sich findet. Alles bleibt im selben Faden.' },
    accounting: { label: 'Der Bereich für Treuhänder', plain: 'Ihre Mandanten.', accent: 'Derselbe Faden.', text: 'Buchhaltung, Belege und Fristen Ihrer Treuhand in einem einzigen Bereich.' },
    partners: { label: 'Das Partnerprogramm', plain: 'Ihre Beziehungen.', accent: 'Eine Zukunft zum Aufbauen.', text: 'Ihre Empfehlungen, deren Verlauf und Ihre Auszahlungen an einem Ort.' },
  },
  login: {
    eyebrow: { cantia: 'Ihr Cantia-Bereich', accounting: 'Cantia Accounting', partners: 'Cantia Partners' },
    title: 'Schön, Sie wiederzusehen.',
    text: { cantia: 'Melden Sie sich in Ihrem Cantia-Bereich an.', accounting: 'Melden Sie sich im Bereich Ihrer Treuhand an.', partners: 'Melden Sie sich in Ihrem Partnerbereich an.' },
  },
  signup: { title: 'Hier geht es los.', text: 'Erstellen Sie Ihr Konto und wählen Sie dann Ihr Abo.', legalBefore: 'Mit der Erstellung eines Kontos akzeptieren Sie die ', terms: 'AGB', legalMiddle: ' und nehmen die ', privacy: 'Datenschutzerklärung', legalAfter: ' zur Kenntnis.', backToLogin: 'Zurück zur Anmeldung' },
  forgot: { title: 'Zugang wiederherstellen.', text: 'Geben Sie die E-Mail-Adresse Ihres Kontos an.', submit: 'Link zum Zurücksetzen erhalten', backToLogin: 'Zurück zur Anmeldung' },
  update: { title: 'Ein neues Passwort.', text: 'Wählen Sie das Passwort Ihres Kontos.' },
};

const it: AuthCopy = {
  back: 'Torna al sito',
  privacy: 'Privacy',
  privacyHref: 'https://cantia.ch/it/confidentialite',
  help: 'Serve aiuto?',
  helpHref: 'https://cantia.ch/it/aide',
  madeIn: 'Progettato in Svizzera. Ospitato a Zurigo.',
  show: 'Mostra',
  hide: 'Nascondi',
  stories: {
    cantia: { label: 'La vostra azienda, in un unico spazio', plain: 'Il seguito logico', accent: 'dei vostri progetti.', text: 'Un preventivo accettato. Un progetto che avanza. Un team che si ritrova. Tutto resta nello stesso filo.' },
    accounting: { label: 'Lo spazio delle fiduciarie', plain: 'I vostri mandanti.', accent: 'Lo stesso filo.', text: 'Contabilità, giustificativi e scadenze dello studio in un unico spazio.' },
    partners: { label: 'Il programma partner', plain: 'Le vostre relazioni.', accent: 'Un futuro da costruire.', text: 'Le vostre raccomandazioni, il loro seguito e i vostri versamenti nello stesso posto.' },
  },
  login: {
    eyebrow: { cantia: 'Il vostro spazio Cantia', accounting: 'Cantia Accounting', partners: 'Cantia Partners' },
    title: 'Felici di rivedervi.',
    text: { cantia: 'Accedete al vostro spazio Cantia.', accounting: 'Accedete allo spazio del vostro studio.', partners: 'Accedete al vostro spazio partner.' },
  },
  signup: { title: 'Il seguito inizia qui.', text: 'Create il vostro account, poi scegliete il piano.', legalBefore: 'Creando un account accettate le ', terms: 'condizioni generali', legalMiddle: ' e prendete atto della ', privacy: 'politica sulla privacy', legalAfter: '.', backToLogin: 'Torna all’accesso' },
  forgot: { title: 'Ritrovare l’accesso.', text: 'Indicate l’indirizzo e-mail associato al vostro account.', submit: 'Ricevere il link di reimpostazione', backToLogin: 'Torna all’accesso' },
  update: { title: 'Una nuova password.', text: 'Scegliete la password del vostro account.' },
};

export const AUTH_COPY: Record<AppLocale, AuthCopy> = { fr, de, it } as Record<AppLocale, AuthCopy>;
