import Button from '@/components/primitives/Button';
import DetailRow from '@/components/shell/DetailRow';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType, COLORS, IconSet, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function NoticeModal({
  visible,
  title,
  message,
  rows, // optional [{ label, value }]
  buttonLabel, // omit to render no button (M06)
  icon = 'information-circle-outline',
  destructive = false,
  onClose,
}) {
  return (
    <ModalShell visible={visible} onClose={onClose}>
      <View style={[styles.iconCircle, destructive && styles.destructiveCircle]}>
        <IconSet
          name={icon}
          size={25}
          color={destructive ? COLORS.error : COLORS.ink}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {rows && (
        <View style={styles.rowsBlock}>
          {rows.map((r) => (
            <DetailRow key={r.label} label={r.label} value={r.value} />
          ))}
        </View>
      )}

      {buttonLabel && (
        <View style={styles.buttonWrapper}>
          <Button
            label={buttonLabel}
            type={destructive ? ButtonType.DESTRUCTIVE : ButtonType.PRIMARY}
            onPress={onClose}
          />
        </View>
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADII.xxl,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  destructiveCircle: {
    backgroundColor: withOpacity(COLORS.error, 0.15),
  },
  title: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    textAlign: 'center',
  },
  message: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: 20,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  rowsBlock: {
    marginTop: SPACING.lg,
    gap: SPACING.xs,
    alignSelf: 'stretch',
  },
  buttonWrapper: {
    marginTop: SPACING.xl,
    alignSelf: 'stretch',
  },
});