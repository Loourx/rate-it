import { useQuery } from '@tanstack/react-query';
import { searchSeries } from '../api/tmdb';

export function useSearchSeries(query: string) {
    return useQuery({
        queryKey: ['search', 'series', query],
        queryFn: () => searchSeries(query),
        enabled: query.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
