import Button from '@/components/primitives/Button';
import { ButtonType, EMPTY_STATE_COPY, EmptyStateType, IconSet, lineHeightFor, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// Visual per variant (iconColor is a color token name); copy comes from EMPTY_STATE_COPY (constants/content).
// Screens pick a variant with `type` and only supply onAction.
const VARIANTS = {
  [EmptyStateType.NO_TICKETS]: { icon: 'ticket-outline', iconColor: 'gold' },
  [EmptyStateType.NO_HISTORY]: { icon: 'file-tray-outline', iconColor: 'slate' },
  [EmptyStateType.NO_NOTIFICATIONS]: { icon: 'notifications-outline', iconColor: 'slate' },
  [EmptyStateType.CLEAN_RECORD]: { icon: 'shield-checkmark-outline', iconColor: 'success' },
  [EmptyStateType.NO_RESULTS]: { icon: 'search-outline', iconColor: 'slate' },
  [EmptyStateType.OFFLINE]: { icon: 'cloud-offline-outline', iconColor: 'slate' },
};

export default function EmptyState({ type = EmptyStateType.NO_TICKETS, onAction, style }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const variant = VARIANTS[type] ?? VARIANTS[EmptyStateType.NO_TICKETS];
  const copy = EMPTY_STATE_COPY[type] ?? EMPTY_STATE_COPY[EmptyStateType.NO_TICKETS];
  const showAction = !!copy.actionLabel && !!onAction;

  return (
    <View style={[styles.container, style]}>
      <IconSet name={variant.icon} size={30} color={colors[variant.iconColor]} style={styles.icon} />
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      {showAction && (
        <Button label={copy.actionLabel} type={ButtonType.PRIMARY} onPress={onAction} style={styles.action} />
      )}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
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
    color: c.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    textAlign: 'center',
  },
  body: {
    marginTop: SPACING.xs,
    color: c.slate,
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
