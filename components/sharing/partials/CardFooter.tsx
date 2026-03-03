import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/utils/constants';

export interface CardFooterProps {
  username: string;
  accentColor: string;
}

export function CardFooter({ username, accentColor }: CardFooterProps): React.ReactElement {
  return (
    <View style={[styles.container, { borderTopColor: accentColor + '33' }]}> 
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.wordmark}>
        <Text style={styles.wordmarkMain}>Rate</Text>
        <Text style={[styles.wordmarkDot, { color: accentColor }]}>.</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  username: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  wordmark: {
    flexDirection: 'row',
    fontSize: 17,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: COLORS.textPrimary,
  },
  wordmarkMain: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  wordmarkDot: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
  },
});
