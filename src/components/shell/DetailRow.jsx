import { COLORS, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xxs,
  },
  rowLabel: {
    color: COLORS.slate,
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  rowValue: {
    color: COLORS.ink,
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});