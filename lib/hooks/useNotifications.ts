import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/api/notifications';

export function useNotifications() {
    const { session } = useAuthStore();
    const userId = session?.user.id;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => getNotifications(userId!),
        enabled: !!userId,
        staleTime: 1 * 60 * 1000, // 1 minuto
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
