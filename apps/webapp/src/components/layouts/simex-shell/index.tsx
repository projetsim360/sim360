import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './components/topbar';
import { Sidebar } from './components/sidebar';
import { PmoPanel } from './components/pmo-panel';
import { SearchModal } from './components/search-modal';
import { NotifPopover } from './components/notif-popover';
import { UserMenu } from './components/user-menu';

export function SimexShell() {
  useEffect(() => {
    document.title = 'Simex pro';
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-[var(--brand-700)]">
      {/* Topbar — fixed, full width, z-30 */}
      <Topbar />

      {/* Sidebar — fixed left, below topbar */}
      <Sidebar />

      {/* Popovers — rendered at topbar level, hidden by default (LOT B) */}
      <NotifPopover />
      <UserMenu />

      {/* Main content area — fixed, offset from sidebar and topbar */}
      <main
        className="fixed bottom-0 right-0 overflow-y-auto overflow-x-hidden bg-background flex items-start"
        style={{
          top: '64px',
          left: '260px',
          borderRadius: '18px 0 0 0',
        }}
      >
        {/* Page content column */}
        <div className="min-w-0 flex-1 px-8 py-7 pb-16">
          <div className="mx-auto max-w-[1280px]">
            <Outlet />
          </div>
        </div>

        {/* PMO panel — sticky inside main, collapsed by default */}
        <PmoPanel />
      </main>

      {/* Search modal — fixed, full screen, hidden by default (LOT B) */}
      <SearchModal />
    </div>
  );
}

export default SimexShell;
