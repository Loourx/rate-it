import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import { uploadAnythingImage } from '@/lib/api/anythingStorage';

interface CreateAnythingInput {
    title: string;
    description?: string;
    categoryTag?: string;
    imageUri?: string; // local file URI from image picker
    score?: number | null;
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

            // 1. Create anything_item
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

            // 2. Create rating if score is provided
            if (input.score !== undefined && input.score !== null) {
                const { error: ratingError } = await supabase
                    .from('ratings')
                    .insert({
                        user_id: userId,
                        content_type: 'anything',
                        content_id: data.id,
                        content_title: data.title,
                        content_image_url: imageUrl,
                        score: input.score,
                        review_text: null,
                        has_spoiler: false,
                    });

                if (ratingError) {
                    console.error('Error creating initial rating:', ratingError);
                }
            }

            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['search', 'anything'] });
            if (variables.score !== undefined && variables.score !== null) {
                queryClient.invalidateQueries({ queryKey: ['ratings'] });
                queryClient.invalidateQueries({ queryKey: ['feed'] });
                queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
            }
        },
    });
}
