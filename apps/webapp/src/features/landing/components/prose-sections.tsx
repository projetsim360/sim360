import { useIntl, type PrimitiveType } from 'react-intl';
import type { PublicMessageKey } from '@/i18n/public-messages';

export interface ProseSection {
  titleKey: PublicMessageKey;
  textKey: PublicMessageKey;
}

interface ProseSectionsProps {
  sections: readonly ProseSection[];
  /** Values shared by every section (legal entity fields, contact email…). */
  values?: Record<string, PrimitiveType>;
  /** ISO date shown as "Last updated". */
  updated?: string;
}

/** Numbered reading sections for legal and informational pages. */
export function ProseSections({ sections, values, updated }: ProseSectionsProps) {
  const { formatMessage, formatDate } = useIntl();
  return (
    <div className="space-y-10">
      {updated && (
        <p className="text-sm text-muted-foreground">
          {formatMessage({ id: 'common.updated' }, { date: formatDate(updated, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) })}
        </p>
      )}
      {sections.map((section, i) => (
        <section key={section.titleKey} className="scroll-mt-28">
          <h2 className="mb-3 flex items-baseline gap-3 font-display text-2xl font-bold text-foreground">
            <span className="font-mono text-sm font-semibold text-[var(--accent-400)]">{String(i + 1).padStart(2, '0')}</span>
            {formatMessage({ id: section.titleKey })}
          </h2>
          <p className="text-[17px] leading-relaxed text-foreground/80">{formatMessage({ id: section.textKey }, values)}</p>
        </section>
      ))}
    </div>
  );
}
