import { TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Megaphone, OctagonX, TriangleAlert } from '@/icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const BannerTone = Object.freeze({ WARNING: 'warning', INFO: 'info', DANGER: 'danger' });

const ICONS = { [BannerTone.WARNING]: TriangleAlert, [BannerTone.INFO]: Megaphone, [BannerTone.DANGER]: OctagonX };

// Figma Staff/InlineBanner — Warning = cutoff approaching (R-19), Info = announcement, Danger = expired ticket.
// Icon + text always paired; never colour alone.
export default function InlineBanner({ tone = BannerTone.WARNING, message, actionLabel, onAction }) {
  const styles = useThemedStyles(makeStyles);
  const Icon = ICONS[tone];
  const fg = styles[`${tone}Text`].color;

  return (
    <View style={[styles.banner, styles[tone]]} accessibilityRole="alert">
      <Icon size={20} color={fg} />
      <Text style={[styles.message, { color: fg }]}>{message}</Text>
      {!!actionLabel && (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text style={[styles.action, { color: fg }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 10,
    },
    [BannerTone.WARNING]: { backgroundColor: c.gold },
    [BannerTone.INFO]: { backgroundColor: c.inverse },
    [BannerTone.DANGER]: { backgroundColor: c.error },
    warningText: { color: c.onGold },
    infoText: { color: c.onInverse },
    dangerText: { color: c.onInverse },
    message: { flex: 1, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.lg },
    action: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 17 },
  });
