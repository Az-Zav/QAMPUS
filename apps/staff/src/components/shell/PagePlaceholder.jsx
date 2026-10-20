import { SPACING, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// Stand-in for screens that are scaffolded but not built yet.
export default function PagePlaceholder({ title, figma }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.note}>Not built yet — Figma: {figma}</Text>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { gap: SPACING.xs, paddingVertical: SPACING.xxl },
    title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.size.xl, color: c.ink },
    note: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.base, color: c.slate },
  });
