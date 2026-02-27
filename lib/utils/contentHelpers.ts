/**
 * Utility functions for deriving display-ready metadata from BaseContent.
 */
import type { BaseContent, Movie, Series, Book, Game, Music, Podcast, Anything } from '@/lib/types/content';

export function formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
}

export function getGenres(item: BaseContent): string[] {
    switch (item.type) {
        case 'movie': return (item as Movie).genres ?? [];
        case 'series': return (item as Series).genres ?? [];
        case 'game': return (item as Game).genres ?? [];
        case 'book': return (item as Book).categories ?? [];
        default: return [];
    }
}

export function getSubtitle(item: BaseContent): string {
    switch (item.type) {
        case 'movie': {
            const movie = item as Movie;
            const parts: string[] = [];
            if (movie.year) parts.push(movie.year);
            if (movie.runtime) parts.push(formatRuntime(movie.runtime));
            return parts.length > 0 ? parts.join(' · ') : 'Película';
        }
        case 'series': {
            const series = item as Series;
            const parts: string[] = [];
            if (series.year) parts.push(series.year);
            if (series.seasons) parts.push(`${series.seasons} temporada${series.seasons > 1 ? 's' : ''}`);
            return parts.length > 0 ? parts.join(' · ') : 'Serie';
        }
        case 'book': return (item as Book).author || 'Libro';
        case 'game': return (item as Game).year ?? 'Videojuego';
        case 'music': return (item as Music).artist || 'Música';
        case 'podcast': return (item as Podcast).publisher || 'Podcast';
        case 'anything': return (item as Anything).categoryTag ?? 'Anything';
        default: return 'Contenido';
    }
}

export function getSecondaryInfo(item: BaseContent): string | null {
    if (item.type === 'music') {
        const music = item as Music;
        if (!music.isAlbum && music.album) return music.album;
    }
    if (item.type === 'game') {
        const game = item as Game;
        if (game.platforms && game.platforms.length > 0) return game.platforms[0];
    }
    return null;
}
