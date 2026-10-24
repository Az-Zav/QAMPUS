// Centralized Mock Data Store for QAMPUS (PRD v1.3)
// Read only through hooks in each app's src/hooks — screens and components never import this file.

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
const secondsAgo = (s) => new Date(Date.now() - s * 1000).toISOString();
const daysAgo = (d, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

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

export const MOCK_NOTIFICATIONS = Object.freeze([
  {
    id: 'notif_001',
    type: 'YOUR_TURN',
    title: 'Your Turn at Registrar!',
    message: 'Ticket R-015 has been called. Please proceed to Room 101 and scan the QR code within 1 minute.',
    is_read: false,
    created_at: new Date(Date.now() - 20000).toISOString(),
  },
  {
    id: 'notif_002',
    type: 'APPROACHING_TURN',
    title: 'Almost Your Turn (Cashier)',
    message: 'You are now 3rd in line for Cashier & Student Accounts. Please head towards Finance Hall.',
    is_read: false,
    created_at: minutesAgo(5),
  },
  {
    id: 'notif_003',
    type: 'QUEUE_CONFIRMED',
    title: 'Queue Joined',
    message: 'You joined the queue for Cashier & Student Accounts as Ticket C-048.',
    is_read: true,
    created_at: minutesAgo(30),
  },
]);

export const MOCK_OFFENSES = Object.freeze([
  {
    id: 'offense_001',
    user_id: 'usr_gst_002',
    ticket_id: 'tkt_hist_003',
    office_name: 'Cashier & Student Accounts',
    ticket_number: 'C-09-25-031',
    type: 'NO_SHOW',
    resulted_in_ban: false,
    revoked_at: null,
    created_at: '2026-09-25T11:47:00Z',
  },
]);


// ---------------------------------------------------------------------------
// Staff web (apps/staff) — the Registrar's live queue, offenses and activity log
// ---------------------------------------------------------------------------

// Full ticket number (R-08a): CODE-MM-DD-SEQ, dated `days` ago
const fullTicketNumber = (code, seq, days = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const pad = (n, width = 2) => String(n).padStart(width, '0');
  return `${code}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(seq, 3)}`;
};

// `id_number` is the student ID or Guest ID staff type into Verify by ID (WM02)
const HOLDERS = Object.freeze({
  nina: { user_id: 'usr_std_101', name: 'Nina dela Cruz', role: 'STUDENT', id_number: '2512269', program: 'Computer Science' },
  paolo: { user_id: 'usr_std_102', name: 'Paolo Garcia', role: 'STUDENT', id_number: '2410388', program: 'Accountancy' },
  maria: { user_id: 'usr_gst_002', name: 'Maria Santos', role: 'GUEST', id_number: 'G104728', guest_type: 'PARENT_GUARDIAN' },
  ramirez: { user_id: 'usr_std_103', name: 'J. Ramirez', role: 'STUDENT', id_number: '2320415', program: 'Civil Engineering' },
  bautista: { user_id: 'usr_std_104', name: 'A. Bautista', role: 'STUDENT', id_number: '2511902', program: 'Psychology' },
  lopez: { user_id: 'usr_std_105', name: 'K. Lopez', role: 'STUDENT', id_number: '2430117', program: 'Architecture' },
});

export const MOCK_STAFF_OFFENSES = Object.freeze([
  {
    id: 'offense_reg_001',
    holder: HOLDERS.nina,
    ticket_number: fullTicketNumber('R', 5, 2),
    type: 'NO_SHOW',
    resulted_in_ban: true,
    revoked_at: null,
    created_at: daysAgo(2, 10, 12),
  },
  {
    id: 'offense_reg_002',
    holder: HOLDERS.maria,
    ticket_number: fullTicketNumber('R', 12, 4),
    type: 'CANCELLED_AFTER_CALL',
    resulted_in_ban: false,
    revoked_at: daysAgo(3, 9, 0),
    created_at: daysAgo(4, 14, 40),
  },
  {
    id: 'offense_reg_003',
    holder: HOLDERS.ramirez,
    ticket_number: fullTicketNumber('R', 31, 8),
    type: 'CANCELLED_AFTER_CALL',
    resulted_in_ban: false,
    revoked_at: null,
    created_at: daysAgo(8, 15, 5),
  },
]);

// Newest first. `from`/`to` are TICKET_STATUS values; entries without them are queue-level actions.
export const MOCK_STAFF_ACTIVITY = Object.freeze([
  {
    id: 'log_006',
    action: 'CALLED',
    ticket_number: fullTicketNumber('R', 5),
    actor: 'N. Reyes',
    from: 'WAITING',
    to: 'CALLED',
    reason: null,
    note: null,
    created_at: secondsAgo(18),
  },
  {
    id: 'log_005',
    action: 'NO_SHOW',
    ticket_number: fullTicketNumber('R', 4),
    actor: 'N. Reyes',
    from: 'CALLED',
    to: 'NO_SHOW',
    reason: 'grace period lapsed',
    note: null,
    created_at: minutesAgo(4),
  },
  {
    id: 'log_004',
    action: 'CALLED',
    ticket_number: fullTicketNumber('R', 4),
    actor: 'N. Reyes',
    from: 'WAITING',
    to: 'CALLED',
    reason: null,
    note: null,
    created_at: minutesAgo(6),
  },
  {
    id: 'log_003',
    action: 'COMPLETED',
    ticket_number: fullTicketNumber('R', 3),
    actor: 'N. Reyes',
    from: 'IN_SERVICE',
    to: 'COMPLETED',
    reason: null,
    note: null,
    created_at: minutesAgo(9),
  },
  {
    id: 'log_002',
    action: 'SERVICE_STARTED',
    ticket_number: fullTicketNumber('R', 3),
    actor: 'System',
    from: 'CALLED',
    to: 'IN_SERVICE',
    reason: null,
    note: 'Verified by QR',
    created_at: minutesAgo(15),
  },
  {
    id: 'log_001',
    action: 'OVERRIDE',
    ticket_number: fullTicketNumber('R', 3),
    actor: 'N. Reyes',
    from: 'WAITING',
    to: 'CALLED',
    reason: 'called ahead of FIFO, priority case',
    note: null,
    created_at: minutesAgo(16),
  },
  {
    id: 'log_000',
    action: 'QUEUE_CLOSED',
    ticket_number: null,
    actor: 'N. Reyes',
    from: null,
    to: null,
    reason: null,
    note: 'End of day',
    created_at: daysAgo(1, 17, 0),
  },
]);

export const MOCK_STAFF_NOTIFICATIONS = Object.freeze([
  {
    id: 'staff_notif_001',
    type: 'GLOBAL_ANNOUNCEMENT',
    title: 'Scheduled maintenance',
    message: 'Sunday, 02:00–04:00. The queue will be unavailable.',
    created_at: minutesAgo(90),
  },
]);
