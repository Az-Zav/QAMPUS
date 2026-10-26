import { useTheme, useThemedStyles } from '@/hooks';
import { Tabs } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

// Room kept under each tab for the floating bar. It is the scene's own padding (not the wrapper's) so a screen can
// opt out: Scan draws its camera all the way under the bar.
const SCENE_BOTTOM_PADDING = 90;

// Home | Scan | Queue in bar order, so switching slides left or right by position.
// The bar itself is the shared BottomNav in (app)/_layout.
export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();

  // progress: -1 left of the active tab, 0 active, 1 right of it
  const slide = ({ current }) => ({
    sceneStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-width, 0, width],
          }),
        },
      ],
    },
  });

  return (
    <View style={styles.content}>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          sceneStyleInterpolator: slide,
          transitionSpec: { animation: 'timing', config: { duration: 250 } },
          sceneStyle: { backgroundColor: colors.paper, paddingBottom: SCENE_BOTTOM_PADDING },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="scan" options={{ sceneStyle: { backgroundColor: colors.paper, paddingBottom: 0 } }} />
        <Tabs.Screen name="queue" />
      </Tabs>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: c.paper,
  },
});
