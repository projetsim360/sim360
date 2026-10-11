import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { cn } from '@/lib/utils';
import type { PublicRouteId } from '@/i18n/public-locale';
import { Reveal } from './reveal';

interface PublicPageProps {
  /** Route id: drives `page.<id>.title|description|kicker|h1|lead`. */
  id: Exclude<PublicRouteId, 'home'>;
  children: ReactNode;
  /** `narrow` for reading pages (legal, about), `wide` for grids (catalogue). */
  width?: 'narrow' | 'wide';
}

/**
 * Frame of every public page below the landing: document title and description, kicker,
 * h1 and lead, then the content column. Prerender-safe (no browser APIs).
 */
export function PublicPage({ id, children, width = 'narrow' }: PublicPageProps) {
  const { formatMessage } = useIntl();
  return (
    <main className="px-6 pb-24 pt-32 lg:px-8 lg:pt-40">
      <Helmet>
        <title>{formatMessage({ id: `page.${id}.title` })}</title>
        <meta name="description" content={formatMessage({ id: `page.${id}.description` })} />
      </Helmet>
      <Reveal as="header" className={cn('mx-auto mb-14', width === 'narrow' ? 'max-w-3xl' : 'max-w-7xl')}>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-400)]">{formatMessage({ id: `page.${id}.kicker` })}</p>
        <h1 className="font-display text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground lg:text-5xl">
          {formatMessage({ id: `page.${id}.h1` })}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{formatMessage({ id: `page.${id}.lead` })}</p>
      </Reveal>
      <div className={cn('mx-auto', width === 'narrow' ? 'max-w-3xl' : 'max-w-7xl')}>{children}</div>
    </main>
  );
}
