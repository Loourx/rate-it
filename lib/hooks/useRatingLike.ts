import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { checkIfLiked, likeRating, unlikeRating } from '@/lib/api/social';

export function useRatingLike(ratingId: string) {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    const likedQuery = useQuery({
        queryKey: ['ratingLike', ratingId],
        queryFn: () => checkIfLiked(userId!, ratingId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    const mutation = useMutation({
        mutationFn: async (isCurrentlyLiked: boolean) => {
            if (!userId) throw new Error('No autenticado');
            if (isCurrentlyLiked) {
                await unlikeRating(ratingId);
            } else {
                await likeRating(userId, ratingId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['ratingLike', ratingId],
            });
            queryClient.invalidateQueries({
                queryKey: ['ratingLikesCount', ratingId],
            });
            queryClient.invalidateQueries({
                queryKey: ['socialFeed'],
            });
        },
    });

    return {
        isLiked: likedQuery.data ?? false,
        isLoading: likedQuery.isLoading,
        toggle: () => mutation.mutate(likedQuery.data ?? false),
        isMutating: mutation.isPending,
    };
}
