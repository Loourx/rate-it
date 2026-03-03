import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, getCategoryColor } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { CardAmbientGlow, CardFooter, CardScoreHero } from '@/components/sharing/partials';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;

type ContentType = 'movie' | 'series' | 'book' | 'game' | 'music';

export interface ShareableRatingCardProps {
  contentType: ContentType;
  title: string;
  posterUrl: string | null;
  score: number;
  reviewText: string | null;
  username: string;
  trackAverage?: number | null;
  episodeAverage?: number | null;
}

const EMOJI: Record<ContentType, string> = {
  movie: '🎬', series: '📺', book: '📚', game: '🎮', music: '🎵',
};

const LABEL: Record<ContentType, string> = {
  movie: 'PELÍCULA', series: 'SERIE', book: 'LIBRO', game: 'JUEGO', music: 'MÚSICA',
};

function CategoryBadge({ type, color }: { type: ContentType; color: string }): React.ReactElement {
  return (
    <View style={[s.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={s.badgeEmoji}>{EMOJI[type]}</Text>
      <Text style={[s.badgeLabel, { color }]}>{LABEL[type]}</Text>
    </View>
  );
}

export function ShareableRatingCard({
  contentType, title, posterUrl, score, reviewText, username, trackAverage, episodeAverage,
}: ShareableRatingCardProps): React.ReactElement {
  const color = getCategoryColor(contentType);
  const isMusic = contentType === 'music';
  const posterW = isMusic ? 80 : 64;
  const posterH = isMusic ? 80 : 96;
  const fillPct = `${Math.round((score / 10) * 100)}%` as const;
  const snippet =
    reviewText && reviewText.length > 5
      ? reviewText.length > 110 ? reviewText.slice(0, 110) + '…' : reviewText
      : null;

  return (
    <View style={s.card}>
      <CardAmbientGlow accentColor={color} height={200} />

      {/* Row 1 — category badge + score */}
      <View style={s.topRow}>
        <CategoryBadge type={contentType} color={color} />
        <CardScoreHero score={score} accentColor={color} />
      </View>

      {/* Row 2 — poster + title/bar/averages */}
      <View style={s.infoRow}>
        {posterUrl ? (
          <Image
            source={posterUrl}
            style={[s.poster, { width: posterW, height: posterH }]}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[s.posterFallback, { width: posterW, height: posterH, backgroundColor: color + '33' }]}>
            <Text style={s.posterInitial}>{title.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={s.infoContent}>
          <Text style={s.title} numberOfLines={3}>{title}</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, { width: fillPct, backgroundColor: color }]} />
          </View>
          {contentType === 'music' && trackAverage != null && (
            <Text style={[s.avgText, { color }]}>Tracks avg {trackAverage.toFixed(1)}</Text>
          )}
          {contentType === 'series' && episodeAverage != null && (
            <Text style={[s.avgText, { color }]}>Eps avg {episodeAverage.toFixed(1)}</Text>
          )}
        </View>
      </View>

      {/* Review block — only if present and >5 chars */}
      {snippet && (
        <View style={[s.review, { borderLeftColor: color }]}>
          <Text style={s.reviewText}>"{snippet}"</Text>
        </View>
      )}

      <CardFooter username={username} accentColor={color} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#121212',
    padding: 20,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    gap: 5,
  },
  badgeEmoji: { fontSize: 10 },
  badgeLabel: { fontSize: 10, fontWeight: '600' },
  infoRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
    zIndex: 1,
  },
  poster: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  posterFallback: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterInitial: {
    fontSize: 28,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  infoContent: { flex: 1 },
  title: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  barTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceElevated,
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 999,
  },
  avgText: {
    fontSize: 11,
    fontFamily: FONT.medium,
    marginTop: 6,
  },
  review: {
    backgroundColor: '#121212',
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 20,
    zIndex: 1,
  },
  reviewText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
});

