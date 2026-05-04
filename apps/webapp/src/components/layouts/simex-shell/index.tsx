import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ShellStateProvider, useShellState } from './state/shell-state-provider';
import { Topbar } from './components/topbar';
import { Sidebar } from './components/sidebar';
import { PmoPanel } from './components/pmo-panel';
import { SearchModal } from './components/search-modal';
import { NotifPopover } from './components/notif-popover';
import { UserMenu } from './components/user-menu';
import { DemoControls } from './components/demo-controls';

/* Inner shell — needs access to ShellState context */
function SimexShellInner() {
  const { contentMode } = useShellState();

  useEffect(() => {
    document.title = 'Simex pro';
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      {/* Topbar — fixed, full width, z-30 */}
      <Topbar />

      {/* Sidebar — fixed left, below topbar */}
      <Sidebar />

      {/* Popovers — fixed positioning, rendered at root level */}
      <NotifPopover />
      <UserMenu />

      {/* Search modal — fixed full-screen overlay */}
      <SearchModal />

      {/* Main content area */}
      <main
        className="simex-main fixed bottom-0 right-0 left-0 lg:left-[260px] overflow-y-auto overflow-x-hidden bg-background flex items-start lg:rounded-tl-[18px]"
        style={{ top: '64px' }}
      >
        {/* Page content column */}
        <div className="min-w-0 flex-1 px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-16">
          <div
            className="simex-main-inner mx-auto"
            style={{ maxWidth: contentMode === 'centre' ? '1080px' : '1280px' }}
          >
            <Outlet />
          </div>
        </div>

        {/* PMO panel — sticky inside main, slide in from right */}
        <PmoPanel />
      </main>

      {/* Demo controls bar — gated by VITE_SIMEX_DEMO_CONTROLS */}
      <DemoControls />
    </div>
  );
}

/* Public export — wraps with the state provider */
export function SimexShell() {
  return (
    <ShellStateProvider>
      <SimexShellInner />
    </ShellStateProvider>
  );
}

export default SimexShell;
