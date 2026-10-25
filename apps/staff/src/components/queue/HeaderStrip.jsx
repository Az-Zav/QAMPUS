
import ActionButton from '@/components/primitives/ActionButton';
import Dot from '@/components/primitives/Dot';

import {
  ButtonType,
  QUEUE_COPY,
  RADII,
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';

import {
  useTheme,
  useThemedStyles,
} from '@/hooks';

import {
  Check,
  Copy,
} from '@/icons';

import { formatManualCode } from '@qampus/core/format';

import * as Clipboard from 'expo-clipboard';

import {
  useEffect,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF — HEADER STRIP
//
// Fix #8: Responsive layout and accessibility.
//
// Preserves:
// - Manual queue code
// - Copy code action
// - Queue readout
// - Joining status
// - Cutoff override
// - Open / Close Queue
// - Cancel Queue
//
// No business logic changes.
// =====================================================

const COPIED_MS = 1500;

// Screen-size breakpoints.
const MOBILE_BREAKPOINT = 600;
const TABLET_BREAKPOINT = 960;

export default function HeaderStrip({
  manualCode,
  waitingCount,
  averageServiceMinutes,
  isOpen,
  joiningOpen,
  cutoffReached,
  onOverrideCutoff,
  onLaunchDisplay,
  onOpenQueue,
  onCloseQueue,
  onCancelQueue,
}) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();

  const { width } = useWindowDimensions();

  const isMobile =
    width < MOBILE_BREAKPOINT;

  const isTablet =
    width >= MOBILE_BREAKPOINT &&
    width < TABLET_BREAKPOINT;

  const isCompact =
    isMobile || isTablet;

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // =================================================
  // RESET COPY FEEDBACK
  // =================================================

  useEffect(() => {
    if (!copied && !copyError) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, COPIED_MS);

    return () => clearTimeout(timeout);
  }, [copied, copyError]);

  // =================================================
  // COPY MANUAL CODE
  // =================================================

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(
        String(manualCode ?? ''),
      );

      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  const CopyIcon = copied ? Check : Copy;

  const joiningLabel = joiningOpen
    ? QUEUE_COPY.joiningOpen
    : cutoffReached
      ? QUEUE_COPY.cutoffReached
      : QUEUE_COPY.joiningClosed;

  // =================================================
  // RENDER
  // =================================================

  return (
    <View
      style={[
        styles.strip,
        isCompact && styles.stripCompact,
        isMobile && styles.stripMobile,
      ]}
    >
      {/* =========================================
          QUEUE INFORMATION
      ========================================= */}

      <View
        style={[
          styles.infoSection,
          isCompact && styles.sectionCompact,
        ]}
      >
        {/* Manual code */}

        <View style={styles.block}>
          <Text style={styles.label}>
            {QUEUE_COPY.manualCode}
          </Text>

          <View style={styles.codeRow}>
            <Text
              selectable
              style={[
                styles.code,
                isMobile && styles.codeMobile,
              ]}
            >
              {formatManualCode(manualCode)}
            </Text>

            <Pressable
              onPress={copyCode}
              accessibilityRole="button"
              accessibilityLabel={
                copied
                  ? QUEUE_COPY.copied
                  : QUEUE_COPY.copyCode
              }
              accessibilityHint={
                'Copies the queue code to the clipboard.'
              }
              style={({
                hovered,
                pressed,
                focused,
              }) => [
                styles.copy,
                (hovered || pressed) &&
                  styles.copyHover,
                focused && styles.copyFocused,
              ]}
            >
              <CopyIcon
                size={17}
                color={colors.ink}
              />
            </Pressable>
          </View>

          {copied && (
            <Text
              style={styles.copySuccess}
              accessibilityLiveRegion="polite"
            >
              Code copied
            </Text>
          )}

          {copyError && (
            <Text
              style={styles.copyError}
              accessibilityLiveRegion="polite"
            >
              Unable to copy code
            </Text>
          )}
        </View>

        {/* Queue readout */}

        <View
          style={[
            styles.block,
            styles.readoutBlock,
          ]}
        >
          <Text style={styles.label}>
            {QUEUE_COPY.queue}
          </Text>

          <Text
            style={[
              styles.readout,
              isMobile && styles.readoutMobile,
            ]}
          >
            {QUEUE_COPY.readout(
              waitingCount,
              averageServiceMinutes,
            )}
          </Text>
        </View>
      </View>

      {/* =========================================
          QUEUE CONTROLS
      ========================================= */}

      <View
        style={[
          styles.controlSection,
          isCompact && styles.sectionCompact,
          isMobile && styles.controlsMobile,
        ]}
      >
        {/* Joining status */}

        <View
          style={[
            styles.joining,
            isMobile && styles.joiningMobile,
          ]}
        >
          <View style={styles.joiningStatus}>
            <Dot
              color={
                joiningOpen
                  ? colors.success
                  : colors.slate
              }
            />

            <Text
              style={[
                styles.joiningLabel,
                !isOpen &&
                  styles.joiningClosed,
                isMobile &&
                  styles.joiningLabelMobile,
              ]}
            >
              {joiningLabel}
            </Text>
          </View>

          {cutoffReached && (
            <Pressable
              onPress={onOverrideCutoff}
              accessibilityRole="button"
              accessibilityLabel={
                QUEUE_COPY.overrideCutoff
              }
              accessibilityHint={
                'Overrides the queue joining cutoff.'
              }
              style={({
                hovered,
                pressed,
                focused,
              }) => [
                styles.cutoffButton,
                (hovered || pressed) &&
                  styles.cutoffHovered,
                focused &&
                  styles.cutoffFocused,
              ]}
            >
              <Text style={styles.link}>
                {QUEUE_COPY.overrideCutoff}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Launch the public display in a new tab */}

        <ActionButton
          label={QUEUE_COPY.launchDisplay}
          type={ButtonType.SECONDARY}
          onPress={onLaunchDisplay}
          style={[
            styles.launch,
            isMobile &&
              styles.mobileButton,
          ]}
        />

        {/* Open / Close Queue */}

        <ActionButton
          label={
            isOpen
              ? QUEUE_COPY.closeQueue
              : QUEUE_COPY.openQueue
          }
          type={
            isOpen
              ? ButtonType.SECONDARY
              : undefined
          }
          onPress={
            isOpen
              ? onCloseQueue
              : onOpenQueue
          }
          style={[
            styles.toggle,
            isMobile &&
              styles.mobileButton,
          ]}
        />

        {/* Cancel Queue */}

        <ActionButton
          label={QUEUE_COPY.cancelQueue}
          type={ButtonType.DESTRUCTIVE}
          onPress={onCancelQueue}
          style={[
            styles.cancel,
            isMobile &&
              styles.mobileButton,
          ]}
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
    // ===============================================
    // MAIN HEADER
    // ===============================================

    strip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',

      gap: 16,

      paddingHorizontal: 26,
      paddingVertical: 20,

      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,

      minWidth: 0,
    },

    stripCompact: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 20,
      paddingHorizontal: 20,
    },

    stripMobile: {
      paddingHorizontal: 16,
      paddingVertical: 18,
      gap: 18,
    },

    // ===============================================
    // QUEUE INFO SECTION
    // ===============================================

    infoSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 28,
      rowGap: 14,
      flexShrink: 1,
      minWidth: 0,
    },

    sectionCompact: {
      width: '100%',
    },

    block: {
      gap: 4,
      minWidth: 0,
    },

    readoutBlock: {
      flexShrink: 1,
    },

    label: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.slate,
    },

    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },

    code: {
      fontFamily: STAFF_FONT.monoBold,
      fontSize: 24,
      color: c.ink,
      flexShrink: 1,
    },

    codeMobile: {
      fontSize: 21,
    },

    copy: {
      minWidth: 44,
      minHeight: 44,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: RADII.full,
      borderWidth: 1,
      borderColor: c.slate,
    },

    copyHover: {
      backgroundColor: c.disabledBg,
    },

    copyFocused: {
      borderColor: c.gold,
      borderWidth: 2,
    },

    copySuccess: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.success,
    },

    copyError: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.error,
    },

    readout: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.lg,
      color: c.ink,
      flexShrink: 1,
    },

    readoutMobile: {
      fontSize: TYPOGRAPHY.size.md,
    },

    // ===============================================
    // QUEUE CONTROL SECTION
    // ===============================================

    controlSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 14,
      minWidth: 0,
    },

    controlsMobile: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 12,
    },

    // ===============================================
    // JOINING STATUS
    // ===============================================

    joining: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },

    joiningMobile: {
      width: '100%',
      alignItems: 'flex-start',
    },

    joiningStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },

    joiningLabel: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: 17,
      color: c.ink,
      flexShrink: 1,
    },

    joiningLabelMobile: {
      fontSize: 15,
    },

    joiningClosed: {
      color: c.slate,
    },

    cutoffButton: {
      minHeight: 44,
      paddingHorizontal: 8,
      justifyContent: 'center',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'transparent',
    },

    cutoffHovered: {
      backgroundColor: c.disabledBg,
    },

    cutoffFocused: {
      borderColor: c.gold,
    },

    link: {
      fontFamily:
        TYPOGRAPHY.fontFamily.bold,
      fontSize: 17,
      color: c.ink,
      textDecorationLine: 'underline',
    },

    // ===============================================
    // QUEUE ACTION BUTTONS
    // ===============================================

    launch: {
      width: 210,
    },

    toggle: {
      width: 150,
    },

    cancel: {
      width: 170,
    },

    mobileButton: {
      width: '100%',
      minHeight: 44,
    },
  });
