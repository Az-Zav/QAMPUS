import { SPACING, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

export default function DetailRow({ label, value }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xxs,
  },
  rowLabel: {
    color: c.slate,
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  rowValue: {
    color: c.ink,
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});