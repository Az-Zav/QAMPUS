// QAMPUS Tickets Service
// Manages active and historical queue tickets, joins, cancellations, and arrival verification.

import {
  ERROR_CODE,
  GRACE_PERIOD_SECONDS,
  MAX_ACTIVE_TICKETS,
  NOTIFICATION_TYPE,
  OFFENSE_TYPE,
  QUEUE_STATUS,
  TICKET_STATUS,
} from '@/constants/domain';
import { buildSeedData } from '@/data/mock';
import { isBanned } from '@/utils/bans';
import { officeHours } from '@/utils/hours';
import { shortNumber } from '@/utils/ticket';
import { authService } from './auth.service';
import { bansService } from './bans.service';
import { createStore } from './createStore';
import { notificationsService } from './notifications.service';
import { officesService } from './offices.service';

const initialSeeds = buildSeedData();

const store = createStore({
  tickets: initialSeeds.tickets,
});

export const ticketsService = {
  subscribe: store.subscribe,
  getState: store.getState,

  /**
   * Retrieves all tickets associated with a user ID.
   *
   * @param {string} userId
   * @returns {{ active: import('@/types').Ticket[], history: import('@/types').Ticket[] }}
   */
  getUserTickets: (userId) => {
    const userTickets = store.getState().tickets.filter((t) => t.userId === userId);

    const active = userTickets.filter(
      (t) =>
        t.status === TICKET_STATUS.WAITING ||
        t.status === TICKET_STATUS.CALLED ||
        t.status === TICKET_STATUS.IN_SERVICE
    );

    const history = userTickets.filter(
      (t) =>
        t.status === TICKET_STATUS.COMPLETED ||
        t.status === TICKET_STATUS.CANCELLED ||
        t.status === TICKET_STATUS.NO_SHOW
    );

    return { active, history };
  },

  /**
   * Enqueues the user into an office queue.
   * Enforces Part 2 check order: BANNED -> TICKET_LIMIT -> QUEUE_CLOSED -> CAPACITY_REACHED.
   *
   * @param {string} officeCode - The single-letter office code ('R', 'M', 'S')
   * @returns {Promise<import('@/types').ActionResult<import('@/types').Ticket>>}
   */
  joinQueue: async (officeCode) => {
    const user = authService.getCurrentUser();
    if (!user) {
      return {
        ok: false,
        code: ERROR_CODE.UNAUTHENTICATED,
        message: 'You must be signed in to join a queue.',
      };
    }

    const office = officesService.getOfficeByCode(officeCode);
    if (!office) {
      return {
        ok: false,
        code: ERROR_CODE.UNKNOWN,
        message: 'Selected office not found.',
      };
    }

    const now = new Date();

    // 1. Check BANNED
    const userBans = bansService.getUserBans(user.id);
    if (isBanned(userBans.ban, now)) {
      const expiryFormatted = new Date(userBans.ban.expiresAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        ok: false,
        code: ERROR_CODE.BANNED,
        message: `Your account is temporarily paused from joining queues until ${expiryFormatted} due to repeated infractions.`,
      };
    }

    // 2. Check TICKET_LIMIT
    const { active } = ticketsService.getUserTickets(user.id);
    if (active.length >= MAX_ACTIVE_TICKETS) {
      return {
        ok: false,
        code: ERROR_CODE.TICKET_LIMIT,
        message: `You already have ${MAX_ACTIVE_TICKETS} active tickets. Please complete or leave one before joining another.`,
      };
    }

    // Check duplicate active ticket for same office
    const duplicate = active.find((t) => t.officeCode === officeCode);
    if (duplicate) {
      return {
        ok: false,
        code: ERROR_CODE.TICKET_LIMIT,
        message: `You already hold active ticket ${shortNumber(officeCode, duplicate.dailySequence)} for this office.`,
      };
    }

    // 3. Check QUEUE_CLOSED
    if (office.queue.status === QUEUE_STATUS.CLOSED) {
      const hoursData = officeHours(office, now);
      return {
        ok: false,
        code: ERROR_CODE.QUEUE_CLOSED,
        message: `The queue for ${office.name} is currently closed. ${hoursData.nextOpen ? `Opens ${hoursData.nextOpen.toLowerCase()}.` : ''}`,
      };
    }

    // 4. Check CAPACITY_REACHED (Cutoff)
    if (!office.queue.cutoffOverridden) {
      const hoursData = officeHours(office, now);
      const remainingServiceSlots = Math.floor(
        hoursData.minutesUntilClose / (office.avgServiceMinutes || 5)
      );
      if (remainingServiceSlots < office.queue.waitingCount + 1) {
        return {
          ok: false,
          code: ERROR_CODE.CAPACITY_REACHED,
          message: `Queue capacity reached for today's operating hours. ${hoursData.label}. ${hoursData.nextOpen ? `Opens ${hoursData.nextOpen.toLowerCase()}.` : ''}`,
        };
      }
    }

    // Proceed to create ticket
    const nextSequence = (office.queue.nowServingSequence || 0) + office.queue.waitingCount + 1;
    const dateTag = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const fullNumber = `${office.code}-${dateTag}-${String(nextSequence).padStart(3, '0')}`;

    const newTicket = {
      id: `tkt_${Date.now().toString().slice(-6)}`,
      userId: user.id,
      officeId: office.id,
      officeCode: office.code,
      officeName: office.name,
      ticketNumber: fullNumber,
      dailySequence: nextSequence,
      status: TICKET_STATUS.WAITING,
      joinedAt: now.toISOString(),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      noShowAt: null,
      cancelledBy: null,
      counterNumber: null,
      positionInQueue: office.queue.waitingCount + 1,
      aheadCount: office.queue.waitingCount,
      estimatedWaitMinutes: (office.queue.waitingCount + 1) * office.avgServiceMinutes,
    };

    // Update office queue
    officesService.updateQueue(officeCode, {
      waitingCount: office.queue.waitingCount + 1,
      estimatedWaitMinutes: (office.queue.waitingCount + 1) * office.avgServiceMinutes,
    });

    // Save ticket
    store.setState({
      tickets: [newTicket, ...store.getState().tickets],
    });

    // Dispatch confirmation notification
    notificationsService.dispatchSystemNotification({
      userId: user.id,
      type: NOTIFICATION_TYPE.QUEUE_CONFIRMED,
      title: 'Queue Confirmed',
      message: `You joined ${office.name}. Ticket ${shortNumber(office.code, nextSequence)}, ${newTicket.aheadCount} people ahead.`,
    });

    return { ok: true, data: newTicket };
  },

  /**
   * Cancels an active ticket.
   * Cancelling a CALLED ticket incurs an infraction.
   *
   * @param {string} ticketId
   * @returns {Promise<import('@/types').ActionResult<import('@/types').Ticket>>}
   */
  cancelTicket: async (ticketId) => {
    const list = store.getState().tickets;
    const target = list.find((t) => t.id === ticketId);
    if (!target) {
      return { ok: false, code: 'NOT_FOUND', message: 'Ticket not found.' };
    }

    const now = new Date();
    const wasCalled = target.status === TICKET_STATUS.CALLED;

    const updated = {
      ...target,
      status: TICKET_STATUS.CANCELLED,
      cancelledBy: 'USER',
      cancelledAt: now.toISOString(),
      positionInQueue: null,
      aheadCount: null,
      estimatedWaitMinutes: null,
    };

    store.setState({
      tickets: list.map((t) => (t.id === ticketId ? updated : t)),
    });

    // Office queue decrement
    const office = officesService.getOfficeByCode(target.officeCode);
    if (office && target.status === TICKET_STATUS.WAITING) {
      const newWait = Math.max(0, office.queue.waitingCount - 1);
      officesService.updateQueue(target.officeCode, {
        waitingCount: newWait,
        estimatedWaitMinutes: newWait * office.avgServiceMinutes,
      });
    }

    // Rule: Cancelling after being called is recorded as an offense
    if (wasCalled) {
      bansService.recordOffense({
        userId: target.userId,
        ticketId: target.id,
        officeName: target.officeName,
        ticketNumber: target.ticketNumber,
        type: OFFENSE_TYPE.CANCELLED_AFTER_CALL,
      });
    }

    return { ok: true, data: updated };
  },

  /**
   * Verifies arrival at the service desk via QR scan or typed office code.
   *
   * @param {string} officeCode - The scanned or typed office code
   * @returns {Promise<import('@/types').ActionResult<import('@/types').Ticket>>}
   */
  verifyArrival: async (officeCode) => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { ok: false, code: ERROR_CODE.UNAUTHENTICATED, message: 'No active session.' };
    }

    const { active } = ticketsService.getUserTickets(user.id);
    const calledTicket = active.find((t) => t.status === TICKET_STATUS.CALLED);

    // 1. Check NO_CALLED_TICKET
    if (!calledTicket) {
      return {
        ok: false,
        code: ERROR_CODE.NO_CALLED_TICKET,
        message: 'You have no ticket currently called. Please wait until your number is called.',
      };
    }

    // 2. Check WRONG_OFFICE
    if (calledTicket.officeCode !== officeCode) {
      return {
        ok: false,
        code: ERROR_CODE.WRONG_OFFICE,
        message: `This station is for ${officeCode}, but your ticket ${shortNumber(calledTicket.officeCode, calledTicket.dailySequence)} is for ${calledTicket.officeName}.`,
      };
    }

    // 3. Check EXPIRED
    const now = new Date();
    const calledTime = new Date(calledTicket.calledAt).getTime();
    const secondsElapsed = Math.floor((now.getTime() - calledTime) / 1000);

    if (secondsElapsed >= GRACE_PERIOD_SECONDS) {
      return {
        ok: false,
        code: ERROR_CODE.EXPIRED,
        message: 'Your turn has expired. Please see the desk staff for assistance.',
      };
    }

    // Success: advance to IN_SERVICE
    const updated = {
      ...calledTicket,
      status: TICKET_STATUS.IN_SERVICE,
      serviceStartedAt: now.toISOString(),
      counterNumber: calledTicket.counterNumber || 1,
    };

    store.setState({
      tickets: store.getState().tickets.map((t) => (t.id === calledTicket.id ? updated : t)),
    });

    return { ok: true, data: updated };
  },

  // -------------------------------------------------------------------------
  // Staff Simulation Methods (Playground triggers)
  // -------------------------------------------------------------------------

  /**
   * Simulates desk staff calling the next ticket in line.
   *
   * @param {string} officeCode
   * @param {number} [counterNumber=1]
   */
  simulateCallNext: (officeCode, counterNumber = 1) => {
    const waitingTickets = store
      .getState()
      .tickets.filter((t) => t.officeCode === officeCode && t.status === TICKET_STATUS.WAITING)
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    if (!waitingTickets.length) return null;

    const nextTicket = waitingTickets[0];
    const now = new Date();

    const updated = {
      ...nextTicket,
      status: TICKET_STATUS.CALLED,
      calledAt: now.toISOString(),
      counterNumber,
      positionInQueue: null,
      aheadCount: 0,
      estimatedWaitMinutes: null,
    };

    store.setState({
      tickets: store.getState().tickets.map((t) => (t.id === nextTicket.id ? updated : t)),
    });

    notificationsService.dispatchSystemNotification({
      userId: nextTicket.userId,
      type: NOTIFICATION_TYPE.YOUR_TURN,
      title: `Your Turn at Window ${counterNumber}!`,
      message: `Ticket ${shortNumber(officeCode, nextTicket.dailySequence)} called at ${nextTicket.officeName}. Verify arrival within 60s.`,
    });

    return updated;
  },

  /**
   * Simulates staff completing transaction.
   *
   * @param {string} ticketId
   */
  simulateComplete: (ticketId) => {
    const list = store.getState().tickets;
    const target = list.find((t) => t.id === ticketId);
    if (!target) return null;

    const now = new Date();
    const updated = {
      ...target,
      status: TICKET_STATUS.COMPLETED,
      completedAt: now.toISOString(),
    };

    store.setState({
      tickets: list.map((t) => (t.id === ticketId ? updated : t)),
    });

    notificationsService.dispatchSystemNotification({
      userId: target.userId,
      type: NOTIFICATION_TYPE.SERVICE_COMPLETED,
      title: 'Service Completed',
      message: `Your transaction for ticket ${shortNumber(target.officeCode, target.dailySequence)} has ended.`,
    });

    return updated;
  },

  /**
   * Simulates staff marking a ticket NO_SHOW.
   *
   * @param {string} ticketId
   */
  simulateNoShow: (ticketId) => {
    const list = store.getState().tickets;
    const target = list.find((t) => t.id === ticketId);
    if (!target) return null;

    const now = new Date();
    const updated = {
      ...target,
      status: TICKET_STATUS.NO_SHOW,
      noShowAt: now.toISOString(),
    };

    store.setState({
      tickets: list.map((t) => (t.id === ticketId ? updated : t)),
    });

    // Record offense
    bansService.recordOffense({
      userId: target.userId,
      ticketId: target.id,
      officeName: target.officeName,
      ticketNumber: target.ticketNumber,
      type: OFFENSE_TYPE.NO_SHOW,
    });

    return updated;
  },
};
