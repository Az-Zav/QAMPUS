import { RADII } from '@/constants';
import { View } from 'react-native';

// Small status dot (JoinIndicator, StatusFooter "Live")
export default function Dot({ color, size = 8 }) {
  return <View style={{ width: size, height: size, borderRadius: RADII.full, backgroundColor: color }} />;
}
