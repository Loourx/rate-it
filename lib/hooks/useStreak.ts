import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UseStreakResult {
    streakDays: number;
}

/** Returns today's date as "YYYY-MM-DD" in local time. */
function getTodayStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Given an array of ISO timestamp strings from Supabase, calculate the current
 * consecutive-day streak (counting backwards from today).
 * Rules:
 *   - If today has no rating → streak is 0.
 *   - A streak counts N days where each pair of consecutive days is exactly
 *     1 calendar day apart.
 */
function calcStreak(timestamps: string[]): number {
    if (timestamps.length === 0) return 0;

    // Extract date portion (YYYY-MM-DD) and deduplicate.
    const uniqueDates = [...new Set(timestamps.map((ts) => ts.slice(0, 10)))]
        .sort()
        .reverse(); // most-recent first

    const today = getTodayStr();

    // Streak requires a rating today.
    if (uniqueDates[0] !== today) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        // Use noon to avoid DST edge-cases shifting the date.
        const newerDate = new Date(`${uniqueDates[i - 1]}T12:00:00`);
        const olderDate = new Date(`${uniqueDates[i]}T12:00:00`);
        const diffDays = Math.round(
            (newerDate.getTime() - olderDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
            streak++;
        } else {
            break; // gap found — streak ends
        }
    }
    return streak;
}

/**
 * Hook that returns the number of consecutive days (ending today) on which
 * the given user has submitted at least one rating.
 *
 * Returns `{ streakDays: 0 }` while loading so callers never block on this data.
 */
export function useStreak(userId: string | undefined) {
    return useQuery<UseStreakResult>({
        queryKey: ['streak', userId],
        queryFn: async (): Promise<UseStreakResult> => {
            if (!userId) return { streakDays: 0 };

            const { data, error } = await supabase
                .from('ratings')
                .select('created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const timestamps = (data ?? []).map((r) => r.created_at as string);
            return { streakDays: calcStreak(timestamps) };
        },
        staleTime: 5 * 60 * 1000,
        // Return 0 immediately while fetching so the profile never stalls.
        placeholderData: { streakDays: 0 },
    });
}
