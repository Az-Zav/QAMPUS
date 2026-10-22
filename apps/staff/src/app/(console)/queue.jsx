import StaffModal, { ModalField } from '@/components/modals/StaffModal';
import CurrentTicketPanel from '@/components/queue/CurrentTicketPanel';
import HeaderStrip from '@/components/queue/HeaderStrip';
import WaitingTable from '@/components/queue/WaitingTable';
import ConsolePage from '@/components/shell/ConsolePage';
import InlineBanner, { BannerTone } from '@/components/shell/InlineBanner';
import {
  CURRENT_PANEL_WIDTH,
  FOOTER_COPY,
  MODAL_COPY,
  QUEUE_COLUMNS_BREAKPOINT,
  QUEUE_COPY,
} from '@/constants';
import { useStaffOffice, useStaffQueue } from '@/hooks';
import { VerifyResult } from '@/providers/QueueProvider';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

// Which staff modal is up (WM01–WM07); modals replace one another and never stack
const QueueModal = Object.freeze({
  OVERRIDE: 'override',
  VERIFY: 'verify',
  NO_SHOW: 'noShow',
  COMPLETE: 'complete',
  CLOSE: 'close',
  CANCEL: 'cancel',
  CUTOFF: 'cutoff',
});

// W03 — Queue (states: Closed, ExpiredTicket, CutoffApproaching, EmptyWaiting)
export default function Queue() {
  const { width } = useWindowDimensions();
  const { office } = useStaffOffice();
  const queue = useStaffQueue();
  const [modal, setModal] = useState(null); // { type, ticket? }
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  const open = (type, ticket = null) => {
    setInput('');
    setError(null);
    setModal({ type, ticket });
  };
  const close = () => setModal(null);
  const run = (action) => () => {
    action();
    close();
  };

  const currentNumber = queue.current?.short_ticket_number;
  const modalProps = (() => {
    switch (modal?.type) {
      case QueueModal.OVERRIDE:
        return {
          ...MODAL_COPY.override(modal.ticket.short_ticket_number),
          onConfirm: run(() => queue.overrideCall(modal.ticket.id)),
        };
      case QueueModal.VERIFY: {
        const copy = MODAL_COPY.verifyById(currentNumber);
        return {
          ...copy,
          field: ModalField.ID,
          confirmDisabled: !input.trim(),
          onConfirm: () => {
            const result = queue.verifyById(input);
            if (result === VerifyResult.OK) close();
            else setError(result === VerifyResult.EXPIRED ? copy.expired : copy.noMatch);
          },
        };
      }
      case QueueModal.NO_SHOW:
        return { ...MODAL_COPY.markNoShow(currentNumber), destructive: true, onConfirm: run(queue.markNoShow) };
      case QueueModal.COMPLETE:
        return { ...MODAL_COPY.completeService(currentNumber), onConfirm: run(queue.completeService) };
      case QueueModal.CLOSE:
        return { ...MODAL_COPY.closeQueue(), destructive: true, onConfirm: run(queue.closeQueue) };
      case QueueModal.CANCEL:
        return {
          ...MODAL_COPY.cancelQueue(),
          field: ModalField.REASON,
          destructive: true,
          confirmDisabled: !input.trim(), // the reason is required (R-16)
          onConfirm: run(() => queue.cancelQueue(input.trim())),
        };
      case QueueModal.CUTOFF:
        return { ...MODAL_COPY.cutoffOverride(office), onConfirm: run(queue.overrideCutoff) };
      default:
        return null;
    }
  })();

  const sideBySide = width >= QUEUE_COLUMNS_BREAKPOINT;

  return (
    <ConsolePage
      footer={{
        center: FOOTER_COPY.queueSummary(office, queue.averageServiceMinutes),
        right: office.location,
      }}
    >
      {queue.cutoffWarningMinutes !== null && (
        <InlineBanner
          tone={BannerTone.WARNING}
          message={QUEUE_COPY.cutoffBanner(queue.cutoffWarningMinutes)}
          actionLabel={QUEUE_COPY.overrideCutoff}
          onAction={() => open(QueueModal.CUTOFF)}
        />
      )}

      <HeaderStrip
        manualCode={office.manual_code}
        waitingCount={queue.waiting.length}
        averageServiceMinutes={queue.averageServiceMinutes}
        isOpen={queue.isOpen}
        joiningOpen={queue.joiningOpen}
        cutoffReached={queue.cutoffReached}
        onOverrideCutoff={() => open(QueueModal.CUTOFF)}
        onOpenQueue={queue.openQueue}
        onCloseQueue={() => open(QueueModal.CLOSE)}
        onCancelQueue={() => open(QueueModal.CANCEL)}
      />

      <View style={[styles.columns, sideBySide && styles.columnsRow]}>
        <CurrentTicketPanel
          ticket={queue.current}
          state={queue.panelState}
          remainingSeconds={queue.remainingSeconds}
          canCallNext={queue.canCallNext}
          onCallNext={queue.callNext}
          onVerify={() => open(QueueModal.VERIFY)}
          onMarkNoShow={() => open(QueueModal.NO_SHOW)}
          onComplete={() => open(QueueModal.COMPLETE)}
          style={sideBySide && styles.panel}
        />
        <WaitingTable
          tickets={queue.waiting}
          canOverride={queue.canOverride}
          onOverride={(ticket) => open(QueueModal.OVERRIDE, ticket)}
          style={sideBySide && styles.table}
        />
      </View>

      <StaffModal
        visible={!!modalProps}
        {...modalProps}
        value={input}
        onChangeText={(text) => {
          setInput(text);
          setError(null);
        }}
        error={error}
        cancelLabel={modalProps?.cancel}
        confirmLabel={modalProps?.confirm}
        onCancel={close}
      />
    </ConsolePage>
  );
}

const styles = StyleSheet.create({
  columns: { gap: 24, marginTop: 6 }, // 30px below the header strip
  columnsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  panel: { width: CURRENT_PANEL_WIDTH },
  table: { flex: 1 },
});
