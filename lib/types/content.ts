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
}

export interface Series extends BaseContent {
    type: 'series';
    year?: string;
    creator?: string;
    overview?: string;
}

export interface Book extends BaseContent {
    type: 'book';
    author?: string;
    pages?: number;
    description?: string;
}

export interface Game extends BaseContent {
    type: 'game';
    year?: string;
    developer?: string;
    platform?: string;
    description?: string;
}

export interface Music extends BaseContent {
    type: 'music';
    artist?: string;
    album?: string;
}

export interface Podcast extends BaseContent {
    type: 'podcast';
    publisher?: string;
    description?: string;
}

export interface Anything extends BaseContent {
    type: 'anything';
    createdBy: string;
    description?: string;
    categoryTag?: string;
}

export type AllContent = Movie | Series | Book | Game | Music | Podcast | Anything;
