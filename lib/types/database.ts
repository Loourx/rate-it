export interface Profile {
    id: string; // uuid
    username: string; // text unique
    displayName: string | null; // text
    avatarUrl: string | null; // text
    bio: string | null; // text default ''
    isPrivate: boolean; // boolean default false
    pinnedMode: 'manual' | 'auto'; // text default 'manual'
    createdAt: string; // timestamptz
    updatedAt: string; // timestamptz
}

export interface Rating {
    id: string; // uuid
    userId: string; // uuid references profiles
    contentType: 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'anything';
    contentId: string; // text
    contentTitle: string; // text
    contentImageUrl: string | null; // text
    score: number; // numeric(3,1), range 0-10, step 0.5
    reviewText: string | null; // text
    privateNote: string | null; // text, max 500 chars — never exposed outside owner's form
    hasSpoiler: boolean; // boolean
    contentSubtype: 'album' | 'track' | null; // text – only for music
    trackRatings: TrackRatingEntry[] | null; // jsonb – per-track scores for album ratings
    createdAt: string; // timestamptz
    updatedAt: string; // timestamptz
}

export interface TrackRatingEntry {
    trackId: string;
    trackName: string;
    trackNumber: number;
    score: number;
}

export interface UserContentStatus {
    id: string; // uuid
    userId: string; // uuid references profiles
    contentType: 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'anything';
    contentId: string; // text
    contentTitle: string; // text
    contentImageUrl: string | null; // text
    status: 'want' | 'doing' | 'done' | 'dropped';
    createdAt: string; // timestamptz
    updatedAt: string; // timestamptz
}

export interface PinnedItem {
    id: string; // uuid
    userId: string; // uuid references profiles
    contentType: 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'anything';
    contentId: string; // text
    contentTitle: string; // text
    contentImageUrl: string | null; // text
    position: number; // integer (1-5)
    createdAt: string; // timestamptz
}

export interface Follow {
    id: string; // uuid
    followerId: string; // uuid references profiles
    followingId: string; // uuid references profiles
    createdAt: string; // timestamptz
}

export interface ReviewLike {
    id: string; // uuid
    userId: string; // uuid references profiles
    ratingId: string; // uuid references ratings
    createdAt: string; // timestamptz
}

export interface Notification {
    id: string; // uuid
    recipientId: string; // uuid references profiles
    senderId: string; // uuid references profiles
    type: 'follow' | 'like';
    referenceId: string | null; // uuid (can be rating_id for likes)
    isRead: boolean; // boolean
    createdAt: string; // timestamptz
}

export interface AnythingItem {
    id: string; // uuid
    createdBy: string; // uuid references profiles
    title: string; // text (max 200)
    description: string | null; // text (max 500)
    categoryTag: string | null; // text
    imageUrl: string | null; // text – public URL from Storage bucket 'anything-images'
    createdAt: string; // timestamptz
}

export interface Report {
    id: string; // uuid
    reporterId: string; // uuid references profiles
    anythingItemId: string; // uuid references anything_items
    reason: string; // text
    createdAt: string; // timestamptz
}
