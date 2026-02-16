import { useQuery } from '@tanstack/react-query';
import { searchMusic } from '../api/itunes';

export function useSearchMusic(query: string) {
    return useQuery({
        queryKey: ['search', 'music', query],
        queryFn: () => searchMusic(query),
        enabled: query.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
