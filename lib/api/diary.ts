import { supabase } from '@/lib/supabase';
import type { ContentType } from '@/lib/types/content';

// ─── types ───────────────────────────────────────────────────────────────────

export interface DiaryDay {
    id: string;
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    score: number;
    createdAt: string;
}

interface RatingRow {
    id: string;
    content_type: string;
    content_id: string;
    content_title: string;
    content_image_url: string | null;
    score: number;
    created_at: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all ratings for a given userId in a specific year/month.
 * Returns a Map<'YYYY-MM-DD', DiaryDay[]> grouped by local date.
 */
export async function fetchDiaryMonth(
    userId: string,
    year: number,
    month: number, // 1-based
): Promise<Map<string, DiaryDay[]>> {
    const firstDay = new Date(year, month - 1, 1);
    const firstDayNextMonth = new Date(year, month, 1);

    const { data, error } = await supabase
        .from('ratings')
        .select('id, content_type, content_id, content_title, content_image_url, score, created_at')
        .eq('user_id', userId)
        .gte('created_at', firstDay.toISOString())
        .lt('created_at', firstDayNextMonth.toISOString())
        .order('created_at', { ascending: true });

    if (error) throw error;

    const map = new Map<string, DiaryDay[]>();

    for (const row of (data ?? []) as RatingRow[]) {
        // Use local date string YYYY-MM-DD
        const d = new Date(row.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const entry: DiaryDay = {
            id: row.id,
            contentType: row.content_type as ContentType,
            contentId: row.content_id,
            contentTitle: row.content_title,
            contentImageUrl: row.content_image_url,
            score: row.score,
            createdAt: row.created_at,
        };

        const existing = map.get(key);
        if (existing) {
            existing.push(entry);
        } else {
            map.set(key, [entry]);
        }
    }

    return map;
}
