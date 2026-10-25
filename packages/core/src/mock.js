// Centralized Mock Data Store for QAMPUS (PRD v1.3)
// Read only through hooks in each app's src/hooks — screens and components never import this file.

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

// Placeholder list; the program source is an open PRD question
export const MOCK_PROGRAMS = Object.freeze([
  'BS Computer Science',
  'BS Information Technology',
  'BS Computer Engineering',
  'BS Civil Engineering',
  'BS Electrical Engineering',
  'BS Architecture',
  'BS Accountancy',
  'BS Psychology',
]);


// ---------------------------------------------------------------------------
// Staff web (apps/staff) — notifications (the queue, offenses and activity log are real)
// ---------------------------------------------------------------------------

export const MOCK_STAFF_NOTIFICATIONS = Object.freeze([
  {
    id: 'staff_notif_001',
    type: 'GLOBAL_ANNOUNCEMENT',
    title: 'Scheduled maintenance',
    message: 'Sunday, 02:00–04:00. The queue will be unavailable.',
    created_at: minutesAgo(90),
  },
]);
