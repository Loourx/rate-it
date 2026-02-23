import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ContentType, ContentStatus } from '@/lib/types/content';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/lib/utils/constants';

interface StatusOption {
    value: ContentStatus;
    label: string;
}

const STATUS_OPTIONS: Record<ContentType, StatusOption[]> = {
    movie: [
        { value: 'want', label: 'Quiero ver' },
        { value: 'done', label: 'Vista' },
        { value: 'dropped', label: 'Abandonada' },
    ],
    series: [
        { value: 'want', label: 'Quiero ver' },
        { value: 'doing', label: 'Viendo' },
        { value: 'done', label: 'Vista' },
        { value: 'dropped', label: 'Abandonada' },
    ],
    book: [
        { value: 'want', label: 'Quiero leer' },
        { value: 'doing', label: 'Leyendo' },
        { value: 'done', label: 'Leído' },
        { value: 'dropped', label: 'Abandonado' },
    ],
    game: [
        { value: 'want', label: 'Pendiente' },
        { value: 'doing', label: 'Jugando' },
        { value: 'done', label: 'Completado' },
        { value: 'dropped', label: 'Abandonado' },
    ],
    music: [
        { value: 'done', label: 'Escuchada' },
        { value: 'want', label: 'Quiero escuchar' },
    ],
    podcast: [
        { value: 'doing', label: 'Escuchando' },
        { value: 'done', label: 'Escuchado' },
        { value: 'want', label: 'Pendiente' },
        { value: 'dropped', label: 'Abandonado' },
    ],
    anything: [
        { value: 'done', label: 'Probado' },
        { value: 'want', label: 'Quiero probar' },
        { value: 'doing', label: 'Usando' },
    ],
};

interface StatusPickerProps {
    contentType: ContentType;
    selectedStatus: ContentStatus | null;
    onStatusChange: (status: ContentStatus | null) => void;
    categoryColor: string;
}

export function StatusPicker({
    contentType,
    selectedStatus,
    onStatusChange,
    categoryColor,
}: StatusPickerProps) {
    const options = STATUS_OPTIONS[contentType];

    return (
        <View>
            <Text style={styles.label}>Estado</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {options.map((option) => {
                    const isSelected = selectedStatus === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() =>
                                onStatusChange(isSelected ? null : option.value)
                            }
                            style={[
                                styles.pill,
                                isSelected
                                    ? { backgroundColor: categoryColor }
                                    : { backgroundColor: COLORS.surfaceElevated },
                            ]}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.pillText,
                                    { color: isSelected ? COLORS.background : COLORS.textSecondary },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.bodyMedium,
        fontWeight: '500',
        marginBottom: SPACING.md,
    },
    scrollContent: {
        gap: SPACING.sm,
    },
    pill: {
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    pillText: {
        fontSize: FONT_SIZE.bodyMedium,
        fontWeight: '600',
    },
});
