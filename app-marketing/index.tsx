// Re-exports the real landing page component so its content, and this
// file's route path, both come from the single source of truth in app/ —
// see app-marketing/README.md for why this directory exists.
//
// forceLocale('fr') matters here specifically because this is the bare,
// unprefixed route: every /de/* and /it/* route module already calls its
// own forceLocale(...) at module scope, but this one used to have nothing
// of its own — during static export, Expo Router prerenders every route in
// the same process, and i18next's language is one global singleton, not
// scoped per route. Whichever /de or /it page happened to render last
// before this one left i18next stuck on that language, so the "French"
// homepage could silently come out German or Italian depending on build
// ordering (reproduced: a real `npm run build:marketing` run emitted a
// fully Italian dist-marketing/index.html under a French <title>). Calling
// forceLocale('fr') here, right before this route renders, makes this page
// correct regardless of what any other route did first.
import { forceLocale } from '../lib/translations';
import LandingScreen from '../app/index';

forceLocale('fr');

export default LandingScreen;
