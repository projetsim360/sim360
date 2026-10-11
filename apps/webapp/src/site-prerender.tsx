/**
 * Server-side rendering of the public site, used at build time only (`scripts/prerender.mjs`).
 * Produces the HTML of a public page so the first paint does not wait for JavaScript.
 * The client then hydrates the same tree (`site-main.tsx`).
 *
 * Streaming renderer with `onAllReady`: pages are code-split (`React.lazy`), and only the
 * streaming API waits for lazy chunks instead of emitting the Suspense fallback.
 */
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
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

function collect(stream: ReturnType<typeof renderToPipeableStream>): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
      final(callback) {
        resolve(Buffer.concat(chunks).toString('utf8'));
        callback();
      },
    });
    sink.on('error', reject);
    stream.pipe(sink);
  });
}

export function render(url: string): Promise<PrerenderResult> {
  const helmetContext: { helmet?: HelmetServerState } = {};
  return new Promise((resolve, reject) => {
    const stream = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <PublicSessionProvider>
            <SiteRoutes />
          </PublicSessionProvider>
        </StaticRouter>
      </HelmetProvider>,
      {
        onAllReady: () => {
          collect(stream)
            .then((html) => {
              const helmet = helmetContext.helmet;
              resolve({
                html,
                htmlAttributes: helmet?.htmlAttributes.toString() ?? '',
                head: [helmet?.title.toString(), helmet?.meta.toString(), helmet?.link.toString()].filter(Boolean).join('\n    '),
              });
            })
            .catch(reject);
        },
        onShellError: reject,
        onError: (error) => {
          // Logged by React as well; a failing boundary would ship a client-rendered page.
          console.error(`prerender ${url}:`, error);
        },
      },
    );
  });
}
