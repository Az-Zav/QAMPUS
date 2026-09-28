import theme from '@/theme/theme';
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: theme.colors.slate, fontSize: theme.typography.size.base, fontFamily: theme.typography.fontFamily.regular },
  rowValue: { color: theme.colors.ink, fontSize: theme.typography.size.base, fontFamily: theme.typography.fontFamily.medium },
});