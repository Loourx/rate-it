import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { TextInput, View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';

export interface SearchBarHandle {
    focus: () => void;
}

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    debounceMs?: number;
    hidden?: boolean;
}

export const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(
    function SearchBar({ value, onChangeText, placeholder = 'Buscar...', debounceMs = 500, hidden = false }, ref) {
        const inputRef = useRef<TextInput>(null);
        // We keep local state for the input to allow immediate feedback while debouncing the prop call if needed.
        const [localValue, setLocalValue] = useState(value);

        useImperativeHandle(ref, () => ({
            focus: () => inputRef.current?.focus(),
        }));

        // Sync from parent
        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        // Debounce to parent
        useEffect(() => {
            const timer = setTimeout(() => {
                if (localValue !== value) {
                    onChangeText(localValue);
                }
            }, debounceMs);
            return () => clearTimeout(timer);
        }, [debounceMs, localValue, onChangeText, value]);

        return (
            <View style={[S.container, hidden && S.hidden]} pointerEvents={hidden ? 'none' : 'auto'}>
                <View className="flex-row items-center bg-surface rounded-xl px-3 h-12 border border-divider">
                    <Ionicons name="search" size={20} color={COLORS.textTertiary} />
                    <TextInput
                        ref={inputRef}
                        className="flex-1 ml-2 text-base text-primary font-medium"
                        value={localValue}
                        onChangeText={setLocalValue}
                        placeholder={placeholder}
                        placeholderTextColor={COLORS.textTertiary}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        enterKeyHint="search"
                        inputMode="search"
                        selectionColor={COLORS.link}
                    />
                    {localValue.length > 0 && (
                        <Pressable
                            onPress={() => {
                                setLocalValue('');
                                onChangeText('');
                            }}
                        >
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color={COLORS.textTertiary}
                            />
                        </Pressable>
                    )}
                </View>
            </View>
        );
    },
);

const S = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    hidden: {
        opacity: 0,
        position: 'absolute',
        left: 0,
        right: 0,
    },
});
