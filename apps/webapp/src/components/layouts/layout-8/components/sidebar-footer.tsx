import { LayoutGrid, MessageCircleMore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSheet } from '../../layout-1/shared/topbar/chat-sheet';
import { AppsDropdownMenu } from '../../layout-1/shared/topbar/apps-dropdown-menu';
import { UserDropdownMenu } from '../../layout-1/shared/topbar/user-dropdown-menu';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SidebarFooter() {
  const { user } = useAuth();
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  return (
    <div className="flex flex-col gap-5 items-center shrink-0 pb-5">
      <div className="flex flex-col gap-1.5">
        <ChatSheet
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              className="hover:bg-background hover:[&_svg]:text-primary"
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
              className="hover:bg-background hover:[&_svg]:text-primary"
            >
              <LayoutGrid className="size-4.5!" />
            </Button>
          }
        />
      </div>

      <UserDropdownMenu
        trigger={
          <Avatar className="size-8 cursor-pointer border-2 border-secondary shrink-0">
            {user?.avatar ? (
              <AvatarImage
                src={`${apiBase}${user.avatar}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="size-8"
              />
            ) : null}
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
        }
      />
    </div>
  );
}
