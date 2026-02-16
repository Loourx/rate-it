import { useQuery } from '@tanstack/react-query';
import { searchGames } from '../api/rawg';

export function useSearchGames(query: string) {
    return useQuery({
        queryKey: ['search', 'games', query],
        queryFn: () => searchGames(query),
        enabled: query.trim().length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
