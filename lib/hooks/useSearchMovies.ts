import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '../api/tmdb';

export function useSearchMovies(query: string) {
    return useQuery({
        queryKey: ['search', 'movies', query],
        queryFn: () => searchMovies(query),
        enabled: query.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
