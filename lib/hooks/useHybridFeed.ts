import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocialFeed } from '@/lib/hooks/useSocialFeed';
import { useAuthStore } from '@/lib/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { HybridFeedItem } from '@/lib/types/hybridFeed';

export interface HybridFeedResult {
    items: HybridFeedItem[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    hasSocialItems: boolean;
}

export function useHybridFeed(): HybridFeedResult {
    const { user } = useAuthStore();
    const userId = user?.id;

    // Paso 1 — Comprobar si el usuario tiene follows
    const { data: hasFollows = false, isLoading: hasFollowsLoading } = useQuery({
        queryKey: ['hasFollows', userId],
        queryFn: async () => {
            if (!userId) return false;
            const { count, error } = await supabase
                .from('follows')
                .select('following_id', { count: 'exact', head: true })
                .eq('follower_id', userId);
            
            if (error) throw error;
            return (count ?? 0) > 0;
        },
        enabled: !!userId,
        staleTime: 2 * 60 * 1000,
    });

    // Paso 2 — Consumir feed social
    const socialFeed = useSocialFeed();

    // Paso 3 — Aplanar páginas del feed social
    const socialItems = useMemo(() => {
        return socialFeed.data?.pages.flatMap(page => page) ?? [];
    }, [socialFeed.data?.pages]);

    // Paso 4 — Construir la lista combinada con useMemo
    const socialIsLoading = socialFeed.isLoading;

    const items = useMemo<HybridFeedItem[]>(() => {
        // CASO C — Usuario con follows pero sin items aún (loading):
        if (hasFollows && socialIsLoading) {
            return [];
        }

        const socialMapped: HybridFeedItem[] = socialItems.map(item => ({
            kind: 'social',
            id: `social-${item.id}`,
            data: item,
        }));

        const discoveryItem: HybridFeedItem = {
            kind: 'discovery',
            id: 'discovery-rail',
        };

        // CASO A — Usuario sin follows O sin items sociales:
        if (!hasFollows || socialMapped.length === 0) {
            return [discoveryItem];
        }

        // CASO B — Usuario con follows y con items sociales:
        const separator: HybridFeedItem = {
            kind: 'separator',
            id: 'separator-discovery',
            label: 'Descubrimiento',
        };

        return [...socialMapped, separator, discoveryItem];
    }, [socialItems, hasFollows, socialIsLoading]);

    // Paso 5 — Consolidar estados de loading/error
    const isLoading = socialFeed.isLoading || hasFollowsLoading;
    const isError = socialFeed.isError;
    const error = socialFeed.error ?? null;

    // Paso 6 — refetch combinado
    const refetch = useCallback(() => {
        socialFeed.refetch();
    }, [socialFeed]);

    // Paso 7 — Retorno completo
    return {
        items,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage: socialFeed.fetchNextPage,
        hasNextPage: socialFeed.hasNextPage ?? false,
        isFetchingNextPage: socialFeed.isFetchingNextPage,
        hasSocialItems: socialItems.length > 0,
    };
}
