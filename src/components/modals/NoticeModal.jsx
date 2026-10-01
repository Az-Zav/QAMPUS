import Button from '@/components/primitives/Button';
import ModalShell from '@/components/modals/ModalShell';
import { ButtonType, ModalTone } from '@/constants';

// One-way informational modal (joined, banned, cutoff, scan result...).
// Omit buttonLabel to render no button; the close control still dismisses it.
export default function NoticeModal({
  visible,
  tone = ModalTone.DEFAULT,
  icon = 'information-circle-outline',
  title,
  body,
  rows,
  buttonLabel,
  onClose,
}) {
  const destructive = tone === ModalTone.DESTRUCTIVE;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      tone={tone}
      icon={icon}
      title={title}
      subtitle={body}
      rows={rows}
      actions={
        !!buttonLabel && (
          <Button
            type={destructive ? ButtonType.DESTRUCTIVE : ButtonType.PRIMARY}
            label={buttonLabel}
            onPress={onClose}
          />
        )
      }
    />
  );
}
