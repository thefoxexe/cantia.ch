// The "plan" of a company miniature (Ma maquette): what the 3D scene shows
// and what each element carries when clicked. Built today from example data
// (lib/maquette/sample.ts); later by the AI interview from the company's own
// process and its real records. Positions are scene coordinates in metres of
// the miniature: x from -70 (west) to 70 (east), z from -45 (north, the
// mountains) to 45 (south, the viewer).

export type MaquetteTheme = 'construction';

export type SitePhase = 'terrassement' | 'gros_oeuvre' | 'second_oeuvre' | 'finitions' | 'reception';
export type SiteStatus = 'ok' | 'risk' | 'late' | 'done';
export type SiteKind = 'villa' | 'immeuble' | 'halle' | 'chalet';

export interface MaquettePerson {
  id: string;
  initials: string;
  name: string;
  role: string;
  /** Colour of the worker's jacket in the scene and of the avatar. */
  color: string;
}

export interface MaquetteTask {
  title: string;
  state: 'todo' | 'doing' | 'blocked';
  people: string[];
}

export interface MaquetteSite {
  id: string;
  name: string;
  client: string;
  locality: string;
  kind: SiteKind;
  phase: SitePhase;
  /** Overall progress, 0 to 1. */
  progress: number;
  status: SiteStatus;
  budget: number;
  spent: number;
  /** ISO date. */
  endDate: string;
  /** People planned on this site today. */
  crew: string[];
  tasks: MaquetteTask[];
  alert?: string;
  pos: [number, number];
}

export interface MaquettePlan {
  theme: MaquetteTheme;
  company: { name: string; locality: string };
  depot: { name: string; pos: [number, number] };
  sites: MaquetteSite[];
  people: MaquettePerson[];
  /** Vehicles driving between the depot and a site. */
  vehicles: { id: string; label: string; siteId: string; speed: number }[];
  /** Human date shown in the header. */
  today: string;
  /** Phases of the company's process, in order, with their labels. */
  phases: { key: SitePhase; label: string }[];
}
