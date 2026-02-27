import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { COLORS, getCategoryColor, formatScore, FONT_SIZE } from '@/lib/utils/constants';
import type { DiaryDay } from '@/lib/api/diary';
import type { ContentType } from '@/lib/types/content';

const CATEGORY_LABEL: Record<ContentType, string> = {
    movie: 'Cine',
    series: 'Series',
    book: 'Libros',
    game: 'Juegos',
    music: 'Música',
    podcast: 'Podcasts',
    anything: 'Anything',
};

interface Props {
    dateKey: string;   // 'YYYY-MM-DD'
    ratings: DiaryDay[];
}

function MiniCard({ item }: { item: DiaryDay }) {
    const router = useRouter();
    const color = getCategoryColor(item.contentType);
    const label = CATEGORY_LABEL[item.contentType] ?? item.contentType;

    const handlePress = () => {
        router.push(`/content/${item.contentType}?id=${item.contentId}`);
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.75} style={styles.card}>
            {item.contentImageUrl ? (
                <Image
                    source={{ uri: item.contentImageUrl }}
                    style={styles.poster}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.poster, styles.posterPlaceholder]}>
                    <Text style={styles.posterLetter}>{item.contentTitle.charAt(0)}</Text>
                </View>
            )}
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.contentTitle}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: `${color}33` }]}>
                    <Text style={[styles.typeLabel, { color }]}>{label}</Text>
                </View>
            </View>
            <View style={[styles.scoreBox, { borderColor: color }]}>
                <Text style={[styles.scoreText, { color }]}>{formatScore(item.score)}</Text>
            </View>
        </TouchableOpacity>
    );
}

/** Animated container that expands when `visible` becomes true. */
export function DayDetail({ dateKey, ratings }: Props) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
        return () => {
            progress.value = 0;
        };
    }, [dateKey]);

    const animStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ translateY: (1 - progress.value) * -8 }],
    }));

    // Format label: "Lunes 3 febrero"
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateLabel = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <Animated.View style={[styles.container, animStyle]}>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {ratings.map((r) => (
                    <MiniCard key={r.id} item={r} />
                ))}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginHorizontal: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
    },
    dateLabel: {
        fontSize: FONT_SIZE.labelLarge,
        color: COLORS.textSecondary,
        marginBottom: 10,
        textTransform: 'capitalize',
    },
    scroll: {
        gap: 10,
        paddingRight: 4,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: 10,
        padding: 8,
        width: 220,
        gap: 10,
    },
    poster: {
        width: 40,
        height: 60,
        borderRadius: 6,
    },
    posterPlaceholder: {
        backgroundColor: COLORS.surfacePressed,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterLetter: {
        color: COLORS.textSecondary,
        fontSize: 18,
        fontWeight: '700',
    },
    cardInfo: {
        flex: 1,
        gap: 6,
    },
    cardTitle: {
        fontSize: FONT_SIZE.bodySmall,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    typeBadge: {
        alignSelf: 'flex-start',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    typeLabel: {
        fontSize: FONT_SIZE.labelSmall,
        fontWeight: '600',
    },
    scoreBox: {
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 36,
        alignItems: 'center',
    },
    scoreText: {
        fontSize: FONT_SIZE.bodySmall,
        fontWeight: '700',
    },
});
