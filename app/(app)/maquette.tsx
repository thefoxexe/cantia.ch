import { View } from 'react-native';
import MaquetteDom from '../../components/maquette/MaquetteDom';
import { SAMPLE_PLAN } from '../../lib/maquette/sample';

// Prototype of "Ma maquette" (the company as a 3D miniature), on example data.
// Not linked from the menu yet: reachable at /maquette only.
export default function MaquetteScreen() {
  return (
    <View style={{ flex: 1, minHeight: 600 }}>
      <MaquetteDom plan={SAMPLE_PLAN} dom={{ style: { flex: 1 } }} />
    </View>
  );
}
