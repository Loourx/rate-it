import type { FeedItem } from '@/lib/types/social';
import type { GlobalTrendingItem } from '@/lib/hooks/useGlobalTrending';

/** Discriminated union for the hybrid feed FlatList. */
export type HybridFeedItem =
    | { kind: 'social';    id: string; data: FeedItem }
    | { kind: 'separator'; id: string; label: string }
    | { kind: 'trending';  id: string; data: GlobalTrendingItem };

/**
 * Stable key extractor for FlatList — always use this function,
 * never inline, to avoid re-renders.
 */
export function hybridFeedKeyExtractor(item: HybridFeedItem): string {
    return item.id;
}
