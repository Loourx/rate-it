import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface FollowCounts {
    followersCount: number;
    followingCount: number;
}

export function useFollowCounts(userId: string | undefined) {
    return useQuery<FollowCounts>({
        queryKey: ['follow-counts', userId],
        queryFn: async () => {
            if (!userId) return { followersCount: 0, followingCount: 0 };

            const { data, error } = await supabase
                .from('profiles_with_counts')
                .select('followers_count, following_count')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return {
                followersCount: Number(data.followers_count ?? 0),
                followingCount: Number(data.following_count ?? 0),
            };
        },
        enabled: !!userId,
        staleTime: 1000 * 30, // 30s — los conteos de follow cambian con frecuencia
    });
}
