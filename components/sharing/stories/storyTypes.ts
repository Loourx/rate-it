export type StoryContentType = 'movie' | 'series' | 'book' | 'game' | 'music';

export interface StoryVisibility {
    showReview: boolean;
    showPlatform: boolean;
    showFavoriteTrack: boolean;
}

export interface StoryCardProps {
    contentType: StoryContentType;
    title: string;
    posterUrl: string | null;
    score: number;
    reviewText?: string;
    username: string;
    year?: string;
    platform?: string;
    favoriteTrack?: string;
    bookFormat?: string;
    showReview: boolean;
    showPlatform: boolean;
    showFavoriteTrack: boolean;
}
