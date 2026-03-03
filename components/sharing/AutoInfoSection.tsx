import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ContentType } from '@/lib/types/content';
import { COLORS, RADIUS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

interface AutoInfoSectionProps {
    trackAverage: number | null;
    episodeAverage: number | null;
    score: number;
    contentType: ContentType;
    accentColor: string;
}

export function AutoInfoSection({
    trackAverage,
    episodeAverage,
    score,
    accentColor,
}: AutoInfoSectionProps): React.ReactElement {
    const [expanded, setExpanded] = useState(false);
    const rotation = useSharedValue(0);

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const toggle = (): void => {
        const next = !expanded;
        setExpanded(next);
        rotation.value = withTiming(next ? 180 : 0, { duration: 250 });
    };

    const fillPct = `${Math.round((score / 10) * 100)}%` as const;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={toggle}
                activeOpacity={0.75}
            >
                <Text style={styles.headerText}>INCLUIDO AUTOMÁTICAMENTE</Text>
                <Animated.View style={chevronStyle}>
                    <Ionicons name="chevron-down" size={14} color={COLORS.textTertiary} />
                </Animated.View>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.body}>
                    {/* Score row */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            Puntuación: {score}/10
                        </Text>
                        <View style={styles.barTrack}>
                            <View
                                style={[
                                    styles.barFill,
                                    { width: fillPct, backgroundColor: accentColor },
                                ]}
                            />
                        </View>
                    </View>

                    {/* Track average */}
                    {trackAverage !== null && (
                        <Text style={styles.infoItem}>
                            Media canciones: {trackAverage.toFixed(1)}
                        </Text>
                    )}

                    {/* Episode average */}
                    {episodeAverage !== null && (
                        <Text style={styles.infoItem}>
                            Media episodios: {episodeAverage.toFixed(1)}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    headerText: {
        fontSize: 12,
        fontFamily: FONT.semibold,
        color: COLORS.textTertiary,
        letterSpacing: 0.5,
    },
    body: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
    infoRow: {
        gap: 6,
        paddingTop: 10,
    },
    infoLabel: {
        fontSize: 12,
        fontFamily: FONT.medium,
        color: COLORS.textSecondary,
    },
    barTrack: {
        height: 4,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.surfaceElevated,
        overflow: 'hidden',
    },
    barFill: {
        height: 4,
        borderRadius: RADIUS.full,
    },
    infoItem: {
        fontSize: 12,
        fontFamily: FONT.regular,
        color: COLORS.textSecondary,
    },
});
