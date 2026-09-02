import { forceLocale } from '../../lib/translations';
import LandingScreen from '../index';

// A crawlable, stable German URL for the homepage — same LandingScreen
// component as the French "/" route, just forced into German before first
// render so a search engine (or a visitor landing directly on /de) always
// gets German copy regardless of any cached or browser-detected locale.
forceLocale('de');

export default LandingScreen;
