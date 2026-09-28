import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, Typography } from 'heroui-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

const COLORS = {
  forest: '#193C2B',
  cream: '#FFF9EE',
  sage: '#A9B69A',
  tag: '#EADCC5',
  tagText: '#513A2D',
  terracotta: '#C96E4B',
} as const;

const HERO_IMAGE = {
  uri: 'https://files.bilt.me/figma-image-fills/d9698e6b-8302-4f38-b36f-78c0be405d5c/89d7b9de80ed4a5864539cf57c2e9bf6d44dc78f.png',
};

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 48, 440);
  const imageHeight = Math.round((contentWidth / 345) * 268);
  const titleSize = width < 370 ? 27 : 30;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style={'light' as const} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.content, { maxWidth: 440 }]}>
          <View style={styles.brandRow}>
            <Typography type="body" style={styles.brand}>
              Bloom
            </Typography>
            <View style={styles.tag}>
              <Typography type="body-xs" style={styles.tagText}>
                A gentler way forward
              </Typography>
            </View>
          </View>

          <View style={styles.heroGroup}>
            <Image
              source={HERO_IMAGE}
              accessibilityLabel="A person tending a small plant beside a morning cup"
              style={[
                styles.heroImage,
                {
                  height: imageHeight,
                  width: contentWidth,
                },
              ]}
              resizeMode="cover"
            />

            <View style={styles.promise}>
              <Typography
                type="h1"
                style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.05 }]}
              >
                Small habits. A life that feels like yours.
              </Typography>
              <Typography type="body" style={styles.description}>
                Bloom turns what matters to you into tiny routines—and reshapes them with you when
                life changes.
              </Typography>
            </View>
          </View>

          <Button
            size="lg"
            onPress={() => router.push('/onboarding')}
            accessibilityLabel="Begin gently"
            style={styles.button}
          >
            <Button.Label style={styles.buttonLabel}>Begin gently</Button.Label>
            <ArrowRight color={COLORS.cream} size={18} />
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.forest,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 26,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  content: {
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  brand: {
    color: COLORS.cream,
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 22,
  },
  tag: {
    backgroundColor: COLORS.tag,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: COLORS.tagText,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 13,
  },
  heroGroup: {
    gap: 22,
  },
  heroImage: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 92,
    borderTopLeftRadius: 92,
    borderTopRightRadius: 24,
  },
  promise: {
    gap: 12,
  },
  title: {
    color: COLORS.cream,
    fontFamily: 'Lora_400Regular',
    fontWeight: '400',
    letterSpacing: -0.6,
  },
  description: {
    color: COLORS.sage,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 23,
  },
  button: {
    backgroundColor: COLORS.terracotta,
    borderRadius: 999,
    height: 56,
    marginTop: 44,
  },
  buttonLabel: {
    color: COLORS.cream,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
});
