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

export function useExistingContentStatus(contentType: ContentType, contentId: string) {
    const { session } = useAuthStore();
    const userId = session?.user.id;
    const dbContentType = contentType === 'anything' ? 'custom' : contentType;

    return useQuery({
        queryKey: ['content-status', userId, dbContentType, contentId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('user_content_status')
                .select('*')
                .eq('user_id', userId)
                .eq('content_type', dbContentType)
                .eq('content_id', contentId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });
}

export function useUpsertContentStatus() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: UpsertStatusInput) => {
            if (!userId) throw new Error('No autenticado');

            const dbContentType = input.contentType === 'anything' ? 'custom' : input.contentType;

            const { data, error } = await supabase
                .from('user_content_status')
                .upsert(
                    {
                        user_id: userId,
                        content_type: dbContentType,
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
        },
    });
}
