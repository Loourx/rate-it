import React from 'react';
import { View, Text } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { COLORS } from '@/lib/utils/constants';
import type { ImportProgress as ImportProgressType } from '@/lib/types/import';

interface ImportProgressProps {
    progress: ImportProgressType;
    type: 'movie' | 'book';
}

/**
 * Displays the current progress of the import process.
 */
export default function ImportProgress({ progress, type }: ImportProgressProps) {
    const { phase, totalItems, processedItems, currentItem } = progress;

    const isResolving = phase === 'resolving';
    const isInserting = phase === 'inserting';
    const isParsing = phase === 'parsing';

    const progressValue = totalItems > 0 ? (processedItems / totalItems) * 100 : 0;
    const accentColor = type === 'movie' ? COLORS.categoryMovie : COLORS.categoryBook;

    const getPhaseMessage = () => {
        switch (phase) {
            case 'parsing':
                return 'Leyendo archivo...';
            case 'resolving':
                return `Buscando ${type === 'movie' ? 'películas' : 'libros'}...`;
            case 'inserting':
                return 'Guardando valoraciones...';
            default:
                return 'Procesando...';
        }
    };

    return (
        <View className="py-10 items-center">
            {/* Phase Icon/Spinner */}
            <View className="mb-8 items-center justify-center">
                {isParsing ? (
                    <Skeleton width={80} height={80} borderRadius={40} className="opacity-50" />
                ) : (
                    <View
                        className="w-20 h-20 rounded-full items-center justify-center border-4"
                        style={{ borderColor: COLORS.surfaceElevated }}
                    >
                        <View
                            className="absolute border-4 rounded-full"
                            style={{
                                width: 80,
                                height: 80,
                                borderColor: accentColor,
                                borderTopColor: 'transparent',
                                borderRightColor: 'transparent',
                                transform: [{ rotate: `${(progressValue / 100) * 360}deg` }]
                            }}
                        />
                        <Text className="text-headlineMedium font-bold text-primary">
                            {Math.round(progressValue)}%
                        </Text>
                    </View>
                )}
            </View>

            <Text className="text-headlineSmall font-bold text-primary text-center">
                {getPhaseMessage()}
            </Text>

            {(isResolving || isInserting) && (
                <Text className="text-bodyMedium text-secondary mt-2">
                    {processedItems} de {totalItems}
                </Text>
            )}

            {/* Progress Bar */}
            {(isResolving || isInserting) && (
                <View className="w-full h-2 bg-surface-elevated rounded-full mt-6 overflow-hidden">
                    <View
                        className="h-full rounded-full"
                        style={{
                            width: `${progressValue}%`,
                            backgroundColor: accentColor
                        }}
                    />
                </View>
            )}

            {/* Current Item */}
            {currentItem && (
                <View className="mt-8 bg-surface-elevated p-4 rounded-2xl w-full border border-divider">
                    <Text className="text-labelSmall font-bold text-secondary uppercase tracking-wider mb-1">
                        Procesando
                    </Text>
                    <Text className="text-bodyMedium text-primary font-medium" numberOfLines={1}>
                        {currentItem}
                    </Text>
                </View>
            )}

            <View className="mt-10 items-center">
                <Text className="text-bodySmall text-secondary text-center">
                    No cierres la app mientras se realiza la importación.
                </Text>
            </View>
        </View>
    );
}
