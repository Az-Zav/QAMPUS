import { STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// Figma Staff/EmptyState — pass one of EMPTY_COPY's contexts ({ title, body }).
export default function EmptyState({ title, body }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { alignSelf: 'stretch', alignItems: 'center', gap: 6, paddingVertical: 56 },
    title: { fontFamily: STAFF_FONT.semibold, fontSize: 19, color: c.ink, textAlign: 'center' },
    body: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.slate, textAlign: 'center' },
  });
