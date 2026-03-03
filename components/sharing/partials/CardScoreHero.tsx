import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, formatScore } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

export interface CardScoreHeroProps {
  score: number;
  accentColor: string;
}

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
    gap: 2,
  },
  score: {
    fontSize: 52,
    fontFamily: FONT.bold,
    letterSpacing: -3,
  },
  outOf: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
    marginBottom: 2,
  },
});
