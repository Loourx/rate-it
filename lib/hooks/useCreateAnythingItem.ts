import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import { uploadAnythingImage } from '@/lib/api/anythingStorage';

interface CreateAnythingInput {
    title: string;
    description?: string;
    categoryTag?: string;
    imageUri?: string; // local file URI from image picker
}

export function useCreateAnythingItem() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: CreateAnythingInput) => {
            if (!userId) throw new Error('No autenticado');

            // Upload image first (if provided)
            let imageUrl: string | null = null;
            let uploadedPath: string | null = null;

            if (input.imageUri) {
                const publicUrl = await uploadAnythingImage(userId, input.imageUri);
                // Extract the storage path from the public URL for potential rollback
                const pathMatch = publicUrl.match(/anything-images\/(.+)$/);
                uploadedPath = pathMatch ? pathMatch[1] : null;
                imageUrl = publicUrl;
            }

            const { data, error } = await supabase
                .from('anything_items')
                .insert({
                    created_by: userId,
                    title: input.title.trim(),
                    description: input.description?.trim() || null,
                    category_tag: input.categoryTag?.trim() || null,
                    image_url: imageUrl,
                })
                .select()
                .single();

            if (error) {
                // Rollback: delete uploaded image if DB insert failed
                if (uploadedPath) {
                    await supabase.storage
                        .from('anything-images')
                        .remove([uploadedPath]);
                }
                if (error.code === '23505') {
                    throw new Error('Ya existe un item con ese título');
                }
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search', 'anything'] });
        },
    });
}
