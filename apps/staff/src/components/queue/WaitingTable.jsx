
import EmptyState from '@/components/shell/EmptyState';

import {
  EMPTY_COPY,
  QUEUE_COPY,
  RADII,
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';

import { useThemedStyles } from '@/hooks';

import { formatClock24 } from '@qampus/core/format';

import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF — WAITING TABLE
//
// Fix #8: Responsive layout and accessibility.
//
// Preserves:
// - FIFO ordering
// - NEXT ticket indicator
// - FIFO override action
// - Existing reason-selection workflow
//
// No queue business logic is changed.
// =====================================================

// Compact layout for narrow screens.
const COMPACT_BREAKPOINT = 680;

export default function WaitingTable({
  tickets,
  canOverride,
  onOverride,
  style,
}) {
  const styles = useThemedStyles(makeStyles);

  const { width } = useWindowDimensions();

  const compact = width < COMPACT_BREAKPOINT;

  return (
    <View style={[styles.table, style]}>
      <Text
        style={styles.heading}
        accessibilityRole="header"
      >
        {QUEUE_COPY.waiting}
      </Text>

      {tickets.length === 0 ? (
        <EmptyState {...EMPTY_COPY.noOneWaiting} />
      ) : (
        <View style={styles.list}>
          {tickets.map((ticket, index) => (
            <WaitingRow
              key={ticket.id}
              ticket={ticket}
              position={index + 1}
              isNext={index === 0}
              compact={compact}
              canOverride={canOverride}
              onOverride={() => onOverride(ticket)}
              styles={styles}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// =====================================================
// RESPONSIVE TICKET ROW
// =====================================================

function WaitingRow({
  ticket,
  position,
  isNext,
  compact,
  canOverride,
  onOverride,
  styles,
}) {
  const joinedTime = formatClock24(
    ticket.joined_at,
  );

  const overrideDisabled =
    !canOverride || isNext;

  // The FIFO candidate must be called
  // through the normal Call Next action.
  // Priority override is only for other tickets.
  const overrideHint = isNext
    ? 'This ticket is already next in line. Use Call Next.'
    : !canOverride
      ? QUEUE_COPY.overrideBusy
      : 'Call this ticket ahead of FIFO order. A reason is required.';

  return (
    <View
      style={[
        styles.row,
        isNext && styles.rowNext,
        compact && styles.rowCompact,
      ]}
    >
      {/* ==========================================
          POSITION AND TICKET IDENTIFIER
      ========================================== */}

      <View
        style={[
          styles.identityGroup,
          compact && styles.identityCompact,
        ]}
      >
        <View style={styles.pos}>
          <Text style={styles.posText}>
            {position}
          </Text>
        </View>

        <Text
          style={styles.number}
          selectable
        >
          {ticket.short_ticket_number}
        </Text>

        {isNext && (
          <View style={styles.nextChip}>
            <Text style={styles.nextText}>
              {QUEUE_COPY.next}
            </Text>
          </View>
        )}
      </View>

      {/* ==========================================
          HOLDER AND JOIN TIME
      ========================================== */}

      <View
        style={[
          styles.details,
          compact && styles.detailsCompact,
        ]}
      >
        <Text
          style={styles.name}
          numberOfLines={compact ? 2 : 1}
          accessibilityLabel={
            `Ticket holder: ${ticket.holder.name}`
          }
        >
          {ticket.holder.name}
        </Text>

        <Text
          style={styles.joined}
          accessibilityLabel={
            `Joined at ${joinedTime}`
          }
        >
          {compact
            ? `Joined: ${joinedTime}`
            : joinedTime}
        </Text>
      </View>

      {/* ==========================================
          FIFO OVERRIDE ACTION
      ========================================== */}

      <Pressable
        onPress={onOverride}
        disabled={overrideDisabled}
        accessibilityRole="button"
        accessibilityLabel={
          `${QUEUE_COPY.override} ${ticket.short_ticket_number}`
        }
        accessibilityHint={overrideHint}
        accessibilityState={{
          disabled: overrideDisabled,
        }}
        style={({ hovered, pressed }) => [
          styles.override,
          compact && styles.overrideCompact,
          overrideDisabled && styles.disabled,
          !overrideDisabled &&
            (hovered || pressed) &&
            styles.hover,
        ]}
      >
        <Text style={styles.overrideText}>
          {QUEUE_COPY.override}
        </Text>
      </Pressable>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const makeStyles = (c) =>
  StyleSheet.create({
    table: {
      gap: 8,
      minWidth: 0,
    },

    heading: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.md,
      color: c.slate,
    },

    list: {
      gap: 8,
      minWidth: 0,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 14,

      paddingHorizontal: 17,
      paddingVertical: 14,

      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,

      minWidth: 0,
    },

    rowNext: {
      borderWidth: 2,
      borderColor: c.gold,
      paddingHorizontal: 16,
      paddingVertical: 13,
    },

    rowCompact: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 12,
    },

    identityGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: 0,
    },

    identityCompact: {
      flexWrap: 'wrap',
    },

    pos: {
      width: 26,
      height: 26,
      borderRadius: RADII.full,
      backgroundColor: c.inverse,
      alignItems: 'center',
      justifyContent: 'center',
    },

    posText: {
      fontFamily:
        TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.size.base,
      color: c.onInverse,
    },

    number: {
      fontFamily: STAFF_FONT.mono,
      fontSize: 17,
      color: c.ink,
    },

    nextChip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: RADII.full,
      backgroundColor: c.gold,
    },

    nextText: {
      fontFamily:
        TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.onGold,
    },

    details: {
      flex: 1,
      minWidth: 140,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    detailsCompact: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 4,
      minWidth: 0,
    },

    name: {
      flexShrink: 1,
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: 17,
      color: c.ink,
    },

    joined: {
      fontFamily:
        TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      color: c.slate,
    },

    override: {
      paddingHorizontal: 14,
      minHeight: 44,
      paddingVertical: 9,

      borderRadius: RADII.full,
      borderWidth: 1,
      borderColor: c.slate,

      alignItems: 'center',
      justifyContent: 'center',
    },

    overrideCompact: {
      alignSelf: 'stretch',
    },

    hover: {
      backgroundColor: c.disabledBg,
    },

    disabled: {
      opacity: 0.35,
    },

    overrideText: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.base,
      color: c.ink,
    },
  });
