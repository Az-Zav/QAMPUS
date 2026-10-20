import TopBar from '@/components/shell/TopBar';
import { CONTENT_MAX_WIDTH, PAGE_GUTTER } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Slot } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

// Signed-in console shell: TopBar over a centered, max-width content column.
export default function ConsoleLayout() {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.screen}>
      <TopBar />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.column}>
          <Slot />
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.paper },
    scroll: { flex: 1 },
    scrollContent: { alignItems: 'center', paddingHorizontal: PAGE_GUTTER, paddingVertical: PAGE_GUTTER },
    column: { width: '100%', maxWidth: CONTENT_MAX_WIDTH },
  });
