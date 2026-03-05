import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { searchUsers } from '@/lib/api/users';

export function useSearchUsers(query: string): UseQueryResult<any> {
    return useQuery({
        queryKey: ['search', 'users', query],
        queryFn: () => searchUsers(query),
        enabled: query.length >= 2, // 2 chars mínimo (usernames cortos)
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 min
    });
}
