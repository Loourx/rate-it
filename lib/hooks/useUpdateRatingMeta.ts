import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { ContentType } from '@/lib/types/content';

export interface UpdateRatingMetaInput {
    ratingId: string;
    contentType: ContentType;
    contentId: string;
    headline: string | null;
    sharePlatform: string | null;
    favoriteTrack: string | null;
    bookFormat: 'paper' | 'digital' | 'audiobook' | null;
    score?: number;
}

export function useUpdateRatingMeta() {
    const queryClient = useQueryClient();
    const userId = useAuthStore((s) => s.user?.id);

    const mutation = useMutation({
        mutationFn: async (input: UpdateRatingMetaInput) => {
            if (!userId) throw new Error('Usuario no autenticado');

            const updatePayload: Record<string, unknown> = {
                headline: input.headline,
                share_platform: input.sharePlatform,
                favorite_track: input.favoriteTrack,
                book_format: input.bookFormat,
            };
            if (input.score !== undefined) {
                updatePayload['score'] = input.score;
            }

            const { error } = await supabase
                .from('ratings')
                .update(updatePayload)
                .eq('id', input.ratingId)
                .eq('user_id', userId);

            if (error) throw error;
        },
        onSuccess: (_data, input) => {
            void queryClient.invalidateQueries({
                queryKey: ['rating', input.contentType, input.contentId],
            });
            void queryClient.invalidateQueries({
                queryKey: ['ratings', userId],
            });
        },
    });

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
