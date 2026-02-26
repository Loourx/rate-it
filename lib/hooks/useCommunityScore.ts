import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ContentType } from '@/lib/types/content';

export interface CommunityScoreData {
    averageScore: number;
    totalRatings: number;
}

export function useCommunityScore(contentType: ContentType, contentId: string) {
    return useQuery<CommunityScoreData>({
        queryKey: ['community-score', contentType, contentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ratings')
                .select('score')
                .eq('content_type', contentType)
                .eq('content_id', contentId);

            if (error) throw error;

            const rows = data as Array<{ score: number }>;

            if (rows.length === 0) {
                return { averageScore: 0, totalRatings: 0 };
            }

            const sum = rows.reduce((acc, row) => acc + row.score, 0);
            const avg = Math.round((sum / rows.length) * 10) / 10;

            return { averageScore: avg, totalRatings: rows.length };
        },
        staleTime: 1000 * 60 * 5, // 5 minutos — los scores comunitarios no cambian al segundo
        enabled: !!contentType && !!contentId,
    });
}
