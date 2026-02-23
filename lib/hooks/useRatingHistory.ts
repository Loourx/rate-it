import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';

const PAGE_SIZE = 20;

type DbContentType = 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'custom';

export interface RatingHistoryItem {
    id: string;
    contentType: DbContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    score: number;
    createdAt: string;
}

interface RatingHistoryPage {
    items: RatingHistoryItem[];
    nextOffset: number | undefined;
}

export function useRatingHistory() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useInfiniteQuery<RatingHistoryPage>({
        queryKey: ['rating-history', userId],
        queryFn: async ({ pageParam }) => {
            if (!userId) return { items: [], nextOffset: undefined };

            const offset = (pageParam as number) ?? 0;

            const { data, error } = await supabase
                .from('ratings')
                .select('id, content_type, content_id, content_title, content_image_url, score, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + PAGE_SIZE - 1);

            if (error) throw error;

            const rows = data as Array<{
                id: string;
                content_type: DbContentType;
                content_id: string;
                content_title: string;
                content_image_url: string | null;
                score: number;
                created_at: string;
            }>;

            const items: RatingHistoryItem[] = rows.map((r) => ({
                id: r.id,
                contentType: r.content_type,
                contentId: r.content_id,
                contentTitle: r.content_title,
                contentImageUrl: r.content_image_url,
                score: r.score,
                createdAt: r.created_at,
            }));

            return {
                items,
                nextOffset: rows.length < PAGE_SIZE ? undefined : offset + PAGE_SIZE,
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        enabled: !!userId,
    });
}
