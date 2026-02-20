import { ReactNode } from 'react';
import {
  Globe,
  LayoutGrid,
  LogOut,
  Moon,
  Settings,
  UserCircle,
} from '@/components/keenicons/icons';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/providers/auth-provider';

const I18N_LANGUAGES = [
  {
    label: 'Français',
    code: 'fr',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/france.svg'),
  },
  {
    label: 'English',
    code: 'en',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/united-states.svg'),
  },
];

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const { user, logout } = useAuth();
  const currenLanguage = I18N_LANGUAGES[0];
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-9 border-2 border-green-500">
              {user?.avatar ? (
                <AvatarImage
                  src={`${apiBase}${user.avatar}`}
                  alt={fullName}
                  className="size-9"
                />
              ) : null}
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                to="/profile/edit"
                className="text-sm text-mono hover:text-primary font-semibold"
              >
                {fullName}
              </Link>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </div>
          {user?.role && (
            <Badge variant="primary" appearance="light" size="sm">
              {user.role}
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link to="/profile/edit" className="flex items-center gap-2">
            <UserCircle />
            Mon profil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Settings />
            Tableau de bord
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/settings/layout" className="flex items-center gap-2">
            <LayoutGrid />
            Changer de layout
          </Link>
        </DropdownMenuItem>

        {/* Language Submenu with Radio Group */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 [&_[data-slot=dropdown-menu-sub-trigger-indicator]]:hidden hover:[&_[data-slot=badge]]:border-input data-[state=open]:[&_[data-slot=badge]]:border-input">
            <Globe />
            <span className="flex items-center justify-between gap-2 grow relative">
              Langue
              <Badge
                variant="outline"
                className="absolute end-0 top-1/2 -translate-y-1/2"
              >
                {currenLanguage.label}
                <img
                  src={currenLanguage.flag}
                  className="w-3.5 h-3.5 rounded-full"
                  alt={currenLanguage.label}
                />
              </Badge>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup value={currenLanguage.code}>
              {I18N_LANGUAGES.map((item) => (
                <DropdownMenuRadioItem
                  key={item.code}
                  value={item.code}
                  className="flex items-center gap-2"
                >
                  <img
                    src={item.flag}
                    className="w-4 h-4 rounded-full"
                    alt={item.label}
                  />
                  <span>{item.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Mode sombre
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="p-2 mt-1">
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="size-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
