import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { getUnreadCount } from '@/lib/api/notifications';

export function useUnreadCount() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['unreadCount', userId],
        queryFn: () => getUnreadCount(userId!),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 segundos
        refetchInterval: 60 * 1000, // Refetch cada 60 segundos
    });
}
