import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';

interface ReportAnythingInput {
    anythingItemId: string;
    reason: string;
}

export function useReportAnything() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: ReportAnythingInput) => {
            if (!userId) throw new Error('No autenticado');

            const { data, error } = await supabase
                .from('reports')
                .insert({
                    reporter_id: userId,
                    anything_item_id: input.anythingItemId,
                    reason: input.reason.trim(),
                })
                .select()
                .single();

            if (error) {
                // Handle unique constraint violation (user already reported this item)
                if (error.code === '23505') {
                    throw new Error('Ya has reportado este item');
                }
                throw error;
            }

            return data;
        },
    });
}

/**
 * Check if current user has already reported an item
 */
export function useHasReported(anythingItemId: string) {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['reports', 'has-reported', userId, anythingItemId],
        queryFn: async () => {
            if (!userId) return false;

            const { data, error } = await supabase
                .from('reports')
                .select('id')
                .eq('reporter_id', userId)
                .eq('anything_item_id', anythingItemId)
                .maybeSingle();

            if (error) throw error;
            return !!data;
        },
        enabled: !!userId && !!anythingItemId,
    });
}
