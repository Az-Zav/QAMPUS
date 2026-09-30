// Centralized Mock Data Store for QAMPUS (PRD v1.3)
// Read only through hooks in src/hooks — screens and components never import this file.

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
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

export const MOCK_OFFICES = Object.freeze([
  {
    id: 'off_reg_001',
    code: 'R',
    name: 'Office of the University Registrar',
    location: 'Administration Building, 1st Floor, Room 101',
    status: 'ACTIVE',
    default_service_minutes: 5,
    operating_hours: {
      day_of_week: 'MON',
      open_time: '08:00:00',
      close_time: '17:00:00',
    },
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
    name: 'Cashier & Student Accounts',
    location: 'Finance Hall, Ground Floor, Windows 1-4',
    status: 'ACTIVE',
    default_service_minutes: 3,
    operating_hours: {
      day_of_week: 'MON',
      open_time: '08:00:00',
      close_time: '16:30:00',
    },
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
    name: 'Admissions & Scholarships Office',
    location: 'Student Center, 2nd Floor, Room 204',
    status: 'ACTIVE',
    default_service_minutes: 7,
    operating_hours: {
      day_of_week: 'MON',
      open_time: '09:00:00',
      close_time: '16:00:00',
    },
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
    name: 'Guidance & Counseling Services',
    location: 'Student Well-being Center, 3rd Floor',
    status: 'ACTIVE',
    default_service_minutes: 15,
    operating_hours: {
      day_of_week: 'MON',
      open_time: '08:00:00',
      close_time: '17:00:00',
    },
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
