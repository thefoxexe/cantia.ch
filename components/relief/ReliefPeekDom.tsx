'use dom';

import { useEffect, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';
import { accentColor, createRelief, type ReliefHandle } from '../../lib/relief/engine';
import type { ReliefData, ReliefSpec } from '../../lib/relief/types';

// The Relief on the dashboard, as a live city at dusk: the company's real
// miniature turning slowly, lit windows, traffic, a data cable from the base
// to every job with pulses running along it (outgoing work, progress coming
// back, red beacons on what is late), today's figures counting up, and the
// latest activity scrolling in. One click opens the Relief full screen.
// Before the first build it shows a sketch of the company's process.

export interface PeekEvent {
  kind: 'task' | 'plan' | 'project' | 'paid';
  tag: string;
  title: string;
  meta: string;
}

interface Props {
  spec: ReliefSpec;
  data: ReliefData;
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

const KIND_COLOR: Record<PeekEvent['kind'], string> = { task: '#3FBF7F', plan: '#5AA9E6', project: '#E7A52A', paid: '#B48CF0' };

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setN(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1300);
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

export default function ReliefPeekDom({ spec, data, eyebrow, live, title, subtitle, stats, feedTitle, feed, feedEmpty, legend, cta, onOpen }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ReliefHandle | null>(null);
  const first = useRef(true);
  const [wide, setWide] = useState(true);
  const [turn, setTurn] = useState(0);

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
        zoom: hostRef.current.clientWidth > 760 ? 1.35 : 1.05,
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
  }, [spec]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    handleRef.current?.update(data);
  }, [data]);

  // The city sits between the figures and the feed.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fit = () => {
      const w = host.clientWidth;
      const isWide = w > 760;
      setWide(isWide);
      handleRef.current?.setInsets(isWide ? { left: Math.min(330, w * 0.3), right: Math.min(300, w * 0.26), bottom: 30, top: 10 } : { top: 92, bottom: 250 });
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(host);
    return () => ro?.disconnect();
  }, [spec]);

  // The feed keeps moving: the oldest entry goes back to the top.
  useEffect(() => {
    if (feed.length < 2) return;
    const id = setInterval(() => setTurn((x) => x + 1), 4200);
    return () => clearInterval(id);
  }, [feed.length]);
  const shown = feed.length ? [...feed.slice(turn % feed.length), ...feed.slice(0, turn % feed.length)].slice(0, wide ? 5 : 1) : [];

  return (
    <div
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
      <style>{CSS}</style>
      <div className="pk-sky" aria-hidden="true" />
      <div className="pk-grid" aria-hidden="true" />
      <div className="pk-scan" aria-hidden="true" />
      <div ref={hostRef} className="pk-world" aria-hidden="true" />

      <div className="pk-left">
        <div className="pk-eyebrow">
          <span className="pk-live" />
          {eyebrow} · {live}
        </div>
        <div className="pk-title">{title}</div>
        {subtitle && wide ? <div className="pk-sub">{subtitle}</div> : null}
        {stats.length ? (
          <div className="pk-stats">
            {stats.map((s, i) => (
              <div key={s.label} className={`pk-stat${s.tone === 'late' ? ' pk-stat-late' : ''}`} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                <b>
                  <CountUp value={s.value} suffix={s.suffix} />
                </b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        ) : null}
        {wide ? (
          <span className="pk-cta">
            {cta} <span className="pk-arrow">→</span>
          </span>
        ) : null}
      </div>

      <div className="pk-feed">
        <div className="pk-feed-head">
          <span className="pk-feed-dot" />
          {feedTitle}
        </div>
        {shown.length ? (
          shown.map((e, i) => (
            <div key={`${turn}-${e.tag}-${e.title}-${i}`} className="pk-ev" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="pk-ev-bar" style={{ background: KIND_COLOR[e.kind] }} />
              <span className="pk-ev-main">
                <span className="pk-ev-tag" style={{ color: KIND_COLOR[e.kind] }}>
                  {e.tag}
                </span>
                <span className="pk-ev-title">{e.title}</span>
                <span className="pk-ev-meta">{e.meta}</span>
              </span>
            </div>
          ))
        ) : (
          <div className="pk-ev-empty">{feedEmpty}</div>
        )}
      </div>

      {!wide && stats.length ? (
        <div className="pk-mstats">
          {stats.map((s, i) => (
            <div key={s.label} className={`pk-stat${s.tone === 'late' ? ' pk-stat-late' : ''}`} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              <b>
                <CountUp value={s.value} suffix={s.suffix} />
              </b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {wide ? (
        <div className="pk-legend" aria-hidden="true">
          <span>
            <i style={{ background: 'var(--accent)' }} />
            {legend[0]}
          </span>
          <span>
            <i style={{ background: '#3FBF7F' }} />
            {legend[1]}
          </span>
          <span>
            <i style={{ background: '#E0483C' }} />
            {legend[2]}
          </span>
        </div>
      ) : (
        <span className="pk-cta pk-cta-m">
          {cta} <span className="pk-arrow">→</span>
        </span>
      )}
    </div>
  );
}

const CSS = `
.pk-root { position: relative; width: 100%; height: 100%; min-height: 260px; overflow: hidden; border-radius: 18px; cursor: pointer; background: #0E131A; font-family: Archivo, system-ui, -apple-system, sans-serif; color: #F4F1EA; -webkit-font-smoothing: antialiased; box-sizing: border-box; outline: none; isolation: isolate; transition: box-shadow .3s, transform .3s; box-shadow: 0 18px 44px rgba(14,19,26,0.28); }
.pk-root * { box-sizing: border-box; }
.pk-root:hover { box-shadow: 0 26px 60px rgba(14,19,26,0.38); transform: translateY(-2px); }
.pk-root:focus-visible { box-shadow: 0 0 0 3px var(--accent), 0 18px 44px rgba(14,19,26,0.28); }
.pk-sky { position: absolute; inset: 0; background: radial-gradient(60% 75% at 52% 52%, color-mix(in srgb, var(--accent) 34%, #1B2633) 0%, #16202B 45%, #0E131A 100%); }
.pk-grid { position: absolute; inset: -40% -10% 0 -10%; background-image: linear-gradient(rgba(140,190,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(140,190,255,0.07) 1px, transparent 1px); background-size: 34px 34px; transform: perspective(600px) rotateX(58deg); transform-origin: 50% 100%; mask-image: radial-gradient(70% 60% at 50% 70%, #000 30%, transparent 80%); -webkit-mask-image: radial-gradient(70% 60% at 50% 70%, #000 30%, transparent 80%); animation: pk-grid 14s linear infinite; }
.pk-scan { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(160,210,255,0.05) 48%, rgba(160,210,255,0.12) 50%, rgba(160,210,255,0.05) 52%, transparent 100%); background-size: 100% 220%; animation: pk-scan 7s linear infinite; pointer-events: none; mix-blend-mode: screen; }
.pk-world { position: absolute; inset: 0; transition: transform .8s cubic-bezier(.2,.8,.2,1); }
.pk-root:hover .pk-world { transform: scale(1.03); }

.pk-left { position: absolute; left: 26px; top: 24px; bottom: 24px; width: min(300px, 30%); display: flex; flex-direction: column; gap: 10px; z-index: 2; }
.pk-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; color: color-mix(in srgb, var(--accent) 55%, #FFFFFF); animation: pk-in .5s ease-out both; }
.pk-live { width: 8px; height: 8px; border-radius: 50%; background: #3FD07F; box-shadow: 0 0 10px #3FD07F; animation: pk-ping 1.8s infinite; }
.pk-title { font-size: 25px; line-height: 1.06; font-weight: 900; letter-spacing: -0.6px; color: #FFFFFF; text-wrap: balance; animation: pk-in .5s .05s ease-out both; }
.pk-sub { font-size: 12.5px; line-height: 1.45; color: #A9B4C2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; animation: pk-in .5s .1s ease-out both; }
.pk-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
.pk-stat { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); animation: pk-in .5s ease-out both; }
.pk-stat b { font: 700 22px 'Martian Mono', ui-monospace, monospace; color: #FFFFFF; font-variant-numeric: tabular-nums; letter-spacing: -0.5px; }
.pk-stat span { font-size: 11px; font-weight: 600; color: #A9B4C2; line-height: 1.25; }
.pk-stat-late { background: rgba(224,72,60,0.12); border-color: rgba(224,72,60,0.35); }
.pk-stat-late b { color: #FF8A7E; }
.pk-cta { margin-top: auto; align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; padding: 11px 16px; border-radius: 12px; background: #FFFFFF; color: #0E131A; font-size: 13.5px; font-weight: 800; box-shadow: 0 10px 26px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.2); white-space: nowrap; animation: pk-in .5s .3s ease-out both; }
.pk-arrow { display: inline-block; transition: transform .25s; }
.pk-root:hover .pk-arrow { transform: translateX(4px); }

.pk-feed { position: absolute; right: 22px; top: 22px; width: min(270px, 26%); display: flex; flex-direction: column; gap: 6px; z-index: 2; padding: 12px; border-radius: 14px; background: rgba(14,19,26,0.55); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.pk-feed-head { display: flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: #C9D2DC; padding: 0 2px 4px; }
.pk-feed-dot { width: 6px; height: 6px; border-radius: 50%; background: #5AA9E6; box-shadow: 0 0 8px #5AA9E6; animation: pk-blink 1.4s infinite; }
.pk-ev { display: flex; gap: 9px; padding: 8px 9px; border-radius: 10px; background: rgba(255,255,255,0.045); animation: pk-slide .45s cubic-bezier(.2,.8,.2,1) both; }
.pk-ev-bar { width: 3px; border-radius: 2px; flex: none; box-shadow: 0 0 8px currentColor; }
.pk-ev-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pk-ev-tag { font-size: 10px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; }
.pk-ev-title { font-size: 12.5px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pk-ev-meta { font-size: 11px; color: #8D99A8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pk-ev-empty { font-size: 12px; line-height: 1.45; color: #8D99A8; padding: 4px 2px; }

.pk-legend { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); display: flex; gap: 16px; font-size: 11px; font-weight: 600; color: #A9B4C2; z-index: 2; white-space: nowrap; }
.pk-legend span { display: inline-flex; align-items: center; gap: 6px; }
.pk-legend i { width: 14px; height: 3px; border-radius: 2px; display: inline-block; box-shadow: 0 0 8px currentColor; }

@keyframes pk-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes pk-slide { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
@keyframes pk-ping { 0% { box-shadow: 0 0 0 0 rgba(63,208,127,.6); } 80%, 100% { box-shadow: 0 0 0 9px rgba(63,208,127,0); } }
@keyframes pk-blink { 50% { opacity: .3; } }
@keyframes pk-scan { from { background-position: 0 -110%; } to { background-position: 0 110%; } }
@keyframes pk-grid { from { background-position: 0 0; } to { background-position: 0 34px; } }

/* phone */
.pk-narrow .pk-left { left: 16px; right: 16px; top: 16px; bottom: auto; width: auto; gap: 6px; }
.pk-narrow .pk-title { font-size: 20px; }
.pk-narrow .pk-left .pk-stats { display: none; }
.pk-narrow .pk-feed { left: 14px; right: 14px; top: auto; bottom: 74px; width: auto; padding: 8px 10px; gap: 4px; }
.pk-narrow .pk-feed-head { padding: 0 2px 2px; }
.pk-narrow .pk-ev { padding: 6px 8px; }
.pk-cta-m { position: absolute; left: 14px; right: 14px; bottom: 14px; justify-content: center; margin: 0; z-index: 2; }
.pk-mstats { position: absolute; left: 14px; right: 14px; bottom: 170px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; z-index: 2; }
.pk-mstats .pk-stat { padding: 7px 8px; border-radius: 10px; }
.pk-mstats .pk-stat b { font-size: 16px; }
.pk-mstats .pk-stat span { font-size: 9.5px; }

@media (prefers-reduced-motion: reduce) { .pk-root *, .pk-root { animation: none !important; transition: none !important; } }
`;
