import { STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { Button } from '@qampus/ui';
import { StyleSheet } from 'react-native';

// Figma Button on staff surfaces: the shared pill with a Space Grotesk label.
// `tall` is the 54px modal/record-row size; the default is 48px.
export default function ActionButton({ tall = false, style, ...props }) {
  return <Button {...props} style={[tall && styles.tall, style]} labelStyle={styles.label} />;
}

const styles = StyleSheet.create({
  tall: { height: 54 },
  label: { fontFamily: STAFF_FONT.button, fontSize: TYPOGRAPHY.size.md },
});
