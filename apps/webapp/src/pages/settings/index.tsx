import { useRef, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Scrollspy } from '@/components/ui/scrollspy';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { SettingsSidebar } from './components/settings-sidebar';
import { BasicSettings } from './components/basic-settings';
import { AuthEmail } from './components/auth-email';
import { AuthPassword } from './components/auth-password';
import { AuthSocial } from './components/auth-social';
import { AuthTwoFactor } from './components/auth-two-factor';
import { Preferences } from './components/preferences';
import { Appearance } from './components/appearance';
import { Notifications } from './components/notifications';
import { LayoutSettings } from './components/layout-settings';
import { DeleteAccount } from './components/delete-account';

export function SettingsPage() {
  const isMobile = useIsMobile();
  const parentRef = useRef<HTMLElement | Document>(document);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Find the scrollable container that actually has overflow (scrollHeight > clientHeight)
    // Multiple .kt-scrollable-y-auto elements may exist; pick the one with real scroll
    const candidates = document.querySelectorAll('.kt-scrollable-y-auto');
    const scrollable = Array.from(candidates).find(
      (el) => el.scrollHeight > el.clientHeight,
    );
    if (scrollable) {
      (parentRef as React.MutableRefObject<HTMLElement | Document>).current = scrollable as HTMLElement;
    } else {
      (parentRef as React.MutableRefObject<HTMLElement | Document>).current = document;
    }
    setReady(true);
  }, []);

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Paramètres" />
      </Toolbar>

      <div className="flex grow gap-5 lg:gap-7.5">
        {!isMobile && (
          <div className="w-[230px] shrink-0">
            <div className="w-[230px] sticky top-[3rem]">
              {ready && (
                <Scrollspy offset={100} targetRef={parentRef}>
                  <SettingsSidebar />
                </Scrollspy>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-stretch grow gap-5 lg:gap-7.5">
          <BasicSettings />
          <AuthEmail />
          <AuthPassword />
          <AuthSocial />
          <AuthTwoFactor />
          <Preferences />
          <Appearance />
          <Notifications />
          <LayoutSettings />
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}
