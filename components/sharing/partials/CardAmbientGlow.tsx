import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface CardAmbientGlowProps {
  accentColor: string;
  height?: number;
}

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;

/**
 * Atmospheric signature of every card.
 * Features two specialized glows in the right corners:
 * 1. Top-right: Dual-axis gradient for a radial-like corner effect.
 * 2. Bottom-right: Subtle diagonal glow.
 * Left 30% remains pure #0A0A0A.
 */
export function CardAmbientGlow({ accentColor }: CardAmbientGlowProps): React.ReactElement {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* --- Glow 1: Top-Right (70%w, 50%h) --- */}
      <View style={styles.glowTopRight} pointerEvents="none">
        {/* Layer A (Horizontal sweep) */}
        <LinearGradient
          colors={[accentColor + '1A', accentColor + '1A', accentColor + '0D', accentColor + '00']}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Layer B (Vertical sweep) */}
        <LinearGradient
          colors={[accentColor + '14', accentColor + '0A', accentColor + '00']}
          locations={[0, 0.4, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* --- Glow 2: Bottom-Right (45%w, 30%h) --- */}
      <View style={styles.glowBottomRight} pointerEvents="none">
        <LinearGradient
          colors={[accentColor + '14', accentColor + '0A', accentColor + '00']}
          locations={[0, 0.5, 1]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0A',
    pointerEvents: 'none',
  },
  glowTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CARD_WIDTH * 0.7,
    height: CARD_HEIGHT * 0.5,
    pointerEvents: 'none',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CARD_WIDTH * 0.45,
    height: CARD_HEIGHT * 0.3,
    pointerEvents: 'none',
  },
});
