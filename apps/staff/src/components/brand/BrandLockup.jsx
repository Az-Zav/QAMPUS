import { BRAND_COPY, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export const LockupTone = Object.freeze({ ON_LIGHT: 'onLight', ON_DARK: 'onDark' });

// Figma Brand/Lockup — gold ticket mark with the "Q", plus the QAMPUS wordmark.
// ON_LIGHT sits on Paper (191x40); ON_DARK is the public display's 1.5x version on Ink.
const TONES = {
  [LockupTone.ON_LIGHT]: { mark: require('../../../assets/images/brand/ticket-on-light.svg'), scale: 1 },
  [LockupTone.ON_DARK]: { mark: require('../../../assets/images/brand/ticket-display.svg'), scale: 1.5 },
};

export default function BrandLockup({ tone = LockupTone.ON_LIGHT, style }) {
  const styles = useThemedStyles(makeStyles);
  const { mark, scale } = TONES[tone];
  const onDark = tone === LockupTone.ON_DARK;
  const textStyle = onDark ? styles.onDark : styles.onLight;

  return (
    <View style={[styles.lockup, { gap: 12 * scale }, style]} accessibilityRole="image" accessibilityLabel="QAMPUS">
      <View style={{ width: 48 * scale, height: 40 * scale }}>
        <Image source={mark} style={StyleSheet.absoluteFill} contentFit="fill" />
        <Text
          style={[styles.q, onDark ? styles.onDark : styles.qOnLight, { fontSize: 30.667 * scale, lineHeight: 40 * scale }]}
        >
          Q
        </Text>
      </View>
      <View style={{ gap: 2 * scale }}>
        <Text style={[styles.wordmark, textStyle, { fontSize: 17 * scale }]}>{BRAND_COPY.wordmark}</Text>
        <Text style={[styles.tagline, textStyle, { fontSize: 11 * scale, lineHeight: 15 * scale }]}>
          {BRAND_COPY.tagline}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    lockup: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
    q: { fontFamily: STAFF_FONT.logo, textAlign: 'center' },
    // The mark is always Gold, so its "Q" stays dark on Paper surfaces in either scheme
    qOnLight: { color: c.onGold },
    onLight: { color: c.ink },
    onDark: { color: c.onInverse },
    wordmark: { fontFamily: STAFF_FONT.button, letterSpacing: 2.5 },
    tagline: { fontFamily: TYPOGRAPHY.fontFamily.regular, letterSpacing: 0.3 },
  });
