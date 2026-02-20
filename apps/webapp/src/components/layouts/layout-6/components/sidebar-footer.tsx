import { MessageCircleMore, MessageSquareDot } from '@/components/keenicons/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserDropdownMenu } from '../../layout-1/shared/topbar/user-dropdown-menu';
import { NotificationsSheet } from '../../layout-1/shared/topbar/notifications-sheet';
import { ChatSheet } from '../../layout-1/shared/topbar/chat-sheet';
import { useAuth } from '@/providers/auth-provider';

export function SidebarFooter() {
  const { user } = useAuth();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?';

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  return (
    <div className="flex flex-center justify-between shrink-0 ps-4 pe-3.5 h-14">
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

      <div className="flex flex-center gap-1.5">
        <NotificationsSheet
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              className="hover:bg-background hover:[&_svg]:text-primary [&_i]:text-primary"
            >
              <MessageSquareDot className="size-4.5!" />
            </Button>
          }
        />
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
      </div>
    </div>
  );
}
