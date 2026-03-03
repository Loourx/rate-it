import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

// Inline subset of getPlatformInfo — only icon lookup, no color logic here
interface PlatformIconInfo {
    icon: keyof typeof Ionicons.glyphMap;
}

function getPlatformIcon(platform: string): PlatformIconInfo | null {
    const l = platform.toLowerCase();
    if (l.includes('playstation') || l === 'ps4' || l === 'ps5' || l === 'ps3')
        return { icon: 'logo-playstation' };
    if (l.includes('xbox'))
        return { icon: 'logo-xbox' };
    if (l.includes('nintendo') || l.includes('switch') || l.includes('wii') || l.includes('game boy'))
        return { icon: 'game-controller-outline' };
    if (l === 'pc' || l.includes('windows'))
        return { icon: 'desktop-outline' };
    if (l === 'macos' || l === 'mac')
        return { icon: 'logo-apple' };
    if (l === 'linux')
        return { icon: 'terminal-outline' };
    if (l === 'ios' || l === 'iphone')
        return { icon: 'phone-portrait-outline' };
    if (l === 'android')
        return { icon: 'logo-android' };
    if (l === 'web')
        return { icon: 'globe-outline' };
    if (
        l.includes('netflix') || l.includes('amazon') || l.includes('prime') ||
        l.includes('disney') || l.includes('hbo') || l.includes('max') ||
        l.includes('apple tv') || l.includes('hulu') || l.includes('paramount') ||
        l.includes('peacock') || l.includes('crunchyroll') || l.includes('movistar') ||
        l.includes('filmin') || l.includes('sky')
    )
        return { icon: 'tv-outline' };
    return null;
}

interface PlatformSelectorProps {
    platforms: string[];
    selected: string | null;
    onSelect: (platform: string | null) => void;
    accentColor: string;
}

export function PlatformSelector({
    platforms,
    selected,
    onSelect,
    accentColor,
}: PlatformSelectorProps): React.ReactElement {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {platforms.map((platform) => {
                const isSelected = selected === platform;
                const iconInfo = getPlatformIcon(platform);
                return (
                    <TouchableOpacity
                        key={platform}
                        onPress={() => onSelect(isSelected ? null : platform)}
                        style={[
                            styles.chip,
                            isSelected
                                ? {
                                    backgroundColor: accentColor + '22',
                                    borderColor: accentColor,
                                }
                                : {
                                    backgroundColor: COLORS.surface,
                                    borderColor: COLORS.divider,
                                },
                        ]}
                        activeOpacity={0.7}
                    >
                        {iconInfo !== null && (
                            <Ionicons
                                name={iconInfo.icon}
                                size={12}
                                color={isSelected ? accentColor : COLORS.textSecondary}
                                style={styles.chipIcon}
                            />
                        )}
                        <Text
                            style={[
                                styles.chipText,
                                {
                                    color: isSelected ? accentColor : COLORS.textSecondary,
                                    fontFamily: isSelected ? FONT.semibold : FONT.regular,
                                },
                            ]}
                        >
                            {platform}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 2,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.full,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    chipIcon: {
        marginRight: 5,
    },
    chipText: {
        fontSize: 13,
        lineHeight: 18,
    },
});
