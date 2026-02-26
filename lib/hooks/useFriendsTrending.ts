import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ContentType } from '@/lib/types/content';

export interface TrendingFriendItem {
    ratingId: string;
    contentId: string;
    contentType: ContentType;
    contentTitle: string;
    contentImageUrl: string | null;
    score: number;
    likesCount: number;
    authorUsername: string;
    authorAvatarUrl: string | null;
}

export function useFriendsTrending() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery<TrendingFriendItem[]>({
        queryKey: ['friends-trending', userId],
        queryFn: async () => {
            if (!userId) return [];

            // Paso 1: IDs de seguidos
            const { data: followData, error: followError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userId);

            if (followError) throw followError;

            const followingIds = (followData ?? []).map((f) => f.following_id as string);
            if (followingIds.length === 0) return [];

            // Paso 2: ratings de seguidos en los últimos 7 días
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            const { data: ratings, error: ratingsError } = await supabase
                .from('ratings')
                .select(`
                    id,
                    content_id,
                    content_type,
                    content_title,
                    content_image_url,
                    score,
                    profile:profiles!ratings_user_id_fkey(
                        username,
                        avatar_url
                    )
                `)
                .in('user_id', followingIds)
                .gte('created_at', sevenDaysAgo)
                .order('created_at', { ascending: false })
                .limit(30);

            if (ratingsError) throw ratingsError;
            if (!ratings || ratings.length === 0) return [];

            // Paso 3: contar likes por rating
            const ratingIds = ratings.map((r) => r.id as string);
            const { data: likesData, error: likesError } = await supabase
                .from('review_likes')
                .select('rating_id')
                .in('rating_id', ratingIds);

            if (likesError) throw likesError;

            const likesMap = new Map<string, number>();
            for (const like of likesData ?? []) {
                const rid = like.rating_id as string;
                likesMap.set(rid, (likesMap.get(rid) ?? 0) + 1);
            }

            // Paso 4: combinar y ordenar por likes desc
            return ratings
                .map((r) => {
                    const profileArr = r.profile as { username: string; avatar_url: string | null }[] | null;
                    const profile = profileArr?.[0] ?? null;
                    return {
                        ratingId: r.id as string,
                        contentId: r.content_id as string,
                        contentType: r.content_type as ContentType,
                        contentTitle: r.content_title as string,
                        contentImageUrl: r.content_image_url as string | null,
                        score: r.score as number,
                        likesCount: likesMap.get(r.id as string) ?? 0,
                        authorUsername: profile?.username ?? 'Usuario',
                        authorAvatarUrl: profile?.avatar_url ?? null,
                    };
                })
                .sort((a, b) => b.likesCount - a.likesCount)
                .slice(0, 15);
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });
}
