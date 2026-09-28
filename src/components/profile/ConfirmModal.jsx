import Button from '@/components/primitives/Button';
import DetailRow from '@/components/shell/DetailRow';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType, COLORS, ConfirmModalType, IconSet, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

const lineHeight = (size) => Math.round(size * TYPOGRAPHY.lineHeight.normal);

const VARIANTS = {
  default: { confirm: ButtonType.SECONDARY },
  destructive: { confirm: ButtonType.DESTRUCTIVE },
};

export default function ConfirmModal({
  type = ConfirmModalType.DEFAULT,
  visible,
  icon, // optional { name, color }
  title,
  body,
  rows, // optional [{ label, value }]
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  style,
}) {
  const variant = VARIANTS[type] ?? VARIANTS.default;

  return (
    <ModalShell visible={visible} onClose={onCancel}>
      <View style={[styles.content, style]}>
        {icon && (
          <View style={styles.iconWrapper}>
            <IconSet name={icon.name} color={icon.color} size={28} />
          </View>
        )}
        <View style={styles.copy}>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {!!body && <Text style={styles.body}>{body}</Text>}
        </View>
        {rows && (
          <View style={styles.rowsBlock}>
            {rows.map((r) => (
              <DetailRow key={r.label} label={r.label} value={r.value} />
            ))}
          </View>
        )}
        <View style={styles.actions}>
          <Button type={ButtonType.PRIMARY} label={cancelLabel} onPress={onCancel} />
          <Button type={variant.confirm} label={confirmLabel} onPress={onConfirm} />
        </View>
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: SPACING.xl },
  iconWrapper: { alignSelf: 'center' },
  copy: { gap: SPACING.sm, paddingHorizontal: SPACING.xxl },
  rowsBlock: { gap: SPACING.xs, paddingHorizontal: SPACING.xxl },
  actions: { gap: SPACING.sm },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.lg,
    lineHeight: lineHeight(TYPOGRAPHY.size.lg),
    color: COLORS.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: lineHeight(TYPOGRAPHY.size.base),
    color: COLORS.slate,
    textAlign: 'center',
  },
});