'use client';

import { JSX, useCallback } from 'react';
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

export function SidebarMenuPrimary() {
  const { pathname } = useLocation();
  const { menu, isInSimulation, simulationId } = useContextualMenu();
  const { data: counts } = useSimulationCounts(simulationId);

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  // Global classNames for consistent styling
  const classNames: AccordionMenuClassNames = {
    root: 'space-y-2.5 px-3.5',
    group: 'gap-px',
    label:
      'uppercase text-xs font-medium text-muted-foreground/70 pt-2.25 pb-px',
    separator: '',
    item: 'h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-mono data-[selected=true]:text-white data-[selected=true]:bg-primary data-[selected=true]:border-primary data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-mono data-[selected=true]:text-white data-[selected=true]:bg-primary data-[selected=true]:border-primary data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
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
          <div key={`back-${index}`} className="border-b border-input pb-2.5 mb-1">
            <Link
              to={item.path || '/simulations'}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
            >
              <ArrowLeft className="size-3.5" />
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
          <AccordionMenuSubTrigger className="text-sm font-medium">
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title" className="flex items-center gap-2">
              {item.title}
              {isInSimulation && badgeCount !== undefined && badgeCount > 0 && (
                <Badge variant="primary" size="xs" shape="circle">
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
          className="text-sm font-medium"
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
              <span className="text-muted-foreground">
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
      {buildMenu(menu)}
    </AccordionMenu>
  );
}
