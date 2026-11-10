import { LegalPage } from '../components/site/LegalPage';

export default function ConfidentialiteScreen() {
  return <LegalPage ns="confidentialite" seoKey="confidentialite" sections={['dataCollected', 'purpose', 'subprocessors', 'dataLocation', 'rights', 'retention', 'cookies', 'contact']} />;
}
