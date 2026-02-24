import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import { ContentType } from '@/lib/types/content';

export interface Rating {
    id: string;
    user_id: string;
    content_type: ContentType;
    content_id: string;
    content_title: string;
    content_image_url: string | null;
    score: number; // 0-10 (step 0.5)
    review_text: string | null;
    has_spoiler: boolean;
    created_at: string;
    updated_at: string;
}

export function useRatings() {
    const { session } = useAuthStore();
    const userId = session?.user.id;

    return useQuery({
        queryKey: ['ratings', userId],
        queryFn: async () => {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('ratings')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Rating[];
        },
        enabled: !!userId,
    });
}
