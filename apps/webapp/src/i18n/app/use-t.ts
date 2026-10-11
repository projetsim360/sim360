import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import type { AppMessageKey } from './messages';

type Values = Record<string, string | number | boolean | null | undefined | Date>;

/** Type-checked translator for the app catalogue: unknown keys fail the build. */
export function useT() {
  const intl = useIntl();
  return useCallback((id: AppMessageKey, values?: Values) => intl.formatMessage({ id }, values), [intl]);
}
