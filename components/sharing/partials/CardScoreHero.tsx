import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, formatScore } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

export interface CardScoreHeroProps {
  score: number;
  accentColor: string;
}

/**
 * Hero score — the single most prominent element on every rating card.
 * Deliberately oversized with negative tracking to feel dense & powerful.
 */
export function CardScoreHero({ score, accentColor }: CardScoreHeroProps): React.ReactElement {
  return (
    <View style={styles.row}>
      <Text style={[styles.score, { color: accentColor }]}>{formatScore(score)}</Text>
      <Text style={styles.outOf}>/10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  score: {
    fontSize: 76,
    fontFamily: FONT.bold,
    letterSpacing: -4,
    lineHeight: 76,
    includeFontPadding: false,
  },
  outOf: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.textTertiary,
    marginBottom: 6,
  },
});
