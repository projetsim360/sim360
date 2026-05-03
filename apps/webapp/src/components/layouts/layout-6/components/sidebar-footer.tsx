import { MessageCircleMore, MessageSquareDot } from '@/components/keenicons/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserDropdownMenu } from '../../layout-1/shared/topbar/user-dropdown-menu';
import { NotificationsSheet } from '../../layout-1/shared/topbar/notifications-sheet';
import { ChatSheet } from '../../layout-1/shared/topbar/chat-sheet';
import { ThemeToggle } from '@/components/theme-toggle';
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
          <Avatar className="size-9 cursor-pointer border-2 border-border dark:border-white/20 shrink-0">
            {user?.avatar ? (
              <AvatarImage
                src={`${apiBase}${user.avatar}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="size-9"
              />
            ) : null}
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground dark:bg-white/15">{initials}</AvatarFallback>
          </Avatar>
        }
      />

      <div className="flex flex-center gap-1.5">
        <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10" />
        <NotificationsSheet
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              aria-label="Notifications"
              className="text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-lg [&_i]:text-muted-foreground"
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
              className="text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-lg [&_i]:text-muted-foreground"
            >
              <MessageCircleMore className="size-4.5!" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
