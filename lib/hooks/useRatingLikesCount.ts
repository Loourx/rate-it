import { useQuery } from '@tanstack/react-query';
import { getRatingLikesCount } from '@/lib/api/social';

export function useRatingLikesCount(ratingId: string) {
    return useQuery({
        queryKey: ['ratingLikesCount', ratingId],
        queryFn: () => getRatingLikesCount(ratingId),
        staleTime: 3 * 60 * 1000, // 3 minutos
    });
}
