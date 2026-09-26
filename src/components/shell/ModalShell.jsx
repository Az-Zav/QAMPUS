import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ModalShell({ visible, onClose, showClose = true, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {showClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
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
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#F7F5F0',
    borderRadius: 20,
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute', top: 14, right: 14,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: '#00000020',
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  closeText: { fontSize: 14, color: '#333' },
});