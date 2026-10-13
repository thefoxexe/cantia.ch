// Styles of what lib/relief/engine.ts draws over the 3D scene (item labels,
// the base, people's initials), shared by the world (ReliefDom) and the
// onboarding preview (ReliefOnboardingDom). Expects --accent on an ancestor.

export const SCENE_CSS = `
.rf-labels { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.rf-label { position: absolute; left: 0; top: 0; pointer-events: auto; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px 6px 8px; border-radius: 999px; border: 1px solid rgba(35,26,18,0.12); background: rgba(255,253,249,0.96); box-shadow: 0 6px 18px rgba(43,33,26,0.14); font: 600 12px/1 Archivo, system-ui, sans-serif; color: #231A12; white-space: nowrap; cursor: pointer; transition: opacity .2s, box-shadow .2s; }
.rf-label::after { content: ''; position: absolute; left: 50%; bottom: -7px; width: 1px; height: 7px; background: rgba(35,26,18,0.3); }
.rf-label:hover, .rf-label.rf-on { box-shadow: 0 0 0 2px var(--accent), 0 8px 22px rgba(43,33,26,0.2); }
.rf-label.rf-dim { opacity: 0.45; }
.rf-label .rf-step-name { font-weight: 500; color: #6E6153; font-size: 11.5px; }
.rf-example { border-style: dashed; }
.rf-base { cursor: default; background: #16120E; color: #F4F1EA; border-color: #16120E; font-weight: 700; }
.rf-base::after { background: #16120E; }
.rf-worker { position: absolute; left: 0; top: 0; min-width: 24px; height: 20px; padding: 0 5px; border-radius: 999px; display: grid; place-items: center; color: #FFFFFF; font: 800 10px/1 Archivo, system-ui, sans-serif; border: 1.5px solid #FFFFFF; box-shadow: 0 3px 10px rgba(43,33,26,0.3); }
.rf-label .rf-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; display: inline-block; }
.rf-st-ok .rf-dot { background: #2E6B4F; } .rf-st-risk .rf-dot { background: #B07A12; } .rf-st-late .rf-dot { background: #AB3327; } .rf-st-done .rf-dot { background: #8C8073; }
@media (max-width: 760px) {
  .rf-label { padding: 4px 8px 4px 6px; font-size: 11px; gap: 5px; }
  .rf-label .rf-step-name { display: none; }
  .rf-label .rf-dot { width: 7px; height: 7px; }
  .rf-label.rf-on .rf-step-name { display: inline; }
}
`;
