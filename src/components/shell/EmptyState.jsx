import Button from '@/components/primitives/Button';
import { ButtonType, COLORS, EmptyStateType, IconSet, lineHeightFor, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

const DEFAULTS = {
  [EmptyStateType.DEFAULT]: { icon: 'ticket-outline', title: 'Nothing here yet', body: null },
  [EmptyStateType.OFFLINE]: {
    icon: 'cloud-offline-outline',
    title: 'Temporarily unavailable',
    body: 'Please wait — this clears on its own.',
  },
};

export default function EmptyState({ type = EmptyStateType.DEFAULT, icon, title, body, actionLabel, onAction, style }) {
  const defaults = DEFAULTS[type] ?? DEFAULTS[EmptyStateType.DEFAULT];
  const offline = type === EmptyStateType.OFFLINE;
  const text = body ?? defaults.body;

  return (
    <View style={[styles.container, style]}>
      {offline ? (
        <IconSet name={icon ?? defaults.icon} size={36} color={COLORS.slate} style={styles.rawIcon} />
      ) : (
        <View style={styles.iconCircle}>
          <IconSet name={icon ?? defaults.icon} size={24} color={COLORS.ink} />
        </View>
      )}

      <Text style={styles.title}>{title ?? defaults.title}</Text>
      {!!text && <Text style={styles.body}>{text}</Text>}
      {!!actionLabel && (
        <View style={styles.action}>
          <Button label={actionLabel} type={ButtonType.PRIMARY} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge + SPACING.md,
    paddingHorizontal: SPACING.xxxl,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADII.full,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  rawIcon: {
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    textAlign: 'center',
  },
  body: {
    marginTop: SPACING.xs,
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm, TYPOGRAPHY.lineHeight.relaxed),
    textAlign: 'center',
  },
  action: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
});
