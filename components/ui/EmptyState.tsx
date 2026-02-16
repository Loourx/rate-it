import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { COLORS } from '@/lib/utils/constants';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon = 'file-tray-outline',
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center p-8 bg-background">
            <View className="w-16 h-16 bg-surface-elevated rounded-full items-center justify-center mb-4">
                <Ionicons name={icon} size={32} color={COLORS.textSecondary} />
            </View>
            <Text className="text-xl font-bold text-primary mb-2 text-center">
                {title}
            </Text>
            <Text className="text-secondary text-center mb-6 leading-5">
                {description}
            </Text>
            {actionLabel && onAction && (
                <Button
                    label={actionLabel}
                    onPress={onAction}
                    variant="primary"
                />
            )}
        </View>
    );
}
