import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Anything } from '../types/content';
import { AnythingItem } from '../types/database';

// Helper to map DB item to Content type
const mapAnythingItemToContent = (item: AnythingItem): Anything => ({
    id: item.id,
    type: 'anything',
    title: item.title,
    imageUrl: item.imageUrl ?? null,
    createdBy: item.createdBy,
    description: item.description || undefined,
    categoryTag: item.categoryTag || undefined,
});

async function searchAnything(query: string): Promise<Anything[]> {
    if (!query) return [];

    const { data, error } = await supabase
        .from('anything_items')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(20);

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(mapAnythingItemToContent);
}

export function useSearchAnything(query: string) {
    return useQuery({
        queryKey: ['search', 'anything', query],
        queryFn: () => searchAnything(query),
        enabled: query.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
