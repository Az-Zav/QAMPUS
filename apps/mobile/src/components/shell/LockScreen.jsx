import { ButtonType, IconSet, LOCK_COPY, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Button } from '@qampus/ui';
import { StyleSheet, Text, View } from 'react-native';

// Covers the whole app while the biometric lock is on. `waiting` is the moment before the setting has been read:
// the cover is already up (no flash of the app) but there is nothing to ask yet.
export default function LockScreen({ waiting = false, onUnlock }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.cover} accessibilityViewIsModal importantForAccessibility="yes">
      {!waiting && (
        <>
          <IconSet name="lock-closed-outline" size={44} color={colors.gold} />
          <Text style={styles.title} accessibilityRole="header">
            {LOCK_COPY.title}
          </Text>
          <Text style={styles.body}>{LOCK_COPY.body}</Text>
          <Button label={LOCK_COPY.unlock} type={ButtonType.PRIMARY} onPress={onUnlock} style={styles.button} />
        </>
      )}
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    cover: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1000,
      elevation: 1000,
      backgroundColor: c.paper,
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.xxl,
    },
    title: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.size.xl,
      color: c.ink,
      textAlign: 'center',
    },
    body: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.slate,
      textAlign: 'center',
    },
    button: { alignSelf: 'stretch', marginTop: SPACING.sm },
  });
