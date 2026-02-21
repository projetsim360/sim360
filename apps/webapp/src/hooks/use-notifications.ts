import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useSocket } from '@/providers/socket-provider';

export interface Notification {
  id: string;
  eventId?: string;
  type: string;
  category: string;
  title: string;
  body: string;
  data?: any;
  priority: number;
  readAt?: string;
  archivedAt?: string;
  createdAt: string;
}

interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const result = await api.get<PaginatedNotifications>(
        `/notifications?page=${pageNum}&limit=20`,
      );
      if (pageNum === 1) {
        setNotifications(result.data);
      } else {
        setNotifications((prev) => [...prev, ...result.data]);
      }
      setPage(pageNum);
      setHasMore(pageNum < result.totalPages);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await api.get<{ count: number }>('/notifications/count');
      setUnreadCount(result.count);
    } catch {
      // Silently fail
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  const archiveNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Silently fail
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [isLoading, hasMore, page, fetchNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (payload: any) => {
      const notification: Notification = {
        id: payload.eventId ?? crypto.randomUUID(),
        eventId: payload.eventId,
        type: payload.eventType,
        category: 'system',
        title: payload.title,
        body: payload.body,
        data: payload.data,
        priority: payload.priority ?? 1,
        createdAt: payload.timestamp ?? new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast(payload.title, {
        description: payload.body,
        duration: 5000,
      });
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    loadMore,
    refresh: () => {
      fetchNotifications(1);
      fetchUnreadCount();
    },
  };
}
