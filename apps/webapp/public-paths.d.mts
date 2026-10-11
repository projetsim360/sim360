export interface PrerenderedPage {
  /** Public URL path. */
  path: string;
  /** Static file in `dist/` holding the prerendered HTML. */
  file: string;
}
export declare const PRERENDERED_PAGES: readonly PrerenderedPage[];
export declare const PUBLIC_EXACT_PATHS: readonly string[];
export declare const PUBLIC_PATH_PREFIXES: readonly string[];
export declare const PUBLIC_SITE_FALLBACK: string;
export declare function isPublicSitePath(pathname: string): boolean;
export declare function publicSiteFileFor(pathname: string): string | null;
