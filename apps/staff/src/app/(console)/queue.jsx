
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
  createEmptyReasonSelection,
  REASON_ACTION,
  REASON_ERROR_MESSAGES,
  ReasonValidationResult,
  validateReasonSelection,
} from '@/constants/reasons';

import {
  useStaffOffice,
  useStaffQueue,
} from '@/hooks';

import {
  CancelResult,
  NoShowResult,
  OverrideResult,
  QueueActionResult,
  VerifyResult,
} from '@/providers/QueueProvider';

import { useState } from 'react';

import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF QUEUE DASHBOARD
//
// Preserves:
// - Queue header controls
// - Current ticket panel
// - Waiting ticket list
// - Structured multi-select reasons
// - Queue action validation
// - Responsive layout from Fix #8
//
// Fix #6 demo panel removed.
// =====================================================

const QueueModal = Object.freeze({
  OVERRIDE: 'override',
  VERIFY: 'verify',
  NO_SHOW: 'noShow',
  COMPLETE: 'complete',
  CLOSE: 'close',
  CANCEL: 'cancel',
  CUTOFF: 'cutoff',
});

// =====================================================
// ACTION ERROR MESSAGES
// =====================================================

const QUEUE_ACTION_ERRORS = {
  [QueueActionResult.INVALID_STATE]:
    'This action is not available in the current queue state.',

  [QueueActionResult.QUEUE_CLOSED]:
    'Open the queue before calling the next ticket.',

  [QueueActionResult.ACTIVE_TICKET]:
    'Finish handling the current ticket first.',

  [QueueActionResult.NO_WAITING_TICKETS]:
    'There are no waiting tickets to call.',

  [QueueActionResult.TICKET_NOT_FOUND]:
    'The selected ticket could not be found.',

  [QueueActionResult.ALREADY_OPEN]:
    'The queue is already open.',

  [QueueActionResult.ALREADY_CLOSED]:
    'The queue is already closed.',

  [QueueActionResult.ALREADY_OVERRIDDEN]:
    'The cutoff has already been overridden.',
};

const OVERRIDE_ERRORS = {
  [OverrideResult.REASON_REQUIRED]:
    'Please select at least one valid reason.',

  [OverrideResult.INVALID_STATE]:
    'The queue must be open with no active ticket.',

  [OverrideResult.TICKET_NOT_FOUND]:
    'This ticket is no longer waiting.',

  [OverrideResult.ALREADY_NEXT]:
    'This ticket is already next. Use Call Next.',
};

const NO_SHOW_ERRORS = {
  [NoShowResult.INVALID_STATE]:
    'This ticket cannot be marked as a no-show.',

  [NoShowResult.TOO_EARLY]:
    'The grace period has not expired yet.',

  [NoShowResult.REASON_REQUIRED]:
    'Please select a valid reason.',

  [NoShowResult.ALREADY_RECORDED]:
    'A no-show offense already exists for this ticket.',
};

const CANCEL_ERRORS = {
  [CancelResult.INVALID_REASON]:
    'Please select at least one valid reason.',

  [CancelResult.INVALID_STATE]:
    'The queue has already been cancelled or cleared.',
};

// =====================================================
// QUEUE DASHBOARD
// =====================================================

export default function Queue() {
  const { width } = useWindowDimensions();

  const { office } = useStaffOffice();
  const queue = useStaffQueue();

  const [modal, setModal] = useState(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  const [
    actionError,
    setActionError,
  ] = useState(null);

  const [
    reasonSelection,
    setReasonSelection,
  ] = useState(createEmptyReasonSelection);

  // =================================================
  // MODAL HELPERS
  // =================================================

  const open = (type, ticket = null) => {
    setInput('');
    setError(null);
    setActionError(null);

    setReasonSelection(
      createEmptyReasonSelection(),
    );

    setModal({
      type,
      ticket,
    });
  };

  const close = () => {
    setModal(null);
    setInput('');
    setError(null);

    setReasonSelection(
      createEmptyReasonSelection(),
    );
  };

  const handleReasonChange = (selection) => {
    setReasonSelection(selection);
    setError(null);
  };

  const checkReasons = (action) => {
    const result = validateReasonSelection(
      action,
      reasonSelection,
    );

    if (
      result !== ReasonValidationResult.OK
    ) {
      setError(
        REASON_ERROR_MESSAGES[result] ??
          'Please select a valid reason.',
      );

      return false;
    }

    return true;
  };

  // Execute a synchronous queue action and
  // display an error if it does not succeed.
  const executeAction = (action) => {
    const result = action();

    if (
      result === QueueActionResult.OK ||
      result === undefined
    ) {
      setActionError(null);
      close();
      return true;
    }

    setError(
      QUEUE_ACTION_ERRORS[result] ??
        'Unable to complete this action.',
    );

    return false;
  };

  // Actions without confirmation modals.
  const runDirectAction = (action) => {
    const result = action();

    if (
      result === QueueActionResult.OK ||
      result === undefined
    ) {
      setActionError(null);
      return;
    }

    setActionError(
      QUEUE_ACTION_ERRORS[result] ??
        'Unable to complete this action.',
    );
  };

  const currentNumber =
    queue.current?.short_ticket_number;

  // =================================================
  // MODAL CONFIGURATION
  // =================================================

  const modalProps = (() => {
    switch (modal?.type) {
      // =============================================
      // FIFO OVERRIDE
      // =============================================

      case QueueModal.OVERRIDE: {
        const copy = MODAL_COPY.override(
          modal.ticket.short_ticket_number,
        );

        return {
          ...copy,

          field: ModalField.REASON_SELECT,

          reasonAction:
            REASON_ACTION.FIFO_OVERRIDE,

          reasonSelection,

          onReasonSelectionChange:
            handleReasonChange,

          onConfirm: () => {
            if (
              !checkReasons(
                REASON_ACTION.FIFO_OVERRIDE,
              )
            ) {
              return;
            }

            const result = queue.overrideCall(
              modal.ticket.id,
              reasonSelection,
            );

            if (
              result === OverrideResult.OK
            ) {
              setActionError(null);
              close();
              return;
            }

            setError(
              OVERRIDE_ERRORS[result] ??
                'Unable to override the queue.',
            );
          },
        };
      }

      // =============================================
      // VERIFY BY ID
      // =============================================

      case QueueModal.VERIFY: {
        const copy = MODAL_COPY.verifyById(
          currentNumber,
        );

        return {
          ...copy,

          field: ModalField.ID,
          confirmDisabled: !input.trim(),

          onConfirm: () => {
            const result = queue.verifyById(input);

            if (
              result === VerifyResult.OK
            ) {
              setActionError(null);
              close();
              return;
            }

            setError(
              result === VerifyResult.EXPIRED
                ? copy.expired
                : copy.noMatch,
            );
          },
        };
      }

      // =============================================
      // MANUAL NO-SHOW
      // =============================================

      case QueueModal.NO_SHOW: {
        const reversingVerification =
          queue.current?.status === 'IN_SERVICE';

        const copy = MODAL_COPY.markNoShow(
          currentNumber,
        );

        return {
          ...copy,

          destructive: true,

          ...(reversingVerification
            ? {
                field: ModalField.REASON_SELECT,

                reasonAction:
                  REASON_ACTION.VERIFIED_NO_SHOW,

                reasonSelection,

                onReasonSelectionChange:
                  handleReasonChange,

                body:
                  'This ticket was already verified. Select why the holder did not reach the service window. A no-show offense will be recorded.',
              }
            : {}),

          onConfirm: () => {
            if (
              reversingVerification &&
              !checkReasons(
                REASON_ACTION.VERIFIED_NO_SHOW,
              )
            ) {
              return;
            }

            const result = queue.markNoShow(
              reversingVerification
                ? reasonSelection
                : '',
            );

            if (
              result === NoShowResult.OK
            ) {
              setActionError(null);
              close();
              return;
            }

            setError(
              NO_SHOW_ERRORS[result] ??
                'Unable to mark this ticket as a no-show.',
            );
          },
        };
      }

      // =============================================
      // COMPLETE SERVICE
      // =============================================

      case QueueModal.COMPLETE:
        return {
          ...MODAL_COPY.completeService(
            currentNumber,
          ),

          onConfirm: () => {
            executeAction(
              queue.completeService,
            );
          },
        };

      // =============================================
      // CLOSE QUEUE
      // =============================================

      case QueueModal.CLOSE:
        return {
          ...MODAL_COPY.closeQueue(),

          destructive: true,

          onConfirm: () => {
            executeAction(queue.closeQueue);
          },
        };

      // =============================================
      // CANCEL ENTIRE QUEUE
      // =============================================

      case QueueModal.CANCEL: {
        const copy =
          MODAL_COPY.cancelQueue();

        return {
          ...copy,

          field: ModalField.REASON_SELECT,
          destructive: true,

          reasonAction:
            REASON_ACTION.QUEUE_CANCELLATION,

          reasonSelection,

          onReasonSelectionChange:
            handleReasonChange,

          onConfirm: () => {
            if (
              !checkReasons(
                REASON_ACTION.QUEUE_CANCELLATION,
              )
            ) {
              return;
            }

            const result = queue.cancelQueue(
              reasonSelection,
            );

            if (
              result === CancelResult.OK
            ) {
              setActionError(null);
              close();
              return;
            }

            setError(
              CANCEL_ERRORS[result] ??
                'Unable to cancel the queue.',
            );
          },
        };
      }

      // =============================================
      // OVERRIDE CUTOFF
      // =============================================

      case QueueModal.CUTOFF:
        return {
          ...MODAL_COPY.cutoffOverride(office),

          onConfirm: () => {
            executeAction(
              queue.overrideCutoff,
            );
          },
        };

      default:
        return null;
    }
  })();

  // =================================================
  // RESPONSIVE LAYOUT
  // =================================================

  const sideBySide =
    width >= QUEUE_COLUMNS_BREAKPOINT;

  // =================================================
  // RENDER
  // =================================================

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
      {/* =========================================
          ACTION ERROR
      ========================================= */}

      {!!actionError && (
        <InlineBanner
          tone={BannerTone.DANGER}
          message={actionError}
        />
      )}

      {/* =========================================
          CUTOFF WARNING
      ========================================= */}

      {queue.cutoffWarningMinutes !== null && (
        <InlineBanner
          tone={BannerTone.WARNING}
          message={QUEUE_COPY.cutoffBanner(
            queue.cutoffWarningMinutes,
          )}
          actionLabel={
            QUEUE_COPY.overrideCutoff
          }
          onAction={() =>
            open(QueueModal.CUTOFF)
          }
        />
      )}

      {/* =========================================
          QUEUE HEADER
      ========================================= */}

      <HeaderStrip
        manualCode={office.manual_code}
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
        onOpenQueue={() =>
          runDirectAction(queue.openQueue)
        }
        onCloseQueue={() =>
          open(QueueModal.CLOSE)
        }
        onCancelQueue={() =>
          open(QueueModal.CANCEL)
        }
      />

      {/* =========================================
          CURRENT AND WAITING TICKETS
      ========================================= */}

      <View
        style={[
          styles.columns,
          sideBySide &&
            styles.columnsRow,
        ]}
      >
        <CurrentTicketPanel
          ticket={queue.current}
          state={queue.panelState}
          remainingSeconds={
            queue.remainingSeconds
          }
          canCallNext={queue.canCallNext}
          onCallNext={() =>
            runDirectAction(queue.callNext)
          }
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
            sideBySide &&
            styles.panel
          }
        />

        <WaitingTable
          tickets={queue.waiting}
          canOverride={queue.canOverride}
          onOverride={(ticket) =>
            open(
              QueueModal.OVERRIDE,
              ticket,
            )
          }
          style={
            sideBySide &&
            styles.table
          }
        />
      </View>

      {/* =========================================
          SHARED STAFF MODAL
      ========================================= */}

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

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  columns: {
    gap: 24,
    marginTop: 6,
    minWidth: 0,
  },

  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  panel: {
    width: CURRENT_PANEL_WIDTH,
    minWidth: 0,
  },

  table: {
    flex: 1,
    minWidth: 0,
  },
});
