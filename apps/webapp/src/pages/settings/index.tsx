import { useRef, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Scrollspy } from '@/components/ui/scrollspy';
import { PageHeader } from '@/components/page-header';
import { SettingsSidebar } from './components/settings-sidebar';
import { BasicSettings } from './components/basic-settings';
import { AuthEmail } from './components/auth-email';
import { AuthPassword } from './components/auth-password';
import { AuthSocial } from './components/auth-social';
import { AuthTwoFactor } from './components/auth-two-factor';
import { Preferences } from './components/preferences';
import { Appearance } from './components/appearance';
import { Notifications } from './components/notifications';
import { DeleteAccount } from './components/delete-account';
import { useT } from '@/i18n/app/use-t';

export function SettingsPage() {
  const t = useT();
  const isMobile = useIsMobile();
  const parentRef = useRef<HTMLElement | Document>(document);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // SimexShell uses a <main> with overflow-y-auto as the page scroller.
    // Walk up from the PageHeader to find it. Fall back to the older
    // .kt-scrollable-y-auto class for any non-SimexShell layout that may
    // still render this page (defensive — not expected in production).
    const pageHeader = document.querySelector('[data-slot="toolbar-heading"]');
    const scrollable =
      (pageHeader?.closest('main') as HTMLElement | null) ??
      (pageHeader?.closest('.kt-scrollable-y-auto') as HTMLElement | null);
    (parentRef as React.MutableRefObject<HTMLElement | Document>).current =
      scrollable ?? document;
    setReady(true);
  }, []);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: t('settings.nav.account') }, { label: t('menu.settings') }]}
        title={t('menu.settings')}
        subtitle={t('settings.subtitle')}
      />

      <div className="px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-7 lg:gap-7.5">
          {/* Sidebar interne — desktop only */}
          {!isMobile && (
            <aside className="w-[230px] shrink-0">
              <div className="sticky top-4">
                {ready && (
                  <Scrollspy offset={100} targetRef={parentRef}>
                    <SettingsSidebar />
                  </Scrollspy>
                )}
              </div>
            </aside>
          )}

          {/* Cards column */}
          <div className="flex flex-col gap-6 lg:gap-7">
            <BasicSettings />
            <AuthEmail />
            <AuthPassword />
            <AuthSocial />
            <AuthTwoFactor />
            <Preferences />
            <Appearance />
            <Notifications />
            <DeleteAccount />
          </div>
        </div>
      </div>
    </>
  );
}
