import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

interface FeedSectionSeparatorProps {
    label: string;
}

export function FeedSectionSeparator({ label }: FeedSectionSeparatorProps): React.ReactElement {
    return (
        <View style={styles.container}>
            <View style={styles.line} />
            <View style={styles.labelContainer}>
                <Ionicons name="compass-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.label}>{label}</Text>
            </View>
            <View style={styles.line} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        marginTop: SPACING.xs,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.divider, // usar token existente del design system
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.sm,
    },
    label: {
        ...TYPO.caption,
        fontFamily: FONT.medium,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
});
