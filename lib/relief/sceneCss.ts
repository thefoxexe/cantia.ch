// Styles of what lib/relief/terrain.ts writes over the land in full screen:
// each project's name, its step and progress, with a leader line down to its
// building; the head office as a small plate. Dark lettering on the light
// land, light lettering at night (.rf-dusk). Expects --accent on an ancestor.

export const SCENE_CSS = `
.rf-labels { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.rf-label { all: unset; position: absolute; left: 0; top: 0; pointer-events: auto; cursor: pointer; display: grid; grid-template-columns: auto auto; column-gap: 6px; align-items: baseline; padding: 0 0 14px 9px; font: 700 12px/1.15 Archivo, system-ui, sans-serif; color: #1D1712; white-space: nowrap; text-shadow: 0 0 2px #FBF8F2, 0 0 2px #FBF8F2, 0 0 4px #FBF8F2, 0 0 6px #FBF8F2; transition: opacity .2s; }
.rf-label::before { content: ''; position: absolute; left: 0; bottom: 0; width: 1px; height: 100%; background: linear-gradient(rgba(29,23,18,.6), rgba(29,23,18,0)); }
.rf-label .rf-dot { display: none; }
.rf-label .rf-name { grid-column: 1 / -1; letter-spacing: .1px; }
.rf-label .rf-step-name { font: 500 10.5px/1.2 Archivo, system-ui, sans-serif; color: #5D5247; }
.rf-label .rf-pct { font: 600 10px/1.2 'Martian Mono', ui-monospace, monospace; color: #5D5247; }
.rf-label .rf-pct:empty { display: none; }
.rf-st-late .rf-name, .rf-st-late .rf-pct { color: #A3271B; }
.rf-st-risk .rf-pct { color: #8F6210; }
.rf-st-done .rf-name { color: #6E6458; font-weight: 600; }
.rf-label:hover .rf-name, .rf-label.rf-on .rf-name { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; text-decoration-color: var(--accent); }
.rf-label.rf-dim { opacity: 0.35; }
.rf-example .rf-name { font-style: italic; font-weight: 600; }
.rf-base { position: absolute; left: 0; top: 0; padding: 4px 7px; background: #1D1712; color: #F6F2EA; font: 700 10px/1 Archivo, system-ui, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; white-space: nowrap; pointer-events: none; }

.rf-dusk .rf-label { color: #F3EEE5; text-shadow: 0 0 2px #121922, 0 0 3px #121922, 0 0 6px #121922; }
.rf-dusk .rf-label::before { background: linear-gradient(rgba(243,238,229,.7), rgba(243,238,229,0)); }
.rf-dusk .rf-label .rf-step-name, .rf-dusk .rf-label .rf-pct { color: #AEB7C2; }
.rf-dusk .rf-st-late .rf-name, .rf-dusk .rf-st-late .rf-pct { color: #FF8A7D; }
.rf-dusk .rf-base { background: #F3EEE5; color: #121922; }

@media (max-width: 760px) {
  .rf-label { font-size: 11px; padding: 0 0 10px 7px; }
  .rf-label .rf-step-name { display: none; }
  .rf-label.rf-on .rf-step-name { display: inline; }
}
`;
