'use dom';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';
import { accentColor, createRelief, type ReliefHandle } from '../../lib/relief/engine';
import { SCENE_CSS } from '../../lib/relief/sceneCss';
import type { ReliefCopy } from '../../lib/relief/copy';
import type { ReliefGeo } from '../../lib/relief/geo';
import type { ReliefData, ReliefSpec } from '../../lib/relief/types';

// Cantia Maquette on the dashboard: the company's little world turning on
// its own (people walking out to their projects, buildings at their step),
// and next to it who is out today, where, and how many projects stand at
// each step of the process — a skyline of the pipeline. One tap opens the
// maquette full screen. Before the first build, the same card shows the
// company's usual process as a sketch and invites the owner to create it.

interface Props {
  spec: ReliefSpec;
  data: ReliefData;
  geo: ReliefGeo | null;
  copy: ReliefCopy;
  mode: 'live' | 'sketch' | 'building';
  company: string;
  items: string;
  canCreate: boolean;
  onOpen: () => void;
  dom?: DOMProps;
}

function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 900);
      setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

export default function MaquetteCardDom({ spec, data, geo, copy, mode, company, items, canCreate, onOpen }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<ReliefHandle | null>(null);
  const first = useRef(true);
  const [narrow, setNarrow] = useState(false);
  const accent = accentColor(spec);
  const geoKey = geo ? `${geo.city}|${geo.landmark}` : '';

  // The world: created once per plan, then updated with the live data.
  useEffect(() => {
    if (!host.current) return;
    try {
      handle.current = createRelief(host.current, spec, data, {
        onSelect: () => {},
        baseLabel: company,
        exampleLabel: '',
        interactive: false,
        transparent: true,
        tilt: true,
        spin: 0.45,
        zoom: 1.6,
        intro: true,
        geo: geo ? { landmark: geo.landmark, backdrop: geo.backdrop, water: geo.water, names: geo.names } : null,
      });
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) handle.current.setAnimated(false);
    } catch {
      handle.current = null;
    }
    return () => {
      handle.current?.dispose();
      handle.current = null;
      first.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, geoKey]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    handle.current?.update(data);
  }, [data]);

  // The world sits in the part of the card the text leaves free.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const n = w < 720;
      setNarrow(n);
      handle.current?.setInsets(n ? { bottom: 0 } : { left: Math.round(w * 0.42) });
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [spec, geoKey]);

  const real = data.items.filter((i) => !i.example);
  const active = real.filter((i) => i.status !== 'done');
  const late = active.filter((i) => i.status === 'late').length;
  const watch = active.filter((i) => i.status === 'risk').length;

  // Who is out today, and where.
  const crew = useMemo(() => {
    const out: { id: string; name: string; initials: string; color: string; place: string }[] = [];
    for (const it of data.items)
      for (const pid of it.crew) {
        const p = data.people.find((x) => x.id === pid);
        if (p && !out.some((o) => o.id === p.id)) out.push({ ...p, place: it.name });
      }
    return out;
  }, [data]);

  // How many items stand at each step of the usual process.
  const pipeline = useMemo(() => {
    const kind = data.kinds[0];
    const stages = kind?.stages ?? spec.stages;
    const counts = stages.map((_, i) => active.filter((it) => it.kind === kind?.id && Math.min(it.stages.length - 1, it.stage) === i).length);
    const max = Math.max(1, ...counts);
    return stages.map((s, i) => ({ label: s.label, n: counts[i], h: counts[i] / max }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, spec]);

  const where = [geo?.city, geo?.elevation != null ? `${Math.round(geo.elevation)} m` : null].filter(Boolean).join(' · ');
  const live = mode === 'live';
  const headline = live ? (crew.length === 0 ? copy.cardCalm : crew.length === 1 ? copy.cardOutOne : fill(copy.cardOut, { n: crew.length })) : fill(copy.cardSketchTitle, { company });
  const cta = live || mode === 'building' ? copy.cardEnter : canCreate ? copy.cardCreate : copy.cardDiscover;

  return (
    <div
      ref={root}
      className={`mc${narrow ? ' mc-n' : ''}`}
      style={{ ['--accent' as string]: accent }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      <style>{SCENE_CSS + CSS}</style>
      <div className="mc-sky" aria-hidden="true" />
      <div ref={host} className="mc-world" aria-hidden="true" />
      <div className="mc-veil" aria-hidden="true" />

      <div className="mc-body">
        <div className="mc-top">
          <span className="mc-live">
            <span className="mc-dot" />
            {live ? copy.cardLive : copy.brand}
          </span>
          {where ? <span className="mc-where">{where}</span> : null}
        </div>

        <h2 className="mc-h">{headline}</h2>

        {live && crew.length ? (
          <ul className="mc-crew">
            {crew.slice(0, narrow ? 2 : 3).map((p, i) => (
              <li key={p.id} style={{ animationDelay: `${200 + i * 90}ms` }}>
                <span className="mc-av" style={{ background: p.color }}>
                  {p.initials}
                </span>
                <span className="mc-name">{p.name}</span>
                <span className="mc-place">{fill(copy.cardAt, { place: p.place })}</span>
              </li>
            ))}
            {crew.length > (narrow ? 2 : 3) ? <li className="mc-more">{fill(copy.cardMore, { n: crew.length - (narrow ? 2 : 3) })}</li> : null}
          </ul>
        ) : !live ? (
          <p className="mc-text">{mode === 'building' ? copy.cardBuilding : fill(copy.cardSketchText, { items })}</p>
        ) : null}

        <div className="mc-pipe">
          <div className="mc-label">
            {live ? fill(copy.cardPipeline, { items }) : copy.obRecapProcess}
            {data.kinds.length > 1 ? ` · ${data.kinds[0].name}` : ''}
          </div>
          <div className="mc-bars">
            {pipeline.map((s, i) => (
              <div key={`${s.label}-${i}`} className="mc-bar" title={s.label}>
                {live ? <span className="mc-n">{s.n}</span> : null}
                <span className="mc-col">
                  <span style={{ height: live ? `${Math.max(s.n ? 18 : 0, s.h * 100)}%` : `${30 + ((i * 37) % 60)}%`, animationDelay: `${300 + i * 70}ms` }} />
                </span>
                <span className="mc-step">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-foot">
          {live ? (
            <span className="mc-stats">
              <span>
                <b>
                  <CountUp value={active.length} />
                </b>{' '}
                {fill(copy.cardActive, { items })}
              </span>
              {late ? (
                <span className="mc-bad">
                  <b>{late}</b> {copy.cardLate}
                </span>
              ) : null}
              {watch ? (
                <span className="mc-warn">
                  <b>{watch}</b> {copy.cardWatch}
                </span>
              ) : null}
            </span>
          ) : (
            <span />
          )}
          <span className="mc-cta">
            {cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.mc { --ink: #1D1712; --ink2: #4A3F35; --ink3: #7C7062; position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 6px; cursor: pointer; font-family: Archivo, system-ui, -apple-system, sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; background: #EEE5D6; outline: none; }
.mc * { box-sizing: border-box; }
.mc:focus-visible { box-shadow: inset 0 0 0 2px var(--accent); }
.mc-sky { position: absolute; inset: 0; background: radial-gradient(120% 90% at 78% 30%, #F8F2E7 0%, #EFE6D7 55%, #E6DBC9 100%); }
.mc-sky::after { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(29,23,18,.07) 1px, transparent 1.2px); background-size: 14px 14px; -webkit-mask-image: linear-gradient(90deg, transparent 30%, #000 70%); mask-image: linear-gradient(90deg, transparent 30%, #000 70%); }
.mc-world { position: absolute; inset: 0; transition: transform 1.2s cubic-bezier(.2,.8,.2,1); }
.mc:hover .mc-world { transform: scale(1.025); }
.mc-veil { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, rgba(251,248,242,.97) 0%, rgba(251,248,242,.92) 30%, rgba(251,248,242,.55) 42%, rgba(251,248,242,0) 56%); }
.mc-body { position: relative; z-index: 2; height: 100%; width: 44%; min-width: 330px; padding: 20px 24px 18px; display: flex; flex-direction: column; gap: 10px; }
.mc-top { display: flex; align-items: center; gap: 12px; }
.mc-live { display: inline-flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; color: var(--ink); }
.mc-dot { width: 7px; height: 7px; border-radius: 50%; background: #3FA36B; box-shadow: 0 0 0 0 rgba(63,163,107,.6); animation: mc-ping 1.8s infinite; }
.mc-where { font: 500 10.5px 'Martian Mono', ui-monospace, monospace; color: var(--ink3); }
.mc-h { margin: 0; font-size: 30px; line-height: 1.02; font-weight: 900; letter-spacing: -1px; text-wrap: balance; animation: mc-in .6s cubic-bezier(.2,.8,.2,1) both; }
.mc-text { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink2); max-width: 40ch; }
.mc-crew { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.mc-crew li { display: grid; grid-template-columns: 24px auto 1fr; align-items: center; gap: 8px; font-size: 13px; animation: mc-in .5s cubic-bezier(.2,.8,.2,1) both; min-width: 0; }
.mc-av { width: 24px; height: 24px; border-radius: 50%; color: #FFFFFF; display: grid; place-items: center; font-size: 9.5px; font-weight: 800; box-shadow: 0 0 0 2px #FBF8F2; }
.mc-name { font-weight: 700; white-space: nowrap; }
.mc-place { color: var(--ink3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-more { font-size: 11.5px; color: var(--ink3); padding-left: 32px; grid-template-columns: 1fr !important; }
.mc-pipe { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
.mc-label { font-size: 10px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: var(--ink2); }
.mc-bars { display: flex; gap: 6px; align-items: flex-end; }
.mc-bar { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.mc-n { font: 700 12px 'Martian Mono', ui-monospace, monospace; color: var(--ink); }
.mc-col { position: relative; height: 30px; border-bottom: 2px solid var(--ink); display: flex; align-items: flex-end; }
.mc-col span { display: block; width: 100%; background: var(--accent); transform-origin: bottom; animation: mc-grow .7s cubic-bezier(.2,.8,.2,1) both; }
.mc-bar:nth-child(even) .mc-col span { background: color-mix(in srgb, var(--accent) 78%, #1D1712); }
.mc-step { font-size: 10px; font-weight: 700; color: var(--ink3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding-top: 4px; }
.mc-stats { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--ink2); }
.mc-stats b { font: 700 13px 'Martian Mono', ui-monospace, monospace; color: var(--ink); }
.mc-bad, .mc-bad b { color: #AB3327 !important; }
.mc-warn, .mc-warn b { color: #8F6210 !important; }
.mc-cta { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 800; color: #FFFFFF; background: var(--ink); padding: 10px 14px; border-radius: 3px; transition: background .2s, transform .2s; white-space: nowrap; }
.mc:hover .mc-cta { background: var(--accent); }
.mc:hover .mc-cta svg { transform: translateX(3px); }
.mc-cta svg { transition: transform .2s; }
.mc .rf-base { font-size: 9px; padding: 3px 6px; }

/* narrow: the world on top, the rest below */
.mc-n .mc-world { bottom: auto; height: 210px; }
.mc-n .mc-veil { background: linear-gradient(180deg, rgba(251,248,242,0) 0, rgba(251,248,242,0) 150px, rgba(251,248,242,.96) 210px, #FBF8F2 230px); }
.mc-n .mc-sky::after { -webkit-mask-image: linear-gradient(180deg, #000 0, transparent 220px); mask-image: linear-gradient(180deg, #000 0, transparent 220px); }
.mc-n .mc-body { width: 100%; min-width: 0; padding: 16px 16px 16px; }
.mc-n .mc-top { position: absolute; left: 16px; top: 14px; }
.mc-n .mc-h { margin-top: 196px; font-size: 25px; }
.mc-n .mc-pipe { margin-top: 6px; }
.mc-n .mc-cta { width: 100%; justify-content: center; }

@keyframes mc-ping { 0% { box-shadow: 0 0 0 0 rgba(63,163,107,.55); } 80%, 100% { box-shadow: 0 0 0 8px rgba(63,163,107,0); } }
@keyframes mc-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes mc-grow { from { transform: scaleY(0); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .mc *, .mc *::after { animation: none !important; transition: none !important; } }
`;
