import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ContentType } from '@/lib/types/content';

export interface GlobalTrendingItem {
    contentId: string;
    contentType: ContentType;
    contentTitle: string;
    contentImageUrl: string | null;
    ratingCount: number;
    averageScore: number;
}

export function useGlobalTrending() {
    return useQuery<GlobalTrendingItem[]>({
        queryKey: ['global-trending'],
        queryFn: async () => {
            const thirtyDaysAgo = new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString();

            // Traer ratings recientes con metadata de contenido
            // Límite generoso para MVP con pocos usuarios
            const { data, error } = await supabase
                .from('ratings')
                .select('content_id, content_type, content_title, content_image_url, score')
                .gte('created_at', thirtyDaysAgo)
                .limit(500);

            if (error) throw error;
            if (!data || data.length === 0) return [];

            // Agregación client-side: agrupar por content_id + content_type
            const map = new Map<
                string,
                {
                    contentId: string;
                    contentType: ContentType;
                    contentTitle: string;
                    contentImageUrl: string | null;
                    scores: number[];
                }
            >();

            for (const row of data) {
                const key = `${row.content_type}::${row.content_id}`;
                const existing = map.get(key);
                if (existing) {
                    existing.scores.push(row.score as number);
                } else {
                    map.set(key, {
                        contentId: row.content_id as string,
                        contentType: row.content_type as ContentType,
                        contentTitle: row.content_title as string,
                        contentImageUrl: row.content_image_url as string | null,
                        scores: [row.score as number],
                    });
                }
            }

            // Convertir a array, calcular avg y ordenar por count desc
            return Array.from(map.values())
                .map((entry) => ({
                    contentId: entry.contentId,
                    contentType: entry.contentType,
                    contentTitle: entry.contentTitle,
                    contentImageUrl: entry.contentImageUrl,
                    ratingCount: entry.scores.length,
                    averageScore:
                        Math.round(
                            (entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length) * 10,
                        ) / 10,
                }))
                .sort((a, b) => b.ratingCount - a.ratingCount)
                .slice(0, 15);
        },
        staleTime: 1000 * 60 * 10, // 10 minutos — cambia menos que el trending de amigos
    });
}
