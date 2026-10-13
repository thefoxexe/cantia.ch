import type { ReliefAnswers, ReliefData, ReliefSpec, ReliefStyle, ReliefTemplate } from './types';
import { TEMPLATE_STYLES } from './types';
import { suggestedTemplate } from './process';

// A world drawn from the onboarding answers alone, before the AI has built
// the real one: one item per step of the process, each standing at its own
// step. Used by the onboarding preview and by the dashboard card while the
// company has no Relief yet.

export const ACCENT_OF: Record<ReliefTemplate, ReliefSpec['accent']> = { territoire: 'terracotta', studio: 'lac', atelier: 'ardoise' };
export const ACCENT_HEX: Record<string, string> = { terracotta: '#A95C30', sapin: '#2F6B4F', lac: '#2F6E8A', ardoise: '#4A5563', prune: '#7A4A6E' };
export const PALETTE = ['#C8642E', '#3F6E8C', '#6E8B4A', '#8C4A6E', '#B08A2E', '#2E7D72', '#5A5FA8', '#A8463E'];

export function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

export function previewSpec(a: ReliefAnswers, trade: string | null, company: string, workTerm: { item: string; items: string }): ReliefSpec {
  const template = a.template === 'auto' ? suggestedTemplate(trade) : a.template;
  const stages = a.stages.filter((s) => s.label.trim()).slice(0, 8);
  return {
    version: 1,
    template,
    title: company,
    tagline: a.activity,
    understood: [],
    vocabulary: { item: workTerm.item, items: workTerm.items, place: '' },
    stages: (stages.length >= 2 ? stages : [{ label: '1' }, { label: '2' }, { label: '3' }]).map((s) => ({ label: s.label })),
    accent: ACCENT_OF[template],
    decor: { mountains: true, water: template === 'territoire' ? 'riviere' : 'lac', greenery: template === 'territoire' ? 'verdoyant' : 'sobre' },
    styles: {},
    examples: [],
  };
}

export function previewData(spec: ReliefSpec, a: ReliefAnswers, company: string): ReliefData {
  const styles = TEMPLATE_STYLES[spec.template];
  const n = spec.stages.length;
  const people = a.team.slice(0, 8).map((m, i) => ({ id: m.id, name: m.name, initials: initials(m.name), color: PALETTE[i % PALETTE.length] }));
  const items = spec.stages.map((s, i) => ({
    id: `p${i}`,
    name: s.label,
    client: null,
    place: null,
    progress: n > 1 ? i / (n - 1) : 1,
    stage: i,
    status: (i === n - 1 ? 'done' : 'ok') as 'done' | 'ok',
    startDate: null,
    endDate: null,
    money: null,
    crew: people.length ? [people[i % people.length].id] : [],
    tasks: [],
    style: styles[i % styles.length] as ReliefStyle,
    example: false,
  }));
  return { company, today: '', items, people, atBase: [] };
}
