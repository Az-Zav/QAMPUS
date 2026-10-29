import { BRAND_COPY, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export const LockupTone = Object.freeze({ ON_LIGHT: 'onLight', ON_DARK: 'onDark' });

// The QAMPUS app logo (gold tile with the pixel "Q") plus the wordmark and tagline.
// ON_LIGHT sits on Paper; ON_DARK is the public display's 1.5x version on Ink.
const LOGO = require('../../../assets/images/Qampus-Logo.png');
const SCALES = { [LockupTone.ON_LIGHT]: 1, [LockupTone.ON_DARK]: 1.5 };

export default function BrandLockup({ tone = LockupTone.ON_LIGHT, style }) {
  const styles = useThemedStyles(makeStyles);
  const scale = SCALES[tone];
  const onDark = tone === LockupTone.ON_DARK;
  const textStyle = onDark ? styles.onDark : styles.onLight;

  return (
    <View style={[styles.lockup, { gap: 12 * scale }, style]} accessibilityRole="image" accessibilityLabel="QAMPUS">
      <Image source={LOGO} style={{ width: 40 * scale, height: 40 * scale }} contentFit="contain" />
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
    onLight: { color: c.ink },
    onDark: { color: c.onInverse },
    wordmark: { fontFamily: STAFF_FONT.button, letterSpacing: 2.5 },
    tagline: { fontFamily: TYPOGRAPHY.fontFamily.regular, letterSpacing: 0.3 },
  });
