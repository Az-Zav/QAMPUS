import theme from '@/theme/theme';
import { Pressable, Text, View } from 'react-native';

export default function BottomNav({ active, onNavigate }) {
  const tabs = ['home', 'queue', 'scan'];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: theme.colors.paper, ...theme.elevation.sm }}>
      {tabs.map((tab) => (
        <Pressable key={tab} onPress={() => onNavigate(tab)} style={{ flex: 1, padding: theme.spacing.md }}>
          <Text style={{ color: active === tab ? theme.colors.gold : theme.colors.slate }}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}