import Outage from '@/components/shell/Outage';
import TopBar from '@/components/shell/TopBar';
import { useThemedStyles } from '@/hooks';
import { Slot, useGlobalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

// Signed-in console shell: TopBar over the active screen (each screen owns its ConsolePage scroll).
// When the backend can't be reached every console screen shows the shared Outage state (R-36).
export default function ConsoleLayout() {
  const styles = useThemedStyles(makeStyles);
  // Dev aid until real polling: ?outage=1 on any console route shows the outage state
  const { outage } = useGlobalSearchParams();

  if (outage) return <Outage />;

  return (
    <View style={styles.screen}>
      <TopBar />
      <Slot />
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.paper },
  });
