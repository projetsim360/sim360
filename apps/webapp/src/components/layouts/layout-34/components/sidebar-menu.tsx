import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { APP_SIDEBAR_MENU } from '@/config/menu.config';

export function SidebarMenu() {
  const items = APP_SIDEBAR_MENU
    .filter((item) => item.title && item.icon && !item.heading)
    .map((item, index) => ({
      id: index + 1,
      title: item.title!,
      path: item.path ?? '#',
      icon: item.icon!,
      badge: item.badge,
    }));

  return (
    <nav className="flex flex-col space-y-0.5 px-2.5 pt-1">
      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              'flex items-center justify-between rounded-lg px-2.5 text-sm font-medium transition-colors h-[34px] border border-transparent',
              'hover:bg-muted/60 hover:text-foreground',
              isActive
                ? 'bg-muted text-foreground border-border'
                : 'text-muted-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <div className="size-[24px] flex items-center justify-center rounded-md border-[2px] border-background bg-muted shadow-[0_1px_3px_0_rgba(0,0,0,0.14)]">
                <item.icon className="size-3.5" />
              </div>
              <span>{item.title}</span>
            </div>

            {item.badge && (
              <Badge variant="secondary" appearance="light" size="sm">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
