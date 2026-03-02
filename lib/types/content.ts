export type ContentType = 'movie' | 'series' | 'book' | 'game' | 'music';
/* MVP_DISABLED: | 'podcast' | 'anything' */

export type ContentStatus = 'want' | 'doing' | 'done' | 'dropped';

export interface BaseContent {
    id: string;
    title: string;
    imageUrl: string | null;
    type: ContentType;
}

export interface Movie extends BaseContent {
    type: 'movie';
    year?: string;
    director?: string;
    overview?: string;
    genres?: string[];
    runtime?: number; // minutos
    popularity?: number; // TMDB popularity score (for sorting only)
}

export interface Series extends BaseContent {
    type: 'series';
    year?: string;
    creator?: string;
    overview?: string;
    genres?: string[];
    seasons?: number;
    episodes?: number;
    popularity?: number; // TMDB popularity score (for sorting only)
}

export interface Book extends BaseContent {
    type: 'book';
    author?: string;
    pages?: number;
    description?: string;
    categories?: string[];
    year?: string;
}

export interface Game extends BaseContent {
    type: 'game';
    year?: string;
    developer?: string;
    platforms?: string[];
    description?: string;
    genres?: string[];
}

export interface Music extends BaseContent {
    type: 'music';
    artist?: string;
    album?: string;
    year?: string;
    genre?: string;
    trackCount?: number;
    isAlbum?: boolean;
    durationMs?: number;
    tracks?: AlbumTrack[];
}

export interface AlbumTrack {
    trackId: string;
    trackName: string;
    trackNumber: number;
    durationMs: number;
    discNumber?: number;
    previewUrl?: string;
    artistName?: string;
}

export interface TrackRating {
    trackId: string;
    trackName: string;
    trackNumber: number;
    score: number;
}

/* MVP_DISABLED: Podcast and Anything interfaces kept for future reactivation */
export interface Podcast /* MVP_DISABLED: extends BaseContent */ {
    id: string;
    title: string;
    imageUrl: string | null;
    type: 'podcast';
    publisher?: string;
    description?: string;
    genre?: string;
    episodeCount?: number;
}

export interface Anything /* MVP_DISABLED: extends BaseContent */ {
    id: string;
    title: string;
    imageUrl: string | null;
    type: 'anything';
    createdBy: string;
    creatorUsername?: string; // Resolved from profiles join
    description?: string;
    categoryTag?: string;
}

export type AllContent = Movie | Series | Book | Game | Music /* MVP_DISABLED: | Podcast | Anything */;
