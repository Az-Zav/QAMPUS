
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
  useWindowDimensions,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF MODAL
//
// Fix #8: Responsive layout and accessibility.
//
// Supports:
// - Standard confirmations
// - Verify by ID
// - Legacy reason input
// - Structured multi-select reasons
// - Existing action validation and error feedback
//
// Business logic is managed by the parent.
// =====================================================

export const ModalField = Object.freeze({
  NONE: 'none',
  ID: 'id',
  REASON: 'reason',
  REASON_SELECT: 'reasonSelect',
});

// Responsive breakpoints.
const COMPACT_BREAKPOINT = 600;
const SMALL_HEIGHT_BREAKPOINT = 600;

export default function StaffModal({
  visible,
  title,
  body,

  // Existing input behavior.
  field = ModalField.NONE,
  placeholder,
  value = '',
  onChangeText,

  // Structured multi-select reason system.
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

  const { width, height } = useWindowDimensions();

  // =================================================
  // RESPONSIVE LAYOUT
  // =================================================

  const compact = width < COMPACT_BREAKPOINT;

  const smallHeight =
    height < SMALL_HEIGHT_BREAKPOINT;

  // =================================================
  // FIELD STATE
  // =================================================

  const isReason =
    field === ModalField.REASON;

  const isReasonSelect =
    field === ModalField.REASON_SELECT;

  const hasTextField =
    field !== ModalField.NONE &&
    !isReasonSelect;

  // =================================================
  // STRUCTURED REASON VALIDATION
  //
  // Existing behavior is preserved.
  // =================================================

  const reasonValidation = isReasonSelect
    ? validateReasonSelection(
        reasonAction,
        reasonSelection,
      )
    : ReasonValidationResult.OK;

  const reasonIsValid =
    reasonValidation ===
    ReasonValidationResult.OK;

  const isConfirmDisabled =
    confirmDisabled ||
    (isReasonSelect && !reasonIsValid);

  // Empty reason selections disable confirmation.
  // Other validation issues can show inline errors.
  const validationMessage =
    isReasonSelect &&
    reasonValidation !== ReasonValidationResult.OK &&
    reasonValidation !== ReasonValidationResult.REASON_REQUIRED
      ? REASON_ERROR_MESSAGES[reasonValidation]
      : null;

  // =================================================
  // ACTION HANDLERS
  // =================================================

  const handleConfirm = () => {
    if (isConfirmDisabled) {
      return;
    }

    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // =================================================
  // MODAL UI
  // =================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View
        style={[
          styles.scrim,
          compact && styles.scrimCompact,
        ]}
      >
        <View
          style={[
            styles.card,
            compact && styles.cardCompact,
            smallHeight && styles.cardShort,
          ]}
          accessibilityRole="alert"
          accessibilityLabel={title}
          accessibilityViewIsModal
          aria-modal
        >
          {/* =====================================
              MODAL HEADER
          ===================================== */}

          <Text
            style={[
              styles.title,
              compact && styles.titleCompact,
            ]}
            accessibilityRole="header"
          >
            {title}
          </Text>

          {/* =====================================
              MODAL DESCRIPTION
          ===================================== */}

          {!!body && (
            <Text
              style={[
                styles.body,
                compact && styles.bodyCompact,
              ]}
            >
              {body}
            </Text>
          )}

          {/* =====================================
              SCROLLABLE MODAL CONTENT
          ===================================== */}

          <ScrollView
            style={styles.content}
            contentContainerStyle={
              styles.contentInner
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {/* =================================
                VERIFY ID / LEGACY REASON FIELD
            ================================= */}

            {hasTextField && (
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
                    isReason ||
                    isConfirmDisabled
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

            {/* =================================
                STRUCTURED MULTI-SELECT REASONS

                Preserves:
                - Multiple selections
                - Required Other explanation
                - Optional additional notes
                - Existing reason validation
            ================================= */}

            {isReasonSelect && (
              <ReasonMultiSelect
                action={reasonAction}
                value={reasonSelection}
                onChange={onReasonSelectionChange}
              />
            )}

            {/* =================================
                ACTION ERROR
            ================================= */}

            {!!error && (
              <Text
                style={styles.error}
                accessibilityLiveRegion="polite"
              >
                {error}
              </Text>
            )}

            {/* =================================
                REASON VALIDATION ERROR
            ================================= */}

            {!!validationMessage && (
              <Text
                style={styles.error}
                accessibilityLiveRegion="polite"
              >
                {validationMessage}
              </Text>
            )}
          </ScrollView>

          {/* =====================================
              MODAL ACTION BUTTONS
          ===================================== */}

          <View
            style={[
              styles.actions,
              compact && styles.actionsCompact,
            ]}
          >
            <ActionButton
              tall
              label={cancelLabel}
              onPress={handleCancel}
              style={[
                styles.action,
                compact && styles.actionCompact,
              ]}
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
                style={[
                  styles.action,
                  compact && styles.actionCompact,
                ]}
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
    // ===============================================
    // BACKDROP
    // ===============================================

    scrim: {
      flex: 1,
      backgroundColor: c.scrim,

      justifyContent: 'center',
      alignItems: 'center',

      padding: PAGE_GUTTER,
    },

    scrimCompact: {
      padding: 12,
    },

    // ===============================================
    // MODAL CONTAINER
    // ===============================================

    card: {
      width: '100%',
      maxWidth: 620,
      maxHeight: '90%',

      backgroundColor: c.paper,
      borderRadius: 16,

      padding: 38,
      gap: 22,
    },

    cardCompact: {
      padding: 20,
      borderRadius: 12,
      gap: 16,
      maxHeight: '94%',
    },

    cardShort: {
      maxHeight: '96%',
      gap: 12,
    },

    // ===============================================
    // TYPOGRAPHY
    // ===============================================

    title: {
      fontFamily:
        TYPOGRAPHY.fontFamily.bold,
      fontSize: 25,
      lineHeight: 32,
      color: c.ink,
      flexShrink: 1,
    },

    titleCompact: {
      fontSize: 21,
      lineHeight: 28,
    },

    body: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: 17,
      lineHeight: 25,
      color: c.slate,
      flexShrink: 1,
    },

    bodyCompact: {
      fontSize: 15,
      lineHeight: 22,
    },

    // ===============================================
    // SCROLLABLE CONTENT
    // ===============================================

    content: {
      flexShrink: 1,
      minHeight: 0,
    },

    contentInner: {
      gap: 12,
      paddingBottom: 8,
    },

    // ===============================================
    // INPUTS
    // ===============================================

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

    // ===============================================
    // VALIDATION MESSAGES
    // ===============================================

    error: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.md,
      lineHeight: 22,
      color: c.error,
    },

    // ===============================================
    // ACTION BUTTONS
    // ===============================================

    actions: {
      flexDirection: 'row',
      gap: 12,
      flexShrink: 0,
    },

    actionsCompact: {
      flexDirection: 'column',
      gap: 10,
    },

    action: {
      flex: 1,
    },

    actionCompact: {
      flex: 0,
      width: '100%',
    },
  });
