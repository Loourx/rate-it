/**
 * Typography tokens — single source of truth for all text styles.
 * Import TYPO.* in StyleSheet.create or use the NativeWind equivalents.
 */
import { TextStyle } from 'react-native';

const FONT = {
    light: 'SpaceGrotesk_300Light',
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
} as const;

export type TypoToken = keyof typeof TYPO;

export const TYPO = {
    h1: {
        fontSize: 32,
        fontFamily: FONT.bold,
        lineHeight: 40,
        letterSpacing: -0.5,
    } satisfies TextStyle,

    h2: {
        fontSize: 24,
        fontFamily: FONT.bold,
        lineHeight: 32,
        letterSpacing: -0.5,
    } satisfies TextStyle,

    h3: {
        fontSize: 20,
        fontFamily: FONT.semibold,
        lineHeight: 28,
        letterSpacing: -0.3,
    } satisfies TextStyle,

    h4: {
        fontSize: 18,
        fontFamily: FONT.semibold,
        lineHeight: 24,
        letterSpacing: -0.2,
    } satisfies TextStyle,

    body: {
        fontSize: 16,
        fontFamily: FONT.regular,
        lineHeight: 24,
        letterSpacing: 0,
    } satisfies TextStyle,

    bodySmall: {
        fontSize: 14,
        fontFamily: FONT.regular,
        lineHeight: 20,
        letterSpacing: 0,
    } satisfies TextStyle,

    caption: {
        fontSize: 12,
        fontFamily: FONT.medium,
        lineHeight: 16,
        letterSpacing: 0.1,
    } satisfies TextStyle,

    label: {
        fontSize: 10,
        fontFamily: FONT.medium,
        lineHeight: 14,
        letterSpacing: 0.2,
    } satisfies TextStyle,
} as const;

export { FONT };
