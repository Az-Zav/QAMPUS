
import ActionButton from '@/components/primitives/ActionButton';
import StatusBadge from '@/components/primitives/StatusBadge';

import {
  ACTIVITY_ACTION_LABEL,
  ACTIVITY_LOG_COPY,
  ButtonType,
  OFFENSES_COPY,
  OFFENSE_TYPE_LABEL,
  STAFF_FONT,
  STATUS_BADGE_FOR,
  TYPOGRAPHY,
} from '@/constants';

import { useThemedStyles } from '@/hooks';

import {
  formatClock24,
  formatDayMonthYear,
} from '@qampus/core/format';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF — RECORD ROW
//
// Shared record component for:
// - Activity Log
// - Offenses
//
// Supports:
// - Ticket numbers
// - Action titles
// - Multiple detail lines
// - Status transitions
// - Offense revocation
// =====================================================

export default function RecordRow({
  number,
  title,
  lines = [],
  trail,
}) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      <View style={styles.main}>

        {/* =========================================
            RECORD IDENTIFIER AND TITLE
        ========================================= */}

        <View style={styles.lead}>
          <Text style={styles.number}>
            {number}
          </Text>

          <Text style={styles.title}>
            {title}
          </Text>
        </View>

        {/* =========================================
            RECORD DETAILS
        ========================================= */}

        {lines.filter(Boolean).map((line, index) => (
          <Text
            key={`${index}-${line}`}
            style={styles.line}
          >
            {line}
          </Text>
        ))}
      </View>

      {trail}
    </View>
  );
}

// =====================================================
// ACTIVITY LOG REASON FORMATTER
//
// Supports both:
//
// 1. New structured reason_details records
// 2. Existing plain-text reason records
//
// This keeps older mock activity entries readable.
// =====================================================

function getActivityDetails(entry) {
  const details = entry.reason_details;

  // Legacy activity records have no structured data.
  if (!details) {
    return [
      entry.reason
        ? ACTIVITY_LOG_COPY.reason(entry.reason)
        : null,

      entry.note || null,
    ].filter(Boolean);
  }

  const lines = [];

  // =====================================================
  // MULTIPLE SELECTED REASONS
  // =====================================================

  const labels = Array.isArray(details.reasonLabels)
    ? details.reasonLabels.filter(Boolean)
    : [];

  if (labels.length > 0) {
    lines.push(
      `Reasons: ${labels.join('; ')}`,
    );
  } else if (entry.reason) {
    // Fallback when structured labels are unavailable.
    lines.push(
      ACTIVITY_LOG_COPY.reason(entry.reason),
    );
  }

  // =====================================================
  // OPTIONAL ADDITIONAL NOTES
  // =====================================================

  const additionalNotes = String(
    details.additionalNotes ?? '',
  ).trim();

  if (additionalNotes) {
    lines.push(
      `Additional notes: ${additionalNotes}`,
    );
  }

  // =====================================================
  // EXISTING ENTRY NOTE
  //
  // Kept separate from additional notes.
  // Examples:
  // - Verified by ID
  // - Offense holder name
  // =====================================================

  if (entry.note) {
    lines.push(entry.note);
  }

  return lines;
}

// =====================================================
// ACTIVITY LOG ROW
//
// Displays:
// - Ticket number or fallback
// - Activity type
// - Timestamp
// - Staff member / actor
// - All selected reasons
// - Optional additional notes
// - Previous and new ticket statuses
// =====================================================

export function LogRow({ entry }) {
  const styles = useThemedStyles(makeStyles);

  const detailLines = getActivityDetails(entry);

  const hasTransition =
    entry.from && entry.to;

  return (
    <RecordRow
      number={
        entry.ticket_number ??
        ACTIVITY_LOG_COPY.noTicket
      }

      title={
        ACTIVITY_ACTION_LABEL[entry.action] ??
        entry.action
      }

      lines={[
        `${formatClock24(entry.created_at)} · ${entry.actor}`,
        ...detailLines,
      ]}

      trail={
        hasTransition ? (
          <View style={styles.transition}>
            <StatusBadge
              status={
                STATUS_BADGE_FOR[entry.from]
              }
            />

            <Text style={styles.arrow}>
              →
            </Text>

            <StatusBadge
              status={
                STATUS_BADGE_FOR[entry.to]
              }
            />
          </View>
        ) : null
      }
    />
  );
}

// =====================================================
// OFFENSE RECORD ROW
//
// Fix #2 preserved:
// - Active offense history
// - Revoked offenses remain visible
// - Ban status indicator
// - Revocation action
// =====================================================

export function OffenseRow({
  offense,
  onRevoke,
}) {
  const styles = useThemedStyles(makeStyles);

  const summary = [
    OFFENSE_TYPE_LABEL[offense.type],
    formatDayMonthYear(offense.created_at),
    offense.resulted_in_ban &&
      OFFENSES_COPY.causedBan,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <RecordRow
      number={offense.ticket_number}
      title={offense.holder.name}
      lines={[summary]}

      trail={
        offense.revoked_at ? (
          <Text style={styles.revoked}>
            {OFFENSES_COPY.revoked}
          </Text>
        ) : (
          <ActionButton
            tall
            label={OFFENSES_COPY.revoke}
            type={ButtonType.SECONDARY}
            onPress={onRevoke}
            accessibilityLabel={
              `${OFFENSES_COPY.revoke} ${offense.ticket_number}`
            }
            style={styles.revoke}
          />
        )
      }
    />
  );
}

// =====================================================
// QAMPUS THEME STYLES
//
// Preserves the existing RecordRow styling.
// =====================================================

const makeStyles = (c) =>
  StyleSheet.create({
    row: {
      minHeight: 84,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,
    },

    main: {
      flex: 1,
      gap: 7,
    },

    lead: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 14,
    },

    number: {
      fontFamily: STAFF_FONT.mono,
      fontSize: TYPOGRAPHY.size.lg,
      color: c.ink,
    },

    title: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.lg,
      color: c.ink,
    },

    line: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      color: c.slate,
    },

    transition: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    arrow: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: 17,
      color: c.slate,
    },

    revoke: {
      width: 130,
    },

    revoked: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.md,
      color: c.slate,
    },
  });
