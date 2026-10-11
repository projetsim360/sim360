export interface PublicRoute {
  /** Stable identifier, also the message-key segment (`page.<id>.title`). */
  id: string;
  /** French path, at the root. */
  fr: string;
  /** English path, under `/en`. */
  en: string;
}
export interface PrerenderedPage {
  id: string;
  locale: 'fr' | 'en';
  /** Public URL path. */
  path: string;
  /** Static file in `dist/` holding the prerendered HTML. */
  file: string;
}
export declare const PUBLIC_ROUTES: readonly PublicRoute[];
export declare const PRERENDERED_PAGES: readonly PrerenderedPage[];
export declare const PUBLIC_SITE_FALLBACK: string;
export declare function publicRouteFor(pathname: string): PublicRoute | null;
export declare function isPublicSitePath(pathname: string): boolean;
export declare function publicSiteFileFor(pathname: string): string | null;
