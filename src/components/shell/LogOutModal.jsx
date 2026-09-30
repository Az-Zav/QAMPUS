import ConfirmModal from '@/components/shell/ConfirmModal';
import { LOG_OUT_COPY, ModalTone } from '@/constants';

// M09 LogOut — triggered from the Profile menu. Staying signed in is the safe,
// primary action; confirming sends the user back to Login.
export default function LogOutModal({ visible, onConfirm, onClose }) {
  return (
    <ConfirmModal
      visible={visible}
      tone={ModalTone.DEFAULT}
      icon="log-out-outline"
      title={LOG_OUT_COPY.title}
      body={LOG_OUT_COPY.body}
      cancelLabel={LOG_OUT_COPY.cancelLabel}
      confirmLabel={LOG_OUT_COPY.confirmLabel}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
