import ActionButton from '@/components/primitives/ActionButton';
import { ButtonType, InputType, PAGE_GUTTER, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Input } from '@qampus/ui';
import { Modal, StyleSheet, Text, View } from 'react-native';

export const ModalField = Object.freeze({ NONE: 'none', ID: 'id', REASON: 'reason' });

// Figma Staff/Modal + Staff/ModalCard: Ink 70% scrim, 620px Paper card. The safe choice sits in the
// Gold primary slot; the consequential one is secondary, labelled by its effect, red when destructive.
// Escape cancels; modals replace one another and never stack. Without `confirmLabel` it is a
// single-button notice.
export default function StaffModal({
  visible,
  title,
  body,
  field = ModalField.NONE,
  placeholder,
  value,
  onChangeText,
  error,
  cancelLabel,
  confirmLabel,
  destructive = false,
  confirmDisabled = false,
  onCancel,
  onConfirm,
}) {
  const styles = useThemedStyles(makeStyles);
  const isReason = field === ModalField.REASON;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <View style={styles.card} accessibilityRole="alert" aria-modal>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
          {field !== ModalField.NONE && (
            <View style={styles.fieldGroup}>
              <Input
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                accessibilityLabel={placeholder}
                type={error ? InputType.ERROR : InputType.DEFAULT}
                autoFocus
                autoCapitalize={isReason ? 'sentences' : 'characters'}
                autoCorrect={isReason}
                multiline={isReason}
                onSubmitEditing={isReason || confirmDisabled ? undefined : onConfirm}
                style={[styles.input, isReason && styles.reason]}
              />
              {!!error && (
                <Text style={styles.error} accessibilityLiveRegion="polite">
                  {error}
                </Text>
              )}
            </View>
          )}
          <View style={styles.actions}>
            <ActionButton tall label={cancelLabel} onPress={onCancel} style={styles.action} />
            {!!confirmLabel && (
              <ActionButton
                tall
                label={confirmLabel}
                onPress={onConfirm}
                disabled={confirmDisabled}
                type={destructive ? ButtonType.DESTRUCTIVE : ButtonType.SECONDARY}
                style={styles.action}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    scrim: {
      flex: 1,
      backgroundColor: c.scrim,
      justifyContent: 'center',
      alignItems: 'center',
      padding: PAGE_GUTTER,
    },
    card: {
      width: '100%',
      maxWidth: 620,
      backgroundColor: c.paper,
      borderRadius: 16,
      padding: 38,
      gap: 22,
    },
    title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 25, color: c.ink },
    body: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 17, lineHeight: 25, color: c.slate },
    fieldGroup: { gap: 8 },
    // The Input's own Gold (focus) / Danger (error) border is the focus ring
    input: { paddingHorizontal: 14, outlineStyle: 'none' },
    reason: { height: 96, paddingTop: 14, textAlignVertical: 'top' },
    error: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, lineHeight: 22, color: c.error },
    actions: { flexDirection: 'row', gap: 12 },
    action: { flex: 1 },
  });
