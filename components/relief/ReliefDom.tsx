'use dom';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';
import { ACCENT_HEX } from '../../lib/relief/preview';
import { createGlobe, type GlobeHandle, type GlobePoint } from '../../lib/relief/globe';
import { createWorld, WORLD_STATUS, type WorldHandle } from '../../lib/relief/terrain';
import { SCENE_CSS } from '../../lib/relief/sceneCss';
import type { ReliefCaps, ReliefData, ReliefDetails, ReliefItem, ReliefItemStatus, ReliefKind, ReliefSection, ReliefSpec, ReliefStage } from '../../lib/relief/types';
import type { ReliefCopy } from '../../lib/relief/copy';
import { formatCoord, type ReliefGeo } from '../../lib/relief/geo';
import { parseStageCommand, stageOverdue, stageTooEarly } from '../../lib/relief/stages';

// Cantia Panorama, full screen: a zoom from space onto the company
// (lib/relief/globe.ts), then its piece of land (lib/relief/terrain.ts) with
// every item at its address, and what sits around it. On a computer: a header, the
// list on the left and the item's card on the right. On a phone: the planet
// fills the screen and the list and the card live in a sheet at the bottom. The card is the item's
// whole file in Cantia, filtered by the member's rights: process step,
// tasks, the week's planning, quotes and invoices, and links to every part
// of the file. Anyone may move an item to its next step, by a click or by
// saying it ("Villa Dupont: gros œuvre terminé"); the owner edits the
// process itself (kinds of projects, steps, durations) without a rebuild.
// A DOM component: plain React DOM on the web, its own web view on phones.

const STATUS_COLOR: Record<ReliefItemStatus, string> = { ok: '#2E6B4F', risk: '#B07A12', late: '#AB3327', done: '#8C8073' };
const MOBILE = '(max-width: 760px)';
const DATE_LOCALE: Record<string, string> = { fr: 'fr-CH', de: 'de-CH', it: 'it-CH' };

type Tab = 'overview' | 'tasks' | 'planning' | 'money' | 'links';
type Toast = { ok: boolean; text: string; heard?: string } | null;
type Sheet = 'peek' | 'list' | 'item';
type Loaded = { details: ReliefDetails; sections: ReliefSection[] };

function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function chf(n: number) {
  return `CHF ${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
}

function date(iso: string | null) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const ICONS: Record<string, string> = {
  x: 'M18 6 6 18M6 6l12 12',
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
  redo: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  pause: 'M8 5v14M16 5v14',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  play: 'M7 4l13 8-13 8z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  check: 'M20 6 9 17l-5-5',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  calendar: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18',
  file: 'M14 3H6v18h12V7zM14 3v4h4',
  user: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  chevron: 'M6 9l6 6 6-6',
  edit: 'M4 20h4L20 8l-4-4L4 16zM14 6l4 4',
  folder: 'M3 6h6l2 2h10v11H3z',
  image: 'M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15 9h.01',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  trending: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  'plus-circle': 'M12 8v8M8 12h8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  'bar-chart-2': 'M18 20V10M12 20V4M6 20v-6',
  'file-text': 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6',
  'edit-3': 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v3',
  flow: 'M4 6h6v4H4zM14 14h6v4h-6zM10 8h4a2 2 0 0 1 2 2v4',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
};

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] ?? ICONS.file} />
    </svg>
  );
}

interface Props {
  spec: ReliefSpec;
  data: ReliefData;
  copy: ReliefCopy;
  locale: string;
  caps: ReliefCaps & { create: boolean };
  rebuilding: boolean;
  onLoadDetails: (itemId: string) => Promise<Loaded | null>;
  onAddTask: (itemId: string, title: string) => Promise<string | null>;
  onToggleTask: (taskId: string, done: boolean) => Promise<string | null>;
  onPlan: (itemId: string, personId: string, day: string) => Promise<string | null>;
  onSetStage: (itemId: string, kind: string, stage: number) => Promise<string | null>;
  onCloseProject: (itemId: string) => Promise<string | null>;
  onSaveProcess: (kinds: ReliefKind[]) => Promise<string | null>;
  /** Dictation, for moving items along by voice. */
  listening: boolean;
  transcribing: boolean;
  dictated: { seq: number; text: string };
  onToggleDictation: () => Promise<string | null>;
  onNavigate: (route: string) => void;
  onClose: () => void;
  onRedo: () => void;
  /** The company's town: the head office on the planet, the cartouche. */
  geo?: ReliefGeo | null;
  /** Where each item is (its address' town); missing ones sit around the head office. */
  places?: Record<string, { lat: number; lon: number }>;
  dom?: DOMProps;
}

export default function ReliefDom(props: Props) {
  const { spec, data, copy, caps, rebuilding, onClose, onRedo, geo, places } = props;
  const hq = geo?.lat != null && geo.lon != null ? { lat: geo.lat, lon: geo.lon } : null;
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<WorldHandle | null>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState<'on' | 'out' | 'off'>('on');
  const firstData = useRef(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(MOBILE).matches);
  const [listOpen, setListOpen] = useState(true);
  const [sheet, setSheet] = useState<Sheet>('peek');
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  const [toast, setToast] = useState<Toast>(null);
  const [processOpen, setProcessOpen] = useState(false);
  const lastSeq = useRef(props.dictated.seq);
  const [mood, setMood] = useState<'day' | 'dusk'>(() => {
    try {
      return window.localStorage.getItem('cantia-relief-mood') === 'dusk' ? 'dusk' : 'day';
    } catch {
      return 'day';
    }
  });
  const accent = ACCENT_HEX[spec.accent] ?? ACCENT_HEX.terracotta;
  const vocab = spec.vocabulary;
  // Worlds built before the rename were called "Le Relief de …" or "La maquette de …".
  const title = /relief|maquette/i.test(spec.title) ? data.company : spec.title;
  const stageLabel = (it: ReliefItem) => it.stages[Math.min(it.stages.length - 1, it.stage)]?.label ?? '';
  const points = useMemo<GlobePoint[]>(
    () =>
      data.items.map((it) => {
        const at = places?.[it.id] ?? hq ?? { lat: 46.948, lon: 7.447 };
        return { id: it.id, lat: at.lat, lon: at.lon, status: it.status, crew: it.crew.length, name: it.name, detail: it.example ? copy.example : stageLabel(it), progress: it.progress, example: it.example, step: it.stage, steps: it.stages.length };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, places, hq?.lat, hq?.lon],
  );

  useEffect(() => {
    const mq = window.matchMedia?.(MOBILE);
    const onChange = () => {
      setMobile(!!mq?.matches);
      setVh(window.innerHeight);
    };
    mq?.addEventListener?.('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mq?.removeEventListener?.('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let disposeIntro = () => {};
    try {
      const still = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const world = createWorld(stageRef.current, {
        accent,
        points,
        hq,
        mood: mood === 'dusk' ? 'night' : 'day',
        baseLabel: `${vocab.place} · ${data.company}`,
        onSelect: setSelectedId,
        hold: !still,
        still,
      });
      handleRef.current = world;
      if (still) {
        setAnimated(false);
        setIntro('off');
      } else if (introRef.current) {
        // From space down to the company, then the land takes over.
        let planet: GlobeHandle | null = null;
        const land = () => {
          world.arrive();
          setIntro('out');
          fadeTimer = setTimeout(() => {
            planet?.dispose();
            planet = null;
            setIntro('off');
          }, 900);
        };
        try {
          planet = createGlobe(introRef.current, { mode: 'intro', tone: 'light', accent, points, hq, onArrive: land });
        } catch {
          land();
        }
        disposeIntro = () => planet?.dispose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    return () => {
      clearTimeout(fadeTimer);
      disposeIntro();
      handleRef.current?.dispose();
      handleRef.current = null;
      firstData.current = true;
    };
    // The land is made once; the items move on it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  useEffect(() => {
    if (firstData.current) {
      firstData.current = false;
      return;
    }
    handleRef.current?.update(points, hq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  useEffect(() => {
    if (selectedId) setSheet('item');
    else setSheet((s) => (s === 'item' ? 'peek' : s));
  }, [selectedId]);

  // Height of the bottom sheet on a phone, so the world centres above it.
  const sheetHeight = sheet === 'item' ? Math.round(vh * 0.68) : sheet === 'list' ? Math.round(vh * 0.52) : 172;
  const item = data.items.find((i) => i.id === selectedId) ?? null;
  const sidePanel = !!item || processOpen;

  // A toast fades on its own.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.ok ? 4200 : 7000);
    return () => clearTimeout(t);
  }, [toast]);

  // What was said: which item, which step.
  useEffect(() => {
    if (props.dictated.seq === lastSeq.current) return;
    lastSeq.current = props.dictated.seq;
    const text = props.dictated.text.trim();
    if (!text) return;
    const real = data.items.filter((i) => !i.example && i.status !== 'done');
    const cmd = parseStageCommand(text, { items: real, current: selectedId });
    const it = real.find((i) => i.id === cmd.itemId);
    if (!it) {
      setToast({ ok: false, heard: text, text: fill(copy.sayWhich, { item: vocab.item }) });
      return;
    }
    if (it.id !== selectedId) {
      handleRef.current?.select(it.id);
      handleRef.current?.focus(it.id);
    }
    if (cmd.stage == null) {
      setToast({ ok: false, heard: text, text: fill(copy.sayUnknown, { example: sayExample(copy, it) }) });
      return;
    }
    const label = it.stages[cmd.stage]?.label ?? '';
    props.onSetStage(it.id, it.kind, cmd.stage).then((err) =>
      setToast(err ? { ok: false, heard: text, text: fill(copy.error, { message: err }) } : { ok: true, heard: text, text: fill(copy.sayDone, { name: it.name, stage: label }) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dictated]);

  const say = async () => {
    const err = await props.onToggleDictation();
    if (err) setToast({ ok: false, text: err });
  };

  useEffect(() => {
    const h = handleRef.current;
    if (!h) return;
    if (mobile) h.setInsets({ top: 64, bottom: sheetHeight });
    else h.setInsets({ left: listOpen ? 352 : 0, right: sidePanel ? 472 : 0, top: 90, bottom: 64 });
  }, [mobile, sheetHeight, listOpen, sidePanel, spec]);

  const stats = useMemo(
    () => ({
      active: data.items.filter((i) => i.status !== 'done' && !i.example).length,
      people: new Set([...data.items.flatMap((i) => i.crew), ...data.atBase]).size,
      late: data.items.filter((i) => i.status === 'late').length,
    }),
    [data],
  );
  const hasExamples = data.items.some((i) => i.example);

  const choose = (id: string) => {
    setProcessOpen(false);
    handleRef.current?.select(id);
    handleRef.current?.focus(id);
  };
  const closeItem = () => handleRef.current?.select(null);
  const overview = () => {
    handleRef.current?.reset();
    if (mobile) setSheet('peek');
  };
  const toggleMood = () => {
    const next = mood === 'day' ? 'dusk' : 'day';
    setMood(next);
    handleRef.current?.setMood(next === 'dusk' ? 'night' : 'day');
    try {
      window.localStorage.setItem('cantia-relief-mood', next);
    } catch {
      // Private mode: the choice just isn't remembered.
    }
  };
  const toggleAnim = () => {
    handleRef.current?.setAnimated(!animated);
    setAnimated(!animated);
  };

  const statsLine = (
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
    </div>
  );

  const list = (
    <div className="rf-rows">
      {data.items.map((it, i) => (
        <button key={it.id} type="button" className={`rf-row${it.id === selectedId ? ' rf-row-on' : ''}`} onClick={() => choose(it.id)} style={{ animationDelay: `${i * 40}ms` }}>
          <span className="rf-dot" style={{ background: STATUS_COLOR[it.status] }} />
          <span className="rf-row-main">
            <span className="rf-row-name">{it.name}</span>
            <span className="rf-row-meta">
              {it.example ? `${copy.example} · ` : ''}
              {stageLabel(it)}
              {it.client ? ` · ${it.client}` : ''}
            </span>
          </span>
          <span className="rf-row-progress" aria-hidden="true">
            <span style={{ width: `${Math.round(it.progress * 100)}%`, background: STATUS_COLOR[it.status] }} />
          </span>
        </button>
      ))}
    </div>
  );

  const card = item ? <ItemCard key={item.id} {...props} item={item} onCloseItem={closeItem} mobile={mobile} /> : null;
  const process = processOpen ? (
    <ProcessEditor
      copy={copy}
      kinds={data.kinds}
      itemWord={vocab.item}
      onRedo={caps.redo && !rebuilding ? onRedo : null}
      onClose={() => setProcessOpen(false)}
      onSave={async (kinds) => {
        const err = await props.onSaveProcess(kinds);
        setToast(err ? { ok: false, text: fill(copy.error, { message: err }) } : { ok: true, text: copy.processSaved });
        if (!err) setProcessOpen(false);
        return err;
      }}
    />
  ) : null;
  const sayButton = (
    <button
      type="button"
      className={`rf-btn rf-say${props.listening ? ' rf-say-on' : ''}`}
      onClick={say}
      disabled={props.transcribing}
      aria-pressed={props.listening}
      title={fill(copy.sayTitle, { item: vocab.item })}
    >
      <span className="rf-say-dot" />
      <Icon name="mic" /> {props.transcribing ? copy.transcribing : props.listening ? copy.stop : copy.say}
    </button>
  );
  const sayExampleItem = data.items.find((i) => !i.example && i.status !== 'done') ?? data.items[0];
  const voiceBar =
    props.listening || props.transcribing || toast ? (
      <div
        className={`rf-voice${toast && !toast.ok ? ' rf-voice-err' : ''}${toast?.ok ? ' rf-voice-ok' : ''}`}
        role="status"
        style={mobile ? undefined : { left: `calc(${listOpen ? 352 : 0}px + (100% - ${(listOpen ? 352 : 0) + (sidePanel ? 472 : 0)}px) / 2)` }}
      >
        {props.listening ? (
          <>
            <span className="rf-voice-wave" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="rf-voice-main">
              <b>{copy.sayListening}</b>
              {sayExampleItem ? <span>{fill(copy.sayHint, { example: sayExample(copy, sayExampleItem) })}</span> : null}
            </span>
          </>
        ) : props.transcribing ? (
          <span className="rf-voice-main">
            <b>{copy.transcribing}</b>
          </span>
        ) : toast ? (
          <span className="rf-voice-main">
            {toast.heard ? <span className="rf-voice-heard">{fill(copy.sayHeard, { text: toast.heard })}</span> : null}
            <b>{toast.text}</b>
          </span>
        ) : null}
      </div>
    ) : null;

  return (
    <div className={`rf-root${mobile ? ' rf-mobile' : ''}${mood === 'dusk' ? ' rf-dusk' : ''}`} style={{ ['--accent' as string]: accent }}>
      <style>{SCENE_CSS + CSS}</style>
      <div ref={stageRef} className="rf-stage" />
      {intro !== 'off' ? <div ref={introRef} className={`rf-intro${intro === 'out' ? ' rf-intro-out' : ''}`} aria-hidden="true" /> : null}
      {error ? (
        <div className="rf-error">
          <b>{fill(copy.error, { message: '' })}</b>
          <span>{error}</span>
        </div>
      ) : null}

      {mobile ? (
        <>
          <div className="rf-mbar">
            <button type="button" className="rf-ibtn rf-ibtn-dark" onClick={onClose} aria-label={copy.close}>
              <Icon name="x" />
            </button>
            <div className="rf-mbar-title">
              <span className="rf-eyebrow">{copy.brand}</span>
              <span className="rf-mbar-name">{title}</span>
            </div>
            <button type="button" className="rf-ibtn" onClick={overview} aria-label={copy.overview}>
              <Icon name="home" />
            </button>
            <button type="button" className="rf-ibtn" onClick={toggleMood} aria-label={mood === 'day' ? copy.night : copy.day}>
              <Icon name={mood === 'day' ? 'moon' : 'sun'} />
            </button>
            {caps.stage ? (
              <button type="button" className={`rf-ibtn rf-ibtn-say${props.listening ? ' rf-say-on' : ''}`} onClick={say} disabled={props.transcribing} aria-label={copy.say}>
                <Icon name="mic" />
              </button>
            ) : null}
          </div>
          {voiceBar}

          <div className={`rf-sheet rf-sheet-${sheet}`} style={{ height: sheetHeight }}>
            <button
              type="button"
              className="rf-grab"
              aria-label={sheet === 'peek' ? copy.show : copy.hide}
              onClick={() => (sheet === 'item' ? closeItem() : setSheet(sheet === 'peek' ? 'list' : 'peek'))}
            >
              <span />
            </button>
            {sheet === 'item' && card ? (
              card
            ) : sheet === 'list' && processOpen && process ? (
              process
            ) : (
              <div className="rf-sheet-body">
                <div className="rf-sheet-head">
                  <div>
                    <div className="rf-sheet-title">{fill(copy.listCount, { n: data.items.length, items: vocab.items })}</div>
                    {statsLine}
                  </div>
                  <span className="rf-sheet-tools">
                    {caps.process ? (
                      <button
                        type="button"
                        className="rf-ibtn rf-ibtn-flat"
                        aria-label={copy.processEdit}
                        title={copy.processEdit}
                        onClick={() => {
                          setProcessOpen(true);
                          setSheet('list');
                        }}
                      >
                        <Icon name="flow" />
                      </button>
                    ) : caps.redo ? (
                      <button type="button" className="rf-ibtn rf-ibtn-flat" onClick={onRedo} disabled={rebuilding} aria-label={copy.redo} title={copy.redo}>
                        <Icon name="redo" />
                      </button>
                    ) : null}
                    <button type="button" className="rf-chip" onClick={() => setSheet(sheet === 'peek' ? 'list' : 'peek')}>
                      {sheet === 'peek' ? copy.show : copy.hide}
                    </button>
                  </span>
                </div>
                {rebuilding ? <div className="rf-note">{copy.rebuilding}</div> : null}
                {sheet === 'peek' ? (
                  <div className="rf-strip">
                    {data.items.map((it) => (
                      <button key={it.id} type="button" className="rf-mini" onClick={() => choose(it.id)}>
                        <span className="rf-mini-top">
                          <span className="rf-dot" style={{ background: STATUS_COLOR[it.status] }} />
                          <span className="rf-mini-name">{it.name}</span>
                        </span>
                        <span className="rf-mini-meta">{it.example ? copy.example : stageLabel(it)}</span>
                        <span className="rf-row-progress">
                          <span style={{ width: `${Math.round(it.progress * 100)}%`, background: STATUS_COLOR[it.status] }} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {hasExamples ? <div className="rf-note">{fill(copy.examplesBanner, { items: vocab.items })}</div> : null}
                    {list}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="rf-top">
            <div className="rf-card rf-head">
              <div className="rf-cart-top">
                <span>{copy.brand}</span>
                {geo ? <span>{geo.city}</span> : null}
              </div>
              <div className="rf-title">{title}</div>
              {geo && (geo.e || geo.elevation) ? (
                <div className="rf-cart-meta">
                  {[geo.canton, geo.elevation != null ? `${Math.round(geo.elevation)} m` : null, geo.e && geo.n ? `${formatCoord(geo.e)} / ${formatCoord(geo.n)}` : null].filter(Boolean).join('   ·   ')}
                </div>
              ) : null}
              <div className="rf-cart-stats">
                <span>
                  <b>{stats.active}</b>
                  {fill(copy.statInProgress, { items: vocab.items })}
                </span>
                <span>
                  <b>{stats.people}</b>
                  {copy.statOut}
                </span>
                <span className={stats.late ? 'rf-late' : ''}>
                  <b>{stats.late}</b>
                  {copy.statLate}
                </span>
              </div>
              <div className="rf-cart-date">
                {copy.today} · {data.today}
              </div>
            </div>
            <div className="rf-actions">
              {caps.stage ? sayButton : null}
              <button type="button" className="rf-btn" onClick={overview}>
                <Icon name="home" /> {copy.overview}
              </button>
              {caps.process ? (
                <button
                  type="button"
                  className={`rf-btn${processOpen ? ' rf-btn-on' : ''}`}
                  onClick={() => {
                    handleRef.current?.select(null);
                    setProcessOpen((v) => !v);
                  }}
                >
                  <Icon name="flow" /> {copy.processEdit}
                </button>
              ) : null}
              <button type="button" className="rf-ibtn" onClick={toggleMood} aria-label={mood === 'day' ? copy.night : copy.day} title={mood === 'day' ? copy.night : copy.day}>
                <Icon name={mood === 'day' ? 'moon' : 'sun'} />
              </button>
              <button type="button" className="rf-ibtn" onClick={toggleAnim} aria-label={animated ? copy.pause : copy.play} title={animated ? copy.pause : copy.play}>
                <Icon name={animated ? 'pause' : 'play'} />
              </button>
              {caps.redo && !caps.process ? (
                <button type="button" className="rf-btn" onClick={onRedo} disabled={rebuilding}>
                  <Icon name="redo" /> {copy.redo}
                </button>
              ) : null}
              <button type="button" className="rf-btn rf-btn-dark" onClick={onClose}>
                <Icon name="x" /> {copy.close}
              </button>
            </div>
          </div>

          <div className={`rf-card rf-side${listOpen ? '' : ' rf-side-closed'}`}>
            <button type="button" className="rf-side-head" onClick={() => setListOpen((v) => !v)} aria-expanded={listOpen}>
              <span>
                <Icon name="list" /> {fill(copy.listCount, { n: data.items.length, items: vocab.items })}
              </span>
              <span className="rf-muted">{listOpen ? copy.hide : copy.show}</span>
            </button>
            {listOpen ? (
              <>
                {rebuilding ? <div className="rf-note">{copy.rebuilding}</div> : null}
                {hasExamples ? <div className="rf-note">{fill(copy.examplesBanner, { items: vocab.items })}</div> : null}
                {list}
              </>
            ) : null}
          </div>

          {card ? <div className="rf-card rf-panel">{card}</div> : process ? <div className="rf-card rf-panel">{process}</div> : null}
          {voiceBar}

          <div className="rf-legend">
            <span className="rf-legend-title">{copy.legendTitle}</span>
            {(Object.keys(STATUS_COLOR) as ReliefItemStatus[]).map((k) => (
              <span key={k} className="rf-legend-item">
                <span className="rf-sq" style={{ background: WORLD_STATUS[k] }} />
                {copy.status[k]}
              </span>
            ))}
            <span className="rf-legend-item">
              <span className="rf-line" />
              {copy.legendCable}
            </span>
            <span className="rf-hint rf-legend-hint">{copy.hint}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ card

function ItemCard({
  item,
  spec,
  data,
  copy,
  locale,
  caps,
  mobile,
  onLoadDetails,
  onAddTask,
  onToggleTask,
  onPlan,
  onSetStage,
  onCloseProject,
  onNavigate,
  onCloseItem,
}: Props & { item: ReliefItem; mobile: boolean; onCloseItem: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(!item.example);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const showMoney = caps.quotes || caps.finances;

  const reload = useCallback(async () => {
    if (item.example) return;
    const res = await onLoadDetails(item.id);
    setLoaded(res);
    setLoading(false);
  }, [item.id, item.example, onLoadDetails]);

  // Reload when the live data changes (realtime: tasks, planning, projects).
  useEffect(() => {
    reload();
  }, [reload, data]);

  const run = async (fn: () => Promise<string | null>, ok: string) => {
    setMessage(null);
    const err = await fn();
    setMessage(err ? { ok: false, text: fill(copy.error, { message: err }) } : { ok: true, text: ok });
    if (!err) reload();
    return !err;
  };

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: copy.tabOverview },
    { key: 'tasks', label: copy.tabTasks, badge: loaded?.details.tasks.filter((t) => !t.done).length ?? item.tasks.length },
    { key: 'planning', label: copy.tabPlanning },
    ...(showMoney ? [{ key: 'money' as Tab, label: copy.tabMoney }] : []),
    { key: 'links', label: copy.tabLinks },
  ];

  const q = (s: string) => encodeURIComponent(s);
  const projectParams = `voiceProjectId=${q(item.id)}&voiceProjectName=${q(item.name)}${item.client ? `&voiceClientName=${q(item.client)}` : ''}`;

  return (
    <div className="rf-cardin">
      <div className="rf-panel-top">
        <div style={{ minWidth: 0 }}>
          <div className="rf-eyebrow">{[item.client, item.place].filter(Boolean).join(' · ') || vocabLabel(spec)}</div>
          <div className="rf-panel-title">{item.name}</div>
        </div>
        <button type="button" className="rf-ibtn rf-ibtn-flat" onClick={onCloseItem} aria-label={copy.close}>
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="rf-badges">
        <span className="rf-badge" style={{ color: STATUS_COLOR[item.status], borderColor: STATUS_COLOR[item.status] }}>
          {item.example ? copy.example : copy.status[item.status]}
        </span>
        {data.kinds.length > 1 && !item.example ? <span className="rf-badge rf-badge-soft">{data.kinds.find((k) => k.id === item.kind)?.name}</span> : null}
      </div>

      <StageBlock
        item={item}
        kinds={data.kinds}
        copy={copy}
        locale={locale}
        itemWord={spec.vocabulary.item}
        canMove={caps.stage && !item.example}
        canClose={caps.close && !item.example}
        onMove={(kind, stage) => run(() => onSetStage(item.id, kind, stage), fill(copy.stageSaved, { stage: (data.kinds.find((k) => k.id === kind)?.stages ?? item.stages)[stage]?.label ?? '' }))}
        onCloseProject={() => run(() => onCloseProject(item.id), copy.closed)}
      />

      {item.example ? (
        <div className="rf-example-box">
          <p>{fill(copy.exampleCard, { items: spec.vocabulary.items })}</p>
          {caps.create ? (
            <button type="button" className="rf-btn rf-btn-primary" onClick={() => onNavigate('/chantiers/new')}>
              <Icon name="plus" /> {fill(copy.add, {})} · {spec.vocabulary.item}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="rf-tabs" role="tablist">
            {tabs.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`rf-tab${tab === t.key ? ' rf-tab-on' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
                {t.badge ? <span className="rf-tab-badge">{t.badge}</span> : null}
              </button>
            ))}
          </div>

          <div className="rf-tabbody" key={tab}>
            {loading ? <div className="rf-skeleton" aria-label={copy.loading} /> : null}

            {!loading && tab === 'overview' ? <Overview item={item} spec={spec} data={data} copy={copy} details={loaded?.details ?? null} caps={caps} /> : null}

            {!loading && tab === 'tasks' ? (
              <Tasks
                copy={copy}
                details={loaded?.details ?? null}
                data={data}
                onAdd={(title) => run(() => onAddTask(item.id, title), copy.added)}
                onToggle={(id, done) => run(() => onToggleTask(id, done), done ? '✓' : '↺')}
              />
            ) : null}

            {!loading && tab === 'planning' ? (
              <Planning copy={copy} locale={locale} data={data} details={loaded?.details ?? null} canPlan={caps.plan} onPlan={(pid, day) => run(() => onPlan(item.id, pid, day), copy.planned)} />
            ) : null}

            {!loading && tab === 'money' && showMoney ? (
              <Money
                copy={copy}
                details={loaded?.details ?? null}
                caps={caps}
                onOpenDevis={(id) => onNavigate(`/devis/${id}`)}
                onOpenFacture={(id) => onNavigate(`/devis/factures/${id}`)}
                onNewDevis={() => onNavigate(`/devis/new?${projectParams}`)}
                onNewFacture={() => onNavigate(`/devis/factures/new?${projectParams}`)}
              />
            ) : null}

            {!loading && tab === 'links' ? (
              <div className="rf-links">
                {(loaded?.sections ?? []).map((s, i) => (
                  <button key={s.key} type="button" className="rf-link" onClick={() => onNavigate(s.route)} style={{ animationDelay: `${i * 35}ms` }}>
                    <span className="rf-link-icon">
                      <Icon name={s.icon} />
                    </span>
                    <span className="rf-link-label">{s.label}</span>
                    {s.count != null ? <span className="rf-link-count">{s.count}</span> : null}
                    <Icon name="arrow" size={14} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {message ? <div className={`rf-message${message.ok ? '' : ' rf-message-err'}`}>{message.text}</div> : null}

          <button type="button" className={`rf-btn rf-btn-primary rf-open${mobile ? ' rf-open-m' : ''}`} onClick={() => onNavigate(`/chantiers/${item.id}`)}>
            {copy.open} <Icon name="arrow" />
          </button>
        </>
      )}
    </div>
  );
}

function vocabLabel(spec: ReliefSpec) {
  return spec.vocabulary.item;
}

function sayExample(copy: ReliefCopy, it: ReliefItem) {
  const i = Math.min(it.stages.length - 2, Math.max(0, it.stage));
  return fill(copy.sayExample, { name: it.name, stage: it.stages[i]?.label ?? '', next: it.stages[i + 1]?.label ?? '' });
}

function dayLabel(iso: string, locale: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(DATE_LOCALE[locale] ?? 'fr-CH', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Where the item stands in its process: the steps as a rail anyone may
// click to move it, how long it has been at this step against the usual and
// the minimum lengths, the estimated end, and the button to move on.
function StageBlock({
  item,
  kinds,
  copy,
  locale,
  itemWord,
  canMove,
  canClose,
  onMove,
  onCloseProject,
}: {
  item: ReliefItem;
  kinds: ReliefKind[];
  copy: ReliefCopy;
  locale: string;
  itemWord: string;
  canMove: boolean;
  canClose: boolean;
  onMove: (kind: string, stage: number) => Promise<boolean>;
  onCloseProject: () => Promise<boolean>;
}) {
  const [confirm, setConfirm] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const stages = item.stages;
  const i = Math.min(stages.length - 1, item.stage);
  const cur: ReliefStage | undefined = stages[i];
  const done = item.status === 'done';
  const last = i >= stages.length - 1;
  const over = stageOverdue(cur, item.stageElapsed);

  const move = async (to: number, force = false) => {
    if (!canMove || busy || to === i) return;
    // Moving on before the minimum: ask once.
    if (!force && to > i && stageTooEarly(cur, item.stageElapsed)) {
      setConfirm(to);
      return;
    }
    setConfirm(null);
    setBusy(true);
    await onMove(item.kind, to);
    setBusy(false);
  };

  return (
    <div className={`rf-stageblock${done ? ' rf-stageblock-done' : ''}`}>
      <div className="rf-sb-top">
        <span className="rf-sb-count">{fill(copy.stageOf, { n: i + 1, total: stages.length })}</span>
        {canMove && kinds.length > 1 && !done ? (
          <label className="rf-sb-kind">
            <span>{copy.kindLabel}</span>
            <select value={item.kind} onChange={(e) => onMove(e.target.value, 0)} disabled={busy}>
              {kinds.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="rf-sb-name">{done ? copy.status.done : cur?.label}</div>
      {!done ? (
        <div className="rf-sb-meta">
          {item.stageElapsed != null ? <span className={over ? 'rf-sb-over' : ''}>{fill(copy.stageSince, { days: item.stageElapsed })}</span> : null}
          {cur?.days ? <span>{fill(copy.stagePlanned, { usual: cur.days })}</span> : null}
          {cur?.minDays ? <span>{fill(copy.stageMinimum, { min: cur.minDays })}</span> : null}
          {over && cur?.days && item.stageElapsed != null ? <span className="rf-sb-over">{fill(copy.stageOver, { n: item.stageElapsed - cur.days })}</span> : null}
        </div>
      ) : null}

      <div className="rf-rail" role="list">
        {stages.map((s, j) => {
          const state = done || j < i ? 'done' : j === i ? 'on' : 'next';
          // Time spent in the current step, against its usual length.
          const fillPct = state === 'done' ? 100 : state === 'on' && cur?.days && item.stageElapsed != null ? Math.min(100, (item.stageElapsed / cur.days) * 100) : state === 'on' ? 35 : 0;
          return (
            <button
              key={`${s.label}-${j}`}
              type="button"
              role="listitem"
              className={`rf-rail-step rf-rail-${state}${canMove && !done ? ' rf-rail-click' : ''}`}
              style={{ flexGrow: Math.max(1, s.days ?? 1) }}
              onClick={() => (canMove && !done ? move(j) : undefined)}
              disabled={!canMove || done || busy}
              title={s.label}
            >
              <span className="rf-rail-bar">
                <span style={{ width: `${fillPct}%` }} className={state === 'on' && over ? 'rf-rail-over' : ''} />
                {s.minDays && s.days ? <i style={{ left: `${Math.min(100, (s.minDays / s.days) * 100)}%` }} /> : null}
              </span>
              <span className="rf-rail-label">{String(j + 1).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>

      {!item.tracked && !done && !item.example ? <div className="rf-sb-note">{canMove ? copy.stageGuessed : ''}</div> : null}
      {item.eta && !done ? (
        <div className="rf-sb-eta">
          <span>{copy.eta}</span>
          <b className={item.endDate && item.eta > item.endDate ? 'rf-sb-over' : ''}>{dayLabel(item.eta, locale)}</b>
          {item.endDate && item.eta > item.endDate ? <span className="rf-sb-over">{copy.etaLate}</span> : null}
        </div>
      ) : null}

      {confirm != null ? (
        <div className="rf-sb-confirm">
          <span>{fill(copy.stageEarly, { min: cur?.minDays ?? 0 })}</span>
          <span className="rf-sb-confirm-actions">
            <button type="button" className="rf-btn rf-btn-primary" onClick={() => move(confirm, true)} disabled={busy}>
              {copy.stageConfirm}
            </button>
            <button type="button" className="rf-btn" onClick={() => setConfirm(null)}>
              {copy.stageCancel}
            </button>
          </span>
        </div>
      ) : canMove && !done ? (
        last ? (
          canClose ? (
            <button type="button" className="rf-btn rf-btn-dark rf-sb-next" onClick={async () => { setBusy(true); await onCloseProject(); setBusy(false); }} disabled={busy}>
              <Icon name="flag" /> {fill(copy.closeItem, { item: itemWord })}
            </button>
          ) : (
            <div className="rf-sb-note">{copy.stageLast}</div>
          )
        ) : (
          <button type="button" className="rf-btn rf-btn-dark rf-sb-next" onClick={() => move(i + 1)} disabled={busy}>
            <Icon name="check" /> {copy.stageDone}
            <span className="rf-sb-next-to">{fill(copy.stageNext, { stage: stages[i + 1]?.label ?? '' })}</span>
          </button>
        )
      ) : null}
    </div>
  );
}

// The owner's process, editable from the map: kinds of projects, their
// steps with usual and minimum durations. Saved without rebuilding.
function ProcessEditor({
  copy,
  kinds: initial,
  itemWord,
  onClose,
  onSave,
  onRedo,
}: {
  copy: ReliefCopy;
  kinds: ReliefKind[];
  itemWord: string;
  onClose: () => void;
  onSave: (kinds: ReliefKind[]) => Promise<string | null>;
  onRedo: (() => void) | null;
}) {
  const [kinds, setKinds] = useState<ReliefKind[]>(() => initial.map((k) => ({ ...k, stages: k.stages.map((s) => ({ ...s })) })));
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const k = kinds[Math.min(idx, kinds.length - 1)];
  const valid = kinds.every((x) => x.name.trim() && x.stages.filter((s) => s.label.trim()).length >= 3);
  const setStage = (j: number, patch: Partial<ReliefStage>) =>
    setKinds((ks) =>
      ks.map((x, i) => {
        if (i !== idx) return x;
        return {
          ...x,
          stages: x.stages.map((s, n) => {
            if (n !== j) return s;
            const next = { ...s, ...patch };
            if (next.minDays && next.days && next.minDays > next.days) {
              if ('days' in patch) next.minDays = next.days;
              else next.days = next.minDays;
            }
            return next;
          }),
        };
      }),
    );
  const total = k.stages.reduce((a, s) => a + (s.days ?? 0), 0);
  const num = (v: string) => Math.max(0, Math.min(365, Number(v) || 0));
  return (
    <div className="rf-cardin rf-proc">
      <div className="rf-panel-top">
        <div style={{ minWidth: 0 }}>
          <div className="rf-eyebrow">{copy.processEdit}</div>
          <div className="rf-panel-title">{copy.processTitle}</div>
        </div>
        <button type="button" className="rf-ibtn rf-ibtn-flat" onClick={onClose} aria-label={copy.close}>
          <Icon name="x" size={18} />
        </button>
      </div>
      <p className="rf-muted rf-proc-text">{copy.processText}</p>
      {kinds.length > 1 ? (
        <div className="rf-tabs" role="tablist">
          {kinds.map((x, i) => (
            <button key={x.id} type="button" role="tab" aria-selected={i === idx} className={`rf-tab${i === idx ? ' rf-tab-on' : ''}`} onClick={() => setIdx(i)}>
              {x.name || '—'}
            </button>
          ))}
        </div>
      ) : null}
      <input className="rf-proc-name" value={k.name} onChange={(e) => setKinds((ks) => ks.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} maxLength={40} aria-label={copy.obKindName} />
      <div className="rf-proc-head" aria-hidden="true">
        <span />
        <span>{copy.obStageName}</span>
        <span>{copy.obStageUsual}</span>
        <span>{copy.obStageMin}</span>
      </div>
      <div className="rf-proc-rows">
        {k.stages.map((s, j) => (
          <div key={j} className="rf-proc-row">
            <span className="rf-proc-n">{String(j + 1).padStart(2, '0')}</span>
            <input value={s.label} onChange={(e) => setStage(j, { label: e.target.value })} maxLength={32} aria-label={copy.obStageName} />
            <input className="rf-proc-num" type="number" min={0} max={365} value={s.days || ''} onChange={(e) => setStage(j, { days: num(e.target.value) })} aria-label={copy.obStageUsual} />
            <input className="rf-proc-num rf-proc-min" type="number" min={0} max={365} value={s.minDays || ''} onChange={(e) => setStage(j, { minDays: num(e.target.value) })} aria-label={copy.obStageMin} />
          </div>
        ))}
      </div>
      <div className="rf-proc-foot">
        <span className="rf-muted">
          {fill(copy.processStages, { n: k.stages.length })} · {total} {copy.obDaysUnit}
        </span>
        {k.stages.length < 8 ? (
          <button type="button" className="rf-chip" onClick={() => setKinds((ks) => ks.map((x, i) => (i === idx ? { ...x, stages: [...x.stages, { label: '' }] } : x)))}>
            + {copy.obAddStage}
          </button>
        ) : null}
      </div>
      <div className="rf-muted rf-small">{fill(copy.obKindsHint, { item: itemWord })}</div>
      <button
        type="button"
        className="rf-btn rf-btn-primary rf-open"
        disabled={!valid || busy}
        onClick={async () => {
          setBusy(true);
          await onSave(kinds.map((x) => ({ ...x, name: x.name.trim(), stages: x.stages.filter((s) => s.label.trim()) })));
          setBusy(false);
        }}
      >
        {copy.processSave}
      </button>
      {onRedo ? (
        <button type="button" className="rf-btn rf-proc-redo" onClick={onRedo}>
          <Icon name="redo" /> {copy.redo}
        </button>
      ) : null}
    </div>
  );
}

function Overview({ item, spec, data, copy, details, caps }: { item: ReliefItem; spec: ReliefSpec; data: ReliefData; copy: ReliefCopy; details: ReliefDetails | null; caps: Props['caps'] }) {
  const crew = item.crew.map((id) => data.people.find((p) => p.id === id)).filter(Boolean) as ReliefData['people'];
  const invoiced = details?.factures?.reduce((s, f) => s + (f.status === 'draft' || f.status === 'cancelled' ? 0 : f.total), 0) ?? item.money?.invoiced ?? 0;
  const paid = details?.factures?.reduce((s, f) => s + f.paid, 0) ?? 0;
  return (
    <div className="rf-ov">
      <ol className="rf-timeline">
        {item.stages.map((s, i) => {
          const state = item.status === 'done' || i < item.stage ? 'done' : i === item.stage ? 'on' : 'next';
          return (
            <li key={s.label + i} className={`rf-tl rf-tl-${state}`}>
              <span className="rf-tl-dot">{state === 'done' ? <Icon name="check" size={11} /> : i + 1}</span>
              <span className="rf-tl-main">
                <span className="rf-tl-label">
                  {s.label}
                  {s.client ? <span className="rf-tl-client">{copy.obStageClient}</span> : null}
                </span>
                {s.owner || s.days ? (
                  <span className="rf-tl-meta">
                    {[s.owner ? fill(copy.stageOwner, { owner: s.owner }) : '', s.days ? fill(copy.stageDays, { days: s.days }) : ''].filter(Boolean).join(' · ')}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="rf-figures">
        <Figure label={copy.progress} value={`${Math.round(item.progress * 100)} %`} bar={item.progress} />
        <Figure label={copy.dates} value={item.startDate || item.endDate ? `${date(item.startDate)} → ${date(item.endDate)}` : copy.noDates} small />
        {details?.schedule ? <Figure label={copy.scheduleProgress} value={details.schedule.phase ? fill(copy.schedulePhase, { phase: details.schedule.phase }) : `${Math.round(details.schedule.progress * 100)} %`} small bar={details.schedule.progress} /> : null}
        {caps.quotes || caps.finances ? (
          <>
            <Figure label={copy.quoted} value={chf(item.money?.quoted ?? (details?.devis ?? []).filter((d) => d.status === 'accepted').reduce((s, d) => s + d.total, 0))} />
            <Figure label={copy.invoiced} value={chf(invoiced)} bar={invoiced ? paid / invoiced : undefined} />
          </>
        ) : null}
        {caps.finances && details?.expenses ? <Figure label={copy.costs} value={chf(details.expenses.total)} /> : null}
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
    </div>
  );
}

function Tasks({
  copy,
  details,
  data,
  onAdd,
  onToggle,
}: {
  copy: ReliefCopy;
  details: ReliefDetails | null;
  data: ReliefData;
  onAdd: (title: string) => Promise<boolean>;
  onToggle: (id: string, done: boolean) => Promise<boolean>;
}) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const tasks = details?.tasks ?? [];
  const isDone = (t: ReliefDetails['tasks'][number]) => pending[t.id] ?? t.done;
  const open = tasks.filter((t) => !isDone(t));
  const done = tasks.filter((t) => isDone(t));
  const who = (id: string | null) => data.people.find((p) => p.id === id);

  const row = (t: ReliefDetails['tasks'][number]) => {
    const p = who(t.assignee);
    const d = isDone(t);
    return (
      <div key={t.id} className={`rf-task${d ? ' rf-task-done' : ''}`}>
        <button
          type="button"
          className={`rf-check${d ? ' rf-check-on' : ''}`}
          aria-pressed={d}
          aria-label={t.title}
          onClick={async () => {
            setPending((m) => ({ ...m, [t.id]: !d }));
            const ok = await onToggle(t.id, !d);
            if (!ok) setPending((m) => ({ ...m, [t.id]: d }));
          }}
        >
          {d ? <Icon name="check" size={12} /> : null}
        </button>
        <span className="rf-task-title">{t.title}</span>
        {p ? (
          <span className="rf-avatar rf-avatar-s" style={{ background: p.color }} title={p.name}>
            {p.initials}
          </span>
        ) : null}
        {t.dueOn ? <span className="rf-task-due">{date(t.dueOn)}</span> : null}
      </div>
    );
  };

  return (
    <div className="rf-tasks">
      <form
        className="rf-inline"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim() || busy) return;
          setBusy(true);
          if (await onAdd(title.trim())) setTitle('');
          setBusy(false);
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={copy.taskPlaceholder} aria-label={copy.addTask} maxLength={300} />
        <button type="submit" className="rf-btn rf-btn-primary" disabled={!title.trim() || busy}>
          <Icon name="plus" /> {copy.add}
        </button>
      </form>
      {open.length ? open.map(row) : <div className="rf-muted rf-pad">{copy.noTasks}</div>}
      {done.length ? (
        <>
          <button type="button" className="rf-disclose" onClick={() => setShowDone((v) => !v)} aria-expanded={showDone}>
            <Icon name="chevron" size={14} /> {fill(copy.doneTasks, { n: done.length })}
          </button>
          {showDone ? done.map(row) : null}
        </>
      ) : null}
    </div>
  );
}

function Planning({
  copy,
  locale,
  data,
  details,
  canPlan,
  onPlan,
}: {
  copy: ReliefCopy;
  locale: string;
  data: ReliefData;
  details: ReliefDetails | null;
  canPlan: boolean;
  onPlan: (personId: string, day: string) => Promise<boolean>;
}) {
  const days = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(DATE_LOCALE[locale] ?? 'fr-CH', { weekday: 'short', day: 'numeric' });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000);
      return { iso: isoDay(d), label: fmt.format(d), weekend: d.getDay() === 0 || d.getDay() === 6 };
    });
  }, [locale]);
  const [person, setPerson] = useState('');
  const [day, setDay] = useState(days[0].iso);
  const [busy, setBusy] = useState(false);
  const week = details?.week ?? [];

  return (
    <div className="rf-plan">
      <div className="rf-section">{copy.weekTitle}</div>
      <div className="rf-grid-wrap">
        <table className="rf-grid">
          <thead>
            <tr>
              <th />
              {days.map((d) => (
                <th key={d.iso} className={d.weekend ? 'rf-we' : ''}>
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {week.length ? (
              week.map((w) => {
                const p = data.people.find((x) => x.id === w.personId);
                return (
                  <tr key={w.personId}>
                    <th>
                      <span className="rf-avatar rf-avatar-s" style={{ background: p?.color ?? '#8C8073' }}>
                        {p?.initials ?? '?'}
                      </span>
                    </th>
                    {days.map((d) => (
                      <td key={d.iso} className={d.weekend ? 'rf-we' : ''}>
                        {w.days.includes(d.iso) ? <span className="rf-cell" style={{ background: p?.color ?? 'var(--accent)' }} /> : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="rf-muted rf-pad">
                  {copy.noWeek}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {canPlan ? (
        <form
          className="rf-planform"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!person || busy) return;
            setBusy(true);
            if (await onPlan(person, day)) setPerson('');
            setBusy(false);
          }}
        >
          <label>
            <span>{copy.planWho}</span>
            <select value={person} onChange={(e) => setPerson(e.target.value)}>
              <option value="">{copy.choosePerson}</option>
              {data.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{copy.planWhen}</span>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {days.map((d) => (
                <option key={d.iso} value={d.iso}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="rf-btn rf-btn-primary" disabled={!person || busy}>
            <Icon name="calendar" /> {copy.plan}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function Money({
  copy,
  details,
  caps,
  onOpenDevis,
  onOpenFacture,
  onNewDevis,
  onNewFacture,
}: {
  copy: ReliefCopy;
  details: ReliefDetails | null;
  caps: Props['caps'];
  onOpenDevis: (id: string) => void;
  onOpenFacture: (id: string) => void;
  onNewDevis: () => void;
  onNewFacture: () => void;
}) {
  const devis = details?.devis ?? [];
  const factures = details?.factures ?? [];
  const invoiced = factures.filter((f) => f.status !== 'draft' && f.status !== 'cancelled').reduce((s, f) => s + f.total, 0);
  return (
    <div className="rf-money">
      {caps.quotes ? (
        <div className="rf-money-actions">
          <button type="button" className="rf-btn" onClick={onNewDevis}>
            <Icon name="plus" /> {copy.newDevis}
          </button>
          <button type="button" className="rf-btn" onClick={onNewFacture}>
            <Icon name="plus" /> {copy.newFacture}
          </button>
        </div>
      ) : null}

      {details?.devis ? (
        <>
          <div className="rf-section">{copy.devisTitle}</div>
          {devis.length ? (
            devis.map((d) => (
              <button key={d.id} type="button" className="rf-doc" onClick={() => onOpenDevis(d.id)}>
                <span className="rf-doc-main">
                  <span className="rf-doc-num">{d.number || '—'}</span>
                  <span className="rf-doc-meta">{date(d.date)}</span>
                </span>
                <span className={`rf-pill rf-pill-${d.status}`}>{copy.devisStatus[d.status] ?? d.status}</span>
                <span className="rf-doc-amount">{chf(d.total)}</span>
              </button>
            ))
          ) : (
            <div className="rf-muted rf-pad">{copy.noDevis}</div>
          )}
        </>
      ) : null}

      {details?.factures ? (
        <>
          <div className="rf-section">{copy.facturesTitle}</div>
          {factures.length ? (
            factures.map((f) => {
              const rest = Math.max(0, f.total - f.paid);
              return (
                <button key={f.id} type="button" className="rf-doc" onClick={() => onOpenFacture(f.id)}>
                  <span className="rf-doc-main">
                    <span className="rf-doc-num">{f.number || '—'}</span>
                    <span className="rf-doc-meta">{f.status === 'paid' || !f.dueDate ? '' : fill(copy.dueOn, { date: date(f.dueDate) })}</span>
                    <span className="rf-doc-bar">
                      <span style={{ width: `${f.total ? Math.min(100, (f.paid / f.total) * 100) : 0}%` }} />
                    </span>
                  </span>
                  <span className={`rf-pill rf-pill-${f.status}`}>{copy.factureStatus[f.status] ?? f.status}</span>
                  <span className="rf-doc-amount">
                    {chf(f.total)}
                    {rest > 0 && f.status !== 'draft' && f.status !== 'cancelled' ? <small>{fill(copy.remaining, { amount: chf(rest) })}</small> : null}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="rf-muted rf-pad">{copy.noFactures}</div>
          )}
        </>
      ) : null}

      {caps.finances && details?.expenses ? (
        <div className="rf-figures rf-figures-money">
          <Figure label={copy.costs} value={chf(details.expenses.total)} small />
          <Figure label={copy.margin} value={chf(invoiced - details.expenses.total)} small />
        </div>
      ) : null}
      <div className="rf-muted rf-small">{copy.ht}</div>
    </div>
  );
}

function Figure({ label, value, small = false, bar }: { label: string; value: string; small?: boolean; bar?: number }) {
  return (
    <div className="rf-figure">
      <div className="rf-figure-label">{label}</div>
      <div className={`rf-figure-value${small ? ' rf-small' : ''}`}>{value}</div>
      {bar !== undefined ? (
        <span className="rf-figure-bar">
          <span style={{ width: `${Math.round(Math.min(1, Math.max(0, bar)) * 100)}%` }} />
        </span>
      ) : null}
    </div>
  );
}

const CSS = `
.rf-root { position: relative; flex: 1; width: 100%; height: 100%; min-height: 100%; overflow: hidden; background: radial-gradient(110% 90% at 55% 45%, #F8F4EC 0%, #EEE7DB 60%, #E4DBCC 100%); font-family: Archivo, system-ui, -apple-system, sans-serif; color: #231A12; -webkit-font-smoothing: antialiased; }
.rf-root * { box-sizing: border-box; }
.rf-stage { position: absolute; inset: 0; z-index: 0; touch-action: none; }
.rf-intro { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(110% 90% at 55% 45%, #F8F4EC 0%, #EEE7DB 60%, #E4DBCC 100%); transition: opacity .9s ease; }
.rf-intro-out { opacity: 0; }
.rf-top, .rf-side, .rf-panel, .rf-legend, .rf-mbar, .rf-sheet { z-index: 2; }
.rf-card { background: #FFFDF9; border: 1px solid rgba(35,26,18,0.1); border-radius: 4px; box-shadow: 0 1px 2px rgba(29,23,18,0.06), 0 8px 24px rgba(29,23,18,0.06); }
.rf-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rf-muted { font-size: 12px; color: #6E6153; }
.rf-small { font-size: 11.5px; }
.rf-pad { padding: 8px 2px; }
.rf-note { font-size: 12px; line-height: 1.45; color: #6E6153; background: #F6F0E6; border-radius: 3px; padding: 8px 10px; margin: 6px 8px; }
.rf-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; display: inline-block; }
.rf-stats { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; color: #4A3F35; }
.rf-stats b { font-family: 'Martian Mono', ui-monospace, monospace; font-weight: 600; color: #231A12; }
.rf-late, .rf-late b { color: #AB3327 !important; }
@keyframes rf-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes rf-slide { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }
@keyframes rf-shimmer { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }

/* buttons */
.rf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; font: 700 13px Archivo, system-ui, sans-serif; padding: 9px 13px; border-radius: 3px; border: 1px solid rgba(35,26,18,0.14); background: #FFFDF9; color: #231A12; cursor: pointer; white-space: nowrap; transition: background .15s, border-color .15s; }
.rf-btn:hover { background: #F4EEE4; border-color: rgba(29,23,18,0.3); }
.rf-btn:active { transform: none; }
.rf-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.rf-btn:focus-visible, .rf-row:focus-visible, .rf-tab:focus-visible, .rf-ibtn:focus-visible, .rf-link:focus-visible, .rf-doc:focus-visible, .rf-mini:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rf-btn-dark { background: #16120E; color: #FFFFFF; border-color: #16120E; }
.rf-btn-dark:hover { background: #2B241D; }
.rf-btn-primary { background: var(--accent); border-color: var(--accent); color: #FFFFFF; }
.rf-btn-primary:hover { background: var(--accent); filter: brightness(0.93); }
.rf-ibtn { all: unset; box-sizing: border-box; width: 40px; height: 40px; border-radius: 3px; display: grid; place-items: center; background: #FFFDF9; border: 1px solid rgba(35,26,18,0.12); cursor: pointer; color: #231A12; flex: none; }
.rf-ibtn:disabled { opacity: .45; }
.rf-ibtn-dark { background: #16120E; color: #FFFFFF; border-color: #16120E; }
.rf-ibtn-flat { width: 34px; height: 34px; box-shadow: none; border-color: transparent; background: transparent; color: #6E6153; }
.rf-ibtn-flat:hover { background: #F6EFE3; }
.rf-chip { all: unset; cursor: pointer; font-size: 11px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; color: #1D1712; padding: 4px 0; border-bottom: 2px solid var(--accent); }

/* desktop frame */
.rf-top { position: absolute; left: 16px; right: 16px; top: 16px; display: flex; gap: 12px; align-items: flex-start; pointer-events: none; }
.rf-top > * { pointer-events: auto; }
.rf-head { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px 12px; width: min(420px, 100% - 520px); min-width: 300px; animation: rf-fade .35s ease-out; border-top: 3px solid var(--accent); }
.rf-cart-top { display: flex; justify-content: space-between; gap: 12px; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #5D5247; }
.rf-cart-top span:last-child { color: #1D1712; }
.rf-cart-meta { font: 500 10.5px 'Martian Mono', ui-monospace, monospace; color: #6E6458; letter-spacing: .2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-cart-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid #E6DED1; margin-top: 4px; }
.rf-cart-stats span { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px 2px 0; font-size: 11px; color: #6E6458; line-height: 1.2; }
.rf-cart-stats span + span { padding-left: 10px; border-left: 1px solid #E6DED1; }
.rf-cart-stats b { font: 600 18px 'Martian Mono', ui-monospace, monospace; color: #1D1712; }
.rf-cart-date { font-size: 10.5px; color: #8C8073; }
.rf-title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.05; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-actions { margin-left: auto; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }

.rf-side { position: absolute; left: 16px; top: 206px; bottom: 64px; width: 320px; display: flex; flex-direction: column; overflow: hidden; animation: rf-fade .4s ease-out; }
.rf-side-closed { bottom: auto; }
.rf-side-head { all: unset; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; cursor: pointer; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
.rf-side-head > span:first-child { display: inline-flex; align-items: center; gap: 8px; }
.rf-side-head .rf-muted { text-transform: none; letter-spacing: 0; font-weight: 600; }
.rf-rows { overflow: auto; padding: 4px 6px 8px; min-height: 0; }
.rf-row { all: unset; box-sizing: border-box; display: grid; grid-template-columns: auto 1fr 54px; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 3px; cursor: pointer; animation: rf-fade .3s ease-out both; }
.rf-row:hover { background: #F6EFE3; }
.rf-row-on { background: color-mix(in srgb, var(--accent) 12%, #FFFFFF) !important; }
.rf-row-main { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.rf-row-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-row-meta { font-size: 11.5px; color: #6E6153; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-row-progress { display: block; height: 4px; border-radius: 2px; background: #EDE3D3; overflow: hidden; }
.rf-row-progress > span { display: block; height: 100%; border-radius: 2px; transition: width .6s ease; }

.rf-panel { position: absolute; right: 16px; top: 80px; bottom: 16px; width: 440px; overflow: hidden; display: flex; flex-direction: column; animation: rf-slide .28s cubic-bezier(.2,.8,.2,1); }
.rf-cardin { display: flex; flex-direction: column; gap: 12px; padding: 18px; overflow: auto; min-height: 0; flex: 1; }
.rf-cardin > * { flex-shrink: 0; }
.rf-legend { position: absolute; left: 352px; bottom: 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; padding: 8px 12px; font-size: 11px; font-weight: 600; color: #3A322B; background: rgba(251,248,242,0.92); border: 1px solid rgba(29,23,18,0.14); max-width: max(260px, calc(100% - 1060px)); }
.rf-legend-title { font-size: 9.5px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; color: #6E6458; padding-right: 4px; border-right: 1px solid rgba(29,23,18,0.14); }
.rf-sq { width: 8px; height: 8px; display: inline-block; }
.rf-legend-hint { flex-basis: 100%; font-weight: 500; font-size: 10.5px; }
.rf-line { width: 18px; height: 2px; background: var(--accent); display: inline-block; }
.rf-dusk .rf-legend { background: rgba(18,25,34,0.85); color: #E4DCCF; border-color: rgba(255,255,255,0.14); }
.rf-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.rf-hint { color: #8C8073; font-weight: 500; }

/* card */
.rf-panel-top { display: flex; justify-content: space-between; gap: 12px; }
.rf-panel-title { font-size: 21px; font-weight: 800; letter-spacing: -0.4px; margin-top: 4px; line-height: 1.15; }
.rf-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.rf-badge { font-size: 10px; font-weight: 800; letter-spacing: .9px; text-transform: uppercase; padding: 4px 7px; border-radius: 2px; border: 1px solid; }
.rf-badge-soft { border-color: transparent; background: #F3ECE1; color: #4A3F35; }
.rf-steps { display: grid; gap: 4px; }
.rf-step-bar { display: block; height: 5px; border-radius: 3px; background: #EDE3D3; transition: background .4s; }
.rf-step-done .rf-step-bar { background: color-mix(in srgb, var(--accent) 45%, #EDE3D3); }
.rf-step-on .rf-step-bar { background: var(--accent); }
.rf-tabs { display: flex; gap: 2px; border-bottom: 1px solid #EDE3D3; overflow-x: auto; scrollbar-width: none; }
.rf-tabs::-webkit-scrollbar { display: none; }
.rf-tab { all: unset; cursor: pointer; flex: 1 0 auto; justify-content: center; padding: 9px 6px 10px; font-size: 12.5px; font-weight: 700; color: #8C8073; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; transition: color .15s, border-color .15s; }
.rf-tab:hover { color: #231A12; }
.rf-tab-on { color: #231A12; border-bottom-color: var(--accent); }
.rf-tab-badge { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 10px; color: var(--accent); }
.rf-tabbody { display: flex; flex-direction: column; gap: 10px; animation: rf-fade .25s ease-out; }
.rf-skeleton { height: 120px; border-radius: 3px; background: linear-gradient(90deg, #F3ECE1 0, #FAF6EF 40%, #F3ECE1 80%); background-size: 600px 100%; animation: rf-shimmer 1.2s linear infinite; }
.rf-section { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; margin-top: 4px; color: #4A3F35; }

.rf-timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.rf-tl { display: flex; gap: 10px; position: relative; padding-bottom: 10px; }
.rf-tl:not(:last-child)::before { content: ''; position: absolute; left: 10px; top: 22px; bottom: 0; width: 2px; background: #EDE3D3; }
.rf-tl-done:not(:last-child)::before { background: color-mix(in srgb, var(--accent) 45%, #EDE3D3); }
.rf-tl-dot { width: 22px; height: 22px; border-radius: 50%; flex: none; display: grid; place-items: center; font: 700 10.5px 'Martian Mono', ui-monospace, monospace; background: #F3ECE1; color: #8C8073; }
.rf-tl-done .rf-tl-dot { background: color-mix(in srgb, var(--accent) 22%, #FFFFFF); color: var(--accent); }
.rf-tl-on .rf-tl-dot { background: var(--accent); color: #FFFFFF; box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent); }
.rf-tl-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-top: 2px; }
.rf-tl-label { font-size: 13px; font-weight: 600; color: #6E6153; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.rf-tl-on .rf-tl-label { color: #231A12; font-weight: 800; }
.rf-tl-done .rf-tl-label { color: #231A12; }
.rf-tl-client { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: var(--accent); border: 1px solid currentColor; border-radius: 2px; padding: 1px 5px; }
.rf-tl-meta { font-size: 11.5px; color: #8C8073; }

.rf-figures { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rf-figure { border: 1px solid #EDE3D3; border-radius: 3px; padding: 9px 10px; background: #FFFFFF; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.rf-figure-label { font-size: 10.5px; color: #6E6153; font-weight: 600; }
.rf-figure-value { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 13.5px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.rf-figure-bar { display: block; height: 4px; border-radius: 2px; background: #EDE3D3; overflow: hidden; margin-top: 3px; }
.rf-figure-bar > span { display: block; height: 100%; background: var(--accent); border-radius: 2px; transition: width .8s ease; }
.rf-crew { display: flex; flex-wrap: wrap; gap: 8px 12px; }
.rf-person { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; }
.rf-avatar { width: 26px; height: 26px; border-radius: 50%; color: #FFFFFF; display: inline-grid; place-items: center; font-size: 10.5px; font-weight: 800; flex: none; }
.rf-avatar-s { width: 22px; height: 22px; font-size: 9.5px; }

.rf-tasks { display: flex; flex-direction: column; }
.rf-task { display: flex; align-items: center; gap: 10px; padding: 9px 2px; border-top: 1px solid #F0E8DC; font-size: 13px; animation: rf-fade .25s ease-out; }
.rf-task-title { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.rf-task-done .rf-task-title { color: #8C8073; text-decoration: line-through; }
.rf-task-due { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 10.5px; color: #6E6153; }
.rf-check { all: unset; cursor: pointer; width: 20px; height: 20px; border-radius: 6px; border: 2px solid #CFC5B5; display: grid; place-items: center; color: #FFFFFF; flex: none; transition: background .15s, border-color .15s, transform .15s; }
.rf-check:hover { border-color: var(--accent); }
.rf-check-on { background: var(--accent); border-color: var(--accent); transform: scale(1.05); }
.rf-disclose { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #6E6153; padding: 10px 2px 4px; }
.rf-inline { display: flex; gap: 8px; margin-bottom: 4px; }
.rf-inline input, .rf-planform select { flex: 1; min-width: 0; font: 500 14px Archivo, system-ui, sans-serif; padding: 9px 11px; border-radius: 3px; border: 1px solid rgba(35,26,18,0.18); background: #FFFFFF; color: #231A12; }
.rf-inline input:focus, .rf-planform select:focus { outline: 2px solid var(--accent); outline-offset: 0; }

.rf-grid-wrap { overflow-x: auto; border: 1px solid #EDE3D3; border-radius: 3px; background: #FFFFFF; }
.rf-grid { border-collapse: collapse; width: 100%; font-size: 11px; }
.rf-grid th { font-weight: 700; color: #6E6153; padding: 7px 4px; text-align: center; white-space: nowrap; }
.rf-grid td { height: 34px; text-align: center; border-top: 1px solid #F3ECE1; }
.rf-grid tbody th { width: 34px; }
.rf-we { background: #FAF6EF; }
.rf-cell { display: inline-block; width: 70%; height: 14px; border-radius: 4px; animation: rf-fade .3s ease-out; }
.rf-planform { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: end; }
.rf-planform label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; font-weight: 700; color: #6E6153; }
.rf-planform button { grid-column: 1 / -1; }

.rf-money { display: flex; flex-direction: column; gap: 6px; }
.rf-money-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rf-doc { all: unset; box-sizing: border-box; cursor: pointer; display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 10px; padding: 10px; border-radius: 3px; border: 1px solid #EDE3D3; background: #FFFFFF; transition: border-color .15s, transform .15s; animation: rf-fade .25s ease-out; }
.rf-doc:hover { border-color: var(--accent); transform: translateY(-1px); }
.rf-doc-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.rf-doc-num { font: 600 12.5px 'Martian Mono', ui-monospace, monospace; }
.rf-doc-meta { font-size: 11px; color: #8C8073; }
.rf-doc-bar { display: block; height: 3px; border-radius: 2px; background: #EDE3D3; overflow: hidden; }
.rf-doc-bar > span { display: block; height: 100%; background: #2E6B4F; }
.rf-doc-amount { font: 600 12.5px 'Martian Mono', ui-monospace, monospace; text-align: right; display: flex; flex-direction: column; gap: 2px; }
.rf-doc-amount small { font: 500 10.5px Archivo, system-ui, sans-serif; color: #AB3327; }
.rf-pill { font-size: 9.5px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; padding: 3px 6px; border-radius: 2px; background: #F3ECE1; color: #4A3F35; white-space: nowrap; }
.rf-pill-accepted, .rf-pill-paid { background: #E3EFE7; color: #2E6B4F; }
.rf-pill-sent, .rf-pill-ready { background: #E6EEF3; color: #2F5E7A; }
.rf-pill-partial { background: #F6EBD6; color: #8A5E0E; }
.rf-pill-refused, .rf-pill-cancelled { background: #F5E2DF; color: #AB3327; }
.rf-figures-money { margin-top: 6px; }

.rf-links { display: flex; flex-direction: column; gap: 6px; }
.rf-link { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 3px; border: 1px solid #EDE3D3; background: #FFFFFF; font-size: 13.5px; font-weight: 600; transition: border-color .15s, transform .15s; animation: rf-fade .25s ease-out both; }
.rf-link:hover { border-color: var(--accent); transform: translateX(2px); }
.rf-link-icon { width: 30px; height: 30px; border-radius: 3px; display: grid; place-items: center; background: color-mix(in srgb, var(--accent) 12%, #FFFFFF); color: var(--accent); flex: none; }
.rf-link-label { flex: 1; }
.rf-link-count { font: 600 11.5px 'Martian Mono', ui-monospace, monospace; color: #6E6153; }
.rf-example-box { display: flex; flex-direction: column; gap: 10px; background: #F6F0E6; border-radius: 3px; padding: 12px; font-size: 13px; line-height: 1.45; color: #4A3F35; }
.rf-example-box p { margin: 0; }
.rf-message { font-size: 12.5px; color: #2E6B4F; animation: rf-fade .2s ease-out; }
.rf-message-err { color: #AB3327; }
.rf-open { width: 100%; padding: 12px; margin-top: auto; }
.rf-dusk { background: radial-gradient(110% 90% at 55% 45%, #2A3340 0%, #1A2029 60%, #11151B 100%); }
.rf-dusk .rf-hint { color: #A79D90; }
.rf-dusk .rf-mbar { background: linear-gradient(#1A2029 70%, rgba(26,32,41,0)); }
.rf-dusk .rf-mbar-name { color: #FFFFFF; }
.rf-error { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center; text-align: center; padding: 24px; font-size: 14px; color: #6E6153; z-index: 3; }

/* phone */
.rf-mbar { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; gap: 8px; padding: max(10px, env(safe-area-inset-top)) 12px 10px; background: linear-gradient(#EFE8DC 70%, rgba(239,232,220,0)); }
.rf-mbar-title { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rf-mbar-name { font-size: 15px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-sheet { position: absolute; left: 0; right: 0; bottom: 0; background: #FFFDF9; border-radius: 10px 10px 0 0; box-shadow: 0 -10px 30px rgba(43,33,26,0.16); display: flex; flex-direction: column; transition: height .32s cubic-bezier(.2,.8,.2,1); padding-bottom: env(safe-area-inset-bottom); }
.rf-grab { all: unset; cursor: pointer; display: grid; place-items: center; height: 22px; flex: none; }
.rf-grab span { width: 40px; height: 5px; border-radius: 3px; background: #D9CFC0; }
.rf-sheet-body { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.rf-sheet-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; padding: 0 16px 8px; }
.rf-sheet-title { font-size: 16px; font-weight: 800; text-transform: capitalize; margin-bottom: 2px; }
.rf-strip { display: flex; gap: 10px; overflow-x: auto; padding: 4px 16px 12px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.rf-strip::-webkit-scrollbar { display: none; }
.rf-mini { all: unset; box-sizing: border-box; cursor: pointer; flex: 0 0 72%; max-width: 260px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 11px 12px; border-radius: 4px; border: 1px solid #EDE3D3; background: #FFFFFF; }
.rf-mini-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.rf-mini-name { font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-mini-meta { font-size: 11.5px; color: #6E6153; }
.rf-mobile .rf-rows { padding: 0 10px 12px; overflow: auto; flex: 1; }
.rf-mobile .rf-cardin { padding: 4px 16px 0; }
.rf-mobile .rf-tabs { position: sticky; top: -4px; z-index: 1; background: #FFFDF9; }
.rf-mobile .rf-panel-title { font-size: 19px; }
.rf-mobile .rf-tab { font-size: 12.5px; padding: 8px 8px 9px; }
.rf-open-m { position: sticky; bottom: 0; margin-bottom: 12px; box-shadow: 0 -10px 18px 8px #FFFDF9; }

/* where the item stands: a departure board for its process */
.rf-stageblock { background: #1D1712; color: #F3EEE5; padding: 14px 14px 12px; display: flex; flex-direction: column; gap: 8px; border-radius: 2px; position: relative; overflow: hidden; }
.rf-stageblock::after { content: ''; position: absolute; right: -40px; top: -40px; width: 120px; height: 120px; background: radial-gradient(circle, color-mix(in srgb, var(--accent) 45%, transparent), transparent 70%); pointer-events: none; }
.rf-stageblock-done { background: #3A332C; }
.rf-sb-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.rf-sb-count { font: 600 10px 'Martian Mono', ui-monospace, monospace; letter-spacing: .8px; text-transform: uppercase; color: #B8AE9F; }
.rf-sb-kind { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #B8AE9F; position: relative; z-index: 1; }
.rf-sb-kind select { font: 600 12px Archivo, system-ui, sans-serif; color: #F3EEE5; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18); border-radius: 2px; padding: 4px 6px; }
.rf-sb-kind option { color: #1D1712; }
.rf-sb-name { font-size: 24px; font-weight: 900; letter-spacing: -.6px; line-height: 1.05; }
.rf-sb-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; font: 500 11px 'Martian Mono', ui-monospace, monospace; color: #CFC6B8; }
.rf-sb-over { color: #FF9A8C !important; }
.rf-rail { display: flex; gap: 3px; margin-top: 4px; }
.rf-rail-step { all: unset; box-sizing: border-box; flex-basis: 0; min-width: 0; display: flex; flex-direction: column; gap: 5px; padding-top: 2px; }
.rf-rail-click { cursor: pointer; }
.rf-rail-click:hover .rf-rail-bar { outline: 1px solid rgba(255,255,255,.5); outline-offset: 2px; }
.rf-rail-step:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rf-rail-bar { position: relative; display: block; height: 8px; background: rgba(255,255,255,.12); }
.rf-rail-bar > span { display: block; height: 100%; background: var(--accent); transition: width .6s cubic-bezier(.2,.8,.2,1); }
.rf-rail-done .rf-rail-bar > span { background: color-mix(in srgb, var(--accent) 55%, #F3EEE5); }
.rf-rail-on .rf-rail-bar > span { background: var(--accent); box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 70%, transparent); }
.rf-rail-bar > span.rf-rail-over { background: #E0503F; }
.rf-rail-bar > i { position: absolute; top: -3px; bottom: -3px; width: 1px; background: rgba(255,255,255,.55); }
.rf-rail-label { font: 600 9.5px 'Martian Mono', ui-monospace, monospace; color: #8A8073; white-space: nowrap; overflow: hidden; }
.rf-rail-on .rf-rail-label { color: #FFFFFF; }
.rf-rail-done .rf-rail-label { color: #CFC6B8; }
.rf-sb-note { font-size: 11.5px; line-height: 1.4; color: #B8AE9F; }
.rf-sb-note:empty { display: none; }
.rf-sb-eta { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; font-size: 11px; color: #B8AE9F; border-top: 1px solid rgba(255,255,255,.12); padding-top: 8px; }
.rf-sb-eta b { font: 600 13px 'Martian Mono', ui-monospace, monospace; color: #FFFFFF; }
.rf-sb-next { width: 100%; justify-content: space-between; background: var(--accent) !important; border-color: var(--accent) !important; color: #FFFFFF !important; padding: 11px 12px; position: relative; z-index: 1; }
.rf-sb-next:hover { filter: brightness(1.08); }
.rf-sb-next-to { margin-left: auto; font-weight: 600; font-size: 12px; opacity: .85; overflow: hidden; text-overflow: ellipsis; }
.rf-sb-confirm { display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; line-height: 1.4; color: #FFE2C4; background: rgba(224,80,63,.16); border: 1px solid rgba(224,80,63,.4); padding: 10px; }
.rf-sb-confirm-actions { display: flex; gap: 8px; }
.rf-sb-confirm .rf-btn:not(.rf-btn-primary) { background: transparent; color: #F3EEE5; border-color: rgba(255,255,255,.3); }

/* voice */
.rf-say { gap: 8px; }
.rf-say-dot { width: 7px; height: 7px; border-radius: 50%; background: #C62F22; display: none; }
.rf-say-on { background: #C62F22 !important; border-color: #C62F22 !important; color: #FFFFFF !important; }
.rf-say-on .rf-say-dot { display: inline-block; background: #FFFFFF; animation: rf-blink 1s steps(2) infinite; }
.rf-ibtn-say.rf-say-on { animation: rf-pulse 1.4s ease-out infinite; }
.rf-btn.rf-btn-on { background: #1D1712; color: #FFFFFF; border-color: #1D1712; transition: none; }
.rf-btn.rf-btn-on:hover { background: #2B241D; }
.rf-voice { position: absolute; left: 50%; bottom: 112px; transform: translateX(-50%); z-index: 4; display: flex; align-items: center; gap: 14px; padding: 12px 18px; max-width: min(560px, calc(100% - 32px)); background: #1D1712; color: #F3EEE5; border-radius: 2px; box-shadow: 0 20px 40px -20px rgba(0,0,0,.5); animation: rf-rise .3s cubic-bezier(.2,.8,.2,1); }
.rf-voice-ok { border-left: 3px solid #6FBF8E; }
.rf-voice-err { border-left: 3px solid #E0503F; }
.rf-voice-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; font-size: 12px; color: #CFC6B8; }
.rf-voice-main b { font-size: 14px; color: #FFFFFF; font-weight: 800; }
.rf-voice-heard { font-style: italic; }
.rf-voice-wave { display: inline-flex; align-items: center; gap: 3px; height: 22px; }
.rf-voice-wave i { width: 3px; height: 100%; background: #E0503F; animation: rf-wave 1s ease-in-out infinite; }
.rf-voice-wave i:nth-child(2) { animation-delay: .1s; } .rf-voice-wave i:nth-child(3) { animation-delay: .2s; } .rf-voice-wave i:nth-child(4) { animation-delay: .3s; } .rf-voice-wave i:nth-child(5) { animation-delay: .4s; }
.rf-mobile .rf-voice { bottom: auto; top: calc(max(10px, env(safe-area-inset-top)) + 58px); }
@keyframes rf-wave { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
@keyframes rf-blink { 50% { opacity: .2; } }
@keyframes rf-pulse { 0% { box-shadow: 0 0 0 0 rgba(198,47,34,.5); } 100% { box-shadow: 0 0 0 12px rgba(198,47,34,0); } }
@keyframes rf-rise { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }

/* process editor */
.rf-proc-text { margin: 0; line-height: 1.45; }
.rf-proc-name { font: 800 17px Archivo, system-ui, sans-serif; padding: 9px 11px; border: 1px solid rgba(35,26,18,.18); border-radius: 2px; background: #FFFFFF; color: #231A12; }
.rf-proc-head, .rf-proc-row { display: grid; grid-template-columns: 26px 1fr 62px 62px; gap: 8px; align-items: center; }
.rf-proc-head { font-size: 9.5px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; color: #8C8073; }
.rf-proc-rows { display: flex; flex-direction: column; border-top: 1px solid #EDE3D3; }
.rf-proc-row { padding: 6px 0; border-bottom: 1px solid #EDE3D3; }
.rf-proc-row input { min-width: 0; font: 500 13.5px Archivo, system-ui, sans-serif; padding: 8px 9px; border: 1px solid rgba(35,26,18,.14); border-radius: 2px; background: #FFFFFF; color: #231A12; }
.rf-proc-row input:focus, .rf-proc-name:focus { outline: 2px solid var(--accent); outline-offset: 0; }
.rf-proc-num { font-family: 'Martian Mono', ui-monospace, monospace !important; text-align: right; -moz-appearance: textfield; }
.rf-proc-num::-webkit-outer-spin-button, .rf-proc-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.rf-proc-min { background: repeating-linear-gradient(135deg, #FFFFFF 0 3px, #F6F1E8 3px 6px) !important; }
.rf-proc-n { font: 600 10.5px 'Martian Mono', ui-monospace, monospace; color: var(--accent); }
.rf-proc-foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.rf-proc-redo { width: 100%; }
.rf-proc .rf-open { margin-top: auto; }
.rf-sheet-tools { display: inline-flex; gap: 10px; align-items: center; flex: none; }

/* a narrow computer or a tablet: icon buttons, no legend */
@media (max-width: 1180px) and (min-width: 761px) {
  .rf-actions .rf-btn { font-size: 0; gap: 0; width: 40px; height: 40px; padding: 0; }
  .rf-actions .rf-btn svg { width: 17px; height: 17px; }
  .rf-actions .rf-say-dot { display: none !important; }
  .rf-legend { display: none; }
  .rf-head { width: 300px; min-width: 260px; }
  .rf-panel { width: 420px; }
}

@media (prefers-reduced-motion: reduce) {
  .rf-root *, .rf-root *::before { animation: none !important; transition: none !important; }
}
`;
