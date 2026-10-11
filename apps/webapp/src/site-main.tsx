/**
 * Entry of the PUBLIC site (landing and footer pages): a separate bundle that does not
 * load the application shell, its providers or its feature pages.
 * Served for the paths listed in `public-paths.ts`; the application entry is `main.tsx`.
 *
 * Pages prerendered at build time (`scripts/prerender.mjs`) ship their HTML and are
 * hydrated here; any other public page renders from scratch.
 */
import './styles/site.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { SiteApp } from './site-app';

const root = document.getElementById('root')!;
const tree = (
  <StrictMode>
    <SiteApp />
  </StrictMode>
);

if (root.hasChildNodes()) {
  hydrateRoot(root, tree);
} else {
  createRoot(root).render(tree);
}
