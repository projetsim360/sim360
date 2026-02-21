import { ReactNode } from 'react';
import { useNotificationContext } from '@/providers/notification-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Notification } from '@/hooks/use-notifications';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'A l\'instant';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function priorityColor(priority: number): string {
  if (priority >= 3) return 'bg-red-500';
  if (priority >= 2) return 'bg-orange-500';
  return 'bg-blue-500';
}

function NotificationItem({
  notification,
  onRead,
  onArchive,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  const isUnread = !notification.readAt;

  return (
    <div
      className={`flex gap-3 px-5 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${isUnread ? 'bg-muted/30' : ''}`}
      onClick={() => isUnread && onRead(notification.id)}
    >
      <div className="flex-shrink-0 mt-1">
        <div className={`w-2 h-2 rounded-full ${isUnread ? priorityColor(notification.priority) : 'bg-transparent'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm truncate ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.body}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" size="sm">
            {notification.category}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-xs text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onArchive(notification.id);
            }}
          >
            Archiver
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsSheet({ trigger }: { trigger: ReactNode }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    loadMore,
  } = useNotificationContext();

  const unreadNotifications = notifications.filter((n) => !n.readAt);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {trigger}
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-0.5 -end-0.5 pointer-events-none"
              variant="destructive"
              size="xs"
              shape="circle"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="gap-0 sm:w-[500px] inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="mb-0">
          <SheetTitle className="p-3">Notifications</SheetTitle>
        </SheetHeader>
        <SheetBody className="grow p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)]">
            <Tabs defaultValue="all" className="w-full relative">
              <TabsList variant="line" className="w-full px-5 mb-0">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  Non lues
                  {unreadCount > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 absolute top-1 -end-1" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="flex flex-col">
                  {isLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                      Chargement...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                      Aucune notification
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => (
                        <div key={notification.id}>
                          <NotificationItem
                            notification={notification}
                            onRead={markAsRead}
                            onArchive={archiveNotification}
                          />
                          <div className="border-b border-b-border" />
                        </div>
                      ))}
                      {hasMore && (
                        <div className="flex justify-center py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadMore}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Chargement...' : 'Voir plus'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="unread" className="mt-0">
                <div className="flex flex-col">
                  {unreadNotifications.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                      Aucune notification non lue
                    </div>
                  ) : (
                    unreadNotifications.map((notification) => (
                      <div key={notification.id}>
                        <NotificationItem
                          notification={notification}
                          onRead={markAsRead}
                          onArchive={archiveNotification}
                        />
                        <div className="border-b border-b-border" />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </SheetBody>
        <SheetFooter className="border-t border-border p-5 grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              notifications.forEach((n) => archiveNotification(n.id));
            }}
          >
            Tout archiver
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
