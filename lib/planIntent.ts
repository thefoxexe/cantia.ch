import { Platform } from 'react-native';

// What a visitor chose on the site before creating their account: the plan
// ("Essayer Équipe"), the billing interval and, for a personal offer, its
// code. The sign-up keeps it in this browser (app.cantia.ch), through email
// confirmation and onboarding, so that the plan screen opens on that choice.
export interface PlanIntent {
  plan?: string;
  billing?: 'month' | 'year';
  code?: string;
  // Welcome code of a newly founded company (90-day trial), from the link
  // of its e-mail: applied at checkout.
  offer?: string;
}

const KEY = 'cantia_plan_intent';
const PLANS = ['solo', 'equipe', 'pro'];

export function savePlanIntent(params: { plan?: unknown; billing?: unknown; code?: unknown; offer?: unknown }) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const next: PlanIntent = {};
  if (typeof params.plan === 'string' && PLANS.includes(params.plan)) next.plan = params.plan;
  if (params.billing === 'month' || params.billing === 'year') next.billing = params.billing;
  if (typeof params.code === 'string' && params.code.trim()) next.code = params.code.trim().slice(0, 64);
  if (typeof params.offer === 'string' && /^[A-Za-z0-9-]{4,40}$/.test(params.offer.trim())) next.offer = params.offer.trim().toUpperCase();
  if (!next.plan && !next.billing && !next.code && !next.offer) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...readPlanIntent(), ...next }));
  } catch {
    /* private mode: the plan screen simply opens without a preselection */
  }
}

export function readPlanIntent(): PlanIntent {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return {};
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? (v as PlanIntent) : {};
  } catch {
    return {};
  }
}

export function clearPlanIntent() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
