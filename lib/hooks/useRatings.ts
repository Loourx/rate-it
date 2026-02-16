import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import { ContentType } from '@/lib/types/content';

export interface Rating {
    id: string;
    user_id: string;
    content_type: ContentType;
    content_id: string;
    rating: number; // 1-10
    review?: string;
    created_at: string;
    // We would ideally join with content details, but for now we might just have the raw rating
    // In a real app we'd need to fetch content metadata or store it in the rating.
    // For this MVP, let's assume we might need to fetch content details separately or the rating row has some basic info?
    // Checking migrations... 002_create_ratings.sql usually has just IDs.
    // SECTION 2.1 says "Búsqueda: Barra global consultando APIs".
    // If we want to show "My Ratings" with images/titles, we need that info.
    // Storing title/image in ratings table is a common optimization for this.
    // If not, we have to fetch from API for every rating which is slow.
    // Let's assume for now we just want to list them.
    // However, the UI guidelines show "Tarjetas" which need Title + Image.
    // I will check the migration 002 to see if we stored metadata.
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
