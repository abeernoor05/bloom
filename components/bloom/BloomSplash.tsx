import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  forest: '#193C2B',
  cream: '#FFF9EE',
  sage: '#A9B69A',
  terracotta: '#C96E4B',
} as const;

const LEAVES = [
  { delay: 80, duration: 760, left: 0.22, drift: 38, rotation: -28, color: COLORS.sage },
  { delay: 210, duration: 820, left: 0.48, drift: -30, rotation: 34, color: COLORS.terracotta },
  { delay: 340, duration: 780, left: 0.72, drift: 26, rotation: -14, color: COLORS.sage },
] as const;

type FallingLeafProps = (typeof LEAVES)[number] & {
  screenHeight: number;
  screenWidth: number;
};

function FallingLeaf({
  delay,
  duration,
  left,
  drift,
  rotation,
  color,
  screenHeight,
  screenWidth,
}: FallingLeafProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(
        delay,
        withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.85 ? 1 : Math.max(0, 1 - (progress.value - 0.85) / 0.15),
    transform: [
      { translateX: progress.value * drift },
      { translateY: -80 + progress.value * (screenHeight * 0.62) },
      { rotate: `${rotation + progress.value * 190}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.leaf,
        {
          backgroundColor: color,
          left: screenWidth * left,
        },
        animatedStyle,
      ]}
    />
  );
}

type BloomSplashProps = {
  onFinish: () => void;
};

export function BloomSplash({ onFinish }: BloomSplashProps) {
  const { height, width } = useWindowDimensions();
  const wordOpacity = useSharedValue(0);
  const wordScale = useSharedValue(0.94);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    wordOpacity.set(withDelay(1020, withTiming(1, { duration: 520 })));
    wordScale.set(
      withDelay(1020, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) })),
    );
    overlayOpacity.set(withDelay(2200, withTiming(0, { duration: 300 })));

    const finishTimer = setTimeout(onFinish, 2500);
    return () => clearTimeout(finishTimer);
  }, [onFinish, overlayOpacity, wordOpacity, wordScale]);

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ scale: wordScale.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="auto"
      style={[styles.overlay, overlayStyle]}
    >
      <StatusBar style={'light' as const} />
      {LEAVES.map((leaf) => (
        <FallingLeaf
          key={`${leaf.left}-${leaf.delay}`}
          {...leaf}
          screenHeight={height}
          screenWidth={width}
        />
      ))}
      <Animated.Text style={[styles.wordmark, wordStyle]}>Bloom</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: COLORS.forest,
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  leaf: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    height: 18,
    position: 'absolute',
    top: 0,
    width: 30,
  },
  wordmark: {
    color: COLORS.cream,
    fontFamily: 'Lora_400Regular',
    fontSize: 40,
    lineHeight: 48,
  },
});
