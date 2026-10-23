
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
// Reusable reason selector for:
// 1. FIFO Override
// 2. Queue Cancellation
// 3. Verified No-Show
// 4. Offense Revocation
//
// Features:
// - Multiple checkbox selections
// - Custom Other reason
// - Optional additional notes
// - 200-character text limits
// - Accessible labels and states
//
// This is a controlled component.
// The parent owns the selected values.
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

  const options = getReasonsForAction(action);

  const selectedReasons = Array.isArray(value?.selectedReasons)
    ? value.selectedReasons
    : [];

  const otherReason = value?.otherReason ?? '';
  const additionalNotes = value?.additionalNotes ?? '';

  const hasOther = selectedReasons.includes(OTHER_REASON_ID);

  const selectedCount = selectedReasons.length;

  // =====================================================
  // UPDATE CONTROLLED VALUE
  // =====================================================

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

  // =====================================================
  // CHECKBOX SELECTION
  // =====================================================

  const toggleReason = (reasonId) => {
    const selected = selectedReasons.includes(reasonId);

    const nextReasons = selected
      ? selectedReasons.filter((id) => id !== reasonId)
      : [...selectedReasons, reasonId];

    update({
      selectedReasons: nextReasons,

      // Clear old custom text if Other is unchecked.
      ...(reasonId === OTHER_REASON_ID && selected
        ? { otherReason: '' }
        : {}),
    });
  };

  const summary = selectedCount === 0
    ? 'Select one or more reasons'
    : `${selectedCount} ${selectedCount === 1 ? 'reason' : 'reasons'} selected`;

  return (
    <View style={styles.container}>

      {/* =============================================
          REASON SELECTION LABEL
      ============================================= */}

      <View style={styles.labelRow}>
        <Text style={styles.label}>
          Reasons <Text style={styles.required}>*</Text>
        </Text>

        <Text style={styles.hint}>
          Select all that apply
        </Text>
      </View>

      {/* =============================================
          DROPDOWN TRIGGER
      ============================================= */}

      <Pressable
        onPress={() => {
          if (!disabled) {
            setExpanded((previous) => !previous);
          }
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Select reasons"
        accessibilityHint="Opens a list of reasons where multiple options can be selected"
        accessibilityState={{
          expanded,
          disabled,
        }}
        style={[
          styles.trigger,
          expanded && styles.triggerActive,
          disabled && styles.disabled,
        ]}
      >
        <Text style={[
          styles.triggerText,
          selectedCount === 0 && styles.placeholder,
        ]}>
          {summary}
        </Text>

        <Text style={styles.chevron}>
          {expanded ? '▴' : '▾'}
        </Text>
      </Pressable>

      {/* =============================================
          EXPANDED DROPDOWN
      ============================================= */}

      {expanded && (
        <View style={styles.dropdown}>
          <ScrollView
            style={styles.optionsScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => {
              const checked = selectedReasons.includes(
                option.id,
              );

              return (
                <Pressable
                  key={option.id}
                  onPress={() => toggleReason(option.id)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={option.label}
                  accessibilityState={{
                    checked,
                    disabled,
                  }}
                  style={[
                    styles.option,
                    checked && styles.optionSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxSelected,
                    ]}
                  >
                    {checked && (
                      <Text style={styles.checkmark}>
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text style={styles.optionText}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => setExpanded(false)}
            accessibilityRole="button"
            accessibilityLabel="Done selecting reasons"
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>
              Done
            </Text>
          </Pressable>
        </View>
      )}

      {/* =============================================
          SELECTED REASON CHIPS
      ============================================= */}

      {selectedCount > 0 && (
        <View style={styles.chips}>
          {selectedReasons.map((reasonId) => {
            const option = options.find(
              (item) => item.id === reasonId,
            );

            if (!option) return null;

            return (
              <Pressable
                key={reasonId}
                onPress={() => toggleReason(reasonId)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${option.label}`}
                style={styles.chip}
              >
                <Text style={styles.chipText}>
                  {option.label}
                </Text>

                <Text style={styles.chipRemove}>
                  ×
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* =============================================
          OTHER REASON — REQUIRED WHEN SELECTED
      ============================================= */}

      {hasOther && (
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.label}>
              Specify other reason{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <Text style={styles.counter}>
              {otherReason.length}/{REASON_TEXT_LIMIT}
            </Text>
          </View>

          <TextInput
            value={otherReason}
            onChangeText={(text) => update({
              otherReason: text.slice(0, REASON_TEXT_LIMIT),
            })}
            editable={!disabled}
            multiline
            maxLength={REASON_TEXT_LIMIT}
            placeholder="Enter your reason..."
            placeholderTextColor={styles.placeholder.color}
            accessibilityLabel="Specify other reason"
            style={styles.textArea}
            textAlignVertical="top"
          />
        </View>
      )}

      {/* =============================================
          ADDITIONAL NOTES — ALWAYS OPTIONAL
      ============================================= */}

      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabelRow}>
          <Text style={styles.label}>
            Additional notes
          </Text>

          <Text style={styles.counter}>
            {additionalNotes.length}/{REASON_TEXT_LIMIT}
          </Text>
        </View>

        <TextInput
          value={additionalNotes}
          onChangeText={(text) => update({
            additionalNotes: text.slice(0, REASON_TEXT_LIMIT),
          })}
          editable={!disabled}
          multiline
          maxLength={REASON_TEXT_LIMIT}
          placeholder="Optional additional context..."
          placeholderTextColor={styles.placeholder.color}
          accessibilityLabel="Additional notes"
          style={styles.textArea}
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
    },

    required: {
      color: c.error,
    },

    hint: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
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
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      color: c.ink,
    },

    placeholder: {
      color: c.slate,
    },

    chevron: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: 20,
      color: c.slate,
    },

    dropdown: {
      width: '100%',
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 12,
      backgroundColor: c.paper,
      overflow: 'hidden',
    },

    optionsScroll: {
      maxHeight: 220,
    },

    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 44,
    },

    optionSelected: {
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
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      color: c.ink,
      lineHeight: 21,
    },

    doneButton: {
      paddingVertical: 12,
      alignItems: 'center',
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
    },

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: c.disabledBg,
      maxWidth: '100%',
    },

    chipText: {
      flexShrink: 1,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
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
    },

    fieldLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },

    counter: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.slate,
    },

    textArea: {
      width: '100%',
      height: 78,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: c.paper,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      color: c.ink,
      outlineStyle: 'none',
    },

    disabled: {
      opacity: 0.5,
    },
  });
