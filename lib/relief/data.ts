import { supabase } from '../supabase';
import { invokeFunction } from '../api/functions';
import type { ReliefData, ReliefItem, ReliefItemStatus, ReliefPerson, ReliefSpec, ReliefStyle } from './types';
import { TEMPLATE_STYLES } from './types';

// The live side of Cantia Relief: the company's real records turned into
// what the scene shows (lib/relief/engine.ts), and the few writes the scene
// allows (a task, someone planned on an item today). Everything goes
// through the member's own session, so RLS decides what each person sees.

export interface ReliefWorldRow {
  id: string;
  status: 'building' | 'ready' | 'failed';
  brief: string;
  spec: ReliefSpec | null;
  error: string | null;
  ready_at: string | null;
  updated_at: string;
}

export async function getReliefWorld(organizationId: string): Promise<ReliefWorldRow | null> {
  const { data } = await supabase.from('relief_worlds').select('id, status, brief, spec, error, ready_at, updated_at').eq('organization_id', organizationId).maybeSingle();
  return (data as ReliefWorldRow | null) ?? null;
}

export async function startReliefBuild(organizationId: string, brief: string, locale: string): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('relief-build', { organization_id: organizationId, brief, locale });
  return { error };
}

const PALETTE = ['#C8642E', '#3F6E8C', '#6E8B4A', '#8C4A6E', '#B08A2E', '#2E7D72', '#5A5FA8', '#A8463E', '#7A5A3E', '#4E7FA8'];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sum<T>(rows: T[], f: (r: T) => number) {
  return rows.reduce((s, r) => s + (Number(f(r)) || 0), 0);
}

export async function loadReliefData(org: { id: string; name: string }, spec: ReliefSpec, opts: { withMoney: boolean; todayLabel: string }): Promise<ReliefData> {
  const today = todayIso();
  const [projectsRes, membersRes, plansRes, tasksRes, schedulesRes] = await Promise.all([
    supabase.from('projects').select('id, name, client_name, address, status, start_date, end_date, updated_at').eq('organization_id', org.id).order('updated_at', { ascending: false }).limit(80),
    supabase.from('organization_members').select('user_id, full_name').eq('organization_id', org.id),
    supabase.from('planning_assignments').select('project_id, member_user_id, is_private').eq('organization_id', org.id).lte('starts_on', today).gte('ends_on', today),
    supabase.from('dashboard_tasks').select('id, title, project_id, due_on, assigned_to, done').eq('organization_id', org.id).not('project_id', 'is', null).limit(1000),
    supabase.from('site_schedules').select('id, project_id').eq('organization_id', org.id),
  ]);

  // Active items first, then the five most recently finished.
  const all = (projectsRes.data ?? []) as {
    id: string;
    name: string;
    client_name: string | null;
    address: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
  }[];
  const active = all.filter((p) => p.status !== 'completed').slice(0, 40);
  const finished = all.filter((p) => p.status === 'completed').slice(0, 5);
  const projects = [...active, ...finished];
  const ids = projects.map((p) => p.id);

  const people: ReliefPerson[] = ((membersRes.data ?? []) as { user_id: string; full_name: string | null }[]).map((m, i) => ({
    id: m.user_id,
    name: m.full_name || '—',
    initials: initials(m.full_name || '?'),
    color: PALETTE[i % PALETTE.length],
  }));

  // Progress from the site schedule (Gantt) when there is one.
  const scheduleByProject = new Map<string, string>();
  for (const s of (schedulesRes.data ?? []) as { id: string; project_id: string }[]) scheduleByProject.set(s.project_id, s.id);
  const scheduleProgress = new Map<string, number>();
  const scheduleIds = ids.map((id) => scheduleByProject.get(id)).filter(Boolean) as string[];
  if (scheduleIds.length) {
    const { data } = await supabase.from('schedule_items').select('schedule_id, kind, progress, duration').in('schedule_id', scheduleIds).eq('kind', 'task');
    const acc = new Map<string, { w: number; p: number }>();
    for (const it of (data ?? []) as { schedule_id: string; progress: number | null; duration: number | null }[]) {
      const w = Math.max(1, Number(it.duration) || 1);
      const a = acc.get(it.schedule_id) ?? { w: 0, p: 0 };
      a.w += w;
      a.p += w * Math.min(100, Math.max(0, Number(it.progress) || 0));
      acc.set(it.schedule_id, a);
    }
    for (const [pid, sid] of scheduleByProject) {
      const a = acc.get(sid);
      if (a && a.w > 0) scheduleProgress.set(pid, a.p / a.w / 100);
    }
  }

  // Money, only for people allowed to see figures.
  const money = new Map<string, { quoted: number; invoiced: number; costs: number }>();
  if (opts.withMoney && ids.length) {
    const [devisRes, facturesRes, costsRes] = await Promise.all([
      supabase.from('devis').select('project_id, status, devis_items(quantity, unit_price)').in('project_id', ids).eq('status', 'accepted'),
      supabase.from('factures').select('project_id, status, facture_items(quantity, unit_price)').in('project_id', ids).in('status', ['sent', 'partial', 'paid']),
      supabase.from('project_expenses').select('project_id, amount').in('project_id', ids),
    ]);
    const add = (pid: string, k: 'quoted' | 'invoiced' | 'costs', v: number) => {
      const m = money.get(pid) ?? { quoted: 0, invoiced: 0, costs: 0 };
      m[k] += v;
      money.set(pid, m);
    };
    for (const d of (devisRes.data ?? []) as { project_id: string; devis_items: { quantity: number; unit_price: number }[] }[])
      add(
        d.project_id,
        'quoted',
        sum(d.devis_items ?? [], (i) => i.quantity * i.unit_price),
      );
    for (const f of (facturesRes.data ?? []) as { project_id: string; facture_items: { quantity: number; unit_price: number }[] }[])
      add(
        f.project_id,
        'invoiced',
        sum(f.facture_items ?? [], (i) => i.quantity * i.unit_price),
      );
    for (const c of (costsRes.data ?? []) as { project_id: string; amount: number }[]) add(c.project_id, 'costs', Number(c.amount) || 0);
  }

  const tasks = (tasksRes.data ?? []) as { id: string; title: string; project_id: string; due_on: string | null; assigned_to: string | null; done: boolean }[];
  const plans = (plansRes.data ?? []) as { project_id: string | null; member_user_id: string; is_private: boolean }[];
  const stagesN = spec.stages.length;
  const styles = TEMPLATE_STYLES[spec.template];

  const items: ReliefItem[] = projects.map((p, i) => {
    const own = tasks.filter((t) => t.project_id === p.id);
    const open = own.filter((t) => !t.done);
    const done = p.status === 'completed';
    let progress = scheduleProgress.get(p.id);
    if (progress === undefined && own.length >= 2) progress = (own.length - open.length) / own.length;
    if (progress === undefined && p.start_date && p.end_date) {
      const a = Date.parse(p.start_date);
      const b = Date.parse(p.end_date);
      if (b > a) progress = Math.min(0.95, Math.max(0.05, (Date.now() - a) / (b - a)));
    }
    if (progress === undefined) progress = 0.15;
    if (done) progress = 1;
    const stage = done ? stagesN - 1 : Math.min(stagesN - 2, Math.floor(progress * (stagesN - 1)));
    let status: ReliefItemStatus = 'ok';
    if (done) status = 'done';
    else if (p.end_date && p.end_date < today) status = 'late';
    else if (open.some((t) => t.due_on && t.due_on < today)) status = 'risk';
    const style = (spec.styles?.[p.id] as ReliefStyle | undefined) && styles.includes(spec.styles[p.id]) ? spec.styles[p.id] : styles[i % styles.length];
    return {
      id: p.id,
      name: p.name,
      client: p.client_name,
      place: p.address,
      progress,
      stage: Math.max(0, stage),
      status,
      startDate: p.start_date,
      endDate: p.end_date,
      money: opts.withMoney ? (money.get(p.id) ?? { quoted: 0, invoiced: 0, costs: 0 }) : null,
      crew: Array.from(new Set(plans.filter((a) => a.project_id === p.id).map((a) => a.member_user_id))),
      tasks: open.slice(0, 8).map((t) => ({ id: t.id, title: t.title, dueOn: t.due_on, assignee: t.assigned_to })),
      style,
      example: false,
    };
  });

  // Examples from the AI while the company has almost no records yet.
  if (items.length < 3) {
    spec.examples.slice(0, 5 - items.length).forEach((e, i) => {
      items.push({
        id: `example-${i}`,
        name: e.name,
        client: e.client || null,
        place: null,
        progress: stagesN > 1 ? e.stage / (stagesN - 1) : 0,
        stage: e.stage,
        status: e.stage >= stagesN - 1 ? 'done' : 'ok',
        startDate: null,
        endDate: null,
        money: null,
        crew: [],
        tasks: [],
        style: e.style,
        example: true,
      });
    });
  }

  const onItems = new Set(items.flatMap((it) => it.crew));
  const atBase = Array.from(new Set(plans.filter((a) => !a.project_id).map((a) => a.member_user_id))).filter((id) => !onItems.has(id));

  return { company: org.name, today: opts.todayLabel, items, people, atBase };
}

export async function addReliefTask(organizationId: string, userId: string, projectId: string, title: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('dashboard_tasks').insert({ organization_id: organizationId, created_by: userId, project_id: projectId, title: title.trim().slice(0, 300) });
  return { error: error?.message ?? null };
}

export async function planOnItemToday(organizationId: string, userId: string, memberId: string, projectId: string): Promise<{ error: string | null }> {
  const today = todayIso();
  const { error } = await supabase
    .from('planning_assignments')
    .insert({ organization_id: organizationId, created_by: userId, member_user_id: memberId, project_id: projectId, starts_on: today, ends_on: today });
  return { error: error?.message ?? null };
}
