import { AppsDropdownMenu } from '@/components/layouts/layout-1/shared/topbar/apps-dropdown-menu';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chat-sheet';
import { UserDropdownMenu } from '@/components/layouts/layout-1/shared/topbar/user-dropdown-menu';
import { LayoutGrid, MessageCircleMore } from '@/components/keenicons/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SidebarFooter() {
  const { user } = useAuth();
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  return (
    <div className="flex flex-center justify-between shrink-0 ps-4 pe-3.5 mb-3.5">
      <UserDropdownMenu
        trigger={
          <Avatar className="size-9 cursor-pointer border-2 border-secondary shrink-0">
            {user?.avatar ? (
              <AvatarImage
                src={`${apiBase}${user.avatar}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="size-9"
              />
            ) : null}
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
        }
      />

      <div className="flex items-center gap-1.5">
        <ChatSheet
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              className="hover:bg-background hover:[&_svg]:text-primary [&_i]:text-primary"
            >
              <MessageCircleMore className="size-4.5!" />
            </Button>
          }
        />

        <AppsDropdownMenu
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              className="hover:bg-background hover:[&_svg]:text-primary [&_i]:text-primary"
            >
              <LayoutGrid className="size-4.5!" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
