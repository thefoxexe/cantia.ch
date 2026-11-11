import type { TextStyle } from 'react-native';
import { sans } from './siteTheme';

// Super Admin panel headings and big figures: the brand's DM Sans (the panel
// is set to the site typeface by useSiteFontScope in app/(admin)/_layout.tsx),
// slightly tightened, instead of the condensed display face of the app.
export const adminDisplay: TextStyle = { ...sans, letterSpacing: -0.6 };
