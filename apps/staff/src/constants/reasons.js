
/**
 * QAMPUS Staff Web App
 * Approved Reason Selection Configuration
 *
 * Frontend-only implementation.
 *
 * Supports:
 * - Four staff actions
 * - Multiple predefined reasons
 * - An "Other" option
 * - Required explanation when Other is selected
 * - Optional additional notes
 * - Maximum 200 characters per text field
 *
 * Keep reason IDs stable because they may eventually
 * be stored in Firebase and referenced by activity logs.
 */

// =====================================================
// ACTION TYPES
// =====================================================

export const REASON_ACTION = Object.freeze({
  FIFO_OVERRIDE: 'fifoOverride',
  QUEUE_CANCELLATION: 'queueCancellation',
  VERIFIED_NO_SHOW: 'verifiedNoShow',
  OFFENSE_REVOCATION: 'offenseRevocation',
});

export const OTHER_REASON_ID = 'other';

export const REASON_TEXT_LIMIT = 200;

// =====================================================
// APPROVED REASON LISTS
// =====================================================

export const STAFF_REASONS = Object.freeze({
  [REASON_ACTION.FIFO_OVERRIDE]: Object.freeze([
    {
      id: 'pwd_priority',
      label: 'Person with Disability (PWD) priority',
    },
    {
      id: 'senior_citizen_priority',
      label: 'Senior citizen priority',
    },
    {
      id: 'pregnancy_priority',
      label: 'Pregnant student or visitor priority',
    },
    {
      id: 'urgent_deadline',
      label: 'Urgent academic or administrative deadline',
    },
    {
      id: 'scheduled_appointment',
      label: 'Scheduled appointment or office instruction',
    },
    {
      id: 'special_assistance',
      label: 'Assistance required for a special circumstance',
    },
    {
      id: OTHER_REASON_ID,
      label: 'Other',
    },
  ]),

  [REASON_ACTION.QUEUE_CANCELLATION]: Object.freeze([
    {
      id: 'unexpected_closure',
      label: 'Unexpected office closure',
    },
    {
      id: 'power_interruption',
      label: 'Power interruption',
    },
    {
      id: 'internet_system_outage',
      label: 'Internet or system outage',
    },
    {
      id: 'staff_unavailable',
      label: 'Staff unavailable',
    },
    {
      id: 'office_emergency',
      label: 'Office emergency or safety concern',
    },
    {
      id: 'institutional_activity',
      label: 'Scheduled institutional activity',
    },
    {
      id: OTHER_REASON_ID,
      label: 'Other',
    },
  ]),

  [REASON_ACTION.VERIFIED_NO_SHOW]: Object.freeze([
    {
      id: 'verified_holder_absent',
      label: 'Ticket verified but holder did not appear',
    },
    {
      id: 'remote_qr_scan',
      label: 'QR code presented or scanned remotely',
    },
    {
      id: 'wrong_person',
      label: 'Wrong person presented the ticket',
    },
    {
      id: 'left_before_window',
      label: 'Holder left before reaching the service window',
    },
    {
      id: 'presence_unconfirmed',
      label: 'Unable to confirm physical presence',
    },
    {
      id: OTHER_REASON_ID,
      label: 'Other',
    },
  ]),

  [REASON_ACTION.OFFENSE_REVOCATION]: Object.freeze([
    {
      id: 'incorrect_ticket_called',
      label: 'Staff called an incorrect ticket number',
    },
    {
      id: 'incorrect_attendance_record',
      label: 'Verification or attendance was recorded incorrectly',
    },
    {
      id: 'system_scanning_error',
      label: 'System or QR scanning error',
    },
    {
      id: 'office_disruption',
      label: 'Office disruption caused the missed call',
    },
    {
      id: 'explanation_reviewed',
      label: 'Valid supporting explanation was reviewed',
    },
    {
      id: 'duplicate_offense',
      label: 'Offense recorded more than once',
    },
    {
      id: OTHER_REASON_ID,
      label: 'Other',
    },
  ]),
});

// =====================================================
// CREATE EMPTY SELECTION
// =====================================================

export function createEmptyReasonSelection() {
  return {
    selectedReasons: [],
    otherReason: '',
    additionalNotes: '',
  };
}

// =====================================================
// GET REASONS FOR A STAFF ACTION
// =====================================================

export function getReasonsForAction(action) {
  return STAFF_REASONS[action] ?? [];
}

// =====================================================
// VALIDATE REASON SELECTION
// =====================================================

export const ReasonValidationResult = Object.freeze({
  OK: 'ok',
  REASON_REQUIRED: 'reasonRequired',
  INVALID_REASON: 'invalidReason',
  OTHER_REQUIRED: 'otherRequired',
  OTHER_TOO_LONG: 'otherTooLong',
  NOTES_TOO_LONG: 'notesTooLong',
});

export function validateReasonSelection(action, selection) {
  const availableReasons = getReasonsForAction(action);

  if (availableReasons.length === 0) {
    return ReasonValidationResult.INVALID_REASON;
  }

  const selected = selection?.selectedReasons;

  if (!Array.isArray(selected) || selected.length === 0) {
    return ReasonValidationResult.REASON_REQUIRED;
  }

  const validIds = new Set(
    availableReasons.map((reason) => reason.id),
  );

  const uniqueIds = new Set(selected);

  // Reject unknown or duplicated selections.
  if (
    uniqueIds.size !== selected.length ||
    selected.some((id) => !validIds.has(id))
  ) {
    return ReasonValidationResult.INVALID_REASON;
  }

  const otherText = String(
    selection?.otherReason ?? '',
  ).trim();

  const notes = String(
    selection?.additionalNotes ?? '',
  ).trim();

  if (otherText.length > REASON_TEXT_LIMIT) {
    return ReasonValidationResult.OTHER_TOO_LONG;
  }

  if (notes.length > REASON_TEXT_LIMIT) {
    return ReasonValidationResult.NOTES_TOO_LONG;
  }

  // Other can be selected alongside predefined reasons.
  if (
    uniqueIds.has(OTHER_REASON_ID) &&
    !otherText
  ) {
    return ReasonValidationResult.OTHER_REQUIRED;
  }

  return ReasonValidationResult.OK;
}

// =====================================================
// USER-FRIENDLY ERROR MESSAGES
// =====================================================

export const REASON_ERROR_MESSAGES = Object.freeze({
  [ReasonValidationResult.REASON_REQUIRED]:
    'Please select at least one reason.',

  [ReasonValidationResult.INVALID_REASON]:
    'One or more selected reasons are invalid.',

  [ReasonValidationResult.OTHER_REQUIRED]:
    'Please specify your reason under Other.',

  [ReasonValidationResult.OTHER_TOO_LONG]:
    'Other reason must not exceed 200 characters.',

  [ReasonValidationResult.NOTES_TOO_LONG]:
    'Additional notes must not exceed 200 characters.',
});

// =====================================================
// RESOLVE SELECTED REASONS TO LABELS
// =====================================================

export function getSelectedReasonLabels(action, selection) {
  const options = getReasonsForAction(action);

  const selectedIds = selection?.selectedReasons ?? [];

  return selectedIds.map((id) => {
    if (id === OTHER_REASON_ID) {
      const explanation = String(
        selection?.otherReason ?? '',
      ).trim();

      return `Other: ${explanation}`;
    }

    return options.find((option) => option.id === id)?.label ?? id;
  });
}

// =====================================================
// STRUCTURED ACTIVITY LOG DATA
// =====================================================

export function buildReasonDetails(action, selection) {
  const result = validateReasonSelection(action, selection);

  if (result !== ReasonValidationResult.OK) {
    return null;
  }

  return {
    reasonAction: action,

    reasonIds: [...selection.selectedReasons],

    reasonLabels: getSelectedReasonLabels(
      action,
      selection,
    ),

    otherReason: selection.selectedReasons.includes(
      OTHER_REASON_ID,
    )
      ? String(selection.otherReason ?? '').trim()
      : '',

    additionalNotes: String(
      selection.additionalNotes ?? '',
    ).trim(),
  };
}

// =====================================================
// FORMAT FOR EXISTING ACTIVITY LOGS
// =====================================================

export function formatReasonForLog(action, selection) {
  const details = buildReasonDetails(action, selection);

  if (!details) {
    return null;
  }

  return details.reasonLabels.join('; ');
}
