import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';
import type { DiaryDay } from '@/lib/api/diary';

interface Props {
    day: number | null;       // null = padding cell (prev/next month)
    dateKey: string | null;   // 'YYYY-MM-DD'
    ratings: DiaryDay[];
    isSelected: boolean;
    isToday: boolean;
    onPress: (dateKey: string) => void;
}

/** Return the color of the most-frequent content type in a day's ratings. */
export function getDominantColor(ratings: DiaryDay[]): string {
    if (ratings.length === 0) return COLORS.textTertiary;
    const counts: Partial<Record<ContentType, number>> = {};
    for (const r of ratings) {
        counts[r.contentType] = (counts[r.contentType] ?? 0) + 1;
    }
    const dominant = (Object.entries(counts) as [ContentType, number][]).reduce(
        (best, cur) => (cur[1] > best[1] ? cur : best),
    )[0];
    return getCategoryColor(dominant);
}

export function CalendarDay({ day, dateKey, ratings, isSelected, isToday, onPress }: Props) {
    const hasRatings = ratings.length > 0;
    const dotColor = hasRatings ? getDominantColor(ratings) : 'transparent';

    const handlePress = () => {
        if (dateKey && hasRatings) onPress(dateKey);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={hasRatings ? 0.7 : 1}
            style={[
                styles.cell,
                isSelected && { backgroundColor: COLORS.surfaceElevated },
                isToday && styles.todayCell,
            ]}
            disabled={!hasRatings}
        >
            {day !== null ? (
                <>
                    <Text
                        style={[
                            styles.dayText,
                            isToday && { color: COLORS.link, fontFamily: FONT.bold },
                            !hasRatings && { color: COLORS.textTertiary },
                        ]}
                    >
                        {day}
                    </Text>
                    {hasRatings && (
                        <View style={[styles.dot, { backgroundColor: dotColor }]} />
                    )}
                </>
            ) : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        margin: 2,
    },
    todayCell: {
        borderWidth: 1,
        borderColor: COLORS.link,
    },
    dayText: {
        ...TYPO.caption,
        color: COLORS.textPrimary,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 2,
    },
});
