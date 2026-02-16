import { useQuery } from '@tanstack/react-query';
import { searchBooks } from '../api/googleBooks';

export function useSearchBooks(query: string) {
    return useQuery({
        queryKey: ['search', 'books', query],
        queryFn: () => searchBooks(query),
        enabled: query.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
