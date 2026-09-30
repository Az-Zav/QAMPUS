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
    namePlaceholder: 'Maria Santos',
    nameError: 'Enter your name.',
    emailLabel: 'Email',
    emailPlaceholder: 'maria.santos@email.com',
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
});
