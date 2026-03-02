import { useQuery } from '@tanstack/react-query';
import { getFollowers } from '@/lib/api/social';
import type { FollowerProfile } from '@/lib/types/social';

const STALE_TIME = 3 * 60 * 1000; // 3 minutes

export function useFollowers(userId: string | undefined) {
    return useQuery<FollowerProfile[]>({
        queryKey: ['followers', userId],
        queryFn: () => getFollowers(userId!),
        enabled: !!userId,
        staleTime: STALE_TIME,
        gcTime: 5 * 60 * 1000, // 5 min
    });
}
