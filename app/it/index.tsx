import { forceLocale } from '../../lib/translations';
import LandingScreen from '../index';

// A crawlable, stable Italian URL for the homepage — same LandingScreen
// component as the French "/" route, just forced into Italian before first
// render so a search engine (or a visitor landing directly on /it) always
// gets Italian copy regardless of any cached or browser-detected locale.
forceLocale('it');

export default LandingScreen;
