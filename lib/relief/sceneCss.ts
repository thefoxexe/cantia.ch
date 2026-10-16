// Styles of what lib/relief/engine.ts writes over the 3D scene, in the manner
// of a Swiss national map: item names as map annotations (no bubbles), place
// and water names in the cartographer's lettering, the base as a small
// black plate. Shared by the world (ReliefDom) and the onboarding preview.
// Expects --accent on an ancestor; .rf-dusk switches to night lettering.

export const SCENE_CSS = `
.rf-labels { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.rf-tilt { position: absolute; inset: 0; pointer-events: none; backdrop-filter: blur(4px) saturate(1.04); -webkit-backdrop-filter: blur(4px) saturate(1.04); -webkit-mask-image: linear-gradient(180deg, #000 0%, rgba(0,0,0,.6) 9%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 74%, rgba(0,0,0,.7) 92%, #000 100%); mask-image: linear-gradient(180deg, #000 0%, rgba(0,0,0,.6) 9%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 74%, rgba(0,0,0,.7) 92%, #000 100%); }
.rf-label { all: unset; position: absolute; left: 0; top: 0; pointer-events: auto; cursor: pointer; display: grid; grid-template-columns: auto auto; column-gap: 6px; align-items: baseline; padding: 0 0 9px 9px; font: 700 12px/1.15 Archivo, system-ui, sans-serif; color: #1D1712; white-space: nowrap; text-shadow: 0 0 2px #FBF8F2, 0 0 2px #FBF8F2, 0 0 3px #FBF8F2, 0 0 5px #FBF8F2; transition: opacity .2s; }
.rf-label::before { content: ''; position: absolute; left: 0; bottom: 0; width: 1px; height: calc(100% - 2px); background: #1D1712; opacity: .55; }
.rf-label::after { content: ''; position: absolute; left: -2px; bottom: -2px; width: 5px; height: 5px; background: #1D1712; }
.rf-label .rf-dot { display: none; }
.rf-label .rf-name { grid-column: 1 / -1; letter-spacing: .1px; }
.rf-label .rf-step-name { font: 500 10.5px/1.2 Archivo, system-ui, sans-serif; color: #5D5247; }
.rf-label .rf-pct { font: 600 10px/1.2 'Martian Mono', ui-monospace, monospace; color: #5D5247; }
.rf-label .rf-pct:empty { display: none; }
.rf-st-late .rf-name { color: #A3271B; } .rf-st-late .rf-pct { color: #A3271B; }
.rf-st-risk .rf-pct { color: #8F6210; }
.rf-st-done .rf-name { color: #6E6458; font-weight: 600; }
.rf-st-late::after { background: #C62F22; } .rf-st-risk::after { background: #C98A12; }
.rf-label:hover .rf-name, .rf-label.rf-on .rf-name { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; text-decoration-color: var(--accent); }
.rf-label.rf-dim { opacity: 0.35; }
.rf-example .rf-name { font-style: italic; font-weight: 600; }
.rf-base { position: absolute; left: 0; top: 0; padding: 4px 7px; background: #1D1712; color: #F6F2EA; font: 700 10px/1 Archivo, system-ui, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; white-space: nowrap; }
.rf-worker { position: absolute; left: 0; top: 0; min-width: 20px; height: 16px; padding: 0 4px; display: grid; place-items: center; color: #FFFFFF; font: 700 9px/1 'Martian Mono', ui-monospace, monospace; border: 1px solid #FFFFFF; transform-origin: 50% 100%; }
.rf-worker-go { box-shadow: 0 0 0 2px rgba(255,255,255,.35); }
.rf-worker-go::after { content: ''; position: absolute; left: 50%; top: 100%; width: 1px; height: 8px; background: currentColor; opacity: .6; }

.rf-quiet .rf-label, .rf-quiet .rf-worker, .rf-quiet .rf-base, .rf-quiet .rf-map-horizon { display: none !important; }
.rf-map { position: absolute; left: 0; top: 0; pointer-events: none; white-space: nowrap; text-shadow: 0 0 2px #FBF8F2, 0 0 3px #FBF8F2, 0 0 5px #FBF8F2; transition: opacity .2s; }
.rf-map.rf-dim { opacity: .3; }
.rf-map-water { font: italic 500 13px/1 Georgia, 'Times New Roman', serif; letter-spacing: 3px; color: #2D6E8E; }
.rf-map-place { font: 600 10.5px/1 Archivo, system-ui, sans-serif; letter-spacing: 2.4px; text-transform: uppercase; color: #3A322B; }
.rf-map-horizon { font: italic 400 11px/1 Georgia, 'Times New Roman', serif; letter-spacing: 1.6px; color: #6A6156; }

.rf-dusk .rf-label { color: #F3EEE5; text-shadow: 0 0 2px #121922, 0 0 3px #121922, 0 0 6px #121922; }
.rf-dusk .rf-label::before, .rf-dusk .rf-label::after { background: #F3EEE5; }
.rf-dusk .rf-label .rf-step-name, .rf-dusk .rf-label .rf-pct { color: #AEB7C2; }
.rf-dusk .rf-st-late .rf-name, .rf-dusk .rf-st-late .rf-pct { color: #FF8A7D; }
.rf-dusk .rf-map { text-shadow: 0 0 3px #121922, 0 0 6px #121922; }
.rf-dusk .rf-map-water { color: #8EC3DD; }
.rf-dusk .rf-map-place { color: #E4DCCF; }
.rf-dusk .rf-map-horizon { color: #9AA4B0; }
.rf-dusk .rf-base { background: #F3EEE5; color: #121922; }

@media (max-width: 760px) {
  .rf-tilt { backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
  .rf-label { font-size: 11px; padding: 0 0 7px 7px; }
  .rf-label .rf-step-name { display: none; }
  .rf-label.rf-on .rf-step-name { display: inline; }
  .rf-map-water { font-size: 11px; letter-spacing: 2px; }
  .rf-map-place { font-size: 9px; letter-spacing: 1.8px; }
  .rf-map-horizon { display: none; }
}
`;
