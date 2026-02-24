import { useQuery } from '@tanstack/react-query';
import { searchPodcasts } from '../api/podcasts';

export function useSearchPodcasts(query: string) {
    return useQuery({
        queryKey: ['search', 'podcasts', query],
        queryFn: () => searchPodcasts(query),
        enabled: query.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
