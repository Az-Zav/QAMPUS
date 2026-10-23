
import ActionButton from '@/components/primitives/ActionButton';
import ReasonMultiSelect from '@/components/primitives/ReasonMultiSelect';

import {
  ButtonType,
  InputType,
  PAGE_GUTTER,
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';

import {
  REASON_ERROR_MESSAGES,
  ReasonValidationResult,
  validateReasonSelection,
} from '@/constants/reasons';

import { useThemedStyles } from '@/hooks';
import { Input } from '@qampus/ui';

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF MODAL
//
// Supports:
// - Standard confirmation
// - Verify by ID
// - Legacy reason text input
// - Multi-select reason dropdown
//
// The parent manages the modal's state and actions.
// =====================================================

export const ModalField = Object.freeze({
  NONE: 'none',
  ID: 'id',
  REASON: 'reason',
  REASON_SELECT: 'reasonSelect',
});

export default function StaffModal({
  visible,
  title,
  body,

  // Existing input behavior.
  field = ModalField.NONE,
  placeholder,
  value = '',
  onChangeText,

  // New reason multi-select behavior.
  reasonAction,
  reasonSelection,
  onReasonSelectionChange,

  // Action feedback.
  error,

  // Modal buttons.
  cancelLabel,
  confirmLabel,
  destructive = false,
  confirmDisabled = false,
  onCancel,
  onConfirm,
}) {
  const styles = useThemedStyles(makeStyles);

  const isReason = field === ModalField.REASON;
  const isReasonSelect =
    field === ModalField.REASON_SELECT;

  // Validate the reason selection before submission.
  const reasonValidation = isReasonSelect
    ? validateReasonSelection(
        reasonAction,
        reasonSelection,
      )
    : ReasonValidationResult.OK;

  const reasonIsValid =
    reasonValidation === ReasonValidationResult.OK;

  // Both the parent and the modal can disable Confirm.
  const isConfirmDisabled =
    confirmDisabled ||
    (isReasonSelect && !reasonIsValid);

  // Display validation errors when appropriate.
  // Empty selection is handled by disabling Confirm;
  // other validation issues can be shown after input.
  const validationMessage =
    isReasonSelect &&
    reasonValidation !== ReasonValidationResult.OK &&
    reasonValidation !== ReasonValidationResult.REASON_REQUIRED
      ? REASON_ERROR_MESSAGES[reasonValidation]
      : null;

  const handleConfirm = () => {
    if (isConfirmDisabled) {
      return;
    }

    onConfirm?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.scrim}>
        <View
          style={styles.card}
          accessibilityRole="alert"
          aria-modal
        >
          {/* =========================================
              MODAL TITLE
          ========================================= */}

          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            {title}
          </Text>

          {/* =========================================
              MODAL DESCRIPTION
          ========================================= */}

          {!!body && (
            <Text style={styles.body}>
              {body}
            </Text>
          )}

          {/* =========================================
              MODAL CONTENT
          ========================================= */}

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {/* Existing ID / legacy reason input */}
            {field !== ModalField.NONE &&
              !isReasonSelect && (
                <View style={styles.fieldGroup}>
                  <Input
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    accessibilityLabel={
                      placeholder ||
                      (isReason
                        ? 'Enter reason'
                        : 'Enter ID number')
                    }
                    type={
                      error
                        ? InputType.ERROR
                        : InputType.DEFAULT
                    }
                    autoFocus
                    autoCapitalize={
                      isReason
                        ? 'sentences'
                        : 'characters'
                    }
                    autoCorrect={isReason}
                    multiline={isReason}
                    onSubmitEditing={
                      isReason || isConfirmDisabled
                        ? undefined
                        : handleConfirm
                    }
                    style={[
                      styles.input,
                      isReason && styles.reasonInput,
                    ]}
                  />
                </View>
              )}

            {/* New multi-select reason input */}
            {isReasonSelect && (
              <ReasonMultiSelect
                action={reasonAction}
                value={reasonSelection}
                onChange={onReasonSelectionChange}
              />
            )}

            {/* Existing action error feedback */}
            {!!error && (
              <Text
                style={styles.error}
                accessibilityLiveRegion="polite"
              >
                {error}
              </Text>
            )}

            {/* Reason-specific validation feedback */}
            {!!validationMessage && (
              <Text
                style={styles.error}
                accessibilityLiveRegion="polite"
              >
                {validationMessage}
              </Text>
            )}
          </ScrollView>

          {/* =========================================
              MODAL ACTION BUTTONS
          ========================================= */}

          <View style={styles.actions}>
            <ActionButton
              tall
              label={cancelLabel}
              onPress={onCancel}
              style={styles.action}
            />

            {!!confirmLabel && (
              <ActionButton
                tall
                label={confirmLabel}
                onPress={handleConfirm}
                disabled={isConfirmDisabled}
                type={
                  destructive
                    ? ButtonType.DESTRUCTIVE
                    : ButtonType.SECONDARY
                }
                style={styles.action}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// =====================================================
// STYLES
// =====================================================

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
      maxHeight: '90%',
      backgroundColor: c.paper,
      borderRadius: 16,
      padding: 38,
      gap: 22,
    },

    title: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: 25,
      color: c.ink,
    },

    body: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: 17,
      lineHeight: 25,
      color: c.slate,
    },

    content: {
      flexShrink: 1,
    },

    contentInner: {
      gap: 12,
      paddingBottom: 4,
    },

    fieldGroup: {
      gap: 8,
    },

    input: {
      paddingHorizontal: 14,
      outlineStyle: 'none',
    },

    reasonInput: {
      height: 96,
      paddingTop: 14,
      textAlignVertical: 'top',
    },

    error: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.md,
      lineHeight: 22,
      color: c.error,
    },

    actions: {
      flexDirection: 'row',
      gap: 12,
    },

    action: {
      flex: 1,
    },
  });
