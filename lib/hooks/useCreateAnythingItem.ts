import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';

interface CreateAnythingInput {
    title: string;
    description?: string;
    categoryTag?: string;
}

export function useCreateAnythingItem() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: CreateAnythingInput) => {
            if (!userId) throw new Error('No autenticado');

            const { data, error } = await supabase
                .from('anything_items')
                .insert({
                    created_by: userId,
                    title: input.title.trim(),
                    description: input.description?.trim() || null,
                    category_tag: input.categoryTag?.trim() || null,
                })
                .select()
                .single();

            if (error) {
                // Handle unique constraint violation
                if (error.code === '23505') {
                    throw new Error('Ya existe un item con ese título');
                }
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            // Invalidate anything search queries to show the new item
            queryClient.invalidateQueries({ queryKey: ['search', 'anything'] });
        },
    });
}
