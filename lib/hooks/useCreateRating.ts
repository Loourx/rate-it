import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import { ContentType } from '@/lib/types/content';
import { TrackRatingEntry } from '@/lib/types/database';

interface CreateRatingInput {
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    score: number;
    reviewText: string | null;
    privateNote: string | null;
    hasSpoiler: boolean;
    contentSubtype?: 'album' | 'track' | null;
    trackRatings?: TrackRatingEntry[] | null;
}

interface UpdateRatingInput {
    id: string;
    score: number;
    reviewText: string | null;
    hasSpoiler: boolean;
}

export function useCreateRating() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: CreateRatingInput) => {
            if (!userId) throw new Error('No autenticado');

            const { data, error } = await supabase
                .from('ratings')
                .upsert(
                    {
                        user_id: userId,
                        content_type: input.contentType,
                        content_id: input.contentId,
                        content_title: input.contentTitle,
                        content_image_url: input.contentImageUrl,
                        score: input.score,
                        review_text: input.reviewText,
                        private_note: input.privateNote,
                        has_spoiler: input.hasSpoiler,
                        content_subtype: input.contentSubtype ?? null,
                        track_ratings: input.trackRatings?.length
                            ? JSON.stringify(input.trackRatings)
                            : null,
                    },
                    { onConflict: 'user_id,content_type,content_id' },
                )
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ratings'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
            queryClient.invalidateQueries({ queryKey: ['rating-history'] });
            queryClient.invalidateQueries({ queryKey: ['score-distribution'] });
            queryClient.invalidateQueries({ queryKey: ['streak'] });
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });
        },
    });
}

export function useExistingRating(contentType: ContentType, contentId: string) {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['ratings', userId, contentType, contentId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('ratings')
                .select('*')
                .eq('user_id', userId)
                .eq('content_type', contentType)
                .eq('content_id', contentId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });
}

export function useDeleteRating() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ratingId: string) => {
            const { error } = await supabase.from('ratings').delete().eq('id', ratingId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ratings'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
            queryClient.invalidateQueries({ queryKey: ['rating-history'] });
            queryClient.invalidateQueries({ queryKey: ['score-distribution'] });
            queryClient.invalidateQueries({ queryKey: ['streak'] });
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });
        },
    });
}
