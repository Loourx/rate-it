import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/ui/Screen';
import { COLORS } from '@/lib/utils/constants';
import { useImportData } from '@/lib/hooks/useImportData';
import ImportProgress from '@/components/import/ImportProgress';
import ImportResult from '@/components/import/ImportResult';

/**
 * Import History Screen
 * Allows users to import data from Letterboxd (movies) or Goodreads (books).
 */
export default function ImportScreen() {
    const {
        importFromLetterboxd,
        importFromGoodreads,
        progress,
        result,
        error,
        reset
    } = useImportData();

    // Determine content type based on current action or result
    const [importType, setImportType] = useState<'movie' | 'book'>('movie');

    const handleLetterboxd = () => {
        setImportType('movie');
        importFromLetterboxd();
    };

    const handleGoodreads = () => {
        setImportType('book');
        importFromGoodreads();
    };

    const isIdle = progress.phase === 'idle';
    const isProcessing = ['parsing', 'resolving', 'inserting'].includes(progress.phase);
    const isComplete = progress.phase === 'complete';
    const isError = progress.phase === 'error';

    return (
        <Screen scroll horizontalPadding edges={['top', 'bottom']} className="pb-8">
            {isIdle && (
                <>
                    <View className="py-6">
                        <Text className="text-displaySmall font-bold text-primary">
                            Importar historial
                        </Text>
                        <Text className="text-bodyLarge text-secondary mt-1">
                            Trae tus valoraciones de otras plataformas
                        </Text>
                    </View>

                    <View className="gap-6">
                        {/* Letterboxd Option */}
                        <TouchableOpacity
                            onPress={handleLetterboxd}
                            activeOpacity={0.7}
                            style={{ backgroundColor: COLORS.surfaceElevated }}
                            className="p-6 rounded-3xl border border-divider"
                        >
                            <View className="flex-row items-center gap-4 mb-4">
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: COLORS.categoryMovieFaded }}
                                >
                                    <Ionicons name="film-outline" size={24} color={COLORS.categoryMovie} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-headlineSmall font-bold text-primary">
                                        Letterboxd
                                    </Text>
                                    <Text className="text-bodyMedium text-secondary">
                                        Importar películas
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-bodyMedium text-primary mb-2">
                                Sube tu archivo ZIP de Letterboxd para importar tus películas y reseñas.
                            </Text>

                            <View className="bg-background/50 p-4 rounded-xl">
                                <Text className="text-labelSmall font-bold text-secondary uppercase tracking-wider mb-1">
                                    Instrucciones
                                </Text>
                                <Text className="text-bodySmall text-secondary leading-5">
                                    Ve a letterboxd.com → Settings → Import & Export → Export Your Data
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Goodreads Option */}
                        <TouchableOpacity
                            onPress={handleGoodreads}
                            activeOpacity={0.7}
                            style={{ backgroundColor: COLORS.surfaceElevated }}
                            className="p-6 rounded-3xl border border-divider"
                        >
                            <View className="flex-row items-center gap-4 mb-4">
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: COLORS.categoryBookFaded }}
                                >
                                    <Ionicons name="book-outline" size={24} color={COLORS.categoryBook} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-headlineSmall font-bold text-primary">
                                        Goodreads
                                    </Text>
                                    <Text className="text-bodyMedium text-secondary">
                                        Importar libros
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-bodyMedium text-primary mb-2">
                                Sube tu archivo CSV de Goodreads para importar tus libros leídos y rated.
                            </Text>

                            <View className="bg-background/50 p-4 rounded-xl">
                                <Text className="text-labelSmall font-bold text-secondary uppercase tracking-wider mb-1">
                                    Instrucciones
                                </Text>
                                <Text className="text-bodySmall text-secondary leading-5">
                                    Ve a goodreads.com → My Books → Import/Export → Export Library (arriba a la derecha)
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {isProcessing && (
                <ImportProgress progress={progress} type={importType} />
            )}

            {isComplete && result && (
                <ImportResult result={result} onReset={reset} />
            )}

            {isError && (
                <View className="py-20 items-center">
                    <View
                        className="w-20 h-20 rounded-full items-center justify-center mb-6"
                        style={{ backgroundColor: COLORS.error + '20' }}
                    >
                        <Ionicons name="alert-circle" size={48} color={COLORS.error} />
                    </View>
                    <Text className="text-headlineSmall font-bold text-primary text-center">
                        Algo ha salido mal
                    </Text>
                    <Text className="text-bodyMedium text-secondary text-center mt-2 mb-10 px-6">
                        {error || 'Ocurrió un error inesperado durante la importación.'}
                    </Text>

                    <TouchableOpacity
                        onPress={reset}
                        className="bg-primary px-8 h-14 rounded-2xl items-center justify-center"
                    >
                        <Text className="text-background font-bold text-bodyLarge">
                            Intentar de nuevo
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </Screen>
    );
}
