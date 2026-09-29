// QAMPUS useJoinEligibility Hook
// Returns a checkJoin(office) function that performs client-side advisory eligibility checks.
// Check order (first failure wins): BANNED → TICKET_LIMIT → QUEUE_CLOSED → CAPACITY_REACHED.
// Rule R2: cross-provider logic lives in a composing hook, not inside a provider.

import { useCallback } from 'react';
import { ERROR_CODE, MAX_ACTIVE_TICKETS, QUEUE_STATUS } from '@/constants/domain';
import { useBans } from '@/providers/BansProvider';
import { useTickets } from '@/providers/TicketsProvider';
import { isBanned } from '@/utils/bans';
import { officeHours } from '@/utils/hours';

/**
 * @returns {{ checkJoin: (office: import('@/types').Office) => import('@/types').JoinEligibility }}
 */
export function useJoinEligibility() {
  const { ban, offenseCount } = useBans();
  const { active } = useTickets();

  const checkJoin = useCallback(
    (office) => {
      const now = new Date();

      // 1. BANNED — isBanned(ban, now). Message names the expiry and offenses behind it.
      if (isBanned(ban, now)) {
        const expiryFormatted = new Date(ban.expiresAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          allowed: false,
          code: ERROR_CODE.BANNED,
          message: `Your account is temporarily paused from joining queues until ${expiryFormatted}. This is due to ${offenseCount} recorded offense${offenseCount !== 1 ? 's' : ''}.`,
        };
      }

      // 2. TICKET_LIMIT — active.length >= MAX_ACTIVE_TICKETS
      if (active.length >= MAX_ACTIVE_TICKETS) {
        return {
          allowed: false,
          code: ERROR_CODE.TICKET_LIMIT,
          message: `You already have ${MAX_ACTIVE_TICKETS} active tickets. Please complete or leave one before joining another queue.`,
        };
      }

      // Check for existing active ticket at this specific office
      const existingTicket = active.find((t) => t.officeCode === office.code);
      if (existingTicket) {
        return {
          allowed: false,
          code: ERROR_CODE.TICKET_LIMIT,
          message: `You already have an active ticket for ${office.name}.`,
        };
      }

      // 3. QUEUE_CLOSED — office.queue.status === 'CLOSED'. Message says when it next opens.
      if (office.queue.status === QUEUE_STATUS.CLOSED) {
        const hoursData = officeHours(office, now);
        return {
          allowed: false,
          code: ERROR_CODE.QUEUE_CLOSED,
          message: `The queue for ${office.name} is currently closed.${hoursData.nextOpen ? ` Opens ${hoursData.nextOpen}.` : ''}`,
        };
      }

      // 4. CAPACITY_REACHED — skipped if cutoffOverridden.
      // Fails when remainingServiceSlots < waitingCount + 1
      if (!office.queue.cutoffOverridden) {
        const hoursData = officeHours(office, now);
        if (hoursData.isOpen) {
          const remainingSlots = Math.floor(
            hoursData.minutesUntilClose / (office.avgServiceMinutes || 5)
          );
          if (remainingSlots < office.queue.waitingCount + 1) {
            return {
              allowed: false,
              code: ERROR_CODE.CAPACITY_REACHED,
              message: `Queue capacity reached — ${office.name} ${hoursData.label}.${hoursData.nextOpen ? ` Opens ${hoursData.nextOpen}.` : ''}`,
            };
          }
        }
      }

      return { allowed: true };
    },
    [ban, offenseCount, active]
  );

  return { checkJoin };
}
