import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { getUnreadCount } from '@/lib/api/notifications';

export function useUnreadCount(): UseQueryResult<number> {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['unreadCount', userId],
        queryFn: () => getUnreadCount(userId!),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 min
        refetchInterval: 60 * 1000, // Refetch cada 60 segundos
    });
}
