import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { followUser, unfollowUser } from '@/lib/api/social';

export function useFollow(targetUserId: string) {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const currentUserId = session?.user.id;

    return useMutation({
        mutationFn: async (isCurrentlyFollowing: boolean) => {
            if (!currentUserId) throw new Error('No autenticado');

            if (isCurrentlyFollowing) {
                await unfollowUser(targetUserId);
            } else {
                await followUser(targetUserId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
            queryClient.invalidateQueries({ queryKey: ['isFollowing', targetUserId] });
        },
    });
}
