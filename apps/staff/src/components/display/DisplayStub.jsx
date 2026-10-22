import { STAFF_FONT } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

const NOTCH = 28;

// D01 queue strip ticket: rounded stub with a half-circle notch cut into each side.
// `cutout` is the strip colour behind it, so the notches read as holes.
export default function DisplayStub({ number, large = false, fill, text, cutout }) {
  const height = large ? 190 : 120;
  return (
    <View style={[styles.stub, { height, backgroundColor: fill }]}>
      <Text style={[styles.number, { fontSize: large ? 86 : 58, color: text }]}>{number}</Text>
      <View style={[styles.notch, styles.left, { top: (height - NOTCH) / 2, backgroundColor: cutout }]} />
      <View style={[styles.notch, styles.right, { top: (height - NOTCH) / 2, backgroundColor: cutout }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stub: { width: 400, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: STAFF_FONT.monoBold },
  notch: { position: 'absolute', width: NOTCH, height: NOTCH, borderRadius: NOTCH / 2 },
  left: { left: -NOTCH / 2 },
  right: { right: -NOTCH / 2 },
});
