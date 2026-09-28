import Button from '@/components/primitives/Button';
import DetailRow from '@/components/shell/DetailRow';
import ModalShell from '@/components/shell/ModalShell';
import theme from '@/theme/theme';
import { ButtonType, ConfirmModalType } from '@/theme/types';
import { StyleSheet, Text, View } from 'react-native';

const lineHeight = (size) => Math.round(size * theme.typography.lineHeight.normal);

const VARIANTS = {
  default:     { confirm: ButtonType.SECONDARY },
  destructive: { confirm: ButtonType.DESTRUCTIVE },
};

export default function ConfirmModal({
    type = ConfirmModalType.DEFAULT,
    visible,
    icon,          // optional { name, color }
    title,
    body,
    rows,          // optional [{ label, value }]
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    style,
}) {

    const variant = VARIANTS[type];

    return (
        <ModalShell visible={visible} onClose={onCancel}>
            <View style={[styles.content, style]}>
                {icon && (
                  <View style={styles.iconWrapper}>
                    <theme.IconSet name={icon.name} color={icon.color} size={28} />
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
    content: { gap: theme.spacing.xl },
    iconWrapper: { alignSelf: 'center' },
    copy: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xxl },
    rowsBlock: { gap: theme.spacing.xs, paddingHorizontal: theme.spacing.xxl },
    actions: { gap: theme.spacing.sm },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.size.lg,
        lineHeight: lineHeight(theme.typography.size.lg),
        color: theme.colors.ink,
        textAlign: 'center',
    },
    body: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.size.base,
        lineHeight: lineHeight(theme.typography.size.base),
        color: theme.colors.slate,
        textAlign: 'center',
    },
});