import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

type BookFormat = 'paper' | 'digital' | 'audiobook';

interface FormatOption {
    value: BookFormat;
    label: string;
    emoji: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
    { value: 'paper', label: 'Papel', emoji: '📖' },
    { value: 'digital', label: 'Digital', emoji: '📱' },
    { value: 'audiobook', label: 'Audiolibro', emoji: '🎧' },
];

// Fixed accent for books — #8AC926 (COLORS.categoryMusic maps to this value)
const ACCENT = COLORS.categoryMusic;

interface BookFormatSelectorProps {
    selected: BookFormat | null;
    onSelect: (format: BookFormat | null) => void;
}

export function BookFormatSelector({
    selected,
    onSelect,
}: BookFormatSelectorProps): React.ReactElement {
    return (
        <View style={styles.row}>
            {FORMAT_OPTIONS.map((opt) => {
                const isSelected = selected === opt.value;
                return (
                    <TouchableOpacity
                        key={opt.value}
                        onPress={() => onSelect(isSelected ? null : opt.value)}
                        style={[
                            styles.pill,
                            isSelected
                                ? {
                                    backgroundColor: ACCENT + '22',
                                    borderColor: ACCENT,
                                }
                                : {
                                    backgroundColor: COLORS.surface,
                                    borderColor: COLORS.divider,
                                },
                        ]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.emoji}>{opt.emoji}</Text>
                        <Text
                            style={[
                                styles.label,
                                {
                                    color: isSelected ? ACCENT : COLORS.textSecondary,
                                    fontFamily: isSelected ? FONT.semibold : FONT.regular,
                                },
                            ]}
                        >
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.full,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 5,
    },
    emoji: {
        fontSize: 13,
    },
    label: {
        fontSize: 13,
        lineHeight: 18,
    },
});
