
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
  NoShowResult,
  OverrideResult,
  VerifyResult,
} from '@/providers/QueueProvider';

import { useState } from 'react';

import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

// =====================================================
// STAFF QUEUE MODAL TYPES
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
// QUEUE DASHBOARD
//
// Fix #1: No-show handling
// Fix #2: Offense and penalty calculations
// Fix #3: Unified reducer state
// Fix #4: FIFO override validation
//
// New: Multi-select reason system
// =====================================================

export default function Queue() {
  const { width } = useWindowDimensions();

  const { office } = useStaffOffice();
  const queue = useStaffQueue();

  // Current modal.
  const [modal, setModal] = useState(null);

  // Existing ID verification input.
  const [input, setInput] = useState('');

  // Shared modal error.
  const [error, setError] = useState(null);

  // New structured reason selection.
  const [
    reasonSelection,
    setReasonSelection,
  ] = useState(createEmptyReasonSelection);

  // =====================================================
  // MODAL HELPERS
  // =====================================================

  const open = (type, ticket = null) => {
    setInput('');
    setError(null);

    // Each action starts with a fresh selection.
    setReasonSelection(createEmptyReasonSelection());

    setModal({ type, ticket });
  };

  const close = () => {
    setModal(null);
    setInput('');
    setError(null);
    setReasonSelection(createEmptyReasonSelection());
  };

  // For existing actions that don't need a reason.
  const run = (action) => () => {
    action();
    close();
  };

  // Keep selected reasons in parent state.
  const handleReasonChange = (selection) => {
    setReasonSelection(selection);
    setError(null);
  };

  // Validate reason selections before calling provider.
  const checkReasons = (action) => {
    const result = validateReasonSelection(
      action,
      reasonSelection,
    );

    if (result !== ReasonValidationResult.OK) {
      setError(
        REASON_ERROR_MESSAGES[result] ??
          'Please select a valid reason.',
      );

      return false;
    }

    return true;
  };

  const currentNumber =
    queue.current?.short_ticket_number;

  // =====================================================
  // MODAL CONFIGURATION
  // =====================================================

  const modalProps = (() => {
    switch (modal?.type) {
      // =================================================
      // FIFO OVERRIDE — STRUCTURED REASONS
      // =================================================

      case QueueModal.OVERRIDE: {
        const copy = MODAL_COPY.override(
          modal.ticket.short_ticket_number,
        );

        return {
          ...copy,

          field: ModalField.REASON_SELECT,

          reasonAction: REASON_ACTION.FIFO_OVERRIDE,
          reasonSelection,
          onReasonSelectionChange: handleReasonChange,

          onConfirm: () => {
            if (
              !checkReasons(REASON_ACTION.FIFO_OVERRIDE)
            ) {
              return;
            }

            const result = queue.overrideCall(
              modal.ticket.id,
              reasonSelection,
            );

            if (result === OverrideResult.OK) {
              close();
              return;
            }

            const errors = {
              [OverrideResult.REASON_REQUIRED]:
                'Please select at least one valid reason.',

              [OverrideResult.INVALID_STATE]:
                'The queue must be open with no active ticket.',

              [OverrideResult.TICKET_NOT_FOUND]:
                'This ticket is no longer waiting.',

              [OverrideResult.ALREADY_NEXT]:
                'This ticket is already next. Use Call Next.',
            };

            setError(
              errors[result] ??
                'Unable to override the queue.',
            );
          },
        };
      }

      // =================================================
      // VERIFY BY ID — EXISTING FUNCTIONALITY
      // =================================================

      case QueueModal.VERIFY: {
        const copy =
          MODAL_COPY.verifyById(currentNumber);

        return {
          ...copy,

          field: ModalField.ID,
          confirmDisabled: !input.trim(),

          onConfirm: () => {
            const result = queue.verifyById(input);

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

      // =================================================
      // NO-SHOW — FIX #1 PRESERVED
      //
      // Expired CALLED:
      // Automatic system reason, no dropdown.
      //
      // IN_SERVICE:
      // Required reason selection.
      // =================================================

      case QueueModal.NO_SHOW: {
        const reversingVerification =
          queue.current?.status === 'IN_SERVICE';

        const copy =
          MODAL_COPY.markNoShow(currentNumber);

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
              !checkReasons(REASON_ACTION.VERIFIED_NO_SHOW)
            ) {
              return;
            }

            const result = queue.markNoShow(
              reversingVerification
                ? reasonSelection
                : '',
            );

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
                'Please select a valid reason.',

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

      // =================================================
      // COMPLETE SERVICE — EXISTING FUNCTIONALITY
      // =================================================

      case QueueModal.COMPLETE:
        return {
          ...MODAL_COPY.completeService(currentNumber),
          onConfirm: run(queue.completeService),
        };

      // =================================================
      // CLOSE QUEUE — EXISTING FUNCTIONALITY
      //
      // No reason is required because existing
      // issued tickets remain valid.
      // =================================================

      case QueueModal.CLOSE:
        return {
          ...MODAL_COPY.closeQueue(),
          destructive: true,
          onConfirm: run(queue.closeQueue),
        };

      // =================================================
      // CANCEL QUEUE — STRUCTURED REASONS
      //
      // Entire queue cancellation requires
      // at least one approved reason.
      // =================================================

      case QueueModal.CANCEL: {
        const copy = MODAL_COPY.cancelQueue();

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

            // File 6 will validate structured reasons
            // and record them in the activity log.
            queue.cancelQueue(reasonSelection);

            close();
          },
        };
      }

      // =================================================
      // OVERRIDE CUTOFF — EXISTING FUNCTIONALITY
      // =================================================

      case QueueModal.CUTOFF:
        return {
          ...MODAL_COPY.cutoffOverride(office),
          onConfirm: run(queue.overrideCutoff),
        };

      default:
        return null;
    }
  })();

  // =====================================================
  // RESPONSIVE LAYOUT
  // =====================================================

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
      {/* =============================================
          CUTOFF WARNING
      ============================================= */}

      {queue.cutoffWarningMinutes !== null && (
        <InlineBanner
          tone={BannerTone.WARNING}
          message={QUEUE_COPY.cutoffBanner(
            queue.cutoffWarningMinutes,
          )}
          actionLabel={QUEUE_COPY.overrideCutoff}
          onAction={() => open(QueueModal.CUTOFF)}
        />
      )}

      {/* =============================================
          QUEUE HEADER AND CONTROLS
      ============================================= */}

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
        onOpenQueue={queue.openQueue}
        onCloseQueue={() =>
          open(QueueModal.CLOSE)
        }
        onCancelQueue={() =>
          open(QueueModal.CANCEL)
        }
      />

      {/* =============================================
          CURRENT TICKET AND WAITING QUEUE
      ============================================= */}

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

      {/* =============================================
          SHARED STAFF MODAL
      ============================================= */}

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
