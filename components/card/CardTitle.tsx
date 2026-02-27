import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

interface CardTitleProps {
    title: string;
    subtitle?: string;
    titleLines?: number;
    subtitleLines?: number;
    size?: 'default' | 'small';
}

export function CardTitle({
    title,
    subtitle,
    titleLines = 2,
    subtitleLines = 1,
    size = 'default',
}: CardTitleProps) {
    return (
        <View>
            <Text
                style={size === 'small' ? S.titleSmall : S.title}
                numberOfLines={titleLines}
            >
                {title}
            </Text>
            {subtitle ? (
                <Text style={S.subtitle} numberOfLines={subtitleLines}>
                    {subtitle}
                </Text>
            ) : null}
        </View>
    );
}

const S = StyleSheet.create({
    title: {
        ...TYPO.bodySmall,
        fontFamily: FONT.semibold,
        color: COLORS.textPrimary,
    },
    titleSmall: {
        ...TYPO.caption,
        fontFamily: FONT.semibold,
        color: COLORS.textPrimary,
    },
    subtitle: {
        ...TYPO.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});
