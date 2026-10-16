import { supabase } from '../supabase';
import { invokeFunction } from '../api/functions';
import type { ReliefAnswers, ReliefData, ReliefDetails, ReliefItem, ReliefItemStatus, ReliefPerson, ReliefSpec, ReliefStyle } from './types';
import { TEMPLATE_STYLES } from './types';
import { estimateEnd, guessKind, kindsOf, progressAt, stageOverdue, workingDaysBetween } from './stages';

// The live side of Cantia Maquette: the company's real records turned into
// what the scene shows (lib/relief/engine.ts), and the few writes the scene
// allows (a task, someone planned on an item today). Everything goes
// through the member's own session, so RLS decides what each person sees.

export interface ReliefWorldRow {
  id: string;
  status: 'building' | 'ready' | 'failed';
  brief: string;
  answers: ReliefAnswers | null;
  spec: ReliefSpec | null;
  error: string | null;
  ready_at: string | null;
  updated_at: string;
}

export async function getReliefWorld(organizationId: string): Promise<ReliefWorldRow | null> {
  const { data } = await supabase.from('relief_worlds').select('id, status, brief, answers, spec, error, ready_at, updated_at').eq('organization_id', organizationId).maybeSingle();
  return (data as ReliefWorldRow | null) ?? null;
}

export async function startReliefBuild(organizationId: string, answers: ReliefAnswers, locale: string): Promise<{ error: string | null }> {
  const { error } = await invokeFunction('relief-build', { organization_id: organizationId, answers, brief: briefFromAnswers(answers), locale });
  return { error };
}

export type ReliefPrefill = {
  website: string;
  pages: { url: string; title: string }[];
  activity: string;
  template: ReliefAnswers['template'];
  understood: string[];
  kinds: NonNullable<ReliefAnswers['kinds']>;
  billing: ReliefAnswers['billing'];
  quotes: boolean;
  story: string;
};

/** Read the company's website and get proposed answers (nothing is saved). */
export async function prefillFromWebsite(organizationId: string, url: string, locale: string): Promise<{ data: ReliefPrefill | null; error: string | null }> {
  return invokeFunction<ReliefPrefill>('relief-prefill', { organization_id: organizationId, url, locale });
}

/** The answers as plain text, kept as the readable brief of the world. */
export function briefFromAnswers(a: ReliefAnswers): string {
  const lines = [
    a.activity.trim(),
    ...(a.kinds?.length ? a.kinds : [{ name: '', stages: a.stages }]).map(
      (k) => `${k.name ? `${k.name} :\n` : ''}${k.stages.map((s, i) => `${i + 1}. ${s.label}${s.owner ? ` (${s.owner})` : ''}${s.days ? `, ${s.days} j` : ''}${s.minDays ? ` (min ${s.minDays} j)` : ''}${s.client ? ', validation client' : ''}`).join('\n')}`,
    ),
    a.team.filter((m) => m.job.trim()).map((m) => `${m.name} : ${m.job.trim()}`).join('\n'),
    a.story.trim(),
  ].filter(Boolean);
  return lines.join('\n\n').slice(0, 8000);
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

export async function loadReliefData(
  org: { id: string; name: string },
  spec: ReliefSpec,
  opts: { withMoney: boolean; todayLabel: string; answers?: ReliefAnswers | null },
): Promise<ReliefData> {
  const today = todayIso();
  const kinds = kindsOf(spec, opts.answers);
  const [projectsRes, membersRes, plansRes, tasksRes, schedulesRes, progressRes] = await Promise.all([
    supabase.from('projects').select('id, name, client_name, address, status, start_date, end_date, updated_at').eq('organization_id', org.id).order('updated_at', { ascending: false }).limit(80),
    supabase.from('organization_members').select('user_id, full_name').eq('organization_id', org.id),
    supabase.from('planning_assignments').select('project_id, member_user_id, is_private').eq('organization_id', org.id).lte('starts_on', today).gte('ends_on', today),
    supabase.from('dashboard_tasks').select('id, title, project_id, due_on, assigned_to, done').eq('organization_id', org.id).not('project_id', 'is', null).limit(1000),
    supabase.from('site_schedules').select('id, project_id').eq('organization_id', org.id),
    supabase.from('relief_item_progress').select('project_id, kind, stage, stage_started_on').eq('organization_id', org.id),
  ]);
  const progressRows = new Map(((progressRes.data ?? []) as { project_id: string; kind: string | null; stage: number; stage_started_on: string }[]).map((r) => [r.project_id, r]));

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
  const styles = TEMPLATE_STYLES[spec.template];

  const items: ReliefItem[] = projects.map((p, i) => {
    const own = tasks.filter((t) => t.project_id === p.id);
    const open = own.filter((t) => !t.done);
    const done = p.status === 'completed';
    const row = progressRows.get(p.id);
    const kind = kinds.find((k) => k.id === row?.kind) ?? guessKind(kinds, p.name);
    const stages = kind.stages;
    const n = stages.length;
    let stage: number;
    let progress: number | undefined;
    let elapsed: number | null = null;
    let eta: string | null = null;
    if (row && !done) {
      // Someone said where the item stands: the durations do the rest.
      stage = Math.min(n - 1, Math.max(0, row.stage));
      elapsed = workingDaysBetween(row.stage_started_on, today);
      progress = progressAt(stages, stage, elapsed);
      if (stages.some((s) => s.days)) eta = estimateEnd(stages, stage, row.stage_started_on, today);
    } else {
      progress = scheduleProgress.get(p.id);
      if (progress === undefined && own.length >= 2) progress = (own.length - open.length) / own.length;
      if (progress === undefined && p.start_date && p.end_date) {
        const a = Date.parse(p.start_date);
        const b = Date.parse(p.end_date);
        if (b > a) progress = Math.min(0.95, Math.max(0.05, (Date.now() - a) / (b - a)));
      }
      if (progress === undefined) progress = 0.15;
      if (done) progress = 1;
      stage = done ? n - 1 : Math.max(0, Math.min(n - 2, Math.floor(progress * (n - 1))));
    }
    let status: ReliefItemStatus = 'ok';
    if (done) status = 'done';
    else if (p.end_date && p.end_date < today) status = 'late';
    else if (open.some((t) => t.due_on && t.due_on < today) || stageOverdue(stages[stage], elapsed) || (eta && p.end_date && eta > p.end_date)) status = 'risk';
    const style = (spec.styles?.[p.id] as ReliefStyle | undefined) && styles.includes(spec.styles[p.id]) ? spec.styles[p.id] : styles[i % styles.length];
    return {
      id: p.id,
      name: p.name,
      client: p.client_name,
      place: p.address,
      progress,
      kind: kind.id,
      stages,
      stage,
      tracked: !!row && !done,
      stageSince: row && !done ? row.stage_started_on : null,
      stageElapsed: elapsed,
      eta,
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
    const stages = kinds[0].stages;
    const stagesN = stages.length;
    spec.examples.slice(0, 5 - items.length).forEach((e, i) => {
      const stage = Math.min(stagesN - 1, e.stage);
      items.push({
        id: `example-${i}`,
        name: e.name,
        client: e.client || null,
        place: null,
        progress: stagesN > 1 ? stage / (stagesN - 1) : 0,
        kind: kinds[0].id,
        stages,
        stage,
        tracked: false,
        stageSince: null,
        stageElapsed: null,
        eta: null,
        status: stage >= stagesN - 1 ? 'done' : 'ok',
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

  return { company: org.name, today: opts.todayLabel, items, people, atBase, kinds };
}

/** Move a project to a step of its process (and keep who did it, when). */
export async function setReliefStage(organizationId: string, userId: string, projectId: string, kind: string, stage: number): Promise<{ error: string | null }> {
  const { data: prev } = await supabase.from('relief_item_progress').select('stage, kind, history').eq('project_id', projectId).maybeSingle();
  const old = prev as { stage: number; kind: string | null; history: unknown } | null;
  if (old && old.stage === stage && old.kind === kind) return { error: null };
  const history = (Array.isArray(old?.history) ? (old!.history as unknown[]) : []).slice(-40);
  history.push({ stage, kind, at: new Date().toISOString(), by: userId });
  const { error } = await supabase.from('relief_item_progress').upsert(
    { project_id: projectId, organization_id: organizationId, kind, stage, stage_started_on: todayIso(), history, updated_by: userId },
    { onConflict: 'project_id' },
  );
  return { error: error?.message ?? null };
}

/** The owner's process (kinds, steps, durations), saved without rebuilding the world. */
export async function saveReliefAnswers(organizationId: string, answers: ReliefAnswers): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('relief_save_answers', { p_organization_id: organizationId, p_answers: answers });
  return { error: error?.message ?? null };
}

/** Close a finished project (the last step is done). RLS decides who may. */
export async function closeReliefItem(projectId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('projects').update({ status: 'completed' }).eq('id', projectId);
  return { error: error?.message ?? null };
}

export async function addReliefTask(organizationId: string, userId: string, projectId: string, title: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('dashboard_tasks').insert({ organization_id: organizationId, created_by: userId, project_id: projectId, title: title.trim().slice(0, 300) });
  return { error: error?.message ?? null };
}


function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Everything on one item, loaded when its card opens; RLS has the last word. */
export async function loadItemDetails(
  organizationId: string,
  projectId: string,
  opts: { quotes: boolean; finances: boolean; documents: boolean },
): Promise<ReliefDetails> {
  const today = new Date();
  const from = isoDay(today);
  const to = isoDay(new Date(today.getTime() + 6 * 86400000));
  const total = (rows: { quantity: number; unit_price: number }[] | null | undefined) => sum(rows ?? [], (r) => r.quantity * r.unit_price);

  const [devisRes, facturesRes, costsRes, tasksRes, planRes, filesRes, reportsRes, feedRes, scheduleRes] = await Promise.all([
    opts.quotes
      ? supabase.from('devis').select('id, number, status, created_at, devis_items(quantity, unit_price)').eq('project_id', projectId).order('created_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: null }),
    opts.quotes
      ? supabase
          .from('factures')
          .select('id, number, status, due_date, facture_items(quantity, unit_price), facture_payments(amount)')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: null }),
    opts.finances ? supabase.from('project_expenses').select('amount').eq('project_id', projectId) : Promise.resolve({ data: null }),
    supabase.from('dashboard_tasks').select('id, title, due_on, assigned_to, done').eq('organization_id', organizationId).eq('project_id', projectId).order('done').order('due_on', { nullsFirst: false }).limit(40),
    supabase.from('planning_assignments').select('member_user_id, starts_on, ends_on').eq('project_id', projectId).lte('starts_on', to).gte('ends_on', from),
    opts.documents ? supabase.from('files').select('id', { count: 'exact', head: true }).eq('project_id', projectId) : Promise.resolve({ count: null }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('feed_entries').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('site_schedules').select('id').eq('project_id', projectId).maybeSingle(),
  ]);

  let schedule: ReliefDetails['schedule'] = null;
  const scheduleId = (scheduleRes.data as { id: string } | null)?.id;
  if (scheduleId) {
    const { data } = await supabase.from('schedule_items').select('kind, name, progress, duration, start_date, end_date').eq('schedule_id', scheduleId);
    const rows = (data ?? []) as { kind: string; name: string; progress: number | null; duration: number | null; start_date: string | null; end_date: string | null }[];
    const tasks = rows.filter((r) => r.kind === 'task');
    const w = sum(tasks, (r) => Math.max(1, Number(r.duration) || 1));
    const p = w ? sum(tasks, (r) => Math.max(1, Number(r.duration) || 1) * Math.min(100, Math.max(0, Number(r.progress) || 0))) / w / 100 : 0;
    const phase = rows.find((r) => r.kind === 'phase' && r.start_date && r.end_date && r.start_date <= from && r.end_date >= from)?.name ?? null;
    schedule = { phase, progress: p };
  }

  // Each planned day of the coming week, per person.
  const week = new Map<string, Set<string>>();
  for (const a of (planRes.data ?? []) as { member_user_id: string; starts_on: string; ends_on: string }[]) {
    const set = week.get(a.member_user_id) ?? new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = isoDay(new Date(today.getTime() + i * 86400000));
      if (d >= a.starts_on && d <= a.ends_on) set.add(d);
    }
    week.set(a.member_user_id, set);
  }

  return {
    devis: devisRes.data
      ? (devisRes.data as { id: string; number: string | null; status: string; created_at: string; devis_items: { quantity: number; unit_price: number }[] }[]).map((d) => ({
          id: d.id,
          number: d.number,
          status: d.status,
          total: total(d.devis_items),
          date: d.created_at.slice(0, 10),
        }))
      : null,
    factures: facturesRes.data
      ? (
          facturesRes.data as {
            id: string;
            number: string | null;
            status: string;
            due_date: string | null;
            facture_items: { quantity: number; unit_price: number }[];
            facture_payments: { amount: number }[];
          }[]
        ).map((f) => ({ id: f.id, number: f.number, status: f.status, total: total(f.facture_items), paid: sum(f.facture_payments ?? [], (x) => x.amount), dueDate: f.due_date }))
      : null,
    expenses: costsRes.data ? { total: sum(costsRes.data as { amount: number }[], (c) => c.amount), count: (costsRes.data as unknown[]).length } : null,
    tasks: ((tasksRes.data ?? []) as { id: string; title: string; due_on: string | null; assigned_to: string | null; done: boolean }[]).map((t) => ({
      id: t.id,
      title: t.title,
      dueOn: t.due_on,
      assignee: t.assigned_to,
      done: t.done,
    })),
    week: [...week.entries()].filter(([, d]) => d.size).map(([personId, d]) => ({ personId, days: [...d].sort() })),
    counts: { documents: opts.documents ? (filesRes.count ?? 0) : null, reports: reportsRes.count ?? 0, feed: feedRes.count ?? 0 },
    schedule,
  };
}

export async function setReliefTaskDone(taskId: string, done: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('dashboard_tasks')
    .update({ done, done_at: done ? new Date().toISOString() : null })
    .eq('id', taskId);
  return { error: error?.message ?? null };
}

export async function planOnItem(organizationId: string, userId: string, memberId: string, projectId: string, day: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('planning_assignments')
    .insert({ organization_id: organizationId, created_by: userId, member_user_id: memberId, project_id: projectId, starts_on: day, ends_on: day });
  return { error: error?.message ?? null };
}
