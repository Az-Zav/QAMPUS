import EmptyState from '@/components/shell/EmptyState';
import { EMPTY_COPY, QUEUE_COPY, RADII, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { formatClock24 } from '@qampus/core/format';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Figma Staff/WaitingTable — FIFO order, short ticket form (R-08a). The FIFO candidate carries a
// Gold stroke plus a NEXT chip, never colour alone. Override on every row opens WM01.
export default function WaitingTable({ tickets, canOverride, onOverride, style }) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.table, style]}>
      <Text style={styles.heading}>{QUEUE_COPY.waiting}</Text>
      {tickets.length === 0 ? (
        <EmptyState {...EMPTY_COPY.noOneWaiting} />
      ) : (
        tickets.map((ticket, i) => (
          <WaitingRow
            key={ticket.id}
            ticket={ticket}
            position={i + 1}
            isNext={i === 0}
            canOverride={canOverride}
            onOverride={() => onOverride(ticket)}
            styles={styles}
          />
        ))
      )}
    </View>
  );
}

function WaitingRow({ ticket, position, isNext, canOverride, onOverride, styles }) {
  return (
    <View style={[styles.row, isNext && styles.rowNext]}>
      <View style={styles.pos}>
        <Text style={styles.posText}>{position}</Text>
      </View>
      <Text style={styles.number}>{ticket.short_ticket_number}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {ticket.holder.name}
      </Text>
      <Text style={styles.joined}>{formatClock24(ticket.joined_at)}</Text>
      {isNext && (
        <View style={styles.nextChip}>
          <Text style={styles.nextText}>{QUEUE_COPY.next}</Text>
        </View>
      )}
      <Pressable
        onPress={onOverride}
        disabled={!canOverride}
        accessibilityRole="button"
        accessibilityLabel={`${QUEUE_COPY.override} ${ticket.short_ticket_number}`}
        accessibilityHint={canOverride ? undefined : QUEUE_COPY.overrideBusy}
        accessibilityState={{ disabled: !canOverride }}
        style={({ hovered }) => [styles.override, !canOverride && styles.disabled, canOverride && hovered && styles.hover]}
      >
        <Text style={styles.overrideText}>{QUEUE_COPY.override}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    table: { gap: 8 },
    heading: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, color: c.slate },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 17,
      paddingHorizontal: 17,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,
    },
    // 2px Gold stroke; padding drops by 1 so rows keep the same height
    rowNext: { borderWidth: 2, borderColor: c.gold, paddingHorizontal: 16, paddingVertical: 13 },
    pos: {
      width: 26,
      height: 26,
      borderRadius: RADII.full,
      backgroundColor: c.inverse,
      alignItems: 'center',
      justifyContent: 'center',
    },
    posText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.size.base, color: c.onInverse },
    number: { fontFamily: STAFF_FONT.mono, fontSize: 17, color: c.ink },
    name: { flex: 1, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 17, color: c.ink },
    joined: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.slate },
    nextChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADII.full, backgroundColor: c.gold },
    nextText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.size.sm, color: c.onGold },
    override: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: RADII.full,
      borderWidth: 1,
      borderColor: c.slate,
    },
    hover: { backgroundColor: c.disabledBg },
    disabled: { opacity: 0.35 },
    overrideText: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.base, color: c.ink },
  });
