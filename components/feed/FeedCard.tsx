import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { FeedItem } from '@/lib/types/social';
import type { TrackRatingEntry } from '@/lib/types/database';
import { COLORS, formatScore, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { formatRelativeDate } from '@/lib/utils/formatRelativeDate';
import { useRatingLike } from '@/lib/hooks/useRatingLike';
import { useRatingLikesCount } from '@/lib/hooks/useRatingLikesCount';
import { Card } from '@/components/card';

interface FeedCardProps {
    item: FeedItem;
    index: number;
}

export default function FeedCard({ item, index }: FeedCardProps) {
    const categoryColor = getCategoryColor(item.contentType);
    const animationDelay = index < 8 ? index * 50 : 0;
    const { isLiked, toggle, isMutating } = useRatingLike(item.id);
    const { data: likesCount } = useRatingLikesCount(item.id);

    const trackAverage = useMemo(() => {
        if (!item.trackRatings) return null;
        try {
            const ratings: TrackRatingEntry[] = typeof item.trackRatings === 'string'
                ? JSON.parse(item.trackRatings)
                : item.trackRatings;
            if (!Array.isArray(ratings)) return null;
            const rated = ratings.filter((tr) => tr.score > 0);
            if (rated.length === 0) return null;
            return Math.round((rated.reduce((a, tr) => a + tr.score, 0) / rated.length) * 10) / 10;
        } catch {
            return null;
        }
    }, [item.trackRatings]);

    const navigateToContent = useCallback(
        () => router.push(`/content/${item.contentType}/${item.contentId}`),
        [item.contentType, item.contentId],
    );

    return (
        <Animated.View entering={FadeInDown.delay(animationDelay).duration(300)} style={S.wrapper}>
            <Card.Container onPress={navigateToContent} style={S.card}>
                {/* Header: Avatar + Username */}
                <FeedHeader item={item} />

                {/* Content row: poster + score */}
                <View style={S.contentRow}>
                    {item.contentImageUrl && (
                        <Card.Image
                            uri={item.contentImageUrl}
                            width={64}
                            height={96}
                            style={S.poster}
                        />
                    )}
                    <View style={S.body}>
                        <Card.Title title={item.contentTitle} />
                        <Card.Rating score={item.score} category={item.contentType} size="compact" />
                        {trackAverage !== null && (
                            <Text style={[S.trackAvg, { color: categoryColor }]}>
                                Media canciones: {trackAverage.toFixed(1)}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Review */}
                {item.reviewText && <ReviewSection text={item.reviewText} hasSpoiler={item.hasSpoiler} />}

                {/* Footer */}
                <Card.Actions
                    isLiked={isLiked}
                    likesCount={likesCount ?? item.likesCount}
                    onLike={toggle}
                    likeMutating={isMutating}
                />
            </Card.Container>
        </Animated.View>
    );
}

function FeedHeader({ item }: { item: FeedItem }) {
    const navigateToProfile = useCallback(
        () => router.push(`/profile/${item.userId}`),
        [item.userId],
    );

    return (
        <View style={S.header}>
            <Pressable onPress={navigateToProfile}>
                <Image
                    source={{ uri: item.userAvatarUrl || 'https://i.pravatar.cc/150' }}
                    style={S.avatar}
                />
            </Pressable>
            <View style={S.headerText}>
                <Text style={S.username}>
                    {item.username}
                    <Text style={S.action}> valoró</Text>
                </Text>
                <Text style={S.time}>{formatRelativeDate(item.createdAt)}</Text>
            </View>
        </View>
    );
}

function ReviewSection({ text, hasSpoiler }: { text: string; hasSpoiler?: boolean }) {
    return (
        <View style={S.review}>
            {hasSpoiler && (
                <View style={S.spoilerBadge}>
                    <Text style={S.spoilerText}>🚨 SPOILER</Text>
                </View>
            )}
            <Text style={S.reviewText} numberOfLines={3}>{text}</Text>
        </View>
    );
}

const S = StyleSheet.create({
    wrapper: { marginHorizontal: 16, marginBottom: 12 },
    card: { padding: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    headerText: { flex: 1, marginLeft: 12 },
    username: { ...TYPO.bodySmall, fontFamily: FONT.semibold, color: COLORS.textPrimary },
    action: { ...TYPO.bodySmall, fontFamily: FONT.regular, color: COLORS.textSecondary },
    time: { ...TYPO.caption, color: COLORS.textTertiary },
    contentRow: { flexDirection: 'row', marginBottom: 12 },
    poster: { marginRight: 12 },
    body: { flex: 1, justifyContent: 'center', gap: 4 },
    trackAvg: { ...TYPO.caption, fontFamily: FONT.medium, marginTop: 2 },
    review: { marginBottom: 8 },
    spoilerBadge: {
        backgroundColor: 'rgba(255,69,58,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 4,
        alignSelf: 'flex-start',
    },
    spoilerText: { ...TYPO.caption, color: COLORS.error, fontFamily: FONT.semibold },
    reviewText: { ...TYPO.bodySmall, color: COLORS.textSecondary },
});
