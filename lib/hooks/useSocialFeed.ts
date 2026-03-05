import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { getSocialFeed } from '@/lib/api/social';

const PAGE_SIZE = 20;

export function useSocialFeed(): UseInfiniteQueryResult<InfiniteData<any>> {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useInfiniteQuery({
        queryKey: ['socialFeed', userId],
        queryFn: ({ pageParam }) =>
            getSocialFeed(userId!, pageParam as number, PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // Si la última página tiene menos de PAGE_SIZE items, no hay más
            if (lastPage.length < PAGE_SIZE) return undefined;
            return allPages.length;
        },
        enabled: !!userId,
        staleTime: 60 * 1000, // 1 min (feed dinámico)
        gcTime: 5 * 60 * 1000, // 5 min
    });
}
