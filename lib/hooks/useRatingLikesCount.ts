import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getRatingLikesCount } from '@/lib/api/social';

export function useRatingLikesCount(ratingId: string): UseQueryResult<any> {
    return useQuery({
        queryKey: ['ratingLikesCount', ratingId],
        queryFn: () => getRatingLikesCount(ratingId),
        staleTime: 3 * 60 * 1000, // 3 minutos
        gcTime: 5 * 60 * 1000, // 5 min
    });
}
