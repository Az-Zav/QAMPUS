import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/primitives/Button';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';

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
          <theme.IconSet name={icon} size={24} color={theme.colors.ink} />
        </View>
      ) : (
        <View style={styles.rawIconContainer}>
          {/* Renders the actual slashed wifi icon */}
          <Feather name="wifi-off" size={36} color={theme.colors.slate} />
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
    justify: 'center',
    paddingVertical: 44,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  rawIconContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.md,
    textAlign: 'center',
  },
  message: {
    marginTop: theme.spacing.xs,
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  action: {
    marginTop: theme.spacing.lg,
    alignSelf: 'stretch',
  },
});