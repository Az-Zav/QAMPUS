import Button from '@/components/primitives/Button';
import { ButtonType, COLORS, IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({
  title = 'Nothing here yet',
  message,
  icon = 'ticket-outline',
  showIconCircle = true,
  actionLabel,
  buttonLabel,
  onAction,
  onButtonPress,
}) {
  const label = actionLabel || buttonLabel;
  const onPress = onAction || onButtonPress;

  return (
    <View style={styles.container}>
      {showIconCircle ? (
        <View style={styles.iconCircle}>
          <IconSet name={icon} size={24} color={COLORS.ink} />
        </View>
      ) : (
        <View style={styles.rawIconContainer}>
          <IconSet name={icon === 'wifi-off' ? 'cloud-offline-outline' : icon} size={36} color={COLORS.slate} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!label && (
        <View style={styles.action}>
          <Button label={label} type={ButtonType.PRIMARY} onPress={onPress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: SPACING.xxxl,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADII.xxl,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  rawIconContainer: {
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    textAlign: 'center',
  },
  message: {
    marginTop: SPACING.xs,
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  action: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
});