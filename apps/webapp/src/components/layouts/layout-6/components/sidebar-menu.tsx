import { SidebarMenuPrimary } from './sidebar-menu-primary';
import { SidebarMenuSecondary } from './sidebar-menu-secondary';

export function SidebarMenu() {
  return (
    <div className="kt-scrollable-y-auto grow max-h-[calc(100vh-11.5rem)]">
      <SidebarMenuPrimary />
      <div className="my-6 mx-5 border-t border-[#eae8ee] dark:border-white/10"></div>
      <SidebarMenuSecondary />
    </div>
  );
}
