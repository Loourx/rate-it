import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/utils/constants';

// Los 21 buckets posibles con step 0.5 de 0 a 10
const ALL_BUCKETS = Array.from({ length: 21 }, (_, i) =>
    Math.round(i * 0.5 * 10) / 10,
); // [0, 0.5, 1, 1.5, ..., 10]

type DbContentType = 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'anything';

const CATEGORY_COLORS: Record<DbContentType, string> = {
    movie:    COLORS.categoryMovie,
    series:   COLORS.categorySeries,
    book:     COLORS.categoryBook,
    game:     COLORS.categoryGame,
    music:    COLORS.categoryMusic,
    podcast:  COLORS.categoryPodcast,
    anything: COLORS.categoryAnything,
};

export interface CategorySegment {
    contentType: DbContentType;
    count: number;
    color: string;
}

export interface ScoreBucket {
    score: number; // 0, 0.5, 1, ... 10
    totalCount: number;
    segments: CategorySegment[]; // desglose por categoría
}

export interface ScoreDistributionData {
    buckets: ScoreBucket[]; // siempre 21 elementos
    maxCount: number;       // para calcular alturas proporcionales
    totalRatings: number;
}

export function useScoreDistribution(userId: string | undefined) {
    return useQuery<ScoreDistributionData>({
        queryKey: ['score-distribution', userId],
        queryFn: async () => {
            if (!userId) {
                return {
                    buckets: ALL_BUCKETS.map((s) => ({ score: s, totalCount: 0, segments: [] })),
                    maxCount: 0,
                    totalRatings: 0,
                };
            }

            const { data, error } = await supabase
                .from('ratings')
                .select('score, content_type')
                .eq('user_id', userId);

            if (error) throw error;

            const rows = data as Array<{ score: number; content_type: string }>;

            // Map: score_bucket → { contentType → count }
            const bucketMap = new Map<number, Map<DbContentType, number>>();

            for (const row of rows) {
                const snapped = Math.round(row.score * 2) / 2;
                const clamped = Math.max(0, Math.min(10, snapped));

                if (!bucketMap.has(clamped)) {
                    bucketMap.set(clamped, new Map());
                }
                const catMap = bucketMap.get(clamped)!;
                const ct = row.content_type as DbContentType;
                catMap.set(ct, (catMap.get(ct) ?? 0) + 1);
            }

            const buckets: ScoreBucket[] = ALL_BUCKETS.map((score) => {
                const catMap = bucketMap.get(score);
                if (!catMap) {
                    return { score, totalCount: 0, segments: [] };
                }
                const segments: CategorySegment[] = Array.from(catMap.entries())
                    .map(([contentType, count]) => ({
                        contentType,
                        count,
                        color: CATEGORY_COLORS[contentType] ?? COLORS.textTertiary,
                    }))
                    .sort((a, b) => b.count - a.count); // más frecuente abajo (base del stack)

                return {
                    score,
                    totalCount: segments.reduce((sum, s) => sum + s.count, 0),
                    segments,
                };
            });

            const maxCount = Math.max(...buckets.map((b) => b.totalCount), 1);

            return { buckets, maxCount, totalRatings: rows.length };
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });
}
