'use dom';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';
import { accentColor, createRelief, type ReliefHandle } from '../../lib/relief/engine';
import { SCENE_CSS } from '../../lib/relief/sceneCss';
import type { ReliefCaps, ReliefData, ReliefDetails, ReliefItem, ReliefItemStatus, ReliefSection, ReliefSpec } from '../../lib/relief/types';
import type { ReliefCopy } from '../../lib/relief/copy';

// Cantia Relief, full screen: the 3D world (lib/relief/engine.ts) and what
// sits around it. On a computer: a header, the list on the left and the
// item's card on the right. On a phone: the world fills the screen and the
// list and the card live in a sheet at the bottom. The card is the item's
// whole file in Cantia, filtered by the member's rights: process step,
// tasks, the week's planning, quotes and invoices, and links to every part
// of the file. A DOM component: plain React DOM on the web, its own web view
// on phones.

const STATUS_COLOR: Record<ReliefItemStatus, string> = { ok: '#2E6B4F', risk: '#B07A12', late: '#AB3327', done: '#8C8073' };
const MOBILE = '(max-width: 760px)';
const DATE_LOCALE: Record<string, string> = { fr: 'fr-CH', de: 'de-CH', it: 'it-CH' };

type Tab = 'overview' | 'tasks' | 'planning' | 'money' | 'links';
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
  onNavigate: (route: string) => void;
  onClose: () => void;
  onRedo: () => void;
  dom?: DOMProps;
}

export default function ReliefDom(props: Props) {
  const { spec, data, copy, caps, rebuilding, onClose, onRedo } = props;
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ReliefHandle | null>(null);
  const firstData = useRef(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(MOBILE).matches);
  const [listOpen, setListOpen] = useState(true);
  const [sheet, setSheet] = useState<Sheet>('peek');
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  const accent = accentColor(spec);
  const vocab = spec.vocabulary;

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
    try {
      handleRef.current = createRelief(stageRef.current, spec, data, {
        onSelect: setSelectedId,
        baseLabel: `${vocab.place} · ${data.company}`,
        exampleLabel: copy.example,
        intro: true,
      });
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
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

  useEffect(() => {
    if (selectedId) setSheet('item');
    else setSheet((s) => (s === 'item' ? 'peek' : s));
  }, [selectedId]);

  // Height of the bottom sheet on a phone, so the world centres above it.
  const sheetHeight = sheet === 'item' ? Math.round(vh * 0.68) : sheet === 'list' ? Math.round(vh * 0.52) : 172;
  const item = data.items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    const h = handleRef.current;
    if (!h) return;
    if (mobile) h.setInsets({ top: 64, bottom: sheetHeight });
    else h.setInsets({ left: listOpen ? 352 : 0, right: item ? 472 : 0, top: 80, bottom: 56 });
  }, [mobile, sheetHeight, listOpen, item, spec]);

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
  const closeItem = () => handleRef.current?.select(null);
  const overview = () => {
    handleRef.current?.reset();
    if (mobile) setSheet('peek');
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

  return (
    <div className={`rf-root${mobile ? ' rf-mobile' : ''}`} style={{ ['--accent' as string]: accent }}>
      <style>{SCENE_CSS + CSS}</style>
      <div ref={stageRef} className="rf-stage" />
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
              <span className="rf-mbar-name">{spec.title}</span>
            </div>
            <button type="button" className="rf-ibtn" onClick={overview} aria-label={copy.overview}>
              <Icon name="home" />
            </button>
            {caps.redo ? (
              <button type="button" className="rf-ibtn" onClick={onRedo} disabled={rebuilding} aria-label={copy.redo}>
                <Icon name="redo" />
              </button>
            ) : null}
          </div>

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
            ) : (
              <div className="rf-sheet-body">
                <div className="rf-sheet-head">
                  <div>
                    <div className="rf-sheet-title">{fill(copy.listCount, { n: data.items.length, items: vocab.items })}</div>
                    {statsLine}
                  </div>
                  <button type="button" className="rf-chip" onClick={() => setSheet(sheet === 'peek' ? 'list' : 'peek')}>
                    {sheet === 'peek' ? copy.show : copy.hide}
                  </button>
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
              <div className="rf-head-main">
                <div className="rf-eyebrow">{copy.brand}</div>
                <div className="rf-title">{spec.title}</div>
                {spec.tagline ? <div className="rf-tagline">{spec.tagline}</div> : null}
              </div>
              <div className="rf-head-side">
                {statsLine}
                <span className="rf-muted">
                  {copy.today} · {data.today}
                </span>
              </div>
            </div>
            <div className="rf-actions">
              <button type="button" className="rf-btn" onClick={overview}>
                <Icon name="home" /> {copy.overview}
              </button>
              <button type="button" className="rf-btn" onClick={toggleAnim}>
                <Icon name={animated ? 'pause' : 'play'} /> {animated ? copy.pause : copy.play}
              </button>
              {caps.redo ? (
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

          {card ? <div className="rf-card rf-panel">{card}</div> : null}

          <div className="rf-legend">
            {(Object.keys(STATUS_COLOR) as ReliefItemStatus[]).map((k) => (
              <span key={k} className="rf-legend-item">
                <span className="rf-dot" style={{ background: STATUS_COLOR[k] }} />
                {copy.status[k]}
              </span>
            ))}
            <span className="rf-hint">{copy.hint}</span>
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
  onNavigate,
  onCloseItem,
}: Props & { item: ReliefItem; mobile: boolean; onCloseItem: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(!item.example);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const stages = spec.stages;
  const current = stages[Math.min(stages.length - 1, item.stage)];
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
        <span className="rf-badge rf-badge-soft">
          {copy.currentStage} · {current?.label}
        </span>
      </div>

      <div className="rf-steps" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
        {stages.map((s, i) => (
          <div key={s.label + i} className={`rf-step${i < item.stage || item.status === 'done' ? ' rf-step-done' : ''}${i === item.stage && item.status !== 'done' ? ' rf-step-on' : ''}`} title={s.label}>
            <span className="rf-step-bar" />
          </div>
        ))}
      </div>

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

function Overview({ item, spec, data, copy, details, caps }: { item: ReliefItem; spec: ReliefSpec; data: ReliefData; copy: ReliefCopy; details: ReliefDetails | null; caps: Props['caps'] }) {
  const crew = item.crew.map((id) => data.people.find((p) => p.id === id)).filter(Boolean) as ReliefData['people'];
  const invoiced = details?.factures?.reduce((s, f) => s + (f.status === 'draft' || f.status === 'cancelled' ? 0 : f.total), 0) ?? item.money?.invoiced ?? 0;
  const paid = details?.factures?.reduce((s, f) => s + f.paid, 0) ?? 0;
  return (
    <div className="rf-ov">
      <ol className="rf-timeline">
        {spec.stages.map((s, i) => {
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
.rf-root { position: relative; flex: 1; width: 100%; height: 100%; min-height: 100%; overflow: hidden; background: #EFE8DC; font-family: Archivo, system-ui, -apple-system, sans-serif; color: #231A12; -webkit-font-smoothing: antialiased; }
.rf-root * { box-sizing: border-box; }
.rf-stage { position: absolute; inset: 0; z-index: 0; touch-action: none; }
.rf-top, .rf-side, .rf-panel, .rf-legend, .rf-mbar, .rf-sheet { z-index: 2; }
.rf-card { background: #FFFDF9; border: 1px solid rgba(35,26,18,0.1); border-radius: 12px; box-shadow: 0 12px 34px rgba(43,33,26,0.12); }
.rf-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rf-muted { font-size: 12px; color: #6E6153; }
.rf-small { font-size: 11.5px; }
.rf-pad { padding: 8px 2px; }
.rf-note { font-size: 12px; line-height: 1.45; color: #6E6153; background: #F6F0E6; border-radius: 8px; padding: 8px 10px; margin: 6px 8px; }
.rf-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; display: inline-block; }
.rf-stats { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; color: #4A3F35; }
.rf-stats b { font-family: 'Martian Mono', ui-monospace, monospace; font-weight: 600; color: #231A12; }
.rf-late, .rf-late b { color: #AB3327 !important; }
@keyframes rf-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes rf-slide { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }
@keyframes rf-shimmer { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }

/* buttons */
.rf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; font: 700 13px Archivo, system-ui, sans-serif; padding: 9px 13px; border-radius: 8px; border: 1px solid rgba(35,26,18,0.14); background: #FFFDF9; color: #231A12; cursor: pointer; box-shadow: 0 4px 14px rgba(43,33,26,0.08); white-space: nowrap; transition: transform .15s, background .15s, box-shadow .15s; }
.rf-btn:hover { background: #F6EFE3; transform: translateY(-1px); }
.rf-btn:active { transform: none; }
.rf-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.rf-btn:focus-visible, .rf-row:focus-visible, .rf-tab:focus-visible, .rf-ibtn:focus-visible, .rf-link:focus-visible, .rf-doc:focus-visible, .rf-mini:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rf-btn-dark { background: #16120E; color: #FFFFFF; border-color: #16120E; }
.rf-btn-dark:hover { background: #2B241D; }
.rf-btn-primary { background: var(--accent); border-color: var(--accent); color: #FFFFFF; }
.rf-btn-primary:hover { background: var(--accent); filter: brightness(0.93); }
.rf-ibtn { all: unset; box-sizing: border-box; width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; background: #FFFDF9; border: 1px solid rgba(35,26,18,0.12); box-shadow: 0 4px 14px rgba(43,33,26,0.12); cursor: pointer; color: #231A12; flex: none; }
.rf-ibtn:disabled { opacity: .45; }
.rf-ibtn-dark { background: #16120E; color: #FFFFFF; border-color: #16120E; }
.rf-ibtn-flat { width: 34px; height: 34px; box-shadow: none; border-color: transparent; background: transparent; color: #6E6153; }
.rf-ibtn-flat:hover { background: #F6EFE3; }
.rf-chip { all: unset; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--accent); padding: 6px 10px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 10%, #FFFFFF); }

/* desktop frame */
.rf-top { position: absolute; left: 16px; right: 16px; top: 16px; display: flex; gap: 12px; align-items: flex-start; pointer-events: none; }
.rf-top > * { pointer-events: auto; }
.rf-head { display: flex; gap: 22px; align-items: flex-end; padding: 12px 16px; max-width: min(760px, 100% - 420px); animation: rf-fade .35s ease-out; }
.rf-head-main { min-width: 0; }
.rf-title { font-size: 19px; font-weight: 800; letter-spacing: -0.3px; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-tagline { font-size: 12.5px; line-height: 1.4; color: #4A3F35; margin-top: 2px; max-width: 420px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rf-head-side { display: flex; flex-direction: column; gap: 4px; flex: none; }
.rf-actions { margin-left: auto; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }

.rf-side { position: absolute; left: 16px; top: 128px; bottom: 64px; width: 320px; display: flex; flex-direction: column; overflow: hidden; animation: rf-fade .4s ease-out; }
.rf-side-closed { bottom: auto; }
.rf-side-head { all: unset; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; cursor: pointer; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
.rf-side-head > span:first-child { display: inline-flex; align-items: center; gap: 8px; }
.rf-side-head .rf-muted { text-transform: none; letter-spacing: 0; font-weight: 600; }
.rf-rows { overflow: auto; padding: 4px 6px 8px; min-height: 0; }
.rf-row { all: unset; box-sizing: border-box; display: grid; grid-template-columns: auto 1fr 54px; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 8px; cursor: pointer; animation: rf-fade .3s ease-out both; }
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
.rf-legend { position: absolute; left: 352px; right: 472px; bottom: 16px; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 14px; font-size: 11.5px; font-weight: 600; color: #4A3F35; pointer-events: none; text-shadow: 0 1px 0 rgba(255,255,255,0.6); }
.rf-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.rf-hint { color: #8C8073; font-weight: 500; }

/* card */
.rf-panel-top { display: flex; justify-content: space-between; gap: 12px; }
.rf-panel-title { font-size: 21px; font-weight: 800; letter-spacing: -0.4px; margin-top: 4px; line-height: 1.15; }
.rf-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.rf-badge { font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; border: 1px solid; }
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
.rf-tab-badge { font-family: 'Martian Mono', ui-monospace, monospace; font-size: 10.5px; background: var(--accent); color: #FFFFFF; border-radius: 999px; padding: 1px 6px; }
.rf-tabbody { display: flex; flex-direction: column; gap: 10px; animation: rf-fade .25s ease-out; }
.rf-skeleton { height: 120px; border-radius: 10px; background: linear-gradient(90deg, #F3ECE1 0, #FAF6EF 40%, #F3ECE1 80%); background-size: 600px 100%; animation: rf-shimmer 1.2s linear infinite; }
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
.rf-tl-client { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--accent); border: 1px solid currentColor; border-radius: 999px; padding: 1px 6px; }
.rf-tl-meta { font-size: 11.5px; color: #8C8073; }

.rf-figures { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rf-figure { border: 1px solid #EDE3D3; border-radius: 9px; padding: 9px 10px; background: #FFFFFF; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
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
.rf-inline input, .rf-planform select { flex: 1; min-width: 0; font: 500 14px Archivo, system-ui, sans-serif; padding: 9px 11px; border-radius: 8px; border: 1px solid rgba(35,26,18,0.18); background: #FFFFFF; color: #231A12; }
.rf-inline input:focus, .rf-planform select:focus { outline: 2px solid var(--accent); outline-offset: 0; }

.rf-grid-wrap { overflow-x: auto; border: 1px solid #EDE3D3; border-radius: 10px; background: #FFFFFF; }
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
.rf-doc { all: unset; box-sizing: border-box; cursor: pointer; display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 10px; padding: 10px; border-radius: 9px; border: 1px solid #EDE3D3; background: #FFFFFF; transition: border-color .15s, transform .15s; animation: rf-fade .25s ease-out; }
.rf-doc:hover { border-color: var(--accent); transform: translateY(-1px); }
.rf-doc-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.rf-doc-num { font: 600 12.5px 'Martian Mono', ui-monospace, monospace; }
.rf-doc-meta { font-size: 11px; color: #8C8073; }
.rf-doc-bar { display: block; height: 3px; border-radius: 2px; background: #EDE3D3; overflow: hidden; }
.rf-doc-bar > span { display: block; height: 100%; background: #2E6B4F; }
.rf-doc-amount { font: 600 12.5px 'Martian Mono', ui-monospace, monospace; text-align: right; display: flex; flex-direction: column; gap: 2px; }
.rf-doc-amount small { font: 500 10.5px Archivo, system-ui, sans-serif; color: #AB3327; }
.rf-pill { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: #F3ECE1; color: #4A3F35; white-space: nowrap; }
.rf-pill-accepted, .rf-pill-paid { background: #E3EFE7; color: #2E6B4F; }
.rf-pill-sent, .rf-pill-ready { background: #E6EEF3; color: #2F5E7A; }
.rf-pill-partial { background: #F6EBD6; color: #8A5E0E; }
.rf-pill-refused, .rf-pill-cancelled { background: #F5E2DF; color: #AB3327; }
.rf-figures-money { margin-top: 6px; }

.rf-links { display: flex; flex-direction: column; gap: 6px; }
.rf-link { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; border: 1px solid #EDE3D3; background: #FFFFFF; font-size: 13.5px; font-weight: 600; transition: border-color .15s, transform .15s; animation: rf-fade .25s ease-out both; }
.rf-link:hover { border-color: var(--accent); transform: translateX(2px); }
.rf-link-icon { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: color-mix(in srgb, var(--accent) 12%, #FFFFFF); color: var(--accent); flex: none; }
.rf-link-label { flex: 1; }
.rf-link-count { font: 600 11.5px 'Martian Mono', ui-monospace, monospace; color: #6E6153; }
.rf-example-box { display: flex; flex-direction: column; gap: 10px; background: #F6F0E6; border-radius: 10px; padding: 12px; font-size: 13px; line-height: 1.45; color: #4A3F35; }
.rf-example-box p { margin: 0; }
.rf-message { font-size: 12.5px; color: #2E6B4F; animation: rf-fade .2s ease-out; }
.rf-message-err { color: #AB3327; }
.rf-open { width: 100%; padding: 12px; margin-top: auto; }
.rf-error { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center; text-align: center; padding: 24px; font-size: 14px; color: #6E6153; z-index: 3; }

/* phone */
.rf-mbar { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; gap: 8px; padding: max(10px, env(safe-area-inset-top)) 12px 10px; background: linear-gradient(#EFE8DC 70%, rgba(239,232,220,0)); }
.rf-mbar-title { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rf-mbar-name { font-size: 15px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-sheet { position: absolute; left: 0; right: 0; bottom: 0; background: #FFFDF9; border-radius: 18px 18px 0 0; box-shadow: 0 -10px 30px rgba(43,33,26,0.16); display: flex; flex-direction: column; transition: height .32s cubic-bezier(.2,.8,.2,1); padding-bottom: env(safe-area-inset-bottom); }
.rf-grab { all: unset; cursor: pointer; display: grid; place-items: center; height: 22px; flex: none; }
.rf-grab span { width: 40px; height: 5px; border-radius: 3px; background: #D9CFC0; }
.rf-sheet-body { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.rf-sheet-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; padding: 0 16px 8px; }
.rf-sheet-title { font-size: 16px; font-weight: 800; text-transform: capitalize; margin-bottom: 2px; }
.rf-strip { display: flex; gap: 10px; overflow-x: auto; padding: 4px 16px 12px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.rf-strip::-webkit-scrollbar { display: none; }
.rf-mini { all: unset; box-sizing: border-box; cursor: pointer; flex: 0 0 72%; max-width: 260px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 11px 12px; border-radius: 12px; border: 1px solid #EDE3D3; background: #FFFFFF; }
.rf-mini-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.rf-mini-name { font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rf-mini-meta { font-size: 11.5px; color: #6E6153; }
.rf-mobile .rf-rows { padding: 0 10px 12px; overflow: auto; flex: 1; }
.rf-mobile .rf-cardin { padding: 4px 16px 0; }
.rf-mobile .rf-tabs { position: sticky; top: -4px; z-index: 1; background: #FFFDF9; }
.rf-mobile .rf-panel-title { font-size: 19px; }
.rf-mobile .rf-tab { font-size: 12.5px; padding: 8px 8px 9px; }
.rf-open-m { position: sticky; bottom: 0; margin-bottom: 12px; box-shadow: 0 -10px 18px 8px #FFFDF9; }

@media (prefers-reduced-motion: reduce) {
  .rf-root *, .rf-root *::before { animation: none !important; transition: none !important; }
}
`;
