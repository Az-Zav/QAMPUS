import { useTheme, useThemedStyles } from '@/hooks';
import { Tabs } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

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
          sceneStyle: { backgroundColor: colors.paper },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="scan" />
        <Tabs.Screen name="queue" />
      </Tabs>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 90,
    backgroundColor: c.paper,
  },
});
