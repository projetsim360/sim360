/**
 * Server-side rendering of the public site, used at build time only (`scripts/prerender.mjs`).
 * Produces the HTML of a public page so the first paint does not wait for JavaScript.
 * The client then hydrates the same tree (`site-main.tsx`).
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { SiteRoutes } from './site-app';
import { PublicSessionProvider } from '@/features/landing/providers/public-session';

export interface PrerenderResult {
  /** Inner HTML of `#root`. */
  html: string;
  /** `<html>` attributes (lang). */
  htmlAttributes: string;
  /** Head tags: title, meta, links. */
  head: string;
}

export function render(url: string): PrerenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <PublicSessionProvider>
          <SiteRoutes />
        </PublicSessionProvider>
      </StaticRouter>
    </HelmetProvider>,
  );
  const helmet = helmetContext.helmet;
  return {
    html,
    htmlAttributes: helmet?.htmlAttributes.toString() ?? '',
    head: [helmet?.title.toString(), helmet?.meta.toString(), helmet?.link.toString()].filter(Boolean).join('\n    '),
  };
}
