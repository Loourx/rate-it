import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface CardAmbientGlowProps {
  accentColor: string;
  height?: number;
}

/**
 * Ambient category-colour glow — the atmospheric signature of every card.
 * Covers ~50 % of the card height with a diffuse, multi-stop gradient.
 */
export function CardAmbientGlow({ accentColor, height = 320 }: CardAmbientGlowProps): React.ReactElement {
  return (
    <View style={[styles.absolute, { height }]} pointerEvents="none">
      <LinearGradient
        colors={[
          accentColor + '44',   // ~27 % — visible colour at the top
          accentColor + '28',   // ~16 %
          accentColor + '10',   // ~6 %
          'transparent',
        ]}
        locations={[0, 0.3, 0.65, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.gradient, { height }]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  gradient: {
    width: '100%',
  },
});
