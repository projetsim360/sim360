import { lazy, Suspense } from 'react';
import { useLayoutSwitcher } from '@/providers/layout-switcher-provider';

const LAYOUTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'layout-1': lazy(() => import('@/components/layouts/layout-1').then(m => ({ default: m.Layout1 }))),
  'layout-2': lazy(() => import('@/components/layouts/layout-2').then(m => ({ default: m.Layout2 }))),
  'layout-3': lazy(() => import('@/components/layouts/layout-3').then(m => ({ default: m.Layout3 }))),
  'layout-4': lazy(() => import('@/components/layouts/layout-4').then(m => ({ default: m.Layout4 }))),
  'layout-5': lazy(() => import('@/components/layouts/layout-5').then(m => ({ default: m.Layout5 }))),
  'layout-6': lazy(() => import('@/components/layouts/layout-6').then(m => ({ default: m.Layout6 }))),
  'layout-7': lazy(() => import('@/components/layouts/layout-7').then(m => ({ default: m.Layout7 }))),
  'layout-8': lazy(() => import('@/components/layouts/layout-8').then(m => ({ default: m.Layout8 }))),
  'layout-9': lazy(() => import('@/components/layouts/layout-9').then(m => ({ default: m.Layout9 }))),
  'layout-10': lazy(() => import('@/components/layouts/layout-10').then(m => ({ default: m.Layout10 }))),
  'layout-11': lazy(() => import('@/components/layouts/layout-11').then(m => ({ default: m.Layout11 }))),
  'layout-12': lazy(() => import('@/components/layouts/layout-12').then(m => ({ default: m.Layout12 }))),
  'layout-13': lazy(() => import('@/components/layouts/layout-13').then(m => ({ default: m.Layout13 }))),
  'layout-14': lazy(() => import('@/components/layouts/layout-14').then(m => ({ default: m.Layout14 }))),
  'layout-15': lazy(() => import('@/components/layouts/layout-15').then(m => ({ default: m.Layout15 }))),
  'layout-16': lazy(() => import('@/components/layouts/layout-16').then(m => ({ default: m.Layout16 }))),
  'layout-17': lazy(() => import('@/components/layouts/layout-17').then(m => ({ default: m.Layout17 }))),
  'layout-18': lazy(() => import('@/components/layouts/layout-18').then(m => ({ default: m.Layout18 }))),
  'layout-19': lazy(() => import('@/components/layouts/layout-19').then(m => ({ default: m.Layout19 }))),
  'layout-20': lazy(() => import('@/components/layouts/layout-20').then(m => ({ default: m.Layout20 }))),
  'layout-21': lazy(() => import('@/components/layouts/layout-21').then(m => ({ default: m.Layout21 }))),
  'layout-22': lazy(() => import('@/components/layouts/layout-22').then(m => ({ default: m.Layout22 }))),
  'layout-23': lazy(() => import('@/components/layouts/layout-23').then(m => ({ default: m.Layout23 }))),
  'layout-24': lazy(() => import('@/components/layouts/layout-24').then(m => ({ default: m.Layout24 }))),
  'layout-25': lazy(() => import('@/components/layouts/layout-25').then(m => ({ default: m.Layout25 }))),
  'layout-26': lazy(() => import('@/components/layouts/layout-26').then(m => ({ default: m.Layout26 }))),
  'layout-27': lazy(() => import('@/components/layouts/layout-27').then(m => ({ default: m.Layout27 }))),
  'layout-28': lazy(() => import('@/components/layouts/layout-28').then(m => ({ default: m.Layout28 }))),
  'layout-29': lazy(() => import('@/components/layouts/layout-29').then(m => ({ default: m.Layout29 }))),
  'layout-30': lazy(() => import('@/components/layouts/layout-30').then(m => ({ default: m.Layout30 }))),
  'layout-31': lazy(() => import('@/components/layouts/layout-31').then(m => ({ default: m.Layout31 }))),
  'layout-32': lazy(() => import('@/components/layouts/layout-32').then(m => ({ default: m.Layout32 }))),
  'layout-33': lazy(() => import('@/components/layouts/layout-33').then(m => ({ default: m.Layout33 }))),
  'layout-34': lazy(() => import('@/components/layouts/layout-34').then(m => ({ default: m.Layout34 }))),
  'layout-35': lazy(() => import('@/components/layouts/layout-35').then(m => ({ default: m.Layout35 }))),
  'layout-36': lazy(() => import('@/components/layouts/layout-36').then(m => ({ default: m.Layout36 }))),
  'layout-37': lazy(() => import('@/components/layouts/layout-37').then(m => ({ default: m.Layout37 }))),
  'layout-38': lazy(() => import('@/components/layouts/layout-38').then(m => ({ default: m.Layout38 }))),
  'layout-39': lazy(() => import('@/components/layouts/layout-39').then(m => ({ default: m.Layout39 }))),
};

function LayoutLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export function DynamicLayout() {
  const { currentLayout } = useLayoutSwitcher();
  const LayoutComponent = LAYOUTS[currentLayout] || LAYOUTS['layout-6'];

  return (
    <Suspense fallback={<LayoutLoader />}>
      <LayoutComponent />
    </Suspense>
  );
}
