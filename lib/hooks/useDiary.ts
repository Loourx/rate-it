import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchDiaryMonth, type DiaryDay } from '@/lib/api/diary';

export type { DiaryDay };

/** Returns ratings grouped by 'YYYY-MM-DD' for a specific user/year/month. */
export function useDiary(userId: string | undefined, year: number, month: number): UseQueryResult<Map<string, DiaryDay[]>> {
    return useQuery<Map<string, DiaryDay[]>>({
        queryKey: ['diary', userId, year, month],
        queryFn: () => fetchDiaryMonth(userId!, year, month),
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 min
        gcTime: 5 * 60 * 1000, // 5 min
        // Keep previous month's data while new month loads
        placeholderData: (prev) => prev,
    });
}
