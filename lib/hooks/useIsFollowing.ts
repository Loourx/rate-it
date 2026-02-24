import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { checkIfFollowing } from '@/lib/api/social';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useIsFollowing(targetUserId: string | undefined) {
    const { session } = useAuthStore();
    const currentUserId = session?.user.id;

    return useQuery<boolean>({
        queryKey: ['isFollowing', targetUserId],
        queryFn: () => checkIfFollowing(currentUserId!, targetUserId!),
        enabled: !!currentUserId && !!targetUserId,
        staleTime: STALE_TIME,
    });
}
