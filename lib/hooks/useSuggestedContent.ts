import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ContentType } from '@/lib/types/content';

export interface SuggestedItem {
    contentId: string;
    contentType: ContentType;
    contentTitle: string;
    contentImageUrl: string | null;
    bestScore: number;      // El score más alto que un amigo le dio
    friendCount: number;    // Cuántos amigos lo valoraron con 8+
}

export function useSuggestedContent() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery<SuggestedItem[]>({
        queryKey: ['suggested-content', userId],
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

            // Paso 2: Ratings de amigos con score >= 8 (últimos 90 días)
            const ninetyDaysAgo = new Date(
                Date.now() - 90 * 24 * 60 * 60 * 1000,
            ).toISOString();

            const { data: friendRatings, error: friendError } = await supabase
                .from('ratings')
                .select('content_id, content_type, content_title, content_image_url, score')
                .in('user_id', followingIds)
                .gte('score', 8)
                .gte('created_at', ninetyDaysAgo)
                .limit(200);

            if (friendError) throw friendError;
            if (!friendRatings || friendRatings.length === 0) return [];

            // Paso 3: Content IDs que el usuario ya valoró
            const friendContentIds = [...new Set(
                friendRatings.map((r) => r.content_id as string),
            )];

            const { data: myRatings, error: myError } = await supabase
                .from('ratings')
                .select('content_id')
                .eq('user_id', userId)
                .in('content_id', friendContentIds);

            if (myError) throw myError;

            const myRatedSet = new Set(
                (myRatings ?? []).map((r) => r.content_id as string),
            );

            // Paso 4: Filtrar valorados por mí y agrupar por content_id
            const map = new Map<string, SuggestedItem>();

            for (const row of friendRatings) {
                const cid = row.content_id as string;
                if (myRatedSet.has(cid)) continue; // Ya lo valoré — saltar

                const key = `${row.content_type}::${cid}`;
                const existing = map.get(key);

                if (existing) {
                    existing.friendCount += 1;
                    if ((row.score as number) > existing.bestScore) {
                        existing.bestScore = row.score as number;
                    }
                } else {
                    map.set(key, {
                        contentId: cid,
                        contentType: row.content_type as ContentType,
                        contentTitle: row.content_title as string,
                        contentImageUrl: row.content_image_url as string | null,
                        bestScore: row.score as number,
                        friendCount: 1,
                    });
                }
            }

            // Ordenar: primero los que más amigos recomiendan, luego por score
            return Array.from(map.values())
                .sort((a, b) =>
                    b.friendCount !== a.friendCount
                        ? b.friendCount - a.friendCount
                        : b.bestScore - a.bestScore,
                )
                .slice(0, 15);
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 15, // 15 minutos — cambia poco
    });
}
