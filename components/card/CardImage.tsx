import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, RADIUS } from '@/lib/utils/constants';

type AspectRatio = 'poster' | 'wide' | 'square';

const RATIO_MAP: Record<AspectRatio, number> = {
    poster: 2 / 3,
    wide: 16 / 9,
    square: 1,
};

interface CardImageProps {
    uri: string | null | undefined;
    fallback?: string;
    aspectRatio?: AspectRatio;
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
}

export function CardImage({
    uri,
    fallback,
    aspectRatio = 'poster',
    width,
    height,
    style,
}: CardImageProps) {
    const computedHeight = width && !height
        ? Math.round(width / RATIO_MAP[aspectRatio])
        : height;

    return (
        <View
            style={[
                S.wrapper,
                width ? { width } : undefined,
                computedHeight ? { height: computedHeight } : undefined,
                style,
            ]}
        >
            {uri ? (
                <Image
                    source={{ uri }}
                    style={S.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
            ) : (
                <View style={S.placeholder}>
                    <View style={S.placeholderInner}>
                        {fallback ? (
                            <Image
                                source={{ uri: fallback }}
                                style={S.image}
                                contentFit="cover"
                            />
                        ) : null}
                    </View>
                </View>
            )}
        </View>
    );
}

const S = StyleSheet.create({
    wrapper: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        backgroundColor: COLORS.surfaceElevated,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surfaceElevated,
    },
    placeholderInner: {
        width: '100%',
        height: '100%',
    },
});
