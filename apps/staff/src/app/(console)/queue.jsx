
import StaffModal, {
  ModalField,
} from '@/components/modals/StaffModal';

import CurrentTicketPanel from '@/components/queue/CurrentTicketPanel';
import HeaderStrip from '@/components/queue/HeaderStrip';
import WaitingTable from '@/components/queue/WaitingTable';
import ConsolePage from '@/components/shell/ConsolePage';

import InlineBanner, {
  BannerTone,
} from '@/components/shell/InlineBanner';

import {
  CURRENT_PANEL_WIDTH,
  FOOTER_COPY,
  MODAL_COPY,
  QUEUE_COLUMNS_BREAKPOINT,
  QUEUE_COPY,
} from '@/constants';

import {
  useStaffOffice,
  useStaffQueue,
} from '@/hooks';

import {
  NoShowResult,
  VerifyResult,
} from '@/providers/QueueProvider';

import { useState } from 'react';

import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

// Staff queue modal types.
const QueueModal = Object.freeze({
  OVERRIDE: 'override',
  VERIFY: 'verify',
  NO_SHOW: 'noShow',
  COMPLETE: 'complete',
  CLOSE: 'close',
  CANCEL: 'cancel',
  CUTOFF: 'cutoff',
});

// W03: Staff Queue Dashboard.
export default function Queue() {
  const { width } = useWindowDimensions();
  const { office } = useStaffOffice();
  const queue = useStaffQueue();

  const [modal, setModal] = useState(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  // Open a modal and clear previous input/error.
  const open = (type, ticket = null) => {
    setInput('');
    setError(null);
    setModal({ type, ticket });
  };

  // Close the current modal.
  const close = () => {
    setModal(null);
    setInput('');
    setError(null);
  };

  // Run existing queue actions and close the modal.
  const run = (action) => () => {
    action();
    close();
  };

  const currentNumber =
    queue.current?.short_ticket_number;

  // Configure the active modal.
  const modalProps = (() => {
    switch (modal?.type) {

      // WM01: Override FIFO order.
      case QueueModal.OVERRIDE:
        return {
          ...MODAL_COPY.override(
            modal.ticket.short_ticket_number,
          ),
          onConfirm: run(() =>
            queue.overrideCall(modal.ticket.id),
          ),
        };

      // WM02: Verify ticket by student/guest ID.
      case QueueModal.VERIFY: {
        const copy =
          MODAL_COPY.verifyById(currentNumber);

        return {
          ...copy,
          field: ModalField.ID,
          confirmDisabled: !input.trim(),

          onConfirm: async () => {
            const result = await queue.verifyById(input);

            if (result === VerifyResult.OK) {
              close();
            } else {
              setError(
                result === VerifyResult.EXPIRED
                  ? copy.expired
                  : copy.noMatch,
              );
            }
          },
        };
      }

      // ==================================================
      // FIX #1: NO-SHOW MODAL
      // ==================================================
      //
      // Expired CALLED:
      // Confirmation without a required reason.
      //
      // IN_SERVICE:
      // Staff must explain why verification is reversed.
      //
      // Modal closes only when the operation succeeds.
      // ==================================================

      case QueueModal.NO_SHOW: {
        const reversingVerification =
          queue.current?.status === 'IN_SERVICE';

        const copy =
          MODAL_COPY.markNoShow(currentNumber);

        return {
          ...copy,

          // Require a reason for IN_SERVICE -> NO_SHOW.
          ...(reversingVerification
            ? {
                field: ModalField.REASON,
                confirmDisabled: !input.trim(),
              }
            : {}),

          destructive: true,

          onConfirm: async () => {
            const result = await queue.markNoShow(input);

            if (result === NoShowResult.OK) {
              close();
              return;
            }

            const errors = {
              [NoShowResult.INVALID_STATE]:
                'This ticket cannot be marked as a no-show.',

              [NoShowResult.TOO_EARLY]:
                'The grace period has not expired yet.',

              [NoShowResult.REASON_REQUIRED]:
                'Please enter a reason for reversing verification.',

              [NoShowResult.ALREADY_RECORDED]:
                'A no-show offense already exists for this ticket.',
            };

            setError(
              errors[result] ??
                'Unable to mark this ticket as a no-show.',
            );
          },
        };
      }

      // WM04: Complete service.
      case QueueModal.COMPLETE:
        return {
          ...MODAL_COPY.completeService(
            currentNumber,
          ),
          onConfirm: run(queue.completeService),
        };

      // WM05: Close queue to new tickets.
      case QueueModal.CLOSE:
        return {
          ...MODAL_COPY.closeQueue(),
          destructive: true,
          onConfirm: run(queue.closeQueue),
        };

      // WM06: Cancel entire office queue.
      case QueueModal.CANCEL:
        return {
          ...MODAL_COPY.cancelQueue(),
          field: ModalField.REASON,
          destructive: true,
          confirmDisabled: !input.trim(),

          onConfirm: run(() =>
            queue.cancelQueue(input.trim()),
          ),
        };

      // WM07: Override cutoff time.
      case QueueModal.CUTOFF:
        return {
          ...MODAL_COPY.cutoffOverride(office),
          onConfirm: run(queue.overrideCutoff),
        };

      default:
        return null;
    }
  })();

  const sideBySide =
    width >= QUEUE_COLUMNS_BREAKPOINT;

  return (
    <ConsolePage
      footer={{
        center: FOOTER_COPY.queueSummary(
          office,
          queue.averageServiceMinutes,
        ),
        right: office.location,
      }}
    >
      {/* Capacity cutoff warning */}
      {queue.cutoffWarningMinutes !== null && (
        <InlineBanner
          tone={BannerTone.WARNING}
          message={QUEUE_COPY.cutoffBanner(
            queue.cutoffWarningMinutes,
          )}
          actionLabel={QUEUE_COPY.overrideCutoff}
          onAction={() =>
            open(QueueModal.CUTOFF)
          }
        />
      )}

      {/* Queue controls */}
      <HeaderStrip
        manualCode={office.check_in_code}
        waitingCount={queue.waiting.length}
        averageServiceMinutes={
          queue.averageServiceMinutes
        }
        isOpen={queue.isOpen}
        joiningOpen={queue.joiningOpen}
        cutoffReached={queue.cutoffReached}
        onOverrideCutoff={() =>
          open(QueueModal.CUTOFF)
        }
        onOpenQueue={queue.openQueue}
        onCloseQueue={() =>
          open(QueueModal.CLOSE)
        }
        onCancelQueue={() =>
          open(QueueModal.CANCEL)
        }
      />

      {/* Current ticket and waiting queue */}
      <View
        style={[
          styles.columns,
          sideBySide && styles.columnsRow,
        ]}
      >
        <CurrentTicketPanel
          ticket={queue.current}
          state={queue.panelState}
          remainingSeconds={
            queue.remainingSeconds
          }
          canCallNext={queue.canCallNext}
          onCallNext={queue.callNext}
          onVerify={() =>
            open(QueueModal.VERIFY)
          }
          onMarkNoShow={() =>
            open(QueueModal.NO_SHOW)
          }
          onComplete={() =>
            open(QueueModal.COMPLETE)
          }
          style={
            sideBySide && styles.panel
          }
        />

        <WaitingTable
          tickets={queue.waiting}
          canOverride={queue.canOverride}
          onOverride={(ticket) =>
            open(QueueModal.OVERRIDE, ticket)
          }
          style={
            sideBySide && styles.table
          }
        />
      </View>

      {/* Shared staff action modal */}
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
  columns: {
    gap: 24,
    marginTop: 6,
  },

  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  panel: {
    width: CURRENT_PANEL_WIDTH,
  },

  table: {
    flex: 1,
  },
});
