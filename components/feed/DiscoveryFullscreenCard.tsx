import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS, RADIUS, SPACING, getCategoryColor } from '@/lib/utils/constants';
import { FONT, TYPO } from '@/lib/utils/typography';
import { CardAmbientGlow } from '@/components/sharing/partials/CardAmbientGlow';
import { useIsBookmarked, useToggleBookmark } from '@/lib/hooks/useBookmark';
import type { DiscoveryItem } from '@/lib/hooks/useDiscoveryFeed';

interface DiscoveryFullscreenCardProps {
    item: DiscoveryItem;
    width: number;
    height: number;
}

function getSourceLabel(item: DiscoveryItem): string {
    if (item.source === 'suggested') {
        return item.friendCount > 0 ? `${item.friendCount} amigos lo recomiendan` : 'Sugerido para ti';
    }
    if (item.source === 'friends') {
        return item.friendCount > 0 ? `Tendencia entre ${item.friendCount} amigos` : 'Trending entre amigos';
    }
    return 'Trending global';
}

export function DiscoveryFullscreenCard({ item, width, height }: DiscoveryFullscreenCardProps): React.ReactElement {
    const accentColor = getCategoryColor(item.contentType);
    const { data: isBookmarked = false } = useIsBookmarked(item.contentType, item.contentId);
    const toggleBookmark = useToggleBookmark();

    const handleToggleBookmark = useCallback(() => {
        toggleBookmark.mutate({
            contentType: item.contentType,
            contentId: item.contentId,
            contentTitle: item.contentTitle,
            contentImageUrl: item.contentImageUrl,
        });
    }, [item, toggleBookmark]);

    const openRate = useCallback(() => {
        router.push(`/rate/${item.contentType}/${item.contentId}`);
    }, [item.contentId, item.contentType]);

    const openDetail = useCallback(() => {
        router.push(`/content/${item.contentType}/${item.contentId}`);
    }, [item.contentId, item.contentType]);

    return (
        <View style={[styles.page, { height }]}> 
            <TouchableOpacity
                activeOpacity={0.92}
                style={[styles.card, { width, height: Math.max(560, height - SPACING.xl) }]}
                onPress={openDetail}
            >
                <CardAmbientGlow accentColor={accentColor} cardWidth={width} height={Math.max(560, height - SPACING.xl)} />

                {item.contentImageUrl ? (
                    <Image
                        source={item.contentImageUrl}
                        style={styles.poster}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <View style={[styles.poster, styles.posterFallback]}>
                        <Text style={styles.posterFallbackText}>{item.contentTitle.charAt(0)}</Text>
                    </View>
                )}

                <LinearGradient
                    pointerEvents="none"
                    colors={['transparent', 'rgba(10,10,10,0.24)', 'rgba(10,10,10,0.78)', '#0A0A0A']}
                    locations={[0, 0.35, 0.7, 1]}
                    style={styles.posterOverlay}
                />

                <View style={styles.contentLayer}>
                    <View style={styles.topMetaRow}>
                        <Text style={styles.discoveryLabel}>Discover Today</Text>
                        <View style={[styles.sourcePill, { borderColor: `${accentColor}66`, backgroundColor: `${accentColor}22` }]}>
                            <Text style={[styles.sourcePillText, { color: accentColor }]}>{getSourceLabel(item)}</Text>
                        </View>
                    </View>

                    <View style={styles.bottomPanel}>
                        <Text style={styles.title} numberOfLines={2}>{item.contentTitle}</Text>

                        <View style={styles.scoreRow}>
                            <Text style={styles.scoreLabel}>Community Rating</Text>
                            <Text style={[styles.scoreValue, { color: accentColor }]}>{item.averageScore.toFixed(1)}</Text>
                        </View>

                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${Math.min(100, item.averageScore * 10)}%`, backgroundColor: accentColor }]} />
                        </View>

                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleToggleBookmark}
                                style={[styles.primaryAction, { backgroundColor: isBookmarked ? `${accentColor}22` : accentColor }]}
                                disabled={toggleBookmark.isPending}
                            >
                                <Ionicons
                                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                                    size={18}
                                    color={isBookmarked ? accentColor : '#0A0A0A'}
                                />
                                <Text style={[styles.primaryActionText, { color: isBookmarked ? accentColor : '#0A0A0A' }]}>
                                    {isBookmarked ? 'Guardado' : 'Guardar'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={openRate}
                                style={styles.secondaryAction}
                            >
                                <Ionicons name="star-outline" size={18} color={COLORS.textPrimary} />
                                <Text style={styles.secondaryActionText}>Rate</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={openDetail}
                                style={styles.iconAction}
                            >
                                <Ionicons name="open-outline" size={18} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingBottom: SPACING.sm,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#0A0A0A',
    },
    poster: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
    },
    posterFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceElevated,
    },
    posterFallbackText: {
        fontSize: 72,
        color: COLORS.textTertiary,
        fontFamily: FONT.bold,
    },
    posterOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    contentLayer: {
        flex: 1,
        padding: SPACING.base,
        justifyContent: 'space-between',
    },
    topMetaRow: {
        gap: SPACING.sm,
    },
    discoveryLabel: {
        ...TYPO.h3,
        color: COLORS.textPrimary,
        fontFamily: FONT.bold,
    },
    sourcePill: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
    },
    sourcePillText: {
        ...TYPO.caption,
        fontFamily: FONT.semibold,
        letterSpacing: 0.4,
    },
    bottomPanel: {
        backgroundColor: 'rgba(12,12,12,0.72)',
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.base,
        gap: SPACING.sm,
    },
    title: {
        ...TYPO.h2,
        color: COLORS.textPrimary,
        fontFamily: FONT.bold,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scoreLabel: {
        ...TYPO.caption,
        color: COLORS.textSecondary,
        fontFamily: FONT.medium,
    },
    scoreValue: {
        fontFamily: FONT.bold,
        fontSize: 28,
        lineHeight: 30,
    },
    progressTrack: {
        height: 6,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: RADIUS.full,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    primaryAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: RADIUS.full,
        paddingVertical: 12,
    },
    primaryActionText: {
        ...TYPO.bodySmall,
        fontFamily: FONT.bold,
    },
    secondaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.32)',
    },
    secondaryActionText: {
        ...TYPO.bodySmall,
        color: COLORS.textPrimary,
        fontFamily: FONT.semibold,
    },
    iconAction: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.32)',
    },
});
