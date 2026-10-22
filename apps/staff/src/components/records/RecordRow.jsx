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
import { formatClock24, formatDayMonthYear } from '@qampus/core/format';
import { StyleSheet, Text, View } from 'react-native';

// Figma Staff/RecordRow — card-style row for W04 and W05. Ticket numbers are FULL form (R-08a).
export default function RecordRow({ number, title, lines, trail }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <View style={styles.lead}>
          <Text style={styles.number}>{number}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {lines.filter(Boolean).map((line) => (
          <Text key={line} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>
      {trail}
    </View>
  );
}

// Kind=Log — from→to badge pair only for ticket transitions; queue-level actions have none
export function LogRow({ entry }) {
  const styles = useThemedStyles(makeStyles);
  const detail = entry.reason ? ACTIVITY_LOG_COPY.reason(entry.reason) : entry.note;

  return (
    <RecordRow
      number={entry.ticket_number ?? ACTIVITY_LOG_COPY.noTicket}
      title={ACTIVITY_ACTION_LABEL[entry.action]}
      lines={[`${formatClock24(entry.created_at)} · ${entry.actor}`, detail]}
      trail={
        entry.from && entry.to ? (
          <View style={styles.transition}>
            <StatusBadge status={STATUS_BADGE_FOR[entry.from]} />
            <Text style={styles.arrow}>→</Text>
            <StatusBadge status={STATUS_BADGE_FOR[entry.to]} />
          </View>
        ) : null
      }
    />
  );
}

// Kind=OffenseActive | OffenseRevoked
export function OffenseRow({ offense, onRevoke }) {
  const styles = useThemedStyles(makeStyles);
  const summary = [
    OFFENSE_TYPE_LABEL[offense.type],
    formatDayMonthYear(offense.created_at),
    offense.resulted_in_ban && OFFENSES_COPY.causedBan,
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
          <Text style={styles.revoked}>{OFFENSES_COPY.revoked}</Text>
        ) : (
          <ActionButton
            tall
            label={OFFENSES_COPY.revoke}
            type={ButtonType.SECONDARY}
            onPress={onRevoke}
            accessibilityLabel={`${OFFENSES_COPY.revoke} ${offense.ticket_number}`}
            style={styles.revoke}
          />
        )
      }
    />
  );
}

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
    main: { flex: 1, gap: 7 },
    lead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14 },
    number: { fontFamily: STAFF_FONT.mono, fontSize: TYPOGRAPHY.size.lg, color: c.ink },
    title: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.lg, color: c.ink },
    line: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.slate },
    transition: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    arrow: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 17, color: c.slate },
    revoke: { width: 130 },
    revoked: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, color: c.slate },
  });
