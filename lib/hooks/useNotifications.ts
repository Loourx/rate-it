import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/api/notifications';
import { Notification } from '@/lib/types/notifications';

type UseNotificationsReturn = UseQueryResult<Notification[], Error> & {
    markAsRead: (notificationIds: string[]) => void;
    markAllAsRead: () => void;
};

export function useNotifications(): UseNotificationsReturn {
    const { session } = useAuthStore();
    const userId = session?.user.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => getNotifications(userId!),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 sec
        gcTime: 2 * 60 * 1000, // 2 min
    });

    const markAsReadMutation = useMutation({
        mutationFn: (notificationIds: string[]) => markAsRead(notificationIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => markAllAsRead(userId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        },
    });

    return {
        ...query,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
    };
}
