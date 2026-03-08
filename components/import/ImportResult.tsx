import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';
import type { ImportResult as ImportResultType } from '@/lib/types/import';

interface ImportResultProps {
    result: ImportResultType;
    onReset: () => void;
}

/**
 * Displays the final summary of an import process.
 */
export default function ImportResult({ result, onReset }: ImportResultProps) {
    const router = useRouter();
    const [showUnresolved, setShowUnresolved] = useState(false);

    const {
        ratingsImported,
        statusImported,
        skippedExisting,
        unresolved,
        source
    } = result;

    const accentColor = source === 'letterboxd' ? COLORS.categoryMovie : COLORS.categoryBook;

    return (
        <View className="py-6">
            <View className="items-center mb-8">
                <View
                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: COLORS.success + '20' }}
                >
                    <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                </View>
                <Text className="text-displaySmall font-bold text-primary text-center">
                    ¡Importación finalizada!
                </Text>
            </View>

            {/* Stats Summary */}
            <View className="flex-row flex-wrap gap-4 mb-8">
                <StatCard
                    label="Ratings"
                    value={ratingsImported}
                    icon="star"
                    color={accentColor}
                />
                <StatCard
                    label="Vistos"
                    value={statusImported}
                    icon="eye"
                    color={COLORS.textSecondary}
                />
                <StatCard
                    label="Existentes"
                    value={skippedExisting}
                    icon="copy-outline"
                    color={COLORS.textTertiary}
                />
                <StatCard
                    label="No encontrados"
                    value={unresolved.length}
                    icon="help-circle-outline"
                    color={COLORS.error}
                />
            </View>

            {/* Unresolved List */}
            {unresolved.length > 0 && (
                <View className="mb-8">
                    <TouchableOpacity
                        onPress={() => setShowUnresolved(!showUnresolved)}
                        className="flex-row items-center justify-between p-4 bg-surface-elevated rounded-2xl border border-divider"
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="warning-outline" size={20} color={COLORS.error} />
                            <Text className="text-primary font-bold">
                                No encontrados ({unresolved.length})
                            </Text>
                        </View>
                        <Ionicons
                            name={showUnresolved ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={COLORS.textSecondary}
                        />
                    </TouchableOpacity>

                    {showUnresolved && (
                        <View className="mt-2 bg-surface-elevated/50 rounded-2xl p-4 border border-divider">
                            <Text className="text-bodySmall text-secondary mb-3">
                                No pudimos encontrar estos elementos en nuestra base de datos:
                            </Text>
                            {unresolved.map((item, index) => (
                                <View key={index} className="py-2 border-b border-divider last:border-0">
                                    <Text className="text-bodyMedium text-primary font-medium">
                                        {item.originalTitle}
                                    </Text>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-bodySmall text-secondary">
                                            {item.originalYear || 'Año desconocido'}
                                        </Text>
                                        {item.originalAuthor && (
                                            <Text className="text-bodySmall text-secondary">
                                                • {item.originalAuthor}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Actions */}
            <View className="gap-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-full bg-primary h-14 rounded-2xl items-center justify-center"
                >
                    <Text className="text-background font-bold text-bodyLarge">
                        Volver al perfil
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onReset}
                    className="w-full h-14 rounded-2xl items-center justify-center border border-divider bg-surface-elevated"
                >
                    <Text className="text-primary font-bold text-bodyLarge">
                        Importar otra plataforma
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <View
            style={{ backgroundColor: COLORS.surfaceElevated }}
            className="flex-1 min-w-[45%] p-4 rounded-2xl border border-divider items-center"
        >
            <Ionicons name={icon} size={24} color={color} />
            <Text className="text-headlineSmall font-bold text-primary mt-1">
                {value}
            </Text>
            <Text className="text-labelSmall text-secondary uppercase tracking-tight">
                {label}
            </Text>
        </View>
    );
}
