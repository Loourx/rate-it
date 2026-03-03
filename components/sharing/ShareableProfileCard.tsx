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

/* ── Ambient multi-colour glow for profile cards ──────────── */
function ProfileGlow(): React.ReactElement {
  return (
    <View style={s.glowWrap} pointerEvents="none">
      <LinearGradient
        colors={['#FFFFFF18', '#FFFFFF08', 'transparent']}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/* ── Stats row ────────────────────────────────────────────── */
function ProfileStatsRow({ totalRatings, globalAverage, streak }: Pick<ShareableProfileCardProps, 'totalRatings' | 'globalAverage' | 'streak'>) {
  const avg = globalAverage > 0 ? globalAverage.toFixed(1) : '—';
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

/* ── Top posters ──────────────────────────────────────────── */
function TopPostersRow({ posters }: { posters: string[] }) {
  const visible = posters.slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <View style={s.postersSection}>
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

/* ── Category breakdown bars ──────────────────────────────── */
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

/* ── Main component ───────────────────────────────────────── */
export function ShareableProfileCard({
  username, avatarUrl, totalRatings, globalAverage, streak, topPosters, categoryBreakdown,
}: ShareableProfileCardProps): React.ReactElement {
  const initial = username.charAt(0).toUpperCase();
  const hasPosters = topPosters.length > 0;

  return (
    <View style={s.card}>
      <ProfileGlow />

      {/* Header: avatar + username */}
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

      {/* Stats */}
      <ProfileStatsRow totalRatings={totalRatings} globalAverage={globalAverage} streak={streak} />

      {/* Content area — flex 1 to fill available space */}
      <View style={s.content}>
        {hasPosters && <TopPostersRow posters={topPosters} />}
        <CategoryBreakdownSection breakdown={categoryBreakdown} />
      </View>

      {/* Footer */}
      <CardFooter username={username} accentColor="#FFFFFF" />
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */
const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#121212',
    padding: 20,
    overflow: 'hidden',
  },
  glowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    pointerEvents: 'none',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    marginBottom: 16,
    zIndex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff18',
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
    zIndex: 1,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FONT.medium,
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
  },
  content: {
    flex: 1,
    gap: 20,
    zIndex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: COLORS.textTertiary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  /* Top Posters */
  postersSection: {
    flex: 1,
  },
  postersRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  posterWrap: {
    flex: 1,
    borderRadius: 12,
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
    top: 8,
    left: 8,
    backgroundColor: '#FFCA3A',
    borderRadius: 999,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge1Text: {
    fontSize: 10,
    fontFamily: FONT.bold,
    color: '#121212',
  },
  /* Category breakdown */
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  catEmoji: { fontSize: 14, width: 20 },
  catTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  catFill: { height: 6, borderRadius: 999 },
  catCount: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
    width: 28,
    textAlign: 'right',
  },
});
