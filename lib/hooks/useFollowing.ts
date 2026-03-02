import { useQuery } from '@tanstack/react-query';
import { getFollowing } from '@/lib/api/social';
import type { FollowingProfile } from '@/lib/types/social';

const STALE_TIME = 3 * 60 * 1000; // 3 minutes

export function useFollowing(userId: string | undefined) {
    return useQuery<FollowingProfile[]>({
        queryKey: ['following', userId],
        queryFn: () => getFollowing(userId!),
        enabled: !!userId,
        staleTime: STALE_TIME,
        gcTime: 5 * 60 * 1000, // 5 min
    });
}
