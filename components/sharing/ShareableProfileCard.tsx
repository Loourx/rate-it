import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { CardFooter } from '@/components/sharing/partials';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;

export interface ShareableProfileCardProps {
  username: string;
  avatarUrl: string | null;
  totalRatings: number;
  globalAverage: number;
  streak: number;
  topPosters: string[];
  categoryBreakdown: {
    movie: number;
    series: number;
    book: number;
    game: number;
    music: number;
  };
}

// Internal sub-components

function ProfileStatsRow({ totalRatings, globalAverage, streak }: Pick<ShareableProfileCardProps, 'totalRatings' | 'globalAverage' | 'streak'>) {
  const avg = globalAverage > 0 ? globalAverage.toFixed(1) : '';
  return (
    <View style={s.statsRow}>
      <View style={s.statCol}>
        <Text style={s.statValue}>{totalRatings}</Text>
        <Text style={s.statLabel}>RATINGS</Text>
      </View>
      <View style={s.divider} />
      <View style={s.statCol}>
        <Text style={s.statValue}>{avg}</Text>
        <Text style={s.statLabel}>MEDIA</Text>
      </View>
      <View style={s.divider} />
      <View style={s.statCol}>
        <Text style={s.statValue}>{streak}🔥</Text>
        <Text style={s.statLabel}>RACHA</Text>
      </View>
    </View>
  );
}

function TopPostersRow({ posters }: { posters: string[] }) {
  const visible = posters.slice(0, 3);
  return (
    <View>
      <Text style={s.sectionLabel}>TOP VALORADOS</Text>
      <View style={s.postersRow}>
        {visible.map((url, i) => (
          <View key={i} style={s.posterWrap}>
            <Image source={url} style={s.posterImg} contentFit="cover" cachePolicy="memory-disk" />
            {i === 0 && (
              <View style={s.badge1}>
                <Text style={s.badge1Text}>1</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

type Breakdown = ShareableProfileCardProps['categoryBreakdown'];
const CAT_META: Array<{ key: keyof Breakdown; emoji: string; color: string }> = [
  { key: 'movie',  emoji: '🎬', color: COLORS.categoryMovie  },
  { key: 'series', emoji: '📺', color: COLORS.categorySeries },
  { key: 'book',   emoji: '📚', color: COLORS.categoryBook   },
  { key: 'game',   emoji: '🎮', color: COLORS.categoryGame   },
  { key: 'music',  emoji: '🎵', color: COLORS.categoryMusic  },
];

function CategoryBreakdownSection({ breakdown }: { breakdown: Breakdown }) {
  const total = Math.max(Object.values(breakdown).reduce((a, b) => a + b, 0), 1);
  return (
    <View>
      <Text style={s.sectionLabel}>POR CATEGORÍA</Text>
      {CAT_META.map(({ key, emoji, color }) => {
        const pct = Math.round((breakdown[key] / total) * 100);
        return (
          <View key={key} style={s.catRow}>
            <Text style={s.catEmoji}>{emoji}</Text>
            <View style={s.catTrack}>
              <View style={[s.catFill, { width: `${pct}%` as `${number}%`, backgroundColor: color }]} />
            </View>
            <Text style={s.catCount}>{breakdown[key]}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Main component

export function ShareableProfileCard({
  username, avatarUrl, totalRatings, globalAverage, streak, topPosters, categoryBreakdown,
}: ShareableProfileCardProps): React.ReactElement {
  const initial = username.charAt(0).toUpperCase();
  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        {avatarUrl ? (
          <Image source={avatarUrl} style={s.avatar} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <LinearGradient colors={[COLORS.categoryMovie, COLORS.categorySeries]} style={s.avatar}>
            <Text style={s.avatarInitial}>{initial}</Text>
          </LinearGradient>
        )}
        <Text style={s.username} numberOfLines={1}>@{username}</Text>
      </View>

      <ProfileStatsRow totalRatings={totalRatings} globalAverage={globalAverage} streak={streak} />

      <View style={s.content}>
        <TopPostersRow posters={topPosters} />
        <CategoryBreakdownSection breakdown={categoryBreakdown} />
      </View>

      <CardFooter username={username} accentColor="#FFFFFF" />
    </View>
  );
}

// Styles

const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#121212',
    padding: 20,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  username: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 15,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FONT.medium,
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.divider,
  },
  content: {
    flex: 1,
    gap: 18,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  postersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  posterWrap: {
    flex: 1,
    aspectRatio: 2 / 3,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  posterImg: {
    width: '100%',
    height: '100%',
  },
  badge1: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFCA3A',
    borderRadius: 999,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge1Text: {
    fontSize: 9,
    fontFamily: FONT.bold,
    color: '#121212',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  catEmoji: { fontSize: 12, width: 18 },
  catTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  catFill: { height: 6, borderRadius: 999 },
  catCount: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
    width: 24,
    textAlign: 'right',
  },
});
