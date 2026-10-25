import ActionNotice from '@/components/shell/ActionNotice';
import StatusFooter from '@/components/shell/StatusFooter';
import { CONTENT_MAX_WIDTH, PAGE_GUTTER } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { ScrollView, StyleSheet, View } from 'react-native';

// Body of a signed-in console screen: a centred 1520px column that scrolls under the TopBar,
// with the StatusFooter pinned to the bottom of the viewport when the content is short.
export default function ConsolePage({ children, footer, topSpacing = 36 }) {
  const styles = useThemedStyles(makeStyles);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.column, styles.body, { paddingTop: topSpacing }]}>
        <ActionNotice />
        {children}
      </View>
      <View style={[styles.column, styles.footer]}>
        <StatusFooter {...footer} />
      </View>
    </ScrollView>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: PAGE_GUTTER },
    column: { width: '100%', maxWidth: CONTENT_MAX_WIDTH },
    body: { flexGrow: 1, gap: 24, paddingBottom: 36 },
    footer: { paddingBottom: 56 },
  });
