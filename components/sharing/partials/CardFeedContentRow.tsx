import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FONT } from '@/lib/utils/typography';

export interface CardFeedContentRowProps {
    title: string;
    posterUrl: string | null;
    creator: string | null;
    year?: string | number | null;
    platform?: string | null;
    favoriteTrack?: string | null;
    contentType: string;
    accentColor: string;
}

export function CardFeedContentRow({
    title,
    posterUrl,
    creator,
    year,
    platform,
    favoriteTrack,
    contentType,
    accentColor,
}: CardFeedContentRowProps): React.ReactElement {
    return (
        <View style={s.contentRow}>
            {/* Poster */}
            <View style={s.posterWrapper}>
                {posterUrl ? (
                    <Image
                        source={posterUrl}
                        style={s.poster}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <View style={[s.posterFallback, { backgroundColor: accentColor + '33' }]}>
                        <Text style={s.posterInit}>{title.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
            </View>

            {/* Info column */}
            <View style={s.infoCol}>
                <Text style={s.title} numberOfLines={2}>{title}</Text>
                {!!creator && (
                    <Text style={s.creator} numberOfLines={1}>{creator}</Text>
                )}
                {!!year && (
                    <Text style={s.year}>{year}</Text>
                )}
                {!!platform && (
                    <View style={[s.platformChip, { backgroundColor: accentColor + '26' }]}>
                        <Text style={[s.platformChipText, { color: accentColor }]}>{platform}</Text>
                    </View>
                )}
                {contentType === 'music' && !!favoriteTrack?.trim() && (
                    <Text style={s.favoriteTrack} numberOfLines={1}>🎵 {favoriteTrack}</Text>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    contentRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        zIndex: 1,
    },
    posterWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    poster: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    posterFallback: {
        width: 100,
        height: 100,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterInit: {
        fontSize: 32,
        fontFamily: FONT.bold,
        color: '#FFFFFF',
    },
    infoCol: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontFamily: FONT.bold,
        color: '#FFFFFF',
    },
    creator: {
        fontSize: 13,
        fontFamily: FONT.regular,
        color: '#A0A0A0',
        marginTop: 2,
    },
    year: {
        fontSize: 12,
        fontFamily: FONT.regular,
        color: '#666666',
        marginTop: 2,
    },
    platformChip: {
        alignSelf: 'flex-start',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
    },
    platformChipText: {
        fontSize: 11,
        fontFamily: FONT.semibold,
    },
    favoriteTrack: {
        fontSize: 12,
        fontFamily: FONT.regular,
        color: '#A0A0A0',
        marginTop: 4,
    },
});
