import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FONT } from '@/lib/utils/typography';

export interface CardReviewQuoteProps {
    /** Raw review text — will be truncated to 200 chars internally. */
    text: string;
}

/**
 * Centred italic review quote for the Complete card variant.
 * No container box, no accent border, no "Leer más →".
 */
export function CardReviewQuote({ text }: CardReviewQuoteProps): React.ReactElement {
    const snippet = text.length > 200 ? text.slice(0, 200) : text;
    return (
        <Text style={styles.quote} numberOfLines={5}>
            "{snippet}"
        </Text>
    );
}

const styles = StyleSheet.create({
    quote: {
        paddingHorizontal: 64,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#F0F0F0',
        fontSize: 23,
        lineHeight: 23 * 1.75,
        fontFamily: FONT.regular,
        zIndex: 1,
    },
});
