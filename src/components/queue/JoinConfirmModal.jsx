import Button from '@/components/primitives/Button';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType } from '@/constants';

// office: view from toOfficeView()
export default function JoinConfirmModal({ visible, office, onClose, onConfirm }) {
  return (
    <ModalShell
      visible={visible && !!office}
      onClose={onClose}
      icon="ticket-outline"
      title="Join this queue?"
      subtitle={office?.name}
      rows={
        office
          ? [
              { label: 'Estimated wait', value: `about ${office.estimatedWaitMinutes} min` },
              { label: 'People waiting', value: office.waiting },
            ]
          : null
      }
      actions={
        <>
          <Button label="Confirm join" type={ButtonType.PRIMARY} onPress={onConfirm} />
          <Button label="Cancel" type={ButtonType.SECONDARY} onPress={onClose} />
        </>
      }
    />
  );
}
