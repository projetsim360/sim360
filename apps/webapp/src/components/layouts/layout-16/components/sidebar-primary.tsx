import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import {
  Mails,
  NotepadText,
  Settings,
  Users,
  User,
  Clock,
  Shield,
  Building2,
  LogOut,
  Download,
  ExternalLink,
  Zap,
  Target,
  Sun,
  Moon,
} from '@/components/keenicons/icons';
import { APP_ICON_RAIL_MENU } from '@/config/menu.config';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const menuItems = APP_ICON_RAIL_MENU
  .filter((item) => !item.separator && item.title && item.icon)
  .map((item) => ({
    icon: item.icon!,
    tooltip: item.title!,
    path: item.path ?? '#',
    rootPath: item.rootPath,
  }));

export function SidebarPrimary() {
  const { pathname } = useLocation();
  const [selectedMenuItem, setSelectedMenuItem] = useState(menuItems[1]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // You can add actual theme switching logic here
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    menuItems.forEach((item) => {
      if (
        item.rootPath === pathname ||
        (item.rootPath && pathname.includes(item.rootPath))
      ) {
        setSelectedMenuItem(item);
      }
    });
  }, [pathname]);

  return (
    <div className="flex flex-col items-center justify-center shrink-0 py-2.5 m-2.5 gap-5 w-16 lg:w-(--sidebar-collapsed-width) bg-black rounded-2xl">
      <div className="flex items-center justify-center shrink-0 py-2.5 pt-2.5">
        <Link to="/layout-16">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-gray-dark.svg')}
            className="dark:hidden min-h-[30px]"
            alt="Logo"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-gray.svg')}
            className="hidden dark:block min-h-[30px]"
            alt="Logo"
          />
        </Link>
      </div>
      {/* Navigation */}
      <ScrollArea className="grow w-full h-[calc(100vh-20rem)] lg:h-[calc(100vh-5.5rem)]">
        <div className="grow gap-1.5 shrink-0 flex items-center flex-col">
          {menuItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  mode="icon"
                  {...(item === selectedMenuItem
                    ? { 'data-state': 'open' }
                    : {})}
                  className={cn(
                    'shrink-0 rounded-md size-9',
                    'data-[state=open]:bg-[#262626] hover:bg-[#262626] data-[state=open]:text-primary-foreground',
                    'hover:text-primary-foreground',
                  )}
                >
                  <Link to={item.path}>
                    <item.icon className="size-4.5!" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <Button variant="ghost" mode="icon" className="text-muted-foreground hover:text-primary-foreground hover:bg-[#262626]">
          <Mails className="opacity-100"/>
        </Button>

        <Button variant="ghost" mode="icon" className="text-muted-foreground hover:text-primary-foreground hover:bg-[#262626]">
          <NotepadText className="opacity-100"/>
        </Button>
        
        <Button variant="ghost" mode="icon" className="text-muted-foreground hover:text-primary-foreground hover:bg-[#262626]">
          <Settings className="opacity-100"/>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer mb-2.5">
            <Avatar className="size-7">
              {user?.avatar ? (
                <AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
              <AvatarIndicator className="-end-2 -top-2">
                <AvatarStatus variant="online" className="size-2.5" />
              </AvatarIndicator>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mb-4" side="right" align="start" sideOffset={11}>
            {/* User Information Section */}
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar>
                {user?.avatar ? (
                  <AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
                <AvatarIndicator className="-end-1.5 -top-1.5">
                  <AvatarStatus variant="online" className="size-2.5" />
                </AvatarIndicator>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-foreground">{fullName}</span>
                <span className="text-xs text-muted-foreground">{user?.role || ''}</span>
                <Badge variant="success" appearance="outline" size="sm" className="mt-1">Pro Plan</Badge>
              </div>
            </div>
            
            <DropdownMenuItem className="cursor-pointer py-1 rounded-md border border-border hover:bg-muted">
              <Clock/>
              <span>Set availability</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Core Actions */}
            <DropdownMenuItem>
              <Target/>
              <span>My Projects</span>
              <Badge variant="info" size="sm" appearance="outline" className="ms-auto">3</Badge>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Users/>
              <span>Team Management</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Building2/>
              <span>Organization</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Settings */}
            <DropdownMenuItem>
              <User/>
              <span>Profile Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Settings/>
              <span>Preferences</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Shield/>
              <span>Security</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Theme Toggle */}
            <DropdownMenuItem onClick={toggleTheme}>
              {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Developer Tools */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Zap/>
                <span>Developer Tools</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem>API Documentation</DropdownMenuItem>
                <DropdownMenuItem>Code Repository</DropdownMenuItem>
                <DropdownMenuItem>Testing Suite</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem>
              <Download/>
              <span>Download SDK</span>
              <ExternalLink className="size-3 ms-auto" />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Action Items */}
            <DropdownMenuItem onClick={logout}>
              <LogOut/>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
