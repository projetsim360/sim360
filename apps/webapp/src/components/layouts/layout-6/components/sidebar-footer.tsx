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
          <Avatar className="size-9 cursor-pointer border-2 border-[#eae8ee] dark:border-white/20 shrink-0">
            {user?.avatar ? (
              <AvatarImage
                src={`${apiBase}${user.avatar}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="size-9"
              />
            ) : null}
            <AvatarFallback className="text-xs font-semibold bg-[#4b2f95] dark:bg-white/15 text-white">{initials}</AvatarFallback>
          </Avatar>
        }
      />

      <div className="flex flex-center gap-1.5">
        <NotificationsSheet
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              aria-label="Notifications"
              className="text-[#8a7daa] dark:text-white/70 hover:text-[#4b2f95] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-lg hover:[&_svg]:text-[#4b2f95] dark:hover:[&_svg]:text-white [&_i]:text-[#8a7daa] dark:[&_i]:text-white/70"
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
              aria-label="Messages"
              className="text-[#8a7daa] dark:text-white/70 hover:text-[#4b2f95] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-lg hover:[&_svg]:text-[#4b2f95] dark:hover:[&_svg]:text-white [&_i]:text-[#8a7daa] dark:[&_i]:text-white/70"
            >
              <MessageCircleMore className="size-4.5!" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
