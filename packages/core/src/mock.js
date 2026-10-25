// Centralized Mock Data Store for QAMPUS (PRD v1.3)
// Read only through hooks in each app's src/hooks — screens and components never import this file.

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const MOCK_USER_GUEST = Object.freeze({
  id: 'usr_gst_002',
  role: 'GUEST',
  name: 'Maria Santos',
  email: null,
  institutional_id: 'G104728',
  program: null,
  guest_type: 'PARENT_GUARDIAN',
  device_token: 'dev_mock_uuid_456',
  push_token: null,
  push_enabled: true,
  strike_count: 1,
  banned_until: null,
  created_at: '2026-09-28T07:30:00Z',
});

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

// Mon–Fri with the same hours; matches the Firestore `hours` shape (minutes since midnight, missing day = closed)
const weekdays = (open_min, close_min) =>
  Object.freeze(
    Object.fromEntries(['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => [day, { open_min, close_min }])),
  );

export const MOCK_OFFICES = Object.freeze([
  {
    id: 'off_reg_001',
    code: 'R',
    short_name: 'University Registrar',
    check_in_code: '418902', // 6-digit check-in code, shown beside the office QR and used for manual entry
    name: 'Office of the University Registrar',
    location: 'Administration Building, 1st Floor, Room 101',
    status: 'ACTIVE',
    default_service_minutes: 5,
    hours: weekdays(480, 1020), // 08:00–17:00
    queue: {
      status: 'OPEN',
      current_ticket_number: 'R-012',
      waiting_count: 8,
      estimated_wait_minutes: 25,
    },
  },
  {
    id: 'off_csh_002',
    code: 'C',
    short_name: 'Cashier',
    check_in_code: '205117',
    name: 'Cashier & Student Accounts',
    location: 'Finance Hall, Ground Floor, Windows 1-4',
    status: 'ACTIVE',
    default_service_minutes: 3,
    hours: weekdays(480, 990), // 08:00–16:30
    queue: {
      status: 'OPEN',
      current_ticket_number: 'C-045',
      waiting_count: 14,
      estimated_wait_minutes: 42,
    },
  },
  {
    id: 'off_adm_003',
    code: 'A',
    short_name: 'Admissions',
    check_in_code: '730264',
    name: 'Admissions & Scholarships Office',
    location: 'Student Center, 2nd Floor, Room 204',
    status: 'ACTIVE',
    default_service_minutes: 7,
    hours: weekdays(540, 960), // 09:00–16:00
    queue: {
      status: 'CLOSED',
      current_ticket_number: null,
      waiting_count: 0,
      estimated_wait_minutes: 0,
    },
  },
  {
    id: 'off_gdc_004',
    code: 'G',
    short_name: 'Guidance',
    check_in_code: '561839',
    name: 'Guidance & Counseling Services',
    location: 'Student Well-being Center, 3rd Floor',
    status: 'ACTIVE',
    default_service_minutes: 15,
    hours: weekdays(480, 1020), // 08:00–17:00
    queue: {
      status: 'OPEN',
      current_ticket_number: 'G-003',
      waiting_count: 2,
      estimated_wait_minutes: 30,
    },
  },
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
