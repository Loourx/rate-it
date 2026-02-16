import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar...' }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChangeText(localValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, onChangeText, value]);

    // Sync internal state if external value changes (e.g. clear button)
    useEffect(() => {
        if (value !== localValue) {
            // Only update if the difference is significant to avoid typing loop issues
            // Actually, for a controlled input that debounces updates to the parent, 
            // we might want to just let the parent control it if we want strict control.
            // But here the parent `onChangeText` is the debounced one. 
            // So we need to handle the display value separately.
            // If parent value changes (e.g. empty string), we should update local.
            if (value === '' && localValue !== '') {
                setLocalValue('');
            }
        }
    }, [value]);

    return (
        <View className="px-4 py-2">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
                    value={localValue}
                    onChangeText={setLocalValue}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {localValue.length > 0 && (
                    <Ionicons
                        name="close-circle"
                        size={20}
                        color="#9CA3AF"
                        onPress={() => {
                            setLocalValue('');
                            onChangeText('');
                        }}
                    />
                )}
            </View>
        </View>
    );
}
