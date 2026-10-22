import { TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// W04/W05 head: 35px title + context line on the left, search or filters on the right.
export default function PageHeader({ title, subtitle, children }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.head}>
      <View style={styles.titles}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    head: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      zIndex: 10,
    },
    titles: { gap: 4, flexShrink: 1 },
    title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 35, color: c.ink },
    subtitle: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 17, color: c.slate },
  });
