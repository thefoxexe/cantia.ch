import type { ReliefAnswers, ReliefTemplate } from './types';
import { sectorOf } from '../trades';

// Starting points for the onboarding (components/relief/ReliefOnboardingDom):
// a typical process per kind of business, with who leads each step and how
// long it usually takes. The owner edits it into their own process; the AI
// then builds the world on top of it (supabase/functions/relief-build).

type L = 'fr' | 'de' | 'it';
type Tri = [string, string, string];
const pick = (t: Tri, l: L) => (l === 'de' ? t[1] : l === 'it' ? t[2] : t[0]);

const ROLE: Record<string, Tri> = {
  direction: ['Direction', 'Geschäftsleitung', 'Direzione'],
  projet: ['Chef de projet', 'Projektleitung', 'Capo progetto'],
  chantier: ['Chef de chantier', 'Bauführung', 'Capo cantiere'],
  equipe: ['Équipe', 'Team', 'Squadra'],
  dev: ['Développeur', 'Entwickler', 'Sviluppatore'],
  design: ['Designer', 'Designer', 'Designer'],
  atelier: ['Atelier', 'Werkstatt', 'Officina'],
  accueil: ['Accueil', 'Empfang', 'Accoglienza'],
  compta: ['Comptabilité', 'Buchhaltung', 'Contabilità'],
  client: ['Client', 'Kunde', 'Cliente'],
};

export function roleOptions(l: L): string[] {
  return Object.values(ROLE).map((r) => pick(r, l));
}

type Step = { label: Tri; owner: keyof typeof ROLE; days: number; client?: boolean };

const PRESETS: Record<string, { template: ReliefTemplate; kind: Tri; steps: Step[] }> = {
  construction: {
    template: 'territoire',
    kind: ['Construction', 'Bauprojekt', 'Costruzione'],
    steps: [
      { label: ['Devis signé', 'Offerte unterschrieben', 'Preventivo firmato'], owner: 'direction', days: 5, client: true },
      { label: ['Préparation', 'Vorbereitung', 'Preparazione'], owner: 'chantier', days: 5 },
      { label: ['Gros œuvre', 'Rohbau', 'Rustico'], owner: 'equipe', days: 30 },
      { label: ['Second œuvre', 'Ausbau', 'Finiture interne'], owner: 'equipe', days: 25 },
      { label: ['Finitions', 'Fertigstellung', 'Finiture'], owner: 'equipe', days: 10 },
      { label: ['Réception', 'Abnahme', 'Collaudo'], owner: 'chantier', days: 2, client: true },
    ],
  },
  terrain: {
    template: 'territoire',
    kind: ['Intervention', 'Einsatz', 'Intervento'],
    steps: [
      { label: ['Demande', 'Anfrage', 'Richiesta'], owner: 'accueil', days: 1 },
      { label: ['Devis', 'Offerte', 'Preventivo'], owner: 'direction', days: 3, client: true },
      { label: ['Planification', 'Planung', 'Pianificazione'], owner: 'projet', days: 2 },
      { label: ['Intervention', 'Einsatz', 'Intervento'], owner: 'equipe', days: 5 },
      { label: ['Contrôle', 'Kontrolle', 'Controllo'], owner: 'projet', days: 1, client: true },
    ],
  },
  studio: {
    template: 'studio',
    kind: ['Projet', 'Projekt', 'Progetto'],
    steps: [
      { label: ['Brief', 'Briefing', 'Brief'], owner: 'projet', days: 3, client: true },
      { label: ['Maquettes', 'Entwürfe', 'Bozzetti'], owner: 'design', days: 10, client: true },
      { label: ['Développement', 'Entwicklung', 'Sviluppo'], owner: 'dev', days: 20 },
      { label: ['Recette', 'Abnahme', 'Collaudo'], owner: 'client', days: 5, client: true },
      { label: ['En ligne', 'Live', 'Online'], owner: 'projet', days: 1 },
    ],
  },
  conseil: {
    template: 'studio',
    kind: ['Mandat', 'Mandat', 'Mandato'],
    steps: [
      { label: ['Premier entretien', 'Erstgespräch', 'Primo colloquio'], owner: 'direction', days: 1 },
      { label: ['Offre', 'Offerte', 'Offerta'], owner: 'direction', days: 3, client: true },
      { label: ['Analyse', 'Analyse', 'Analisi'], owner: 'projet', days: 10 },
      { label: ['Livrable', 'Ergebnis', 'Consegna'], owner: 'projet', days: 10, client: true },
      { label: ['Clôture', 'Abschluss', 'Chiusura'], owner: 'compta', days: 2 },
    ],
  },
  atelier: {
    template: 'atelier',
    kind: ['Réparation', 'Reparatur', 'Riparazione'],
    steps: [
      { label: ['Réception', 'Annahme', 'Accettazione'], owner: 'accueil', days: 1 },
      { label: ['Diagnostic', 'Diagnose', 'Diagnosi'], owner: 'atelier', days: 1 },
      { label: ['Devis', 'Offerte', 'Preventivo'], owner: 'accueil', days: 1, client: true },
      { label: ['Travaux', 'Arbeiten', 'Lavori'], owner: 'atelier', days: 3 },
      { label: ['Contrôle', 'Kontrolle', 'Controllo'], owner: 'atelier', days: 1 },
      { label: ['Prêt', 'Bereit', 'Pronto'], owner: 'accueil', days: 1, client: true },
    ],
  },
  soin: {
    template: 'atelier',
    kind: ['Suivi', 'Behandlung', 'Trattamento'],
    steps: [
      { label: ['Rendez-vous', 'Termin', 'Appuntamento'], owner: 'accueil', days: 1 },
      { label: ['Bilan', 'Abklärung', 'Valutazione'], owner: 'equipe', days: 1 },
      { label: ['Séances', 'Sitzungen', 'Sedute'], owner: 'equipe', days: 20 },
      { label: ['Suivi', 'Nachkontrolle', 'Controllo'], owner: 'equipe', days: 5 },
    ],
  },
};

const BY_SECTOR: Record<string, keyof typeof PRESETS> = {
  construction: 'construction',
  nettoyage: 'terrain',
  transport: 'terrain',
  agriculture: 'terrain',
  informatique: 'studio',
  medias: 'studio',
  conseil: 'conseil',
  finance: 'conseil',
  formation: 'conseil',
  commerce: 'conseil',
  hotellerie: 'conseil',
  automobile: 'atelier',
  artisanat: 'atelier',
  industrie: 'atelier',
  sante: 'soin',
  beaute: 'soin',
};

const TEMPLATE_PRESET: Record<ReliefTemplate, keyof typeof PRESETS> = { territoire: 'terrain', studio: 'studio', atelier: 'atelier' };

/** The preset that fits the company's declared sector. */
export function presetFor(trade: string | null | undefined): keyof typeof PRESETS {
  return BY_SECTOR[sectorOf(trade)?.key ?? ''] ?? 'studio';
}

export function presetTemplate(key: keyof typeof PRESETS): ReliefTemplate {
  return PRESETS[key].template;
}

// The shortest a step can honestly take, when the owner hasn't said.
const minOf = (days: number) => (days <= 1 ? days : Math.max(1, Math.round(days * 0.5)));

export function stagesFor(key: keyof typeof PRESETS, l: L): ReliefAnswers['stages'] {
  return PRESETS[key].steps.map((s) => ({ label: pick(s.label, l), owner: pick(ROLE[s.owner], l), days: s.days, minDays: minOf(s.days), client: !!s.client }));
}

export function kindName(key: keyof typeof PRESETS, l: L): string {
  return pick(PRESETS[key].kind, l);
}

let kindSeq = 0;
/** A new id for a kind of project, unique enough within one company. */
export function newKindId(): string {
  kindSeq += 1;
  return `k${Date.now().toString(36)}${kindSeq}`;
}

/** The answers with their kinds filled in (older answers had one process). */
export function withKinds(a: ReliefAnswers, fallbackName: string): ReliefAnswers {
  if (a.kinds?.length) return { ...a, stages: a.kinds[0].stages };
  return { ...a, kinds: [{ id: 'main', name: fallbackName, stages: a.stages }] };
}

/** Process to show when the owner switches model by hand. */
export function stagesForTemplate(t: ReliefTemplate, trade: string | null | undefined, l: L): ReliefAnswers['stages'] {
  const own = presetFor(trade);
  return stagesFor(PRESETS[own].template === t ? own : TEMPLATE_PRESET[t], l);
}

export function defaultAnswers(trade: string | null | undefined, l: L, team: { id: string; name: string }[]): ReliefAnswers {
  const key = presetFor(trade);
  const stages = stagesFor(key, l);
  return {
    version: 1,
    activity: '',
    template: 'auto',
    stages,
    kinds: [{ id: 'main', name: kindName(key, l), stages }],
    team: team.map((m) => ({ id: m.id, name: m.name, job: '' })),
    billing: 'end',
    quotes: true,
    story: '',
  };
}

/** The suggested model, shown preselected while the answer is 'auto'. */
export function suggestedTemplate(trade: string | null | undefined): ReliefTemplate {
  return presetTemplate(presetFor(trade));
}
