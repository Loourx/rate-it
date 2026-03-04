import { getCategoryColor } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { StoryContentType } from './storyTypes';

export const STORY_TOKENS = {
    CANVAS: {
        width: 390,
        height: 844,
        safeZoneTop: 110,
        safeZoneBottom: 734,
        brandingY: { from: 60, to: 100 },
    },
    CARD: {
        width: 330,
        marginHorizontal: 30,
        top: 125,
        height: 695,
        borderRadius: 22,
        shadow: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 32 },
            shadowRadius: 80,
            shadowOpacity: 0.75,
            elevation: 24, // Android equivalent
        },
        border: 'rgba(255,255,255,0.07)',
    },
    IMAGE_HEIGHT: {
        movie: 340,
        series: 340,
        book: 340,
        game: 340,
        music: 330,
    } as Record<StoryContentType, number>,
    SURFACE: {
        canvas: '#121212',
        card: '#1A1A1A',
        dividerVertical: 'rgba(255,255,255,0.09)',
        dividerFooter: 'rgba(255,255,255,0.06)',
    },
    TEXT_COLOR: {
        primary: '#FFFFFF',
        secondary: 'rgba(255,255,255,0.62)',
        tertiary: 'rgba(255,255,255,0.35)',
        quaternary: 'rgba(255,255,255,0.32)',
        branding: 'rgba(255,255,255,0.22)',
    },
    TYPOGRAPHY: {
        score: {
            fontSize: 120,
            fontFamily: FONT.bold,
            letterSpacing: -4,
        },
        title: {
            fontSize: 28,
            fontFamily: FONT.bold,
            lineHeight: 34,
        },
        quote: {
            fontSize: 18,
            fontFamily: FONT.regular,
            lineHeight: 26,
        },
        metadata: {
            fontSize: 16,
            fontFamily: FONT.regular,
            lineHeight: 22,
        },
        favoriteTrack: {
            fontSize: 14,
            fontFamily: FONT.regular,
            lineHeight: 20,
        },
        username: {
            fontSize: 14,
            fontFamily: FONT.medium,
            lineHeight: 18,
        },
        wordmark: {
            fontSize: 20,
            fontFamily: FONT.bold,
            lineHeight: 24,
        },
        pill: {
            fontSize: 11,
            fontFamily: FONT.semibold,
            letterSpacing: 1,
        },
        canvasBranding: {
            fontSize: 12,
            fontFamily: FONT.medium,
            letterSpacing: 2,
        },
    },
    PILL_CONFIG: {
        movie: { emoji: '🎬', label: 'PELÍCULA' },
        series: { emoji: '📺', label: 'SERIE' },
        book: { emoji: '📖', label: 'LIBRO' },
        game: { emoji: '🎮', label: 'VIDEOJUEGO' },
        music: { emoji: '🎵', label: 'MÚSICA' },
    } as Record<StoryContentType, { emoji: string; label: string }>,
    GLOW: {
        centerX: 195,
        centerY: 422,
        rx: 156,
        ry: 253,
        opacityStart: 0.20,
        opacityEnd: 0,
    },
    SCORE_COLUMN_WIDTH: 110,
};

export { getCategoryColor };
