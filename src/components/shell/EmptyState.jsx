import Button from '@/components/primitives/Button';
import { ButtonType, COLORS, EMPTY_COPY, IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({
  type,
  title,
  message,
  icon,
  showIconCircle = true,
  actionLabel,
  buttonLabel,
  onAction,
  onButtonPress,
  style,
}) {
  const preset = type && EMPTY_COPY[type] ? EMPTY_COPY[type] : null;

  const displayTitle = title ?? preset?.title ?? 'Nothing here yet';
  const displayMessage = message ?? preset?.message;
  const displayIcon = icon ?? preset?.icon ?? 'ticket-outline';
  const displayActionLabel = actionLabel ?? buttonLabel ?? preset?.actionLabel;
  const handleAction = onAction ?? onButtonPress;

  return (
    <View style={[styles.container, style]}>
      {showIconCircle ? (
        <View style={styles.iconCircle}>
          <IconSet name={displayIcon} size={24} color={COLORS.ink} />
        </View>
      ) : (
        <View style={styles.rawIconContainer}>
          <IconSet name={displayIcon} size={36} color={COLORS.slate} />
        </View>
      )}

      <Text style={styles.title}>{displayTitle}</Text>
      {!!displayMessage && <Text style={styles.message}>{displayMessage}</Text>}
      {!!displayActionLabel && !!handleAction && (
        <View style={styles.action}>
          <Button label={displayActionLabel} type={ButtonType.PRIMARY} onPress={handleAction} />
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
