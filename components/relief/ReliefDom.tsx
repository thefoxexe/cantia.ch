'use dom';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';
import { accentColor, createRelief, type ReliefHandle } from '../../lib/relief/engine';
import type { ReliefData, ReliefItem, ReliefItemStatus, ReliefSpec } from '../../lib/relief/types';
import type { ReliefCopy } from '../../lib/relief/copy';

// Cantia Relief, full screen: the 3D world (lib/relief/engine.ts) and the
// panels around it. Clicking an item opens its card, where the member can
// add a task, plan someone on it today, or open it in Cantia. A DOM
// component: plain React DOM on the web, its own web view on phones.

const STATUS_COLOR: Record<ReliefItemStatus, string> = { ok: '#2E6B4F', risk: '#B07A12', late: '#AB3327', done: '#8C8073' };

function fill(s: string, vars: Record<string, string>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function chf(n: number) {
  return `CHF ${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
}

function date(iso: string | null) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

interface Props {
  spec: ReliefSpec;
  data: ReliefData;
  copy: ReliefCopy;
  canPlan: boolean;
  canRedo: boolean;
  rebuilding: boolean;
  onOpenItem: (id: string) => void;
  onAddTask: (itemId: string, title: string) => Promise<string | null>;
  onPlan: (itemId: string, personId: string) => Promise<string | null>;
  onClose: () => void;
  onRedo: () => void;
  dom?: DOMProps;
}

export default function ReliefDom({ spec, data, copy, canPlan, canRedo, rebuilding, onOpenItem, onAddTask, onPlan, onClose, onRedo }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ReliefHandle | null>(null);
  const firstData = useRef(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const accent = accentColor(spec);
  const vocab = spec.vocabulary;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 760) setListOpen(false);
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    try {
      handleRef.current = createRelief(stageRef.current, spec, data, {
        onSelect: setSelectedId,
        baseLabel: `${vocab.place} · ${data.company}`,
        exampleLabel: copy.example,
      });
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        handleRef.current.setAnimated(false);
        setAnimated(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    return () => {
      handleRef.current?.dispose();
      handleRef.current = null;
      firstData.current = true;
    };
    // The world is rebuilt from scratch only when its plan changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  useEffect(() => {
    if (firstData.current) {
      firstData.current = false;
      return;
    }
    handleRef.current?.update(data);
  }, [data]);

  const item = data.items.find((i) => i.id === selectedId) ?? null;
  const stats = useMemo(
    () => ({
      active: data.items.filter((i) => i.status !== 'done' && !i.example).length,
      people: new Set([...data.items.flatMap((i) => i.crew), ...data.atBase]).size,
      late: data.items.filter((i) => i.status === 'late').length,
    }),
    [data],
  );
  const hasExamples = data.items.some((i) => i.example);
  const stageLabel = (it: ReliefItem) => spec.stages[Math.min(spec.stages.length - 1, it.stage)]?.label ?? '';

  const choose = (id: string) => {
    handleRef.current?.select(id);
    handleRef.current?.focus(id);
  };

  return (
    <div className="rf-root" style={{ ['--accent' as string]: accent }}>
      <style>{CSS}</style>
      <div ref={stageRef} className="rf-stage" />
      {error ? (
        <div className="rf-error">
          <b>{fill(copy.error, { message: '' })}</b>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="rf-left">
        <div className="rf-card rf-head">
          <div className="rf-eyebrow">{copy.brand}</div>
          <div className="rf-title">{spec.title}</div>
          {spec.tagline ? <div className="rf-tagline">{spec.tagline}</div> : null}
          <div className="rf-stats">
            <span>
              <b>{stats.active}</b> {fill(copy.statInProgress, { items: vocab.items })}
            </span>
            <span>
              <b>{stats.people}</b> {copy.statOut}
            </span>
            {stats.late ? (
              <span className="rf-late">
                <b>{stats.late}</b> {copy.statLate}
              </span>
            ) : null}
            <span className="rf-muted">
              {copy.today} · {data.today}
            </span>
          </div>
          {rebuilding ? <div className="rf-note">{copy.rebuilding}</div> : null}
          {hasExamples ? <div className="rf-note">{fill(copy.examplesBanner, { items: vocab.items })}</div> : null}
        </div>
        <div className="rf-card rf-list">
          <button type="button" className="rf-list-head" onClick={() => setListOpen((v) => !v)}>
            <span>{fill(copy.list, { items: vocab.items })}</span>
            <span className="rf-muted">{listOpen ? copy.hide : copy.show}</span>
          </button>
          {listOpen
            ? data.items.map((it) => (
                <button key={it.id} type="button" className={`rf-row${it.id === selectedId ? ' rf-row-on' : ''}`} onClick={() => choose(it.id)}>
                  <span className="rf-dot" style={{ background: STATUS_COLOR[it.status] }} />
                  <span className="rf-row-main">
                    <span className="rf-row-name">{it.name}</span>
                    <span className="rf-row-meta">
                      {it.example ? `${copy.example} · ` : ''}
                      {stageLabel(it)}
                    </span>
                  </span>
                  {it.crew.length ? <span className="rf-row-crew">{it.crew.length}</span> : null}
                </button>
              ))
            : null}
        </div>
      </div>

      <div className="rf-actions">
        <button type="button" className="rf-btn" onClick={() => handleRef.current?.reset()}>
          {copy.overview}
        </button>
        <button
          type="button"
          className="rf-btn rf-btn-pause"
          onClick={() => {
            handleRef.current?.setAnimated(!animated);
            setAnimated(!animated);
          }}
        >
          {animated ? copy.pause : copy.play}
        </button>
        {canRedo ? (
          <button type="button" className="rf-btn" onClick={onRedo} disabled={rebuilding}>
            {copy.redo}
          </button>
        ) : null}
        <button type="button" className="rf-btn rf-btn-dark rf-btn-close" onClick={onClose} aria-label={copy.close}>
          {copy.close}
        </button>
      </div>

      {item ? (
        <ItemCard
          key={item.id}
          item={item}
          spec={spec}
          data={data}
          copy={copy}
          canPlan={canPlan}
          onClose={() => handleRef.current?.select(null)}
          onOpenItem={onOpenItem}
          onAddTask={onAddTask}
          onPlan={onPlan}
        />
      ) : null}

      <div className="rf-bottom">
        <div className="rf-card rf-legend">
          {(Object.keys(STATUS_COLOR) as ReliefItemStatus[]).map((k) => (
            <span key={k} className="rf-legend-item">
              <span className="rf-dot" style={{ background: STATUS_COLOR[k] }} />
              {copy.status[k]}
            </span>
          ))}
          <span className="rf-hint">{copy.hint}</span>
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  spec,
  data,
  copy,
  canPlan,
  onClose,
  onOpenItem,
  onAddTask,
  onPlan,
}: {
  item: ReliefItem;
  spec: ReliefSpec;
  data: ReliefData;
  copy: ReliefCopy;
  canPlan: boolean;
  onClose: () => void;
  onOpenItem: (id: string) => void;
  onAddTask: (itemId: string, title: string) => Promise<string | null>;
  onPlan: (itemId: string, personId: string) => Promise<string | null>;
}) {
  const [task, setTask] = useState('');
  const [personId, setPersonId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const crew = item.crew.map((id) => data.people.find((p) => p.id === id)).filter(Boolean) as ReliefData['people'];
  const free = data.people.filter((p) => !item.crew.includes(p.id));
  const stages = spec.stages;

  const run = async (fn: () => Promise<string | null>, ok: string, reset: () => void) => {
    setBusy(true);
    setMessage(null);
    try {
      const err = await fn();
      if (err) setMessage(fill(copy.error, { message: err }));
      else {
        setMessage(ok);
        reset();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rf-card rf-panel">
      <div className="rf-panel-top">
        <div style={{ minWidth: 0 }}>
          <div className="rf-eyebrow">{[item.client, item.place].filter(Boolean).join(' · ') || spec.vocabulary.item}</div>
          <div className="rf-panel-title">{item.name}</div>
        </div>
        <button type="button" className="rf-close" onClick={onClose} aria-label={copy.close}>
          ×
        </button>
      </div>
      <span className="rf-badge" style={{ color: STATUS_COLOR[item.status], borderColor: STATUS_COLOR[item.status] }}>
        {item.example ? copy.example : copy.status[item.status]}
      </span>

      <div className="rf-steps" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
        {stages.map((s, i) => (
          <div key={s.label + i} className={`rf-step${i < item.stage ? ' rf-step-done' : ''}${i === item.stage ? ' rf-step-on' : ''}`}>
            <span className="rf-step-bar" />
            <span className="rf-step-label" title={s.label}>{s.label}</span>
          </div>
        ))}
      </div>

      {item.example ? (
        <div className="rf-note">{fill(copy.exampleCard, { items: spec.vocabulary.items })}</div>
      ) : (
        <>
          <div className="rf-figures">
            <Figure label={copy.progress} value={`${Math.round(item.progress * 100)} %`} />
            <Figure label={copy.dates} value={item.startDate || item.endDate ? `${date(item.startDate)} → ${date(item.endDate)}` : copy.noDates} small />
            {item.money ? (
              <>
                <Figure label={copy.quoted} value={chf(item.money.quoted)} />
                <Figure label={copy.invoiced} value={chf(item.money.invoiced)} />
                <Figure label={copy.costs} value={chf(item.money.costs)} />
              </>
            ) : null}
          </div>

          <div className="rf-section">{copy.crewToday}</div>
          {crew.length ? (
            <div className="rf-crew">
              {crew.map((p) => (
                <span key={p.id} className="rf-person">
                  <span className="rf-avatar" style={{ background: p.color }}>
                    {p.initials}
                  </span>
                  {p.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="rf-muted">{copy.nobody}</div>
          )}
          {canPlan && free.length ? (
            <div className="rf-inline">
              <select value={personId} onChange={(e) => setPersonId(e.target.value)} aria-label={copy.planSomeone}>
                <option value="">{copy.choosePerson}</option>
                {free.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="rf-btn"
                disabled={!personId || busy}
                onClick={() =>
                  run(
                    () => onPlan(item.id, personId),
                    copy.planned,
                    () => setPersonId(''),
                  )
                }
              >
                {copy.plan}
              </button>
            </div>
          ) : null}

          <div className="rf-section">{copy.tasks}</div>
          {item.tasks.length ? (
            <div className="rf-tasks">
              {item.tasks.map((t) => (
                <div key={t.id} className="rf-task">
                  <span className="rf-task-title">{t.title}</span>
                  {t.dueOn ? <span className="rf-task-due">{date(t.dueOn)}</span> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rf-muted">{copy.noTasks}</div>
          )}
          <form
            className="rf-inline"
            onSubmit={(e) => {
              e.preventDefault();
              if (!task.trim() || busy) return;
              run(
                () => onAddTask(item.id, task.trim()),
                copy.added,
                () => setTask(''),
              );
            }}
          >
            <input value={task} onChange={(e) => setTask(e.target.value)} placeholder={copy.taskPlaceholder} aria-label={copy.addTask} maxLength={300} />
            <button type="submit" className="rf-btn" disabled={!task.trim() || busy}>
              {copy.add}
            </button>
          </form>
          {message ? <div className="rf-message">{message}</div> : null}

          <button type="button" className="rf-btn rf-btn-primary rf-open" onClick={() => onOpenItem(item.id)}>
            {copy.open}
          </button>
        </>
      )}
    </div>
  );
}

function Figure({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rf-figure">
      <div className="rf-figure-label">{label}</div>
      <div className={`rf-figure-value${small ? ' rf-small' : ''}`}>{value}</div>
    </div>
  );
}

const CSS = `
.rf-root { position: relative; flex: 1; width: 100%; height: 100%; min-height: 100%; overflow: hidden; background: #EFE8DC; font-family: Archivo, system-ui, -apple-system, sans-serif; color: #231A12; -webkit-font-smoothing: antialiased; }
.rf-root * { box-sizing: border-box; }
.rf-stage { position: absolute; inset: 0; z-index: 0; }
.rf-left, .rf-actions, .rf-panel, .rf-bottom { z-index: 1; }
.rf-labels { position: absolute; inset: 0; pointer-events: none; }
.rf-label { position: absolute; left: 0; top: 0; pointer-events: auto; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px 6px 8px; border-radius: 999px; border: 1px solid rgba(35,26,18,0.12); background: rgba(255,253,249,0.95); box-shadow: 0 6px 18px rgba(43,33,26,0.14); font: 600 12px/1 Archivo, system-ui, sans-serif; color: #231A12; white-space: nowrap; cursor: pointer; transition: opacity .2s, box-shadow .2s; }
.rf-label::after { content: ''; position: absolute; left: 50%; bottom: -7px; width: 1px; height: 7px; background: rgba(35,26,18,0.3); }
.rf-label:hover, .rf-label.rf-on { box-shadow: 0 0 0 2px var(--accent), 0 8px 22px rgba(43,33,26,0.2); }
.rf-label.rf-dim { opacity: 0.5; }
.rf-label .rf-step-name { font-weight: 500; color: #6E6153; font-size: 11.5px; }
.rf-example { border-style: dashed; }
.rf-base { cursor: default; background: #16120E; color: #F4F1EA; border-color: #16120E; font-weight: 700; }
.rf-base::after { background: #16120E; }
.rf-worker { position: absolute; left: 0; top: 0; min-width: 24px; height: 20px; padding: 0 5px; border-radius: 999px; display: grid; place-items: center; color: #FFFFFF; font: 800 10px/1 Archivo, system-ui, sans-serif; border: 1.5px solid #FFFFFF; box-shadow: 0 3px 10px rgba(43,33,26,0.3); }
.rf-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; display: inline-block; }
.rf-st-ok .rf-dot { background: #2E6B4F; } .rf-st-risk .rf-dot { background: #B07A12; } .rf-st-late .rf-dot { background: #AB3327; } .rf-st-done .rf-dot { background: #8C8073; }

.rf-card { background: #FFFDF9; border: 1px solid rgba(35,26,18,0.1); border-radius: 10px; box-shadow: 0 10px 30px rgba(43,33,26,0.1); }
.rf-left { position: absolute; left: 16px; top: 16px; bottom: 64px; width: 320px; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.rf-left > * { pointer-events: auto; }
.rf-head { padding: 14px 16px; flex: none; }
.rf-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rf-title { font-size: 19px; font-weight: 800; letter-spacing: -0.3px; margin-top: 4px; }
.rf-tagline { font-size: 13px; line-height: 1.45; color: #4A3F35; margin-top: 4px; }
.rf-stats { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px; font-size: 12.5px; color: #4A3F35; }
.rf-stats b { font-family: 'Martian Mono', ui-monospace, monospace; font-weight: 600; color: #231A12; }
.rf-late, .rf-late b { color: #AB3327 !important; }
.rf-muted { font-size: 12px; color: #6E6153; }
.rf-note { margin-top: 10px; font-size: 12px; line-height: 1.45; color: #6E6153; background: #F6F0E6; border-radius: 7px; padding: 8px 10px; }
.rf-actions { position: absolute; right: 16px; top: 16px; max-width: calc(100% - 370px); display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.rf-btn { font: 700 13px Archivo, system-ui, sans-serif; padding: 9px 13px; border-radius: 6px; border: 1px solid rgba(35,26,18,0.14); background: #FFFDF9; color: #231A12; cursor: pointer; box-shadow: 0 4px 14px rgba(43,33,26,0.08); white-space: nowrap; }
.rf-btn:hover { background: #F6EFE3; }
.rf-btn:disabled { opacity: .5; cursor: not-allowed; }
.rf-btn:focus-visible, .rf-row:focus-visible, .rf-label:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rf-btn-dark { background: #16120E; color: #FFFFFF; border-color: #16120E; }
.rf-btn-dark:hover { background: #2B241D; }
.rf-btn-primary { background: var(--accent); border-color: var(--accent); color: #FFFFFF; }
.rf-btn-primary:hover { filter: brightness(0.92); background: var(--accent); }

.rf-list { flex: 0 1 auto; min-height: 0; overflow: auto; padding: 6px; }
.rf-list-head { all: unset; display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; padding: 8px 10px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; cursor: pointer; }
.rf-list-head .rf-muted { text-transform: none; letter-spacing: 0; font-weight: 600; }
.rf-row { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border-radius: 7px; cursor: pointer; }
.rf-row:hover { background: #F6EFE3; }
.rf-row-on { background: #F3E6D8 !important; }
.rf-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.rf-row-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-row-meta { font-size: 11.5px; color: #6E6153; }
.rf-row-crew { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 11px; color: #FFFFFF; background: var(--accent); border-radius: 999px; padding: 2px 7px; }

.rf-panel { position: absolute; right: 16px; top: 76px; width: 360px; max-height: calc(100% - 140px); overflow: auto; padding: 18px; display: flex; flex-direction: column; gap: 11px; animation: rf-in .22s ease-out; }
@keyframes rf-in { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .rf-panel { animation: none; } }
.rf-panel-top { display: flex; justify-content: space-between; gap: 12px; }
.rf-panel-title { font-size: 20px; font-weight: 800; letter-spacing: -0.4px; margin-top: 4px; }
.rf-close { all: unset; cursor: pointer; width: 30px; height: 30px; border-radius: 6px; display: grid; place-items: center; font-size: 22px; color: #6E6153; flex: none; }
.rf-close:hover { background: #F6EFE3; }
.rf-badge { align-self: flex-start; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; border: 1px solid; }
.rf-steps { display: grid; gap: 4px; }
.rf-step { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.rf-step-bar { height: 4px; border-radius: 2px; background: #EDE3D3; }
.rf-step-done .rf-step-bar { background: color-mix(in srgb, var(--accent) 45%, #EDE3D3); }
.rf-step-on .rf-step-bar { background: var(--accent); }
.rf-step-label { font-size: 9.5px; color: #8C8073; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-step-on .rf-step-label { color: #231A12; font-weight: 700; }
.rf-figures { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rf-figure { border: 1px solid #EDE3D3; border-radius: 7px; padding: 8px 10px; background: #FFFFFF; min-width: 0; }
.rf-figure-label { font-size: 10.5px; color: #6E6153; font-weight: 600; }
.rf-figure-value { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 13.5px; font-weight: 600; margin-top: 3px; font-variant-numeric: tabular-nums; }
.rf-small { font-size: 11.5px; }
.rf-section { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; margin-top: 4px; }
.rf-crew { display: flex; flex-wrap: wrap; gap: 8px 12px; }
.rf-person { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; }
.rf-avatar { width: 26px; height: 26px; border-radius: 50%; color: #FFFFFF; display: grid; place-items: center; font-size: 10.5px; font-weight: 800; flex: none; }
.rf-tasks { display: flex; flex-direction: column; }
.rf-task { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-top: 1px solid #EDE3D3; font-size: 12.5px; }
.rf-task-title { flex: 1; min-width: 0; }
.rf-task-due { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 10.5px; color: #6E6153; }
.rf-inline { display: flex; gap: 8px; }
.rf-inline input, .rf-inline select { flex: 1; min-width: 0; font: 500 13px Archivo, system-ui, sans-serif; padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(35,26,18,0.18); background: #FFFFFF; color: #231A12; }
.rf-inline input:focus, .rf-inline select:focus { outline: 2px solid var(--accent); outline-offset: 0; }
.rf-message { font-size: 12px; color: #2E6B4F; }
.rf-open { margin-top: 4px; }

.rf-bottom { position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; pointer-events: none; }
.rf-legend { pointer-events: auto; display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 9px 14px; font-size: 12px; font-weight: 600; }
.rf-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.rf-hint { color: #8C8073; font-weight: 500; }
.rf-error { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center; text-align: center; padding: 24px; font-size: 14px; color: #6E6153; z-index: 2; }

@media (max-width: 760px) {
  .rf-left { left: 12px; right: 12px; top: 64px; bottom: auto; max-height: 55%; width: auto; }
  .rf-tagline { display: none; }
  .rf-actions { left: 12px; right: 12px; top: 12px; max-width: none; justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; }
  .rf-btn-pause { display: none; }
  .rf-btn-close { order: -1; }
  .rf-panel { left: 12px; right: 12px; width: auto; top: auto; bottom: 12px; max-height: 66%; }
  .rf-bottom { display: none; }
}
`;
