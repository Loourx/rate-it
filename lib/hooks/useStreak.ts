import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { StreakState } from '@/lib/types/streak';

const MAX_WEEKLY_FREEZES = 2;

/** Returns today's date as 'YYYY-MM-DD' in local time. */
function getTodayStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Returns the Monday of the current week as 'YYYY-MM-DD'. */
function getCurrentWeekMonday(): string {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day; // ajuste para lunes
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday.toISOString().slice(0, 10);
}

/**
 * Calcula la racha contando tanto ratings como freezes como días activos.
 * Un freeze en una fecha de gap mantiene la racha.
 */
function calcStreakWithFreezes(
    ratingTimestamps: string[],
    freezeDates: string[]
): number {
    // Unir fechas de ratings y freezes
    const ratingDates = ratingTimestamps.map((ts) => ts.slice(0, 10));
    const allActiveDates = [...new Set([...ratingDates, ...freezeDates])]
        .sort()
        .reverse(); // más reciente primero

    if (allActiveDates.length === 0) return 0;

    const today = getTodayStr();

    // La racha requiere actividad hoy (rating O freeze)
    if (allActiveDates[0] !== today) return 0;

    let streak = 1;
    for (let i = 1; i < allActiveDates.length; i++) {
        const newerDate = new Date(`${allActiveDates[i - 1]}T12:00:00`);
        const olderDate = new Date(`${allActiveDates[i]}T12:00:00`);
        const diffDays = Math.round(
            (newerDate.getTime() - olderDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export function useStreak(userId: string | undefined): UseQueryResult<StreakState> {
    return useQuery<StreakState>({
        queryKey: ['streak', userId],
        queryFn: async (): Promise<StreakState> => {
            if (!userId) return {
                streakDays: 0,
                freezesAvailableThisWeek: MAX_WEEKLY_FREEZES,
                freezesUsedDates: []
            };

            // Fetch ratings y freezes en paralelo
            const [ratingsRes, freezesRes] = await Promise.all([
                supabase
                    .from('ratings')
                    .select('created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('streak_freezes')
                    .select('freeze_date')
                    .eq('user_id', userId)
                    .order('freeze_date', { ascending: false })
            ]);

            if (ratingsRes.error) throw ratingsRes.error;
            if (freezesRes.error) throw freezesRes.error;

            const ratingTimestamps = (ratingsRes.data ?? []).map((r) => r.created_at as string);
            const freezeDates = (freezesRes.data ?? []).map((f) => f.freeze_date as string);

            // Freezes usados esta semana
            const weekStart = getCurrentWeekMonday();
            const freezesThisWeek = freezeDates.filter((d) => d >= weekStart);
            const freezesAvailableThisWeek = Math.max(
                0,
                MAX_WEEKLY_FREEZES - freezesThisWeek.length
            );

            return {
                streakDays: calcStreakWithFreezes(ratingTimestamps, freezeDates),
                freezesAvailableThisWeek,
                freezesUsedDates: freezeDates,
            };
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: {
            streakDays: 0,
            freezesAvailableThisWeek: MAX_WEEKLY_FREEZES,
            freezesUsedDates: []
        },
    });
}
