import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, getCategoryColor } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { CardAmbientGlow, CardFooter, CardScoreHero } from '@/components/sharing/partials';

export const CARD_DIMENSIONS = {
  stories: { width: 360, height: 640 },
  feed: { width: 360, height: 450 },
};

const DEFAULT_DIMENSIONS = CARD_DIMENSIONS.stories;

type ContentType = 'movie' | 'series' | 'book' | 'game' | 'music';

export type CardVariant = 'complete' | 'no-headline' | 'minimal';

export interface ShareableRatingCardProps {
  contentType: ContentType;
  title: string;
  posterUrl: string | null;
  score: number;
  /** Short opinion (≤ 5 words) — the emotional hook that stops the scroll */
  headline?: string | null;
  reviewText: string | null;
  username: string;
  year?: string | number | null;
  director?: string | null;
  trackAverage?: number | null;
  episodeAverage?: number | null;
  /** Streaming / platform label. e.g. "Netflix" — shown as chip below title */
  platform?: string | null;
  /** Favorite track (music only) */
  favoriteTrack?: string | null;
  /** Book reading format */
  bookFormat?: 'paper' | 'digital' | 'audiobook' | null;
  /** First genre — shown as fallback chip when no headline */
  primaryGenre?: string | null;
  /** Layout variant */
  cardVariant?: CardVariant;
  /** Share format: 9:16 Stories vs 4:5 Feed */
  format?: 'stories' | 'feed';
}

const EMOJI: Record<ContentType, string> = {
  movie: '🎬', series: '📺', book: '📚', game: '🎮', music: '🎵',
};

const LABEL: Record<ContentType, string> = {
  movie: 'PELÍCULA', series: 'SERIE', book: 'LIBRO', game: 'JUEGO', music: 'MÚSICA',
};

const BOOK_FORMAT_MAP: Record<'paper' | 'digital' | 'audiobook', string> = {
  paper: '📖 Papel',
  digital: '📱 Digital',
  audiobook: '🎧 Audiolibro',
};

/* ── Category pill ────────────────────────────────────────── */
function CategoryBadge({ type, color }: { type: ContentType; color: string }): React.ReactElement {
  return (
    <View style={[s.badge, { backgroundColor: color + '26', borderColor: color + '4D' }]}>
      <Text style={s.badgeEmoji}>{EMOJI[type]}</Text>
      <Text style={[s.badgeLabel, { color }]}>{LABEL[type]}</Text>
    </View>
  );
}

/* ── Small info chip (platform / bookFormat / genre) ───────── */
function InfoChip({
  label,
  bgColor,
  borderColor,
  textColor,
}: {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}): React.ReactElement {
  return (
    <View style={[s.infoChip, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[s.infoChipText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

/* ── Main component ───────────────────────────────────────── */
export function ShareableRatingCard({
  contentType, title, posterUrl, score, headline, reviewText, username,
  year, director, trackAverage, episodeAverage,
  platform, favoriteTrack, bookFormat, primaryGenre,
  cardVariant = 'complete',
  format = 'stories',
}: ShareableRatingCardProps): React.ReactElement {
  const { width: CARD_WIDTH, height: CARD_HEIGHT } = CARD_DIMENSIONS[format];
  const color = getCategoryColor(contentType);
  const isMusic = contentType === 'music';
  const isBook = contentType === 'book';
  const isMinimal = cardVariant === 'minimal';
  const fillPct = `${Math.round((score / 10) * 100)}%` as const;

  const hasHeadline = !!headline;
  const snippet =
    reviewText && reviewText.length > 5
      ? reviewText.length > 120 ? reviewText.slice(0, 120) + '…' : reviewText
      : null;
  const hasReview = !!snippet && !isMinimal;

  // --- Minimal variant poster dimensions ---
  const minimalPosterW = CARD_WIDTH - 48;
  const minimalPosterH = Math.round(minimalPosterW * 1.4); // 2:3 ratio

  /* Dynamic poster sizing for non-minimal variants.
     Budget: top-row 90 + footer 50 + padding 40 + gaps ~40 = 220 fixed.
     Remaining ~420px split across optional headline, poster, optional review. */
  let budget = CARD_HEIGHT - 220;
  if (hasHeadline && !isMinimal) budget -= 56;
  if (hasReview) budget -= 108;
  const posterH = Math.min(Math.max(budget, 140), isMusic ? 180 : 240);
  const posterW = isMusic ? posterH : Math.round(posterH * (2 / 3));

  /* Subtitle (year · director) */
  const subtitleParts: string[] = [];
  if (year) subtitleParts.push(String(year));
  if (director) subtitleParts.push(director);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : null;

  /* Show genre chip only when no headline and variant is no-headline */
  const showGenreChip = cardVariant === 'no-headline' && !!primaryGenre;

  /* ── Minimal variant render ───────────────────────── */
  if (isMinimal) {
    return (
      <View style={[s.card, s.cardMinimal]}>
        <CardAmbientGlow accentColor={color} height={320} />

        {/* Top: badge only (no score hero) */}
        <View style={s.topRow}>
          <CategoryBadge type={contentType} color={color} />
        </View>

        {/* Headline if present */}
        {hasHeadline && (
          <Text style={s.headlineMinimal} numberOfLines={2}>"{headline}"</Text>
        )}

        {/* Middle block: poster + title */}
        <View style={[s.middleBlock]}>
          {posterUrl ? (
            <Image
              source={posterUrl}
              style={[s.poster, { width: minimalPosterW, height: minimalPosterH }]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[
              s.posterFallback,
              { width: minimalPosterW, height: minimalPosterH, backgroundColor: color + '33' },
            ]}>
              <Text style={s.posterInitial}>{title.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <Text style={s.titleMinimal} numberOfLines={3}>{title}</Text>
          {subtitle && (
            <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}

          {/* Platform chip (minimal) */}
          {!!platform && (
            <InfoChip
              label={`📺 ${platform}`}
              bgColor={color + '22'}
              borderColor={color + '44'}
              textColor={color}
            />
          )}
        </View>

        {/* Footer */}
        <CardFooter username={username} accentColor={color} />
      </View>
    );
  }

  /* ── Standard variant render (complete | no-headline) ── */
  return (
    <View style={s.card}>
      {/* ── Ambient glow ── */}
      <CardAmbientGlow accentColor={color} height={320} />

      {/* ── Row 1: badge (left) + hero score (right) ── */}
      <View style={s.topRow}>
        <CategoryBadge type={contentType} color={color} />
        <CardScoreHero score={score} accentColor={color} />
      </View>

      {/* ── Headline — before poster, between quotes, italic ── */}
      {hasHeadline && (
        <Text style={s.headline} numberOfLines={2}>"{headline}"</Text>
      )}

      {/* ── Content block: poster + title / bar / meta ── */}
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
          {subtitle && (
            <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}

          {/* Favorite track — music only */}
          {isMusic && !!favoriteTrack && (
            <Text style={s.favoriteTrack} numberOfLines={1}>Favorita: {favoriteTrack}</Text>
          )}

          {/* Book format chip */}
          {isBook && bookFormat != null && (
            <InfoChip
              label={BOOK_FORMAT_MAP[bookFormat]}
              bgColor={color + '22'}
              borderColor={color + '44'}
              textColor={color}
            />
          )}

          {/* Platform chip */}
          {!!platform && (
            <InfoChip
              label={`📺 ${platform}`}
              bgColor={color + '22'}
              borderColor={color + '44'}
              textColor={color}
            />
          )}

          {/* Genre fallback chip (no-headline variant) */}
          {showGenreChip && (
            <InfoChip
              label={primaryGenre as string}
              bgColor={COLORS.surfaceElevated}
              borderColor={COLORS.surfaceElevated}
              textColor={COLORS.textSecondary}
            />
          )}

          {/* Score bar */}
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

      {/* ── Review block — quote style with left accent border ── */}
      {hasReview && (
        <View style={[s.reviewBlock, { borderLeftColor: color }]}>
          <Text style={s.reviewText} numberOfLines={3}>"{snippet}"</Text>
          <Text style={[s.readMore, { color }]}>Leer más →</Text>
        </View>
      )}

      {/* Spacer pushes footer to absolute bottom */}
      <View style={s.spacer} />

      {/* ── Footer — @user + Rate. wordmark ── */}
      <CardFooter username={username} accentColor={color} />
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */
const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#121212',
    padding: 20,
    overflow: 'hidden',
  },
  cardMinimal: {
    justifyContent: 'space-between',
  },
  /* Row 1 */
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 6,
    marginTop: 14,
  },
  badgeEmoji: { fontSize: 11 },
  badgeLabel: { fontSize: 10, fontFamily: FONT.semibold, letterSpacing: 0.5 },
  /* Headline — standard variant */
  headline: {
    fontSize: 17,
    fontFamily: FONT.bold,
    fontStyle: 'italic',
    color: '#FFFFFF',
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 12,
    zIndex: 1,
  },
  /* Headline — minimal variant */
  headlineMinimal: {
    fontSize: 17,
    fontFamily: FONT.bold,
    fontStyle: 'italic',
    color: '#FFFFFF',
    lineHeight: 24,
    marginTop: 10,
    zIndex: 1,
  },
  /* Content block */
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    zIndex: 1,
  },
  /* Middle block (minimal) */
  middleBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  poster: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  posterFallback: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterInitial: {
    fontSize: 36,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  titleMinimal: {
    fontSize: 22,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
    lineHeight: 28,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  favoriteTrack: {
    fontSize: 11,
    fontFamily: FONT.regular,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  /* Reusable info chip */
  infoChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  infoChipText: {
    fontSize: 10,
    fontFamily: FONT.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  barTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceElevated,
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 999,
  },
  avgText: {
    fontSize: 11,
    fontFamily: FONT.medium,
    marginTop: 8,
  },
  /* Review block */
  reviewBlock: {
    backgroundColor: '#1A1A1A',
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 16,
    zIndex: 1,
  },
  reviewText: {
    fontSize: 13,
    fontFamily: FONT.regular,
    fontStyle: 'italic',
    color: '#B0B0B0',
    lineHeight: 20,
  },
  readMore: {
    fontSize: 12,
    fontFamily: FONT.medium,
    marginTop: 8,
  },
  /* Spacer */
  spacer: {
    flex: 1,
  },
});
