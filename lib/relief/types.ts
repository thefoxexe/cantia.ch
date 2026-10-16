// Cantia Maquette (code name relief): the company as a living 3D miniature.
//
// Two halves meet in the scene (lib/relief/engine.ts):
// - the ReliefSpec, written once by the AI from what the owner dictated
//   (supabase/functions/relief-build, stored in relief_worlds.spec): which
//   base model, the company's own words, the steps of its process, the look;
// - the ReliefData, read live from the company's records (lib/relief/data.ts):
//   its projects, who is planned where today, open tasks, money.

/** The three base models. */
export type ReliefTemplate =
  | 'territoire' // sites spread over the land, linked by roads (construction, cleaning, gardens…)
  | 'studio' // a district of buildings, one per project, a floor per step (web, IT, consulting…)
  | 'atelier'; // one workshop with a bay per job (garage, body shop, joinery…)

export type ReliefAccent = 'terracotta' | 'sapin' | 'lac' | 'ardoise' | 'prune';

/** Building shape of an item, per template. */
export type ReliefStyle =
  // territoire
  | 'villa'
  | 'immeuble'
  | 'halle'
  | 'chalet'
  // studio
  | 'tour'
  | 'bloc'
  | 'pavillon'
  // atelier
  | 'vehicule'
  | 'meuble'
  | 'machine'
  | 'colis';

export const TEMPLATE_STYLES: Record<ReliefTemplate, ReliefStyle[]> = {
  territoire: ['villa', 'immeuble', 'halle', 'chalet'],
  studio: ['tour', 'bloc', 'pavillon'],
  atelier: ['vehicule', 'meuble', 'machine', 'colis'],
};

export interface ReliefSpec {
  version: 1;
  template: ReliefTemplate;
  /** Name of the world, e.g. "Le Relief de Pixel & Co". */
  title: string;
  /** One sentence: what the AI understood the company does. */
  tagline: string;
  /** What the AI understood, in a few short points shown to the owner. */
  understood: string[];
  /** The company's own words. */
  vocabulary: { item: string; items: string; place: string };
  /** The steps of the company's process, in order (3 to 6). */
  stages: ReliefStage[];
  accent: ReliefAccent;
  decor: { mountains: boolean; water: 'lac' | 'riviere' | 'aucune'; greenery: 'sobre' | 'verdoyant' };
  /** Shape of each real item (by project id) chosen from its name. */
  styles: Record<string, ReliefStyle>;
  /** Shown while the company has fewer than 3 real items, labelled as examples. */
  examples: { name: string; client: string; style: ReliefStyle; stage: number }[];
}

export type ReliefItemStatus = 'ok' | 'risk' | 'late' | 'done';

export interface ReliefPerson {
  id: string;
  initials: string;
  name: string;
  color: string;
}

export interface ReliefTask {
  id: string;
  title: string;
  dueOn: string | null;
  assignee: string | null;
}

export interface ReliefItem {
  id: string;
  name: string;
  client: string | null;
  place: string | null;
  /** 0 to 1. */
  progress: number;
  /** Kind of project (ReliefKind.id) and the process that applies to it. */
  kind: string;
  stages: ReliefStage[];
  /** Index in stages. */
  stage: number;
  /** The step was set by someone (relief_item_progress), not guessed. */
  tracked: boolean;
  /** Since when the item is at this step (ISO day), and for how many working days. */
  stageSince: string | null;
  stageElapsed: number | null;
  /** Estimated end from the durations of the remaining steps (ISO day). */
  eta: string | null;
  status: ReliefItemStatus;
  startDate: string | null;
  endDate: string | null;
  money: { quoted: number; invoiced: number; costs: number } | null;
  /** People planned on this item today. */
  crew: string[];
  tasks: ReliefTask[];
  style: ReliefStyle;
  /** An AI example, not a real record. */
  example: boolean;
}

export interface ReliefData {
  company: string;
  today: string;
  items: ReliefItem[];
  people: ReliefPerson[];
  /** People planned today without an item (at the office / depot). */
  atBase: string[];
  /** Kinds of projects and their processes. */
  kinds: ReliefKind[];
}

/** One step of the company's process, as the owner described it. */
export interface ReliefStage {
  label: string;
  /** Who leads this step (a role or a person), when known. */
  owner?: string;
  /** Typical length in working days, when known. */
  days?: number;
  /** Shortest it can honestly take, in working days. */
  minDays?: number;
  /** The client validates at the end of this step. */
  client?: boolean;
}

/** A kind of project with its own process (a showcase site is not an e-shop). */
export interface ReliefKind {
  id: string;
  name: string;
  stages: ReliefStage[];
}

export type ReliefAnswerStage = { label: string; owner: string; days: number; minDays?: number; client: boolean };

export type ReliefBilling = 'end' | 'deposit' | 'milestones' | 'monthly';

/** What the owner answered in the onboarding (relief_worlds.answers). */
export interface ReliefAnswers {
  version: 1;
  /** One line: what the company does. */
  activity: string;
  /** Chosen model, or 'auto' to let the AI decide. */
  template: ReliefTemplate | 'auto';
  /** Process of the first kind of project (kept for older worlds). */
  stages: ReliefAnswerStage[];
  /** Kinds of projects, each with its own process; the first is the usual one. */
  kinds?: { id: string; name: string; stages: ReliefAnswerStage[] }[];
  /** The company's website, read to prefill the answers. */
  website?: string;
  /** Members and what each does. */
  team: { id: string; name: string; job: string }[];
  billing: ReliefBilling;
  /** A quote is sent before each job. */
  quotes: boolean;
  /** Anything else, dictated or typed. */
  story: string;
}

export type ReliefMember = { id: string; name: string };

/** Everything Cantia knows about one item, loaded when its card opens. */
export interface ReliefDetails {
  /** null: the member may not see quotes and invoices. */
  devis: { id: string; number: string | null; status: string; total: number; date: string }[] | null;
  factures: { id: string; number: string | null; status: string; total: number; paid: number; dueDate: string | null }[] | null;
  /** null: the member may not see costs. */
  expenses: { total: number; count: number } | null;
  tasks: { id: string; title: string; dueOn: string | null; assignee: string | null; done: boolean }[];
  /** Who is planned on the item over the next 7 days (ISO dates). */
  week: { personId: string; days: string[] }[];
  counts: { documents: number | null; reports: number; feed: number };
  /** Site schedule (Gantt), when there is one. */
  schedule: { phase: string | null; progress: number } | null;
}

/** A place in Cantia the card links to, already filtered by rights. */
export interface ReliefSection {
  key: string;
  label: string;
  route: string;
  icon: string;
  count?: number | null;
}

/** What the member may do from the card. */
export interface ReliefCaps {
  plan: boolean;
  /** Move an item to another step of its process. */
  stage: boolean;
  /** Edit the process (kinds, steps, durations). */
  process: boolean;
  /** Close a finished item. */
  close: boolean;
  quotes: boolean;
  finances: boolean;
  redo: boolean;
}
