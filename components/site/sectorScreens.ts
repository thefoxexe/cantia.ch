import type { ImageSourcePropType } from 'react-native';
import type { SiteLocale } from '../../lib/site/copy';
import type { SectorKey } from '../../lib/site/sectors';

// The real list and detail screens of the app for each sector, rendered
// with that sector's word (chantier, dossier, mandat, projet) and sample work
// of that sector, in each language. Shown in the laptop (components/site/Laptop).
export const SECTOR_SCREENS: Record<SiteLocale, Record<SectorKey, { list: ImageSourcePropType; detail: ImageSourcePropType }>> = {
  fr: {
    batiment: { list: require('../../assets/marketing/sectors/list-batiment.jpg'), detail: require('../../assets/marketing/sectors/detail-batiment.jpg') },
    services: { list: require('../../assets/marketing/sectors/list-services.jpg'), detail: require('../../assets/marketing/sectors/detail-services.jpg') },
    etudes: { list: require('../../assets/marketing/sectors/list-etudes.jpg'), detail: require('../../assets/marketing/sectors/detail-etudes.jpg') },
    creatifs: { list: require('../../assets/marketing/sectors/list-creatifs.jpg'), detail: require('../../assets/marketing/sectors/detail-creatifs.jpg') },
  },
  de: {
    batiment: { list: require('../../assets/marketing/sectors/list-batiment-de.jpg'), detail: require('../../assets/marketing/sectors/detail-batiment-de.jpg') },
    services: { list: require('../../assets/marketing/sectors/list-services-de.jpg'), detail: require('../../assets/marketing/sectors/detail-services-de.jpg') },
    etudes: { list: require('../../assets/marketing/sectors/list-etudes-de.jpg'), detail: require('../../assets/marketing/sectors/detail-etudes-de.jpg') },
    creatifs: { list: require('../../assets/marketing/sectors/list-creatifs-de.jpg'), detail: require('../../assets/marketing/sectors/detail-creatifs-de.jpg') },
  },
  it: {
    batiment: { list: require('../../assets/marketing/sectors/list-batiment-it.jpg'), detail: require('../../assets/marketing/sectors/detail-batiment-it.jpg') },
    services: { list: require('../../assets/marketing/sectors/list-services-it.jpg'), detail: require('../../assets/marketing/sectors/detail-services-it.jpg') },
    etudes: { list: require('../../assets/marketing/sectors/list-etudes-it.jpg'), detail: require('../../assets/marketing/sectors/detail-etudes-it.jpg') },
    creatifs: { list: require('../../assets/marketing/sectors/list-creatifs-it.jpg'), detail: require('../../assets/marketing/sectors/detail-creatifs-it.jpg') },
  },
};
