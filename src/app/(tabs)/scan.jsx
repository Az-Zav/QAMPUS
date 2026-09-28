import { COLORS, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function Scan() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Check In</Text>

      <View style={styles.scannerArea}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      <Text style={styles.instruction}>
        Align the QR code within the frame
      </Text>

      <TextInput
        style={styles.codeInput}
        placeholder="Enter code manually"
        placeholderTextColor={COLORS.white}
        keyboardType="number-pad"
        autoCapitalize="none"
        autoCorrect={false}
        textAlign="center"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 64,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 24,
    color: COLORS.ink,
    marginBottom: 40,
  },
  scannerArea: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 230,
    height: 230,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderColor: COLORS.gold,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instruction: {
    marginTop: 24,
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
    textAlign: 'center',
  },
  codeInput: {
    width: '88%',
    height: 64,
    marginTop: 28,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    borderRadius: RADII.huge ?? 32,
    backgroundColor: COLORS.ink,
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    textAlign: 'center',
  },
});
