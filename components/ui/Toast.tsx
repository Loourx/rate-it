import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    visible: boolean;
    onDismiss: () => void;
}

export function Toast({ message, type = 'success', visible, onDismiss }: ToastProps) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, onDismiss]);

    if (!visible) return null;

    const getIconName = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            default: return 'information-circle';
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'success': return 'bg-success';
            case 'error': return 'bg-error';
            default: return 'bg-link';
        }
    };

    return (
        <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOutUp}
            className="absolute top-12 left-4 right-4 z-50"
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onDismiss}
                className={`${getColorClass()} p-4 rounded-xl flex-row items-center shadow-lg`}
            >
                <Ionicons name={getIconName()} size={24} color="#000" style={{ marginRight: 12 }} />
                <Text className="text-black font-semibold text-base flex-1">
                    {message}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}
