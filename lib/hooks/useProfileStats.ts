import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';

type DbContentType = 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'custom';

export interface CategoryStat {
    type: DbContentType;
    count: number;
    avgScore: number;
}

export interface ProfileStats {
    totalRatings: number;
    averageScore: number;
    byCategory: CategoryStat[];
}

/**
 * Fetches only content_type + score for the current user and aggregates
 * client-side. Lightweight for MVP — avoids needing an RPC migration.
 */
export function useProfileStats(overrideUserId?: string) {
    const { session } = useAuthStore();
    const userId = overrideUserId ?? session?.user.id;

    return useQuery<ProfileStats>({
        queryKey: ['profile-stats', userId],
        queryFn: async () => {
            if (!userId) {
                return { totalRatings: 0, averageScore: 0, byCategory: [] };
            }

            const { data, error } = await supabase
                .from('ratings')
                .select('content_type, score')
                .eq('user_id', userId);

            if (error) throw error;

            const rows = data as Array<{ content_type: DbContentType; score: number }>;

            if (rows.length === 0) {
                return { totalRatings: 0, averageScore: 0, byCategory: [] };
            }

            // Aggregate by category
            const map = new Map<DbContentType, { total: number; count: number }>();
            let globalSum = 0;

            for (const row of rows) {
                globalSum += row.score;
                const existing = map.get(row.content_type);
                if (existing) {
                    existing.total += row.score;
                    existing.count += 1;
                } else {
                    map.set(row.content_type, { total: row.score, count: 1 });
                }
            }

            const byCategory: CategoryStat[] = Array.from(map.entries())
                .map(([type, agg]) => ({
                    type,
                    count: agg.count,
                    avgScore: Math.round((agg.total / agg.count) * 10) / 10,
                }))
                .sort((a, b) => b.count - a.count);

            return {
                totalRatings: rows.length,
                averageScore: Math.round((globalSum / rows.length) * 10) / 10,
                byCategory,
            };
        },
        enabled: !!userId,
    });
}
