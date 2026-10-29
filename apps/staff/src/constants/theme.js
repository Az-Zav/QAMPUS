// QAMPUS staff theme: tokens come from @qampus/ui; this file adds the staff web's extra font
// faces (Figma: QAMPUS Staff Web App) and the Badge/Status themes with their Lucide icons.

import { createThemes, withOpacity } from '@qampus/ui/tokens';
import { CircleCheck, CircleX, Clock, BellRing, Hourglass, UserRoundCheck, UserRoundX } from 'lucide-react-native';
import { TICKET_STATUS, TicketStatus } from '@qampus/core/domain';

// ---------------------------------------------------------------------------
// Staff font faces (loaded in app/_layout). DM Sans regular/medium/bold live in TYPOGRAPHY.
// ---------------------------------------------------------------------------

export const STAFF_FONT = Object.freeze({
  semibold: 'DMSans_600SemiBold',
  button: 'SpaceGrotesk_700Bold', // Button labels + brand wordmark
  mono: 'JetBrainsMono_500Medium', // ticket numbers in rows, IDs
  monoBold: 'JetBrainsMono_700Bold', // large ticket numbers, manual code, countdown
});

// ---------------------------------------------------------------------------
// Badge/Status — always icon + label, never colour alone (UIUX §3.4)
// ---------------------------------------------------------------------------

const buildStatusTheme = (c) => ({
  [TicketStatus.WAITING]: {
    bg: withOpacity(c.slate, 0.1),
    border: c.slate,
    text: c.slate,
    Icon: Clock,
    label: 'Waiting',
  },
  // Staff call it "Called"; the student sees "Your turn"
  [TicketStatus.YOUR_TURN]: { bg: c.gold, border: null, text: c.onGold, Icon: BellRing, label: 'Called' },
  [TicketStatus.EXPIRED]: {
    bg: withOpacity(c.error, 0.1),
    border: c.error,
    text: c.error,
    Icon: Hourglass,
    label: 'Expired',
  },
  [TicketStatus.IN_SERVICE]: { bg: c.success, border: null, text: c.onSuccess, Icon: UserRoundCheck, label: 'In service' },
  [TicketStatus.COMPLETED]: {
    bg: withOpacity(c.success, 0.1),
    border: null,
    text: c.success,
    Icon: CircleCheck,
    label: 'Completed',
  },
  [TicketStatus.CANCELLED]: {
    bg: withOpacity(c.slate, 0.1),
    border: null,
    text: c.slate,
    Icon: CircleX,
    label: 'Cancelled',
  },
  [TicketStatus.NO_SHOW]: {
    bg: withOpacity(c.error, 0.1),
    border: null,
    text: c.error,
    Icon: UserRoundX,
    label: 'No-show',
  },
});

// Stored TICKET_STATUS -> badge key, for log transitions (no grace-period context there)
export const STATUS_BADGE_FOR = Object.freeze({
  [TICKET_STATUS.WAITING]: TicketStatus.WAITING,
  [TICKET_STATUS.CALLED]: TicketStatus.YOUR_TURN,
  [TICKET_STATUS.IN_SERVICE]: TicketStatus.IN_SERVICE,
  [TICKET_STATUS.COMPLETED]: TicketStatus.COMPLETED,
  [TICKET_STATUS.CANCELLED]: TicketStatus.CANCELLED,
  [TICKET_STATUS.NO_SHOW]: TicketStatus.NO_SHOW,
});

export const THEMES = createThemes((colors) => ({
  status: buildStatusTheme(colors),
}));
