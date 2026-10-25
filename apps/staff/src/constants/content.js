// Staff web user-facing copy (Figma: QAMPUS Staff Web App).

export const BRAND_COPY = Object.freeze({
  wordmark: 'QAMPUS',
  tagline: 'Digital Queueing System',
});

export const SIGN_IN_COPY = Object.freeze({
  headline: 'Campus queues, run from your window.',
  body: 'Call the next ticket, confirm arrivals, and keep the line moving — without a crowd outside your door.',
  highlights: Object.freeze([
    { icon: 'timer', text: 'A one-minute grace period on every call' },
    { icon: 'userCheck', text: 'Arrivals confirmed by QR or ID number' },
    { icon: 'shield', text: 'Every action recorded with who did it' },
  ]),
  title: 'Sign in',
  subtitle: 'Use your institutional Google account.',
  cta: 'Continue with Google',
  ctaLoading: 'Signing you in…',
  footnote: 'Access is granted by office assignment. No access? Contact the system administrator.',
  error: "That account isn't on the institutional domain. Use your campus Google account.",
});

export const NOT_ASSIGNED_COPY = Object.freeze({
  title: 'No office assigned to this account',
  body: 'Your account is signed in but is not assigned to a service office, so there is no queue to manage. Contact the system administrator to request an assignment.',
  signOut: 'Sign out',
});

export const OUTAGE_COPY = Object.freeze({
  title: 'Temporarily unavailable, please wait',
  body: 'The queue service cannot be reached right now. This screen will recover on its own once the connection returns. Nothing has been lost — no tickets or actions are stored on this computer.',
});

export const NAV_ITEMS = Object.freeze([
  { href: '/queue', label: 'Queue' },
  { href: '/offenses', label: 'Offenses' },
  { href: '/activity-log', label: 'Activity Log' },
]);

export const TOP_BAR_COPY = Object.freeze({
  open: 'OPEN',
  closed: 'CLOSED',
  notifications: 'Notifications',
  noNotifications: 'No notifications right now.',
  accountMenu: 'Account menu',
  assignedStaff: 'assigned staff',
  officeAssignment: 'Office assignment',
  help: 'Help & support',
  signOut: 'Sign out',
});

export const INFO_COPY = Object.freeze({
  officeAssignment: (office) => ({
    title: office.short_name,
    body: `You are assigned to ${office.name}, ${office.location}. Assignments are managed by the system administrator.`,
  }),
  help: {
    title: 'Help & support',
    body: 'For access, office assignments or anything that looks wrong in the queue, contact the system administrator.',
  },
  ok: 'Done',
});

export const QUEUE_COPY = Object.freeze({
  manualCode: 'MANUAL CODE',
  copyCode: 'Copy manual code',
  copied: 'Copied',
  queue: 'QUEUE',
  readout: (waiting, avg) => `${waiting} waiting · avg ${avg} min`,
  joiningOpen: 'Joining open',
  joiningClosed: 'Joining closed',
  cutoffReached: 'Joining closed: cutoff reached',
  overrideCutoff: 'Override cutoff',
  launchDisplay: 'Launch public display',
  openQueue: 'Open queue',
  closeQueue: 'Close queue',
  cancelQueue: 'Cancel queue',
  cutoffBanner: (minutes) => `Joining closes soon — ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} until the cutoff.`,
  waiting: 'Waiting',
  next: 'NEXT',
  override: 'Override',
  overrideBusy: 'Finish the ticket at the window first',
});

export const CURRENT_TICKET_COPY = Object.freeze({
  nowServing: 'NOW SERVING',
  emptyTitle: 'No ticket in service.',
  emptyBody: 'Call the next ticket when ready.',
  callNext: 'Call Next',
  verifyById: 'Verify by ID',
  markNoShow: 'Mark No-Show',
  completeService: 'Complete Service',
  arrivalVerified: 'Arrival verified',
  expired: 'Expired. Mark as no-show to continue.',
  noShowTooltip: 'Mark No-Show — available after the 1-minute grace period',
});

export const FOOTER_COPY = Object.freeze({
  updated: 'Updated just now',
  queueSummary: (office, avg) =>
    `${office.short_name} · open ${office.hours} · average service ${avg} min`,
  offensesScope: (office) => `Showing offenses for ${office.short_name} only`,
  offensesNote: 'Revoked offenses stay on the record',
  logScope: (office) => `Showing all actions for ${office.short_name}`,
});

export const OFFENSES_COPY = Object.freeze({
  title: 'Offenses',
  subtitle: (office) => `${office.short_name} · revoking reverses the strike and lifts any ban it caused`,
  search: 'Search by name or ID',
  results: (n) => `${n} ${n === 1 ? 'result' : 'results'}`,
  causedBan: 'Caused a 24-hour ban',
  revoke: 'Revoke',
  revoked: 'Revoked',
});

export const ACTIVITY_LOG_COPY = Object.freeze({
  title: 'Activity log',
  subtitle: (office) => `${office.short_name} · every action affecting someone’s place in line`,
  pageSummary: (range, entries) => `${range} · entries ${entries}`,
  newer: 'Newer',
  older: 'Older',
  allActions: 'All actions',
  reason: (reason) => `Reason: ${reason}`,
  noTicket: '—',
  dateRanges: Object.freeze([
    { key: 'today', label: 'Today', days: 0 },
    { key: 'yesterday', label: 'Yesterday', days: 1 },
    { key: 'week', label: 'Last 7 days', days: 7 },
    { key: 'all', label: 'All time', days: null },
  ]),
});

// A refused staff action (call, complete, open or close the queue, cancel, override, revoke): the banner reads
// "Couldn't <what>. <why>", where the why is keyed by the backend's TicketingError code
export const ACTION_ERROR_COPY = Object.freeze({
  prefix: (what) => `Couldn't ${what}.`,
  dismiss: 'Dismiss',
  reasons: Object.freeze({
    QUEUE_CLOSED: 'The queue is closed.',
    WINDOW_BUSY: 'A ticket is already at the window.',
    TICKET_UNAVAILABLE: 'That ticket is no longer available. It may have been cancelled or called already.',
    NOT_IN_SERVICE: 'No ticket is in service right now.',
    REASON_REQUIRED: 'A reason is required.',
    DENIED: 'The change was not accepted. Check your connection and try again.',
    UNKNOWN: 'Something went wrong. Try again in a moment.',
  }),
});

// Staff/EmptyState contexts
export const EMPTY_COPY = Object.freeze({
  noOneWaiting: { title: 'No one waiting', body: 'New tickets will appear here as people join.' },
  noRecords: { title: 'Nothing to show yet', body: 'Actions affecting the queue will appear here.' },
  noOffenses: { title: 'Nothing to show yet', body: 'Offenses from this office’s tickets will appear here.' },
  noSearchResults: { title: 'No matching records', body: 'Check the student ID or Guest ID and try again.' },
});

// WM01–WM08. The safe choice is `cancel` (Gold, primary slot); `confirm` is labelled by its effect.
export const MODAL_COPY = Object.freeze({
  override: (number) => ({
    title: `Call ${number} ahead of the queue?`,
    body: `${number} isn't next in line. The queue won't be reordered, and this will be logged.`,
    cancel: 'Cancel',
    confirm: `Call ${number}`,
  }),
  verifyById: (number) => ({
    title: `Verify ${number} by ID`,
    body: 'Enter the student ID or Guest ID of the person at the window. This starts their service, the same as a QR scan.',
    placeholder: 'Student ID or Guest ID',
    cancel: 'Cancel',
    confirm: 'Verify',
    noMatch: "That ID doesn't match this ticket. Nothing has changed — check the ID and try again.",
    expired: 'This ticket has expired and can no longer be verified. Mark it as a no-show instead.',
  }),
  markNoShow: (number) => ({
    title: `Mark ${number} as a no-show?`,
    body: 'This records an offense for the user. They will be notified. You will need to call the next ticket separately.',
    cancel: 'Cancel',
    confirm: 'Mark no-show',
  }),
  completeService: (number) => ({
    title: `Mark ${number} as served?`,
    body: "This completes the ticket and clears the window. It moves to the user's history.",
    cancel: 'Cancel',
    confirm: 'Mark as served',
  }),
  closeQueue: () => ({
    title: 'Close the queue?',
    body: 'No new tickets can be issued. Tickets already issued stay valid and can still be served.',
    cancel: 'Keep open',
    confirm: 'Close queue',
  }),
  cancelQueue: () => ({
    title: 'Cancel the queue?',
    body: 'All tickets will be cancelled and everyone holding one will be notified with your reason. No one is penalized.',
    placeholder: 'e.g. Power outage in the Admin Building',
    cancel: 'Keep queue',
    confirm: 'Cancel all tickets',
  }),
  cutoffOverride: (office) => ({
    title: 'Allow joining past the cutoff?',
    body: `The ${office.short_name} can't serve anyone else before it closes at ${office.closes}. Joining will reopen and this will be logged.`,
    cancel: 'Cancel',
    confirm: 'Allow joining',
  }),
  revokeOffense: () => ({
    title: 'Revoke this offense?',
    body: 'Revoking reverses the strike and lifts any ban it caused. The user is notified. This is recorded in the activity log with your name.',
    placeholder: 'e.g. Called the wrong number',
    cancel: 'Cancel',
    confirm: 'Revoke offense',
  }),
});

export const DISPLAY_COPY = Object.freeze({
  scanToCheckIn: 'SCAN TO CHECK IN',
  orEnterCode: 'or enter code',
  nowServing: 'NOW SERVING',
  next: 'NEXT',
  waitingForNext: 'Waiting for\nthe next ticket',
  noOneWaiting: 'No one\nwaiting',
  scanToJoin: 'Scan to join',
  closedTitle: 'This queue is closed',
  opensAgain: (time) => `It opens again at ${time}.`,
  closedStrip: 'Closed',
  closedStripBody: 'Tickets already issued\nare still valid.',
  unknownOffice: 'This display link does not match an office.',
});
