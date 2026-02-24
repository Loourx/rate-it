import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types/database';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches ANY user's public profile by their UUID.
 * Does not require the viewer to be the profile owner.
 */
export function useUserProfile(userId: string | undefined) {
    return useQuery<Profile | null>({
        queryKey: ['user-profile', userId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                username: data.username,
                displayName: data.display_name,
                avatarUrl: data.avatar_url,
                bio: data.bio,
                isPrivate: data.is_private,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            } as Profile;
        },
        enabled: !!userId,
        staleTime: STALE_TIME,
    });
}
