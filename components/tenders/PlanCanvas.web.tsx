import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadPdfJs } from '../../lib/tenders/pdfjs';
import { clamp01, distancePt, formatMeasure, isComplete, mainValue, measure, snapOrtho, type MeasureKind, type PageSize, type Point } from '../../lib/tenders/geometry';
import type { MeasuredObject } from '../../lib/tenders/plansApi';
import { colors } from '../../lib/theme';

// A plan page drawn with pdf.js plus an SVG layer for the measures. The page
// sits in a scrollable box (scroll / trackpad to move, Ctrl + wheel or the
// zoom buttons to zoom). All geometry is normalized 0..1 on the page.

export type Tool = 'select' | 'calibrate' | MeasureKind;

export interface PlanCanvasProps {
  url: string;
  pageIndex: number;
  page: PageSize;
  mpp: number | null;
  zoom: number; // 1 = page fits the box width
  onZoom: (z: number) => void;
  tool: Tool;
  objects: MeasuredObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  // A finished drawing (measure or the two calibration points).
  onComplete: (tool: Tool, pts: Point[]) => void;
  // A vertex dragged on the selected measure.
  onReshape: (id: string, pts: Point[]) => void;
  color: string;
  // Escape with nothing being drawn (leave the calibration pick, unselect…).
  onEscape?: () => void;
  // Shown under the live figure while drawing ("Entrée : terminer…").
  drawHint?: string;
}

const docs = new Map<string, Promise<any>>();
function openDoc(url: string) {
  if (!docs.has(url)) {
    docs.set(
      url,
      loadPdfJs().then(async (pdfjs: any) => {
        const res = await fetch(url);
        const data = new Uint8Array(await res.arrayBuffer());
        return pdfjs.getDocument({ data }).promise;
      }),
    );
  }
  return docs.get(url)!;
}

const MAX_PIXELS = 14_000_000; // canvas limit on Safari is ~16.7 M

export const MEASURE_COLORS = ['#A95C30', '#3F5D7D', '#2E6B4F', '#6B4E8E', '#9C6510', '#AB3327'];

export function PlanCanvas(props: PlanCanvasProps) {
  const { url, pageIndex, page, mpp, zoom, onZoom, tool, objects, selectedId, onSelect, onComplete, onReshape, color, onEscape, drawHint } = props;
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [boxW, setBoxW] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Point[]>([]);
  const [hover, setHover] = useState<Point | null>(null);
  const [drag, setDrag] = useState<{ id: string; index: number; pts: Point[] } | null>(null);

  // Box width → base scale.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    setBoxW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const w = Math.max(200, (boxW - 24) * zoom);
  const h = (w * page.height_pt) / page.width_pt;

  // Render the PDF page at the displayed size (re-render after zoom settles).
  useEffect(() => {
    if (!boxW) return;
    let cancelled = false;
    let task: any = null;
    const t = setTimeout(() => {
      setBusy(true);
      openDoc(url)
        .then(async (doc) => {
          const p = await doc.getPage(Math.min(Math.max(1, pageIndex), doc.numPages));
          if (cancelled) return;
          const base = p.getViewport({ scale: 1 });
          let ratio = Math.min(2, window.devicePixelRatio || 1);
          if (w * ratio * h * ratio > MAX_PIXELS) ratio = Math.sqrt(MAX_PIXELS / (w * h));
          const vp = p.getViewport({ scale: (w / base.width) * ratio });
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          task = p.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
          await task.promise;
          if (!cancelled) setBusy(false);
        })
        .catch((e) => {
          if (!cancelled && e?.name !== 'RenderingCancelledException') setError(e instanceof Error ? e.message : String(e));
        });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
      task?.cancel?.();
    };
  }, [url, pageIndex, w, h, boxW]);

  // Changing tool or page drops the drawing in progress.
  useEffect(() => {
    setDraft([]);
    setHover(null);
  }, [tool, pageIndex]);

  const toPoint = useCallback(
    (e: { clientX: number; clientY: number }, svg: SVGSVGElement): Point => {
      const r = svg.getBoundingClientRect();
      return [clamp01((e.clientX - r.left) / r.width), clamp01((e.clientY - r.top) / r.height)];
    },
    [],
  );

  const finish = useCallback(
    (pts: Point[]) => {
      if (tool === 'select') return;
      const kind: MeasureKind = tool === 'calibrate' ? 'distance' : tool;
      if (!isComplete(kind, pts)) return;
      onComplete(tool, pts);
      setDraft([]);
    },
    [tool, onComplete],
  );

  // Closing a surface by clicking near its first point (12 px).
  const nearFirst = (p: Point) => draft.length >= 3 && Math.hypot((p[0] - draft[0][0]) * w, (p[1] - draft[0][1]) * h) < 12;

  function adjust(p: Point, shift: boolean): Point {
    const prev = draft[draft.length - 1];
    return shift && prev && tool !== 'count' ? snapOrtho(prev, p, page) : p;
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    const svg = e.currentTarget;
    const p = adjust(toPoint(e, svg), e.shiftKey);
    if (tool === 'select') {
      const target = e.target as Element;
      const vid = target.getAttribute('data-vertex');
      const oid = target.getAttribute('data-object');
      if (vid != null && selectedId) {
        const o = objects.find((x) => x.id === selectedId);
        if (o) {
          svg.setPointerCapture(e.pointerId);
          setDrag({ id: o.id, index: Number(vid), pts: o.geometry.map((q) => [q[0], q[1]] as Point) });
        }
        return;
      }
      onSelect(oid ?? null);
      return;
    }
    if (nearFirst(p) && (tool === 'polygon' || tool === 'perimeter')) return finish(draft);
    const next = [...draft, p];
    if (tool === 'distance' || tool === 'calibrate') {
      if (next.length === 2) return finish(next);
    }
    setDraft(next);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const p = toPoint(e, e.currentTarget);
    if (drag) {
      const pts = drag.pts.slice();
      pts[drag.index] = p;
      setDrag({ ...drag, pts });
      return;
    }
    setHover(adjust(p, e.shiftKey));
  }

  function onPointerUp() {
    if (drag) {
      onReshape(drag.id, drag.pts);
      setDrag(null);
    }
  }

  function onDoubleClick() {
    if (tool === 'polyline' || tool === 'polygon' || tool === 'perimeter' || tool === 'count') {
      // The double click added the last point twice.
      const a = draft[draft.length - 1];
      const b = draft[draft.length - 2];
      const pts = a && b && Math.hypot((a[0] - b[0]) * w, (a[1] - b[1]) * h) < 5 ? draft.slice(0, -1) : draft;
      finish(pts);
    }
  }

  // Keyboard: Enter finishes, Backspace removes the last point, Escape cancels.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'Enter' && draft.length) {
        e.preventDefault();
        finish(draft);
      } else if (e.key === 'Escape') {
        // One point back at a time; with nothing drawn, leave.
        e.preventDefault();
        if (draft.length) setDraft(draft.slice(0, -1));
        else if (onEscape) onEscape();
        else onSelect(null);
      } else if (e.key === 'Backspace' && draft.length) {
        e.preventDefault();
        setDraft(draft.slice(0, -1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, finish, onSelect, onEscape]);

  // Ctrl / ⌘ + wheel (and trackpad pinch) zooms around the pointer.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el!.getBoundingClientRect();
      const fx = (el!.scrollLeft + e.clientX - r.left) / el!.scrollWidth;
      const fy = (el!.scrollTop + e.clientY - r.top) / el!.scrollHeight;
      const next = Math.min(8, Math.max(0.5, zoom * Math.exp(-e.deltaY * 0.01)));
      onZoom(next);
      requestAnimationFrame(() => {
        el!.scrollLeft = fx * el!.scrollWidth - (e.clientX - r.left);
        el!.scrollTop = fy * el!.scrollHeight - (e.clientY - r.top);
      });
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, onZoom]);

  const live = useMemo(() => {
    if (!draft.length || tool === 'select') return null;
    const pts = hover && tool !== 'count' ? [...draft, hover] : draft;
    if (tool === 'calibrate') return pts.length === 2 ? `${formatMeasure(distancePt(pts[0], pts[1], page), 0)} pt` : null;
    const m = measure(tool, pts, page, mpp);
    const v = mainValue(tool, m);
    if (v.value == null) return tool === 'count' ? null : '— échelle ?';
    return `${formatMeasure(v.value, tool === 'count' ? 0 : 2)} ${v.unit}`;
  }, [draft, hover, tool, page, mpp]);

  const sx = (p: Point) => p[0] * w;
  const sy = (p: Point) => p[1] * h;
  const path = (pts: Point[], closed: boolean) => pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p).toFixed(1)},${sy(p).toFixed(1)}`).join(' ') + (closed ? ' Z' : '');
  const crosshair = tool !== 'select';

  function shape(o: { id: string; kind: MeasureKind; geometry: Point[]; color: string | null; name: string | null }, selected: boolean, preview = false) {
    const c = o.color || colors.primary;
    const width = selected ? 3 : 2;
    const common = { 'data-object': preview ? undefined : o.id, style: { cursor: tool === 'select' ? 'pointer' : 'crosshair' } } as Record<string, unknown>;
    if (o.kind === 'count') {
      return o.geometry.map((p, i) => (
        <g key={i} {...common}>
          <circle cx={sx(p)} cy={sy(p)} r={selected ? 9 : 8} fill={c} fillOpacity={0.85} stroke="#fff" strokeWidth={2} data-object={preview ? undefined : o.id} />
          <text x={sx(p)} y={sy(p) + 3.5} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff" pointerEvents="none">
            {i + 1}
          </text>
        </g>
      ));
    }
    const closed = o.kind === 'polygon' || o.kind === 'perimeter';
    return (
      <g {...common}>
        {/* fat invisible stroke = easy to click */}
        <path d={path(o.geometry, closed)} fill={o.kind === 'polygon' ? c : 'none'} fillOpacity={o.kind === 'polygon' ? (selected ? 0.28 : 0.16) : 0} stroke="transparent" strokeWidth={14} data-object={preview ? undefined : o.id} />
        <path d={path(o.geometry, closed)} fill="none" stroke="#fff" strokeWidth={width + 2.5} strokeLinejoin="round" strokeLinecap="round" pointerEvents="none" />
        <path d={path(o.geometry, closed)} fill="none" stroke={c} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={preview ? '6 4' : undefined} pointerEvents="none" />
        {o.kind === 'distance' || preview
          ? o.geometry.map((p, i) => <circle key={i} cx={sx(p)} cy={sy(p)} r={3.5} fill="#fff" stroke={c} strokeWidth={2} pointerEvents="none" />)
          : null}
      </g>
    );
  }

  function label(o: MeasuredObject) {
    const v = mainValue(o.kind, o);
    if (!o.geometry.length) return null;
    const cx = o.geometry.reduce((s, p) => s + p[0], 0) / o.geometry.length;
    const cy = o.geometry.reduce((s, p) => s + p[1], 0) / o.geometry.length;
    const text = `${o.name ?? ''}${v.value != null ? ` · ${formatMeasure(v.value, o.kind === 'count' ? 0 : 2)} ${v.unit}` : ''}`;
    const anchor: Point = o.kind === 'count' ? o.geometry[0] : o.kind === 'distance' || o.kind === 'polyline' ? o.geometry[Math.floor((o.geometry.length - 1) / 2)] : [cx, cy];
    const tw = text.length * 6.4 + 12;
    // Kept inside the page so a measure along the edge stays readable.
    const x = Math.min(Math.max(2, sx(anchor) + (o.kind === 'count' ? 12 : -tw / 2)), w - tw - 2);
    const y = Math.min(Math.max(2, sy(anchor) - (o.kind === 'count' ? 9 : 22)), h - 20);
    return (
      <g key={`l-${o.id}`} pointerEvents="none">
        <rect x={x} y={y} width={tw} height={18} rx={3} fill="#fff" fillOpacity={0.94} stroke={o.color || colors.primary} strokeWidth={1} />
        <text x={x + 6} y={y + 12.5} fontSize={11} fontWeight={700} fill={colors.text}>
          {text}
        </text>
      </g>
    );
  }

  const shown = objects.map((o) => (drag && o.id === drag.id ? { ...o, geometry: drag.pts } : o));
  const selected = shown.find((o) => o.id === selectedId) ?? null;
  const previewPts = hover && draft.length && tool !== 'count' ? [...draft, hover] : draft;
  const previewKind: MeasureKind = tool === 'calibrate' || tool === 'select' ? 'distance' : tool;

  return (
    <div
      ref={boxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'auto', background: '#E9E2D6', padding: 12, boxSizing: 'border-box', overscrollBehavior: 'contain' }}
    >
      <div style={{ position: 'relative', width: w, height: h, background: '#fff', boxShadow: '0 2px 14px rgba(0,0,0,.12)', margin: zoom <= 1 ? '0 auto' : undefined }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, display: 'block' }} />
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ position: 'absolute', left: 0, top: 0, cursor: crosshair ? 'crosshair' : 'default', touchAction: 'none', userSelect: 'none', fontFamily: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setHover(null)}
          onDoubleClick={onDoubleClick}
        >
          {shown.map((o) => (
            <g key={o.id}>{shape(o, o.id === selectedId)}</g>
          ))}
          {shown.map((o) => label(o))}
          {selected && tool === 'select' && selected.kind !== 'count'
            ? selected.geometry.map((p, i) => (
                <rect key={i} data-vertex={i} x={sx(p) - 6} y={sy(p) - 6} width={12} height={12} rx={2} fill="#fff" stroke={selected.color || colors.primary} strokeWidth={2} style={{ cursor: 'move' }} />
              ))
            : null}
          {draft.length ? (
            <g pointerEvents="none">
              {tool === 'calibrate' ? (
                <>
                  <path d={path(previewPts, false)} fill="none" stroke={colors.slate} strokeWidth={2.5} strokeDasharray="6 4" />
                  {previewPts.map((p, i) => (
                    <circle key={i} cx={sx(p)} cy={sy(p)} r={5} fill="#fff" stroke={colors.slate} strokeWidth={2.5} />
                  ))}
                </>
              ) : (
                shape({ id: 'draft', kind: previewKind, geometry: previewPts, color, name: null }, true, true)
              )}
              {nearFirst(hover ?? [-1, -1]) ? <circle cx={sx(draft[0])} cy={sy(draft[0])} r={9} fill="none" stroke={color} strokeWidth={2} /> : null}
            </g>
          ) : null}
          {hover && (live || (drawHint && draft.length)) ? (
            <g pointerEvents="none">
              {(() => {
                const lines = [live, draft.length ? drawHint : null].filter(Boolean) as string[];
                const wBox = Math.max(...lines.map((l, i) => l.length * (i === 0 && live ? 7 : 6))) + 16;
                const x = Math.min(sx(hover) + 14, w - wBox - 4);
                const y = Math.min(sy(hover) + 10, h - lines.length * 17 - 10);
                return (
                  <>
                    <rect x={x} y={y} width={wBox} height={lines.length * 17 + 8} rx={4} fill={colors.text} fillOpacity={0.9} />
                    {lines.map((l, i) => (
                      <text key={i} x={x + 8} y={y + 17 + i * 17} fontSize={i === 0 && live ? 12 : 10.5} fontWeight={i === 0 && live ? 700 : 500} fill="#fff" fillOpacity={i === 0 && live ? 1 : 0.85}>
                        {l}
                      </text>
                    ))}
                  </>
                );
              })()}
            </g>
          ) : null}
        </svg>
        {busy && !error ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: colors.textMuted, fontSize: 13 }}>
            Chargement du plan…
          </div>
        ) : null}
        {error ? <div style={{ position: 'absolute', left: 12, top: 12, color: colors.danger, fontSize: 13 }}>{error}</div> : null}
      </div>
    </div>
  );
}
