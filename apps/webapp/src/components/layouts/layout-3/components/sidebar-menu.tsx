import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { APP_ICON_RAIL_MENU } from '@/config/menu.config';

export interface Item {
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  title: string;
  newTab?: boolean;
  active?: boolean;
}

export function SidebarMenu() {
  const items: Item[] = APP_ICON_RAIL_MENU
    .filter((item) => !item.separator && item.title && item.icon)
    .map((item) => ({
      icon: item.icon!,
      path: item.path ?? '#',
      title: item.title!,
    }));

  return (
    <TooltipProvider>
      <div className="flex flex-col grow items-center py-3.5 lg:py-0 gap-2.5">
        {items.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                shape="circle"
                mode="icon"
                {...(item.active ? { 'data-state': 'open' } : {})}
                className={cn(
                  'data-[state=open]:bg-background data-[state=open]:border data-[state=open]:border-input data-[state=open]:text-primary',
                  'hover:bg-background hover:border hover:border-input hover:text-primary',
                )}
              >
                <Link
                  to={item.path || ''}
                  {...(item.newTab
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  <item.icon className="size-4.5!" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
