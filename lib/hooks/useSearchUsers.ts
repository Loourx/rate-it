import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/lib/api/users';

export function useSearchUsers(query: string) {
    return useQuery({
        queryKey: ['search', 'users', query],
        queryFn: () => searchUsers(query),
        enabled: query.length >= 2, // 2 chars mínimo (usernames cortos)
        staleTime: 1000 * 60 * 2,  // 2 minutos
    });
}
