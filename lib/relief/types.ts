// Cantia Relief: the company as a living 3D miniature.
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
  stages: { label: string }[];
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
  /** Index in spec.stages. */
  stage: number;
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
}
