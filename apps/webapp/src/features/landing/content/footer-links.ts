import type { PublicMessageKey } from '../../../i18n/public-messages';

/**
 * Footer navigation, single source of truth. Links whose page does not exist yet are
 * declared with `ready: false` and not rendered: no dead `#` links on the public site.
 * Flip `ready` as the footer pages ship (roadmap lot 4).
 */
export interface FooterLink {
  labelKey: PublicMessageKey;
  /** Public path (`/contact`), in-page anchor (`#tarifs`) or external URL. */
  href: string;
  ready: boolean;
}

export const FOOTER_PRODUCT_LINKS: readonly FooterLink[] = [
  { labelKey: 'footer.link.features', href: '#fonctionnalites', ready: true },
  { labelKey: 'footer.link.howItWorks', href: '#comment-ca-marche', ready: true },
  { labelKey: 'footer.link.pricing', href: '#tarifs', ready: true },
  { labelKey: 'footer.link.faq', href: '#faq', ready: true },
  { labelKey: 'footer.link.scenarios', href: '/scenarios', ready: false },
  { labelKey: 'footer.link.demo', href: '/demo', ready: false },
];

export const FOOTER_COMPANY_LINKS: readonly FooterLink[] = [
  { labelKey: 'footer.link.about', href: '/a-propos', ready: false },
  { labelKey: 'footer.link.careers', href: '/carrieres', ready: false },
  { labelKey: 'footer.link.contact', href: 'mailto:hello@simex.pro', ready: true },
];

export const FOOTER_LEGAL_LINKS: readonly FooterLink[] = [
  { labelKey: 'footer.link.privacy', href: '/confidentialite', ready: false },
  { labelKey: 'footer.link.terms', href: '/cgu', ready: false },
  { labelKey: 'footer.link.legal', href: '/mentions-legales', ready: false },
  { labelKey: 'footer.link.cookies', href: '/cookies', ready: false },
];

export const SOCIAL_LINKS = {
  linkedin: { href: 'https://www.linkedin.com/company/simex-pro', ready: false },
} as const;
