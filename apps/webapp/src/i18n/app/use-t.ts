import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import type { AppMessageKey } from './messages';
import { fr } from './fr';

type Values = Record<string, string | number | boolean | null | undefined | Date>;

/** Type-checked translator for the app catalogue: unknown keys fail the build. */
export function useT() {
  const intl = useIntl();
  return useCallback((id: AppMessageKey, values?: Values) => intl.formatMessage({ id }, values), [intl]);
}

/**
 * Translator for enum-like values: `tv('difficulty', 'HARD')` → message `difficulty.HARD` when it
 * exists, otherwise the raw value (or the fallback). Keeps unknown server values readable.
 */
export function useTv() {
  const t = useT();
  return useCallback(
    (prefix: string, value: string | null | undefined, fallback?: string) => {
      if (!value) return fallback ?? '';
      const key = `${prefix}.${value}`;
      return key in fr ? t(key as AppMessageKey) : (fallback ?? value);
    },
    [t],
  );
}
