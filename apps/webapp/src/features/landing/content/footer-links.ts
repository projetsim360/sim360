import type { PublicMessageKey } from '../../../i18n/public-messages';
import type { PublicRouteId } from '../../../i18n/public-locale';

/**
 * Footer navigation, single source of truth. A link is either a public page (by route id,
 * resolved to the right slug for the current language), an in-page anchor of the landing,
 * or an external URL.
 */
export type FooterLink =
  | { labelKey: PublicMessageKey; route: PublicRouteId }
  | { labelKey: PublicMessageKey; anchor: string }
  | { labelKey: PublicMessageKey; href: string };

export const FOOTER_PRODUCT_LINKS: readonly FooterLink[] = [
  { labelKey: 'footer.link.features', anchor: '#fonctionnalites' },
  { labelKey: 'footer.link.howItWorks', anchor: '#comment-ca-marche' },
  { labelKey: 'footer.link.scenarios', route: 'scenarios' },
  { labelKey: 'footer.link.pricing', anchor: '#tarifs' },
  { labelKey: 'footer.link.demo', route: 'demo' },
  { labelKey: 'footer.link.faq', anchor: '#faq' },
];

export const FOOTER_COMPANY_LINKS: readonly FooterLink[] = [
  { labelKey: 'footer.link.about', route: 'about' },
  { labelKey: 'footer.link.careers', route: 'careers' },
  { labelKey: 'footer.link.contact', route: 'contact' },
];

export const FOOTER_LEGAL_LINKS: readonly FooterLink[] = [
  { labelKey: 'footer.link.privacy', route: 'privacy' },
  { labelKey: 'footer.link.terms', route: 'terms' },
  { labelKey: 'footer.link.legal', route: 'legal' },
  { labelKey: 'footer.link.cookies', route: 'cookies' },
];

export const SOCIAL_LINKS = {
  linkedin: { href: 'https://www.linkedin.com/company/simex-pro', ready: false },
} as const;
