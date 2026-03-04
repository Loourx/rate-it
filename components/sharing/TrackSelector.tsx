import React from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { AlbumTrack } from '@/lib/types/content';
import { COLORS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

interface TrackSelectorProps {
    tracks: AlbumTrack[];
    selected: string | null;
    onSelect: (trackName: string | null) => void;
    accentColor: string;
}

export function TrackSelector({
    tracks,
    selected,
    onSelect,
    accentColor,
}: TrackSelectorProps): React.ReactElement {
    const renderItem = ({ item }: { item: AlbumTrack }): React.ReactElement => {
        const isSelected = selected === item.trackName;
        return (
            <TouchableOpacity
                onPress={() => onSelect(isSelected ? null : item.trackName)}
                style={[
                    styles.row,
                    isSelected && {
                        backgroundColor: accentColor + '15',
                        borderLeftWidth: 3,
                        borderLeftColor: accentColor,
                    },
                ]}
                activeOpacity={0.7}
            >
                <Text style={styles.trackNumber}>{item.trackNumber}.</Text>
                <Text
                    style={[
                        styles.trackName,
                        { color: isSelected ? accentColor : COLORS.textPrimary },
                    ]}
                    numberOfLines={1}
                >
                    {item.trackName}
                </Text>
            </TouchableOpacity>
        );
    };

    const keyExtractor = (item: AlbumTrack): string => item.trackId;

    const ItemSeparator = (): React.ReactElement => (
        <View style={styles.separator} />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={tracks}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={ItemSeparator}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // No fixed height to allow ScrollView parent to manage scroll
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    trackNumber: {
        fontSize: 12,
        fontFamily: FONT.medium,
        color: COLORS.textTertiary,
        marginRight: 8,
        minWidth: 22,
    },
    trackName: {
        fontSize: 14,
        fontFamily: FONT.regular,
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginLeft: 15,
    },
});
