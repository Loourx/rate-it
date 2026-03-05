import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/stores/authStore';
import { followUser, unfollowUser } from '@/lib/api/social';

export function useFollow(targetUserId: string): UseMutationResult<void, Error, boolean> {
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
        onSuccess: (_data, isCurrentlyFollowing) => {
            Haptics.impactAsync(
                isCurrentlyFollowing
                    ? Haptics.ImpactFeedbackStyle.Light   // unfollow
                    : Haptics.ImpactFeedbackStyle.Medium, // follow
            );
            queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
            queryClient.invalidateQueries({ queryKey: ['isFollowing', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['follow-counts', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['follow-counts', currentUserId] });
        },
    });
}
