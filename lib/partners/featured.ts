import type { ImageSourcePropType } from 'react-native';

// Partners shown on partners.cantia.ch, each with its own page
// (app-partners/partenaires/<slug>.tsx and /de, /it). Their texts live in
// lib/partners/landingCopy.ts (`featured`).
export interface FeaturedPartner {
  slug: string;
  name: string;
  website: string;
  logo: ImageSourcePropType;
  // Height / width of the logo image.
  ratio: number;
}

export const FEATURED_PARTNERS: FeaturedPartner[] = [
  {
    slug: 'webalp',
    name: 'WebAlp',
    website: 'https://webalp.ch',
    // WebAlp's wordmark as on webalp.ch (Space Grotesk, « Alp » in its green, on black).
    logo: require('../../assets/marketing/partners/webalp.png'),
    ratio: 330 / 900,
  },
];
