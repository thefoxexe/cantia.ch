'use dom';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';
import { createMaquette, type MaquetteHandle } from '../../lib/maquette/engine';
import type { MaquettePlan, MaquetteSite, SiteStatus } from '../../lib/maquette/types';

// "Ma maquette": the company as a living 3D miniature (lib/maquette/engine.ts)
// with the panels around it — today's figures, the list of sites, and the
// card of the selected site. A DOM component: plain React DOM on the web,
// its own web view on phones.

const STATUS: Record<SiteStatus, { label: string; color: string; soft: string }> = {
  ok: { label: 'Dans les temps', color: '#2E6B4F', soft: '#E2EEE6' },
  risk: { label: 'À surveiller', color: '#9C6510', soft: '#F3E8D6' },
  late: { label: 'En retard', color: '#AB3327', soft: '#F5E1DE' },
  done: { label: 'Terminé', color: '#6E6153', soft: '#EFE8DC' },
};

const TASK_STATE = {
  todo: { label: 'À faire', color: '#6E6153' },
  doing: { label: 'En cours', color: '#A95C30' },
  blocked: { label: 'Bloqué', color: '#AB3327' },
};

function chf(n: number) {
  if (n >= 1_000_000) return `CHF ${(n / 1_000_000).toFixed(2)} M`;
  return `CHF ${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
}

function date(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export default function MaquetteDom({ plan }: { plan: MaquettePlan; dom?: DOMProps }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MaquetteHandle | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(true);

  // Phones: start with the list folded so the miniature stays visible.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 760) setListOpen(false);
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    try {
      handleRef.current = createMaquette(stageRef.current, plan, { onSelect: setSelectedId });
      // Respect "reduce motion": the miniature stays still until asked to move.
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
    };
  }, [plan]);

  const site = plan.sites.find((s) => s.id === selectedId) ?? null;
  const stats = useMemo(() => {
    const active = plan.sites.filter((s) => s.status !== 'done');
    return {
      active: active.length,
      people: new Set(plan.sites.flatMap((s) => s.crew)).size,
      alerts: plan.sites.filter((s) => s.alert).length,
    };
  }, [plan]);

  const choose = (id: string) => {
    handleRef.current?.select(id);
    handleRef.current?.focus(id);
  };

  return (
    <div className="mq-root">
      <style>{CSS}</style>
      <div ref={stageRef} className="mq-stage" />

      {error ? (
        <div className="mq-error">
          <b>La maquette 3D ne peut pas s’afficher sur cet appareil.</b>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mq-side">
        <div className="mq-card mq-head">
          <div className="mq-eyebrow">Ma maquette · prototype</div>
          <div className="mq-company">{plan.company.name}</div>
          <div className="mq-muted">
            {plan.company.locality} · {plan.today}
          </div>
          <div className="mq-kpis">
            <Kpi value={stats.active} label="chantiers en cours" />
            <Kpi value={stats.people} label="personnes sur place" />
            <Kpi value={stats.alerts} label="alertes" warn={stats.alerts > 0} />
          </div>
        </div>

        <div className="mq-card mq-list">
          <button type="button" className="mq-list-head" onClick={() => setListOpen((v) => !v)}>
            <span>Chantiers</span>
            <span className="mq-muted">{listOpen ? 'Masquer' : 'Afficher'}</span>
          </button>
          {listOpen
            ? plan.sites.map((s) => (
                <button key={s.id} type="button" className={`mq-row${s.id === selectedId ? ' mq-row-on' : ''}`} onClick={() => choose(s.id)}>
                  <span className="mq-dot" style={{ background: STATUS[s.status].color }} />
                  <span className="mq-row-main">
                    <span className="mq-row-name">{s.name}</span>
                    <span className="mq-row-meta">
                      {s.locality} · {plan.phases.find((p) => p.key === s.phase)?.label}
                    </span>
                    <span className="mq-bar">
                      <span style={{ width: `${Math.round(s.progress * 100)}%`, background: STATUS[s.status].color }} />
                    </span>
                  </span>
                  <span className="mq-row-pct">{Math.round(s.progress * 100)} %</span>
                </button>
              ))
            : null}
        </div>
      </div>

      {site ? <SitePanel plan={plan} site={site} onClose={() => handleRef.current?.select(null)} onCenter={() => handleRef.current?.focus(site.id)} /> : null}

      <div className="mq-bottom">
        <div className="mq-card mq-legend">
          {(Object.keys(STATUS) as SiteStatus[]).map((k) => (
            <span key={k} className="mq-legend-item">
              <span className="mq-dot" style={{ background: STATUS[k].color }} />
              {STATUS[k].label}
            </span>
          ))}
          <span className="mq-hint">Glisser pour tourner · molette pour zoomer · clic droit pour déplacer</span>
        </div>
        <div className="mq-actions">
          <button type="button" className="mq-btn" onClick={() => handleRef.current?.reset()}>
            Vue d’ensemble
          </button>
          <button
            type="button"
            className="mq-btn"
            onClick={() => {
              handleRef.current?.setAnimated(!animated);
              setAnimated(!animated);
            }}
          >
            {animated ? 'Pause' : 'Animer'}
          </button>
          <span className="mq-sample">Données d’exemple</span>
        </div>
      </div>
    </div>
  );
}

function Kpi({ value, label, warn = false }: { value: number; label: string; warn?: boolean }) {
  return (
    <div className="mq-kpi">
      <div className="mq-kpi-value" style={warn ? { color: '#AB3327' } : undefined}>
        {value}
      </div>
      <div className="mq-kpi-label">{label}</div>
    </div>
  );
}

function SitePanel({ plan, site, onClose, onCenter }: { plan: MaquettePlan; site: MaquetteSite; onClose: () => void; onCenter: () => void }) {
  const st = STATUS[site.status];
  const phaseIndex = plan.phases.findIndex((p) => p.key === site.phase);
  const spentShare = site.budget ? site.spent / site.budget : 0;
  const gap = Math.round((spentShare - site.progress) * 100);
  const crew = site.crew.map((id) => plan.people.find((p) => p.id === id)).filter(Boolean) as MaquettePlan['people'];
  return (
    <div className="mq-card mq-panel">
      <div className="mq-panel-top">
        <div>
          <div className="mq-eyebrow">
            {site.locality} · {site.client}
          </div>
          <div className="mq-panel-title">{site.name}</div>
        </div>
        <button type="button" className="mq-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      </div>
      <span className="mq-badge" style={{ color: st.color, background: st.soft }}>
        {st.label}
      </span>

      <div className="mq-steps">
        {plan.phases.map((p, i) => (
          <div key={p.key} className={`mq-step${i < phaseIndex ? ' mq-step-done' : ''}${i === phaseIndex ? ' mq-step-on' : ''}`}>
            <span className="mq-step-bar" />
            <span className="mq-step-label">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="mq-progress">
        <div className="mq-progress-head">
          <span>Avancement</span>
          <b>{Math.round(site.progress * 100)} %</b>
        </div>
        <div className="mq-bar mq-bar-big">
          <span style={{ width: `${Math.round(site.progress * 100)}%`, background: st.color }} />
        </div>
      </div>

      <div className="mq-figures">
        <Figure label="Budget" value={chf(site.budget)} />
        <Figure label="Dépensé" value={chf(site.spent)} sub={`${Math.round(spentShare * 100)} % du budget`} />
        <Figure label="Écart dépenses / avancement" value={`${gap > 0 ? '+' : ''}${gap} pts`} tone={gap > 3 ? '#AB3327' : gap < -3 ? '#2E6B4F' : undefined} />
        <Figure label={site.status === 'done' ? 'Réceptionné le' : 'Fin prévue'} value={date(site.endDate)} />
      </div>

      {site.alert ? <div className="mq-alert">{site.alert}</div> : null}

      <div className="mq-section">Sur place aujourd’hui</div>
      {crew.length ? (
        <div className="mq-crew">
          {crew.map((p) => (
            <div key={p.id} className="mq-person">
              <span className="mq-avatar" style={{ background: p.color }}>
                {p.initials}
              </span>
              <span>
                <b>{p.name}</b>
                <span className="mq-muted">{p.role}</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mq-muted">Personne de prévu sur ce chantier aujourd’hui.</div>
      )}

      {site.tasks.length ? (
        <>
          <div className="mq-section">Tâches ouvertes</div>
          <div className="mq-tasks">
            {site.tasks.map((t) => (
              <div key={t.title} className="mq-task">
                <span className="mq-task-state" style={{ color: TASK_STATE[t.state].color, borderColor: TASK_STATE[t.state].color }}>
                  {TASK_STATE[t.state].label}
                </span>
                <span className="mq-task-title">{t.title}</span>
                <span className="mq-task-people">{t.people.map((id) => plan.people.find((p) => p.id === id)?.initials).join(' ')}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="mq-panel-actions">
        <button type="button" className="mq-btn mq-btn-primary" disabled title="Prototype : données d’exemple">
          Ouvrir le chantier
        </button>
        <button type="button" className="mq-btn" onClick={onCenter}>
          Centrer
        </button>
      </div>
    </div>
  );
}

function Figure({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="mq-figure">
      <div className="mq-figure-label">{label}</div>
      <div className="mq-figure-value" style={tone ? { color: tone } : undefined}>
        {value}
      </div>
      {sub ? <div className="mq-muted">{sub}</div> : null}
    </div>
  );
}

const CSS = `
.mq-root { position: relative; flex: 1; width: 100%; height: 100%; min-height: 560px; overflow: hidden; background: #EFE6D6; font-family: Archivo, system-ui, -apple-system, sans-serif; color: #231A12; -webkit-font-smoothing: antialiased; }
.mq-root * { box-sizing: border-box; }
.mq-stage { position: absolute; inset: 0; z-index: 0; }
.mq-side, .mq-panel, .mq-bottom { z-index: 1; }
.mq-labels { position: absolute; inset: 0; pointer-events: none; }
.mq-label { position: absolute; left: 0; top: 0; pointer-events: auto; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px 6px 8px; border-radius: 999px; border: 1px solid rgba(35,26,18,0.12); background: rgba(255,253,249,0.94); box-shadow: 0 6px 18px rgba(43,33,26,0.16); font: 600 12px/1 Archivo, system-ui, sans-serif; color: #231A12; white-space: nowrap; cursor: pointer; transition: opacity .2s, box-shadow .2s; }
.mq-label::after { content: ''; position: absolute; left: 50%; bottom: -7px; width: 1px; height: 7px; background: rgba(35,26,18,0.35); }
.mq-label:hover, .mq-label.mq-on { box-shadow: 0 0 0 2px #A95C30, 0 8px 22px rgba(43,33,26,0.22); }
.mq-label.mq-dim { opacity: 0.55; }
.mq-label .mq-pct { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 11px; color: #6E6153; }
.mq-worker { position: absolute; left: 0; top: 0; pointer-events: auto; min-width: 24px; height: 20px; padding: 0 5px; border-radius: 999px; display: grid; place-items: center; color: #FFFFFF; font: 800 10px/1 Archivo, system-ui, sans-serif; border: 1.5px solid #FFFFFF; box-shadow: 0 3px 10px rgba(43,33,26,0.3); }
.mq-depot { cursor: default; background: #16120E; color: #F4F1EA; border-color: #16120E; font-weight: 700; }
.mq-depot::after { background: #16120E; }
.mq-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; display: inline-block; }
.mq-st-ok .mq-dot { background: #2E6B4F; } .mq-st-risk .mq-dot { background: #C88A1E; } .mq-st-late .mq-dot { background: #AB3327; } .mq-st-done .mq-dot { background: #8C8073; }
.mq-st-late { border-color: rgba(171,51,39,0.45); }

.mq-card { background: rgba(255,253,249,0.95); border: 1px solid rgba(35,26,18,0.1); border-radius: 10px; box-shadow: 0 10px 30px rgba(43,33,26,0.12); backdrop-filter: blur(6px); }
.mq-side { position: absolute; left: 16px; top: 16px; width: 300px; max-height: calc(100% - 96px); display: flex; flex-direction: column; gap: 12px; }
.mq-head { padding: 16px; }
.mq-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: #A95C30; }
.mq-company { font-size: 19px; font-weight: 800; letter-spacing: -0.3px; margin-top: 6px; }
.mq-muted { font-size: 12px; color: #6E6153; display: block; }
.mq-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
.mq-kpi { border: 1px solid #EDE3D3; border-radius: 6px; padding: 8px; background: #FFFFFF; }
.mq-kpi-value { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 18px; font-weight: 600; }
.mq-kpi-label { font-size: 10.5px; color: #6E6153; line-height: 1.25; margin-top: 2px; }
.mq-list { padding: 6px; overflow: auto; }
.mq-list-head { all: unset; display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; padding: 8px 10px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; cursor: pointer; }
.mq-list-head .mq-muted { text-transform: none; letter-spacing: 0; font-weight: 600; display: inline; }
.mq-row { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 7px; cursor: pointer; }
.mq-row:hover { background: #F6EFE3; }
.mq-row-on { background: #F5DECB !important; }
.mq-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.mq-row-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mq-row-meta { font-size: 11.5px; color: #6E6153; }
.mq-row-pct { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 11.5px; color: #231A12; }
.mq-bar { display: block; height: 4px; border-radius: 3px; background: #EFE6D6; overflow: hidden; }
.mq-bar > span { display: block; height: 100%; border-radius: 3px; }
.mq-bar-big { height: 8px; margin-top: 6px; }

.mq-panel { position: absolute; right: 16px; top: 16px; width: 360px; max-height: calc(100% - 96px); overflow: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; animation: mq-in .25s ease-out; }
@keyframes mq-in { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
.mq-panel-top { display: flex; justify-content: space-between; gap: 12px; }
.mq-panel-title { font-size: 21px; font-weight: 800; letter-spacing: -0.4px; margin-top: 4px; }
.mq-close { all: unset; cursor: pointer; width: 30px; height: 30px; border-radius: 6px; display: grid; place-items: center; font-size: 22px; color: #6E6153; }
.mq-close:hover { background: #F6EFE3; }
.mq-badge { align-self: flex-start; font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; }
.mq-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.mq-step { display: flex; flex-direction: column; gap: 5px; }
.mq-step-bar { height: 4px; border-radius: 2px; background: #EDE3D3; }
.mq-step-done .mq-step-bar { background: #C9A27A; }
.mq-step-on .mq-step-bar { background: #A95C30; }
.mq-step-label { font-size: 9.5px; color: #8C8073; line-height: 1.2; }
.mq-step-on .mq-step-label { color: #231A12; font-weight: 700; }
.mq-progress-head { display: flex; justify-content: space-between; font-size: 12px; color: #6E6153; }
.mq-progress-head b { font-family: 'Martian Mono', ui-monospace, monospace; color: #231A12; }
.mq-figures { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.mq-figure { border: 1px solid #EDE3D3; border-radius: 7px; padding: 9px 10px; background: #FFFFFF; }
.mq-figure-label { font-size: 10.5px; color: #6E6153; font-weight: 600; }
.mq-figure-value { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 14px; font-weight: 600; margin-top: 3px; }
.mq-alert { font-size: 12.5px; line-height: 1.45; padding: 10px 12px; border-radius: 7px; background: #F5E1DE; color: #7E2A21; border-left: 3px solid #AB3327; }
.mq-section { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; margin-top: 4px; }
.mq-crew { display: flex; flex-direction: column; gap: 8px; }
.mq-person { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.mq-person b { display: block; font-weight: 700; }
.mq-avatar { width: 30px; height: 30px; border-radius: 50%; color: #FFFFFF; display: grid; place-items: center; font-size: 11px; font-weight: 800; flex: none; }
.mq-tasks { display: flex; flex-direction: column; }
.mq-task { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-top: 1px solid #EDE3D3; font-size: 12.5px; }
.mq-task-state { flex: none; font-size: 10px; font-weight: 700; border: 1px solid; border-radius: 999px; padding: 2px 7px; }
.mq-task-title { flex: 1; }
.mq-task-people { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 10.5px; color: #6E6153; }
.mq-panel-actions { display: flex; gap: 8px; margin-top: 4px; }

.mq-bottom { position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; pointer-events: none; }
.mq-bottom > * { pointer-events: auto; }
.mq-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 10px 14px; font-size: 12px; font-weight: 600; }
.mq-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.mq-hint { color: #8C8073; font-weight: 500; }
.mq-actions { display: flex; align-items: center; gap: 8px; }
.mq-btn { font: 700 13px Archivo, system-ui, sans-serif; padding: 9px 14px; border-radius: 6px; border: 1px solid rgba(35,26,18,0.14); background: #FFFDF9; color: #231A12; cursor: pointer; box-shadow: 0 4px 14px rgba(43,33,26,0.1); }
.mq-btn:hover { background: #F6EFE3; }
.mq-btn:disabled { opacity: .55; cursor: not-allowed; }
.mq-btn-primary { background: #A95C30; border-color: #A95C30; color: #FFFFFF; }
.mq-btn-primary:hover { background: #8E4C27; }
.mq-sample { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #6E6153; background: rgba(255,253,249,0.9); border: 1px solid rgba(35,26,18,0.12); border-radius: 999px; padding: 6px 10px; }
.mq-error { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center; text-align: center; padding: 24px; font-size: 14px; color: #6E6153; }
.mq-error b { color: #231A12; }

@media (max-width: 760px) {
  .mq-side { width: auto; right: 16px; max-height: 45%; }
  .mq-kpis { display: none; }
  .mq-panel { left: 12px; right: 12px; width: auto; top: auto; bottom: 12px; max-height: 62%; }
  .mq-hint { display: none; }
  .mq-legend { display: none; }
}
`;
