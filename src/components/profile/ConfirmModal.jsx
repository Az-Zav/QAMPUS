import { StyleSheet, Text, View } from 'react-native';
import Button from '../primitives/Button';
import ModalShell from '../shell/ModalShell';
import { theme } from '../../theme/theme';
import { ButtonType, ConfirmModalType } from '../../theme/types';

// Props contract
//
// <ConfirmModal
//   type          ConfirmModalType.DEFAULT | DESTRUCTIVE        default DEFAULT
//   visible       bool
//   title         string
//   body          string
//   confirmLabel  string    the consequential action, e.g. "Log out"
//   cancelLabel   string    the safe action                   default "Cancel"
//   onConfirm     func
//   onCancel      func      also fires on the close button and Android back
//   style
// />
//
// The safe action is the gold primary button. The consequential action sits
// below it — outlined in ink (DEFAULT) or danger red (DESTRUCTIVE).

const lineHeight = (size) => Math.round(size * theme.typography.lineHeight.normal);

const VARIANTS = {
  default:     { confirm: ButtonType.SECONDARY },
  destructive: { confirm: ButtonType.DESTRUCTIVE },
};

export default function ConfirmModal({
    type = ConfirmModalType.DEFAULT,
    visible,
    title,
    body,
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
                <View style={styles.copy}>
                    <Text style={styles.title} accessibilityRole="header">{title}</Text>
                    {!!body && <Text style={styles.body}>{body}</Text>}
                </View>
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
    // Clears ModalShell's absolute close button
    copy: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xxl },
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
