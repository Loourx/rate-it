import { supabase } from '@/lib/supabase';
import type { AnnualChallenge } from '@/lib/types/database';
import type { ContentType } from '@/lib/types/content';

// ─── row shape returned by Supabase ────────────────────────────────────────
interface ChallengeRow {
    id: string;
    user_id: string;
    year: number;
    target_count: number;
    category_filter: AnnualChallenge['categoryFilter'];
    created_at: string;
    updated_at: string;
}

function rowToChallenge(row: ChallengeRow): AnnualChallenge {
    return {
        id: row.id,
        userId: row.user_id,
        year: row.year,
        targetCount: row.target_count,
        categoryFilter: row.category_filter,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// ─── API functions ──────────────────────────────────────────────────────────

export async function fetchChallenges(userId: string, year: number): Promise<AnnualChallenge[]> {
    const { data, error } = await supabase
        .from('annual_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as ChallengeRow[]).map(rowToChallenge);
}

export async function createChallenge(input: {
    userId: string;
    year: number;
    targetCount: number;
    categoryFilter: AnnualChallenge['categoryFilter'];
}): Promise<AnnualChallenge> {
    const { data, error } = await supabase
        .from('annual_challenges')
        .insert({
            user_id: input.userId,
            year: input.year,
            target_count: input.targetCount,
            category_filter: input.categoryFilter,
        })
        .select()
        .single();
    if (error) throw error;
    return rowToChallenge(data as ChallengeRow);
}

export async function deleteChallenge(challengeId: string): Promise<void> {
    const { error } = await supabase
        .from('annual_challenges')
        .delete()
        .eq('id', challengeId);
    if (error) throw error;
}

export async function countProgress(
    userId: string,
    year: number,
    categoryFilter: ContentType | 'all',
): Promise<number> {
    const yearStart = `${year}-01-01T00:00:00.000Z`;
    const yearEnd   = `${year}-12-31T23:59:59.999Z`;

    let query = supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', yearStart)
        .lte('created_at', yearEnd);

    if (categoryFilter !== 'all') {
        query = query.eq('content_type', categoryFilter);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
}
