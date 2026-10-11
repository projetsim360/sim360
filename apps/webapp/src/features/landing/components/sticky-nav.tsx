import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import { useAuth } from '@/providers/auth-provider';
import { resolveAssetUrl } from '@/lib/asset-url';
import { getUserDisplayName, getUserInitials } from '@/lib/user-display';
import { cn } from '@/lib/utils';
import { usePublicPath } from '../hooks/use-public-locale';
import { LanguageSwitcher } from './language-switcher';

const NAV_LINKS = [
  { id: 'nav.features', href: '#fonctionnalites' },
  { id: 'nav.howItWorks', href: '#comment-ca-marche' },
  { id: 'nav.pricing', href: '#tarifs' },
  { id: 'nav.faq', href: '#faq' },
] as const;

/**
 * Sign-in / trial buttons for visitors, a single "Dashboard" entry for signed-in users.
 * While the session is being restored, a fixed-width skeleton keeps the layout still.
 */
function AuthActions({ stacked = false, onNavigate }: { stacked?: boolean; onNavigate?: () => void }) {
  const { user, isLoading } = useAuth();
  const { formatMessage } = useIntl();
  const wide = stacked ? 'w-full' : undefined;

  if (isLoading) {
    return <div aria-hidden="true" className={cn('h-8 animate-pulse rounded-md bg-foreground/10', stacked ? 'w-full' : 'w-[180px]')} />;
  }

  if (user) {
    const avatarSrc = resolveAssetUrl(user.avatar);
    return (
      <Link to="/dashboard" onClick={onNavigate} className={wide}>
        <Button variant="primary" size="sm" className={cn('gap-2 pl-1.5', wide)}>
          <Avatar className="size-6">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={getUserDisplayName(user)} className="object-cover" />}
            <AvatarFallback className="text-[10px]">{getUserInitials(user)}</AvatarFallback>
          </Avatar>
          {formatMessage({ id: 'nav.dashboard' })}
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Link to="/auth/sign-in" onClick={onNavigate} className={wide}>
        <Button variant="outline" size="sm" className={wide}>
          {formatMessage({ id: 'nav.signIn' })}
        </Button>
      </Link>
      <Link to="/auth/sign-up" onClick={onNavigate} className={wide}>
        <Button variant="primary" size="sm" className={wide}>
          {formatMessage({ id: 'nav.freeTrial' })}
        </Button>
      </Link>
    </>
  );
}

/** Nearest ancestor that scrolls vertically, or the window. `html`/`body` are `h-full` here, so the page scrolls inside `#root`. */
function findScrollParent(start: HTMLElement | null): HTMLElement | Window {
  for (let el = start; el && el !== document.body; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
  }
  return window;
}

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { formatMessage } = useIntl();
  const to = usePublicPath();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scroller = findScrollParent(headerRef.current?.parentElement ?? null);
    const offset = () => (scroller instanceof Window ? scroller.scrollY : scroller.scrollTop);
    const onScroll = () => setScrolled(offset() > 20);
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || mobileOpen ? 'border-b border-border bg-card/80 shadow-sm backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to={to('/')} aria-label={formatMessage({ id: 'nav.home' })}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {formatMessage({ id: link.id })}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <AuthActions />
        </div>

        <button
          type="button"
          className="p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={formatMessage({ id: mobileOpen ? 'nav.closeMenu' : 'nav.menu' })}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-5 border-t border-border bg-card px-6 py-6 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              onClick={closeMobile}
            >
              {formatMessage({ id: link.id })}
            </a>
          ))}
          <LanguageSwitcher className="-ml-2.5 self-start" onNavigate={closeMobile} />
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <AuthActions stacked onNavigate={closeMobile} />
          </div>
        </div>
      )}
    </header>
  );
}
