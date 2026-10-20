// QAMPUS User-Facing Content
// Copy keyed by domain concepts. Components read it; they never hardcode it.
// Tones ('error' | 'success' | 'neutral') are mapped to colors by the component.

import { RULES, TicketStatus } from './domain';
import { EmptyStateType } from './theme';

// ---------------------------------------------------------------------------
// 1. Offenses & Bans (R-10 – R-14, R-26)
// ---------------------------------------------------------------------------

export const OFFENSE_POLICY = Object.freeze([
  {
    icon: 'close-circle-outline',
    tone: 'error',
    text: "Missing your turn, or cancelling after you've been called, counts as an offense.",
  },
  {
    icon: 'ticket-outline',
    tone: 'success',
    text: "Leaving a queue before you're called is always free and never counted.",
  },
  {
    icon: 'ban-outline',
    tone: 'neutral',
    text: `${RULES.OFFENSES_PER_BAN} offenses pause joining for ${RULES.BAN_HOURS} hours. Browsing, your tickets and your history stay open.`,
  },
]);

export const STRIKE_COPY = Object.freeze({
  clean: {
    title: 'Clean record',
    body: 'No offenses on your record.',
  },
  warning: {
    title: '1 offense on record',
    body: `One more offense will pause your ability to join queues for ${RULES.BAN_HOURS} hours.`,
  },
});

export const BAN_COPY = Object.freeze({
  body: 'You can still browse offices, your tickets and your history.',
  causesLabel: 'WHAT CAUSED THIS',
});

// ---------------------------------------------------------------------------
// 2. Ticket Stub (Home active tickets)
// ---------------------------------------------------------------------------

export const TICKET_STUB_COPY = Object.freeze({
  [TicketStatus.WAITING]: { topLabel: 'NEXT UP' },
  [TicketStatus.EXPIRED]: { topLabel: 'WAITING FOR STAFF' },
});

// ---------------------------------------------------------------------------
// 3. Help & Support FAQ (S17)
// ---------------------------------------------------------------------------

export const FAQ_ITEMS = Object.freeze([
  {
    id: 'offense',
    question: 'What counts as an offense?',
    answer:
      "Cancelling a ticket after you've been called, or being marked a no-show because you didn't check in within 1 minute.",
  },
  {
    id: 'ban',
    question: 'How long does a ban last?',
    answer: `${RULES.OFFENSES_PER_BAN} offenses pause joining for ${RULES.BAN_HOURS} hours. You can still browse and see your tickets and history.`,
  },
  {
    id: 'cancel',
    question: 'Can I leave a queue for free?',
    answer: "Yes. Cancelling while you're still waiting is always free and never counts as an offense.",
  },
  {
    id: 'camera',
    question: "What if my camera doesn't work?",
    answer: 'Enter the code shown at the office manually. If your phone is dead, staff can check you in with your ID number.',
  },
  {
    id: 'guest-id',
    question: 'What is a guest ID?',
    answer: 'A code like G104728 made for guests. Staff use it to find you, the same way they use a student ID.',
  },
]);

// ---------------------------------------------------------------------------
// 4. Empty States
// ---------------------------------------------------------------------------

export const EMPTY_STATE_COPY = Object.freeze({
  [EmptyStateType.NO_TICKETS]: {
    title: 'No active tickets',
    body: 'Join a queue and your ticket will appear here.',
    actionLabel: 'Join a Queue',
  },
  [EmptyStateType.NO_HISTORY]: {
    title: 'No past queues yet',
    body: 'Finished tickets will show up here.',
  },
  [EmptyStateType.NO_NOTIFICATIONS]: {
    title: 'Nothing yet',
    body: 'Queue updates will appear here.',
  },
  [EmptyStateType.CLEAN_RECORD]: {
    title: 'Clean record',
    body: 'All offenses will appear here.',
  },
  [EmptyStateType.NO_RESULTS]: {
    title: 'No offices found',
    body: 'Try a different office or service name.',
  },
  [EmptyStateType.OFFLINE]: {
    title: 'Temporarily unavailable',
    body: 'Please wait — this clears on its own.',
  },
});

// ---------------------------------------------------------------------------
// 5. Onboarding (S01–S03)
// ---------------------------------------------------------------------------

export const ONBOARDING_SLIDES = Object.freeze([
  { id: 'join', title: 'Join queues remotely', body: 'Skip physical lines — join from anywhere on campus.' },
  { id: 'notify', title: 'Get notified when it’s your turn', body: 'Real-time alerts so you never miss your call.' },
  { id: 'start', title: 'Skip the line.\nNot the service.', body: 'Get started and reclaim your time.' },
]);

export const ONBOARDING_COPY = Object.freeze({
  skip: 'Skip',
  next: 'Next',
  getStarted: 'Get Started',
});

// ---------------------------------------------------------------------------
// 6. Profile Completion (S05 student, S06 guest)
// ---------------------------------------------------------------------------

export const PROFILE_COPY = Object.freeze({
  continue: 'Continue',
  student: {
    title: 'Complete your profile',
    intro: 'Staff use these to find you when the QR path doesn’t work.',
    studentIdLabel: 'Student ID',
    studentIdPlaceholder: '2512269',
    studentIdHelper: 'Exactly 7 digits.',
    studentIdError: 'Enter exactly 7 digits.',
    programLabel: 'Program',
    programPlaceholder: 'Select your program',
    programError: 'Choose your program.',
  },
  guest: {
    title: 'Tell us who you are',
    intro: 'Staff need a name to call and a way to look you up. Nothing here is verified.',
    nameLabel: 'Full name',
    namePlaceholder: 'FirstName LastName',
    nameError: 'Enter your name.',
    emailLabel: 'Email (Optional)',
    emailPlaceholder: 'example@email.com',
    emailHelper: 'Optional.',
    emailError: 'Enter a valid email or leave it blank.',
    guestTypeLabel: 'Guest type',
    guestTypePlaceholder: 'Select guest type',
    guestTypeError: 'Choose a guest type.',
  },
  guestIssued: {
    title: 'You’re all set',
    body: 'This is your Guest ID. Staff use it to look you up if your phone can’t scan the code. You can find it any time in your profile.',
  },
  // S13 Profile screen
  studentIdLabel: 'Student ID',
  guestIdLabel: 'Guest ID',
  logOut: 'Log out',
});

// ---------------------------------------------------------------------------
// 7. Notifications & Profile (S12 – S17, M09)
// ---------------------------------------------------------------------------

export const PROFILE_MENU = Object.freeze([
  { id: 'history', title: 'Queue History', icon: 'receipt-outline', href: '/queue' },
  { id: 'bans', title: 'Bans & Warnings', icon: 'hammer-outline', href: '/bans' },
  { id: 'settings', title: 'Settings', icon: 'settings-outline', href: '/settings' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', href: '/help' },
]);

// Placeholder until the program list source is decided (PRD open question, UI Build Guide §4.2)
export const PROGRAM_OPTIONS = Object.freeze([
  'Computer Science',
  'Information Technology',
  'Data Science and Analytics',
]);

export const EDIT_PROFILE_COPY = Object.freeze({
  title: 'Edit Profile',
  accountLabel: 'ACCOUNT',
  detailsLabel: 'DETAILS',
  studentIdLabel: 'Student ID',
  studentIdHint: 'Only an administrator can change your student ID.',
  guestIdLabel: 'Guest ID',
  guestIdHint: 'Generated for you. Staff use it to look you up.',
  programLabel: 'Program',
  programPlaceholder: 'Search programs',
  nameLabel: 'Full name',
  namePlaceholder: 'Your full name',
  emailLabel: 'Email (optional)',
  emailPlaceholder: 'name@example.com',
  guestTypeLabel: 'I am a…',
  guestTypePlaceholder: 'Select one',
  save: 'Save changes',
  saving: 'Saving…',
  errors: {
    programRequired: 'Choose your program.',
    nameRequired: 'Enter your name.',
    emailInvalid: 'Enter a valid email address.',
    guestTypeRequired: 'Choose what describes you.',
    saveFailed: 'Couldn’t save your changes. Try again.',
  },
});

export const BANS_COPY = Object.freeze({
  bannedUntil: (time) => `Joining paused until ${time}`,
  historyLabel: 'OFFENSE HISTORY',
  policyLink: 'Learn about queue policy',
});

export const OFFENSE_LABEL = Object.freeze({
  NO_SHOW: 'No-show',
  CANCELLED_AFTER_CALL: 'Cancelled after being called',
});

export const SETTINGS_COPY = Object.freeze({
  generalLabel: 'GENERAL',
  appearanceLabel: 'APPEARANCE',
  push: { title: 'Push notifications', subtitle: 'In-app notifications always persist. Push is used for your turn.' },
  biometric: { title: 'Biometric login', subtitle: 'Not available in this version.' },
});

export const HELP_COPY = Object.freeze({
  faqTitle: 'Frequently Asked Questions',
  faqCount: (n) => `${n} articles`,
  contactTitle: 'Still need help?',
  contactBody: 'Our campus services team is on standby during administrative office hours (8:00 AM – 5:00 PM).',
  contactLabel: 'Contact Support',
});

export const NOTIFICATIONS_COPY = Object.freeze({
  newCount: (n) => `${n} new notification${n === 1 ? '' : 's'}`,
  recent: 'Recent',
  previous: 'Previous',
});

// ---------------------------------------------------------------------------
// 8. Modals (M01 – M09)
// ---------------------------------------------------------------------------

const aboutMinutes = (min) => `about ${min} min`;

export const MODAL_COPY = Object.freeze({
  logOut: {
    icon: 'log-out-outline',
    title: 'Log out?',
    body: "You'll need to sign in again to see your tickets and history.",
    confirmLabel: 'Log out',
    cancelLabel: 'Stay signed in',
  },
  joinConfirm: {
    icon: 'ticket-outline',
    title: 'Join this queue?',
    waitLabel: 'Estimated wait',
    waitValue: aboutMinutes,
    waitingLabel: 'People waiting',
    confirmLabel: 'Confirm join',
    cancelLabel: 'Cancel',
  },
  joined: {
    icon: 'checkmark-circle-outline',
    title: "You're in the queue",
    body: (code) => `Your ${code} queue ticket has been issued. Check Home for your position and updates.`,
    buttonLabel: 'Done',
  },
  called: {
    icon: 'notifications',
    title: "It's your turn",
    body: (officeName) => `Head to ${officeName} and scan the code before time runs out.`,
    scanLabel: 'Open scanner',
  },
  ticket: {
    positionLabel: 'Position',
    positionValue: (position) => `${position} in line`,
    aheadLabel: 'People ahead',
    nowServingLabel: 'Now serving',
    waitLabel: 'Estimated wait',
    waitValue: aboutMinutes,
    scanLabel: 'Open scanner',
    cancelLabel: 'Cancel ticket',
    expiredWarning: 'Your time to check in has passed. Staff will update your ticket.',
  },
});
