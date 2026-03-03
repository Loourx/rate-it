import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { CardFooter } from './partials';

export interface ShareableChallengeCardProps {
  username: string;
  current: number;
  target: number;
  year: number;
  streak: number;
  categoryFilter: 'movie' | 'series' | 'book' | 'game' | 'music' | 'all';
}

// 5-category palette — mirrors Rate. logo identity
const CAT_COLORS: [string, string, string, string, string] = [
  COLORS.categoryMovie,   // #FF595E  red
  COLORS.categorySeries,  // #1982C4  blue
  COLORS.categoryBook,    // #FFCA3A  yellow
  COLORS.categoryGame,    // #8939F7  purple
  COLORS.categoryMusic,   // #8AC926  green
];

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;

/* ── Ambient multi-colour glow ─────────────────────────────── */
function MultiGlow(): React.ReactElement {
  return (
    <View style={S.glowWrap} pointerEvents="none">
      <LinearGradient
        colors={[
          CAT_COLORS[0] + '30',
          CAT_COLORS[1] + '20',
          CAT_COLORS[2] + '18',
          CAT_COLORS[3] + '20',
          CAT_COLORS[4] + '30',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Vertical fade-out */}
      <LinearGradient
        colors={['transparent', '#121212']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { top: '40%' }]}
      />
    </View>
  );
}

/* ── Hero number with gradient background ──────────────────── */
function HeroNumber({ value }: { value: number }): React.ReactElement {
  return (
    <View style={S.heroWrap}>
      <View style={S.heroGradientBox}>
        <LinearGradient
          colors={CAT_COLORS as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={S.heroText} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ── Main component ────────────────────────────────────────── */
export function ShareableChallengeCard({
  username,
  current,
  target,
  year,
  streak,
}: ShareableChallengeCardProps): React.ReactElement {
  const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  const remaining = Math.max(0, target - current);

  return (
    <View style={S.root}>
      {/* ── Ambient multi-colour glow ── */}
      <MultiGlow />

      {/* ── Header row: "RETO {year}" | "{streak} días 🔥" ── */}
      <View style={S.headerRow}>
        <Text style={S.headerLabel}>{`RETO ${year}`}</Text>
        <Text style={S.headerStreak}>{`${streak} días 🔥`}</Text>
      </View>

      {/* ── @username ── */}
      <Text style={S.username} numberOfLines={1}>@{username}</Text>

      {/* ── Hero number (gradient background + white text) ── */}
      <HeroNumber value={current} />
      <Text style={S.heroSub}>{`de ${target} items culturales`}</Text>

      {/* ── Multi-colour progress bar ── */}
      <View style={S.progressWrap}>
        <View style={S.barTrack}>
          {pct > 0 && (
            <LinearGradient
              colors={CAT_COLORS as unknown as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[S.barFill, { width: `${pct}%` }]}
            />
          )}
        </View>
        <View style={S.progressInfoRow}>
          <Text style={S.progressPct}>{pct}% completado</Text>
          <Text style={S.progressRemain}>{remaining} por ir</Text>
        </View>
      </View>

      {/* ── 5 category dots ── */}
      <View style={S.dotsRow}>
        {CAT_COLORS.map((color) => (
          <View key={color} style={[S.dot, { backgroundColor: color }]} />
        ))}
      </View>

      {/* ── Spacer pushes footer down ── */}
      <View style={S.spacer} />

      {/* ── Footer ── */}
      <CardFooter username={username} accentColor="#FFFFFF" />
    </View>
  );
}

const S = StyleSheet.create({
  root: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  /* ── glow */
  glowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    zIndex: 0,
    overflow: 'hidden',
  },
  /* ── header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    zIndex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: FONT.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerStreak: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#FFD700',
    letterSpacing: 0.3,
  },
  username: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    zIndex: 1,
  },
  /* ── hero number */
  heroWrap: {
    alignItems: 'center',
    marginTop: 36,
    zIndex: 1,
  },
  heroGradientBox: {
    width: 220,
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    fontSize: 88,
    fontFamily: FONT.bold,
    fontWeight: '700',
    letterSpacing: -4,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    zIndex: 2,
  },
  heroSub: {
    fontSize: 18,
    fontFamily: FONT.regular,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 14,
    zIndex: 1,
  },
  /* ── progress bar */
  progressWrap: {
    marginTop: 40,
    zIndex: 1,
  },
  barTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressPct: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
  },
  progressRemain: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
  },
  /* ── dots */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 36,
    zIndex: 1,
  },
  dot: {
    width: 32,
    height: 5,
    borderRadius: 3,
  },
  /* ── spacer */
  spacer: {
    flex: 1,
  },
});
