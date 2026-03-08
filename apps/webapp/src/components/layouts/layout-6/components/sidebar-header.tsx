import { useEffect, useState } from 'react';
import { ChevronDown } from '@/components/keenicons/icons';
import { KeenIcon } from '@/components/keenicons';
import { Link, useLocation } from 'react-router-dom';
import { MENU_ROOT } from '@/config/layout-6.config';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export function SidebarHeader() {
  const { pathname } = useLocation();
  const [selectedMenuItem, setSelectedMenuItem] = useState(MENU_ROOT[1]);

  const handleInputChange = () => {};

  useEffect(() => {
    MENU_ROOT.forEach((item) => {
      if (item.rootPath && pathname.includes(item.rootPath)) {
        setSelectedMenuItem(item);
      }
    });
  }, [pathname]);

  return (
    <div className="mb-3.5">
      <div className="flex items-center justify-between gap-2.5 px-3.5 h-[70px]">
        <Link to="/">
          <div className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-primary text-primary-foreground font-bold text-lg">
            S
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer text-mono font-medium flex items-center justify-between gap-2 w-[150px]">
            Sim360
            <ChevronDown className="size-3.5! text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} side="bottom" align="start">
            {MENU_ROOT.map((item, index) => (
              <DropdownMenuItem
                key={index}
                asChild
                className={cn(item === selectedMenuItem && 'bg-accent')}
              >
                <Link to={item.path || ''}>
                  {item.icon && <item.icon />}
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pt-2.5 px-3.5 mb-1">
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 h-9">
          <KeenIcon icon="magnifier" style="duotone" className="size-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Rechercher"
            onChange={handleInputChange}
            value=""
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none min-w-0"
          />
          <span className="text-[10px] text-muted-foreground shrink-0">
            cmd + /
          </span>
        </div>
      </div>
    </div>
  );
}
