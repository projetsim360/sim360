'use client';

import { Fragment } from 'react';
import {
  ChevronDown,
  type LucideIcon,
} from '@/components/keenicons/icons';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuItem,
  AccordionMenuSeparator,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { APP_RESOURCES_MENU } from '@/config/menu.config';

interface Item {
  title: string;
  value: string;
  plus?: boolean;
  children: ItemChild[];
}

interface ItemChild {
  icon?: LucideIcon;
  title: string;
  path: string;
  active?: boolean;
}

export function SidebarMenuSecondary() {
  const items: Item[] = APP_RESOURCES_MENU.map((group) => ({
    title: group.title ?? 'Ressources',
    value: (group.title ?? 'ressources').toLowerCase().replace(/\s+/g, '-'),
    plus: false,
    children: (group.children ?? []).map((child) => ({
      icon: child.icon,
      title: child.title ?? '',
      path: child.path ?? '#',
    })),
  }));

  const classNames: AccordionMenuClassNames = {
    root: 'flex flex-col w-full gap-1.5 px-3.5',
    group: 'gap-px',
    item: 'group h-9.5 font-bold hover:bg-white dark:hover:bg-white/8 rounded-lg border border-transparent text-[#4b2f95] dark:text-white/75 hover:text-[#4b2f95] dark:hover:text-white data-[selected=true]:text-[#4b2f95] dark:data-[selected=true]:text-white data-[selected=true]:bg-white data-[selected=true]:shadow-xs dark:data-[selected=true]:bg-white/12 dark:data-[selected=true]:shadow-none data-[selected=true]:rounded-lg data-[selected=true]:border-transparent data-[selected=true]:font-bold',
    sub: '',
    subTrigger:
      'justify-between h-9.5 font-bold hover:bg-white dark:hover:bg-white/8 rounded-lg border border-transparent text-[#4b2f95] dark:text-white/75 hover:text-[#4b2f95] dark:hover:text-white data-[selected=true]:text-[#4b2f95] dark:data-[selected=true]:text-white data-[selected=true]:bg-white data-[selected=true]:shadow-xs dark:data-[selected=true]:bg-white/12 dark:data-[selected=true]:shadow-none data-[selected=true]:rounded-lg data-[selected=true]:border-transparent data-[selected=true]:font-bold [&_[data-slot=accordion-menu-sub-indicator]]:hidden',
    subContent: 'p-0',
    subWrapper: 'space-y-1.5',
    indicator: 'text-sm text-[#8a7daa] dark:text-white/50',
  };

  return (
    <>
      <AccordionMenu
        type="single"
        collapsible
        classNames={classNames}
        defaultValue="spaces"
      >
        {items.map((item, index) => (
          <Fragment key={index}>
            <AccordionMenuSub value={item.value}>
              <AccordionMenuSubTrigger>
                <div className="flex items-center gap-2">
                  <ChevronDown className={cn('text-sm')} />
                  <span>{item.title}</span>
                </div>
              </AccordionMenuSubTrigger>
              <AccordionMenuSubContent
                type="single"
                collapsible
                parentValue={item.value}
              >
                {item.children.map((child, childIndex) => (
                  <AccordionMenuItem
                    key={childIndex}
                    value={child.path}
                    className={cn(child.active && 'active')}
                  >
                    <Link to={child.path} className="flex items-center gap-2">
                      {child.icon && (
                        <span className="rounded-md size-7 flex items-center justify-center border border-[#eae8ee] dark:border-white/20 text-[#8b8694] dark:text-white/70 group-hover:border-transparent group-hover:text-[#4b2f95] dark:group-hover:text-white">
                          <child.icon className="size-4" />
                        </span>
                      )}
                      {child.title}
                    </Link>
                  </AccordionMenuItem>
                ))}
              </AccordionMenuSubContent>
            </AccordionMenuSub>
            {index !== items.length - 1 && (
              <AccordionMenuSeparator className="my-3 mx-1.5" />
            )}
          </Fragment>
        ))}
      </AccordionMenu>
    </>
  );
}
