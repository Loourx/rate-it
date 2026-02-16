import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { COLORS } from '@/lib/utils/constants';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ message = "Algo salió mal. Por favor, inténtalo de nuevo.", onRetry }: ErrorStateProps) {
    return (
        <View className="flex-1 items-center justify-center p-6 bg-background">
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.textTertiary} style={{ marginBottom: 16 }} />
            <Text className="text-secondary text-center mb-6 text-base">
                {message}
            </Text>
            {onRetry && (
                <Button
                    label="Reintentar"
                    onPress={onRetry}
                    variant="secondary"
                />
            )}
        </View>
    );
}
