
import { OFFENSE_TYPE, RULES } from '@qampus/core/domain';

const VALID_OFFENSES = new Set(Object.values(OFFENSE_TYPE));

const getTimestamp = (value) => {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

/**
 * Calculate the current penalty state for one user.
 *
 * Every two non-revoked offenses form a penalty cycle.
 * The second offense triggers a flat 24-hour ban.
 * The strike count then resets to zero.
 *
 * A display-only summary of the offenses this office can see. The strike and ban that actually count are
 * stored on the student's profile and written with each offense, so a student with offenses at another
 * office can differ from this view.
 */
export function getPenaltyState(
  offenses = [],
  userId,
  now = Date.now(),
) {
  const currentTime = getTimestamp(now);

  const relevant = offenses
    .filter(
      (offense) =>
        offense.holder?.user_id === userId &&
        !offense.revoked_at &&
        VALID_OFFENSES.has(offense.type),
    )
    .sort((a, b) => {
      const difference =
        getTimestamp(a.created_at) -
        getTimestamp(b.created_at);

      return difference || String(a.id).localeCompare(String(b.id));
    });

  const triggerOffenseIds = [];
  let strikes = 0;
  let latestBanUntil = null;
  let latestBanOffenseIds = [];

  for (let index = 0; index < relevant.length; index++) {
    strikes += 1;

    if (strikes === RULES.OFFENSES_PER_BAN) {
      const triggering = relevant[index];
      const previous = relevant[index - 1];

      const banUntil = new Date(
        getTimestamp(triggering.created_at) +
          RULES.BAN_HOURS * 60 * 60 * 1000,
      ).toISOString();

      triggerOffenseIds.push(triggering.id);

      latestBanUntil = banUntil;
      latestBanOffenseIds = [previous.id, triggering.id];

      // R-13: Reset strikes after the second offense.
      strikes = 0;
    }
  }

  const isBanned =
    latestBanUntil !== null &&
    getTimestamp(latestBanUntil) > currentTime;

  return {
    userId,
    strikeCount: strikes,
    activeOffenseCount: relevant.length,
    isBanned,
    bannedUntil: isBanned ? latestBanUntil : null,
    lastBanEndedAt: latestBanUntil,
    banOffenseIds: isBanned ? latestBanOffenseIds : [],
    triggerOffenseIds,
  };
}

/**
 * Calculates summary information for an office's
 * offense records.
 */
export function getPenaltySummary(
  offenses = [],
  now = Date.now(),
) {
  const userIds = [
    ...new Set(
      offenses
        .map((offense) => offense.holder?.user_id)
        .filter(Boolean),
    ),
  ];

  const states = userIds.map((userId) =>
    getPenaltyState(offenses, userId, now),
  );

  return {
    totalOffenses: offenses.length,
    activeOffenses: offenses.filter((o) => !o.revoked_at).length,
    revokedOffenses: offenses.filter((o) => !!o.revoked_at).length,
    bannedUsers: states.filter((state) => state.isBanned).length,
    states,
  };
}
