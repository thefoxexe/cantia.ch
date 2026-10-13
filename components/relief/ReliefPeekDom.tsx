'use dom';

import { useEffect, useRef } from 'react';
import type { DOMProps } from 'expo/dom';
import { accentColor, createRelief, type ReliefHandle } from '../../lib/relief/engine';
import type { ReliefData, ReliefSpec } from '../../lib/relief/types';

// The Relief on the dashboard: the company's real miniature turning slowly,
// today's figures over it, and one click to open it full screen. Before the
// first build it shows a sketch of the company's process instead, with an
// invitation to create it.

interface Props {
  spec: ReliefSpec;
  data: ReliefData;
  eyebrow: string;
  live: string;
  title: string;
  subtitle: string;
  stats: { value: string; label: string; tone?: 'late' }[];
  cta: string;
  onOpen: () => void;
  dom?: DOMProps;
}

export default function ReliefPeekDom({ spec, data, eyebrow, live, title, subtitle, stats, cta, onOpen }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ReliefHandle | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!hostRef.current) return;
    try {
      handleRef.current = createRelief(hostRef.current, spec, data, { onSelect: () => {}, baseLabel: '', exampleLabel: '', preview: true, intro: true, interactive: false, transparent: true, zoom: hostRef.current.clientWidth > 620 ? 1.5 : 1.05 });
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

  // Keep the miniature in the right part of the card, clear of the text.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fit = () => {
      const w = host.clientWidth;
      handleRef.current?.setInsets(w > 620 ? { left: Math.min(300, w * 0.36), bottom: 10 } : { top: 60, bottom: 110 });
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(host);
    return () => ro?.disconnect();
  }, [spec]);

  return (
    <div
      className="pk-root"
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
      <div className="pk-grid" aria-hidden="true" />
      <div ref={hostRef} className="pk-world" aria-hidden="true" />
      <div className="pk-shade" aria-hidden="true" />
      <div className="pk-text">
        <div className="pk-eyebrow">
          <span className="pk-live" />
          {eyebrow} · {live}
        </div>
        <div className="pk-title">{title}</div>
        {subtitle ? <div className="pk-sub">{subtitle}</div> : null}
      </div>
      <div className="pk-foot">
        <div className="pk-stats">
          {stats.map((s) => (
            <span key={s.label} className={`pk-stat${s.tone === 'late' ? ' pk-stat-late' : ''}`}>
              <b>{s.value}</b>
              {s.label}
            </span>
          ))}
        </div>
        <span className="pk-cta">
          {cta} <span className="pk-arrow">→</span>
        </span>
      </div>
    </div>
  );
}

const CSS = `
.pk-root { position: relative; width: 100%; height: 100%; min-height: 220px; overflow: hidden; border-radius: 16px; cursor: pointer; background: radial-gradient(120% 90% at 75% 40%, #F6F0E5 0%, #EDE4D5 55%, #E4D9C7 100%); font-family: Archivo, system-ui, -apple-system, sans-serif; color: #231A12; -webkit-font-smoothing: antialiased; box-sizing: border-box; border: 1px solid rgba(35,26,18,0.08); transition: box-shadow .25s, transform .25s; outline: none; }
.pk-root * { box-sizing: border-box; }
.pk-root:hover { box-shadow: 0 18px 40px rgba(43,33,26,0.16); transform: translateY(-1px); }
.pk-root:focus-visible { box-shadow: 0 0 0 3px var(--accent); }
.pk-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(35,26,18,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(35,26,18,0.045) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(80% 80% at 70% 50%, #000 30%, transparent 85%); -webkit-mask-image: radial-gradient(80% 80% at 70% 50%, #000 30%, transparent 85%); }
.pk-world { position: absolute; inset: 0; transition: transform .6s cubic-bezier(.2,.8,.2,1); }
.pk-world canvas { background: transparent; }
.pk-root:hover .pk-world { transform: scale(1.03); }
.pk-shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, rgba(246,240,229,0.96) 0%, rgba(246,240,229,0.7) 30%, rgba(246,240,229,0) 52%), linear-gradient(0deg, rgba(237,228,213,0.95) 0%, rgba(237,228,213,0) 34%); }
.pk-text { position: absolute; left: 22px; top: 20px; max-width: min(340px, 46%); display: flex; flex-direction: column; gap: 6px; animation: pk-in .5s ease-out both; }
.pk-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); }
.pk-live { width: 8px; height: 8px; border-radius: 50%; background: #2E9E5B; box-shadow: 0 0 0 0 rgba(46,158,91,.55); animation: pk-ping 1.8s infinite; }
.pk-title { font-size: 24px; line-height: 1.08; font-weight: 900; letter-spacing: -0.6px; text-wrap: balance; }
.pk-sub { font-size: 13px; line-height: 1.45; color: #4A3F35; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.pk-foot { position: absolute; left: 22px; right: 22px; bottom: 18px; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.pk-stats { display: flex; flex-wrap: wrap; gap: 8px; }
.pk-stat { display: inline-flex; align-items: baseline; gap: 6px; padding: 7px 11px; border-radius: 10px; background: rgba(255,253,249,0.9); border: 1px solid rgba(35,26,18,0.08); box-shadow: 0 6px 16px rgba(43,33,26,0.08); font-size: 12px; font-weight: 600; color: #4A3F35; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: pk-in .5s ease-out both; }
.pk-stat:nth-child(2) { animation-delay: .08s; } .pk-stat:nth-child(3) { animation-delay: .16s; }
.pk-stat b { font: 700 16px 'Martian Mono', ui-monospace, monospace; color: #231A12; }
.pk-stat-late, .pk-stat-late b { color: #AB3327; }
.pk-cta { display: inline-flex; align-items: center; gap: 8px; padding: 11px 16px; border-radius: 12px; background: #16120E; color: #FFFFFF; font-size: 13.5px; font-weight: 800; box-shadow: 0 10px 22px rgba(22,18,14,0.25); white-space: nowrap; }
.pk-arrow { display: inline-block; transition: transform .25s; }
.pk-root:hover .pk-arrow { transform: translateX(4px); }
@keyframes pk-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pk-ping { 0% { box-shadow: 0 0 0 0 rgba(46,158,91,.5); } 80%, 100% { box-shadow: 0 0 0 8px rgba(46,158,91,0); } }
@media (max-width: 620px) {
  .pk-shade { background: linear-gradient(180deg, rgba(246,240,229,0.95) 0%, rgba(246,240,229,0) 30%), linear-gradient(0deg, rgba(237,228,213,0.97) 0%, rgba(237,228,213,0) 40%); }
  .pk-text { left: 16px; top: 14px; max-width: calc(100% - 32px); gap: 4px; }
  .pk-title { font-size: 19px; }
  .pk-sub { display: none; }
  .pk-foot { left: 14px; right: 14px; bottom: 14px; }
  .pk-stat { padding: 6px 9px; font-size: 11px; }
  .pk-stat b { font-size: 14px; }
  .pk-cta { width: 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .pk-root *, .pk-root { animation: none !important; transition: none !important; } }
`;
