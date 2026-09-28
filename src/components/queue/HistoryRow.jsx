import { COLORS, HistoryStatus, IconSet, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryRow({ item }) {
  const statusStyles = {
    [HistoryStatus.COMPLETED]: {
      bg: withOpacity(COLORS.success, 0.12),
      text: COLORS.success,
      icon: 'checkmark-circle-outline',
      label: 'Completed',
    },
    [HistoryStatus.CANCELLED]: {
      bg: COLORS.disabledBg,
      text: COLORS.slate,
      icon: 'close-circle-outline',
      label: 'Cancelled',
    },
    [HistoryStatus.NO_SHOW]: {
      bg: withOpacity(COLORS.error, 0.12),
      text: COLORS.error,
      icon: 'person-remove-outline',
      label: 'No-show',
    },
    [HistoryStatus.CANCELLED_BY_OFFICE]: {
      bg: COLORS.disabledBg,
      text: COLORS.slate,
      icon: 'close-circle-outline',
      label: 'Cancelled by office',
    },
  }[item.status] ?? {
    bg: COLORS.disabledBg,
    text: COLORS.slate,
    icon: 'time-outline',
    label: item.status,
  };

  return (
    <View style={styles.historyRow}>
      <View style={styles.historyIcon}>
        <IconSet name="ticket-outline" size={18} color={COLORS.ink} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTicket}>{item.ticket ?? item.ticket_number}</Text>
        <Text style={styles.historyOffice}>{item.office ?? item.office_name}</Text>
        <Text style={styles.historyDate}>{item.date ?? item.joined_at}</Text>
      </View>
      <View style={[styles.historyStatus, { backgroundColor: statusStyles.bg }]}>
        <IconSet name={statusStyles.icon} size={12} color={statusStyles.text} />
        <Text style={[styles.historyStatusText, { color: statusStyles.text }]}>
          {statusStyles.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  historyInfo: {
    flex: 1,
    minWidth: 0,
  },
  historyTicket: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
  },
  historyOffice: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: 2,
  },
  historyDate: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 10,
    marginTop: 2,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.full,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: SPACING.xs,
  },
  historyStatusText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 9,
    marginLeft: 3,
  },
});
