import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT } from '@/lib/utils/typography';

const CARD_WIDTH = 360; // Standard card width used for bleed calculation

export type ContentType = 'movie' | 'series' | 'book' | 'game' | 'music';

export interface CardScoreHeroProps {
  score: number;
  contentType: ContentType;
  accentColor: string;
}

const EMOJI: Record<ContentType, string> = {
  movie: '🎬',
  series: '📺',
  book: '📖',
  game: '🎮',
  music: '🎵',
};

const LABEL: Record<ContentType, string> = {
  movie: 'PELÍCULA',
  series: 'SERIE',
  book: 'LIBRO',
  game: 'JUEGO',
  music: 'MÚSICA',
};

/**
 * Formats the score according to strict rules:
 * 10 -> "10"
 * 9.0 -> "9.0"
 * 9.5 -> "9.5"
 */
function formatScore(score: number): string {
  if (score === 10) return '10';
  return score.toFixed(1);
}

/**
 * Hero score — the single most prominent element on every rating card.
 * Features an oversized score bleeding out of the right edge and a category pill.
 */
export function CardScoreHero({
  score,
  contentType,
  accentColor,
}: CardScoreHeroProps): React.ReactElement {
  return (
    <View style={styles.topRow}>
      {/* Category Pill */}
      <View style={[styles.pill, { backgroundColor: accentColor }]}>
        <Text style={styles.pillEmoji}>{EMOJI[contentType]}</Text>
        <Text style={styles.pillText}>{LABEL[contentType]}</Text>
      </View>

      {/* Oversized Score with bleed effect */}
      <Text style={[styles.score, { color: accentColor }]}>
        {formatScore(score)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    height: 120,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 0,
    width: '100%',
  },
  pill: {
    position: 'absolute',
    left: 0,
    bottom: 12,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillEmoji: {
    fontSize: 13,
  },
  pillText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    letterSpacing: 0.5,
  },
  score: {
    position: 'absolute',
    right: -(CARD_WIDTH * 0.15),
    bottom: -8,
    fontSize: 220,
    fontFamily: FONT.bold,
    lineHeight: 220,
    includeFontPadding: false,
  },
});
