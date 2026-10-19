'use dom';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DOMProps } from 'expo/dom';
import { createGlobe, type GlobeHandle, type GlobePoint } from '../../lib/relief/globe';
import { newKindId, roleOptions, suggestedTemplate, withKinds } from '../../lib/relief/process';
import { ACCENT_HEX, PALETTE, initials, previewData, previewSpec } from '../../lib/relief/preview';
import type { ReliefAnswerStage, ReliefAnswers, ReliefBilling, ReliefMember, ReliefTemplate } from '../../lib/relief/types';
import type { ReliefCopy } from '../../lib/relief/copy';
import type { ReliefGeo } from '../../lib/relief/geo';

// The onboarding of Cantia Maquette, with the world drawn live next to it.
// It starts from the company's website when there is one: the site is read
// (supabase/functions/relief-prefill) and every answer comes prefilled — the
// kinds of projects the company sells, the steps of each with their usual
// and minimum durations, how it invoices. The owner then checks each step:
// activity, process per kind of project, the team's roles, quotes and
// invoices, anything else by voice. Then the wait while the AI builds the
// world, and the screen when it could not.

type Locale = 'fr' | 'de' | 'it';
type Step = 'welcome' | 0 | 1 | 2 | 3 | 4 | 'recap';
const STEPS: Step[] = ['welcome', 0, 1, 2, 3, 4, 'recap'];
const BILLING: ReliefBilling[] = ['end', 'deposit', 'milestones', 'monthly'];
const MAX_KINDS = 4;
const MAX_STAGES = 8;

type Kind = NonNullable<ReliefAnswers['kinds']>[number];
export type ReliefPrefillResult = {
  website: string;
  pages: { url: string; title: string }[];
  activity: string;
  template: ReliefAnswers['template'];
  understood: string[];
  kinds: Kind[];
  billing: ReliefBilling;
  quotes: boolean;
  story: string;
};

function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

const hostOf = (url: string) => url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');

interface Props {
  copy: ReliefCopy;
  locale: Locale;
  company: string;
  trade: string | null;
  workTerm: { item: string; items: string };
  members: ReliefMember[];
  answers: ReliefAnswers;
  /** The company's website as known in Cantia, to offer reading it. */
  website: string | null;
  mode: 'onboarding' | 'building' | 'failed';
  skipWelcome: boolean;
  listening: boolean;
  transcribing: boolean;
  /** Text dictated since the last change, with a counter so repeats show. */
  dictated: { seq: number; text: string };
  onToggleDictation: () => Promise<string | null>;
  onPrefill: (url: string) => Promise<{ data: ReliefPrefillResult | null; error: string | null }>;
  onSubmit: (answers: ReliefAnswers) => Promise<string | null>;
  onRetry: () => void;
  onEdit: () => void;
  onClose: () => void;
  geo?: ReliefGeo | null;
  dom?: DOMProps;
}

type Scan = { phase: 'idle' } | { phase: 'reading'; site: string; t0: number } | { phase: 'done'; result: ReliefPrefillResult } | { phase: 'failed'; site: string; error: string };

// ------------------------------------------------------------- component

export default function ReliefOnboardingDom(props: Props) {
  const { copy, locale, company, trade, workTerm, mode, onClose } = props;
  const [a, setA] = useState<ReliefAnswers>(() => withKinds(props.answers, workTerm.item));
  const [step, setStep] = useState<Step>(props.skipWelcome ? 0 : 'welcome');
  const [dir, setDir] = useState<1 | -1>(1);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [kindIdx, setKindIdx] = useState(0);
  const [site, setSite] = useState(props.answers.website || props.website || '');
  const [scan, setScan] = useState<Scan>({ phase: 'idle' });
  const [prefilled, setPrefilled] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const relief = useRef<GlobeHandle | null>(null);
  const lastSeq = useRef(props.dictated.seq);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 860px)').matches);

  const kinds = a.kinds ?? [];
  const kind = kinds[Math.min(kindIdx, kinds.length - 1)] ?? kinds[0];
  const spec = useMemo(() => previewSpec(a, trade, company, workTerm), [a, trade, company, workTerm]);
  const accent = ACCENT_HEX[spec.accent];
  const specKey = `${spec.template}|${kinds.map((k) => `${k.name}:${k.stages.map((s) => s.label).join(',')}`).join('|')}|${a.team.length}`;
  const item = workTerm.item;

  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 860px)');
    const on = () => setMobile(!!mq?.matches);
    mq?.addEventListener?.('change', on);
    return () => mq?.removeEventListener?.('change', on);
  }, []);

  // The live preview: the planet turning, then diving to the company, with
  // example lights around the head office that follow the answers.
  const hq = props.geo?.lat != null && props.geo.lon != null ? { lat: props.geo.lat, lon: props.geo.lon } : null;
  const previewPoints = (): GlobePoint[] => {
    const at = hq ?? { lat: 46.948, lon: 7.447 };
    return previewData(spec, a, company).items.map((it) => ({ id: it.id, lat: at.lat, lon: at.lon, status: it.status, crew: it.crew.length }));
  };
  useEffect(() => {
    if (!stageRef.current) return;
    try {
      relief.current = createGlobe(stageRef.current, { mode: 'card', accent: '#F2B880', points: previewPoints(), hq, still: !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches });
    } catch {
      relief.current = null;
    }
    return () => {
      relief.current?.dispose();
      relief.current = null;
    };
    // Made once; the head office moves when the town is known (looked up after the first paint).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => relief.current?.update(previewPoints(), hq), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey, hq?.lat, hq?.lon]);

  // The reading checklist advances on its own while the site is read.
  useEffect(() => {
    if (scan.phase !== 'reading') return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [scan.phase]);

  // Keep the world centred in the part of the screen the form leaves free.
  useEffect(() => {
    const h = relief.current;
    if (!h) return;
    if (mobile) h.setInsets({ bottom: step === 'welcome' && mode === 'onboarding' ? Math.round(window.innerHeight * 0.62) : 0, top: 40 });
    else h.setInsets({ left: 600 });
  }, [mobile, step, mode]);

  // Dictated text lands in the story.
  useEffect(() => {
    if (props.dictated.seq === lastSeq.current) return;
    lastSeq.current = props.dictated.seq;
    const text = props.dictated.text.trim();
    if (text) setA((x) => ({ ...x, story: x.story.trim() ? `${x.story.trim()} ${text}` : text }));
  }, [props.dictated]);

  const set = <K extends keyof ReliefAnswers>(k: K, v: ReliefAnswers[K]) => setA((x) => ({ ...x, [k]: v }));
  const setKinds = (fn: (ks: Kind[]) => Kind[]) =>
    setA((x) => {
      const next = fn(x.kinds ?? []);
      return { ...x, kinds: next, stages: next[0]?.stages ?? x.stages };
    });
  const setKind = (patch: Partial<Kind>) => setKinds((ks) => ks.map((k, i) => (i === kindIdx ? { ...k, ...patch } : k)));
  const setStages = (fn: (st: ReliefAnswerStage[]) => ReliefAnswerStage[]) => setKinds((ks) => ks.map((k, i) => (i === kindIdx ? { ...k, stages: fn(k.stages) } : k)));
  const setStage = (i: number, patch: Partial<ReliefAnswerStage>) =>
    setStages((st) =>
      st.map((s, j) => {
        if (j !== i) return s;
        const next = { ...s, ...patch };
        // The minimum never exceeds the usual length: whichever was typed wins.
        if (next.minDays && next.days && next.minDays > next.days) {
          if ('days' in patch) next.minDays = next.days;
          else next.days = next.minDays;
        }
        return next;
      }),
    );
  const moveStage = (i: number, d: -1 | 1) =>
    setStages((st) => {
      const s = [...st];
      const j = i + d;
      if (j < 0 || j >= s.length) return st;
      [s[i], s[j]] = [s[j], s[i]];
      return s;
    });

  const kindValid = (k: Kind) => !!k.name.trim() && k.stages.filter((s) => s.label.trim()).length >= 3 && k.stages.every((s) => s.label.trim());
  const validStages = kinds.length > 0 && kinds.every(kindValid);
  const canNext = step === 0 ? a.activity.trim().length >= 4 : step === 1 ? validStages : true;
  const idx = STEPS.indexOf(step);
  const go = (to: Step) => {
    setDir(STEPS.indexOf(to) > idx ? 1 : -1);
    setError(null);
    setStep(to);
  };

  // Each step starts at its top.
  useEffect(() => {
    if (handleRef.current) handleRef.current.scrollTop = 0;
  }, [step, mode, scan.phase]);
  const next = () => {
    if (step === 1 && !validStages) {
      setError(copy.obMinStages);
      return;
    }
    if (idx < STEPS.length - 1) go(STEPS[idx + 1]);
  };
  const back = () => idx > 0 && go(STEPS[idx - 1]);

  const submit = async () => {
    setSending(true);
    setError(null);
    const ks = kinds.map((k) => ({ ...k, name: k.name.trim(), stages: k.stages.filter((s) => s.label.trim()) }));
    const err = await props.onSubmit({ ...a, kinds: ks, stages: ks[0].stages, website: a.website || undefined });
    setSending(false);
    if (err) setError(err);
  };

  const mic = async () => {
    setError(null);
    const err = await props.onToggleDictation();
    if (err) setError(err);
  };

  const readSite = async () => {
    const url = site.trim();
    if (!url) return;
    setError(null);
    setScan({ phase: 'reading', site: hostOf(url), t0: Date.now() });
    setNow(Date.now());
    const res = await props.onPrefill(url);
    if (!res.data || res.error) {
      setScan({ phase: 'failed', site: hostOf(url), error: res.error ?? '' });
      return;
    }
    const r = res.data;
    setA((x) => {
      const ks = r.kinds.length ? r.kinds.map((k) => ({ ...k, id: newKindId() })) : (x.kinds ?? []);
      return {
        ...x,
        website: r.website,
        activity: r.activity || x.activity,
        template: r.template && r.template !== 'auto' ? r.template : x.template,
        kinds: ks,
        stages: ks[0]?.stages ?? x.stages,
        billing: r.billing,
        quotes: r.quotes,
        story: r.story || x.story,
      };
    });
    setKindIdx(0);
    setPrefilled(true);
    setScan({ phase: 'done', result: r });
  };

  const roles = roleOptions(locale);
  const shownTemplate = a.template === 'auto' ? suggestedTemplate(trade) : a.template;
  const totals = (k: Kind) => {
    const days = k.stages.reduce((s, x) => s + (Number(x.days) || 0), 0);
    const min = k.stages.reduce((s, x) => s + (Number(x.minDays ?? x.days) || 0), 0);
    return { days, min, weeks: Math.max(1, Math.round(days / 5)), checks: k.stages.filter((s) => s.client).length };
  };
  const tag = prefilled ? <span className="ob-from-site">{copy.obPrefilled}</span> : null;

  // ------------------------------------------------------------- panels

  const header =
    mode === 'onboarding' && typeof step === 'number' ? (
      <div className="ob-progress">
        <div className="ob-progress-top">
          <span className="ob-eyebrow">{fill(copy.obStepOf, { n: step + 1, total: 5 })}</span>
          <span className="ob-progress-name">{copy.obStepNames[step]}</span>
        </div>
        <div className="ob-bars">
          {copy.obStepNames.map((n, i) => (
            <button key={n} type="button" className={`ob-bar${i < step ? ' ob-bar-done' : ''}${i === step ? ' ob-bar-on' : ''}`} onClick={() => (i < step ? go(i as Step) : undefined)} aria-label={n}>
              <span />
            </button>
          ))}
        </div>
      </div>
    ) : null;

  let body: ReactNode = null;
  if (mode === 'building') {
    body = (
      <div className="ob-body ob-center">
        <div className="ob-pulse" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="ob-eyebrow">{copy.brand}</div>
        <h1 className="ob-h1">{copy.buildingTitle}</h1>
        <p className="ob-lead">{copy.buildingText}</p>
        <div className="ob-what">
          <div className="ob-label">{copy.buildingWhatTitle}</div>
          {copy.buildingWhat.map((w, i) => (
            <div key={w} className="ob-what-row" style={{ animationDelay: `${i * 1.6}s` }}>
              <span className="ob-what-dot" />
              {fill(w, { items: workTerm.items })}
            </div>
          ))}
        </div>
        <p className="ob-note">{copy.buildingEmail}</p>
        <button type="button" className="ob-btn" onClick={onClose}>
          {copy.close}
        </button>
      </div>
    );
  } else if (mode === 'failed') {
    body = (
      <div className="ob-body ob-center">
        <div className="ob-eyebrow">{copy.brand}</div>
        <h1 className="ob-h1">{copy.failedTitle}</h1>
        <p className="ob-lead">{copy.failedText}</p>
        <div className="ob-row">
          <button type="button" className="ob-btn ob-btn-primary" onClick={props.onRetry}>
            {copy.retry}
          </button>
          <button type="button" className="ob-btn" onClick={props.onEdit}>
            {copy.edit}
          </button>
        </div>
      </div>
    );
  } else if (step === 'welcome' && scan.phase === 'reading') {
    // Each line of the checklist takes its turn; the last one waits for the answer.
    const elapsed = (now - scan.t0) / 1000;
    const lines = copy.obScanSteps.map((l) => fill(l, { items: workTerm.items }));
    const active = Math.min(lines.length - 1, Math.floor(elapsed / 3.2));
    body = (
      <div className="ob-welcome ob-scan">
        <div className="ob-eyebrow">{copy.brand}</div>
        <h1 className="ob-h1">{fill(copy.obScanTitle, { site: scan.site })}</h1>
        <div className="ob-scan-url">
          <span className="ob-scan-caret" />
          https://{scan.site}
        </div>
        <ol className="ob-scan-list">
          {lines.map((l, i) => (
            <li key={l} className={i < active ? 'ob-scan-done' : i === active ? 'ob-scan-on' : ''}>
              <span className="ob-scan-mark">{i < active ? '✓' : String(i + 1).padStart(2, '0')}</span>
              <span className="ob-scan-label">{l}</span>
              <span className="ob-scan-bar">
                <span style={{ width: i < active ? '100%' : i === active ? `${Math.min(92, ((elapsed - i * 3.2) / 3.2) * 100)}%` : '0%' }} />
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  } else if (step === 'welcome' && scan.phase === 'done') {
    const r = scan.result;
    body = (
      <div className="ob-welcome ob-found">
        <div className="ob-eyebrow">
          {r.pages.length === 1 ? copy.obScanPage : fill(copy.obScanPages, { n: r.pages.length })} · {hostOf(r.website)}
        </div>
        <h1 className="ob-h1">{copy.obScanDone}</h1>
        {r.activity ? <p className="ob-lead ob-found-activity">{r.activity}</p> : null}
        {r.understood.length ? (
          <ol className="ob-found-list">
            {r.understood.map((u, i) => (
              <li key={u} style={{ animationDelay: `${i * 90}ms` }}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {u}
              </li>
            ))}
          </ol>
        ) : null}
        {kinds.length ? (
          <div className="ob-found-kinds">
            <div className="ob-label">{fill(copy.obScanKinds, { items: workTerm.items })}</div>
            {kinds.map((k, i) => {
              const t = totals(k);
              return (
                <div key={k.id} className="ob-found-kind" style={{ animationDelay: `${300 + i * 90}ms` }}>
                  <div className="ob-found-kind-top">
                    <b>{k.name}</b>
                    <span>{fill(copy.obTimeline, { days: t.days, weeks: t.weeks, min: t.min })}</span>
                  </div>
                  <Timeline stages={k.stages} compact />
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="ob-row">
          <button type="button" className="ob-btn ob-btn-primary ob-btn-big" onClick={() => go(0)}>
            {copy.obScanContinue} →
          </button>
        </div>
      </div>
    );
  } else if (step === 'welcome') {
    body = (
      <div className="ob-welcome">
        <div className="ob-eyebrow">{copy.obEyebrow}</div>
        <h1 className="ob-hero">
          {fill(copy.obWelcomeTitle, { company })
            .split(' ')
            .map((w, i) => (
              <span key={i} className="ob-word" style={{ animationDelay: `${120 + i * 60}ms` }}>
                {w}{' '}
              </span>
            ))}
        </h1>
        <p className="ob-lead">{fill(copy.obWelcomeText, { items: workTerm.items })}</p>
        <form
          className="ob-site"
          onSubmit={(e) => {
            e.preventDefault();
            readSite();
          }}
        >
          <div className="ob-site-head">
            <span className="ob-label">{copy.obSiteTitle}</span>
            <span className="ob-site-text">{fill(copy.obSiteText, { items: workTerm.items })}</span>
          </div>
          <div className="ob-site-row">
            <span className="ob-site-scheme">https://</span>
            <input className="ob-site-input" value={site.replace(/^https?:\/\//i, '')} onChange={(e) => setSite(e.target.value)} placeholder={copy.obSitePlaceholder} inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label={copy.obSiteTitle} />
            <button type="submit" className="ob-btn ob-btn-primary" disabled={site.trim().length < 4}>
              {copy.obSiteRead} →
            </button>
          </div>
          {scan.phase === 'failed' ? <div className="ob-error ob-error-in">{fill(copy.obScanFailed, { message: scan.error })}</div> : null}
        </form>
        <div className="ob-welcome-foot">
          <button type="button" className="ob-link" onClick={() => go(0)}>
            {scan.phase === 'failed' ? copy.obScanManual : copy.obSiteSkip} →
          </button>
          <span className="ob-points">
            {copy.obWelcomePoints.map((p) => (
              <span key={p} className="ob-point">
                {p}
              </span>
            ))}
          </span>
        </div>
      </div>
    );
  } else if (step === 0) {
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">
          {copy.obActivityTitle} {tag}
        </h2>
        <p className="ob-text">{copy.obActivityText}</p>
        <input className="ob-input ob-input-big" value={a.activity} onChange={(e) => set('activity', e.target.value)} placeholder={copy.obActivityPlaceholder} maxLength={200} />
        <div className="ob-label ob-gap">{copy.obModelTitle}</div>
        <div className="ob-models">
          {copy.models.map((m) => {
            const key = m.key as ReliefTemplate;
            const on = shownTemplate === key;
            return (
              <button key={m.key} type="button" className={`ob-model${on ? ' ob-model-on' : ''}`} onClick={() => set('template', key)} aria-pressed={on}>
                <ModelArt kind={key} />
                <span className="ob-model-title">
                  {m.title}
                  {a.template === 'auto' && on ? <span className="ob-tag">{copy.obSuggested}</span> : null}
                </span>
                <span className="ob-model-text">{m.text}</span>
              </button>
            );
          })}
        </div>
        <p className="ob-hint">{copy.modelsNote}</p>
      </div>
    );
  } else if (step === 1 && kind) {
    const t = totals(kind);
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">
          {copy.obProcessTitle} {tag}
        </h2>
        <p className="ob-text">{fill(copy.obKindsHint, { item })}</p>

        <div className="ob-kinds" role="tablist">
          {kinds.map((k, i) => (
            <button key={k.id} type="button" role="tab" aria-selected={i === kindIdx} className={`ob-kind${i === kindIdx ? ' ob-kind-on' : ''}${kindValid(k) ? '' : ' ob-kind-bad'}`} onClick={() => setKindIdx(i)}>
              <span className="ob-kind-n">{String(i + 1).padStart(2, '0')}</span>
              {k.name || copy.obKindNew}
            </button>
          ))}
          {kinds.length < MAX_KINDS ? (
            <button
              type="button"
              className="ob-kind ob-kind-add"
              onClick={() => {
                setKinds((ks) => [...ks, { id: newKindId(), name: copy.obKindNew, stages: kind.stages.map((s) => ({ ...s })) }]);
                setKindIdx(kinds.length);
              }}
            >
              + {copy.obKindAdd}
            </button>
          ) : null}
        </div>

        <div className="ob-kind-card">
          <div className="ob-kind-head">
            <input className="ob-input ob-kind-name" value={kind.name} onChange={(e) => setKind({ name: e.target.value })} aria-label={copy.obKindName} placeholder={copy.obKindName} maxLength={40} />
            {kinds.length > 1 ? (
              <button
                type="button"
                className="ob-link ob-link-muted"
                onClick={() => {
                  setKinds((ks) => ks.filter((_, i) => i !== kindIdx));
                  setKindIdx(0);
                }}
              >
                {copy.obKindRemove}
              </button>
            ) : null}
          </div>

          <Timeline stages={kind.stages} />
          <div className="ob-summary">
            {fill(copy.obTimeline, { days: t.days, weeks: t.weeks, min: t.min })}
            {t.checks ? ` · ${t.checks === 1 ? copy.obCheck : fill(copy.obChecks, { n: t.checks })}` : ''}
          </div>

          <div className="ob-grid-head" aria-hidden="true">
            <span />
            <span>{copy.obStageName}</span>
            <span>{copy.obStageUsual}</span>
            <span>{copy.obStageMin}</span>
            <span />
          </div>
          <div className="ob-stages">
            {kind.stages.map((s, i) => (
              <div key={`${kind.id}-${i}`} className="ob-stage" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="ob-stage-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="ob-stage-fields">
                  <input className="ob-input" value={s.label} onChange={(e) => setStage(i, { label: e.target.value })} placeholder={copy.obStageName} aria-label={copy.obStageName} maxLength={32} />
                  <div className="ob-stage-row">
                    <input className="ob-input ob-input-s" list="ob-roles" value={s.owner} onChange={(e) => setStage(i, { owner: e.target.value })} placeholder={copy.obStageOwner} aria-label={copy.obStageOwner} maxLength={40} />
                    <button type="button" className={`ob-toggle${s.client ? ' ob-toggle-on' : ''}`} onClick={() => setStage(i, { client: !s.client })} aria-pressed={s.client}>
                      {copy.obStageClient}
                    </button>
                  </div>
                </div>
                <label className="ob-days">
                  <span className="ob-days-l">{copy.obStageUsual}</span>
                  <input
                    className="ob-input ob-input-n"
                    type="number"
                    min={0}
                    max={365}
                    value={s.days || ''}
                    onChange={(e) => setStage(i, { days: Math.max(0, Math.min(365, Number(e.target.value) || 0)) })}
                    aria-label={`${copy.obStageUsual} (${copy.obDaysUnit})`}
                  />
                  <span>{copy.obDaysUnit}</span>
                </label>
                <label className="ob-days ob-days-min">
                  <span className="ob-days-l">{copy.obStageMin}</span>
                  <input
                    className="ob-input ob-input-n"
                    type="number"
                    min={0}
                    max={365}
                    value={s.minDays || ''}
                    onChange={(e) => setStage(i, { minDays: Math.max(0, Math.min(365, Number(e.target.value) || 0)) })}
                    aria-label={`${copy.obStageMin} (${copy.obDaysUnit})`}
                  />
                  <span>{copy.obDaysUnit}</span>
                </label>
                <div className="ob-stage-tools">
                  <button type="button" className="ob-mini" onClick={() => moveStage(i, -1)} disabled={i === 0} aria-label={copy.obUp}>
                    ↑
                  </button>
                  <button type="button" className="ob-mini" onClick={() => moveStage(i, 1)} disabled={i === kind.stages.length - 1} aria-label={copy.obDown}>
                    ↓
                  </button>
                  <button type="button" className="ob-mini" onClick={() => setStages((st) => st.filter((_, j) => j !== i))} disabled={kind.stages.length <= 3} aria-label={copy.obRemove}>
                    ×
                  </button>
                </div>
              </div>
            ))}
            <datalist id="ob-roles">
              {roles.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          {kind.stages.length < MAX_STAGES ? (
            <button type="button" className="ob-add" onClick={() => setStages((st) => [...st, { label: '', owner: '', days: 0, minDays: 0, client: false }])}>
              + {copy.obAddStage}
            </button>
          ) : null}
        </div>
      </div>
    );
  } else if (step === 2) {
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">{copy.obTeamTitle}</h2>
        <p className="ob-text">{fill(copy.obTeamText, { item })}</p>
        <div className="ob-team">
          {a.team.map((m, i) => (
            <div key={m.id} className="ob-member" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="ob-avatar" style={{ background: PALETTE[i % PALETTE.length] }}>
                {initials(m.name)}
              </span>
              <span className="ob-member-name">{m.name}</span>
              <input
                className="ob-input ob-input-s"
                list="ob-roles-team"
                value={m.job}
                onChange={(e) => set('team', a.team.map((x) => (x.id === m.id ? { ...x, job: e.target.value } : x)))}
                placeholder={copy.obJobPlaceholder}
                aria-label={`${m.name} · ${copy.obJobPlaceholder}`}
                maxLength={60}
              />
            </div>
          ))}
          <datalist id="ob-roles-team">
            {roles.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
        {a.team.length <= 1 ? <p className="ob-hint">{copy.obTeamAlone}</p> : null}
      </div>
    );
  } else if (step === 3) {
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">
          {copy.obWorkTitle} {tag}
        </h2>
        <div className="ob-label">{fill(copy.obQuotesTitle, { item })}</div>
        <div className="ob-seg">
          <button type="button" className={a.quotes ? 'ob-seg-on' : ''} onClick={() => set('quotes', true)}>
            {copy.obQuotesYes}
          </button>
          <button type="button" className={!a.quotes ? 'ob-seg-on' : ''} onClick={() => set('quotes', false)}>
            {copy.obQuotesNo}
          </button>
        </div>
        <div className="ob-label ob-gap">{copy.obBillingTitle}</div>
        <div className="ob-options">
          {BILLING.map((b, i) => (
            <button key={b} type="button" className={`ob-option${a.billing === b ? ' ob-option-on' : ''}`} onClick={() => set('billing', b)} style={{ animationDelay: `${i * 60}ms` }} aria-pressed={a.billing === b}>
              <span className="ob-radio" />
              <span>
                <b>{copy.billing[b].title}</b>
                <span>{copy.billing[b].text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  } else if (step === 4) {
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">
          {copy.obStoryTitle} {a.story && prefilled ? tag : null}
        </h2>
        <p className="ob-text">{copy.obStoryText}</p>
        <ul className="ob-questions">
          {copy.briefQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <div className="ob-story">
          <textarea className="ob-input ob-textarea" value={a.story} onChange={(e) => set('story', e.target.value)} placeholder={copy.briefPlaceholder} maxLength={4000} />
          <button type="button" className={`ob-micro${props.listening ? ' ob-micro-on' : ''}`} onClick={mic} disabled={props.transcribing}>
            <span className="ob-micro-dot" />
            {props.transcribing ? copy.transcribing : props.listening ? copy.stop : copy.dictate}
          </button>
        </div>
      </div>
    );
  } else {
    const model = copy.models.find((m) => m.key === shownTemplate);
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">{copy.obRecapTitle}</h2>
        <p className="ob-text">{copy.obRecapText}</p>
        <div className="ob-recap">
          <RecapCard title={copy.obActivityTitle} onEdit={() => go(0)} edit={copy.obEdit}>
            <p>{a.activity}</p>
            <p className="ob-muted">
              {copy.obRecapModel} : {model?.title}
              {a.template === 'auto' ? ` · ${copy.obRecapAuto}` : ''}
              {a.website ? ` · ${hostOf(a.website)}` : ''}
            </p>
          </RecapCard>
          <RecapCard title={kinds.length > 1 ? fill(copy.obKindsRecap, { n: kinds.length, items: workTerm.items }) : copy.obRecapProcess} onEdit={() => go(1)} edit={copy.obEdit}>
            {kinds.map((k) => {
              const tt = totals(k);
              return (
                <div key={k.id} className="ob-recap-kind">
                  <div className="ob-found-kind-top">
                    <b>{k.name}</b>
                    <span>{fill(copy.obTimeline, { days: tt.days, weeks: tt.weeks, min: tt.min })}</span>
                  </div>
                  <Timeline stages={k.stages} compact />
                </div>
              );
            })}
          </RecapCard>
          <RecapCard title={copy.obRecapTeam} onEdit={() => go(2)} edit={copy.obEdit}>
            <div className="ob-faces">
              {a.team.map((m, i) => (
                <span key={m.id} className="ob-face">
                  <span className="ob-avatar ob-avatar-s" style={{ background: PALETTE[i % PALETTE.length] }}>
                    {initials(m.name)}
                  </span>
                  {m.name}
                  {m.job ? <span className="ob-muted"> · {m.job}</span> : null}
                </span>
              ))}
            </div>
          </RecapCard>
          <RecapCard title={copy.obRecapWork} onEdit={() => go(3)} edit={copy.obEdit}>
            <p>
              {a.quotes ? copy.obQuotesShortYes : copy.obQuotesShortNo} · {copy.billing[a.billing].title}
            </p>
          </RecapCard>
        </div>
      </div>
    );
  }

  const footer =
    mode === 'onboarding' && step !== 'welcome' ? (
      <div className="ob-footer">
        <button type="button" className="ob-btn" onClick={back}>
          ← {copy.back}
        </button>
        {step === 'recap' ? (
          <button type="button" className="ob-btn ob-btn-primary" onClick={submit} disabled={sending}>
            {sending ? copy.obSending : copy.build}
          </button>
        ) : (
          <button type="button" className="ob-btn ob-btn-primary" onClick={next} disabled={!canNext}>
            {copy.obNext} →
          </button>
        )}
      </div>
    ) : null;

  const welcome = mode === 'onboarding' && step === 'welcome';
  const scanning = welcome && scan.phase === 'reading';

  return (
    <div className={`ob-root${mobile ? ' ob-m' : ''}${welcome ? ' ob-is-welcome' : ''}`} style={{ ['--accent' as string]: accent }}>
      <style>{CSS}</style>
      <div ref={stageRef} className="ob-world" />
      {scanning ? <div className="ob-sweep" aria-hidden="true" /> : null}
      <div className="ob-topbar">
        <span className="ob-brand">
          <span className="ob-brand-mark" />
          {copy.brand}
        </span>
        <span className="ob-live">
          <span className="ob-live-dot" />
          {copy.obPreview}
          {props.geo ? ` · ${props.geo.city}` : ''}
        </span>
        <button type="button" className="ob-close" onClick={onClose} aria-label={copy.close}>
          ×
        </button>
      </div>
      <div className={`ob-panel${welcome ? ' ob-panel-welcome' : ''}`} ref={handleRef}>
        {header}
        <div key={`${mode}-${String(step)}-${scan.phase}`} className={`ob-anim ${dir > 0 ? 'ob-in-r' : 'ob-in-l'}`}>
          {body}
        </div>
        {error ? <div className="ob-error">{error}</div> : null}
        {footer}
      </div>
    </div>
  );
}

// The process as a band: each step as wide as its usual length, the
// minimum marked inside, the client's validations as notches.
function Timeline({ stages, compact = false }: { stages: ReliefAnswerStage[]; compact?: boolean }) {
  const list = stages.filter((s) => s.label.trim());
  const total = list.reduce((s, x) => s + Math.max(1, x.days || 1), 0) || 1;
  return (
    <div className={`ob-tl${compact ? ' ob-tl-c' : ''}`}>
      <div className="ob-tl-band">
        {list.map((s, i) => {
          const w = (Math.max(1, s.days || 1) / total) * 100;
          const min = s.days && s.minDays ? Math.min(100, (s.minDays / s.days) * 100) : 0;
          return (
            <span key={`${s.label}-${i}`} className="ob-tl-seg" style={{ flexBasis: `${w}%`, animationDelay: `${i * 60}ms`, opacity: 0.55 + (0.45 * (i + 1)) / list.length }} title={`${s.label} · ${s.days || '—'}`}>
              {min ? <span className="ob-tl-min" style={{ width: `${min}%` }} /> : null}
              {s.client ? <span className="ob-tl-client" /> : null}
            </span>
          );
        })}
      </div>
      {compact ? (
        <div className="ob-tl-names">{list.map((s) => s.label).join(' → ')}</div>
      ) : (
        <div className="ob-tl-labels">
          {list.map((s, i) => (
            <span key={`${s.label}-${i}`} style={{ flexBasis: `${(Math.max(1, s.days || 1) / total) * 100}%` }}>
              <b>{s.label}</b>
              {s.days ? <i>{s.days}</i> : null}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RecapCard({ title, children, onEdit, edit }: { title: string; children: ReactNode; onEdit: () => void; edit: string }) {
  return (
    <div className="ob-recap-card">
      <div className="ob-recap-head">
        <span className="ob-label">{title}</span>
        <button type="button" className="ob-link" onClick={onEdit}>
          {edit}
        </button>
      </div>
      {children}
    </div>
  );
}

// Small drawings of the three models, in the scene's palette.
function ModelArt({ kind }: { kind: ReliefTemplate }) {
  return (
    <svg className="ob-art" viewBox="0 0 120 64" aria-hidden="true">
      <path d="M8 40 60 14l52 26-52 24z" fill={kind === 'atelier' ? '#DCD5CA' : '#B9C29A'} />
      <path d="M8 40v6l52 24v-6zM112 40v6L60 70v-6z" fill="#8E6E50" />
      {kind === 'territoire' ? (
        <>
          <path d="M24 40 60 22l34 17" stroke="#7D7871" strokeWidth="3" fill="none" />
          <path d="M70 26l10-12 10 12z" fill="#ADA69C" />
          <path d="M77 18l3-4 3 4z" fill="#F5F2EC" />
          <path d="M34 38l8-4 8 4v6l-8 4-8-4z" fill="#F3EEE6" />
          <path d="M34 38l8-6 8 6-8 3z" fill="var(--accent)" />
          <path d="M60 46l7-3 7 3v5l-7 3-7-3z" fill="#EAE0D0" />
          <circle cx="92" cy="44" r="4" fill="#859E66" />
          <circle cx="22" cy="44" r="3" fill="#66825E" />
        </>
      ) : kind === 'studio' ? (
        <>
          <path d="M40 30l10-5 10 5v14l-10 5-10-5z" fill="#F3EEE6" />
          <path d="M40 30l10 5v14l-10-5z" fill="#D2CCC2" />
          <path d="M62 22l10-5 10 5v22l-10 5-10-5z" fill="#F3EEE6" />
          <path d="M62 22l10 5v22l-10-5z" fill="#D2CCC2" />
          <path d="M62 22l10-5 10 5-10 5z" fill="var(--accent)" opacity=".6" />
          <path d="M84 36l8-4 8 4v6l-8 4-8-4z" fill="none" stroke="#B9AC98" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="30" cy="44" r="3.5" fill="#859E66" />
        </>
      ) : (
        <>
          <path d="M20 40 60 20l40 20" stroke="#BDB6AA" strokeWidth="2" fill="none" />
          <path d="M34 40l10-5 10 5-10 5z" fill="none" stroke="#E6C34F" strokeWidth="1.5" />
          <path d="M60 46l10-5 10 5-10 5z" fill="none" stroke="#E6C34F" strokeWidth="1.5" />
          <path d="M38 39l6-3 6 3v3l-6 3-6-3z" fill="#9AA6AE" />
          <path d="M64 45l6-3 6 3v3l-6 3-6-3z" fill="var(--accent)" />
          <path d="M84 34l6-3 6 3v4l-6 3-6-3z" fill="#B98A5E" />
        </>
      )}
    </svg>
  );
}

const CSS = `
.ob-root { --ink: #1D1712; --ink2: #4A3F35; --ink3: #7C7062; --paper: #FBF8F2; --rule: #E6DDCF; position: relative; width: 100%; height: 100%; min-height: 100%; overflow: hidden; background: #EFE8DC; font-family: Archivo, system-ui, -apple-system, sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }
.ob-root * { box-sizing: border-box; }
.ob-world { position: absolute; inset: 0; z-index: 0; background: radial-gradient(110% 90% at 65% 40%, #13213A 0%, #0A1222 45%, #050912 100%); }
.ob-sweep { position: absolute; left: 0; right: 0; top: 0; height: 32%; z-index: 1; pointer-events: none; background: linear-gradient(180deg, rgba(255,255,255,0), color-mix(in srgb, var(--accent) 18%, transparent) 85%, color-mix(in srgb, var(--accent) 70%, transparent) 99%, rgba(255,255,255,0)); animation: ob-sweep 2.6s cubic-bezier(.5,0,.5,1) infinite; }
.ob-topbar { position: absolute; left: 0; right: 0; top: 0; z-index: 3; display: flex; align-items: center; gap: 10px; padding: max(14px, env(safe-area-inset-top)) 18px 14px; pointer-events: none; }
.ob-topbar > * { pointer-events: auto; }
.ob-brand { display: inline-flex; align-items: center; gap: 9px; font-weight: 800; font-size: 13px; letter-spacing: .2px; background: var(--ink); color: #F6F2EA; padding: 9px 12px; border-radius: 2px; }
.ob-brand-mark { width: 9px; height: 9px; background: var(--accent); transition: background .6s; }
.ob-live { display: inline-flex; align-items: center; gap: 7px; font-size: 10.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink2); background: rgba(251,248,242,.9); padding: 8px 11px; border-radius: 2px; border: 1px solid rgba(29,23,18,.1); }
.ob-live-dot { width: 7px; height: 7px; background: #D2453B; animation: ob-blink 1.4s steps(2) infinite; }
.ob-close { all: unset; margin-left: auto; cursor: pointer; width: 38px; height: 38px; border-radius: 2px; display: grid; place-items: center; background: var(--paper); color: var(--ink); font-size: 22px; line-height: 1; border: 1px solid rgba(29,23,18,.14); }

.ob-panel { position: absolute; z-index: 2; left: 18px; top: 70px; bottom: 18px; width: 568px; display: flex; flex-direction: column; background: var(--paper); border-radius: 3px; border: 1px solid rgba(29,23,18,.12); box-shadow: 0 30px 60px -30px rgba(29,23,18,.35); overflow: auto; animation: ob-rise .5s cubic-bezier(.2,.8,.2,1); }
.ob-panel::before { content: ''; position: sticky; top: 0; display: block; height: 3px; flex: none; background: var(--accent); z-index: 2; }
.ob-panel-welcome .ob-anim { justify-content: center; }
.ob-anim { flex: 1; display: flex; flex-direction: column; }
.ob-in-r { animation: ob-from-r .38s cubic-bezier(.2,.8,.2,1); }
.ob-in-l { animation: ob-from-l .38s cubic-bezier(.2,.8,.2,1); }

.ob-progress { position: sticky; top: 3px; z-index: 1; background: var(--paper); padding: 16px 26px 12px; border-bottom: 1px solid var(--rule); }
.ob-progress-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.ob-progress-name { font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.ob-bars { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.ob-bar { all: unset; cursor: pointer; height: 3px; background: var(--rule); overflow: hidden; }
.ob-bar span { display: block; height: 100%; width: 0; background: var(--ink); transition: width .5s cubic-bezier(.2,.8,.2,1); }
.ob-bar-done span { width: 100%; }
.ob-bar-on span { width: 100%; background: var(--accent); }

.ob-body { padding: 24px 26px 8px; display: flex; flex-direction: column; gap: 12px; }
.ob-center { align-items: flex-start; padding-top: 30px; }
.ob-eyebrow { font-size: 10.5px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: var(--accent); }
.ob-label { font-size: 10.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: var(--ink2); }
.ob-gap { margin-top: 10px; }
.ob-h1 { font-size: 32px; line-height: 1.02; letter-spacing: -1px; font-weight: 900; margin: 0; text-wrap: balance; }
.ob-h2 { font-size: 27px; line-height: 1.08; letter-spacing: -.8px; font-weight: 900; margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; }
.ob-text, .ob-lead { font-size: 15px; line-height: 1.55; color: var(--ink2); margin: 0; max-width: 60ch; }
.ob-lead { font-size: 16px; }
.ob-hint, .ob-muted { font-size: 12.5px; color: var(--ink3); margin: 0; }
.ob-note { font-size: 13px; color: var(--ink2); margin: 4px 0 0; border-left: 2px solid var(--accent); padding: 4px 0 4px 12px; }
.ob-from-site { font: 700 9.5px 'Martian Mono', ui-monospace, monospace; letter-spacing: .4px; text-transform: uppercase; color: var(--accent); border: 1px solid currentColor; padding: 3px 6px; }

.ob-welcome { padding: 34px 32px 30px; display: flex; flex-direction: column; gap: 18px; }
.ob-hero { font-size: clamp(32px, 4.4vw, 48px); line-height: .98; letter-spacing: -1.6px; font-weight: 900; margin: 0; text-wrap: balance; }
.ob-word { display: inline-block; animation: ob-word .6s cubic-bezier(.2,.8,.2,1) both; white-space: pre; }
.ob-site { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: #FFFFFF; border: 1px solid var(--rule); animation: ob-fade .5s .45s ease-out both; }
.ob-site-head { display: flex; flex-direction: column; gap: 5px; }
.ob-site-text { font-size: 13.5px; line-height: 1.5; color: var(--ink2); }
.ob-site-row { display: flex; align-items: stretch; border: 1.5px solid var(--ink); background: #FFFFFF; }
.ob-site-row:focus-within { box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent); }
.ob-site-scheme { display: grid; place-items: center; padding: 0 0 0 12px; font: 500 13px 'Martian Mono', ui-monospace, monospace; color: var(--ink3); }
.ob-site-input { flex: 1; min-width: 0; border: 0; outline: 0; font: 500 15px 'Martian Mono', ui-monospace, monospace; padding: 13px 8px 13px 2px; color: var(--ink); background: transparent; }
.ob-site-row .ob-btn { border-radius: 0; border: 0; margin: 0; }
.ob-welcome-foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px 18px; animation: ob-fade .5s .7s ease-out both; }
.ob-points { display: inline-flex; flex-wrap: wrap; gap: 4px 14px; }
.ob-point { font-size: 12px; font-weight: 600; color: var(--ink3); display: inline-flex; align-items: center; gap: 6px; }
.ob-point::before { content: ''; width: 5px; height: 5px; background: var(--accent); }

.ob-scan-url { font: 500 13px 'Martian Mono', ui-monospace, monospace; color: var(--ink2); display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #FFFFFF; border: 1px solid var(--rule); }
.ob-scan-caret { width: 8px; height: 15px; background: var(--accent); animation: ob-blink 1s steps(2) infinite; }
.ob-scan-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
.ob-scan-list li { display: grid; grid-template-columns: 34px 1fr 90px; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--rule); color: var(--ink3); transition: color .3s; }
.ob-scan-list li.ob-scan-on, .ob-scan-list li.ob-scan-done { color: var(--ink); }
.ob-scan-mark { font: 600 11px 'Martian Mono', ui-monospace, monospace; }
.ob-scan-done .ob-scan-mark { color: var(--accent); }
.ob-scan-label { font-size: 14.5px; font-weight: 700; }
.ob-scan-bar { height: 3px; background: var(--rule); overflow: hidden; }
.ob-scan-bar span { display: block; height: 100%; background: var(--accent); transition: width .25s linear; }

.ob-found-activity { font-weight: 600; color: var(--ink); }
.ob-found-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.ob-found-list li { display: grid; grid-template-columns: 30px 1fr; gap: 10px; padding: 9px 0; border-top: 1px solid var(--rule); font-size: 14px; line-height: 1.45; animation: ob-fade .4s ease-out both; }
.ob-found-list li span { font: 600 11px 'Martian Mono', ui-monospace, monospace; color: var(--accent); padding-top: 2px; }
.ob-found-kinds { display: flex; flex-direction: column; gap: 10px; }
.ob-found-kind { padding: 12px; background: #FFFFFF; border: 1px solid var(--rule); display: flex; flex-direction: column; gap: 8px; animation: ob-fade .4s ease-out both; }
.ob-found-kind-top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 12px; }
.ob-found-kind-top b { font-size: 14.5px; }
.ob-found-kind-top span { font: 500 11px 'Martian Mono', ui-monospace, monospace; color: var(--ink3); }

.ob-input { width: 100%; font: 500 15px Archivo, system-ui, sans-serif; color: var(--ink); background: #FFFFFF; border: 1px solid #DCD2C3; border-radius: 2px; padding: 11px 12px; transition: border-color .15s, box-shadow .15s; }
.ob-input:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.ob-input-big { font-size: 17px; padding: 14px 14px; }
.ob-input-s { font-size: 13px; padding: 8px 10px; }
.ob-input-n { width: 54px; font-size: 13px; padding: 8px 6px; text-align: right; font-family: 'Martian Mono', ui-monospace, monospace; -moz-appearance: textfield; }
.ob-input-n::-webkit-outer-spin-button, .ob-input-n::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ob-textarea { min-height: 180px; resize: vertical; line-height: 1.5; padding-bottom: 52px; }

.ob-models { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ob-model { all: unset; box-sizing: border-box; cursor: pointer; display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 2px; border: 1px solid var(--rule); background: #FFFFFF; transition: border-color .2s, box-shadow .2s; }
.ob-model:hover { border-color: var(--ink3); }
.ob-model-on { border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
.ob-art { width: 100%; height: auto; transition: transform .4s; }
.ob-model-on .ob-art { transform: scale(1.06); }
.ob-model-title { font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ob-model-text { font-size: 12px; line-height: 1.4; color: var(--ink3); }
.ob-tag { font-size: 9.5px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #FFFFFF; background: var(--accent); padding: 2px 6px; }

/* kinds of projects */
.ob-kinds { display: flex; flex-wrap: wrap; gap: 0; border-bottom: 1px solid var(--rule); margin-top: 4px; }
.ob-kind { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 10px 12px 11px; font-size: 13.5px; font-weight: 700; color: var(--ink3); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .15s, border-color .15s; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ob-kind:hover { color: var(--ink); }
.ob-kind-on { color: var(--ink); border-bottom-color: var(--accent); }
.ob-kind-bad .ob-kind-n { color: #AB3327; }
.ob-kind-n { font: 600 10px 'Martian Mono', ui-monospace, monospace; color: var(--accent); }
.ob-kind-add { color: var(--accent); font-weight: 800; }
.ob-kind-card { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }
.ob-kind-head { display: flex; align-items: center; gap: 12px; }
.ob-kind-name { font-size: 18px; font-weight: 800; padding: 9px 11px; }
.ob-link { all: unset; cursor: pointer; font-size: 12.5px; font-weight: 800; color: var(--ink); border-bottom: 2px solid var(--accent); padding-bottom: 1px; white-space: nowrap; }
.ob-link-muted { color: var(--ink3); border-bottom-color: var(--rule); font-weight: 700; }

/* the process as a band */
.ob-tl { display: flex; flex-direction: column; gap: 6px; }
.ob-tl-band { display: flex; gap: 2px; height: 22px; }
.ob-tl-c .ob-tl-band { height: 10px; }
.ob-tl-seg { position: relative; flex-grow: 0; flex-shrink: 1; min-width: 6px; background: var(--accent); transform-origin: left; animation: ob-grow .5s cubic-bezier(.2,.8,.2,1) both; }
.ob-tl-min { position: absolute; left: 0; top: 0; bottom: 0; background: repeating-linear-gradient(135deg, rgba(255,255,255,.55) 0 2px, rgba(255,255,255,0) 2px 5px); }
.ob-tl-client { position: absolute; right: -2px; top: -4px; bottom: -4px; width: 2px; background: var(--ink); }
.ob-tl-labels { display: flex; gap: 2px; }
.ob-tl-labels span { min-width: 6px; flex-grow: 0; flex-shrink: 1; display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
.ob-tl-labels b { font-size: 10.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ob-tl-labels i { font: normal 500 10px 'Martian Mono', ui-monospace, monospace; color: var(--ink3); }
.ob-tl-names { font-size: 12px; color: var(--ink2); line-height: 1.45; }

.ob-grid-head { display: grid; grid-template-columns: 30px 1fr 66px 66px 28px; gap: 10px; padding: 8px 10px 0; font-size: 9.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink3); }
.ob-stages { display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
.ob-stage { display: grid; grid-template-columns: 30px 1fr 66px 66px 28px; gap: 10px; align-items: start; padding: 10px; border-bottom: 1px solid var(--rule); animation: ob-fade .35s ease-out both; }
.ob-stage:hover { background: #FFFFFF; }
.ob-stage-num { font: 600 11px 'Martian Mono', ui-monospace, monospace; color: var(--accent); padding-top: 13px; }
.ob-stage-fields { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ob-stage-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ob-stage-row .ob-input-s { flex: 1 1 140px; min-width: 0; }
.ob-days { display: inline-flex; align-items: center; gap: 4px; font: 500 10.5px 'Martian Mono', ui-monospace, monospace; color: var(--ink3); padding-top: 4px; }
.ob-days-l { display: none; font: 700 9.5px Archivo, system-ui, sans-serif; letter-spacing: .8px; text-transform: uppercase; color: var(--ink3); margin-right: 2px; }
.ob-days-min .ob-input-n { color: var(--ink2); background: repeating-linear-gradient(135deg, #FFFFFF 0 3px, #F6F1E8 3px 6px); }
.ob-toggle { all: unset; cursor: pointer; font-size: 11px; font-weight: 700; padding: 7px 9px; border: 1px solid #DCD2C3; color: var(--ink3); background: #FFFFFF; transition: all .15s; }
.ob-toggle-on { border-color: var(--ink); color: #FFFFFF; background: var(--ink); }
.ob-stage-tools { display: flex; flex-direction: column; gap: 3px; }
.ob-mini { all: unset; cursor: pointer; width: 26px; height: 22px; display: grid; place-items: center; font-size: 13px; color: var(--ink3); background: #FFFFFF; border: 1px solid var(--rule); }
.ob-mini:hover:not(:disabled) { color: var(--ink); border-color: var(--ink3); }
.ob-mini:disabled { opacity: .35; cursor: default; }
.ob-add { all: unset; cursor: pointer; align-self: flex-start; font-size: 13px; font-weight: 800; color: var(--accent); padding: 6px 2px; }
.ob-summary { font: 500 11.5px 'Martian Mono', ui-monospace, monospace; color: var(--ink2); }

.ob-team { display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
.ob-member { display: grid; grid-template-columns: 34px minmax(80px, 1fr) minmax(140px, 1.3fr); gap: 10px; align-items: center; padding: 9px 2px; border-bottom: 1px solid var(--rule); animation: ob-fade .35s ease-out both; }
.ob-member-name { font-weight: 700; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ob-avatar { width: 30px; height: 30px; border-radius: 50%; color: #FFFFFF; display: inline-grid; place-items: center; font-size: 11px; font-weight: 800; flex: none; }
.ob-avatar-s { width: 22px; height: 22px; font-size: 9px; }

.ob-seg { display: inline-grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--ink); align-self: flex-start; }
.ob-seg button { all: unset; cursor: pointer; padding: 9px 16px; font-size: 13.5px; font-weight: 700; color: var(--ink2); text-align: center; transition: all .2s; }
.ob-seg .ob-seg-on { background: var(--ink); color: #FFFFFF; }
.ob-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ob-option { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 10px; padding: 12px; border: 1px solid var(--rule); background: #FFFFFF; transition: all .2s; animation: ob-fade .35s ease-out both; }
.ob-option > span:last-child { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--ink3); line-height: 1.4; }
.ob-option b { font-size: 13.5px; color: var(--ink); }
.ob-option-on { border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
.ob-radio { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #CFC5B5; flex: none; margin-top: 1px; transition: all .2s; }
.ob-option-on .ob-radio { border: 5px solid var(--accent); }

.ob-questions { margin: 0; padding-left: 18px; font-size: 13.5px; color: var(--ink2); line-height: 1.6; }
.ob-story { position: relative; }
.ob-micro { all: unset; cursor: pointer; position: absolute; right: 10px; bottom: 12px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; padding: 9px 14px; background: var(--ink); color: #FFFFFF; }
.ob-micro:disabled { opacity: .6; }
.ob-micro-dot { width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF; }
.ob-micro-on { background: #C62F22; }
.ob-micro-on .ob-micro-dot { animation: ob-blink 1s infinite; }

.ob-recap { display: flex; flex-direction: column; gap: 10px; }
.ob-recap-card { border: 1px solid var(--rule); padding: 12px 14px; background: #FFFFFF; display: flex; flex-direction: column; gap: 8px; animation: ob-fade .35s ease-out both; }
.ob-recap-card p { margin: 0; font-size: 14px; line-height: 1.45; }
.ob-recap-head { display: flex; justify-content: space-between; align-items: center; }
.ob-recap-kind { display: flex; flex-direction: column; gap: 6px; padding-top: 6px; border-top: 1px solid var(--rule); }
.ob-recap-kind:first-of-type { border-top: 0; padding-top: 0; }
.ob-faces { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 13px; font-weight: 600; }
.ob-face { display: inline-flex; align-items: center; gap: 6px; }

.ob-what { display: flex; flex-direction: column; width: 100%; margin-top: 4px; border-top: 1px solid var(--rule); }
.ob-what .ob-label { padding: 10px 0 4px; }
.ob-what-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--ink2); padding: 10px 2px; border-bottom: 1px solid var(--rule); animation: ob-glow 6.4s ease-in-out infinite; }
.ob-what-dot { width: 7px; height: 7px; background: var(--accent); flex: none; }
.ob-pulse { position: relative; width: 52px; height: 52px; margin-bottom: 6px; }
.ob-pulse span { position: absolute; inset: 0; border: 1.5px solid var(--accent); animation: ob-ring 2.4s ease-out infinite; transform: rotate(45deg); }
.ob-pulse span:nth-child(2) { animation-delay: .8s; }
.ob-pulse span:nth-child(3) { animation-delay: 1.6s; }

.ob-footer { position: sticky; bottom: 0; margin-top: auto; display: flex; justify-content: space-between; gap: 10px; padding: 14px 26px 18px; background: linear-gradient(rgba(251,248,242,0), var(--paper) 30%); }
.ob-row { display: flex; flex-wrap: wrap; gap: 10px; }
.ob-btn { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 800; padding: 12px 18px; border-radius: 2px; border: 1px solid var(--ink); background: transparent; color: var(--ink); transition: background .15s, color .15s, filter .15s; white-space: nowrap; }
.ob-btn:hover { background: var(--ink); color: #FFFFFF; }
.ob-btn:disabled { opacity: .4; cursor: not-allowed; background: transparent; color: var(--ink); }
.ob-btn:focus-visible, .ob-model:focus-visible, .ob-option:focus-visible, .ob-toggle:focus-visible, .ob-mini:focus-visible, .ob-micro:focus-visible, .ob-close:focus-visible, .ob-bar:focus-visible, .ob-kind:focus-visible, .ob-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.ob-btn-primary { background: var(--accent); border-color: var(--accent); color: #FFFFFF; }
.ob-btn-primary:hover { background: var(--accent); color: #FFFFFF; filter: brightness(.92); }
.ob-btn-primary:disabled { background: var(--accent); color: #FFFFFF; }
.ob-btn-big { align-self: flex-start; font-size: 15px; padding: 14px 22px; }
.ob-error { margin: 0 26px; font-size: 13px; color: #AB3327; background: #F9E9E6; padding: 9px 12px; animation: ob-shake .35s; }
.ob-error-in { margin: 0; }

@keyframes ob-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes ob-from-r { from { opacity: 0; transform: translateX(26px); } to { opacity: 1; transform: none; } }
@keyframes ob-from-l { from { opacity: 0; transform: translateX(-26px); } to { opacity: 1; transform: none; } }
@keyframes ob-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes ob-word { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes ob-grow { from { transform: scaleX(0); } to { transform: none; } }
@keyframes ob-blink { 50% { opacity: .15; } }
@keyframes ob-ring { 0% { transform: rotate(45deg) scale(.4); opacity: 1; } 100% { transform: rotate(45deg) scale(1.25); opacity: 0; } }
@keyframes ob-glow { 0%, 100% { background: transparent; } 12%, 22% { background: color-mix(in srgb, var(--accent) 10%, #FFFFFF); } }
@keyframes ob-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
@keyframes ob-sweep { 0% { transform: translateY(-100%); } 100% { transform: translateY(320%); } }

/* phone: the world on top, the form below */
.ob-m .ob-world { bottom: auto; height: 34%; }
.ob-m.ob-is-welcome .ob-world { height: 100%; }
.ob-m .ob-live { display: none; }
.ob-m .ob-panel { left: 0; right: 0; width: auto; top: 32%; bottom: 0; border-radius: 0; border-left: 0; border-right: 0; animation: ob-rise .5s cubic-bezier(.2,.8,.2,1); }
.ob-m .ob-panel-welcome { left: 10px; right: 10px; top: auto; bottom: 10px; width: auto; max-height: calc(100% - 80px); justify-content: flex-start; background: rgba(251,248,242,.97); border: 1px solid rgba(29,23,18,.12); }
.ob-m .ob-welcome { padding: 22px 18px 20px; gap: 14px; }
.ob-m .ob-hero { font-size: 30px; }
.ob-m .ob-h1 { font-size: 26px; }
.ob-m .ob-body { padding: 18px 16px 8px; }
.ob-m .ob-progress { padding: 12px 16px 10px; }
.ob-m .ob-footer { padding: 12px 16px max(14px, env(safe-area-inset-bottom)); }
.ob-m .ob-models { grid-template-columns: 1fr; }
.ob-m .ob-model { display: grid; grid-template-columns: 96px 1fr; grid-template-rows: auto auto; column-gap: 12px; align-items: center; }
.ob-m .ob-art { grid-row: span 2; }
.ob-m .ob-options { grid-template-columns: 1fr; }
.ob-m .ob-member { grid-template-columns: 32px 1fr; }
.ob-m .ob-member .ob-input { grid-column: 1 / -1; }
.ob-m .ob-h2 { font-size: 23px; }
.ob-m .ob-btn { padding: 12px 14px; font-size: 14px; }
.ob-m .ob-site-scheme { display: none; }
.ob-m .ob-site-input { padding-left: 10px; font-size: 14px; }
.ob-m .ob-site-row .ob-btn { padding: 0 12px; font-size: 13px; }
.ob-m .ob-grid-head { display: none; }
.ob-m .ob-stage { grid-template-columns: 26px 1fr 1fr 28px; grid-template-areas: 'n f f t' 'n d m t'; row-gap: 6px; padding: 10px 2px; }
.ob-m .ob-stage-num { grid-area: n; }
.ob-m .ob-stage-fields { grid-area: f; }
.ob-m .ob-stage-tools { grid-area: t; }
.ob-m .ob-stage .ob-days { grid-area: d; padding-top: 0; }
.ob-m .ob-stage .ob-days-min { grid-area: m; }
.ob-m .ob-days-l { display: inline; }
.ob-m .ob-tl-labels b { font-size: 9.5px; }
.ob-m .ob-scan-list li { grid-template-columns: 30px 1fr 60px; }

@media (prefers-reduced-motion: reduce) {
  .ob-root *, .ob-root *::before { animation: none !important; transition: none !important; }
}
`;
