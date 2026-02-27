import { useQuery } from '@tanstack/react-query';
import { fetchDiaryMonth, type DiaryDay } from '@/lib/api/diary';

export type { DiaryDay };

/** Returns ratings grouped by 'YYYY-MM-DD' for a specific user/year/month. */
export function useDiary(userId: string | undefined, year: number, month: number) {
    return useQuery<Map<string, DiaryDay[]>>({
        queryKey: ['diary', userId, year, month],
        queryFn: () => fetchDiaryMonth(userId!, year, month),
        enabled: !!userId,
        // Keep previous month's data while new month loads
        placeholderData: (prev) => prev,
    });
}
