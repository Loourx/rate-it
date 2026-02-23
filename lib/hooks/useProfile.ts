import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import type { Profile } from '@/lib/types/database';

interface UpdateProfileInput {
    displayName: string;
    bio: string;
    isPrivate: boolean;
    avatarUrl?: string;
}

export function useProfile() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery<Profile | null>({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return {
                id: data.id,
                username: data.username,
                displayName: data.display_name,
                avatarUrl: data.avatar_url,
                bio: data.bio,
                isPrivate: data.is_private,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            } as Profile;
        },
        enabled: !!userId,
    });
}

export function useUpdateProfile() {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id;

    return useMutation({
        mutationFn: async (input: UpdateProfileInput) => {
            if (!userId) throw new Error('No autenticado');

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    display_name: input.displayName,
                    bio: input.bio,
                    is_private: input.isPrivate,
                    ...(input.avatarUrl !== undefined && { avatar_url: input.avatarUrl }),
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer for Supabase upload
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
        });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
}
