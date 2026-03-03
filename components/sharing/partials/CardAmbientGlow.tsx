import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface CardAmbientGlowProps {
  accentColor: string;
  height?: number;
}

export function CardAmbientGlow({ accentColor, height = 160 }: CardAmbientGlowProps): React.ReactElement {
  return (
    <View style={[styles.absolute, { height }]}> 
      <LinearGradient
        colors={[accentColor + '25', 'transparent']}
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
    height: 160,
  },
});
