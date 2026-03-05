import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import { ContentType, ContentStatus } from '@/lib/types/content';

interface UpsertStatusInput {
    contentType: ContentType;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    status: ContentStatus;
}

import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

export function useExistingContentStatus(contentType: ContentType, contentId: string): UseQueryResult<any> {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['content-status', userId, contentType, contentId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('user_content_status')
                .select('*')
                .eq('user_id', userId)
                .eq('content_type', contentType)
                .eq('content_id', contentId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 min
        gcTime: 5 * 60 * 1000, // 5 min
    });
}

export function useUpsertContentStatus(): UseMutationResult<any, Error, UpsertStatusInput> {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: UpsertStatusInput) => {
            if (!userId) throw new Error('No autenticado');

            const { data, error } = await supabase
                .from('user_content_status')
                .upsert(
                    {
                        user_id: userId,
                        content_type: input.contentType,
                        content_id: input.contentId,
                        content_title: input.contentTitle,
                        content_image_url: input.contentImageUrl,
                        status: input.status,
                    },
                    { onConflict: 'user_id,content_type,content_id' },
                )
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content-status'] });
            queryClient.invalidateQueries({ queryKey: ['pending-ratings'] });
        },
    });
}
