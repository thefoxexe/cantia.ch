import type { ImageSourcePropType } from 'react-native';

// Partners shown on partners.cantia.ch, each with its own page
// (app-partners/partenaires/<slug>.tsx and /de, /it). Their texts live in
// lib/partners/landingCopy.ts (`featured`).
export interface FeaturedPartner {
  slug: string;
  name: string;
  website: string;
  // Transparent logos: for the dark band of the landing, and for light pages.
  logo: ImageSourcePropType;
  logoLight: ImageSourcePropType;
  // Height / width of the logo images.
  ratio: number;
}

export const FEATURED_PARTNERS: FeaturedPartner[] = [
  {
    slug: 'webalp',
    name: 'WebAlp',
    website: 'https://webalp.ch',
    // WebAlp's wordmark as on webalp.ch (Space Grotesk, « Alp » in its green);
    // on light backgrounds « Web » is black and the green darker to stay legible.
    logo: require('../../assets/marketing/partners/webalp-on-dark.png'),
    logoLight: require('../../assets/marketing/partners/webalp-on-light.png'),
    ratio: 259 / 964,
  },
];
