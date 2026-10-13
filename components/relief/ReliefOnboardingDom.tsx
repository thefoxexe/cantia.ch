'use dom';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DOMProps } from 'expo/dom';
import { createRelief, type ReliefHandle } from '../../lib/relief/engine';
import { SCENE_CSS } from '../../lib/relief/sceneCss';
import { roleOptions, stagesForTemplate, suggestedTemplate } from '../../lib/relief/process';
import type { ReliefAnswers, ReliefBilling, ReliefData, ReliefMember, ReliefSpec, ReliefStyle, ReliefTemplate } from '../../lib/relief/types';
import { TEMPLATE_STYLES } from '../../lib/relief/types';
import type { ReliefCopy } from '../../lib/relief/copy';

// The onboarding of Cantia Relief, with the world drawn live next to it:
// the owner describes the business step by step like a real company does
// (activity, process with who leads each step and how long it takes, the
// team's roles, how they quote and invoice, anything else by voice), and
// the preview changes with every answer. Then the wait while the AI builds
// the real world, and the screen when it could not.

type Locale = 'fr' | 'de' | 'it';
type Step = 'welcome' | 0 | 1 | 2 | 3 | 4 | 'recap';
const STEPS: Step[] = ['welcome', 0, 1, 2, 3, 4, 'recap'];
const ACCENT_OF: Record<ReliefTemplate, ReliefSpec['accent']> = { territoire: 'terracotta', studio: 'lac', atelier: 'ardoise' };
const ACCENT_HEX: Record<string, string> = { terracotta: '#A95C30', sapin: '#2F6B4F', lac: '#2F6E8A', ardoise: '#4A5563', prune: '#7A4A6E' };
const PALETTE = ['#C8642E', '#3F6E8C', '#6E8B4A', '#8C4A6E', '#B08A2E', '#2E7D72', '#5A5FA8', '#A8463E'];
const BILLING: ReliefBilling[] = ['end', 'deposit', 'milestones', 'monthly'];

function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

interface Props {
  copy: ReliefCopy;
  locale: Locale;
  company: string;
  trade: string | null;
  workTerm: { item: string; items: string };
  members: ReliefMember[];
  answers: ReliefAnswers;
  mode: 'onboarding' | 'building' | 'failed';
  skipWelcome: boolean;
  listening: boolean;
  transcribing: boolean;
  /** Text dictated since the last change, with a counter so repeats show. */
  dictated: { seq: number; text: string };
  onToggleDictation: () => Promise<string | null>;
  onSubmit: (answers: ReliefAnswers) => Promise<string | null>;
  onRetry: () => void;
  onEdit: () => void;
  onClose: () => void;
  dom?: DOMProps;
}

// ------------------------------------------------------------- preview data

function previewSpec(a: ReliefAnswers, trade: string | null, company: string, workTerm: Props['workTerm']): ReliefSpec {
  const template = a.template === 'auto' ? suggestedTemplate(trade) : a.template;
  const stages = a.stages.filter((s) => s.label.trim()).slice(0, 8);
  return {
    version: 1,
    template,
    title: company,
    tagline: a.activity,
    understood: [],
    vocabulary: { item: workTerm.item, items: workTerm.items, place: '' },
    stages: (stages.length >= 2 ? stages : [{ label: '1' }, { label: '2' }, { label: '3' }]).map((s) => ({ label: s.label })),
    accent: ACCENT_OF[template],
    decor: { mountains: true, water: template === 'territoire' ? 'riviere' : 'lac', greenery: template === 'territoire' ? 'verdoyant' : 'sobre' },
    styles: {},
    examples: [],
  };
}

function previewData(spec: ReliefSpec, a: ReliefAnswers, company: string): ReliefData {
  const styles = TEMPLATE_STYLES[spec.template];
  const n = spec.stages.length;
  const people = a.team.slice(0, 8).map((m, i) => ({ id: m.id, name: m.name, initials: initials(m.name), color: PALETTE[i % PALETTE.length] }));
  // One item per step of the process, each standing at its own step.
  const items = spec.stages.map((s, i) => ({
    id: `p${i}`,
    name: s.label,
    client: null,
    place: null,
    progress: n > 1 ? i / (n - 1) : 1,
    stage: i,
    status: (i === n - 1 ? 'done' : 'ok') as 'done' | 'ok',
    startDate: null,
    endDate: null,
    money: null,
    crew: people.length ? [people[i % people.length].id] : [],
    tasks: [],
    style: styles[i % styles.length] as ReliefStyle,
    example: false,
  }));
  return { company, today: '', items, people, atBase: [] };
}

// ------------------------------------------------------------- component

export default function ReliefOnboardingDom(props: Props) {
  const { copy, locale, company, trade, workTerm, mode, onClose } = props;
  const [a, setA] = useState<ReliefAnswers>(props.answers);
  const [step, setStep] = useState<Step>(props.skipWelcome ? 0 : 'welcome');
  const [dir, setDir] = useState<1 | -1>(1);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const relief = useRef<ReliefHandle | null>(null);
  const lastSeq = useRef(props.dictated.seq);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 860px)').matches);

  const spec = useMemo(() => previewSpec(a, trade, company, workTerm), [a, trade, company, workTerm]);
  const accent = ACCENT_HEX[spec.accent];
  const specKey = `${spec.template}|${spec.stages.map((s) => s.label).join('|')}|${a.team.length}`;
  const item = workTerm.item;

  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 860px)');
    const on = () => setMobile(!!mq?.matches);
    mq?.addEventListener?.('change', on);
    return () => mq?.removeEventListener?.('change', on);
  }, []);

  // The live preview: created once, then re-planned as the answers change.
  useEffect(() => {
    if (!stageRef.current) return;
    try {
      relief.current = createRelief(stageRef.current, spec, previewData(spec, a, company), {
        onSelect: () => {},
        baseLabel: company,
        exampleLabel: '',
        preview: true,
        intro: true,
      });
    } catch {
      relief.current = null;
    }
    return () => {
      relief.current?.dispose();
      relief.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => relief.current?.setSpec(spec, previewData(spec, a, company)), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey]);

  // While the AI builds, the preview keeps rebuilding itself.
  useEffect(() => {
    if (mode !== 'building') return;
    const t = setInterval(() => relief.current?.setSpec(spec, previewData(spec, a, company)), 7000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, specKey]);

  // Keep the world centred in the part of the screen the form leaves free.
  useEffect(() => {
    const h = relief.current;
    if (!h) return;
    if (mobile) h.setInsets({ bottom: step === 'welcome' && mode === 'onboarding' ? Math.round(window.innerHeight * 0.6) : 0, top: 40 });
    else h.setInsets({ left: 560 });
  }, [mobile, step, mode]);

  // Dictated text lands in the story.
  useEffect(() => {
    if (props.dictated.seq === lastSeq.current) return;
    lastSeq.current = props.dictated.seq;
    const text = props.dictated.text.trim();
    if (text) setA((x) => ({ ...x, story: x.story.trim() ? `${x.story.trim()} ${text}` : text }));
  }, [props.dictated]);

  const set = <K extends keyof ReliefAnswers>(k: K, v: ReliefAnswers[K]) => setA((x) => ({ ...x, [k]: v }));
  const setStage = (i: number, patch: Partial<ReliefAnswers['stages'][number]>) => setA((x) => ({ ...x, stages: x.stages.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  const moveStage = (i: number, d: -1 | 1) =>
    setA((x) => {
      const s = [...x.stages];
      const j = i + d;
      if (j < 0 || j >= s.length) return x;
      [s[i], s[j]] = [s[j], s[i]];
      return { ...x, stages: s };
    });

  const validStages = a.stages.filter((s) => s.label.trim()).length >= 3 && a.stages.every((s) => s.label.trim());
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
  }, [step, mode]);
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
    const err = await props.onSubmit({ ...a, stages: a.stages.filter((s) => s.label.trim()) });
    setSending(false);
    if (err) setError(err);
  };

  const mic = async () => {
    setError(null);
    const err = await props.onToggleDictation();
    if (err) setError(err);
  };

  const totalDays = a.stages.reduce((s, x) => s + (Number(x.days) || 0), 0);
  const checks = a.stages.filter((s) => s.client).length;
  const roles = roleOptions(locale);
  const shownTemplate = a.template === 'auto' ? suggestedTemplate(trade) : a.template;

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
        <div className="ob-points">
          {copy.obWelcomePoints.map((p, i) => (
            <span key={p} className="ob-point" style={{ animationDelay: `${600 + i * 120}ms` }}>
              <span className="ob-point-dot" />
              {p}
            </span>
          ))}
        </div>
        <div className="ob-steps-preview">
          {copy.obStepNames.map((n, i) => (
            <span key={n} className="ob-chip" style={{ animationDelay: `${900 + i * 90}ms` }}>
              <b>{i + 1}</b> {n}
            </span>
          ))}
        </div>
        <button type="button" className="ob-btn ob-btn-primary ob-btn-big" onClick={() => go(0)}>
          {copy.obStart} →
        </button>
      </div>
    );
  } else if (step === 0) {
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">{copy.obActivityTitle}</h2>
        <p className="ob-text">{copy.obActivityText}</p>
        <input className="ob-input ob-input-big" value={a.activity} onChange={(e) => set('activity', e.target.value)} placeholder={copy.obActivityPlaceholder} maxLength={200} autoFocus />
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
  } else if (step === 1) {
    body = (
      <div className="ob-body">
        <h2 className="ob-h2">{copy.obProcessTitle}</h2>
        <p className="ob-text">{fill(copy.obProcessText, { item })}</p>
        <div className="ob-stages">
          {a.stages.map((s, i) => (
            <div key={i} className="ob-stage" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="ob-stage-num">{i + 1}</span>
              <div className="ob-stage-fields">
                <input className="ob-input" value={s.label} onChange={(e) => setStage(i, { label: e.target.value })} placeholder={copy.obStageName} aria-label={copy.obStageName} maxLength={32} />
                <div className="ob-stage-row">
                  <input className="ob-input ob-input-s" list="ob-roles" value={s.owner} onChange={(e) => setStage(i, { owner: e.target.value })} placeholder={copy.obStageOwner} aria-label={copy.obStageOwner} maxLength={40} />
                  <label className="ob-days">
                    <input
                      className="ob-input ob-input-n"
                      type="number"
                      min={0}
                      max={365}
                      value={s.days || ''}
                      onChange={(e) => setStage(i, { days: Math.max(0, Math.min(365, Number(e.target.value) || 0)) })}
                      aria-label={copy.obStageDays}
                    />
                    <span>{copy.obStageDays}</span>
                  </label>
                  <button type="button" className={`ob-toggle${s.client ? ' ob-toggle-on' : ''}`} onClick={() => setStage(i, { client: !s.client })} aria-pressed={s.client}>
                    {copy.obStageClient}
                  </button>
                </div>
              </div>
              <div className="ob-stage-tools">
                <button type="button" className="ob-mini" onClick={() => moveStage(i, -1)} disabled={i === 0} aria-label={copy.obUp}>
                  ↑
                </button>
                <button type="button" className="ob-mini" onClick={() => moveStage(i, 1)} disabled={i === a.stages.length - 1} aria-label={copy.obDown}>
                  ↓
                </button>
                <button type="button" className="ob-mini" onClick={() => set('stages', a.stages.filter((_, j) => j !== i))} disabled={a.stages.length <= 3} aria-label={copy.obRemove}>
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
        {a.stages.length < 8 ? (
          <button type="button" className="ob-add" onClick={() => set('stages', [...a.stages, { label: '', owner: '', days: 0, client: false }])}>
            + {copy.obAddStage}
          </button>
        ) : null}
        <div className="ob-summary">{fill(copy.obTotalDays, { item, days: totalDays, checks })}</div>
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
        <h2 className="ob-h2">{copy.obWorkTitle}</h2>
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
        <h2 className="ob-h2">{copy.obStoryTitle}</h2>
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
            </p>
          </RecapCard>
          <RecapCard title={copy.obRecapProcess} onEdit={() => go(1)} edit={copy.obEdit}>
            <div className="ob-flow">
              {a.stages
                .filter((s) => s.label.trim())
                .map((s, i, arr) => (
                  <span key={i} className="ob-flow-step">
                    <span className="ob-flow-name">{s.label}</span>
                    {s.owner ? <span className="ob-flow-owner">{s.owner}</span> : null}
                    {i < arr.length - 1 ? <span className="ob-flow-arrow">→</span> : null}
                  </span>
                ))}
            </div>
            <p className="ob-muted">{fill(copy.obTotalDays, { item, days: totalDays, checks })}</p>
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

  return (
    <div className={`ob-root${mobile ? ' ob-m' : ''}${welcome ? ' ob-is-welcome' : ''}`} style={{ ['--accent' as string]: accent }}>
      <style>{SCENE_CSS + CSS}</style>
      <div ref={stageRef} className="ob-world" />
      <div className="ob-topbar">
        <span className="ob-brand">
          <span className="ob-brand-mark" />
          {copy.brand}
        </span>
        <span className="ob-live">
          <span className="ob-live-dot" />
          {copy.obPreview}
        </span>
        <button type="button" className="ob-close" onClick={onClose} aria-label={copy.close}>
          ×
        </button>
      </div>
      <div className={`ob-panel${welcome ? ' ob-panel-welcome' : ''}`} ref={handleRef}>
        {header}
        <div key={`${mode}-${String(step)}`} className={`ob-anim ${dir > 0 ? 'ob-in-r' : 'ob-in-l'}`}>
          {body}
        </div>
        {error ? <div className="ob-error">{error}</div> : null}
        {footer}
      </div>
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
.ob-root { position: relative; width: 100%; height: 100%; min-height: 100%; overflow: hidden; background: #EFE8DC; font-family: Archivo, system-ui, -apple-system, sans-serif; color: #231A12; -webkit-font-smoothing: antialiased; }
.ob-root * { box-sizing: border-box; }
.ob-world { position: absolute; inset: 0; z-index: 0; }
.ob-world .rf-labels { opacity: .92; }
.ob-world .rf-step-name { display: none; }
.ob-topbar { position: absolute; left: 0; right: 0; top: 0; z-index: 3; display: flex; align-items: center; gap: 12px; padding: max(14px, env(safe-area-inset-top)) 18px 14px; pointer-events: none; }
.ob-topbar > * { pointer-events: auto; }
.ob-brand { display: inline-flex; align-items: center; gap: 9px; font-weight: 800; font-size: 14px; letter-spacing: -.1px; background: rgba(255,253,249,.92); padding: 8px 12px; border-radius: 999px; box-shadow: 0 6px 18px rgba(43,33,26,.1); }
.ob-brand-mark { width: 14px; height: 14px; border-radius: 4px; background: var(--accent); transform: rotate(45deg); transition: background .6s; }
.ob-live { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #4A3F35; background: rgba(255,253,249,.85); padding: 7px 11px; border-radius: 999px; }
.ob-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #D2453B; box-shadow: 0 0 0 0 rgba(210,69,59,.6); animation: ob-ping 1.6s infinite; }
.ob-close { all: unset; margin-left: auto; cursor: pointer; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: #16120E; color: #FFFFFF; font-size: 22px; line-height: 1; box-shadow: 0 6px 18px rgba(43,33,26,.2); }

.ob-panel { position: absolute; z-index: 2; left: 18px; top: 72px; bottom: 18px; width: 524px; display: flex; flex-direction: column; background: #FFFDF9; border-radius: 18px; border: 1px solid rgba(35,26,18,.08); box-shadow: 0 24px 60px rgba(43,33,26,.18); overflow: auto; animation: ob-rise .5s cubic-bezier(.2,.8,.2,1); }
.ob-panel-welcome .ob-anim { justify-content: center; }
.ob-anim { flex: 1; display: flex; flex-direction: column; }
.ob-in-r { animation: ob-from-r .38s cubic-bezier(.2,.8,.2,1); }
.ob-in-l { animation: ob-from-l .38s cubic-bezier(.2,.8,.2,1); }

.ob-progress { position: sticky; top: 0; z-index: 1; background: #FFFDF9; padding: 18px 24px 12px; border-bottom: 1px solid #F0E8DC; }
.ob-progress-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.ob-progress-name { font-size: 13px; font-weight: 800; }
.ob-bars { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.ob-bar { all: unset; cursor: pointer; height: 6px; border-radius: 3px; background: #EDE3D3; overflow: hidden; }
.ob-bar span { display: block; height: 100%; width: 0; background: var(--accent); border-radius: 3px; transition: width .5s cubic-bezier(.2,.8,.2,1); }
.ob-bar-done span { width: 100%; opacity: .55; }
.ob-bar-on span { width: 100%; }

.ob-body { padding: 22px 24px 8px; display: flex; flex-direction: column; gap: 12px; }
.ob-center { align-items: flex-start; padding-top: 30px; }
.ob-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; color: var(--accent); }
.ob-label { font-size: 11.5px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; color: #4A3F35; }
.ob-gap { margin-top: 10px; }
.ob-h1 { font-size: 30px; line-height: 1.08; letter-spacing: -.8px; font-weight: 900; margin: 0; }
.ob-h2 { font-size: 26px; line-height: 1.1; letter-spacing: -.6px; font-weight: 900; margin: 0; }
.ob-text, .ob-lead { font-size: 15px; line-height: 1.55; color: #4A3F35; margin: 0; max-width: 60ch; }
.ob-lead { font-size: 16px; }
.ob-hint, .ob-muted { font-size: 12.5px; color: #8C8073; margin: 0; }
.ob-note { font-size: 13px; color: #6E6153; margin: 4px 0 0; background: #F6F0E6; padding: 10px 12px; border-radius: 10px; }

.ob-welcome { padding: 30px 30px 28px; display: flex; flex-direction: column; gap: 16px; }
.ob-hero { font-size: clamp(30px, 4.4vw, 44px); line-height: 1.04; letter-spacing: -1.2px; font-weight: 900; margin: 0; text-wrap: balance; }
.ob-word { display: inline-block; animation: ob-word .6s cubic-bezier(.2,.8,.2,1) both; white-space: pre; }
.ob-points { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.ob-point { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; color: #4A3F35; animation: ob-fade .5s ease-out both; }
.ob-point-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
.ob-steps-preview { display: flex; flex-wrap: wrap; gap: 6px; }
.ob-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; padding: 6px 10px; border-radius: 999px; background: #F3ECE1; animation: ob-fade .5s ease-out both; }
.ob-chip b { font: 700 11px 'Martian Mono', ui-monospace, monospace; color: var(--accent); }

.ob-input { width: 100%; font: 500 15px Archivo, system-ui, sans-serif; color: #231A12; background: #FFFFFF; border: 1.5px solid #E2D8C8; border-radius: 10px; padding: 11px 12px; transition: border-color .15s, box-shadow .15s; }
.ob-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent); }
.ob-input-big { font-size: 17px; padding: 14px 14px; }
.ob-input-s { font-size: 13.5px; padding: 8px 10px; }
.ob-input-n { width: 64px; font-size: 13.5px; padding: 8px 8px; text-align: right; font-family: 'Martian Mono', ui-monospace, monospace; }
.ob-textarea { min-height: 180px; resize: vertical; line-height: 1.5; padding-bottom: 52px; }

.ob-models { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ob-model { all: unset; box-sizing: border-box; cursor: pointer; display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 14px; border: 1.5px solid #EDE3D3; background: #FFFFFF; transition: transform .2s, border-color .2s, box-shadow .2s; }
.ob-model:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(43,33,26,.1); }
.ob-model-on { border-color: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent); }
.ob-art { width: 100%; height: auto; transition: transform .4s; }
.ob-model-on .ob-art { transform: scale(1.06); }
.ob-model-title { font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ob-model-text { font-size: 12px; line-height: 1.4; color: #6E6153; }
.ob-tag { font-size: 10px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #FFFFFF; background: var(--accent); border-radius: 999px; padding: 2px 7px; }

.ob-stages { display: flex; flex-direction: column; gap: 8px; }
.ob-stage { display: grid; grid-template-columns: 30px 1fr auto; gap: 10px; align-items: start; padding: 10px; border-radius: 12px; background: #FAF6EF; border: 1px solid #F0E8DC; animation: ob-fade .35s ease-out both; }
.ob-stage-num { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: #FFFFFF; font: 700 12px 'Martian Mono', ui-monospace, monospace; margin-top: 6px; }
.ob-stage-fields { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ob-stage-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ob-stage-row .ob-input-s { flex: 1 1 140px; min-width: 0; }
.ob-days { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: #6E6153; font-weight: 600; }
.ob-toggle { all: unset; cursor: pointer; font-size: 11.5px; font-weight: 700; padding: 7px 10px; border-radius: 999px; border: 1.5px solid #E2D8C8; color: #6E6153; background: #FFFFFF; transition: all .15s; }
.ob-toggle-on { border-color: var(--accent); color: #FFFFFF; background: var(--accent); }
.ob-stage-tools { display: flex; flex-direction: column; gap: 4px; }
.ob-mini { all: unset; cursor: pointer; width: 26px; height: 24px; border-radius: 7px; display: grid; place-items: center; font-size: 14px; color: #6E6153; background: #FFFFFF; border: 1px solid #EDE3D3; }
.ob-mini:disabled { opacity: .35; cursor: default; }
.ob-add { all: unset; cursor: pointer; align-self: flex-start; font-size: 13.5px; font-weight: 800; color: var(--accent); padding: 8px 4px; }
.ob-summary { font-size: 13px; font-weight: 600; color: #4A3F35; background: color-mix(in srgb, var(--accent) 9%, #FFFFFF); border-radius: 10px; padding: 10px 12px; }

.ob-team { display: flex; flex-direction: column; gap: 8px; }
.ob-member { display: grid; grid-template-columns: 34px minmax(80px, 1fr) minmax(140px, 1.3fr); gap: 10px; align-items: center; padding: 8px 10px; border-radius: 12px; background: #FAF6EF; animation: ob-fade .35s ease-out both; }
.ob-member-name { font-weight: 700; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ob-avatar { width: 32px; height: 32px; border-radius: 50%; color: #FFFFFF; display: inline-grid; place-items: center; font-size: 11.5px; font-weight: 800; flex: none; }
.ob-avatar-s { width: 24px; height: 24px; font-size: 9.5px; }

.ob-seg { display: inline-grid; grid-template-columns: 1fr 1fr; background: #F3ECE1; border-radius: 12px; padding: 4px; gap: 4px; align-self: flex-start; }
.ob-seg button { all: unset; cursor: pointer; padding: 9px 16px; border-radius: 9px; font-size: 13.5px; font-weight: 700; color: #6E6153; text-align: center; transition: all .2s; }
.ob-seg .ob-seg-on { background: #FFFFFF; color: #231A12; box-shadow: 0 4px 12px rgba(43,33,26,.1); }
.ob-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ob-option { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 10px; padding: 12px; border-radius: 12px; border: 1.5px solid #EDE3D3; background: #FFFFFF; transition: all .2s; animation: ob-fade .35s ease-out both; }
.ob-option > span:last-child { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #6E6153; line-height: 1.4; }
.ob-option b { font-size: 13.5px; color: #231A12; }
.ob-option-on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, #FFFFFF); }
.ob-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #CFC5B5; flex: none; margin-top: 1px; transition: all .2s; }
.ob-option-on .ob-radio { border: 6px solid var(--accent); }

.ob-questions { margin: 0; padding-left: 18px; font-size: 13.5px; color: #4A3F35; line-height: 1.6; }
.ob-story { position: relative; }
.ob-micro { all: unset; cursor: pointer; position: absolute; right: 10px; bottom: 12px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; padding: 9px 14px; border-radius: 999px; background: #16120E; color: #FFFFFF; box-shadow: 0 6px 16px rgba(43,33,26,.2); }
.ob-micro:disabled { opacity: .6; }
.ob-micro-dot { width: 9px; height: 9px; border-radius: 50%; background: #FFFFFF; }
.ob-micro-on { background: #D2453B; }
.ob-micro-on .ob-micro-dot { animation: ob-blink 1s infinite; }

.ob-recap { display: flex; flex-direction: column; gap: 10px; }
.ob-recap-card { border: 1px solid #EDE3D3; border-radius: 14px; padding: 12px 14px; background: #FFFFFF; display: flex; flex-direction: column; gap: 6px; animation: ob-fade .35s ease-out both; }
.ob-recap-card p { margin: 0; font-size: 14px; line-height: 1.45; }
.ob-recap-head { display: flex; justify-content: space-between; align-items: center; }
.ob-link { all: unset; cursor: pointer; font-size: 12.5px; font-weight: 700; color: var(--accent); }
.ob-flow { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ob-flow-step { display: inline-flex; align-items: center; gap: 6px; }
.ob-flow-name { font-size: 13px; font-weight: 700; padding: 5px 9px; border-radius: 8px; background: #F3ECE1; }
.ob-flow-owner { font-size: 11px; color: #8C8073; }
.ob-flow-arrow { color: var(--accent); font-weight: 800; }
.ob-faces { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 13px; font-weight: 600; }
.ob-face { display: inline-flex; align-items: center; gap: 6px; }

.ob-what { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px; }
.ob-what-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #4A3F35; padding: 10px 12px; border-radius: 10px; background: #FAF6EF; animation: ob-glow 6.4s ease-in-out infinite; }
.ob-what-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); flex: none; }
.ob-pulse { position: relative; width: 56px; height: 56px; margin-bottom: 6px; }
.ob-pulse span { position: absolute; inset: 0; border-radius: 16px; border: 2px solid var(--accent); animation: ob-ring 2.4s ease-out infinite; transform: rotate(45deg); }
.ob-pulse span:nth-child(2) { animation-delay: .8s; }
.ob-pulse span:nth-child(3) { animation-delay: 1.6s; }

.ob-footer { position: sticky; bottom: 0; margin-top: auto; display: flex; justify-content: space-between; gap: 10px; padding: 14px 24px 18px; background: linear-gradient(rgba(255,253,249,0), #FFFDF9 28%); }
.ob-row { display: flex; flex-wrap: wrap; gap: 10px; }
.ob-btn { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14.5px; font-weight: 800; padding: 12px 18px; border-radius: 12px; border: 1.5px solid #E2D8C8; background: #FFFFFF; color: #231A12; transition: transform .15s, box-shadow .15s, filter .15s; }
.ob-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(43,33,26,.1); }
.ob-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
.ob-btn:focus-visible, .ob-model:focus-visible, .ob-option:focus-visible, .ob-toggle:focus-visible, .ob-mini:focus-visible, .ob-micro:focus-visible, .ob-close:focus-visible, .ob-bar:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.ob-btn-primary { background: var(--accent); border-color: var(--accent); color: #FFFFFF; box-shadow: 0 10px 24px color-mix(in srgb, var(--accent) 35%, transparent); }
.ob-btn-primary:hover { filter: brightness(.94); }
.ob-btn-big { align-self: flex-start; font-size: 16px; padding: 15px 24px; animation: ob-fade .5s 1.2s ease-out both; }
.ob-error { margin: 0 24px; font-size: 13px; color: #AB3327; background: #F9E9E6; border-radius: 10px; padding: 9px 12px; animation: ob-shake .35s; }

@keyframes ob-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes ob-from-r { from { opacity: 0; transform: translateX(26px); } to { opacity: 1; transform: none; } }
@keyframes ob-from-l { from { opacity: 0; transform: translateX(-26px); } to { opacity: 1; transform: none; } }
@keyframes ob-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes ob-word { from { opacity: 0; transform: translateY(14px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes ob-ping { 0% { box-shadow: 0 0 0 0 rgba(210,69,59,.55); } 80%, 100% { box-shadow: 0 0 0 9px rgba(210,69,59,0); } }
@keyframes ob-blink { 50% { opacity: .2; } }
@keyframes ob-ring { 0% { transform: rotate(45deg) scale(.4); opacity: 1; } 100% { transform: rotate(45deg) scale(1.25); opacity: 0; } }
@keyframes ob-glow { 0%, 100% { background: #FAF6EF; } 12%, 22% { background: color-mix(in srgb, var(--accent) 14%, #FFFFFF); } }
@keyframes ob-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

/* phone: the world on top, the form below */
.ob-m .ob-world { bottom: auto; height: 36%; }
.ob-m.ob-is-welcome .ob-world { height: 100%; }
.ob-m .ob-live { display: none; }
.ob-m .ob-panel { left: 0; right: 0; width: auto; top: 34%; bottom: 0; border-radius: 22px 22px 0 0; animation: ob-rise .5s cubic-bezier(.2,.8,.2,1); }
.ob-m .ob-panel-welcome { left: 10px; right: 10px; top: auto; bottom: 10px; width: auto; border-radius: 20px; max-height: 78%; justify-content: flex-start; background: rgba(255,253,249,.95); }
.ob-m .ob-welcome { padding: 22px 20px 20px; gap: 12px; }
.ob-m .ob-hero { font-size: 28px; }
.ob-m .ob-body { padding: 18px 16px 8px; }
.ob-m .ob-progress { padding: 14px 16px 10px; }
.ob-m .ob-footer { padding: 12px 16px max(14px, env(safe-area-inset-bottom)); }
.ob-m .ob-models { grid-template-columns: 1fr; }
.ob-m .ob-model { display: grid; grid-template-columns: 96px 1fr; grid-template-rows: auto auto; column-gap: 12px; align-items: center; }
.ob-m .ob-art { grid-row: span 2; }
.ob-m .ob-options { grid-template-columns: 1fr; }
.ob-m .ob-member { grid-template-columns: 32px 1fr; }
.ob-m .ob-member .ob-input { grid-column: 1 / -1; }
.ob-m .ob-h2 { font-size: 23px; }
.ob-m .ob-btn { padding: 12px 14px; font-size: 14px; }

@media (prefers-reduced-motion: reduce) {
  .ob-root *, .ob-root *::before { animation: none !important; transition: none !important; }
}
`;
