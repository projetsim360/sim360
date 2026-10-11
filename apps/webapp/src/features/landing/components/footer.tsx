import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Linkedin, MapPin } from 'lucide-react';
import { Logo } from '@/components/logo';
import { publicPath } from '@/i18n/public-locale';
import { usePublicLocale } from '../hooks/use-public-locale';
import { FOOTER_COMPANY_LINKS, FOOTER_LEGAL_LINKS, FOOTER_PRODUCT_LINKS, SOCIAL_LINKS, type FooterLink } from '../content/footer-links';

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  const { formatMessage } = useIntl();
  const locale = usePublicLocale();
  const label = formatMessage({ id: link.labelKey });
  if ('route' in link) {
    return (
      <Link to={publicPath(link.route, locale)} className={className}>
        {label}
      </Link>
    );
  }
  // Landing anchors work from any public page: they point at the home page of the current language.
  const href = 'anchor' in link ? `${publicPath('home', locale)}${link.anchor}` : link.href;
  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

function LinkColumn({ titleId, links }: { titleId: 'footer.product' | 'footer.company'; links: readonly FooterLink[] }) {
  const { formatMessage } = useIntl();
  return (
    <div>
      <h3 className="mb-5 text-sm font-semibold text-white">{formatMessage({ id: titleId })}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.labelKey}>
            <FooterAnchor link={link} className="text-sm text-white/60 transition-colors hover:text-white" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { formatMessage } = useIntl();

  return (
    <footer className="bg-[var(--brand-900)] px-6 py-20 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo onDark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{formatMessage({ id: 'footer.tagline' })}</p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/50">
              <MapPin size={15} aria-hidden="true" />
              {formatMessage({ id: 'footer.madeIn' })}
            </p>
            {SOCIAL_LINKS.linkedin.ready && (
              <div className="mt-6 flex items-center gap-4">
                <a
                  href={SOCIAL_LINKS.linkedin.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={formatMessage({ id: 'footer.social.linkedin' })}
                  className="text-white/50 transition-colors hover:text-white"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            )}
          </div>

          <LinkColumn titleId="footer.product" links={FOOTER_PRODUCT_LINKS} />
          <LinkColumn titleId="footer.company" links={FOOTER_COMPANY_LINKS} />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="text-sm text-white/60">{formatMessage({ id: 'footer.copyright' }, { year: new Date().getFullYear() })}</p>
          <ul className="flex flex-wrap gap-6">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <li key={link.labelKey}>
                <FooterAnchor link={link} className="text-xs text-white/60 transition-colors hover:text-white" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
