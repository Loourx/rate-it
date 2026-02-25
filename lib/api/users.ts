import { supabase } from '@/lib/supabase';
import type { UserSearchResult } from '@/lib/types/social';

/**
 * Searches profiles by username or display_name using case-insensitive LIKE.
 * Returns empty array if query is shorter than 2 characters.
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_private')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);

    if (error) throw error;
    if (!data) return [];

    return data.map((profile) => ({
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        isPrivate: profile.is_private,
    }));
}
