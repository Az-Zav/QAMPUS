import BrandLockup from '@/components/brand/BrandLockup';
import { CONTENT_MAX_WIDTH, PAGE_GUTTER, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// Full-page Paper message with the lockup top-left: W02 Not Assigned and Staff/Outage share this layout.
export default function CenteredMessage({ Icon, title, body, children }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.screen}>
      <View style={styles.brandRow}>
        <BrandLockup />
      </View>
      <View style={styles.center}>
        <View style={styles.content}>
          <Icon size={44} color={colors.slate} />
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
          {children}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.paper, paddingHorizontal: PAGE_GUTTER },
    brandRow: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingTop: 64 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 104 },
    content: { width: '100%', maxWidth: 760, alignItems: 'center', gap: 20 },
    title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 31, color: c.ink, textAlign: 'center' },
    body: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 19, lineHeight: 28, color: c.slate, textAlign: 'center' },
  });
