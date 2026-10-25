
import ActionButton from '@/components/primitives/ActionButton';
import StatusBadge from '@/components/primitives/StatusBadge';

import {
  ButtonType,
  CURRENT_TICKET_COPY,
  GUEST_TYPE_LABEL,
  RADII,
  STAFF_FONT,
  TicketStatus,
  TYPOGRAPHY,
} from '@/constants';

import {
  PanelState,
  useThemedStyles,
} from '@/hooks';

import { formatCountdown } from '@qampus/core/format';

import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF — CURRENT TICKET PANEL
//
// Fix #8: Responsive layout and accessibility.
//
// Preserves:
// - Empty queue state
// - Called ticket and countdown
// - Expired ticket state
// - Verified / IN_SERVICE state
// - Manual Call Next
// - Verify by ID
// - Manual Mark No-Show
// - Complete Service
//
// NO automatic queue advancement.
// NO automatic no-show expiry.
// =====================================================

const MOBILE_BREAKPOINT = 600;
const TABLET_BREAKPOINT = 960;

const BADGE_FOR = {
  [PanelState.CALLED]:
    TicketStatus.YOUR_TURN,

  [PanelState.EXPIRED]:
    TicketStatus.EXPIRED,

  [PanelState.IN_SERVICE]:
    TicketStatus.IN_SERVICE,
};

export default function CurrentTicketPanel({
  ticket,
  state,
  remainingSeconds,
  canCallNext,
  onCallNext,
  onVerify,
  onMarkNoShow,
  onComplete,
  style,
}) {
  const styles = useThemedStyles(makeStyles);

  const { width } = useWindowDimensions();

  const isMobile =
    width < MOBILE_BREAKPOINT;

  const isTablet =
    width >= MOBILE_BREAKPOINT &&
    width < TABLET_BREAKPOINT;

  const compact = isMobile || isTablet;

  const isEmpty =
    state === PanelState.EMPTY;

  const isExpired =
    state === PanelState.EXPIRED;

  const isCalled =
    state === PanelState.CALLED;

  const isInService =
    state === PanelState.IN_SERVICE;

  // =================================================
  // EXISTING ACTION RULES
  // =================================================

  const actions = [
    [
      {
        label: CURRENT_TICKET_COPY.callNext,
        onPress: onCallNext,
        enabled: canCallNext,
        type: ButtonType.PRIMARY,
      },
      {
        label: CURRENT_TICKET_COPY.verifyById,
        onPress: onVerify,
        enabled: isCalled,
        type: ButtonType.PRIMARY,
      },
    ],
    [
      {
        label: CURRENT_TICKET_COPY.markNoShow,
        onPress: onMarkNoShow,
        enabled: isExpired || isInService,
        type: ButtonType.DESTRUCTIVE,
      },
      {
        label: CURRENT_TICKET_COPY.completeService,
        onPress: onComplete,
        enabled: isInService,
        type: ButtonType.PRIMARY,
      },
    ],
  ];

  // =================================================
  // RENDER
  // =================================================

  return (
    <View
      style={[
        styles.panel,
        isExpired && styles.panelExpired,
        compact && styles.panelCompact,
        isMobile && styles.panelMobile,
        style,
      ]}
    >
      {/* =========================================
          SECTION LABEL
      ========================================= */}

      <Text
        style={styles.eyebrow}
        accessibilityRole="header"
      >
        {CURRENT_TICKET_COPY.nowServing}
      </Text>

      {/* =========================================
          EMPTY QUEUE STATE
      ========================================= */}

      {isEmpty ? (
        <View style={styles.emptyContent}>
          <Text
            style={[
              styles.emptyTitle,
              isMobile && styles.emptyTitleMobile,
            ]}
          >
            {CURRENT_TICKET_COPY.emptyTitle}
          </Text>

          <Text style={styles.emptyBody}>
            {CURRENT_TICKET_COPY.emptyBody}
          </Text>
        </View>
      ) : (
        <>
          {/* =====================================
              TICKET NUMBER
          ===================================== */}

          <Text
            selectable
            style={[
              styles.number,
              compact && styles.numberCompact,
              isMobile && styles.numberMobile,
            ]}
            accessibilityRole="header"
            accessibilityLabel={
              `Now serving ticket ${ticket.short_ticket_number}`
            }
          >
            {ticket.short_ticket_number}
          </Text>

          {/* =====================================
              TICKET HOLDER
          ===================================== */}

          <Holder
            holder={ticket.holder}
            styles={styles}
            compact={compact}
          />

          {/* =====================================
              TICKET STATUS AND TIMER
          ===================================== */}

          <View
            style={[
              styles.meta,
              isMobile && styles.metaMobile,
            ]}
          >
            <StatusBadge status={BADGE_FOR[state]} />

            {isInService ? (
              <Text style={styles.verified}>
                {CURRENT_TICKET_COPY.arrivalVerified}
              </Text>
            ) : (
              <View style={styles.timerGroup}>
                <Text
                  style={[
                    styles.countdown,
                    isExpired && styles.danger,
                  ]}
                  accessibilityLabel={
                    isExpired
                      ? 'Grace period expired'
                      : `Grace period remaining: ${formatCountdown(remainingSeconds)}`
                  }
                >
                  {formatCountdown(remainingSeconds)}
                </Text>

                {isExpired && (
                  <Text
                    style={[
                      styles.verified,
                      styles.danger,
                    ]}
                  >
                    {CURRENT_TICKET_COPY.expired}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Announce a change in ticket state,
              rather than announcing every second
              of the countdown. */}
          <Text
            style={styles.srOnly}
            accessibilityLiveRegion="polite"
          >
            {isExpired
              ? 'Ticket grace period has expired. Staff may mark No-Show.'
              : isInService
                ? 'Ticket is verified and in service.'
                : 'Ticket has been called.'}
          </Text>
        </>
      )}

      {/* =========================================
          ACTION BUTTONS
      ========================================= */}

      <View style={styles.actions}>
        {actions.map((row, index) => (
          <View
            key={index}
            style={[
              styles.actionRow,
              compact && styles.actionRowCompact,
            ]}
          >
            {row.map(
              ({
                label,
                onPress,
                enabled,
                type,
              }) => (
                <ActionButton
                  key={label}
                  label={label}
                  onPress={onPress}
                  disabled={!enabled}
                  type={type}
                  style={[
                    styles.action,
                    compact && styles.actionCompact,
                  ]}
                />
              ),
            )}
          </View>
        ))}
      </View>

      {/* =========================================
          NO-SHOW GUIDANCE
      ========================================= */}

      {isCalled && (
        <View
          style={styles.tooltip}
          accessibilityRole="note"
        >
          <Text style={styles.tooltipText}>
            {CURRENT_TICKET_COPY.noShowTooltip}
          </Text>
        </View>
      )}
    </View>
  );
}

// =====================================================
// TICKET HOLDER
// =====================================================

function Holder({
  holder,
  styles,
  compact,
}) {
  const detail =
    holder.program ??
    GUEST_TYPE_LABEL[holder.guest_type];

  const initial =
    holder.name?.charAt(0) ?? '?';

  return (
    <View style={styles.holder}>
      <View
        style={styles.avatar}
        importantForAccessibility="no"
      >
        <Text style={styles.avatarText}>
          {initial}
        </Text>
      </View>

      <View
        style={[
          styles.identity,
          compact && styles.identityCompact,
        ]}
      >
        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {holder.name}
        </Text>

        <Text
          style={styles.idLine}
          selectable
        >
          {[holder.id_number, detail].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const makeStyles = (c) =>
  StyleSheet.create({
    panel: {
      gap: 15,
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,
      minWidth: 0,
    },

    panelExpired: {
      borderWidth: 2,
      borderColor: c.error,
      padding: 23,
    },

    panelCompact: {
      padding: 20,
      gap: 14,
    },

    panelMobile: {
      padding: 16,
      gap: 12,
    },

    eyebrow: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.slate,
    },

    emptyContent: {
      gap: 8,
      minWidth: 0,
    },

    emptyTitle: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: 20,
      color: c.ink,
    },

    emptyTitleMobile: {
      fontSize: 18,
    },

    emptyBody: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      lineHeight: 22,
      color: c.slate,
    },

    number: {
      fontFamily: STAFF_FONT.monoBold,
      fontSize: 56,
      lineHeight: 66,
      color: c.ink,
      flexShrink: 1,
    },

    numberCompact: {
      fontSize: 44,
      lineHeight: 54,
    },

    numberMobile: {
      fontSize: 38,
      lineHeight: 48,
    },

    holder: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minWidth: 0,
    },

    avatar: {
      width: 36,
      height: 36,
      borderRadius: RADII.full,
      backgroundColor: c.inverse,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    avatarText: {
      fontFamily: STAFF_FONT.button,
      fontSize: TYPOGRAPHY.size.base,
      color: c.onInverse,
    },

    identity: {
      flex: 1,
      gap: 4,
      minWidth: 0,
    },

    identityCompact: {
      gap: 5,
    },

    name: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.lg,
      color: c.ink,
      flexShrink: 1,
    },

    idLine: {
      fontFamily: STAFF_FONT.mono,
      fontSize: 13,
      lineHeight: 19,
      color: c.slate,
      flexShrink: 1,
    },

    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      minWidth: 0,
    },

    metaMobile: {
      alignItems: 'flex-start',
      gap: 10,
    },

    timerGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },

    countdown: {
      fontFamily: STAFF_FONT.monoBold,
      fontSize: 22,
      color: c.ink,
    },

    verified: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.base,
      color: c.slate,
      flexShrink: 1,
    },

    danger: {
      color: c.error,
    },

    actions: {
      gap: 12,
      minWidth: 0,
    },

    actionRow: {
      flexDirection: 'row',
      gap: 16,
      minWidth: 0,
    },

    actionRowCompact: {
      flexDirection: 'column',
      gap: 10,
    },

    action: {
      flex: 1,
      minWidth: 0,
    },

    actionCompact: {
      flex: 0,
      width: '100%',
      minHeight: 44,
    },

    tooltip: {
      alignSelf: 'stretch',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: RADII.md,
      backgroundColor: c.inverse,
    },

    tooltipText: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.sm,
      lineHeight: 19,
      color: c.onInverse,
    },

    srOnly: {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      opacity: 0,
    },
  });
