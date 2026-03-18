import { useMemo } from 'react';
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ContentType } from '@/lib/types/content';

export type DiscoverySource = 'friends' | 'global' | 'suggested';

export interface DiscoveryItem {
    id: string;
    contentId: string;
    contentType: ContentType;
    contentTitle: string;
    contentImageUrl: string | null;
    averageScore: number;
    ratingCount: number;
    source: DiscoverySource;
    friendCount: number;
    rankScore: number;
}

interface DiscoveryPage {
    items: DiscoveryItem[];
    nextPage: number | undefined;
}

interface RatingRow {
    user_id: string;
    content_id: string;
    content_type: ContentType;
    content_title: string;
    content_image_url: string | null;
    score: number;
}

interface AggregateEntry {
    contentId: string;
    contentType: ContentType;
    contentTitle: string;
    contentImageUrl: string | null;
    scoreSum: number;
    ratingCount: number;
    bestScore: number;
    friendUserIds: Set<string>;
}

const PAGE_SIZE = 10;
const ROW_WINDOW = 220;

function upsertAggregate(map: Map<string, AggregateEntry>, row: RatingRow): void {
    const key = `${row.content_type}::${row.content_id}`;
    const existing = map.get(key);

    if (existing) {
        existing.scoreSum += row.score;
        existing.ratingCount += 1;
        existing.bestScore = Math.max(existing.bestScore, row.score);
        existing.friendUserIds.add(row.user_id);
        return;
    }

    map.set(key, {
        contentId: row.content_id,
        contentType: row.content_type,
        contentTitle: row.content_title,
        contentImageUrl: row.content_image_url,
        scoreSum: row.score,
        ratingCount: 1,
        bestScore: row.score,
        friendUserIds: new Set([row.user_id]),
    });
}

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}

export function useDiscoveryFeed(): UseInfiniteQueryResult<InfiniteData<DiscoveryPage>> & { items: DiscoveryItem[] } {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    const query = useInfiniteQuery<DiscoveryPage>({
        queryKey: ['discovery-feed', userId],
        enabled: !!userId,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        queryFn: async ({ pageParam }) => {
            if (!userId) {
                return { items: [], nextPage: undefined };
            }

            const page = (pageParam as number) ?? 0;
            const offset = page * ROW_WINDOW;

            const now = Date.now();
            const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
            const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
            const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();

            const { data: followData, error: followError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userId);

            if (followError) throw followError;
            const followingIds = (followData ?? []).map((row) => row.following_id as string);

            const [{ data: globalRows, error: globalError }, { data: friendRows, error: friendError }, { data: suggestedRows, error: suggestedError }] = await Promise.all([
                supabase
                    .from('ratings')
                    .select('user_id, content_id, content_type, content_title, content_image_url, score')
                    .gte('created_at', thirtyDaysAgo)
                    .order('created_at', { ascending: false })
                    .range(offset, offset + ROW_WINDOW - 1),
                followingIds.length
                    ? supabase
                        .from('ratings')
                        .select('user_id, content_id, content_type, content_title, content_image_url, score')
                        .in('user_id', followingIds)
                        .gte('created_at', fourteenDaysAgo)
                        .order('created_at', { ascending: false })
                        .range(offset, offset + ROW_WINDOW - 1)
                    : Promise.resolve({ data: [], error: null }),
                followingIds.length
                    ? supabase
                        .from('ratings')
                        .select('user_id, content_id, content_type, content_title, content_image_url, score')
                        .in('user_id', followingIds)
                        .gte('score', 8)
                        .gte('created_at', ninetyDaysAgo)
                        .order('created_at', { ascending: false })
                        .range(offset, offset + ROW_WINDOW - 1)
                    : Promise.resolve({ data: [], error: null }),
            ]);

            if (globalError) throw globalError;
            if (friendError) throw friendError;
            if (suggestedError) throw suggestedError;

            const globalMap = new Map<string, AggregateEntry>();
            const friendsMap = new Map<string, AggregateEntry>();
            const suggestedMap = new Map<string, AggregateEntry>();

            for (const row of (globalRows ?? []) as RatingRow[]) {
                upsertAggregate(globalMap, row);
            }
            for (const row of (friendRows ?? []) as RatingRow[]) {
                upsertAggregate(friendsMap, row);
            }

            const suggestedBaseRows = (suggestedRows ?? []) as RatingRow[];
            const suggestedContentIds = [...new Set(suggestedBaseRows.map((row) => row.content_id))];

            let alreadyRated = new Set<string>();
            if (suggestedContentIds.length > 0) {
                const { data: myRatings, error: myRatingsError } = await supabase
                    .from('ratings')
                    .select('content_id')
                    .eq('user_id', userId)
                    .in('content_id', suggestedContentIds);

                if (myRatingsError) throw myRatingsError;
                alreadyRated = new Set((myRatings ?? []).map((row) => row.content_id as string));
            }

            for (const row of suggestedBaseRows) {
                if (alreadyRated.has(row.content_id)) continue;
                upsertAggregate(suggestedMap, row);
            }

            const keys = new Set<string>([
                ...globalMap.keys(),
                ...friendsMap.keys(),
                ...suggestedMap.keys(),
            ]);

            const rankedItems: DiscoveryItem[] = [];
            for (const key of keys) {
                const global = globalMap.get(key);
                const friends = friendsMap.get(key);
                const suggested = suggestedMap.get(key);
                const base = suggested ?? friends ?? global;
                if (!base) continue;

                const globalSignal = global ? global.ratingCount * 1.1 + global.scoreSum / global.ratingCount : 0;
                const friendsSignal = friends ? friends.ratingCount * 1.5 + friends.scoreSum / friends.ratingCount : 0;
                const suggestedSignal = suggested ? suggested.friendUserIds.size * 2.2 + suggested.bestScore : 0;

                const overlap = [global, friends, suggested].filter(Boolean).length;
                const rankScore =
                    globalSignal * 0.9 +
                    friendsSignal * 1.2 +
                    suggestedSignal * 1.4 +
                    Math.max(0, overlap - 1) * 1.25;

                let source: DiscoverySource = 'global';
                if (friendsSignal >= globalSignal && friendsSignal >= suggestedSignal) {
                    source = 'friends';
                }
                if (suggestedSignal >= globalSignal && suggestedSignal >= friendsSignal) {
                    source = 'suggested';
                }

                const ratingCount = Math.max(
                    global?.ratingCount ?? 0,
                    friends?.ratingCount ?? 0,
                    suggested?.ratingCount ?? 0,
                );
                const avgRaw =
                    source === 'suggested'
                        ? suggested!.bestScore
                        : source === 'friends'
                            ? friends!.scoreSum / friends!.ratingCount
                            : global
                                ? global.scoreSum / global.ratingCount
                                : 0;

                rankedItems.push({
                    id: `${base.contentType}-${base.contentId}`,
                    contentId: base.contentId,
                    contentType: base.contentType,
                    contentTitle: base.contentTitle,
                    contentImageUrl: base.contentImageUrl,
                    averageScore: round1(avgRaw),
                    ratingCount,
                    source,
                    friendCount: suggested?.friendUserIds.size ?? friends?.friendUserIds.size ?? 0,
                    rankScore: round1(rankScore),
                });
            }

            rankedItems.sort((a, b) => b.rankScore - a.rankScore);
            const items = rankedItems.slice(0, PAGE_SIZE);

            const hasMore =
                ((globalRows ?? []).length >= ROW_WINDOW) ||
                ((friendRows ?? []).length >= ROW_WINDOW) ||
                ((suggestedRows ?? []).length >= ROW_WINDOW);

            return {
                items,
                nextPage: hasMore ? page + 1 : undefined,
            };
        },
    });

    const items = useMemo(() => {
        const seen = new Set<string>();
        const merged: DiscoveryItem[] = [];

        for (const page of query.data?.pages ?? []) {
            for (const item of page.items) {
                if (seen.has(item.id)) continue;
                seen.add(item.id);
                merged.push(item);
            }
        }

        return merged;
    }, [query.data?.pages]);

    return {
        ...query,
        items,
    };
}
