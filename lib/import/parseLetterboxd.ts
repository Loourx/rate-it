/**
 * lib/import/parseLetterboxd.ts
 *
 * Pure function: receives raw CSV text from a Letterboxd export ZIP and
 * returns an array of normalised ImportItem ready for ID resolution.
 *
 * No side-effects, no API calls, no Supabase access.
 */

import Papa from 'papaparse';

import type {
    ImportItem,
    LetterboxdRatingRow,
    LetterboxdReviewRow,
    LetterboxdWatchedRow,
} from '@/lib/types/import';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Stable dedup key: case-insensitive, trims whitespace.
 * Exported so unit tests can build expected keys without duplicating logic.
 */
export function makeKey(name: string, year: string): string {
    return `${name.trim().toLowerCase()}::${year.trim()}`;
}

/** Convert Letterboxd 0.5–5.0 rating to Rate-it 1–10 scale (step 0.5). */
function convertScore(raw: string): number | null {
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) return null;

    const scaled = parsed * 2; // 0.5→1.0, 5.0→10.0
    const rounded = Math.round(scaled * 2) / 2; // snap to 0.5 steps

    if (rounded < 1 || rounded > 10) return null;
    return rounded;
}

/** Safely parse a CSV string; returns typed rows or empty array on failure. */
function parseCsv<T>(csv: string | undefined): T[] {
    if (!csv) return [];

    const result = Papa.parse<Record<string, string>>(csv, {
        header: true,
        skipEmptyLines: true,
    });

    return result.data as unknown as T[];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function parseLetterboxd(files: {
    ratings?: string;
    watched?: string;
    reviews?: string;
    watchlist?: string;
}): ImportItem[] {
    const map = new Map<string, ImportItem>();

    // ── Step 3: ratings.csv ──────────────────────────────────────────────────
    const ratingRows = parseCsv<LetterboxdRatingRow>(files.ratings);

    for (const row of ratingRows) {
        const name = row.Name ?? '';
        const year = row.Year ?? '';
        if (!name) continue;

        const score = convertScore(row.Rating ?? '');
        // Rows without a valid rating are still watched — handled by watched.csv
        if (score === null) continue;

        const key = makeKey(name, year);

        map.set(key, {
            source: 'letterboxd',
            originalTitle: name.trim(),
            originalYear: year.trim() || null,
            originalAuthor: null,
            originalISBN: null,
            score,
            reviewText: null,
            hasSpoiler: false,
            privateNote: null,
            status: 'done',
            sourceDate: row.Date?.trim() || null,
            sourceUri: row['Letterboxd URI']?.trim() || null,
        });
    }

    // ── Step 4: reviews.csv ──────────────────────────────────────────────────
    const reviewRows = parseCsv<LetterboxdReviewRow>(files.reviews);

    for (const row of reviewRows) {
        const name = row.Name ?? '';
        const year = row.Year ?? '';
        if (!name) continue;

        const key = makeKey(name, year);
        const reviewText = row.Review?.trim() || null;
        const hasSpoiler = row.Spoiler?.trim() === 'Yes';

        const existing = map.get(key);
        if (existing) {
            existing.reviewText = reviewText;
            existing.hasSpoiler = hasSpoiler;
        } else {
            // Edge case: review exists but no matching entry in ratings.csv
            const score = convertScore(row.Rating ?? '');
            map.set(key, {
                source: 'letterboxd',
                originalTitle: name.trim(),
                originalYear: year.trim() || null,
                originalAuthor: null,
                originalISBN: null,
                score,
                reviewText,
                hasSpoiler,
                privateNote: null,
                status: 'done',
                sourceDate: row.Date?.trim() || null,
                sourceUri: row['Letterboxd URI']?.trim() || null,
            });
        }
    }

    // ── Step 5: watched.csv ──────────────────────────────────────────────────
    const watchedRows = parseCsv<LetterboxdWatchedRow>(files.watched);

    for (const row of watchedRows) {
        const name = row.Name ?? '';
        const year = row.Year ?? '';
        if (!name) continue;

        const key = makeKey(name, year);
        if (!map.has(key)) {
            map.set(key, {
                source: 'letterboxd',
                originalTitle: name.trim(),
                originalYear: year.trim() || null,
                originalAuthor: null,
                originalISBN: null,
                score: null,
                reviewText: null,
                hasSpoiler: false,
                privateNote: null,
                status: 'done',
                sourceDate: row.Date?.trim() || null,
                sourceUri: row['Letterboxd URI']?.trim() || null,
            });
        }
    }

    // ── Step 6: watchlist.csv ────────────────────────────────────────────────
    // watchlist.csv shares the same columns as watched.csv
    const watchlistRows = parseCsv<LetterboxdWatchedRow>(files.watchlist);

    for (const row of watchlistRows) {
        const name = row.Name ?? '';
        const year = row.Year ?? '';
        if (!name) continue;

        const key = makeKey(name, year);
        if (!map.has(key)) {
            map.set(key, {
                source: 'letterboxd',
                originalTitle: name.trim(),
                originalYear: year.trim() || null,
                originalAuthor: null,
                originalISBN: null,
                score: null,
                reviewText: null,
                hasSpoiler: false,
                privateNote: null,
                status: 'want',
                sourceDate: row.Date?.trim() || null,
                sourceUri: row['Letterboxd URI']?.trim() || null,
            });
        }
    }

    // ── Step 7: return ───────────────────────────────────────────────────────
    return Array.from(map.values());
}
