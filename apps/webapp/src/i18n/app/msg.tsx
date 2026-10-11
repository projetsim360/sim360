import type { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import type { AppMessageKey } from './messages';

/** Type-checked message with rich values (elements, `<b>…</b>` tags). */
export function Msg({ id, values }: { id: AppMessageKey; values?: Record<string, ReactNode | ((chunks: ReactNode[]) => ReactNode)> }) {
  return <FormattedMessage id={id} values={values as never} />;
}
