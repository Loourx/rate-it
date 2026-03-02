import { useMemo } from 'react';
import { useBookmarks, type BookmarkRow } from './useBookmark';
import type { ContentType } from '@/lib/types/content';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

export interface BookmarkGroup {
    type: ContentType;
    label: string;
    emoji: string;
    items: BookmarkRow[];
    count: number;
}

const CATEGORY_META: {
    type: ContentType;
    label: string;
    emoji: string;
}[] = [
    { type: 'movie', label: 'Películas', emoji: '🎬' },
    { type: 'series', label: 'Series', emoji: '📺' },
    { type: 'book', label: 'Libros', emoji: '📚' },
    { type: 'game', label: 'Juegos', emoji: '🎮' },
    { type: 'music', label: 'Música', emoji: '🎵' },
    /* MVP_DISABLED: { type: 'podcast', label: 'Podcasts', emoji: '🎙️' }, */
    /* MVP_DISABLED: { type: 'anything', label: 'Anything', emoji: '✨' }, */
];

/* -------------------------------------------------- */
/*  Hook                                               */
/* -------------------------------------------------- */

/**
 * Wraps `useBookmarks` and returns items grouped by category,
 * sorted dynamically by count (most items first).
 * All 7 categories are always present (empty ones have count: 0).
 */
export function useGroupedBookmarks(userId?: string) {
    const bookmarksQuery = useBookmarks(userId);

    const allItems = bookmarksQuery.data?.pages.flatMap((p) => p.items) ?? [];

    const groups = useMemo<BookmarkGroup[]>(() => {
        // Group items by contentType
        const map = new Map<ContentType, BookmarkRow[]>();
        for (const item of allItems) {
            const existing = map.get(item.contentType) ?? [];
            existing.push(item);
            map.set(item.contentType, existing);
        }

        // Build groups for ALL categories (even empty ones)
        const result: BookmarkGroup[] = CATEGORY_META.map((meta) => ({
            type: meta.type,
            label: meta.label,
            emoji: meta.emoji,
            items: map.get(meta.type) ?? [],
            count: (map.get(meta.type) ?? []).length,
        }));

        // Sort by count descending (most items first)
        result.sort((a, b) => b.count - a.count);

        return result;
    }, [allItems]);

    return {
        groups,
        totalCount: allItems.length,
        isLoading: bookmarksQuery.isLoading,
        isError: bookmarksQuery.isError,
        refetch: bookmarksQuery.refetch,
        fetchNextPage: bookmarksQuery.fetchNextPage,
        hasNextPage: bookmarksQuery.hasNextPage,
        isFetchingNextPage: bookmarksQuery.isFetchingNextPage,
    };
}
