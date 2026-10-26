
import {
    getReasonsForAction,
    OTHER_REASON_ID,
    REASON_TEXT_LIMIT,
} from '@/constants/reasons';

import {
    STAFF_FONT,
    TYPOGRAPHY,
} from '@/constants';

import { useThemedStyles } from '@/hooks';

import { useState } from 'react';

import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF — SINGLE REASON RADIO LIST
//
// Features:
// - Exactly one selected reason
// - Inline Other text field
// - Required explanation when Other is selected
// - Maximum 200 characters
// - Responsive layout
// - Keyboard accessibility
//
// UI FIX:
// - Only one yellow selection outline
// - No nested yellow borders
// - Separate keyboard focus indication
//
// No queue business logic changes.
// =====================================================

const EMPTY_SELECTION = {
  selectedReason: '',
  otherReason: '',
};

export default function ReasonRadioList({
  action,
  value = EMPTY_SELECTION,
  onChange,
  disabled = false,
}) {
  const styles = useThemedStyles(makeStyles);

  const [focusedControl, setFocusedControl] =
    useState(null);

  const options = getReasonsForAction(action);

  const selectedReason =
    value?.selectedReason ?? '';

  const otherReason =
    value?.otherReason ?? '';

  // =================================================
  // SELECT A REASON
  // =================================================

  const chooseReason = (reasonId) => {
    if (disabled || !onChange) {
      return;
    }

    onChange({
      selectedReason: reasonId,

      // Clear stale Other text when choosing
      // a predefined reason.
      otherReason:
        reasonId === OTHER_REASON_ID
          ? otherReason
          : '',
    });
  };

  // =================================================
  // UPDATE OTHER EXPLANATION
  // =================================================

  const changeOtherText = (text) => {
    if (disabled || !onChange) {
      return;
    }

    onChange({
      selectedReason: OTHER_REASON_ID,
      otherReason: text.slice(
        0,
        REASON_TEXT_LIMIT,
      ),
    });
  };

  // =================================================
  // RENDER RADIO OPTIONS
  // =================================================

  return (
    <View
      style={styles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel="Choose one reason"
    >
      {options.map((option) => {
        const selected =
          selectedReason === option.id;

        const isOther =
          option.id === OTHER_REASON_ID;

        const radioFocusId =
          `radio-${option.id}`;

        return (
          <View
            key={option.id}
            style={[
              styles.row,

              // One outer yellow selection border.
              selected && styles.rowSelected,

              // Keyboard focus uses the same
              // outer border instead of creating
              // another nested outline.
              focusedControl === radioFocusId &&
                !selected &&
                styles.rowFocused,
            ]}
          >
            {/* =====================================
                RADIO BUTTON
            ===================================== */}

            <Pressable
              onPress={() =>
                chooseReason(option.id)
              }
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityLabel={
                option.label
              }
              accessibilityState={{
                selected,
                disabled,
              }}
              onFocus={() =>
                setFocusedControl(
                  radioFocusId,
                )
              }
              onBlur={() =>
                setFocusedControl(null)
              }
              style={({ hovered, pressed }) => [
                styles.choice,

                isOther &&
                  styles.otherChoice,

                !disabled &&
                  (hovered || pressed) &&
                  styles.choiceHover,

                disabled &&
                  styles.disabled,
              ]}
            >
              <View
                style={[
                  styles.radio,
                  selected &&
                    styles.radioSelected,
                ]}
                importantForAccessibility="no"
              >
                {selected && (
                  <View
                    style={styles.radioDot}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.optionLabel,
                  selected &&
                    styles.selectedLabel,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>

            {/* =====================================
                INLINE OTHER TEXT FIELD
            ===================================== */}

            {isOther && (
              <View
                style={styles.otherInputWrap}
              >
                <TextInput
                  value={otherReason}
                  onFocus={() => {
                    setFocusedControl(
                      'other-input',
                    );

                    if (
                      !disabled &&
                      !selected
                    ) {
                      chooseReason(
                        OTHER_REASON_ID,
                      );
                    }
                  }}
                  onBlur={() => {
                    setFocusedControl(null);
                  }}
                  onChangeText={
                    changeOtherText
                  }
                  editable={!disabled}
                  maxLength={
                    REASON_TEXT_LIMIT
                  }
                  placeholder="Type the reason"
                  placeholderTextColor={
                    styles.placeholder.color
                  }
                  accessibilityLabel={
                    'Other reason'
                  }
                  accessibilityHint={
                    'Required when Other is selected. Maximum 200 characters.'
                  }
                  accessibilityState={{
                    disabled,
                  }}
                  style={[
                    styles.otherInput,

                    selected &&
                      styles.otherInputActive,

                    // Use a subtle neutral focus
                    // appearance for the input.
                    // The yellow selection border
                    // remains on the entire row.
                    focusedControl ===
                      'other-input' &&
                      styles.otherInputFocused,

                    disabled &&
                      styles.disabled,
                  ]}
                />

                {selected && (
                  <Text
                    style={
                      styles.characterCount
                    }
                  >
                    {otherReason.length}/
                    {REASON_TEXT_LIMIT}
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const makeStyles = (c) =>
  StyleSheet.create({
    // ===============================================
    // RADIO LIST CONTAINER
    // ===============================================

    container: {
      width: '100%',
      minWidth: 0,
      gap: 7,
    },

    // ===============================================
    // REASON ROW
    // ===============================================

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      minHeight: 44,
      paddingHorizontal: 6,
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: 9,
      minWidth: 0,
    },

    // Single yellow selection outline.
    rowSelected: {
      borderColor: c.gold,
      backgroundColor: c.paper,
    },

    // Focus indicator when an unselected
    // radio receives keyboard focus.
    rowFocused: {
      borderColor: c.slate,
      backgroundColor: c.disabledBg,
    },

    // ===============================================
    // RADIO PRESSABLE
    // ===============================================

    choice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      minHeight: 42,
      paddingHorizontal: 2,
      paddingVertical: 8,
      flexShrink: 1,
      minWidth: 0,
      borderRadius: 6,
    },

    otherChoice: {
      flexShrink: 0,
    },

    choiceHover: {
      backgroundColor: c.disabledBg,
    },

    // ===============================================
    // RADIO CIRCLE
    // ===============================================

    radio: {
      width: 18,
      height: 18,
      borderWidth: 1.5,
      borderColor: c.slate,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    radioSelected: {
      borderColor: c.ink,
    },

    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.ink,
    },

    // ===============================================
    // REASON LABEL
    // ===============================================

    optionLabel: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: c.ink,
      flexShrink: 1,
    },

    selectedLabel: {
      fontFamily: STAFF_FONT.semibold,
    },

    // ===============================================
    // OTHER INPUT CONTAINER
    // ===============================================

    otherInputWrap: {
      flex: 1,
      minWidth: 130,
      gap: 3,
      paddingVertical: 4,
    },

    // ===============================================
    // OTHER INPUT
    // ===============================================

    otherInput: {
      width: '100%',
      minHeight: 36,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 7,
      backgroundColor: c.disabledBg,
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: 13,
      color: c.ink,
      outlineStyle: 'none',
    },

    // Active Other input remains neutral.
    // The parent row already has the
    // yellow selection outline.
    otherInputActive: {
      backgroundColor: c.paper,
      borderColor: c.slate,
    },

    // Subtle focus indicator; not yellow.
    otherInputFocused: {
      borderColor: c.ink,
    },

    placeholder: {
      color: c.slate,
    },

    // ===============================================
    // CHARACTER COUNTER
    // ===============================================

    characterCount: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: 11,
      color: c.slate,
      textAlign: 'right',
    },

    disabled: {
      opacity: 0.5,
    },
  });
