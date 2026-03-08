/**
 * lib/import/resolveGoogleBooks.ts
 *
 * Resolves each ImportItem (from Goodreads) against the Google Books API.
 * Strategy order: ISBN → title+author → title-only.
 * Throttled at 250ms between calls. Per-item errors never abort the batch.
 */

import { fetchGoogleBooks, sanitizeImageUrl } from '@/lib/api/googleBooks';
import type {
    ImportItem,
    ResolvedImportItem,
    UnresolvedImportItem,
} from '@/lib/types/import';

// ---------------------------------------------------------------------------
// Internal types (mirrors googleBooks.ts, kept local to avoid coupling)
// ---------------------------------------------------------------------------

interface VolumeInfo {
    title: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string };
}

interface Volume {
    id: string;
    volumeInfo: VolumeInfo;
}

interface SearchResponse {
    items?: Volume[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 250ms delay — conservative rate for Google Books. */
async function throttle(): Promise<void> {
    await new Promise<void>(resolve => setTimeout(resolve, 250));
}

/**
 * Fuzzy title match: both directions (contains) plus exact.
 * Case-insensitive, whitespace-normalised.
 */
function titlesMatch(original: string, candidate: string): boolean {
    const a = original.toLowerCase().trim();
    const b = candidate.toLowerCase().trim();
    return a === b || b.includes(a) || a.includes(b);
}

/**
 * Author match: at least one candidate author must contain
 * the last token of the original author string.
 */
function authorsMatch(original: string, candidates: string[]): boolean {
    if (!original || candidates.length === 0) return false;
    const parts = original.toLowerCase().split(/\s+/);
    const lastName = parts[parts.length - 1];
    return candidates.some(c => c.toLowerCase().includes(lastName));
}

/** Run a Google Books volumes query and return items (never throws). */
async function searchVolumes(
    params: Record<string, string>
): Promise<Volume[]> {
    const data = await fetchGoogleBooks<SearchResponse>('', params);
    return data.items ?? [];
}

// ---------------------------------------------------------------------------
// Core resolution logic for a single item
// ---------------------------------------------------------------------------

async function resolveOne(item: ImportItem): Promise<Volume | null> {
    const title = item.originalTitle.trim();
    const author = item.originalAuthor ?? '';
    const isbn = item.originalISBN ?? '';

    // Strategy (a): ISBN search — most precise
    if (isbn) {
        const results = await searchVolumes({
            q: `isbn:${isbn}`,
            maxResults: '1',
        });
        if (results.length === 1) return results[0];
    }

    // Strategy (b): title + author with fuzzy validation
    if (title && author) {
        const query = `intitle:${title}+inauthor:${author}`;
        const results = await searchVolumes({
            q: query,
            maxResults: '5',
            printType: 'books',
            orderBy: 'relevance',
        });
        const match = results.find(
            v =>
                titlesMatch(title, v.volumeInfo.title) &&
                authorsMatch(author, v.volumeInfo.authors ?? [])
        );
        if (match) return match;
    }

    // Strategy (c): title-only, lighter author requirement
    if (title) {
        const results = await searchVolumes({
            q: `intitle:${title}`,
            maxResults: '5',
            printType: 'books',
        });
        const match = results.find(v =>
            titlesMatch(title, v.volumeInfo.title)
        );
        if (match) return match;
    }

    return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function resolveGoogleBooks(
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
                    contentType: 'book',
                    contentId: match.id,
                    contentTitle: match.volumeInfo.title,
                    contentImageUrl: sanitizeImageUrl(
                        match.volumeInfo.imageLinks?.thumbnail
                    ),
                    resolved: true,
                });
            } else {
                results.push({ ...item, resolved: false, reason: 'not_found' });
            }
        } catch {
            results.push({ ...item, resolved: false, reason: 'api_error' });
        }
    }

    // Final tick — total processed
    onProgress(items.length, '');

    return results;
}
