import ModalShell from '@/components/modals/ModalShell';
import { Button } from '@qampus/ui';
import { ButtonType, MODAL_COPY } from '@/constants';

const COPY = MODAL_COPY.joinConfirm;

// office: view from toOfficeView(); busy disables the buttons while the join is in flight
export default function JoinConfirmModal({ visible, office, busy = false, onClose, onConfirm }) {
  return (
    <ModalShell
      visible={visible && !!office}
      onClose={onClose}
      icon={COPY.icon}
      title={COPY.title}
      subtitle={office?.name}
      rows={
        office
          ? [
              { label: COPY.waitLabel, value: COPY.waitValue(office.estimatedWaitMinutes) },
              { label: COPY.waitingLabel, value: office.waiting },
            ]
          : null
      }
      actions={
        <>
          <Button label={COPY.confirmLabel} type={ButtonType.PRIMARY} onPress={onConfirm} disabled={busy} />
          <Button label={COPY.cancelLabel} type={ButtonType.SECONDARY} onPress={onClose} disabled={busy} />
        </>
      }
    />
  );
}
