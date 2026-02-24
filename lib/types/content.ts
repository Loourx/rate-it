export type ContentType = 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'anything';

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
}

export interface Series extends BaseContent {
    type: 'series';
    year?: string;
    creator?: string;
    overview?: string;
    genres?: string[];
    seasons?: number;
    episodes?: number;
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

export interface Podcast extends BaseContent {
    type: 'podcast';
    publisher?: string;
    description?: string;
    genre?: string;
    episodeCount?: number;
}

export interface Anything extends BaseContent {
    type: 'anything';
    createdBy: string;
    description?: string;
    categoryTag?: string;
}

export type AllContent = Movie | Series | Book | Game | Music | Podcast | Anything;
