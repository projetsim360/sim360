'use client';

import { JSX, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuConfig, MenuItem } from '@/config/types';
import { useContextualMenu } from '@/hooks/use-contextual-menu';
import { useSimulationCounts } from '@/features/simulation/hooks/use-simulation-counts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from '@/components/keenicons/icons';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { useSidebarSearch } from './sidebar';

const menuItemMatches = (item: MenuItem, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  if (item.title && item.title.toLowerCase().includes(lowerQuery)) return true;
  if (item.heading && item.heading.toLowerCase().includes(lowerQuery)) return true;
  if (item.children) return item.children.some((child) => menuItemMatches(child, query));
  return false;
};

const filterMenuItems = (items: MenuConfig, query: string): MenuConfig => {
  if (!query) return items;
  return items.filter((item) => menuItemMatches(item, query));
};

export function SidebarMenuPrimary() {
  const { pathname } = useLocation();
  const { menu, isInSimulation, simulationId } = useContextualMenu();
  const { data: counts } = useSimulationCounts(simulationId);
  const { searchQuery } = useSidebarSearch();

  const filteredMenu = useMemo(() => filterMenuItems(menu, searchQuery), [menu, searchQuery]);

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  // Global classNames for consistent styling
  const classNames: AccordionMenuClassNames = {
    root: 'space-y-3 px-3.5',
    group: 'gap-0.5',
    label:
      'uppercase text-[0.6rem] tracking-widest font-medium text-[#8a7daa] dark:text-white/35 pt-2.25 pb-px',
    separator: '',
    item: 'h-9.5 font-bold hover:bg-white dark:hover:bg-white/8 rounded-lg border border-transparent text-[#4b2f95] dark:text-white/75 [&_svg]:text-[#4b2f95] dark:[&_svg]:text-white/70 hover:text-[#4b2f95] dark:hover:text-white hover:[&_svg]:text-[#4b2f95] dark:hover:[&_svg]:text-white data-[selected=true]:text-[#4b2f95] dark:data-[selected=true]:text-white data-[selected=true]:bg-white data-[selected=true]:shadow-xs dark:data-[selected=true]:bg-white/12 dark:data-[selected=true]:shadow-none data-[selected=true]:rounded-lg data-[selected=true]:border-transparent data-[selected=true]:font-bold data-[selected=true]:[&_svg]:text-[#4b2f95] dark:data-[selected=true]:[&_svg]:text-white',
    sub: '',
    subTrigger:
      'h-9.5 font-bold hover:bg-white dark:hover:bg-white/8 rounded-lg border border-transparent text-[#4b2f95] dark:text-white/75 [&_svg]:text-[#4b2f95] dark:[&_svg]:text-white/70 hover:text-[#4b2f95] dark:hover:text-white hover:[&_svg]:text-[#4b2f95] dark:hover:[&_svg]:text-white data-[selected=true]:text-[#4b2f95] dark:data-[selected=true]:text-white data-[selected=true]:bg-white data-[selected=true]:shadow-xs dark:data-[selected=true]:bg-white/12 dark:data-[selected=true]:shadow-none data-[selected=true]:rounded-lg data-[selected=true]:border-transparent data-[selected=true]:font-bold data-[selected=true]:[&_svg]:text-[#4b2f95] dark:data-[selected=true]:[&_svg]:text-white',
    subContent: 'py-0',
    indicator: 'text-[#8a7daa] dark:text-white/50',
  };

  const getCountForKey = (key: string | undefined): number | undefined => {
    if (!key || !counts) return undefined;
    return (counts as Record<string, unknown>)[key] as number | undefined;
  };

  const isSimulationCompleted = counts?.simulationStatus === 'COMPLETED';

  const buildMenu = (items: MenuConfig): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      // Headings
      if (item.heading) {
        // Masquer les headings conditionnels "completed" si pas terminée
        if (item.showWhen === 'completed' && !isSimulationCompleted) {
          return <span key={`heading-hidden-${index}`} />;
        }
        return null as unknown as JSX.Element;
      }

      if (item.disabled) {
        return <span key={`empty-${index}`} />;
      }

      // Back link — rendu spécial
      if (item.isBackLink) {
        return (
          <div key={`back-${index}`} className="pb-2.5 mb-1">
            <Link
              to={item.path || '/simulations'}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#8a7daa] dark:text-white/60 hover:text-[#4b2f95] dark:hover:text-white transition-colors rounded-lg hover:bg-white dark:hover:bg-white/8"
            >
              <ArrowLeft className="size-3.5 text-[#8a7daa] dark:text-white/60" />
              <span>{item.title}</span>
            </Link>
          </div>
        );
      }

      // Items avec showWhen === 'completed' : masqué ou grisé
      if (item.showWhen === 'completed' && !isSimulationCompleted) {
        return <span key={`hidden-${index}`} />;
      }

      return buildMenuItemRoot(item, index);
    });
  };

  const buildMenuItemRoot = (item: MenuItem, index: number): JSX.Element => {
    const badgeCount = getCountForKey(item.badgeKey);

    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className="text-sm font-bold">
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title" className="flex items-center gap-2">
              {item.title}
              {isInSimulation && badgeCount !== undefined && badgeCount > 0 && (
                <Badge className="bg-[#d4836a] text-white border-transparent" size="xs" shape="circle">
                  {badgeCount}
                </Badge>
              )}
            </span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(item.children, 1)}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-sm font-bold"
        >
          <Link to={item.path || '#'} className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              {item.icon && <item.icon data-slot="accordion-menu-icon" />}
              <span data-slot="accordion-menu-title">{item.title}</span>
            </span>
            {isInSimulation && badgeCount !== undefined && badgeCount > 0 && (
              <Badge variant="primary" size="xs" shape="circle">
                {badgeCount}
              </Badge>
            )}
          </Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemChildren = (
    items: MenuConfig,
    level: number = 0,
  ): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (!item.heading && !item.disabled) {
        return buildMenuItemChild(item, index, level);
      } else {
        return <span key={`empty-child-${level}-${index}`} />;
      }
    });
  };

  const buildMenuItemChild = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className="text-[13px]">
            {item.collapse ? (
              <span className="text-[#8b8694] dark:text-white/50">
                <span className="hidden [[data-state=open]>span>&]:inline">
                  {item.collapseTitle}
                </span>
                <span className="inline [[data-state=open]>span>&]:hidden">
                  {item.expandTitle}
                </span>
              </span>
            ) : (
              item.title
            )}
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `child-${level}-${index}`}
            className={cn(
              'ps-4',
              !item.collapse && 'relative',
              !item.collapse && (level > 0 ? '' : ''),
            )}
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(
                item.children,
                item.collapse ? level : level + 1,
              )}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-[13px]"
        >
          <Link to={item.path || '#'}>{item.title}</Link>
        </AccordionMenuItem>
      );
    }
  };

  return (
    <AccordionMenu
      type="single"
      selectedValue={pathname}
      matchPath={matchPath}
      collapsible
      classNames={classNames}
    >
      {buildMenu(filteredMenu)}
    </AccordionMenu>
  );
}
