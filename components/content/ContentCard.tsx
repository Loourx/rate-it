import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/card';
import { RatingSlider } from '@/components/rating/RatingSlider';
import { getCategoryColor } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';
import { getSubtitle, getGenres, getSecondaryInfo } from '@/lib/utils/contentHelpers';
import type { BaseContent } from '@/lib/types/content';

interface ContentCardProps {
    content: BaseContent;
    onPress: (content: BaseContent) => void;
    rating?: number;
    orientation?: 'horizontal' | 'vertical';
}

export function ContentCard({
    content,
    onPress,
    rating,
    orientation = 'horizontal',
}: ContentCardProps) {
    const categoryColor = getCategoryColor(content.type);
    const genres = getGenres(content).slice(0, 2);
    const isH = orientation === 'horizontal';

    return (
        <Card.Container
            onPress={() => onPress(content)}
            style={isH ? S.containerH : S.containerV}
        >
            <Card.Image
                uri={content.imageUrl}
                width={isH ? 64 : undefined}
                height={isH ? 96 : 140}
                style={isH ? S.imageH : S.imageV}
            />

            <View style={isH ? S.bodyH : S.bodyV}>
                <Card.Title
                    title={content.title}
                    subtitle={isH ? getSubtitle(content) : undefined}
                />

                {isH && (
                    <SecondaryLine content={content} />
                )}

                {isH && genres.length > 0 && (
                    <Card.Meta category={content.type} badges={genres} />
                )}

                {rating !== undefined ? (
                    <View style={S.ratingWrap}>
                        <RatingSlider
                            value={rating}
                            onValueChange={() => undefined}
                            category={content.type}
                            size="display"
                            layout={isH ? 'horizontal' : 'vertical'}
                        />
                    </View>
                ) : (
                    <View style={S.dotRow}>
                        <View style={[S.dot, { backgroundColor: categoryColor }]} />
                        <Text style={S.dotLabel}>{content.type}</Text>
                    </View>
                )}
            </View>
        </Card.Container>
    );
}

/** Extra info line (album name, platform, etc.) — only in horizontal mode. */
function SecondaryLine({ content }: { content: BaseContent }) {
    const info = getSecondaryInfo(content);
    if (!info) return null;
    return <Text style={S.secondary} numberOfLines={1}>{info}</Text>;
}

const S = StyleSheet.create({
    containerH: { flexDirection: 'row', padding: 12, marginBottom: 12 },
    containerV: { width: 160, padding: 12, marginRight: 12 },
    imageH: { marginRight: 16 },
    imageV: { marginBottom: 8 },
    bodyH: { flex: 1, justifyContent: 'center' },
    bodyV: { height: 76, justifyContent: 'space-between' },
    ratingWrap: { marginTop: 4 },
    secondary: { ...TYPO.caption, color: '#666666', marginTop: 2 },
    dotRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    dotLabel: { ...TYPO.caption, color: '#666666', textTransform: 'capitalize' },
});
