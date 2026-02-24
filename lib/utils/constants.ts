
export const COLORS = {
    // Base
    background: '#121212',
    surface: '#1E1E1E',
    surfaceElevated: '#2A2A2A',
    surfacePressed: '#333333',
    divider: '#2A2A2A',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',

    // Categories (Primary) - Nueva paleta vibrant
    categoryMovie: '#FF595E',    // Vibrant Coral
    categorySeries: '#6A4C93',   // Dusty Grape
    categoryBook: '#8AC926',     // Yellow Green
    categoryGame: '#1982C4',     // Steel Blue
    categoryMusic: '#FFCA3A',    // Golden Pollen
    categoryPodcast: '#5BC0EB',  // Sky Blue
    categoryAnything: '#FFFBFF', // Soft White

    // Categories (Faded - 20% opacity)
    categoryMovieFaded: 'rgba(255, 89, 94, 0.2)',
    categorySeriesFaded: 'rgba(106, 76, 147, 0.2)',
    categoryBookFaded: 'rgba(138, 201, 38, 0.2)',
    categoryGameFaded: 'rgba(25, 130, 196, 0.2)',
    categoryMusicFaded: 'rgba(255, 202, 58, 0.2)',
    categoryPodcastFaded: 'rgba(91, 192, 235, 0.2)',
    categoryAnythingFaded: 'rgba(255, 251, 255, 0.2)',

    // Status
    success: '#34C759',
    warning: '#FFD60A',
    error: '#FF453A',
    link: '#64D2FF',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
};

export const FONT_SIZE = {
    displayLarge: 40,
    displayMedium: 32,
    displaySmall: 24,
    headlineLarge: 24,
    headlineMedium: 20,
    headlineSmall: 18,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 10,
};

// ── Rating System ────────────────────────────────────────
export const RATING = {
    MIN: 0,
    MAX: 10,
    STEP: 0.5,
    DEFAULT: 5.0,
    /** Total selectable values: (MAX - MIN) / STEP + 1 = 21 */
    VALUES_COUNT: 21,
} as const;

/** Format a rating score for display. Snaps to nearest 0.5 first (for legacy ratings). Whole numbers show no decimal; halves show .5 */
export function formatScore(score: number): string {
    const snapped = Math.round(score * 2) / 2;
    return snapped % 1 === 0 ? snapped.toFixed(0) : snapped.toFixed(1);
}

/** Snap a raw number to the nearest valid rating step */
export function snapToStep(raw: number): number {
    const clamped = Math.max(RATING.MIN, Math.min(RATING.MAX, raw));
    return Math.round(clamped * (1 / RATING.STEP)) * RATING.STEP;
}

// ── Category color helpers ───────────────────────────────
import type { ContentType } from '../types/content';

const CATEGORY_COLOR_MAP: Record<ContentType, string> = {
    movie: COLORS.categoryMovie,
    series: COLORS.categorySeries,
    book: COLORS.categoryBook,
    game: COLORS.categoryGame,
    music: COLORS.categoryMusic,
    podcast: COLORS.categoryPodcast,
    anything: COLORS.categoryAnything,
};

const CATEGORY_FADED_MAP: Record<ContentType, string> = {
    movie: COLORS.categoryMovieFaded,
    series: COLORS.categorySeriesFaded,
    book: COLORS.categoryBookFaded,
    game: COLORS.categoryGameFaded,
    music: COLORS.categoryMusicFaded,
    podcast: COLORS.categoryPodcastFaded,
    anything: COLORS.categoryAnythingFaded,
};

/** Get the primary accent color for a content type */
export function getCategoryColor(type: ContentType): string {
    return CATEGORY_COLOR_MAP[type] ?? COLORS.textPrimary;
}

/** Get the 20%-opacity faded color for a content type */
export function getCategoryFadedColor(type: ContentType): string {
    return CATEGORY_FADED_MAP[type] ?? COLORS.surfaceElevated;
}
