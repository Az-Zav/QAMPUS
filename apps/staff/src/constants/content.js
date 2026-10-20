// Staff web user-facing copy (Figma: QAMPUS Staff Web App).

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
  ctaLoading: 'Signing in…',
  footnote: 'Access is granted by office assignment. No access? Contact the system administrator.',
  error: "We couldn't sign you in. Check your connection and try again.",
});

export const NOT_ASSIGNED_COPY = Object.freeze({
  title: 'No office assigned',
  body: 'Your account is not assigned to an office yet. Ask the system administrator to assign you, then sign in again.',
  signOut: 'Sign out',
});

export const NAV_ITEMS = Object.freeze([
  { href: '/queue', label: 'Queue' },
  { href: '/offenses', label: 'Offenses' },
  { href: '/activity-log', label: 'Activity Log' },
]);
