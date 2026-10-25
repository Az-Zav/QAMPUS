import { ELEVATION, IconSet, ListRowTone, NOTIFICATION_STYLE, RADII, SPACING, TYPOGRAPHY, lineHeightFor, withOpacity } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TONES = {
  [ListRowTone.NEUTRAL]: 'slate',
  [ListRowTone.HIGHLIGHT]: 'gold',
  [ListRowTone.SUCCESS]: 'success',
  [ListRowTone.ERROR]: 'error',
};
const HIDDEN_OFFSET = -120;

// A subtle banner that slides in from the top while the app is open when a new notification arrives.
// `notification` is a stored notification, or null to slide out. Tapping it calls onPress.
export default function NotificationToast({ notification, onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [slide] = useState(() => new Animated.Value(0));
  // The last notification stays mounted while it slides out
  const [shown, setShown] = useState(null);
  if (notification && notification !== shown) setShown(notification);

  useEffect(() => {
    if (notification) {
      Animated.spring(slide, { toValue: 1, useNativeDriver: true, bounciness: 4 }).start();
      return;
    }
    Animated.timing(slide, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setShown(null);
    });
  }, [notification, slide]);

  if (!shown) return null;
  const { icon, tone } = NOTIFICATION_STYLE[shown.type] ?? NOTIFICATION_STYLE.GLOBAL_ANNOUNCEMENT;
  const toneColor = colors[TONES[tone] ?? TONES[ListRowTone.HIGHLIGHT]];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          top: insets.top + SPACING.sm,
          opacity: slide,
          transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [HIDDEN_OFFSET, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="alert"
        accessibilityLabel={`${shown.title}. ${shown.message}`}
        style={styles.card}
      >
        <View style={[styles.iconCircle, { backgroundColor: withOpacity(toneColor, 0.18) }]}>
          <IconSet name={icon} size={18} color={toneColor} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>{shown.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{shown.message}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  wrap: { position: 'absolute', left: SPACING.md, right: SPACING.md, zIndex: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: RADII.lg,
    ...ELEVATION.sm,
  },
  iconCircle: { width: 36, height: 36, borderRadius: RADII.full, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: SPACING.xxxs },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.base),
    color: c.ink,
  },
  message: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm),
    color: c.slate,
  },
});
