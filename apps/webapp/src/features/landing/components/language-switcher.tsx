import { Link, useLocation } from 'react-router';
import { useIntl } from 'react-intl';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { alternateLocale, localizedPath } from '@/i18n/public-locale';
import { usePublicLocale } from '../hooks/use-public-locale';

interface LanguageSwitcherProps {
  className?: string;
  onNavigate?: () => void;
}

/** `/` ↔ `/en` on the same page, keeping the in-page anchor. Label is in the target language. */
export function LanguageSwitcher({ className, onNavigate }: LanguageSwitcherProps) {
  const locale = usePublicLocale();
  const { formatMessage } = useIntl();
  const { pathname, hash } = useLocation();
  const target = alternateLocale(locale);
  const href = `${localizedPath(pathname, target)}${hash}`;

  return (
    <Link
      to={href}
      hrefLang={target}
      lang={target}
      aria-label={formatMessage({ id: 'nav.switchLanguageAria' })}
      onClick={onNavigate}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground/70',
        'transition-colors hover:bg-foreground/5 hover:text-foreground',
        className,
      )}
    >
      <Globe size={15} aria-hidden="true" />
      {formatMessage({ id: 'nav.switchLanguage' })}
    </Link>
  );
}
