import React from 'react';
import { View, ScrollView, type ViewProps, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
    /** Use ScrollView instead of View for the inner container */
    scroll?: boolean;
    /** Extra props forwarded to the inner ScrollView (only when scroll=true) */
    scrollViewProps?: ScrollViewProps;
    /** Apply horizontal padding (px-4 = 16px per UI Guidelines) */
    horizontalPadding?: boolean;
    /**
     * Which edges should respect the safe area.
     * - Tab screens: ['top'] (tab bar handles bottom)
     * - Modals / full screens: ['top', 'bottom']
     * Defaults to ['top'].
     */
    edges?: Edge[];
}

/**
 * Standard screen wrapper that enforces safe area insets.
 *
 * EVERY screen-level component should use this (or useSafeAreaInsets
 * for FlatList-based screens) to prevent content from being covered
 * by the status bar / notch / home indicator.
 */
export default function Screen({
    children,
    scroll = false,
    scrollViewProps,
    horizontalPadding = false,
    edges = ['top'],
    className,
    ...viewProps
}: ScreenProps) {
    const paddingClass = horizontalPadding ? 'px-4' : '';
    const baseClassName = `flex-1 bg-background ${paddingClass} ${className ?? ''}`.trim();

    if (scroll) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={edges}>
                <ScrollView
                    className={baseClassName}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    {...scrollViewProps}
                >
                    {children}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={edges}>
            <View className={baseClassName} {...viewProps}>
                {children}
            </View>
        </SafeAreaView>
    );
}
