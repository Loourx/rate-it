import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ContentType } from '@/lib/types/content';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

export interface BookmarkRow {
    id: string;
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    createdAt: string;
}

interface ToggleBookmarkInput {
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
}

interface BookmarkPage {
    items: BookmarkRow[];
    nextOffset: number | undefined;
}

const PAGE_SIZE = 20;

/* -------------------------------------------------- */
/*  useIsBookmarked                                    */
/* -------------------------------------------------- */

export function useIsBookmarked(contentType: ContentType, contentId: string) {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['is-bookmarked', userId, contentType, contentId],
        queryFn: async (): Promise<boolean> => {
            if (!userId) return false;

            const { count, error } = await supabase
                .from('bookmarks')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('content_type', contentType)
                .eq('content_id', contentId);

            if (error) throw error;
            return (count ?? 0) > 0;
        },
        enabled: !!userId,
    });
}

/* -------------------------------------------------- */
/*  useToggleBookmark                                  */
/* -------------------------------------------------- */

export function useToggleBookmark() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: ToggleBookmarkInput) => {
            if (!userId) throw new Error('No autenticado');

            // Check current state
            const { data: existing, error: checkError } = await supabase
                .from('bookmarks')
                .select('id')
                .eq('user_id', userId)
                .eq('content_type', input.contentType)
                .eq('content_id', input.contentId)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existing) {
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('id', existing.id);
                if (error) throw error;
                return { action: 'removed' as const };
            }

            const { error } = await supabase
                .from('bookmarks')
                .insert({
                    user_id: userId,
                    content_type: input.contentType,
                    content_id: input.contentId,
                    content_title: input.contentTitle,
                    content_image_url: input.contentImageUrl,
                });
            if (error) throw error;
            return { action: 'added' as const };
        },

        onMutate: async (input: ToggleBookmarkInput) => {
            // Cancel outgoing queries to avoid overwriting optimistic update
            await queryClient.cancelQueries({
                queryKey: ['is-bookmarked', userId, input.contentType, input.contentId],
            });

            const previousValue = queryClient.getQueryData<boolean>(
                ['is-bookmarked', userId, input.contentType, input.contentId],
            );

            // Optimistic update
            queryClient.setQueryData(
                ['is-bookmarked', userId, input.contentType, input.contentId],
                !previousValue,
            );

            return { previousValue };
        },

        onError: (_err, input, context) => {
            // Rollback on error
            if (context?.previousValue !== undefined) {
                queryClient.setQueryData(
                    ['is-bookmarked', userId, input.contentType, input.contentId],
                    context.previousValue,
                );
            }
        },

        onSuccess: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['is-bookmarked'] });
        },
    });
}

/* -------------------------------------------------- */
/*  useBookmarks (paginated list)                      */
/* -------------------------------------------------- */

export function useBookmarks(overrideUserId?: string) {
    const { session } = useAuthStore();
    const userId = overrideUserId ?? session?.user.id;

    return useInfiniteQuery<BookmarkPage>({
        queryKey: ['bookmarks', userId],
        queryFn: async ({ pageParam }) => {
            if (!userId) return { items: [], nextOffset: undefined };

            const offset = (pageParam as number) ?? 0;

            const { data, error } = await supabase
                .from('bookmarks')
                .select('id, content_type, content_id, content_title, content_image_url, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + PAGE_SIZE - 1);

            if (error) throw error;

            const rows = (data ?? []) as Array<{
                id: string;
                content_type: string;
                content_id: string;
                content_title: string;
                content_image_url: string | null;
                created_at: string;
            }>;

            const items: BookmarkRow[] = rows.map((r) => ({
                id: r.id,
                contentType: r.content_type as ContentType,
                contentId: r.content_id,
                contentTitle: r.content_title,
                contentImageUrl: r.content_image_url,
                createdAt: r.created_at,
            }));

            return {
                items,
                nextOffset: items.length === PAGE_SIZE ? offset + PAGE_SIZE : undefined,
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        enabled: !!userId,
    });
}
