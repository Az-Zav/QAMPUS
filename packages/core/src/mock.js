// Centralized Mock Data Store for QAMPUS (PRD v1.3)
// Read only through hooks in each app's src/hooks — screens and components never import this file.

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
const secondsAgo = (s) => new Date(Date.now() - s * 1000).toISOString();
const minutesFromNow = (m) => new Date(Date.now() + m * 60000).toISOString();
const daysAgo = (d, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const MOCK_USER_STUDENT = Object.freeze({
  id: 'usr_std_001',
  role: 'STUDENT',
  name: 'Victor Jazz',
  email: 'victor.jazz@university.edu',
  institutional_id: '2140123',
  program: 'BS Computer Science',
  guest_type: null,
  device_token: null,
  push_token: 'ExponentPushToken[mock_token_123]',
  push_enabled: true,
  strike_count: 0,
  banned_until: null,
  created_at: '2026-09-01T08:00:00Z',
});

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

// Staff accounts. `office_id` is the office assignment granted by an administrator;
// a signed-in STAFF user without one lands on the Not Assigned screen (staff W02).
export const MOCK_USER_STAFF = Object.freeze({
  id: 'usr_stf_003',
  role: 'STAFF',
  name: 'N. Reyes',
  full_name: 'Nadia Reyes',
  email: 'n.reyes@university.edu',
  institutional_id: null,
  office_id: 'off_reg_001',
  created_at: '2026-08-15T08:00:00Z',
});

export const MOCK_USER_STAFF_UNASSIGNED = Object.freeze({
  ...MOCK_USER_STAFF,
  id: 'usr_stf_004',
  name: 'J. Lim',
  full_name: 'Jonas Lim',
  email: 'j.lim@university.edu',
  office_id: null,
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

export const MOCK_ACTIVE_TICKETS = Object.freeze([
  {
    id: 'tkt_act_001',
    queue_id: 'q_reg_001',
    office_id: 'off_reg_001',
    office_code: 'R',
    office_name: 'Office of the University Registrar',
    ticket_number: 'R-09-28-015',
    short_ticket_number: 'R-015',
    daily_sequence: 15,
    status: 'CALLED',
    joined_at: '2026-09-28T09:15:00Z',
    called_at: new Date(Date.now() - 20000).toISOString(), // called 20s ago (40s left on load)
    service_started_at: null,
    completed_at: null,
    cancelled_at: null,
    no_show_at: null,
    position_in_queue: 1,
    estimated_wait_minutes: 0,
    ahead_count: 0,
    counter_number: 'Window 2',
  },
  {
    id: 'tkt_act_002',
    queue_id: 'q_csh_002',
    office_id: 'off_csh_002',
    office_code: 'C',
    office_name: 'Cashier & Student Accounts',
    ticket_number: 'C-09-28-048',
    short_ticket_number: 'C-048',
    daily_sequence: 48,
    status: 'WAITING',
    joined_at: '2026-09-28T09:30:00Z',
    called_at: null,
    service_started_at: null,
    completed_at: null,
    cancelled_at: null,
    no_show_at: null,
    position_in_queue: 3,
    estimated_wait_minutes: 9,
    ahead_count: 2,
    counter_number: 'Window 1',
  },
]);

export const MOCK_HISTORY_TICKETS = Object.freeze([
  {
    id: 'tkt_hist_001',
    office_code: 'A',
    office_name: 'Admissions & Scholarships Office',
    ticket_number: 'A-09-27-022',
    short_ticket_number: 'A-022',
    daily_sequence: 22,
    status: 'COMPLETED',
    joined_at: daysAgo(0, 8, 0),
    called_at: daysAgo(0, 8, 25),
    service_started_at: daysAgo(0, 8, 26),
    completed_at: daysAgo(0, 8, 35),
    cancelled_at: null,
    no_show_at: null,
  },
  {
    id: 'tkt_hist_002',
    office_code: 'R',
    office_name: 'Office of the University Registrar',
    ticket_number: 'R-09-26-009',
    short_ticket_number: 'R-009',
    daily_sequence: 9,
    status: 'CANCELLED',
    cancelled_by: 'USER',
    joined_at: daysAgo(1, 14, 0),
    called_at: null,
    service_started_at: null,
    completed_at: null,
    cancelled_at: daysAgo(1, 14, 12),
    no_show_at: null,
  },
  {
    id: 'tkt_hist_003',
    office_code: 'C',
    office_name: 'Cashier & Student Accounts',
    ticket_number: 'C-09-25-031',
    short_ticket_number: 'C-031',
    daily_sequence: 31,
    status: 'NO_SHOW',
    joined_at: daysAgo(5, 11, 0),
    called_at: daysAgo(5, 11, 45),
    service_started_at: null,
    completed_at: null,
    cancelled_at: null,
    no_show_at: daysAgo(5, 11, 47),
  },
  {
    id: 'tkt_hist_004',
    office_code: 'G',
    office_name: 'Guidance & Counseling Services',
    ticket_number: 'G-09-22-004',
    short_ticket_number: 'G-004',
    daily_sequence: 4,
    status: 'CANCELLED',
    cancelled_by: 'OFFICE',
    joined_at: daysAgo(8, 9, 0),
    called_at: null,
    service_started_at: null,
    completed_at: null,
    cancelled_at: daysAgo(8, 9, 40),
    no_show_at: null,
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

const staffTicket = (seq, holder, fields) => ({
  id: `tkt_reg_${seq}`,
  office_id: 'off_reg_001',
  ticket_number: fullTicketNumber('R', seq),
  short_ticket_number: `R-${String(seq).padStart(3, '0')}`,
  daily_sequence: seq,
  holder,
  called_at: null,
  service_started_at: null,
  ...fields,
});

// `id_number` is the student ID or Guest ID staff type into Verify by ID (WM02)
const HOLDERS = Object.freeze({
  nina: { user_id: 'usr_std_101', name: 'Nina dela Cruz', role: 'STUDENT', id_number: '2512269', program: 'Computer Science' },
  paolo: { user_id: 'usr_std_102', name: 'Paolo Garcia', role: 'STUDENT', id_number: '2410388', program: 'Accountancy' },
  maria: { user_id: 'usr_gst_002', name: 'Maria Santos', role: 'GUEST', id_number: 'G104728', guest_type: 'PARENT_GUARDIAN' },
  ramirez: { user_id: 'usr_std_103', name: 'J. Ramirez', role: 'STUDENT', id_number: '2320415', program: 'Civil Engineering' },
  bautista: { user_id: 'usr_std_104', name: 'A. Bautista', role: 'STUDENT', id_number: '2511902', program: 'Psychology' },
  lopez: { user_id: 'usr_std_105', name: 'K. Lopez', role: 'STUDENT', id_number: '2430117', program: 'Architecture' },
});

export const MOCK_STAFF_QUEUE = Object.freeze({
  office_id: 'off_reg_001',
  status: 'OPEN',
  // Last moment the office can still serve one more person (R-19); the staff app warns ahead of it
  cutoff_at: minutesFromNow(18),
  cutoff_overridden: false,
  average_service_minutes: 6,
  // The ticket at the window: CALLED (grace countdown) or IN_SERVICE
  current: staffTicket(5, HOLDERS.nina, { status: 'CALLED', joined_at: minutesAgo(32), called_at: secondsAgo(18) }),
  // FIFO order
  waiting: [
    staffTicket(6, HOLDERS.paolo, { status: 'WAITING', joined_at: minutesAgo(27) }),
    staffTicket(7, HOLDERS.maria, { status: 'WAITING', joined_at: minutesAgo(23) }),
    staffTicket(8, HOLDERS.ramirez, { status: 'WAITING', joined_at: minutesAgo(20) }),
    staffTicket(9, HOLDERS.bautista, { status: 'WAITING', joined_at: minutesAgo(14) }),
  ],
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
