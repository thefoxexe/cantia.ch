// Styles of what lib/relief/globe.ts writes over the planet in full screen:
// each project's name, its step and progress, with a leader line down to its
// light; the head office as a small plate. Light lettering on the dark
// planet. Expects --accent on an ancestor.

export const SCENE_CSS = `
.rf-labels { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.rf-label { all: unset; position: absolute; left: 0; top: 0; pointer-events: auto; cursor: pointer; display: grid; grid-template-columns: auto auto; column-gap: 6px; align-items: baseline; padding: 0 0 16px 9px; font: 700 12px/1.15 Archivo, system-ui, sans-serif; color: #F3EEE5; white-space: nowrap; text-shadow: 0 0 2px #050912, 0 0 3px #050912, 0 0 6px #050912; transition: opacity .2s; }
.rf-label::before { content: ''; position: absolute; left: 0; bottom: 0; width: 1px; height: 100%; background: linear-gradient(rgba(243,238,229,.8), rgba(243,238,229,0)); }
.rf-label .rf-dot { display: none; }
.rf-label .rf-name { grid-column: 1 / -1; letter-spacing: .1px; }
.rf-label .rf-step-name { font: 500 10.5px/1.2 Archivo, system-ui, sans-serif; color: #AEB7C2; }
.rf-label .rf-pct { font: 600 10px/1.2 'Martian Mono', ui-monospace, monospace; color: #AEB7C2; }
.rf-label .rf-pct:empty { display: none; }
.rf-st-late .rf-name, .rf-st-late .rf-pct { color: #FF8A7D; }
.rf-st-risk .rf-pct { color: #FFC14D; }
.rf-st-done .rf-name { color: #AEB7C2; font-weight: 600; }
.rf-label:hover .rf-name, .rf-label.rf-on .rf-name { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; text-decoration-color: #F2B880; }
.rf-label.rf-dim { opacity: 0.35; }
.rf-example .rf-name { font-style: italic; font-weight: 600; }
.rf-base { position: absolute; left: 0; top: 0; padding: 4px 7px; background: #F3EEE5; color: #0A1222; font: 700 10px/1 Archivo, system-ui, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; white-space: nowrap; pointer-events: none; }

@media (max-width: 760px) {
  .rf-label { font-size: 11px; padding: 0 0 12px 7px; }
  .rf-label .rf-step-name { display: none; }
  .rf-label.rf-on .rf-step-name { display: inline; }
}
`;
