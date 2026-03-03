import { StyleSheet } from 'react-native';
import type { ContentType } from '@/lib/types/content';
import { COLORS, RATING } from '@/lib/utils/constants';

// ── Category color map ──────────────────────────────────
export const CATEGORY_COLORS: Record<ContentType, string> = {
    movie: COLORS.categoryMovie,
    series: COLORS.categorySeries,
    book: COLORS.categoryBook,
    game: COLORS.categoryGame,
    music: COLORS.categoryMusic,
    podcast: COLORS.categoryPodcast,
    anything: COLORS.categoryAnything,
};

// ── Size constants ──────────────────────────────────────
export const BAR_HEIGHT_DISPLAY = 8;
export const BAR_HEIGHT_INTERACTIVE = 12;
export const TOUCH_TARGET_HEIGHT = 44;
export const ENHANCED_BAR_HEIGHT = 22;

/** Color for score 0.0 (terrible) */
export const ZERO_COLOR = COLORS.error;

// ── Props ───────────────────────────────────────────────
export interface RatingSliderProps {
    value: number;
    onValueChange: (value: number) => void;
    category: ContentType;
    disabled?: boolean;
    size?: 'display' | 'interactive';
    /** For display mode: horizontal = number beside bar, vertical = number above bar */
    layout?: 'horizontal' | 'vertical';
    exactScoreDisplay?: boolean;
}

// ── Worklets ────────────────────────────────────────────
export function clampAndSnap(raw: number): number {
    'worklet';
    const clamped = Math.max(RATING.MIN, Math.min(RATING.MAX, raw));
    return Math.round(clamped * (1 / RATING.STEP)) * RATING.STEP;
}

export function ratingToProgress(rating: number): number {
    'worklet';
    return (rating - RATING.MIN) / (RATING.MAX - RATING.MIN);
}

// ── Helpers ─────────────────────────────────────────────
/** Lighten a hex color by blending towards white */
export function lightenColor(hex: string, percent: number = 0.18): string {
    if (!hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgb(${Math.min(255, Math.round(r + (255 - r) * percent))}, ${Math.min(255, Math.round(g + (255 - g) * percent))}, ${Math.min(255, Math.round(b + (255 - b) * percent))})`;
}

/** Resolve the accent color, using red for score 0 */
export function resolveColor(value: number, category: ContentType): string {
    return value === 0 ? ZERO_COLOR : CATEGORY_COLORS[category];
}

// ── Shared styles ───────────────────────────────────────
export const sharedStyles = StyleSheet.create({
    fill: { height: '100%', borderRadius: 999 },
    track: {
        width: '100%',
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: 999,
        overflow: 'hidden',
    },
    trackFlex: {
        flex: 1,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: 999,
        overflow: 'hidden',
    },
});
