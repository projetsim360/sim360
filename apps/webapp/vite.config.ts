import { existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { publicSiteFileFor } from './public-paths.mjs';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const isSsrBuild = process.argv.includes('--ssr');

/**
 * Two entries: `index.html` (application) and `site.html` (public landing and footer pages,
 * a much smaller bundle, prerendered to static HTML by `scripts/prerender.mjs`).
 * This middleware serves the right file for public paths in dev (bare entry) and preview
 * (prerendered pages); in production nginx does the same (map `$spa_entry`).
 */
function publicSiteEntry(): Plugin {
  const rewrite = (preview: boolean) => (req: { url?: string }, _res: unknown, next: () => void) => {
    const pathname = (req.url ?? '/').split('?')[0];
    const file = publicSiteFileFor(pathname);
    if (file) {
      const prerendered = preview && existsSync(here(`./dist/${file}`));
      req.url = `/${prerendered ? file : 'site.html'}`;
    }
    next();
  };
  return {
    name: 'simex-public-site-entry',
    configureServer: (server) => {
      server.middlewares.use(rewrite(false));
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(rewrite(true));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), publicSiteEntry()],
  base: process.env.VITE_BASE_URL || '/',
  resolve: {
    alias: {
      '@': here('./src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    // `vite build --ssr <entry>` supplies its own input; the HTML entries are for the client build.
    rollupOptions: isSsrBuild ? undefined : { input: { app: here('./index.html'), site: here('./site.html') } },
  },
  // Build-time prerender bundle: self-contained, so CommonJS packages (react-helmet-async)
  // are bundled instead of imported from node_modules under Node's strict ESM rules.
  ssr: { noExternal: true },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
