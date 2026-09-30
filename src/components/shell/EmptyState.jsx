import Button from '@/components/primitives/Button';
import { ButtonType, COLORS, EMPTY_STATE_COPY, EmptyStateType, IconSet, lineHeightFor, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

// Visual per variant; copy comes from EMPTY_STATE_COPY (constants/content).
// Screens pick a variant with `type` and only supply onAction.
const VARIANTS = {
  [EmptyStateType.NO_TICKETS]: { icon: 'ticket-outline', iconColor: COLORS.gold },
  [EmptyStateType.NO_HISTORY]: { icon: 'file-tray-outline', iconColor: COLORS.slate },
  [EmptyStateType.NO_NOTIFICATIONS]: { icon: 'notifications-outline', iconColor: COLORS.slate },
  [EmptyStateType.CLEAN_RECORD]: { icon: 'shield-checkmark-outline', iconColor: COLORS.success },
  [EmptyStateType.NO_RESULTS]: { icon: 'search-outline', iconColor: COLORS.slate },
  [EmptyStateType.OFFLINE]: { icon: 'cloud-offline-outline', iconColor: COLORS.slate },
};

export default function EmptyState({ type = EmptyStateType.NO_TICKETS, onAction, style }) {
  const variant = VARIANTS[type] ?? VARIANTS[EmptyStateType.NO_TICKETS];
  const copy = EMPTY_STATE_COPY[type] ?? EMPTY_STATE_COPY[EmptyStateType.NO_TICKETS];
  const showAction = !!copy.actionLabel && !!onAction;

  return (
    <View style={[styles.container, style]}>
      <IconSet name={variant.icon} size={30} color={variant.iconColor} style={styles.icon} />
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      {showAction && (
        <Button label={copy.actionLabel} type={ButtonType.PRIMARY} onPress={onAction} style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xxxl,
  },
  icon: {
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
    alignSelf: 'center',
  },
});
