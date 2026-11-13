import { lazy, Suspense, type ComponentProps } from 'react';
import { View } from 'react-native';
import type { TrafficChart as TrafficChartType } from '../TrafficChart';
import type { GrowthChart as GrowthChartType } from '../GrowthChart';
import type { CashCollectedChart as CashCollectedChartType } from '../CashCollectedChart';

// The admin charts, loaded on demand: react-native-gifted-charts weighs
// ~370 KB, and anything two routes import statically ends up in the bundle
// every page of cantia.ch downloads. With import() it is its own file,
// fetched only when an admin page draws a chart.
const Traffic = lazy(() => import('../TrafficChart').then((m) => ({ default: m.TrafficChart })));
const Growth = lazy(() => import('../GrowthChart').then((m) => ({ default: m.GrowthChart })));
const Cash = lazy(() => import('../CashCollectedChart').then((m) => ({ default: m.CashCollectedChart })));

const Placeholder = () => <View style={{ height: 220 }} />;

export function TrafficChart(props: ComponentProps<typeof TrafficChartType>) {
  return (
    <Suspense fallback={<Placeholder />}>
      <Traffic {...props} />
    </Suspense>
  );
}

export function GrowthChart(props: ComponentProps<typeof GrowthChartType>) {
  return (
    <Suspense fallback={<Placeholder />}>
      <Growth {...props} />
    </Suspense>
  );
}

export function CashCollectedChart(props: ComponentProps<typeof CashCollectedChartType>) {
  return (
    <Suspense fallback={<Placeholder />}>
      <Cash {...props} />
    </Suspense>
  );
}
