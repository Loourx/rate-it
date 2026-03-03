import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, getCategoryColor } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import {
  CardAmbientGlow, CardFooter, CardScoreHero, CardReviewQuote,
} from '@/components/sharing/partials';

export const CARD_DIMENSIONS = {
  stories: { width: 360, height: 640 },
  feed: { width: 360, height: 450 },
};

type ContentType = 'movie' | 'series' | 'book' | 'game' | 'music';
export type CardVariant = 'complete' | 'no-headline' | 'minimal';

export interface ShareableRatingCardProps {
  contentType: ContentType;
  title: string;
  posterUrl: string | null;
  score: number;
  headline?: string | null;
  reviewText: string | null;
  username: string;
  year?: string | number | null;
  director?: string | null;
  trackAverage?: number | null;
  episodeAverage?: number | null;
  platform?: string | null;
  favoriteTrack?: string | null;
  bookFormat?: 'paper' | 'digital' | 'audiobook' | null;
  primaryGenre?: string | null;
  cardVariant?: CardVariant;
  format?: 'stories' | 'feed';
}

const EMOJI: Record<ContentType, string> = {
  movie: '🎬', series: '📺', book: '📚', game: '🎮', music: '🎵',
};
const LABEL: Record<ContentType, string> = {
  movie: 'PELÍCULA', series: 'SERIE', book: 'LIBRO', game: 'JUEGO', music: 'MÚSICA',
};
const BOOK_FMT: Record<'paper' | 'digital' | 'audiobook', string> = {
  paper: '📖 Papel', digital: '📱 Digital', audiobook: '🎧 Audiolibro',
};

function Badge({ type, color }: { type: ContentType; color: string }): React.ReactElement {
  return (
    <View style={[s.badge, { backgroundColor: color + '26', borderColor: color + '4D' }]}>
      <Text style={s.badgeEmoji}>{EMOJI[type]}</Text>
      <Text style={[s.badgeLabel, { color }]}>{LABEL[type]}</Text>
    </View>
  );
}

function Chip({ label, bg, border, text }: {
  label: string; bg: string; border: string; text: string;
}): React.ReactElement {
  return (
    <View style={[s.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[s.chipText, { color: text }]}>{label}</Text>
    </View>
  );
}

function Poster({ url, w, h, ratio, fallback, color }: {
  url: string | null; w: number; h?: number; ratio?: number; fallback: string; color: string;
}): React.ReactElement {
  const imgStyle = ratio
    ? { width: w, aspectRatio: ratio, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 }
    : { width: w, height: h, borderRadius: 12, borderWidth: 1 as const, borderColor: '#ffffff12' as const };
  const fbH = ratio ? w / ratio : (h ?? w);
  return url ? (
    <Image source={url} style={imgStyle} contentFit="cover" cachePolicy="memory-disk" />
  ) : (
    <View style={[s.posterFallback, { width: w, height: fbH, backgroundColor: color + '33' }]}>
      <Text style={s.posterInit}>{fallback}</Text>
    </View>
  );
}

/* ── Main component ───────────────────────────────────────── */
export function ShareableRatingCard({
  contentType, title, posterUrl, score, reviewText, username,
  year, director, platform, favoriteTrack, bookFormat, primaryGenre,
  cardVariant = 'complete', format = 'stories',
}: ShareableRatingCardProps): React.ReactElement {
  const { width: CW } = CARD_DIMENSIONS[format];
  const color = getCategoryColor(contentType);

  /* ── Complete variant (Stories redesign) ─────────────────── */
  if (cardVariant === 'complete') {
    const hasReview = !!reviewText && reviewText.length > 5;
    return (
      <View style={s.card}>
        <CardAmbientGlow accentColor={color} height={320} />
        <CardScoreHero score={score} contentType={contentType} accentColor={color} />
        <View style={[s.dividerA, { backgroundColor: color }]} />
        <View style={s.contentRow}>
          <Poster url={posterUrl} w={CW * 0.38} ratio={2 / 3} fallback={title.charAt(0).toUpperCase()} color={color} />
          <View style={s.infoCol}>
            <Text
              style={s.titleComplete}
              numberOfLines={2}
              ellipsizeMode="tail"
              adjustsFontSizeToFit={true}
              minimumFontScale={0.72}
            >
              {title}
            </Text>
            {!!year && <Text style={s.yearText}>{year}</Text>}
          </View>
        </View>
        <View style={s.dividerB} />
        {hasReview && <CardReviewQuote text={reviewText as string} />}
        <CardFooter username={username} accentColor={color} />
      </View>
    );
  }

  /* ── Minimal variant ─────────────────────────────────────── */
  if (cardVariant === 'minimal') {
    const mW = CW - 48;
    const mH = Math.round(mW * 1.4);
    return (
      <View style={[s.card, s.cardMinimal]}>
        <CardAmbientGlow accentColor={color} height={320} />
        <View style={s.topRow}><Badge type={contentType} color={color} /></View>
        <View style={s.middle}>
          <Poster url={posterUrl} w={mW} h={mH} fallback={title.charAt(0).toUpperCase()} color={color} />
          <Text style={s.titleMinimal} numberOfLines={3}>{title}</Text>
          {!!platform && <Chip label={`📺 ${platform}`} bg={color + '22'} border={color + '44'} text={color} />}
        </View>
        <CardFooter username={username} accentColor={color} />
      </View>
    );
  }

  /* ── No-headline variant ─────────────────────────────────── */
  const pH = 200;
  const pW = Math.round(pH * (2 / 3));
  const sub = [year ? String(year) : null, director].filter(Boolean).join(' · ') || null;
  return (
    <View style={s.card}>
      <CardAmbientGlow accentColor={color} height={320} />
      <View style={s.topRow}>
        <Badge type={contentType} color={color} />
        <CardScoreHero score={score} contentType={contentType} accentColor={color} />
      </View>
      <View style={s.infoRow}>
        <Poster url={posterUrl} w={pW} h={pH} fallback={title.charAt(0).toUpperCase()} color={color} />
        <View style={s.infoContent}>
          <Text style={s.title} numberOfLines={3}>{title}</Text>
          {!!sub && <Text style={s.subtitle}>{sub}</Text>}
          {contentType === 'book' && bookFormat != null && (
            <Chip label={BOOK_FMT[bookFormat]} bg={color + '22'} border={color + '44'} text={color} />
          )}
          {!!platform && <Chip label={`📺 ${platform}`} bg={color + '22'} border={color + '44'} text={color} />}
          {!!primaryGenre && (
            <Chip label={primaryGenre} bg={COLORS.surfaceElevated} border={COLORS.surfaceElevated} text={COLORS.textSecondary} />
          )}
          {contentType === 'music' && !!favoriteTrack && (
            <Text style={s.favTrack} numberOfLines={1}>Favorita: {favoriteTrack}</Text>
          )}
        </View>
      </View>
      <View style={s.spacer} />
      <CardFooter username={username} accentColor={color} />
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */
const s = StyleSheet.create({
  card: { borderRadius: 20, backgroundColor: '#0A0A0A', padding: 20, overflow: 'hidden' },
  cardMinimal: { justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, zIndex: 1 },
  infoRow: { flexDirection: 'row', gap: 16, zIndex: 1 },
  middle: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  infoContent: { flex: 1, justifyContent: 'center' },
  spacer: { flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, gap: 6, marginTop: 14 },
  badgeEmoji: { fontSize: 11 },
  badgeLabel: { fontSize: 10, fontFamily: FONT.semibold, letterSpacing: 0.5 },
  chip: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, marginTop: 6 },
  chipText: { fontSize: 10, fontFamily: FONT.semibold, letterSpacing: 0.5, textTransform: 'uppercase' },
  posterFallback: { borderRadius: 12, borderWidth: 1, borderColor: '#ffffff12', alignItems: 'center', justifyContent: 'center' },
  posterInit: { fontSize: 36, fontFamily: FONT.bold, color: '#FFFFFF' },
  /* Complete */
  dividerA: { height: 1.5, marginVertical: 16, zIndex: 1 },
  dividerB: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 16, zIndex: 1 },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, zIndex: 1 },
  infoCol: { flex: 1 },
  titleComplete: { fontSize: 28, fontFamily: FONT.bold, color: '#FFFFFF' },
  yearText: { fontSize: 16, color: '#888888', marginTop: 6 },
  /* Non-complete */
  title: { fontSize: 18, fontFamily: FONT.bold, color: '#FFFFFF', lineHeight: 24 },
  titleMinimal: { fontSize: 22, fontFamily: FONT.bold, color: '#FFFFFF', lineHeight: 28, marginTop: 12, textAlign: 'center' },
  subtitle: { fontSize: 12, fontFamily: FONT.regular, color: COLORS.textTertiary, marginTop: 4 },
  favTrack: { fontSize: 11, fontFamily: FONT.regular, fontStyle: 'italic', color: COLORS.textSecondary, marginTop: 6 },
});
