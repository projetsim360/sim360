import { createContext, useContext, useState } from 'react';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from './sidebar-menu';

interface SidebarSearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SidebarSearchContext = createContext<SidebarSearchContextValue>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export const useSidebarSearch = () => useContext(SidebarSearchContext);

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SidebarSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="fixed top-0 bottom-0 z-20 lg:flex flex-col shrink-0 w-(--sidebar-width) bg-[#f7f5fa] dark:bg-[#2a2543] border-r border-[#eae8ee] dark:border-white/10">
        <SidebarHeader />
        <SidebarMenu />
        <SidebarFooter />
      </div>
    </SidebarSearchContext.Provider>
  );
}
