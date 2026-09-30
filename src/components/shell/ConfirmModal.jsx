import Button from '@/components/primitives/Button';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType, ModalTone } from '@/constants';

// Two-choice modal. The safe action (cancel) is always the primary button;
// the destructive tone paints the confirm button red (e.g. cancel a called ticket).
export default function ConfirmModal({
  visible,
  tone = ModalTone.DEFAULT,
  icon,
  title,
  body,
  rows,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}) {
  const destructive = tone === ModalTone.DESTRUCTIVE;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      showClose={false}
      tone={tone}
      icon={icon}
      title={title}
      subtitle={body}
      rows={rows}
      actions={
        <>
          <Button type={ButtonType.PRIMARY} label={cancelLabel} onPress={onClose} />
          <Button
            type={destructive ? ButtonType.DESTRUCTIVE : ButtonType.SECONDARY}
            label={confirmLabel}
            onPress={onConfirm}
          />
        </>
      }
    />
  );
}
