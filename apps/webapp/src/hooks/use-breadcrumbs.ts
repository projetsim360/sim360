import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { BREADCRUMB_CONFIG, type BreadcrumbSegment } from '@/config/breadcrumbs.config';

/**
 * Converts a route pattern like '/simulations/:id/pmo' into a regex
 * and extracts param names.
 */
function patternToRegex(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const regexStr = pattern.replace(/:([^/]+)/g, (_match, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  return { regex: new RegExp(`^${regexStr}$`), paramNames };
}

/**
 * Replace :paramName tokens in a path string with actual param values.
 */
function resolvePathParams(path: string, params: Record<string, string>): string {
  return path.replace(/:([^/]+)/g, (_match, paramName) => params[paramName] ?? paramName);
}

export interface ResolvedBreadcrumbSegment {
  label: string;
  path?: string;
}

/**
 * Matches the current pathname against BREADCRUMB_CONFIG patterns and returns
 * resolved breadcrumb segments. Dynamic labels (e.g. ':projectName') are resolved
 * from the dynamicLabels map; if not found, '...' is used as fallback.
 *
 * Returns null if no matching pattern is found.
 */
export function useBreadcrumbs(
  dynamicLabels?: Record<string, string>,
): ResolvedBreadcrumbSegment[] | null {
  const { pathname } = useLocation();

  return useMemo(() => {
    // Try each pattern — pick the longest (most specific) match
    let bestMatch: {
      def: { segments: BreadcrumbSegment[] };
      params: Record<string, string>;
      specificity: number;
    } | null = null;

    for (const [pattern, def] of Object.entries(BREADCRUMB_CONFIG)) {
      const { regex, paramNames } = patternToRegex(pattern);
      const match = pathname.match(regex);
      if (match) {
        const params: Record<string, string> = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        const specificity = pattern.split('/').length;
        if (!bestMatch || specificity > bestMatch.specificity) {
          bestMatch = { def, params, specificity };
        }
      }
    }

    if (!bestMatch) return null;

    const { def, params } = bestMatch;

    return def.segments.map((segment) => {
      // Resolve label
      let label = segment.label;
      if (label.startsWith(':')) {
        const key = label.slice(1);
        label = dynamicLabels?.[key] ?? '...';
      }

      // Resolve path params
      let path: string | undefined;
      if (segment.path) {
        path = resolvePathParams(segment.path, params);
      }

      return { label, path };
    });
  }, [pathname, dynamicLabels]);
}
