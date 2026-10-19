'use dom';

import { useEffect, useRef } from 'react';
import type { DOMProps } from 'expo/dom';
import { createGlobe, type GlobeHandle, type GlobePoint } from '../../lib/relief/globe';

// Cantia Panorama at the bottom of the dashboard: the planet turning on its
// own (lib/relief/globe.ts), the name and one live line in a corner, and a
// small button to create the Panorama when there isn't one yet. A tap
// anywhere opens it full screen.

interface Props {
  accent: string;
  points: GlobePoint[];
  hq: { lat: number; lon: number } | null;
  brand: string;
  line: string;
  /** "Créer mon Panorama" when there is none yet, else the quiet "Ouvrir". */
  action: string;
  primary: boolean;
  onOpen: () => void;
  dom?: DOMProps;
}

export default function PanoramaGlobeDom({ accent, points, hq, brand, line, action, primary, onOpen }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const globe = useRef<GlobeHandle | null>(null);
  const key = JSON.stringify([points, hq]);

  useEffect(() => {
    if (!host.current) return;
    try {
      globe.current = createGlobe(host.current, { mode: 'card', accent, points, hq, still: !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches });
    } catch {
      globe.current = null;
    }
    return () => {
      globe.current?.dispose();
      globe.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent]);

  // On a phone the name and the button sit under the planet.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const fit = () => globe.current?.setInsets({ bottom: el.clientWidth < 520 ? 104 : 0 });
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [accent]);

  useEffect(() => {
    globe.current?.update(points, hq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className="pg" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()} style={{ ['--accent' as string]: accent }}>
      <style>{CSS}</style>
      <div ref={host} className="pg-world" aria-hidden="true" />
      <div className="pg-corner">
        <span className="pg-brand">
          <span className="pg-dot" />
          {brand}
        </span>
        {line ? <span className="pg-line">{line}</span> : null}
      </div>
      <span className={`pg-action${primary ? ' pg-action-primary' : ''}`}>
        {action}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </div>
  );
}

const CSS = `
.pg { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 8px; cursor: pointer; outline: none; font-family: Archivo, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; background: radial-gradient(90% 120% at 50% 30%, #13213A 0%, #0A1222 45%, #050912 100%); }
.pg:focus-visible { box-shadow: inset 0 0 0 2px var(--accent); }
.pg-world { position: absolute; inset: 0; }
.pg-corner { position: absolute; left: 20px; bottom: 18px; display: flex; flex-direction: column; gap: 4px; pointer-events: none; }
.pg-brand { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #E9EEF7; }
.pg-dot { width: 7px; height: 7px; border-radius: 50%; background: #5FD39A; animation: pg-ping 1.8s infinite; }
.pg-line { font-size: 13px; color: #9FB0CB; }
.pg-action { position: absolute; right: 18px; bottom: 16px; display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 800; color: #E9EEF7; padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(233,238,247,.22); background: rgba(10,18,34,.4); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); transition: background .2s, border-color .2s; }
.pg:hover .pg-action { background: rgba(233,238,247,.12); border-color: rgba(233,238,247,.4); }
.pg-action svg { transition: transform .2s; }
.pg:hover .pg-action svg { transform: translateX(3px); }
.pg-action-primary { background: #F4F6FA; color: #0A1222; border-color: #F4F6FA; }
.pg:hover .pg-action-primary { background: #FFFFFF; color: #0A1222; }
@keyframes pg-ping { 0% { box-shadow: 0 0 0 0 rgba(95,211,154,.6); } 80%, 100% { box-shadow: 0 0 0 8px rgba(95,211,154,0); } }
@media (max-width: 520px) { .pg-corner { left: 14px; bottom: 58px; } .pg-action { left: 14px; right: 14px; bottom: 12px; justify-content: center; } }
@media (prefers-reduced-motion: reduce) { .pg * { animation: none !important; transition: none !important; } }
`;
