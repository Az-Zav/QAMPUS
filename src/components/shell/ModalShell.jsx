import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, OVERLAY, RADII, SPACING, TYPOGRAPHY } from '@/constants';

export default function ModalShell({ visible, onClose, showClose = true, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {showClose && (
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: OVERLAY.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.paper,
    borderRadius: RADII.xxl,
    padding: SPACING.xxl,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: COLORS.surface,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeText: {
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
});