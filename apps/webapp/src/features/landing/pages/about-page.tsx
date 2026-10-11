import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Button } from '@/components/ui/button';
import { publicPath } from '@/i18n/public-locale';
import { PublicPage } from '../components/public-page';
import { usePublicLocale } from '../hooks/use-public-locale';

const BLOCKS = ['mission', 'quebec', 'pilot', 'method'] as const;

export default function AboutPage() {
  const { formatMessage } = useIntl();
  const locale = usePublicLocale();
  return (
    <PublicPage id="about">
      <div className="space-y-10">
        {BLOCKS.map((b) => (
          <section key={b}>
            <h2 className="mb-3 font-display text-2xl font-bold text-foreground">{formatMessage({ id: `about.${b}.title` })}</h2>
            <p className="text-[17px] leading-relaxed text-foreground/80">{formatMessage({ id: `about.${b}.text` })}</p>
          </section>
        ))}
        <Button asChild variant="outline" size="md">
          <Link to={publicPath('contact', locale)}>{formatMessage({ id: 'about.cta' })}</Link>
        </Button>
      </div>
    </PublicPage>
  );
}
