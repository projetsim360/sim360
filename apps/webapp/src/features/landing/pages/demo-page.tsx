import { useIntl } from 'react-intl';
import { Check } from 'lucide-react';
import { PublicPage } from '../components/public-page';
import { DemoVideo } from '../components/demo-video';

export default function DemoPage() {
  const { formatMessage } = useIntl();
  return (
    <PublicPage id="demo" width="wide">
      <div className="grid items-start gap-10 lg:grid-cols-[2fr_1fr]">
        <DemoVideo />
        <ul className="space-y-4 rounded-2xl border border-border bg-card p-6">
          {([1, 2, 3] as const).map((n) => (
            <li key={n} className="flex items-start gap-3 text-[15px] text-foreground/85">
              <Check size={18} className="mt-0.5 shrink-0 text-[var(--accent-400)]" aria-hidden="true" />
              {formatMessage({ id: `demo.point.${n}` })}
            </li>
          ))}
        </ul>
      </div>
    </PublicPage>
  );
}
