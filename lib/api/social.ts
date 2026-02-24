import { supabase } from '@/lib/supabase';
import type { FeedItem, FollowerProfile, FollowingProfile } from '@/lib/types/social';

type RatingWithProfile = {
    id: string;
    user_id: string;
    content_id: string;
    content_type: FeedItem['contentType'];
    content_title: string;
    content_image_url: string | null;
    score: number;
    review_text: string | null;
    has_spoiler: boolean;
    created_at: string;
    profile: {
        id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
    } | null;
};

export async function getSocialFeed(
    userId: string,
    page: number = 0,
    pageSize: number = 20,
): Promise<FeedItem[]> {
    const offset = page * pageSize;

    // Paso 1: obtener IDs de usuarios seguidos
    const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    if (followError) throw followError;

    const followingIds = (followData ?? []).map((row) => row.following_id as string);

    if (followingIds.length === 0) return [];

    // Paso 2: obtener ratings de esos usuarios con perfil incluido
    const { data, error } = await supabase
        .from('ratings')
        .select(`
            *,
            profile:profiles!ratings_user_id_fkey(
                id,
                username,
                display_name,
                avatar_url
            )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return (data as RatingWithProfile[]).map((rating) => ({
        id: rating.id,
        userId: rating.user_id,
        username: rating.profile?.username ?? '',
        userAvatarUrl: rating.profile?.avatar_url ?? null,
        userDisplayName: rating.profile?.display_name ?? null,
        contentId: rating.content_id,
        contentType: rating.content_type,
        contentTitle: rating.content_title,
        contentImageUrl: rating.content_image_url,
        score: rating.score,
        reviewText: rating.review_text,
        hasSpoiler: rating.has_spoiler,
        createdAt: rating.created_at,
        likesCount: 0,
    }));
}

type ProfileRow = {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
};

function mapToProfile(raw: unknown): FollowerProfile {
    const p = raw as ProfileRow;
    return {
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        createdAt: p.created_at,
    };
}

export async function followUser(targetUserId: string): Promise<void> {
    const { error } = await supabase
        .from('follows')
        .insert({ following_id: targetUserId });

    if (error) throw error;
}

export async function unfollowUser(targetUserId: string): Promise<void> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

    if (error) throw error;
}

export async function getFollowers(userId: string): Promise<FollowerProfile[]> {
    const { data, error } = await supabase
        .from('follows')
        .select('profiles!follower_id(id, username, display_name, avatar_url, created_at)')
        .eq('following_id', userId);

    if (error) throw error;

    return (data ?? []).map((row) => mapToProfile(row.profiles));
}

export async function getFollowing(userId: string): Promise<FollowingProfile[]> {
    const { data, error } = await supabase
        .from('follows')
        .select('profiles!following_id(id, username, display_name, avatar_url, created_at)')
        .eq('follower_id', userId);

    if (error) throw error;

    return (data ?? []).map((row) => mapToProfile(row.profiles));
}

export async function checkIfFollowing(
    currentUserId: string,
    targetUserId: string,
): Promise<boolean> {
    const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();

    if (error) throw error;
    return data !== null;
}
