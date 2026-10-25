
import {
  OTHER_REASON_ID,
  REASON_TEXT_LIMIT,
  getReasonsForAction,
} from '@/constants/reasons';

import {
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';

import { useThemedStyles } from '@/hooks';

import { useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// =====================================================
// QAMPUS REASON MULTI-SELECT
//
// Fix #8: Responsive layout and accessibility.
//
// Supports:
// 1. FIFO Override
// 2. Queue Cancellation
// 3. Verified No-Show
// 4. Offense Revocation
//
// Preserves:
// - Multiple reason selections
// - Required Other explanation
// - Optional additional notes
// - 200-character limits
// - Parent-controlled values
// =====================================================

const EMPTY_SELECTION = {
  selectedReasons: [],
  otherReason: '',
  additionalNotes: '',
};

export default function ReasonMultiSelect({
  action,
  value = EMPTY_SELECTION,
  onChange,
  disabled = false,
}) {
  const styles = useThemedStyles(makeStyles);

  const [expanded, setExpanded] = useState(false);
  const [focusedControl, setFocusedControl] = useState(null);

  const options = getReasonsForAction(action);

  const selectedReasons = Array.isArray(
    value?.selectedReasons,
  )
    ? value.selectedReasons
    : [];

  const otherReason = value?.otherReason ?? '';

  const additionalNotes =
    value?.additionalNotes ?? '';

  const hasOther = selectedReasons.includes(
    OTHER_REASON_ID,
  );

  const selectedCount = selectedReasons.length;

  // =================================================
  // UPDATE CONTROLLED SELECTION
  // =================================================

  const update = (changes) => {
    if (disabled || !onChange) {
      return;
    }

    onChange({
      selectedReasons,
      otherReason,
      additionalNotes,
      ...changes,
    });
  };

  // =================================================
  // TOGGLE REASON
  // =================================================

  const toggleReason = (reasonId) => {
    if (disabled) {
      return;
    }

    const isSelected =
      selectedReasons.includes(reasonId);

    const nextReasons = isSelected
      ? selectedReasons.filter(
          (id) => id !== reasonId,
        )
      : [...selectedReasons, reasonId];

    update({
      selectedReasons: nextReasons,

      // Clear custom text if Other is removed.
      ...(reasonId === OTHER_REASON_ID &&
      isSelected
        ? { otherReason: '' }
        : {}),
    });
  };

  // =================================================
  // DROPDOWN HANDLERS
  // =================================================

  const toggleDropdown = () => {
    if (!disabled) {
      setExpanded((previous) => !previous);
    }
  };

  const closeDropdown = () => {
    setExpanded(false);
  };

  const handleDropdownKey = (event) => {
    if (disabled) {
      return;
    }

    if (event.nativeEvent?.key === 'Escape') {
      closeDropdown();
    }
  };

  // =================================================
  // SUMMARY
  // =================================================

  const summary =
    selectedCount === 0
      ? 'Select one or more reasons'
      : `${selectedCount} ${
          selectedCount === 1
            ? 'reason'
            : 'reasons'
        } selected`;

  // =================================================
  // RENDER
  // =================================================

  return (
    <View
      style={styles.container}
      onKeyDown={handleDropdownKey}
    >
      {/* =========================================
          LABEL
      ========================================= */}

      <View style={styles.labelRow}>
        <Text style={styles.label}>
          Reasons{' '}
          <Text style={styles.required}>
            *
          </Text>
        </Text>

        <Text style={styles.hint}>
          Select all that apply
        </Text>
      </View>

      {/* =========================================
          DROPDOWN TRIGGER
      ========================================= */}

      <Pressable
        onPress={toggleDropdown}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={
          `Select reasons. ${summary}`
        }
        accessibilityHint={
          'Opens a list of reasons. Select all that apply.'
        }
        accessibilityState={{
          expanded,
          disabled,
        }}
        onFocus={() =>
          setFocusedControl('trigger')
        }
        onBlur={() =>
          setFocusedControl(null)
        }
        style={({ hovered, pressed }) => [
          styles.trigger,
          expanded && styles.triggerActive,
          focusedControl === 'trigger' &&
            styles.focused,
          !disabled &&
            (hovered || pressed) &&
            styles.hover,
          disabled && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            selectedCount === 0 &&
              styles.placeholder,
          ]}
        >
          {summary}
        </Text>

        <Text
          style={styles.chevron}
          importantForAccessibility="no"
        >
          {expanded ? '▴' : '▾'}
        </Text>
      </Pressable>

      {/* =========================================
          EXPANDED OPTIONS
      ========================================= */}

      {expanded && (
        <View style={styles.dropdown}>
          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={
              styles.optionsContent
            }
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {options.map((option) => {
              const checked =
                selectedReasons.includes(
                  option.id,
                );

              const focusId =
                `option-${option.id}`;

              return (
                <Pressable
                  key={option.id}
                  onPress={() =>
                    toggleReason(option.id)
                  }
                  disabled={disabled}
                  accessibilityRole="checkbox"
                  accessibilityLabel={
                    option.label
                  }
                  accessibilityState={{
                    checked,
                    disabled,
                  }}
                  onFocus={() =>
                    setFocusedControl(focusId)
                  }
                  onBlur={() =>
                    setFocusedControl(null)
                  }
                  style={({ hovered, pressed }) => [
                    styles.option,
                    checked &&
                      styles.optionSelected,
                    focusedControl === focusId &&
                      styles.optionFocused,
                    !disabled &&
                      (hovered || pressed) &&
                      styles.optionHover,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checked &&
                        styles.checkboxSelected,
                    ]}
                    importantForAccessibility="no"
                  >
                    {checked && (
                      <Text
                        style={styles.checkmark}
                        importantForAccessibility="no"
                      >
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text
                    style={styles.optionText}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={closeDropdown}
            accessibilityRole="button"
            accessibilityLabel={
              'Done selecting reasons'
            }
            onFocus={() =>
              setFocusedControl('done')
            }
            onBlur={() =>
              setFocusedControl(null)
            }
            style={({ hovered, pressed }) => [
              styles.doneButton,
              focusedControl === 'done' &&
                styles.optionFocused,
              (hovered || pressed) &&
                styles.optionHover,
            ]}
          >
            <Text style={styles.doneText}>
              Done
            </Text>
          </Pressable>
        </View>
      )}

      {/* =========================================
          SELECTED REASON CHIPS
      ========================================= */}

      {selectedCount > 0 && (
        <View style={styles.chips}>
          {selectedReasons.map((reasonId) => {
            const option = options.find(
              (item) =>
                item.id === reasonId,
            );

            if (!option) {
              return null;
            }

            const focusId =
              `chip-${reasonId}`;

            return (
              <Pressable
                key={reasonId}
                onPress={() =>
                  toggleReason(reasonId)
                }
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={
                  `Remove ${option.label}`
                }
                accessibilityHint={
                  'Removes this reason from the selection.'
                }
                onFocus={() =>
                  setFocusedControl(focusId)
                }
                onBlur={() =>
                  setFocusedControl(null)
                }
                style={({ hovered, pressed }) => [
                  styles.chip,
                  focusedControl === focusId &&
                    styles.chipFocused,
                  !disabled &&
                    (hovered || pressed) &&
                    styles.chipHover,
                  disabled && styles.disabled,
                ]}
              >
                <Text
                  style={styles.chipText}
                  numberOfLines={2}
                >
                  {option.label}
                </Text>

                <Text
                  style={styles.chipRemove}
                  importantForAccessibility="no"
                >
                  ×
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* =========================================
          REQUIRED OTHER EXPLANATION
      ========================================= */}

      {hasOther && (
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.label}>
              Specify other reason{' '}
              <Text style={styles.required}>
                *
              </Text>
            </Text>

            <Text style={styles.counter}>
              {otherReason.length}/
              {REASON_TEXT_LIMIT}
            </Text>
          </View>

          <TextInput
            value={otherReason}
            onChangeText={(text) =>
              update({
                otherReason: text.slice(
                  0,
                  REASON_TEXT_LIMIT,
                ),
              })
            }
            editable={!disabled}
            multiline
            maxLength={REASON_TEXT_LIMIT}
            placeholder="Enter your reason..."
            placeholderTextColor={
              styles.placeholder.color
            }
            accessibilityLabel={
              'Specify other reason, required'
            }
            accessibilityHint={
              `Maximum ${REASON_TEXT_LIMIT} characters`
            }
            accessibilityState={{
              disabled,
            }}
            style={[
              styles.textArea,
              disabled && styles.disabled,
            ]}
            textAlignVertical="top"
          />
        </View>
      )}

      {/* =========================================
          OPTIONAL ADDITIONAL NOTES
      ========================================= */}

      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabelRow}>
          <Text style={styles.label}>
            Additional notes
          </Text>

          <Text style={styles.counter}>
            {additionalNotes.length}/
            {REASON_TEXT_LIMIT}
          </Text>
        </View>

        <TextInput
          value={additionalNotes}
          onChangeText={(text) =>
            update({
              additionalNotes: text.slice(
                0,
                REASON_TEXT_LIMIT,
              ),
            })
          }
          editable={!disabled}
          multiline
          maxLength={REASON_TEXT_LIMIT}
          placeholder={
            'Optional additional context...'
          }
          placeholderTextColor={
            styles.placeholder.color
          }
          accessibilityLabel={
            'Additional notes, optional'
          }
          accessibilityHint={
            `Maximum ${REASON_TEXT_LIMIT} characters`
          }
          accessibilityState={{
            disabled,
          }}
          style={[
            styles.textArea,
            disabled && styles.disabled,
          ]}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const makeStyles = (c) =>
  StyleSheet.create({
    container: {
      width: '100%',
      minWidth: 0,
      gap: 14,
    },

    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },

    label: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.md,
      color: c.ink,
      flexShrink: 1,
    },

    required: {
      color: c.error,
    },

    hint: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.slate,
    },

    trigger: {
      width: '100%',
      minHeight: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 10,
      backgroundColor: c.paper,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    triggerActive: {
      borderColor: c.gold,
      borderWidth: 2,
    },

    triggerText: {
      flex: 1,
      flexShrink: 1,
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      color: c.ink,
    },

    placeholder: {
      color: c.slate,
    },

    chevron: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: 20,
      color: c.slate,
    },

    focused: {
      borderColor: c.gold,
      borderWidth: 2,
    },

    hover: {
      backgroundColor: c.disabledBg,
    },

    dropdown: {
      width: '100%',
      minWidth: 0,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 12,
      backgroundColor: c.paper,
      overflow: 'hidden',
    },

    optionsScroll: {
      maxHeight: 180,
    },

    optionsContent: {
      paddingVertical: 4,
    },

    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 48,
    },

    optionSelected: {
      backgroundColor: c.disabledBg,
    },

    optionFocused: {
      backgroundColor: c.disabledBg,
      borderWidth: 1,
      borderColor: c.gold,
    },

    optionHover: {
      backgroundColor: c.disabledBg,
    },

    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    checkboxSelected: {
      backgroundColor: c.gold,
      borderColor: c.gold,
    },

    checkmark: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: 14,
      color: c.onGold,
    },

    optionText: {
      flex: 1,
      flexShrink: 1,
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      color: c.ink,
      lineHeight: 21,
    },

    doneButton: {
      minHeight: 48,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: 1,
      borderTopColor: c.slate,
    },

    doneText: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.md,
      color: c.ink,
    },

    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      minWidth: 0,
    },

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      minHeight: 40,
      borderRadius: 18,
      backgroundColor: c.disabledBg,
      maxWidth: '100%',
      borderWidth: 1,
      borderColor: 'transparent',
    },

    chipFocused: {
      borderColor: c.gold,
    },

    chipHover: {
      borderColor: c.slate,
    },

    chipText: {
      flexShrink: 1,
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.ink,
    },

    chipRemove: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: 18,
      color: c.ink,
    },

    fieldGroup: {
      gap: 8,
      minWidth: 0,
    },

    fieldLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },

    counter: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.slate,
    },

    textArea: {
      width: '100%',
      minHeight: 88,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: c.paper,
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: 16,
      lineHeight: 22,
      color: c.ink,
      outlineStyle: 'none',
    },

    disabled: {
      opacity: 0.5,
    },
  });
