// Makes Archivo (the brand typeface, see lib/marketingTheme.ts) the default
// font of every React Native Web <Text> and <TextInput> across the whole
// web platform — the signed-in app included — without touching the
// hundreds of screens that never set a fontFamily. React Native Web resolves
// its default "System" font to a hard-coded stack in createReactDOMStyle;
// this puts Archivo in front of that stack. Text that sets its own
// fontFamily (icons, Martian Mono labels) is unaffected.
//
// Runs on `npm install` (package.json "postinstall"). Idempotent, and only
// warns (never fails the install) if a future react-native-web version
// changes the file.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINAL = `var SYSTEM_FONT_STACK = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';`;
const PATCHED = `var SYSTEM_FONT_STACK = 'Archivo,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';`;
const files = [
  'node_modules/react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle.js',
  'node_modules/react-native-web/dist/cjs/exports/StyleSheet/compiler/createReactDOMStyle.js',
];

for (const rel of files) {
  const file = path.join(root, rel);
  if (!existsSync(file)) continue;
  const source = readFileSync(file, 'utf8');
  if (source.includes(PATCHED)) continue;
  if (!source.includes(ORIGINAL)) {
    console.warn(`patch-rnw-font: ${rel} changed upstream — default font left as is.`);
    continue;
  }
  writeFileSync(file, source.replace(ORIGINAL, PATCHED));
  console.log(`patch-rnw-font: Archivo set as default font in ${rel}`);
}
