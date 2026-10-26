
/**
 * QAMPUS Staff Web App
 * Single-Select Radio Reason Configuration
 *
 * Used by:
 * 1. Queue Cancellation
 * 2. Offense Revocation
 *
 * Rules:
 * - Exactly one reason per action
 * - Other requires a written explanation
 * - No additional notes
 * - Maximum 200 characters for Other
 * - Log Other using the written explanation
 *
 * Keep reason IDs stable for backend integration.
 */

// =====================================================
// ACTION TYPES
// =====================================================

export const REASON_ACTION = Object.freeze({
  QUEUE_CANCELLATION: 'queueCancellation',
  OFFENSE_REVOCATION: 'offenseRevocation',
});

export const OTHER_REASON_ID = 'other';

export const REASON_TEXT_LIMIT = 200;

// Maximum reason length supported by existing
// event storage rules.
export const REASON_STORED_LIMIT = 500;

// Reversing a verified ticket to a no-show needs a reason
// (rules and backend); staff are not asked, so this is stored.
export const VERIFIED_NO_SHOW_REASON =
  'Verification reversed by staff';

// =====================================================
// APPROVED REASON LISTS
// =====================================================

export const STAFF_REASONS = Object.freeze({
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
// DEFAULT SINGLE-SELECT STATE
// =====================================================

export function createEmptyReasonSelection() {
  return {
    selectedReason: '',
    otherReason: '',
  };
}

// =====================================================
// AVAILABLE OPTIONS
// =====================================================

export function getReasonsForAction(action) {
  return STAFF_REASONS[action] ?? [];
}

// =====================================================
// VALIDATION RESULTS
// =====================================================

export const ReasonValidationResult = Object.freeze({
  OK: 'ok',
  REASON_REQUIRED: 'reasonRequired',
  INVALID_REASON: 'invalidReason',
  OTHER_REQUIRED: 'otherRequired',
  OTHER_TOO_LONG: 'otherTooLong',
});

// =====================================================
// VALIDATE ONE SELECTED REASON
// =====================================================

export function validateReasonSelection(action, selection) {
  const available = getReasonsForAction(action);

  if (available.length === 0) {
    return ReasonValidationResult.INVALID_REASON;
  }

  const reasonId = selection?.selectedReason;

  if (
    typeof reasonId !== 'string' ||
    reasonId.trim() === ''
  ) {
    return ReasonValidationResult.REASON_REQUIRED;
  }

  const chosen = available.find(
    (reason) => reason.id === reasonId,
  );

  if (!chosen) {
    return ReasonValidationResult.INVALID_REASON;
  }

  if (reasonId === OTHER_REASON_ID) {
    const rawOther = selection?.otherReason;

    if (typeof rawOther !== 'string') {
      return ReasonValidationResult.OTHER_REQUIRED;
    }

    const otherText = rawOther.trim();

    if (!otherText) {
      return ReasonValidationResult.OTHER_REQUIRED;
    }

    if (rawOther.length > REASON_TEXT_LIMIT) {
      return ReasonValidationResult.OTHER_TOO_LONG;
    }
  }

  return ReasonValidationResult.OK;
}

// =====================================================
// USER-FRIENDLY VALIDATION MESSAGES
// =====================================================

export const REASON_ERROR_MESSAGES = Object.freeze({
  [ReasonValidationResult.REASON_REQUIRED]:
    'Please select one reason.',

  [ReasonValidationResult.INVALID_REASON]:
    'The selected reason is not approved for this action.',

  [ReasonValidationResult.OTHER_REQUIRED]:
    'Please type your reason under Other.',

  [ReasonValidationResult.OTHER_TOO_LONG]:
    'Other reason must not exceed 200 characters.',
});

// =====================================================
// RESOLVE REASON LABEL
// =====================================================

export function getSelectedReasonLabel(action, selection) {
  if (
    validateReasonSelection(action, selection) !==
    ReasonValidationResult.OK
  ) {
    return '';
  }

  if (selection.selectedReason === OTHER_REASON_ID) {
    // Option B: Store the typed explanation directly.
    return selection.otherReason.trim();
  }

  const option = getReasonsForAction(action).find(
    (reason) => reason.id === selection.selectedReason,
  );

  return option?.label ?? '';
}

// Compatibility helper for callers that expect
// an array of labels.
export function getSelectedReasonLabels(action, selection) {
  const label = getSelectedReasonLabel(action, selection);

  return label ? [label] : [];
}

// =====================================================
// STRUCTURED ACTIVITY LOG DETAILS
// =====================================================

export function buildReasonDetails(action, selection) {
  if (
    validateReasonSelection(action, selection) !==
    ReasonValidationResult.OK
  ) {
    return null;
  }

  const selectedReason = selection.selectedReason;
  const label = getSelectedReasonLabel(action, selection);

  return {
    reasonAction: action,

    // Single selected reason ID.
    reasonId: selectedReason,

    // Single human-readable reason.
    reasonLabel: label,

    // Keep the existing array-shaped fields as
    // compatibility metadata for log consumers.
    reasonIds: [selectedReason],
    reasonLabels: [label],

    otherReason:
      selectedReason === OTHER_REASON_ID
        ? selection.otherReason.trim()
        : '',
  };
}

// =====================================================
// ACTIVITY LOG FORMATTING
// =====================================================

export function formatReasonForLog(action, selection) {
  return getSelectedReasonLabel(action, selection) || null;
}

// =====================================================
// REASON STRING FOR BACKEND EVENTS
// =====================================================

export function reasonToText(action, selection) {
  return getSelectedReasonLabel(action, selection).slice(
    0,
    REASON_STORED_LIMIT,
  );
}

// =====================================================
// CONFIRM BUTTON VALIDATION
// =====================================================

export const isReasonComplete = (action, selection) =>
  validateReasonSelection(action, selection) ===
  ReasonValidationResult.OK;
