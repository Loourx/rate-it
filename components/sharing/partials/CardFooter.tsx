import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

export interface CardFooterProps {
  username: string;
  accentColor: string;
}

/**
 * Card footer — always pinned to the bottom.
 * @username on the left, "Rate." wordmark on the right.
 * The dot colour = category accent. This is sacred brand identity.
 */
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
    paddingTop: 14,
  },
  username: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  wordmark: {
    flexDirection: 'row',
  },
  wordmarkMain: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  wordmarkDot: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
});
