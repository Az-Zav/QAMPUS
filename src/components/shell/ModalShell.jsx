import theme from '@/theme/theme';
import { Modal, Pressable } from 'react-native';

export default function ModalShell({ visible, onClose, dismissible = true, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: theme.overlay.scrim,
          justifyContent: 'center',
          padding: theme.spacing.xl,
        }}
        onPress={dismissible ? onClose : undefined}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.paper,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.xl,
            ...theme.elevation.lg,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}