
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

    // Categories (Primary)
    categoryMovie: '#FF6B6B',   // Coral Red
    categorySeries: '#4ECDC4',  // Teal
    categoryBook: '#FFE66D',    // Sunny Yellow
    categoryGame: '#95E1D3',    // Mint
    categoryMusic: '#F3A683',   // Peach
    categoryPodcast: '#A8D8EA', // Light Blue
    categoryAnything: '#B3B3B3',// Grey

    // Categories (Faded - 20% opacity)
    categoryMovieFaded: 'rgba(255, 107, 107, 0.2)',
    categorySeriesFaded: 'rgba(78, 205, 196, 0.2)',
    categoryBookFaded: 'rgba(255, 230, 109, 0.2)',
    categoryGameFaded: 'rgba(149, 225, 211, 0.2)',
    categoryMusicFaded: 'rgba(243, 166, 131, 0.2)',
    categoryPodcastFaded: 'rgba(168, 216, 234, 0.2)',
    categoryAnythingFaded: 'rgba(179, 179, 179, 0.2)',

    // Status
    success: '#95E1D3',
    warning: '#FFE66D',
    error: '#FF6B6B',
    link: '#4ECDC4',
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
