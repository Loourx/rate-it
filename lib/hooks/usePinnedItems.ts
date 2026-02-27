import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ContentType } from '@/lib/types/content';

/* -------------------------------------------------- */
/*  TopRatedItem — shape returned by useTopRatedItems  */
/* -------------------------------------------------- */

export interface TopRatedItem {
    id: string;
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    score: number;
}

/* -------------------------------------------------- */
/*  Types                                             */
/* -------------------------------------------------- */

export interface PinnedItem {
    id: string;
    userId: string;
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    position: number;
    createdAt: string;
}

interface PinItemInput {
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
}

/* -------------------------------------------------- */
/*  usePinnedItems — get pinned items for a user       */
/* -------------------------------------------------- */

export function usePinnedItems(userId: string | undefined) {
    return useQuery({
        queryKey: ['pinned-items', userId],
        queryFn: async (): Promise<PinnedItem[]> => {
            const { data, error } = await supabase
                .from('pinned_items')
                .select('*')
                .eq('user_id', userId!)
                .order('position', { ascending: true });
            if (error) throw error;
            return (data ?? []).map((item) => ({
                id: item.id as string,
                userId: item.user_id as string,
                contentType: item.content_type as ContentType,
                contentId: item.content_id as string,
                contentTitle: item.content_title as string,
                contentImageUrl: item.content_image_url as string | null,
                position: item.position as number,
                createdAt: item.created_at as string,
            }));
        },
        enabled: !!userId,
    });
}

/* -------------------------------------------------- */
/*  useIsPinned — check if item is pinned             */
/* -------------------------------------------------- */

export function useIsPinned(contentType: ContentType, contentId: string) {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['is-pinned', userId, contentType, contentId],
        queryFn: async (): Promise<PinnedItem | null> => {
            const { data, error } = await supabase
                .from('pinned_items')
                .select('*')
                .eq('user_id', userId!)
                .eq('content_type', contentType)
                .eq('content_id', contentId)
                .maybeSingle();
            if (error) throw error;
            if (!data) return null;
            return {
                id: data.id as string,
                userId: data.user_id as string,
                contentType: data.content_type as ContentType,
                contentId: data.content_id as string,
                contentTitle: data.content_title as string,
                contentImageUrl: data.content_image_url as string | null,
                position: data.position as number,
                createdAt: data.created_at as string,
            };
        },
        enabled: !!userId && !!contentId,
    });
}

/* -------------------------------------------------- */
/*  usePinItem — pin content to profile               */
/* -------------------------------------------------- */

export function usePinItem() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: PinItemInput): Promise<void> => {
            if (!userId) throw new Error('No autenticado');

            const { data: existing } = await supabase
                .from('pinned_items')
                .select('position')
                .eq('user_id', userId);

            const occupied = new Set((existing ?? []).map((e) => e.position as number));
            let freePosition: number | null = null;
            for (let i = 1; i <= 5; i++) {
                if (!occupied.has(i)) { freePosition = i; break; }
            }
            if (freePosition === null) throw new Error('MAX_PINNED');

            const { error } = await supabase.from('pinned_items').insert({
                user_id: userId,
                content_type: input.contentType,
                content_id: input.contentId,
                content_title: input.contentTitle,
                content_image_url: input.contentImageUrl,
                position: freePosition,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pinned-items'] });
            queryClient.invalidateQueries({ queryKey: ['is-pinned'] });
        },
    });
}

/* -------------------------------------------------- */
/*  useUnpinItem — remove pinned item                 */
/* -------------------------------------------------- */

export function useUnpinItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (pinnedItemId: string): Promise<void> => {
            const { error } = await supabase
                .from('pinned_items')
                .delete()
                .eq('id', pinnedItemId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pinned-items'] });
            queryClient.invalidateQueries({ queryKey: ['is-pinned'] });
        },
    });
}

/* -------------------------------------------------- */
/*  useTopRatedItems — top 5 ratings by score          */
/* -------------------------------------------------- */

export function useTopRatedItems(userId: string | undefined) {
    return useQuery({
        queryKey: ['top-rated', userId],
        queryFn: async (): Promise<TopRatedItem[]> => {
            const { data, error } = await supabase
                .from('ratings')
                .select('id, content_type, content_id, content_title, content_image_url, score')
                .eq('user_id', userId!)
                .order('score', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return (data ?? []).map((r) => ({
                id: r.id as string,
                contentType: r.content_type as ContentType,
                contentId: r.content_id as string,
                contentTitle: r.content_title as string,
                contentImageUrl: r.content_image_url as string | null,
                score: r.score as number,
            }));
        },
        enabled: !!userId,
    });
}

/* -------------------------------------------------- */
/*  useUpdatePinnedMode — toggle manual / auto         */
/* -------------------------------------------------- */

export function useUpdatePinnedMode() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (mode: 'manual' | 'auto'): Promise<void> => {
            if (!userId) throw new Error('No autenticado');
            const { error } = await supabase
                .from('profiles')
                .update({ pinned_mode: mode })
                .eq('id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        },
    });
}
