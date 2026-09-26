import { Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@/theme/theme';

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

      <Pressable
        style={({ pressed }) => [
          styles.manualButton,
          pressed && styles.manualButtonPressed,
        ]}
        onPress={() => {}}
      >
        <Text style={styles.manualButtonText}>
          Enter code manually
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 64,
  },

  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 24,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.ink,
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
    borderColor: theme.colors.gold,
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
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
  },

  manualButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  manualButtonPressed: {
    opacity: 0.75,
  },

  manualButtonText: {
    color: theme.colors.paper,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
  },
});
