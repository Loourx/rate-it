import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

interface ContentDetailHeaderProps {
    title: string;
    imageUrl: string | null;
    categoryColor: string;
    categoryFadedColor: string;
    typeLabel: string;
}

/**
 * Hero header: full-width image with a dark gradient overlay,
 * title rendered on top, and a category badge.
 */
export function ContentDetailHeader({
    title,
    imageUrl,
    categoryColor,
    categoryFadedColor,
    typeLabel,
}: ContentDetailHeaderProps) {
    return (
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
            ) : (
                <View style={[styles.image, styles.placeholder]}>
                    <Text style={styles.placeholderLetter}>{title.charAt(0)}</Text>
                </View>
            )}

            {/* Gradient overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(18,18,18,0.75)', COLORS.background]}
                locations={[0.2, 0.65, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Content on gradient */}
            <View style={styles.overlay}>
                {/* Category badge */}
                <View
                    style={[
                        styles.categoryBadge,
                        { borderColor: categoryColor, backgroundColor: categoryFadedColor },
                    ]}
                >
                    <Text style={[styles.categoryText, { color: categoryColor }]}>
                        {typeLabel}
                    </Text>
                </View>

                {/* Title */}
                <Text style={styles.title} numberOfLines={3}>
                    {title}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', height: 360, position: 'relative' },
    image: { width: '100%', height: '100%' },
    placeholder: {
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderLetter: {
        fontSize: 64,
        fontFamily: FONT.bold,
        color: COLORS.textTertiary,
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.base,
        paddingBottom: SPACING.lg,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        marginBottom: SPACING.sm,
    },
    categoryText: {
        fontSize: 12,
        fontFamily: FONT.semibold,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 32,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
        lineHeight: 38,
    },
});
