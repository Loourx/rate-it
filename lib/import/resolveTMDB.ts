/**
 * lib/import/resolveTMDB.ts
 *
 * Resolves each ImportItem against the TMDB API using a multi-strategy
 * search (with year → without year ±1 → normalized title).
 *
 * Throttled at 300ms between calls (~3.3 req/s, safely under the 4 req/s
 * TMDB limit). Per-item errors never abort the full batch.
 */

import { fetchTmdb, getImageUrl } from '@/lib/api/tmdb';
import type {
    ImportItem,
    ResolvedImportItem,
    UnresolvedImportItem,
} from '@/lib/types/import';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface TmdbMovieResult {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    popularity?: number;
}

interface TmdbSearchResponse {
    results: TmdbMovieResult[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 300ms delay between calls → ~3.3 req/s, safely under 4 req/s limit. */
async function throttle(): Promise<void> {
    await new Promise<void>(resolve => setTimeout(resolve, 300));
}

/**
 * Lightweight title normalisation for fallback search attempts.
 * Collapses whitespace, normalises quotes. Does NOT strip accents so
 * TMDB's own language-aware matching still works.
 */
function normalizeTitle(title: string): string {
    return title
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"');
}

/** Pick the result with the highest popularity from a non-empty array. */
function topByPopularity(results: TmdbMovieResult[]): TmdbMovieResult {
    return results.reduce((best, cur) =>
        (cur.popularity ?? 0) > (best.popularity ?? 0) ? cur : best
    );
}

/** Search movies with explicit parameters, returns raw results. */
async function searchRaw(
    query: string,
    extra: Record<string, string> = {}
): Promise<TmdbMovieResult[]> {
    const data = await fetchTmdb<TmdbSearchResponse>('/search/movie', {
        query,
        language: 'es-ES',
        ...extra,
    });
    return data.results ?? [];
}

// ---------------------------------------------------------------------------
// Core resolution logic for a single item
// ---------------------------------------------------------------------------

async function resolveOne(
    item: ImportItem
): Promise<TmdbMovieResult | null> {
    const title = normalizeTitle(item.originalTitle);
    const year = item.originalYear ?? '';

    // Strategy (a): exact search with year
    if (year) {
        const results = await searchRaw(title, { year });
        if (results.length > 0) return topByPopularity(results);
    }

    // Strategy (b): search without year, filter ±1
    const broader = await searchRaw(title);
    if (broader.length > 0) {
        const yearNum = year ? parseInt(year, 10) : null;
        const inRange = yearNum
            ? broader.filter(r => {
                const ry = parseInt((r.release_date ?? '').slice(0, 4), 10);
                return Math.abs(ry - yearNum) <= 1;
            })
            : broader;

        if (inRange.length > 0) return topByPopularity(inRange);
        if (!yearNum) return topByPopularity(broader); // no year to filter on
    }

    // Strategy (c): normalised title + year (handles smart quotes, etc.)
    if (year) {
        const normalized = title.replace(/^The\s+/i, '').trim();
        if (normalized !== title) {
            const fallback = await searchRaw(normalized, { year });
            if (fallback.length > 0) return topByPopularity(fallback);
        }
    }

    return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function resolveTMDB(
    items: ImportItem[],
    onProgress: (processed: number, current: string) => void
): Promise<Array<ResolvedImportItem | UnresolvedImportItem>> {
    const results: Array<ResolvedImportItem | UnresolvedImportItem> = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        onProgress(i, item.originalTitle);

        try {
            await throttle();
            const match = await resolveOne(item);

            if (match) {
                results.push({
                    ...item,
                    contentType: 'movie',
                    contentId: match.id.toString(),
                    contentTitle: match.title,
                    contentImageUrl: getImageUrl(match.poster_path),
                    resolved: true,
                });
            } else {
                results.push({ ...item, resolved: false, reason: 'not_found' });
            }
        } catch {
            results.push({ ...item, resolved: false, reason: 'api_error' });
        }
    }

    // Final progress tick (processed = total)
    onProgress(items.length, '');

    return results;
}
