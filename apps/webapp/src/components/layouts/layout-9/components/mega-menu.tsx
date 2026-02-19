import { Link, useLocation } from 'react-router-dom';
import { MENU_MEGA } from '@/config/layout-9.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { MegaMenuSubDefault } from '../../layout-1/shared/mega-menu/components';
import type { MenuItem } from '@/config/types';

export function MegaMenu() {
  const { pathname } = useLocation();
  const { isActive, hasActiveChild } = useMenu(pathname);

  const linkClass = `
    inline-flex flex-row items-center h-12 py-0 border-b border-transparent rounded-none bg-transparent -mb-[1px]
    text-sm text-secondary-foreground font-medium
    hover:text-mono hover:bg-transparent
    focus:text-mono focus:bg-transparent
    data-[active=true]:text-mono data-[active=true]:bg-transparent data-[active=true]:border-mono
    data-[here=true]:text-mono data-[here=true]:bg-transparent data-[here=true]:border-mono
    data-[state=open]:text-mono data-[state=open]:bg-transparent
  `;

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        {MENU_MEGA.map((item, index) => {
          if (!item.children) {
            return (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink asChild>
                  <Link
                    to={item.path || '/'}
                    className={cn(linkClass)}
                    data-active={isActive(item.path) || undefined}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={index}>
              <NavigationMenuTrigger
                className={cn(linkClass)}
                data-active={hasActiveChild(item.children) || undefined}
              >
                {item.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-0">
                <div className="w-full lg:w-[550px]">
                  <div className="pt-4 pb-2 lg:p-7.5">
                    <div className="grid lg:grid-cols-2 gap-5">
                      {item.children.map((section: MenuItem, sIdx) => (
                        <div key={sIdx} className="flex flex-col">
                          {section.title && (
                            <h3 className="text-sm text-foreground font-semibold leading-none ps-2.5 mb-2 lg:mb-4">
                              {section.title}
                            </h3>
                          )}
                          <div className="space-y-0.5">
                            {section.children
                              ? MegaMenuSubDefault(section.children)
                              : section.path && (
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={section.path}
                                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent/50 text-sm"
                                    >
                                      {section.icon && <section.icon className="size-4 text-muted-foreground" />}
                                      {section.title}
                                    </Link>
                                  </NavigationMenuLink>
                                )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
