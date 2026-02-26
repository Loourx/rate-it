import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ContentType } from '@/lib/types/content';

export interface PendingItem {
    id: string;
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    status: 'want' | 'doing';
}

export function usePendingRatings() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery<PendingItem[]>({
        queryKey: ['pending-ratings', userId],
        queryFn: async () => {
            if (!userId) return [];

            // Paso 1: obtener items con status want/doing
            const { data: statusItems, error: statusError } = await supabase
                .from('user_content_status')
                .select('id, content_type, content_id, content_title, content_image_url, status')
                .eq('user_id', userId)
                .in('status', ['want', 'doing'])
                .order('created_at', { ascending: false })
                .limit(20);

            if (statusError) throw statusError;
            if (!statusItems || statusItems.length === 0) return [];

            // Paso 2: obtener content_ids que ya tienen rating
            const contentIds = statusItems.map((s) => s.content_id as string);
            const { data: ratedItems, error: ratedError } = await supabase
                .from('ratings')
                .select('content_id')
                .eq('user_id', userId)
                .in('content_id', contentIds);

            if (ratedError) throw ratedError;

            const ratedSet = new Set((ratedItems ?? []).map((r) => r.content_id as string));

            // Filtrar los que NO tienen rating y limitar a 10
            return statusItems
                .filter((s) => !ratedSet.has(s.content_id as string))
                .slice(0, 10)
                .map((s) => ({
                    id: s.id as string,
                    contentType: s.content_type as ContentType,
                    contentId: s.content_id as string,
                    contentTitle: s.content_title as string,
                    contentImageUrl: s.content_image_url as string | null,
                    status: s.status as 'want' | 'doing',
                }));
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
    });
}
