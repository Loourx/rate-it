export interface FollowerProfile {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    createdAt: string;
}

export type FollowingProfile = FollowerProfile;

export interface FollowStatus {
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
}

export interface FeedItem {
    id: string;
    userId: string;
    username: string;
    userAvatarUrl: string | null;
    userDisplayName: string | null;
    contentId: string;
    contentType: 'movie' | 'tv' | 'book' | 'game' | 'music' | 'podcast' | 'custom';
    contentTitle: string;
    contentImageUrl: string | null;
    score: number;
    reviewText: string | null;
    hasSpoiler: boolean;
    createdAt: string;
    likesCount: number; // Siempre 0 por ahora; se poblará en el Paso 5 (likes)
}
