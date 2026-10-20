import DetailRow from '@/components/shell/DetailRow';
import { IconSet, lineHeightFor, ModalTone, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const ICON_CIRCLE = 48;

// Base for every modal: scrim, card, close button, and the standard
// header (icon, title, subtitle) -> children -> detail rows -> actions layout.
export default function ModalShell({
  visible,
  onClose,
  showClose = true,
  icon,
  tone = ModalTone.DEFAULT,
  title,
  subtitle,
  rows, // optional [{ label, value }]
  actions, // optional node, stacked full-width under the content
  children,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const destructive = tone === ModalTone.DESTRUCTIVE;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {showClose && (
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              onPress={onClose}
              hitSlop={SPACING.md}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <IconSet name="close" size={16} color={colors.ink} />
            </Pressable>
          )}

          {(icon || title || subtitle) && (
            <View style={styles.header}>
              {!!icon && (
                <View style={[styles.iconCircle, destructive && styles.iconCircleDestructive]}>
                  <IconSet name={icon} size={24} color={destructive ? colors.error : colors.onGold} />
                </View>
              )}
              {!!title && (
                <Text style={styles.title} accessibilityRole="header">
                  {title}
                </Text>
              )}
              {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}

          {children}

          {!!rows?.length && (
            <View style={styles.rows}>
              {rows.map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}
            </View>
          )}

          {!!actions && <View style={styles.actions}>{actions}</View>}
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c) => StyleSheet.create({
  overlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: c.paper,
    borderRadius: RADII.xxl,
    padding: SPACING.xxl,
    gap: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pressed: { opacity: 0.7 },
  header: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: RADII.full,
    backgroundColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxs,
  },
  iconCircleDestructive: {
    backgroundColor: withOpacity(c.error, 0.15),
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xl, TYPOGRAPHY.lineHeight.tight),
    color: c.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm, TYPOGRAPHY.lineHeight.relaxed),
    color: c.slate,
    textAlign: 'center',
  },
  rows: {
    gap: SPACING.xs,
  },
  actions: {
    gap: SPACING.sm,
  },
});
