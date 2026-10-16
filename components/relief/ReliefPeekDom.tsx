'use dom';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';
import { accentColor, createRelief, type ReliefHandle } from '../../lib/relief/engine';
import { formatCoord, type ReliefGeo } from '../../lib/relief/geo';
import { SCENE_CSS } from '../../lib/relief/sceneCss';
import type { ReliefData, ReliefSpec } from '../../lib/relief/types';

// The Relief on the dashboard, laid out like a sheet of the Swiss national
// map at night: a graduated frame with the company's LV95 coordinates,
// contour lines, the town's own landmark and horizon behind the 3D city, a
// cartouche with the figures of the day, and the logbook of what happened
// lately. One click opens the Relief full screen.

export interface PeekEvent {
  kind: 'task' | 'plan' | 'project' | 'paid';
  tag: string;
  title: string;
  meta: string;
  when: string;
}

interface Props {
  spec: ReliefSpec;
  data: ReliefData;
  geo: ReliefGeo | null;
  eyebrow: string;
  live: string;
  title: string;
  subtitle: string;
  stats: { value: number; suffix?: string; label: string; tone?: 'late' }[];
  feedTitle: string;
  feed: PeekEvent[];
  feedEmpty: string;
  legend: string[];
  cta: string;
  onOpen: () => void;
  dom?: DOMProps;
}

const KIND_COLOR: Record<PeekEvent['kind'], string> = { task: '#5FB98A', plan: '#7FB3D9', project: '#D9A64A', paid: '#B9A2E0' };

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1100);
      setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

// Contour lines around the town, drawn once per company (seeded).
function contours(seed: number, w: number, h: number, cx: number, cy: number) {
  let x = seed || 1;
  const rnd = () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
  const waves = Array.from({ length: 4 }, () => ({ f: 2 + Math.floor(rnd() * 4), p: rnd() * Math.PI * 2, a: 0.05 + rnd() * 0.09 }));
  const out: { d: string; index: boolean }[] = [];
  for (let k = 1; k <= 22; k++) {
    const r = k * Math.max(w, h) * 0.034;
    let d = '';
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      let m = 1;
      for (const wv of waves) m += Math.sin(t * wv.f + wv.p + k * 0.13) * wv.a;
      const px = cx + Math.cos(t) * r * m * 1.35;
      const py = cy + Math.sin(t) * r * m * 0.8;
      d += `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    out.push({ d: `${d}Z`, index: k % 5 === 0 });
  }
  return out;
}

export default function ReliefPeekDom({ spec, data, geo, eyebrow, live, title, subtitle, stats, feedTitle, feed, feedEmpty, legend, cta, onOpen }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ReliefHandle | null>(null);
  const first = useRef(true);
  const [size, setSize] = useState({ w: 1100, h: 400 });
  const [turn, setTurn] = useState(0);
  const wide = size.w > 760;
  const geoKey = geo ? `${geo.city}|${geo.landmark}|${geo.backdrop}` : '';

  useEffect(() => {
    if (!hostRef.current) return;
    try {
      handleRef.current = createRelief(hostRef.current, spec, data, {
        onSelect: () => {},
        baseLabel: '',
        exampleLabel: '',
        preview: true,
        intro: true,
        interactive: false,
        transparent: true,
        mood: 'dusk',
        hud: true,
        zoom: hostRef.current.clientWidth > 760 ? 1.25 : 1.0,
        geo: geo ? { landmark: geo.landmark, backdrop: geo.backdrop, water: geo.water, names: geo.names } : null,
      });
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) handleRef.current.setAnimated(false);
    } catch {
      handleRef.current = null;
    }
    return () => {
      handleRef.current?.dispose();
      handleRef.current = null;
      first.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, geoKey]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    handleRef.current?.update(data);
  }, [data]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize({ w, h });
      handleRef.current?.setInsets(w > 760 ? { left: Math.min(340, w * 0.31), right: Math.min(290, w * 0.25), top: 20, bottom: 20 } : { top: 30, bottom: 300 });
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [spec, geoKey]);

  useEffect(() => {
    if (feed.length < 2) return;
    const id = setInterval(() => setTurn((x) => x + 1), 5000);
    return () => clearInterval(id);
  }, [feed.length]);
  const shown = feed.length ? [...feed.slice(turn % feed.length), ...feed.slice(0, turn % feed.length)].slice(0, wide ? 5 : 2) : [];

  const lines = useMemo(() => {
    const seed = Math.abs(Array.from(spec.title + (geo?.city ?? '')).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
    return contours(seed, size.w, size.h, size.w * (wide ? 0.5 : 0.5), size.h * (wide ? 0.55 : 0.3));
  }, [spec.title, geo?.city, size.w, size.h, wide]);

  // Graduation of the frame: every 500 m around the town.
  const ticks = useMemo(() => {
    if (!geo?.e || !geo?.n) return null;
    const e0 = Math.round(geo.e / 500) * 500;
    const n0 = Math.round(geo.n / 500) * 500;
    return { e: [-1000, -500, 0, 500, 1000].map((d) => e0 + d), n: [500, 0, -500].map((d) => n0 + d) };
  }, [geo?.e, geo?.n]);

  return (
    <div
      ref={rootRef}
      className={`pk-root${wide ? '' : ' pk-narrow'}`}
      style={{ ['--accent' as string]: accentColor(spec) }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${title} · ${cta}`}
    >
      <style>{SCENE_CSS + CSS}</style>
      <svg className="pk-contours" width={size.w} height={size.h} aria-hidden="true">
        {lines.map((l, i) => (
          <path key={i} d={l.d} fill="none" stroke="#EBE4D6" strokeOpacity={l.index ? 0.13 : 0.055} strokeWidth={l.index ? 1.1 : 0.8} />
        ))}
      </svg>
      <div ref={hostRef} className="pk-world rf-dusk" aria-hidden="true" />

      <div className="pk-frame" aria-hidden="true">
        {ticks && wide
          ? ticks.e.map((v, i) => (
              <span key={`e${v}`} className="pk-tick pk-tick-e" style={{ left: `${10 + i * 20}%` }}>
                {formatCoord(v)}
              </span>
            ))
          : null}
        {ticks && wide
          ? ticks.n.map((v, i) => (
              <span key={`n${v}`} className="pk-tick pk-tick-n" style={{ top: `${22 + i * 28}%` }}>
                {formatCoord(v)}
              </span>
            ))
          : null}
      </div>

      <div className="pk-north" aria-hidden="true">
        <svg width="18" height="30" viewBox="0 0 18 30">
          <path d="M9 1 L15 19 L9 15.5 L3 19 Z" fill="#EBE4D6" />
          <path d="M9 1 L9 15.5 L3 19 Z" fill="#111A23" stroke="#EBE4D6" strokeWidth="0.8" />
          <text x="9" y="29" textAnchor="middle" fontSize="8" fontWeight="700" fill="#EBE4D6" fontFamily="Archivo, sans-serif">
            N
          </text>
        </svg>
      </div>

      <div className="pk-cartouche">
        <div className="pk-c-top">
          <span>{eyebrow}</span>
          <span className="pk-live">
            <i />
            {live}
          </span>
        </div>
        {geo ? <div className="pk-c-city">{geo.city}</div> : null}
        <div className="pk-c-title">{title}</div>
        {geo && (geo.canton || geo.elevation != null) ? (
          <div className="pk-c-meta">
            {[geo.canton, geo.elevation != null ? `${Math.round(geo.elevation)} m` : null].filter(Boolean).join(' · ')}
            {geo.e && geo.n ? (
              <>
                <br />
                {formatCoord(geo.e)} / {formatCoord(geo.n)}
              </>
            ) : null}
          </div>
        ) : subtitle ? (
          <div className="pk-c-meta">{subtitle}</div>
        ) : null}
        {stats.length ? (
          <div className="pk-c-stats">
            {stats.map((s) => (
              <div key={s.label} className={`pk-c-row${s.tone === 'late' ? ' pk-c-late' : ''}`}>
                <span>{s.label}</span>
                <b>
                  <CountUp value={s.value} suffix={s.suffix} />
                </b>
              </div>
            ))}
          </div>
        ) : null}
        <span className="pk-cta">
          {cta}
          <span className="pk-arrow">→</span>
        </span>
      </div>

      <div className="pk-log">
        <div className="pk-log-head">{feedTitle}</div>
        {shown.length ? (
          shown.map((e, i) => (
            <div key={`${turn}-${i}-${e.title}`} className="pk-ev" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="pk-ev-when">{e.when}</span>
              <span className="pk-ev-main">
                <span className="pk-ev-tag">
                  <i style={{ background: KIND_COLOR[e.kind] }} />
                  {e.tag}
                </span>
                <span className="pk-ev-title">{e.title}</span>
                {e.meta ? <span className="pk-ev-meta">{e.meta}</span> : null}
              </span>
            </div>
          ))
        ) : (
          <div className="pk-ev-empty">{feedEmpty}</div>
        )}
      </div>

      {wide ? (
        <div className="pk-legend" aria-hidden="true">
          <span>
            <i className="pk-l-line" />
            {legend[0]}
          </span>
          <span>
            <i className="pk-l-line" style={{ background: '#5FB98A' }} />
            {legend[1]}
          </span>
          <span>
            <i className="pk-l-sq" />
            {legend[2]}
          </span>
        </div>
      ) : null}
    </div>
  );
}

const CSS = `
.pk-root { position: relative; width: 100%; height: 100%; min-height: 280px; overflow: hidden; border-radius: 6px; cursor: pointer; background: #111A23; font-family: Archivo, system-ui, -apple-system, sans-serif; color: #EBE4D6; -webkit-font-smoothing: antialiased; box-sizing: border-box; outline: none; isolation: isolate; }
.pk-root * { box-sizing: border-box; }
.pk-root:focus-visible { box-shadow: 0 0 0 2px var(--accent); }
.pk-contours { position: absolute; inset: 0; }
.pk-world { position: absolute; inset: 0; }
.pk-frame { position: absolute; inset: 12px; border: 1px solid rgba(235,228,214,0.3); pointer-events: none; background:
  repeating-linear-gradient(90deg, rgba(235,228,214,0.45) 0 1px, transparent 1px 40px) top / 100% 5px no-repeat,
  repeating-linear-gradient(90deg, rgba(235,228,214,0.45) 0 1px, transparent 1px 40px) bottom / 100% 5px no-repeat,
  repeating-linear-gradient(0deg, rgba(235,228,214,0.45) 0 1px, transparent 1px 40px) left / 5px 100% no-repeat,
  repeating-linear-gradient(0deg, rgba(235,228,214,0.45) 0 1px, transparent 1px 40px) right / 5px 100% no-repeat; }
.pk-tick { position: absolute; font: 500 8.5px 'Martian Mono', ui-monospace, monospace; color: rgba(235,228,214,0.6); letter-spacing: .3px; background: #111A23; padding: 0 4px; }
.pk-tick-e { top: -6px; transform: translateX(-50%); }
.pk-tick-n { left: -6px; transform: rotate(-90deg) translateX(-50%); transform-origin: left top; }
.pk-north { position: absolute; left: 26px; top: 26px; opacity: .85; }

.pk-cartouche { position: absolute; left: 24px; bottom: 24px; width: min(300px, 30%); display: flex; flex-direction: column; background: #F1EBDF; color: #1D1712; padding: 14px 16px 12px; border-top: 3px solid var(--accent); z-index: 2; animation: pk-in .5s ease-out both; }
.pk-c-top { display: flex; justify-content: space-between; align-items: center; font-size: 9px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #6E6458; }
.pk-live { display: inline-flex; align-items: center; gap: 5px; color: #A3271B; }
.pk-live i { width: 6px; height: 6px; background: #C62F22; animation: pk-blink 1.6s steps(2, jump-none) infinite; }
.pk-c-city { margin-top: 10px; font-size: 11px; font-weight: 800; letter-spacing: 3.5px; text-transform: uppercase; color: #5D5247; }
.pk-c-title { font-size: 21px; line-height: 1.05; font-weight: 900; letter-spacing: -0.5px; margin-top: 2px; text-wrap: balance; }
.pk-c-meta { margin-top: 6px; font: 500 10px/1.5 'Martian Mono', ui-monospace, monospace; color: #6E6458; }
.pk-c-stats { margin-top: 10px; border-top: 1px solid #D9CFBF; }
.pk-c-row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; padding: 6px 0; border-bottom: 1px solid #E3DACB; font-size: 11.5px; color: #4A3F35; }
.pk-c-row b { font: 600 15px 'Martian Mono', ui-monospace, monospace; color: #1D1712; font-variant-numeric: tabular-nums; }
.pk-c-late b, .pk-c-late span { color: #A3271B; }
.pk-cta { margin-top: 12px; display: inline-flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12.5px; font-weight: 800; letter-spacing: .3px; color: #1D1712; padding-bottom: 3px; border-bottom: 2px solid var(--accent); }
.pk-arrow { transition: transform .25s; }
.pk-root:hover .pk-arrow { transform: translateX(4px); }

.pk-log { position: absolute; right: 26px; top: 26px; width: min(260px, 24%); display: flex; flex-direction: column; z-index: 2; border-left: 1px solid rgba(235,228,214,0.25); padding-left: 12px; }
.pk-log-head { font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: rgba(235,228,214,0.7); padding-bottom: 8px; }
.pk-ev { display: grid; grid-template-columns: 54px 1fr; gap: 8px; padding: 7px 0; border-top: 1px solid rgba(235,228,214,0.1); animation: pk-fade .5s ease-out both; }
.pk-ev-when { font: 500 9.5px/1.5 'Martian Mono', ui-monospace, monospace; color: rgba(235,228,214,0.55); }
.pk-ev-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pk-ev-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(235,228,214,0.75); }
.pk-ev-tag i { width: 6px; height: 6px; display: inline-block; }
.pk-ev-title { font-size: 12.5px; font-weight: 700; color: #F6F1E8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pk-ev-meta { font-size: 10.5px; color: rgba(235,228,214,0.55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pk-ev-empty { font-size: 11.5px; line-height: 1.5; color: rgba(235,228,214,0.55); padding-top: 6px; border-top: 1px solid rgba(235,228,214,0.1); }

.pk-legend { position: absolute; right: 26px; bottom: 24px; display: flex; gap: 14px; font-size: 10px; font-weight: 600; color: rgba(235,228,214,0.7); z-index: 2; }
.pk-legend span { display: inline-flex; align-items: center; gap: 6px; }
.pk-l-line { width: 16px; height: 2px; background: var(--accent); display: inline-block; }
.pk-l-sq { width: 7px; height: 7px; background: #C62F22; display: inline-block; }

@keyframes pk-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes pk-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pk-blink { 50% { opacity: .25; } }

/* phone */
.pk-narrow .pk-north { left: 22px; top: 22px; }
.pk-narrow .pk-cartouche { left: 12px; right: 12px; bottom: 12px; width: auto; padding: 12px 14px 10px; }
.pk-narrow .pk-c-title { font-size: 18px; }
.pk-narrow .pk-c-stats { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14px; }
.pk-narrow .pk-c-row { font-size: 10.5px; }
.pk-narrow .pk-c-row b { font-size: 13px; }
.pk-narrow .pk-log { left: 24px; right: 24px; top: auto; bottom: calc(12px + var(--cart, 260px)); width: auto; display: none; }
@media (prefers-reduced-motion: reduce) { .pk-root *, .pk-root { animation: none !important; transition: none !important; } }
`;
