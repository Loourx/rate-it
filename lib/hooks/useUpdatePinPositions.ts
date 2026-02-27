import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';

interface PositionUpdate {
    id: string;
    position: number;
}

/** Batch-update pinned item positions after drag-and-drop reorder. */
export function useUpdatePinPositions() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (updates: PositionUpdate[]): Promise<void> => {
            if (!userId) throw new Error('No autenticado');

            // Update each item's position in parallel
            const results = await Promise.all(
                updates.map(({ id, position }) =>
                    supabase
                        .from('pinned_items')
                        .update({ position })
                        .eq('id', id)
                        .eq('user_id', userId),
                ),
            );

            const firstError = results.find((r) => r.error);
            if (firstError?.error) throw firstError.error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pinned-items'] });
        },
    });
}
